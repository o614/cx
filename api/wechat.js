/**
 * Vercel Serverless Function for WeChat Official Account
 * Version 3.8 - Added auto-reply for new followers.
 */

// ===================================================================================
// 1. 在这里配置您的 JSON 链接 (已扩展至全球)
// ===================================================================================
const countryMap = {
    'af': '阿富汗', 'al': '阿尔巴尼亚', 'dz': '阿尔及利亚', 'ao': '安哥拉', 'ai': '安圭拉',
    'ag': '安提瓜和巴布达', 'ar': '阿根廷', 'am': '亚美尼亚', 'au': '澳大利亚', 'at': '奥地利',
    'az': '阿塞拜疆', 'bs': '巴哈马', 'bh': '巴林', 'bb': '巴巴多斯', 'by': '白俄罗斯',
    'be': '比利时', 'bz': '伯利兹', 'bj': '贝宁', 'bm': '百慕大', 'bt': '不丹',
    'bo': '玻利维亚', 'ba': '波斯尼亚和黑塞哥维那', 'bw': '博茨瓦纳', 'br': '巴西',
    'vg': '英属维尔京群岛', 'bn': '文莱', 'bg': '保加利亚', 'bf': '布基纳法索',
    'kh': '柬埔寨', 'cm': '喀麦隆', 'ca': '加拿大', 'cv': '佛得角', 'ky': '开曼群岛',
    'td': '乍得', 'cl': '智利', 'cn': '中国大陆', 'co': '哥伦比亚', 'cr': '哥斯达黎加',
    'hr': '克罗地亚', 'cy': '塞浦路斯', 'cz': '捷克', 'ci': '科特迪瓦',
    'cd': '刚果民主共和国', 'dk': '丹麦', 'dm': '多米尼克', 'do': '多米尼加',
    'ec': '厄瓜多尔', 'eg': '埃及', 'sv': '萨尔瓦多', 'ee': '爱沙尼亚', 'sz': '史瓦帝尼',
    'fj': '斐济', 'fi': '芬兰', 'fr': '法国', 'ga': '加蓬', 'gm': '冈比亚',
    'ge': '格鲁吉亚', 'de': '德国', 'gh': '加纳', 'gr': '希腊', 'gd': '格林纳达',
    'gt': '危地马拉', 'gw': '几内亚比绍', 'gy': '圭亚那', 'hn': '洪都拉斯', 'hk': '香港',
    'hu': '匈牙利', 'is': '冰岛', 'in': '印度', 'id': '印度尼西亚', 'iq': '伊拉克',
    'ie': '爱尔兰', 'il': '以色列', 'it': '意大利', 'jm': '牙买加', 'jp': '日本',
    'jo': '约旦', 'kz': '哈萨克斯坦', 'ke': '肯尼亚', 'kr': '韩国', 'xk': '科索沃',
    'kw': '科威特', 'kg': '吉尔吉斯斯坦', 'la': '老挝', 'lv': '拉脱维亚', 'lb': '黎巴嫩',
    'lr': '利比里亚', 'ly': '利比亚', 'lt': '立陶宛', 'lu': '卢森堡', 'mo': '澳门',
    'mg': '马达加斯加', 'mw': '马拉维', 'my': '马来西亚', 'mv': '马尔代夫', 'ml': '马里',
    'mt': '马耳他', 'mr': '毛里塔尼亚', 'mu': '毛里求斯', 'mx': '墨西哥', 'fm': '密克罗尼西亚',
    'md': '摩尔多瓦', 'mn': '蒙古', 'me': '黑山', 'ms': '蒙特塞拉特', 'ma': '摩洛哥',
    'mz': '莫桑比克', 'mm': '缅甸', 'na': '纳米比亚', 'nr': '瑙鲁', 'np': '尼泊尔',
    'nl': '荷兰', 'nz': '新西兰', 'ni': '尼加拉瓜', 'ne': '尼日尔', 'ng': '尼日利亚',
    'mk': '北马其顿', 'no': '挪威', 'om': '阿曼', 'pk': '巴基斯坦', 'pw': '帕劳',
    'pa': '巴拿马', 'pg': '巴布亚新几内亚', 'py': '巴拉圭', 'pe': '秘鲁', 'ph': '菲律宾',
    'pl': '波兰', 'pt': '葡萄牙', 'qa': '卡塔尔', 'cg': '刚果共和国', 'ro': '罗马尼亚',
    'ru': '俄罗斯', 'rw': '卢旺达', 'sa': '沙特阿拉伯', 'sn': '塞内加尔', 'rs': '塞尔维亚',
    'sc': '塞舌尔', 'sl': '塞拉利昂', 'sg': '新加坡', 'sk': '斯洛伐克', 'si': '斯洛文尼亚',
    'sb': '所罗门群岛', 'za': '南非', 'es': '西班牙', 'lk': '斯里兰卡',
    'kn': '圣基茨和尼维斯', 'lc': '圣卢西亚', 'vc': '圣文森特和格林纳丁斯',
    'sr': '苏里南', 'se': '瑞典', 'ch': '瑞士', 'st': '圣多美和普林西比',
    'tw': '台湾', 'tj': '塔吉克斯坦', 'tz': '坦桑尼亚', 'th': '泰国', 'to': '汤加',
    'tt': '特立尼达和多巴哥', 'tn': '突尼斯', 'tm': '土库曼斯坦', 'tc': '特克斯和凯科斯群岛',
    'tr': '土耳其', 'ae': '阿联酋', 'ug': '乌干达', 'ua': '乌克兰', 'gb': '英国',
    'us': '美国', 'uy': '乌拉圭', 'uz': '乌兹别克斯坦', 'vu': '瓦努阿图', 've': '委内瑞拉',
    'vn': '越南', 'ye': '也门', 'zm': '赞比亚', 'zw': '津巴布韦'
};

const RANK_JSON_FEEDS = { "帮助": "show_help" };
for (const code in countryMap) {
    const name = countryMap[code];
    RANK_JSON_FEEDS[`${name}免费榜`] = `https://rss.marketingtools.apple.com/api/v2/${code}/apps/top-free/10/apps.json`;
    RANK_JSON_FEEDS[`${name}付费榜`] = `https://rss.marketingtools.apple.com/api/v2/${code}/apps/top-paid/10/apps.json`;
}

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

            // [MODIFIED] 增加事件处理逻辑
            if (msgType === 'event') {
                const event = message.Event;
                if (event === 'subscribe') {
                    // 处理关注事件
                    const welcomeMessage = `感谢关注！🎉\n\n您可以直接发送“国家或地区名”+“免费榜”或“付费榜”来查询 App Store 榜单。\n\n例如：\n美国免费榜\n日本付费榜\n\n发送“帮助”可以查看更详细的说明。`;
                    replyXml = generateTextReply(fromUserName, toUserName, welcomeMessage);
                }
                // 可以在这里添加 else if 来处理其他事件，如取消关注(unsubscribe)
            } else if (msgType === 'text') {
                const content = message.Content;
                const keyword = content.trim();

                if (keyword.toLowerCase() === '帮助' || keyword.toLowerCase() === 'help') {
                    const helpText = `欢迎使用 App Store 榜单查询助手！\n\n请输入“国家或地区名”+“免费榜”或“付费榜”进行查询。\n例如：美国免费榜\n\n支持全球所有地区，快来试试吧！`;
                    replyXml = generateTextReply(fromUserName, toUserName, helpText);
                } else {
                    const feedUrl = RANK_JSON_FEEDS[keyword];
                    if (feedUrl) {
                        const appListText = await fetchAndParseJson(feedUrl, keyword);
                        replyXml = generateTextReply(fromUserName, toUserName, appListText);
                    } else {
                        const defaultReply = `抱歉，没有找到与“${keyword}”相关的榜单。\n\n您可以输入“帮助”查看使用说明。`;
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
