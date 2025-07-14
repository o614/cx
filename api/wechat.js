/**
 * Vercel Serverless Function for WeChat Official Account
 * Version 3.6 - All-in-one reply with names, links, and timestamp.
 */

// ===================================================================================
// 1. 在这里配置您的 JSON 链接 (从苹果官方工具生成，确保结尾是 .json)
// ===================================================================================
const RANK_JSON_FEEDS = {
  "美国免费榜": "https://rss.marketingtools.apple.com/api/v2/us/apps/top-free/10/apps.json",
  "美国付费榜": "https://rss.marketingtools.apple.com/api/v2/us/apps/top-paid/10/apps.json",
  "日本免费榜": "https://rss.marketingtools.apple.com/api/v2/jp/apps/top-free/10/apps.json",
  "帮助": "show_help",
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

const handleUserMessage = async (req, res) => {
    let requestBody = '';
    req.on('data', chunk => { requestBody += chunk.toString(); });
    req.on('end', async () => {
        let replyXml = '';
        let fromUserName, toUserName;
        try {
            const parsedResult = await xml2js.parseStringPromise(requestBody, { explicitArray: false });
            const message = parsedResult.xml;
            toUserName = message.ToUserName;
            fromUserName = message.FromUserName;
            const msgType = message.MsgType;
            const content = message.Content;

            if (msgType === 'text' && content) {
                const keyword = content.trim();

                if (keyword.toLowerCase() === '帮助' || keyword.toLowerCase() === 'help') {
                    const helpText = `欢迎使用 App Store 榜单查询助手！\n\n请输入以下关键词查询榜单：\n- ${Object.keys(RANK_JSON_FEEDS).filter(k => k !== '帮助').join('\n- ')}\n\n榜单数据来自苹果官方。`;
                    replyXml = generateTextReply(fromUserName, toUserName, helpText);
                } else {
                    const feedUrl = RANK_JSON_FEEDS[keyword];
                    if (feedUrl) {
                        const appListText = await fetchAndParseJson(feedUrl, keyword);
                        replyXml = generateTextReply(fromUserName, toUserName, appListText);
                    } else {
                        const defaultReply = `抱歉，没有找到与“${keyword}”相关的榜单。\n\n您可以输入“帮助”查看所有支持的关键词。`;
                        replyXml = generateTextReply(fromUserName, toUserName, defaultReply);
                    }
                }
            }

            res.setHeader('Content-Type', 'application/xml');
            res.status(200).send(replyXml || '');

        } catch (error) {
            console.error("ERROR in handleUserMessage:", error);
            const errorMessage = `抱歉，程序出错了！\n\n[调试信息]\n${error.message}`;
            replyXml = generateTextReply(fromUserName, toUserName, errorMessage);
            res.setHeader('Content-Type', 'application/xml');
            res.status(200).send(replyXml);
        }
    });
};

const fetchAndParseJson = async (url, title) => {
  const response = await axios.get(url);
  const data = response.data;
  if (!data.feed || !data.feed.results) {
    throw new Error("从苹果获取的JSON数据格式不正确。");
  }
  const results = data.feed.results;
  const now = new Date();
  const timestamp = now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });

  // [MODIFIED] 直接生成包含链接的完整列表
  let replyText = `${title} ${timestamp}\n\n`;
  results.forEach((app, index) => {
    replyText += `${index + 1}、${app.name}\n${app.url}\n\n`;
  });
  replyText += "数据来自 Apple 官方";

  return replyText;
};

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
