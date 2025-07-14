/**
 * Vercel Serverless Function for WeChat Official Account
 * Version 3.2 - Final version, rewritten based on a proven working project.
 * Uses professional libraries 'xml2js' and 'axios' for robust parsing and fetching.
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
// 2. Token 将在 Vercel 平台的环境变量中配置
// ===================================================================================
const WECHAT_TOKEN = process.env.WECHAT_TOKEN;

// 引入所需模块
const crypto = require('crypto');
const axios = require('axios');
const xml2js = require('xml2js');

// 主处理函数
module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      await handleWeChatVerification(req, res);
    } else if (req.method === 'POST') {
      await handleUserMessage(req, res);
    } else {
      res.status(200).send('This is a Vercel Serverless Function for WeChat.');
    }
  } catch (error) {
    console.error("FATAL ERROR in main handler:", error);
    res.status(200).send(''); // 出现致命错误时，返回空响应避免微信重试
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
        let replyXml = '';
        let fromUserName, toUserName;
        try {
            // 使用 xml2js 解析微信发来的消息
            const parsedResult = await xml2js.parseStringPromise(requestBody, { explicitArray: false });
            const message = parsedResult.xml;

            toUserName = message.ToUserName;
            fromUserName = message.FromUserName;
            const msgType = message.MsgType;
            const content = message.Content;
            
            if (msgType === 'text' && content) {
                const feedUrl = RANK_RSS_FEEDS[content.trim()];
            
                if (content.trim().toLowerCase() === '帮助' || content.trim().toLowerCase() === 'help') {
                    const helpText = `欢迎使用 App Store 榜单查询助手！\n\n请输入以下关键词查询榜单：\n- ${Object.keys(RANK_RSS_FEEDS).filter(k => k !== '帮助').join('\n- ')}\n\n榜单数据来自苹果官方。`;
                    replyXml = generateTextReply(fromUserName, toUserName, helpText);
                } else if (feedUrl) {
                    const articles = await fetchAndParseRss(feedUrl);
                    if (!articles || articles.length === 0) throw new Error("从苹果获取的榜单为空或解析失败。");
                    replyXml = generateNewsReply(fromUserName, toUserName, articles);
                } else {
                    const defaultReply = `抱歉，没有找到与“${content}”相关的榜单。\n\n您可以输入“帮助”查看所有支持的关键词。`;
                    replyXml = generateTextReply(fromUserName, toUserName, defaultReply);
                }
            }
            
            res.setHeader('Content-Type', 'application/xml');
            res.status(200).send(replyXml || '');

        } catch (error) {
            console.error("ERROR in handleUserMessage:", error);
            // [错误上报] 将错误信息直接回复给用户
            const errorMessage = `抱歉，程序出错了！\n\n[调试信息]\n${error.message}`;
            replyXml = generateTextReply(fromUserName, toUserName, errorMessage);
            res.setHeader('Content-Type', 'application/xml');
            res.status(200).send(replyXml);
        }
    });
};

/**
 * 从 RSS feed 获取并解析文章列表
 */
const fetchAndParseRss = async (url) => {
  const response = await axios.get(url);
  const xmlText = response.data;
  
  // 使用 xml2js 解析 RSS feed
  const parsedResult = await xml2js.parseStringPromise(xmlText, { explicitArray: false });
  const entries = parsedResult.feed.entry;

  if (!entries || entries.length === 0) return [];

  const articles = entries.slice(0, 8).map(entry => {
    const title = entry.title;
    const link = entry.id;
    
    // 苹果的RSS中，im:image是一个数组，需要找到分辨率最高的那个
    const images = entry['im:image'];
    const picUrl = Array.isArray(images) 
        ? images.reduce((max, img) => parseInt(img.$.height) > parseInt(max.$.height) ? img : max).label
        : images.label;

    const description = entry.summary ? entry.summary.label : '暂无摘要';

    return { title, description, url: link, picUrl };
  }).filter(article => article.title && article.url && article.picUrl);

  return articles;
};

// ===================================================================================
// XML 辅助函数
// ===================================================================================
function generateTextReply(toUser, fromUser, content) {
  if (!toUser || !fromUser) return '';
  const builder = new xml2js.Builder({ rootName: 'xml', cdata: true, headless: true });
  return builder.buildObject({
    ToUserName: toUser,
    FromUserName: fromUser,
    CreateTime: Math.floor(Date.now() / 1000),
    MsgType: 'text',
    Content: content,
  });
}

function generateNewsReply(toUser, fromUser, articles) {
  if (!toUser || !fromUser) return '';
  const builder = new xml2js.Builder({ rootName: 'xml', cdata: true, headless: true });
  return builder.buildObject({
    ToUserName: toUser,
    FromUserName: fromUser,
    CreateTime: Math.floor(Date.now() / 1000),
    MsgType: 'news',
    ArticleCount: articles.length,
    Articles: { item: articles },
  });
}
