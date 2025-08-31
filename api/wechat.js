/**
 * Vercel Serverless Function for WeChat Official Account
 * Version 6.0 - Added App Availability Lookup feature.
 */

const crypto = require('crypto');
const axios = require('axios');
const xml2js = require('xml2js');

const WECHAT_TOKEN = process.env.WECHAT_TOKEN;

// --- 数据和配置 ---

const appCountryMap = {
    'af': '阿富汗', 'al': '阿尔巴尼亚', 'dz': '阿尔及利亚', 'ao': '安哥拉', 'ai': '安圭拉',
    'ag': '安提瓜和巴布达', 'ar': '阿根廷', 'am': '亚美尼亚', 'au': '澳大利亚', 'at': '奥地利',
    'az': '阿塞拜疆', 'bs': '巴哈马', 'bh': '巴林', 'bb': '巴巴多斯', 'by': '白俄罗斯',
    'be': '比利时', 'bz': '伯利兹', 'bj': '贝宁', 'bm': '百 katılı大', 'bt': '不丹',
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
    'sb': '所罗门群岛', 'za': '南非', 'es': '西班牙', 'lk': '斯里Лан卡',
    'kn': '圣基茨和尼维斯', 'lc': '圣卢西亚', 'vc': '圣文森特和格林纳丁斯',
    'sr': '苏里南', 'se': '瑞典', 'ch': '瑞士', 'st': '圣多美和普林西比',
    'tw': '台湾', 'tj': '塔吉克斯坦', 'tz': '坦桑尼亚', 'th': '泰国', 'to': '汤加',
    'tt': '特立尼达和多巴哥', 'tn': '突尼斯', 'tm': '土库曼斯坦', 'tc': '特克斯和凯科斯群岛',
    'tr': '土耳其', 'ae': '阿联酋', 'ug': '乌干达', 'ua': '乌克兰', 'gb': '英国',
    'us': '美国', 'uy': '乌拉圭', 'uz': '乌兹别克斯坦', 'vu': '瓦努阿图', 've': '委内瑞拉',
    'vn': '越南', 'ye': '也门', 'zm': '赞比亚', 'zw': '津巴布韦'
};

const RANK_JSON_FEEDS = {};
for (const code in appCountryMap) {
    const name = appCountryMap[code];
    RANK_JSON_FEEDS[`${name}免费榜`] = `https://rss.marketingtools.apple.com/api/v2/${code}/apps/top-free/10/apps.json`;
    RANK_JSON_FEEDS[`${name}付费榜`] = `https://rss.marketingtools.apple.com/api/v2/${code}/apps/top-paid/10/apps.json`;
}

// 【新增】定义“上架查询”功能的目标国家列表
const TARGET_COUNTRIES = [
    { code: 'us', name: '美国' }, { code: 'hk', name: '香港' }, { code: 'jp', name: '日本' },
    { code: 'gb', name: '英国' }, { code: 'tw', name: '台湾' }, { code: 'mo', name: '澳门' },
    { code: 'ca', name: '加拿大' }, { code: 'au', 'name': '澳大利亚' }, { code: 'sg', 'name': '新加坡' },
    { code: 'kr', name: '韩国' }, { code: 'tr', name: '土耳其' }, { code: 'de', name: '德国' },
    { code: 'fr', name: '法国' }, { code: 'ru', name: '俄罗斯' }, { code: 'br', name: '巴西' },
    { code: 'in', name: '印度' }, { code: 'id', name: '印尼' }, { code: 'th', name: '泰国' },
    { code: 'vn', name: '越南' }, { code: 'ph', name: '菲律宾' }, { code: 'my', name: '马来西亚' },
    { code: 'cn', name: '中国大陆' } // 也包含中国大陆作为对比
];

// --- 主处理逻辑 ---

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
        res.status(200).send(''); // 确保微信服务器总是收到200 OK
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

            if (msgType === 'event') {
                if (message.Event === 'subscribe') {
                    const welcomeMessage = `😘 感谢关注！果粉秘密基地~\n\n回复【可下载地区 App名称】查询App全球上架情况，例如：\n可下载地区 TikTok\n\n回复【查价格 App名称 国家】查询价格，例如：\n查价格 Procreate 美国\n\n回复【美国免费榜】查看榜单。\n\n更多服务请戳底部菜单栏了解~`;
                    replyXml = generateTextReply(fromUserName, toUserName, welcomeMessage);
                }
            } else if (msgType === 'text') {
                const content = message.Content.trim();

                if (content.startsWith('可下载地区 ')) {
                    const appName = content.substring(6).trim();
                    if (appName) {
                        const appInfo = await findAppUniversalId(appName);
                        let replyText = '';
                        if (!appInfo) {
                            replyText = `未能在主要地区（美国、中国）的应用商店中找到「${appName}」，请检查应用名称是否正确。`;
                        } else {
                            const availableCountries = await checkAvailability(appInfo.trackId);
                            replyText = `查询应用：「${appInfo.trackName}」\n\n`;
                            if (availableCountries.length > 0) {
                                replyText += `✅ 可下载地区：\n${availableCountries.join(', ')}`;
                            } else {
                                replyText += `在我们查询的20多个热门国家/地区中，均未发现此应用上架。`;
                            }
                            replyText += `\n\n数据来自 Apple 官方`;
                        }
                        replyXml = generateTextReply(fromUserName, toUserName, replyText);
                    }
                } else if (content.startsWith('查价格 ')) {
                    const parts = content.substring(4).trim().split(' ');
                    if (parts.length >= 2) {
                        const appName = parts.slice(0, -1).join(' ');
                        const countryName = parts[parts.length - 1];
                        const priceText = await lookupAppPriceAsText(appName, countryName);
                        if (priceText) {
                            replyXml = generateTextReply(fromUserName, toUserName, priceText);
                        }
                    }
                } else if (content.startsWith('图标 ')) {
                    const appName = content.substring(3).trim();
                    if (appName) {
                        const iconReplyText = await lookupAppIcon(appName);
                        if (iconReplyText) {
                            replyXml = generateTextReply(fromUserName, toUserName, iconReplyText);
                        }
                    }
                } else if (RANK_JSON_FEEDS[content]) {
                    const feedUrl = RANK_JSON_FEEDS[content];
                    const appListText = await fetchAndParseJson(feedUrl, content);
                    replyXml = generateTextReply(fromUserName, toUserName, appListText);
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


// --- 功能函数 ---

/**
 * 【新增】查找App的全球通用ID (trackId)
 * @param {string} appName - 用户输入的App名称
 * @returns {Promise<object|null>} - 返回包含 trackId 和 trackName 的对象，或 null
 */
async function findAppUniversalId(appName) {
    // 优先在美国区搜索，因为很多国际App在这里有
    const usSearchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(appName)}&country=us&entity=software&limit=1`;
    try {
        const response = await axios.get(usSearchUrl, { timeout: 4000 });
        if (response.data.resultCount > 0) {
            const app = response.data.results[0];
            return { trackId: app.trackId, trackName: app.trackName };
        }
    } catch (error) {
        console.warn('Warning: Error searching in US store:', error.message);
    }

    // 如果在美国区找不到，再尝试在中国区搜索（兼容国内App）
    const cnSearchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(appName)}&country=cn&entity=software&limit=1`;
    try {
        const response = await axios.get(cnSearchUrl, { timeout: 4000 });
        if (response.data.resultCount > 0) {
            const app = response.data.results[0];
            return { trackId: app.trackId, trackName: app.trackName };
        }
    } catch (error) {
        console.warn('Warning: Error searching in CN store:', error.message);
    }
    
    return null; // 如果都找不到，则返回null
}

/**
 * 【新增】检查指定 trackId 的 App 在目标国家列表中的上架情况
 * @param {string|number} trackId - App的全球唯一ID
 * @returns {Promise<string[]>} - 返回一个包含所有可下载国家中文名的数组
 */
async function checkAvailability(trackId) {
    // 创建所有国家/地区的查询请求
    const checkPromises = TARGET_COUNTRIES.map(country => {
        const lookupUrl = `https://itunes.apple.com/lookup?id=${trackId}&country=${country.code}`;
        // 为了速度，这里的超时设置得短一些
        return axios.get(lookupUrl, { timeout: 4000 });
    });

    const availableCountries = [];
    // 并行执行所有查询
    const results = await Promise.allSettled(checkPromises);

    results.forEach((result, index) => {
        // 如果请求成功 (fulfilled) 并且查询结果数量大于0，说明App在该国家存在
        if (result.status === 'fulfilled' && result.value.data.resultCount > 0) {
            availableCountries.push(TARGET_COUNTRIES[index].name);
        }
    });

    return availableCountries;
}


const lookupAppIcon = async (appName) => {
    try {
        const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(appName)}&country=us&entity=software&limit=1`;
        const response = await axios.get(searchUrl, { timeout: 8000 });
        const data = response.data;
        if (data.resultCount === 0 || !data.results || data.results.length === 0) {
            return '未找到相关应用，请检查名称。';
        }
        const app = data.results[0];
        const highResIconUrl = (app.artworkUrl100 || '').replace('100x100bb.jpg', '1024x1024bb.jpg');
        if (!highResIconUrl) return '抱歉，未能获取到该应用的高清图标。';

        let replyText = `您搜索的“${appName}”最匹配的结果是：\n\n`;
        replyText += `「${app.trackName}」\n\n`;
        replyText += `这是它的高清图标链接 (可复制到浏览器打开)：\n${highResIconUrl}\n\n`;
        replyText += `数据来自 Apple 官方`;
        return replyText;
    } catch (error) {
        console.error("Error in lookupAppIcon:", error.message);
        return '查询应用图标失败，请稍后再试。';
    }
};

const lookupAppPriceAsText = async (appName, countryName) => {
    try {
        const countryCode = Object.keys(appCountryMap).find(code => appCountryMap[code] === countryName);
        if (!countryCode) return `无法识别国家：“${countryName}”`;

        const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(appName)}&country=${countryCode}&entity=software&limit=1`;
        const response = await axios.get(searchUrl, { timeout: 8000 });
        const data = response.data;
        if (data.resultCount === 0 || !data.results || data.results.length === 0) {
            return `在${countryName}没有找到与“${appName}”相关的应用。`;
        }

        const app = data.results[0];
        const price = app.formattedPrice || (app.price === 0 ? '免费' : '未知');

        let replyText = `您搜索的“${appName}”最匹配的结果是：\n\n`;
        replyText += `「${app.trackName}」\n\n`;
        replyText += `地区：${countryName}\n`;
        replyText += `价格：${price}\n\n`;
        replyText += `数据来自 Apple 官方`;
        return replyText;
    } catch (error) {
        console.error("Error in lookupAppPriceAsText:", error.message);
        return '查询应用价格失败，请稍后再试。';
    }
};

const fetchAndParseJson = async (url, title) => {
    try {
        const response = await axios.get(url, { timeout: 8000 });
        const data = response.data;
        if (!data.feed || !data.feed.results) {
            throw new Error("从苹果获取的JSON数据格式不正确。");
        }
        const results = data.feed.results;
        const now = new Date();
        const timestamp = now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });
        let replyText = `📊 ${title}\n${timestamp}\n\n`;
        results.forEach((app, index) => {
            const name = app.name;
            const artist = app.artistName || '';
            const link = app.url;
            const displayName = artist ? `${name} - ${artist}` : name;
            replyText += `${index + 1}、<a href="${link}">${displayName}</a>\n\n`;
        });
        replyText += "数据来自 Apple 官方";
        return replyText;
    } catch (error) {
        console.error("Error in fetchAndParseJson:", error.message);
        return `${title}\n\n哎呀，获取榜单数据失败了，可能是苹果服务器暂时出了点问题，请稍后再试吧~`;
    }
};


// --- XML 生成工具 ---

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
