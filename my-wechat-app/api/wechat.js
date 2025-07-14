/**
 * Vercel Serverless Function for WeChat Official Account
 * Fetches App Store rankings and replies to users.
 * Version 3.0 - Final, functional version for Vercel.
 */

// ===================================================================================
// 1. 在这里配置您的 RSS 链接 (从苹果官方工具生成)
// ===================================================================================
const RANK_RSS_FEEDS = {
  "美国免费榜": "https://rss.itunes.apple.com/api/v2/us/apps/top-free/10/apps.rss",
  "美国付费榜": "https://rss.itunes.apple.com/api/v2/us/apps/top-paid/10/apps.rss",
  "日本免费榜": "https://rss.itunes.apple.com/api/v2/jp/apps/top-free/10/apps.rss",
  "帮助": "show_help", // 特殊关键词
};

// ===================================================================================
// 2. 注意：Token 将在 Vercel 平台进行配置，而不是写在这里
// ===================================================================================
const WECHAT_TOKEN = process.env.WECHAT_TOKEN;

// 引入Node.js内置的加密模块
const crypto = require('crypto');

// 主处理函数
module.exports = async (req, res) => {
  if (req.method === 'GET') {
    // 处理微信服务器的验证请求
    handleWeChatVerification(req, res);
  } else if (req.method === 'POST') {
    // 处理用户发送的消息
    await handleUserMessage(req, res);
  } else {
    res.status(200).send('This is a Vercel Serverless Function for WeChat.');
  }
};

/**
 * 处理微信服务器的验证请求
 */
const handleWeChatVerification = (req, res) => {
  const { signature, timestamp, nonce, echostr } = req.query;

  if (!signature || !timestamp || !nonce || !echostr) {
    return res.status(400).send('Missing required query parameters.');
  }

  const array = [WECHAT_TOKEN, timestamp, nonce].sort();
  const str = array.join('');
  const hash = crypto.createHash('sha1').update(str).digest('hex');

  if (hash === signature) {
    res.status(200).send(echostr);
  } else {
    res.status(401).send('Verification failed');
  }
};

/**
 * 处理用户发送的消息
 */
const handleUserMessage = async (req, res) => {
    let requestBody = '';
    req.on('data', chunk => {
        requestBody += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const toUserName = getXmlValueWithRegex(requestBody, 'ToUserName');
            const fromUserName = getXmlValueWithRegex(requestBody, 'FromUserName');
            const msgType = getXmlValueWithRegex(requestBody, 'MsgType');
            const content = getXmlValueWithRegex(requestBody, 'Content');
            
            let replyXml = '';

            if (msgType === 'text' && content) {
                const feedUrl = RANK_RSS_FEEDS[content.trim()];
            
                if (content.trim().toLowerCase() === '帮助' || content.trim().toLowerCase() === 'help') {
                    const helpText = `欢迎使用 App Store 榜单查询助手！\n\n请输入以下关键词查询榜单：\n- ${Object.keys(RANK_RSS_FEEDS).filter(k => k !== '帮助').join('\n- ')}\n\n榜单数据来自苹果官方。`;
                    replyXml = generateTextReply(fromUserName, toUserName, helpText);
                } else if (feedUrl) {
                    const articles = await fetchAndParseRss(feedUrl);
                    if (articles.length === 0) throw new Error("从苹果获取的榜单为空。");
                    replyXml = generateNewsReply(fromUserName, toUserName, articles);
                } else {
                    const defaultReply = `抱歉，没有找到与“${content}”相关的榜单。\n\n您可以输入“帮助”查看所有支持的关键词。`;
                    replyXml = generateTextReply(fromUserName, toUserName, defaultReply);
                }
            }
            
            res.setHeader('Content-Type', 'application/xml');
            res.status(200).send(replyXml);

        } catch (error) {
            console.error(error);
            // 如果出错，也返回一个空响应，避免微信重试
            res.status(200).send('');
        }
    });
};

/**
 * 从 RSS feed 获取并解析文章列表
 */
const fetchAndParseRss = async (url) => {
  // Vercel环境需要使用node-fetch
  const fetch = (await import('node-fetch')).default;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
  }
  const xmlText = await response.text();
  
  const items = xmlText.split('<entry>').slice(1);
  const articles = items.slice(0, 8).map(itemXml => {
    const title = getXmlValueWithRegex(itemXml, 'title');
    const link = getXmlValueWithRegex(itemXml, 'id').replace('http://', 'https://');
    
    const images = itemXml.match(/<im:image height="\d+">[\s\S]*?<\/im:image>/g) || [];
    const imageUrl = images.reduce((maxUrl, currentImg) => {
        const currentHeight = parseInt((currentImg.match(/height="(\d+)"/) || [0,0])[1], 10);
        const maxHeight = parseInt((maxUrl.match(/height="(\d+)"/) || [0,0])[1], 10) || 0;
        return currentHeight > maxHeight ? currentImg : maxUrl;
    }, '');
    const picUrl = getXmlValueWithRegex(imageUrl, 'im:image');

    const description = getXmlValueWithRegex(itemXml, 'summary') || '暂无摘要';

    return { title, description, url: link, picUrl };
  }).filter(article => article.title && article.url && article.picUrl);

  return articles;
};

// ===================================================================================
// XML 辅助函数
// ===================================================================================
function getXmlValueWithRegex(xml, tag) {
    const regex = new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?</${tag}>`);
    const match = xml.match(regex);
    return match ? match[1] : '';
}

function generateTextReply(toUser, fromUser, content) {
  if (!toUser || !fromUser) return '';
  const time = Math.floor(Date.now() / 1000);
  return `<xml><ToUserName><![CDATA[${toUser}]]></ToUserName><FromUserName><![CDATA[${fromUser}]]></FromUserName><CreateTime>${time}</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[${content}]]></Content></xml>`;
}

function generateNewsReply(toUser, fromUser, articles) {
  if (!toUser || !fromUser) return '';
  const time = Math.floor(Date.now() / 1000);
  const articlesXml = articles.map(article => `<item><Title><![CDATA[${article.title}]]></Title><Description><![CDATA[${article.description}]]></Description><PicUrl><![CDATA[${article.picUrl}]]></PicUrl><Url><![CDATA[${article.url}]]></Url></item>`).join('');
  return `<xml><ToUserName><![CDATA[${toUser}]]></ToUserName><FromUserName><![CDATA[${fromUser}]]></FromUserName><CreateTime>${time}</CreateTime><MsgType><![CDATA[news]]></MsgType><ArticleCount>${articles.length}</ArticleCount><Articles>${articlesXml}</Articles></xml>`;
}
