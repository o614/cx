/**
 * Vercel Serverless Function for WeChat Official Account
 * Version 4.7 - Added App Price Lookup feature.
 */

const appCountryMap = {
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

const musicCountryMap = {
    'dz': '阿尔及利亚', 'ao': '安哥拉', 'ai': '安圭拉', 'ag': '安提瓜和巴布达', 'ar': '阿根廷',
    'am': '亚美尼亚', 'au': '澳大利亚', 'at': '奥地利', 'az': '阿塞拜疆', 'bs': '巴哈马',
    'bh': '巴林', 'bb': '巴巴多斯', 'by': '白俄罗斯', 'be': '比利时', 'bz': '伯利兹',
    'bj': '贝宁', 'bm': '百慕大', 'bt': '不丹', 'bo': '玻利维亚', 'ba': '波斯尼亚和黑塞哥维那',
    'bw': '博茨瓦纳', 'br': '巴西', 'vg': '英属维尔京群岛', 'bg': '保加利亚', 'kh': '柬埔寨',
    'cm': '喀麦隆', 'ca': '加拿大', 'cv': '佛得角', 'ky': '开曼群岛', 'td': '乍得',
    'cl': '智利', 'cn': '中国大陆', 'co': '哥伦比亚', 'cr': '哥斯达黎加', 'hr': '克罗地亚',
    'cy': '塞浦路斯', 'cz': '捷克', 'ci': '科特迪瓦', 'cd': '刚果民主共和国', 'dk': '丹麦',
    'dm': '多米尼克', 'do': '多米尼加', 'ec': '厄瓜多尔', 'eg': '埃及', 'sv': '萨尔瓦多',
    'ee': '爱沙尼亚', 'sz': '史瓦帝尼', 'fj': '斐济', 'fi': '芬兰', 'fr': '法国',
    'ga': '加蓬', 'gm': '冈比亚', 'ge': '格鲁吉亚', 'de': '德国', 'gh': '加纳',
    'gr': '希腊', 'gd': '格林纳达', 'gt': '危地马拉', 'gw': '几内亚比绍', 'gy': '圭亚那',
    'hn': '洪都拉斯', 'hk': '香港', 'hu': '匈牙利', 'is': '冰岛', 'in': '印度',
    'id': '印度尼西亚', 'iq': '伊拉克', 'ie': '爱尔兰', 'il': '以色列', 'it': '意大利',
    'jm': '牙买加', 'jp': '日本', 'jo': '约旦', 'kz': '哈萨克斯坦', 'ke': '肯尼亚',
    'kr': '韩国', 'xk': '科索沃', 'kw': '科威特', 'kg': '吉尔吉斯斯坦', 'la': '老挝',
    'lv': '拉脱维亚', 'lb': '黎巴嫩', 'lr': '利比里亚', 'ly': '利比亚', 'lt': '立陶宛',
    'lu': '卢森堡', 'mo': '澳门', 'mg': '马达加斯加', 'mw': '马拉维', 'my': '马来西亚',
    'mv': '马尔代夫', 'ml': '马里', 'mt': '马耳他', 'mr': '毛里塔尼亚', 'mu': '毛里求斯',
    'mx': '墨西哥', 'fm': '密克罗尼西亚', 'md': '摩尔多瓦', 'mn': '蒙古', 'me': '黑山',
    'ms': '蒙特塞拉特', 'ma': '摩洛哥', 'mz': '莫桑比克', 'mm': '缅甸', 'na': '纳米比亚',
    'np': '尼泊尔', 'nl': '荷兰', 'nz': '新西兰', 'ni': '尼加拉瓜', 'ne': '尼日尔',
    'ng': '尼日利亚', 'mk': '北马其顿', 'no': '挪威', 'om': '阿曼', 'pa': '巴拿马',
    'pg': '巴布亚新几内亚', 'py': '巴拉圭', 'pe': '秘鲁', 'ph': '菲律宾', 'pl': '波兰',
    'pt': '葡萄牙', 'qa': '卡塔尔', 'cg': '刚果共和国', 'ro': '罗马尼亚', 'ru': '俄罗斯',
    'rw': '卢旺达', 'sa': '沙特阿拉伯', 'sn': '塞内加尔', 'rs': '塞尔维亚', 'sc': '塞舌尔',
    'sl': '塞拉利昂', 'sg': '新加坡', 'sk': '斯洛伐克', 'si': '斯洛文尼亚', 'sb': '所罗门群岛',
    'za': '南非', 'es': '西班牙', 'lk': '斯里兰卡', 'kn': '圣基茨和尼维斯', 'lc': '圣卢西亚',
    'vc': '圣文森特和格林纳丁斯', 'sr': '苏里南', 'se': '瑞典', 'ch': '瑞士', 'tw': '台湾',
    'tj': '塔吉克斯坦', 'tz': '坦桑尼亚', 'th': '泰国', 'to': '汤加', 'tt': '特立尼达和多巴哥',
    'tn': '突尼斯', 'tm': '土库曼斯坦', 'tc': '特克斯和凯科斯群岛', 'tr': '土耳其', 'ae': '阿联酋',
    'ug': '乌干达', 'ua': '乌克兰', 'gb': '英国', 'us': '美国', 'uy': '乌拉圭',
    'uz': '乌兹别克斯坦', 'vu': '瓦努阿图', 've': '委内瑞拉', 'vn': '越南', 'ye': '也门',
    'zm': '赞比亚', 'zw': '津巴布韦'
};

const RANK_JSON_FEEDS = {};
for (const code in appCountryMap) {
    const name = appCountryMap[code];
    RANK_JSON_FEEDS[`${name}免费榜`] = `https://rss.marketingtools.apple.com/api/v2/${code}/apps/top-free/10/apps.json`;
    RANK_JSON_FEEDS[`${name}付费榜`] = `https://rss.marketingtools.apple.com/api/v2/${code}/apps/top-paid/10/apps.json`;
}
for (const code in musicCountryMap) {
    const name = musicCountryMap[code];
    RANK_JSON_FEEDS[`${name}热门专辑`] = `https://rss.marketingtools.apple.com/api/v2/${code}/music/most-played/10/albums.json`;
    RANK_JSON_FEEDS[`${name}热门单曲`] = `https://rss.marketingtools.apple.com/api/v2/${code}/music/most-played/10/songs.json`;
}

const WECHAT_TOKEN = process.env.WECHAT_TOKEN;

const crypto = require('crypto');
const axios = require('axios');
const xml2js = require('xml2js');

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
    res.status(200).send('');
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
        let fromUserName, toUserName, keyword;
        try {
            const parsedResult = await xml2js.parseStringPromise(requestBody, { explicitArray: false });
            const message = parsedResult.xml;
            toUserName = message.ToUserName;
            fromUserName = message.FromUserName;
            const msgType = message.MsgType;

            if (msgType === 'event') {
                const event = message.Event;
                if (event === 'subscribe') {
                    const welcomeMessage = `😘 么么哒~\n\n恭喜！你发现了果粉秘密基地~\n\n点击<a href="weixin://bizmsgmenu?msgmenucontent=最新教程&msgmenuid=最新教程"> ›最新教程‹ </a>获取最新文章\n\n点击<a href="weixin://bizmsgmenu?msgmenucontent=付款方式&msgmenuid=付款方式"> ›付款方式‹ </a>查看支持国家\n\n点击<a href="weixin://bizmsgmenu?msgmenucontent=榜单查询&msgmenuid=榜单查询"> ›榜单查询‹ </a>查看热门榜单\n\n点击<a href="weixin://bizmsgmenu?msgmenucontent=订阅查询&msgmenuid=订阅查询"> ›订阅查询‹ </a>了解订阅价格\n\n点击<a href="weixin://bizmsgmenu?msgmenucontent=人工服务&msgmenuid=人工服务"> ›人工服务‹ </a>召唤真人客服\n\n更多服务请戳底部菜单栏了解~\n\n↓   ↓   ↓`;
                    replyXml = generateTextReply(fromUserName, toUserName, welcomeMessage);
                }
            } else if (msgType === 'text') {
                const content = message.Content;
                keyword = content.trim();

                // [NEW] Price lookup logic
                if (keyword.startsWith('查价格 ')) {
                    const parts = keyword.substring(4).trim().split(' ');
                    if (parts.length >= 2) {
                        const appName = parts.slice(0, -1).join(' ');
                        const countryName = parts[parts.length - 1];
                        const priceText = await lookupAppPrice(appName, countryName);
                        replyXml = generateTextReply(fromUserName, toUserName, priceText);
                    } else {
                        // Silently ignore incorrect format
                    }
                } else {
                    // Existing chart lookup logic
                    const feedUrl = RANK_JSON_FEEDS[keyword];
                    if (feedUrl) {
                        const appListText = await fetchAndParseJson(feedUrl, keyword);
                        replyXml = generateTextReply(fromUserName, toUserName, appListText);
                    }
                }
            }

            res.setHeader('Content-Type', 'application/xml');
            res.status(200).send(replyXml || '');

        } catch (error) {
            console.error("ERROR in handleUserMessage:", error);
            res.status(200).send('');
        }
    });
};

const lookupAppPrice = async (appName, countryName) => {
    const countryCode = Object.keys(appCountryMap).find(code => appCountryMap[code] === countryName);

    if (!countryCode) {
        return `未找到地区“${countryName}”。`;
    }

    const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(appName)}&country=${countryCode}&entity=software&limit=1`;
    let requestUrl = searchUrl;

    if (countryCode === 'cn') {
        console.log("Using proxy for China region price lookup.");
        requestUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(searchUrl)}`;
    }

    const response = await axios.get(requestUrl, { timeout: 8000 });
    const data = response.data;

    if (data.resultCount === 0 || !data.results || data.results.length === 0) {
        return `在“${countryName}”未找到名为“${appName}”的应用。`;
    }

    const app = data.results[0];
    const price = app.formattedPrice || (app.price === 0 ? '免费' : '未知');

    let replyText = `「${app.trackName}」价格查询：\n\n`;
    replyText += `地区：${countryName}\n`;
    replyText += `价格：${price}\n\n`;
    replyText += `*数据来自 Apple 官方`;

    return replyText;
};

const fetchAndParseJson = async (url, title) => {
  let requestUrl = url;
  const isChinaRequest = url.includes('/cn/');

  if (isChinaRequest) {
    console.log("Using proxy for China region.");
    requestUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  }

  const networkPromise = axios.get(requestUrl, { timeout: 8000 });
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('请求超时')), 9500)
  );

  const response = await Promise.race([networkPromise, timeoutPromise]);

  const data = response.data;
  if (!data.feed || !data.feed.results) {
    throw new Error("从苹果获取的JSON数据格式不正确。");
  }
  const results = data.feed.results;
  const now = new Date();
  const timestamp = now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });

  let replyText = `${title}\n${timestamp}\n\n`;
  results.forEach((app, index) => {
    const name = app.name;
    const artist = app.artistName || '';
    const link = app.url;
    const displayName = artist ? `${name} - ${artist}` : name;
    replyText += `${index + 1}、${displayName}\n${link}\n\n`;
  });
  replyText += "*数据来自 Apple 官方";

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
