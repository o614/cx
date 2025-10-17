/**
 * WeChat Official Account Serverless Function - Final Merged Version
 * Combines intelligent search, availability lookup, and other core features.
 */
const crypto = require('crypto');
const axios = require('axios');
const xml2js = require('xml2js');
const stringSimilarity = require('string-similarity');

// --- 配置区域 ---

const CONFIG = {
    WECHAT_TOKEN: process.env.WECHAT_TOKEN,
    ALL_SUPPORTED_REGIONS: { '阿富汗':'af', '中国':'cn', '阿尔巴尼亚':'al', '阿尔及利亚':'dz', '安哥拉':'ao', '安圭拉':'ai', '安提瓜和巴布达':'ag', '阿根廷':'ar', '亚美尼亚':'am', '澳大利亚':'au', '奥地利':'at', '阿塞拜疆':'az', '巴哈马':'bs', '巴林':'bh', '巴巴多斯':'bb', '白俄罗斯':'by', '比利时':'be', '伯利兹':'bz', '贝宁':'bj', '百慕大':'bm', '不丹':'bt', '玻利维亚':'bo', '波斯尼亚和黑塞哥维那':'ba', '博茨瓦纳':'bw', '巴西':'br', '英属维尔京群岛':'vg', '文莱':'bn', '保加利亚':'bg', '布基纳法索':'bf', '柬埔寨':'kh', '喀麦隆':'cm', '加拿大':'ca', '佛得角':'cv', '开曼群岛':'ky', '乍得':'td', '智利':'cl','哥伦比亚':'co', '哥斯达黎加':'cr', '克罗地亚':'hr', '塞浦路斯':'cy', '捷克':'cz', '科特迪瓦':'ci', '刚果民主共和国':'cd', '丹麦':'dk', '多米尼克':'dm', '多米尼加':'do', '厄瓜多尔':'ec', '埃及':'eg', '萨尔瓦多':'sv', '爱沙尼亚':'ee', '史瓦帝尼':'sz', '斐济':'fj', '芬兰':'fi', '法国':'fr', '加蓬':'ga', '冈比亚':'gm', '格鲁吉亚':'ge', '德国':'de', '加纳':'gh', '希腊':'gr', '格林纳达':'gd', '危地马拉':'gt', '几内亚比绍':'gw', '圭那亚':'gy', '洪都拉斯':'hn', '香港':'hk', '匈牙利':'hu', '冰岛':'is', '印度':'in', '印度尼西亚':'id', '伊拉克':'iq', '爱尔兰':'ie', '以色列':'il', '意大利':'it', '牙买加':'jm', '日本':'jp', '约旦':'jo', '哈萨克斯坦':'kz', '肯尼亚':'ke', '韩国':'kr', '科索沃':'xk', '科威特':'kw', '吉尔吉斯斯坦':'kg', '老挝':'la', '拉脱维亚':'lv', '黎巴嫩':'lb', '利比里亚':'lr', '利比亚':'ly', '立陶宛':'lt', '卢森堡':'lu', '澳门':'mo', '马达加斯加':'mg', '马拉维':'mw', '马来西亚':'my', '马尔代夫':'mv', '马里':'ml', '马耳他':'mt', '毛里塔尼亚':'mr', '毛里求斯':'mu', '墨西哥':'mx', '密克罗尼西亚':'fm', '摩尔多瓦':'md', '蒙古':'mn', '黑山':'me', '蒙特塞拉特':'ms', '摩洛哥':'ma', '莫桑比克':'mz', '缅甸':'mm', '纳米比亚':'na', '瑙鲁':'nr', '尼泊尔':'np', '荷兰':'nl', '新西兰':'nz', '尼加拉瓜':'ni', '尼日尔':'ne', '尼日利亚':'ng', '北马其顿':'mk', '挪威':'no', '阿曼':'om', '巴基斯坦':'pk', '帕劳':'pw', '巴拿马':'pa', '巴布亚新几内亚':'pg', '巴拉圭':'py', '秘鲁':'pe', '菲律宾':'ph', '波兰':'pl', '葡萄牙':'pt', '卡塔尔':'qa', '刚果共和国':'cg', '罗马尼亚':'ro', '俄罗斯':'ru', '卢旺达':'rw', '沙特阿拉伯':'sa', '塞内加尔':'sn', '塞尔维亚':'rs', '塞舌尔':'sc', '塞拉利昂':'sl', '新加坡':'sg', '斯洛伐克':'sk', '斯洛文尼亚':'si', '所罗门群岛':'sb', '南非':'za', '西班牙':'es', '斯里兰卡':'lk', '圣基茨和尼维斯':'kn', '圣卢西亚':'lc', '圣文森特和格林纳丁斯':'vc', '苏里南':'sr', '瑞典':'se', '瑞士':'ch', '圣多美和普林西比':'st', '台湾':'tw', '塔吉克斯坦':'tj', '坦桑尼亚':'tz', '泰国':'th', '汤加':'to', '特立尼达和多巴哥':'tt', '突尼斯':'tn', '土库曼斯坦':'tm', '特克斯和凯科斯群岛':'tc', '土耳其':'tr', '阿联酋':'ae', '乌干达':'ug', '乌克兰':'ua', '英国':'gb', '美国':'us', '乌拉圭':'uy', '乌兹别克斯坦':'uz', '瓦努阿图':'vu', '委内瑞拉':'ve', '越南':'vn', '也门':'ye', '赞比亚':'zm', '津巴布韦':'zw'},
    DSF_MAP: { 'al': 143575, 'cn': 143465, 'dz': 143563, 'ao': 143564, 'ai': 143538, 'ag': 143540, 'ar': 143505, 'am': 143524, 'au': 143460, 'at': 143445, 'az': 143568, 'bs': 143539, 'bh': 143559, 'bb': 143541, 'by': 143565, 'be': 143446, 'bz': 143555, 'bj': 143576, 'bm': 143542, 'bt': 143577, 'bo': 143556, 'bw': 143525, 'br': 143503, 'vg': 143543, 'bn': 143560, 'bg': 143526, 'bf': 143578, 'kh': 143579, 'ca': 143455, 'cv': 143580, 'ky': 143544, 'td': 143581, 'cl': 143483, 'co': 143501, 'cr': 143495, 'hr': 143494, 'cy': 143557, 'cz': 143489, 'dk': 143458, 'dm': 143545, 'do': 143508, 'ec': 143509, 'eg': 143516, 'sv': 143506, 'ee': 143518, 'sz': 143602, 'fj': 143583, 'fi': 143447, 'fr': 143442, 'gm': 143584, 'de': 143443, 'gh': 143573, 'gr': 143448, 'gd': 143546, 'gt': 143504, 'gw': 143585, 'gy': 143553, 'hn': 143510, 'hk': 143463, 'hu': 143482, 'is': 143558, 'in': 143467, 'id': 143476, 'ie': 143449, 'il': 143491, 'it': 143450, 'jm': 143511, 'jp': 143462, 'jo': 143528, 'kz': 143517, 'ke': 143529, 'kr': 143466, 'kw': 143493, 'kg': 143586, 'la': 143587, 'lv': 143519, 'lb': 143497, 'lr': 143588, 'lt': 143520, 'lu': 143451, 'mo': 143515, 'mg': 143531, 'mw': 143589, 'my': 143473, 'ml': 143532, 'mt': 143521, 'mr': 143590, 'mu': 143533, 'mx': 143468, 'fm': 143591, 'md': 143523, 'mn': 143592, 'ms': 143547, 'mz': 143593, 'na': 143594, 'np': 143484, 'nl': 143452, 'nz': 143461, 'ni': 143512, 'ne': 143534, 'ng': 143561, 'mk': 143530, 'no': 143457, 'om': 143562, 'pk': 143477, 'pw': 143595, 'pa': 143485, 'pg': 143597, 'py': 143513, 'pe': 143507, 'ph': 143474, 'pl': 143478, 'pt': 143453, 'qa': 143498, 'cg': 143582, 'ro': 143487, 'ru': 143469, 'sa': 143479, 'sn': 143535, 'sc': 143599, 'sl': 143600, 'sg': 143464, 'sk': 143496, 'si': 143499, 'sb': 143601, 'za': 143472, 'es': 143454, 'lk': 143486, 'kn': 143548, 'lc': 143549, 'vc': 143550, 'sr': 143554, 'se': 143456, 'ch': 143459, 'st': 143598, 'tw': 143470, 'tj': 143603, 'tz': 143572, 'th': 143475, 'tt': 143551, 'tn': 143536, 'tm': 143604, 'tc': 143552, 'tr': 143480, 'ae': 143481, 'ug': 143537, 'ua': 143492, 'gb': 143444, 'us': 143441, 'uy': 143514, 'uz': 143566, 've': 143502, 'vn': 143471, 'ye': 143571, 'zw': 143605 }
};
const TARGET_COUNTRIES_FOR_AVAILABILITY = [ // 【新增】上架查询的目标国家列表
    { code: 'us', name: '美国' }, { code: 'hk', name: '香港' }, { code: 'mo', name: '澳门' },
    { code: 'tw', name: '台湾' }, { code: 'jp', name: '日本' }, { code: 'kr', name: '韩国' },
    { code: 'gb', name: '英国' }, { code: 'ca', name: '加拿大' }, { code: 'au', name: '澳大利亚' },
    { code: 'sg', name: '新加坡' }, { code: 'tr', name: '土耳其' }, { code: 'ng', name: '尼日利亚' }
];

const parser = new xml2js.Parser({ explicitArray: false, trim: true });
const builder = new xml2js.Builder({ cdata: true, rootName: 'xml', headless: true });

// --- 主处理逻辑 ---

module.exports = async (req, res) => {
    if (req.method === 'GET') return handleVerification(req, res);
    if (req.method === 'POST') return handlePostRequest(req, res);
    res.status(200).send('');
};

function handleVerification(req, res) {
    try {
        const { signature, timestamp, nonce, echostr } = req.query;
        const params = [CONFIG.WECHAT_TOKEN, timestamp, nonce].sort();
        const str = params.join('');
        const hash = crypto.createHash('sha1').update(str).digest('hex');
        if (hash === signature) return res.status(200).send(echostr);
    } catch (e) { /* ignore */ }
    res.status(200).send('');
}

async function handlePostRequest(req, res) {
    let replyContent = '';
    let message = {};
    try {
        const rawBody = await getRawBody(req);
        const parsedXml = await parser.parseStringPromise(rawBody);
        message = parsedXml.xml;
        if (message.MsgType === 'event' && message.Event === 'subscribe') {
            // 【优化】更新欢迎语以匹配所有最终功能
            replyContent = `😘 终于等到你，果粉秘密基地~\n\n您可以这样向我提问：\n\n› <a href="weixin://bizmsgmenu?msgmenucontent=上架查询%20TikTok&msgmenuid=1">上架查询 TikTok</a>\n查询App全球上架情况\n\n› <a href="weixin://bizmsgmenu?msgmenucontent=价格%20Procreate%20美国&msgmenuid=2">价格 Procreate 美国</a>\n智能查询App价格\n\n› <a href="weixin://bizmsgmenu?msgmenucontent=切换%20日本&msgmenuid=3">切换 日本</a>\n一键切换商店地区\n\n更多功能(如查榜单、取图标)请戳底部菜单栏了解~`;
        }
        else if (message.MsgType === 'text') {
            const content = message.Content.trim();
            const chartMatch = content.match(/^(.*?)(免费榜|付费榜)$/);
            const priceMatch = content.match(/^价格\s+(.+?)\s+([a-zA-Z\u4e00-\u9fa5]+)$/i);
            const switchRegionMatch = content.match(/^(切换|地区)\s+([a-zA-Z\u4e00-\u9fa5]+)$/i);

            if (chartMatch && isSupportedRegion(chartMatch[1])) {
                replyContent = await handleChartQuery(chartMatch[1], chartMatch[2]);
            } else if (priceMatch && isSupportedRegion(priceMatch[2])) {
                replyContent = await handlePriceQuery(priceMatch[1].trim(), priceMatch[2]);
            } else if (switchRegionMatch && isSupportedRegion(switchRegionMatch[2])) {
                replyContent = handleRegionSwitch(switchRegionMatch[2].trim());
            // 【移植】新增“上架查询”功能的触发逻辑
            } else if (content.startsWith('上架查询 ')) {
                const appName = content.substring(5).trim();
                if (appName) {
                    replyContent = await handleAvailabilityQuery(appName);
                }
            // 【移植】新增“图标”功能的触发逻辑
            } else if (content.startsWith('图标 ')) {
                const appName = content.substring(3).trim();
                if (appName) {
                    replyContent = await lookupAppIcon(appName);
                }
            }
        }
    } catch (error) {
        console.error("Error processing POST:", error);
    }
    
    if (replyContent) {
        const replyXml = builder.buildObject({ ToUserName: message.FromUserName, FromUserName: message.ToUserName, CreateTime: Math.floor(Date.now() / 1000), MsgType: 'text', Content: replyContent });
        return res.setHeader('Content-Type', 'application/xml').status(200).send(replyXml);
    }
    return res.status(200).send('');
}

// --- 辅助及核心功能函数 ---

function getRawBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk.toString('utf-8'));
        req.on('end', () => resolve(body));
        req.on('error', err => reject(err));
    });
}

function getCountryCode(identifier) {
    const key = identifier.trim().toLowerCase();
    if (CONFIG.ALL_SUPPORTED_REGIONS[identifier]) return CONFIG.ALL_SUPPORTED_REGIONS[identifier];
    if (/^[a-z]{2}$/i.test(key)) {
        for (const name in CONFIG.ALL_SUPPORTED_REGIONS) {
            if (CONFIG.ALL_SUPPORTED_REGIONS[name] === key) return key;
        }
    }
    return '';
}

function isSupportedRegion(identifier) {
    return !!getCountryCode(identifier);
}

function getFormattedTime() {
    const now = new Date();
    const beijingTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));
    const year = beijingTime.getFullYear();
    const month = String(beijingTime.getMonth() + 1).padStart(2, '0');
    const day = String(beijingTime.getDate()).padStart(2, '0');
    const hours = String(beijingTime.getHours()).padStart(2, '0');
    const minutes = String(beijingTime.getMinutes()).padStart(2, '0');
    return `${String(year).slice(-2)}/${month}/${day} ${hours}:${minutes}`;
}

async function handleChartQuery(regionName, chartType) {
    const regionCode = getCountryCode(regionName);
    if (!regionCode) return '不支持的地区或格式错误。';
    const type = chartType === '免费榜' ? 'top-free' : 'top-paid';
    const url = `https://rss.marketingtools.apple.com/api/v2/${regionCode}/apps/${type}/10/apps.json`;
    try {
        const response = await axios.get(url);
        const apps = response.data.feed.results;
        let resultText = `${regionName}${chartType}\n${getFormattedTime()}\n\n`;
        apps.forEach((app, index) => {
            resultText += `${index + 1}、<a href="${app.url}">${app.name}</a>\n`;
        });
        resultText += `\n数据来源 Apple 官方`;
        return resultText;
    } catch (e) { return '获取榜单失败，请稍后再试。'; } 
}

async function handlePriceQuery(appName, regionName) {
    const code = getCountryCode(regionName);
    if (!code) return '不支持的地区或格式错误。';
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(appName)}&entity=software&country=${code}&limit=20`;

    try {
        const response = await axios.get(url);
        const results = response.data.results || [];
        if (!results.length) return `在${regionName}未找到“${appName}”。`;

        const normalize = s => s.trim().toLowerCase().replace(/[\s\-_：:，,\.！!？?]/g, '');
        const normalizedAppName = normalize(appName);
        
        const scored = results.map(r => {
            const nameScore = stringSimilarity.compareTwoStrings(normalize(r.trackName), normalizedAppName);
            const popularityScore = Math.log10((r.userRatingCount || 1) + 1);
            return { app: r, totalScore: nameScore * 0.8 + (popularityScore / 10) * 0.2 }; // 加大名称权重
        });
        scored.sort((a, b) => b.totalScore - a.totalScore);
        
        const bestMatch = scored[0].app;
        const price = bestMatch.price === 0 ? '免费' : `${bestMatch.currency} ${bestMatch.price.toFixed(2)}`;
        const link = `<a href="${bestMatch.trackViewUrl}">${bestMatch.trackName}</a>`;
        
        return `您搜索的“${appName}”最匹配的结果是：\n\n${link}\n\n地区：${regionName}\n价格：${price}\n时间：${getFormattedTime().split(' ')[0]}\n\n数据来自 Apple 官方`;
    } catch {
        return '查询价格失败，请稍后再试。';
    }
}

function handleRegionSwitch(regionName) {
    const regionCode = getCountryCode(regionName);
    const dsf = CONFIG.DSF_MAP[regionCode];

    if (!regionCode || !dsf) return '不支持的地区或格式错误。';
    const stableAppId = '375380948'; // 使用一个稳定的App ID, 如微信
    const redirectUrl = `/WebObjects/MZStore.woa/wa/viewSoftware?mt=8&id=${stableAppId}`;
    const fullUrl = `https://itunes.apple.com/WebObjects/MZStore.woa/wa/resetAndRedirect?dsf=${dsf}&cc=${regionCode}&url=${encodeURIComponent(redirectUrl)}`;

    return `<a href="${fullUrl}">✅ 点击切换到【${regionName}】商店</a>`;
}

// --- 【移植】从旧代码移植过来的功能函数 ---

async function handleAvailabilityQuery(appName) {
    const appInfo = await findAppUniversalId(appName);
    if (!appInfo) {
        return `未能在主要地区（美国、中国）的应用商店中找到「${appName}」，请检查应用名称是否正确。`;
    }
    const availableCountries = await checkAvailability(appInfo.trackId);
    let replyText = `查询应用：「${appInfo.trackName}」\n\n`;
    if (availableCountries.length > 0) {
        replyText += `✅ 可下载地区：\n${availableCountries.join(', ')}`;
    } else {
        replyText += `在我们查询的12个热门国家/地区中，均未发现此应用上架。`;
    }
    return replyText + `\n\n数据来自 Apple 官方`;
}

async function findAppUniversalId(appName) {
    const usSearchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(appName)}&country=us&entity=software&limit=1`;
    try {
        const response = await axios.get(usSearchUrl, { timeout: 4000 });
        if (response.data.resultCount > 0) {
            return { trackId: response.data.results[0].trackId, trackName: response.data.results[0].trackName };
        }
    } catch (error) { console.warn('Warning: Error searching in US store:', error.message); }
    const cnSearchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(appName)}&country=cn&entity=software&limit=1`;
    try {
        const response = await axios.get(cnSearchUrl, { timeout: 4000 });
        if (response.data.resultCount > 0) {
            return { trackId: response.data.results[0].trackId, trackName: response.data.results[0].trackName };
        }
    } catch (error) { console.warn('Warning: Error searching in CN store:', error.message); }
    return null;
}

async function checkAvailability(trackId) {
    const checkPromises = TARGET_COUNTRIES_FOR_AVAILABILITY.map(country => {
        const lookupUrl = `https://itunes.apple.com/lookup?id=${trackId}&country=${country.code}`;
        return axios.get(lookupUrl, { timeout: 4000 });
    });
    const availableCountries = [];
    const results = await Promise.allSettled(checkPromises);
    results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.data.resultCount > 0) {
            availableCountries.push(TARGET_COUNTRIES_FOR_AVAILABILITY[index].name);
        }
    });
    return availableCountries;
}

async function lookupAppIcon(appName) {
    try {
        const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(appName)}&country=us&entity=software&limit=1`;
        const response = await axios.get(searchUrl, { timeout: 8000 });
        const data = response.data;
        if (data.resultCount === 0) return '未找到相关应用，请检查名称。';
        const app = data.results[0];
        const highResIconUrl = (app.artworkUrl100 || '').replace('100x100bb.jpg', '1024x1024bb.jpg');
        if (!highResIconUrl) return '抱歉，未能获取到该应用的高清图标。';
        return `您搜索的“${appName}”最匹配的结果是：\n\n「${app.trackName}」\n\n这是它的高清图标链接(可复制到浏览器打开)：\n${highResIconUrl}\n\n数据来自 Apple 官方`;
    } catch (error) {
        console.error("Error in lookupAppIcon:", error.message);
        return '查询应用图标失败，请稍后再试。';
    }
}
