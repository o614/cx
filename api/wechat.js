/**
 * WeChat Official Account Serverless Function
 * v8.1 — 更稳的网络层、修复地区匹配、价格查询轻量匹配、统一回复构建
 */
const crypto = require('crypto');
const axios = require('axios');
const { Parser, Builder } = require('xml2js');

const CONFIG = {
  WECHAT_TOKEN: process.env.WECHAT_TOKEN,
  ALL_SUPPORTED_REGIONS: { '阿富汗':'af','中国':'cn','阿尔巴尼亚':'al','阿尔及利亚':'dz','安哥拉':'ao','安圭拉':'ai','安提瓜和巴布达':'ag','阿根廷':'ar','亚美尼亚':'am','澳大利亚':'au','奥地利':'at','阿塞拜疆':'az','巴哈马':'bs','巴林':'bh','巴巴多斯':'bb','白俄罗斯':'by','比利时':'be','伯利兹':'bz','贝宁':'bj','百慕大':'bm','不丹':'bt','玻利维亚':'bo','波斯尼亚和黑塞哥维那':'ba','博茨瓦纳':'bw','巴西':'br','英属维尔京群岛':'vg','文莱':'bn','保加利亚':'bg','布基纳法索':'bf','柬埔寨':'kh','喀麦隆':'cm','加拿大':'ca','佛得角':'cv','开曼群岛':'ky','乍得':'td','智利':'cl','哥伦比亚':'co','哥斯达黎加':'cr','克罗地亚':'hr','塞浦路斯':'cy','捷克':'cz','科特迪瓦':'ci','刚果民主共和国':'cd','丹麦':'dk','多米尼克':'dm','多米尼加':'do','厄瓜多尔':'ec','埃及':'eg','萨尔瓦多':'sv','爱沙尼亚':'ee','史瓦帝尼':'sz','斐济':'fj','芬兰':'fi','法国':'fr','加蓬':'ga','冈比亚':'gm','格鲁吉亚':'ge','德国':'de','加纳':'gh','希腊':'gr','格林纳达':'gd','危地马拉':'gt','几内亚比绍':'gw','圭那亚':'gy','洪都拉斯':'hn','香港':'hk','匈牙利':'hu','冰岛':'is','印度':'in','印度尼西亚':'id','伊拉克':'iq','爱尔兰':'ie','以色列':'il','意大利':'it','牙买加':'jm','日本':'jp','约旦':'jo','哈萨克斯坦':'kz','肯尼亚':'ke','韩国':'kr','科索沃':'xk','科威特':'kw','吉尔吉斯斯坦':'kg','老挝':'la','拉脱维亚':'lv','黎巴嫩':'lb','利比里亚':'lr','利比亚':'ly','立陶宛':'lt','卢森堡':'lu','澳门':'mo','马达加斯加':'mg','马拉维':'mw','马来西亚':'my','马尔代夫':'mv','马里':'ml','马耳他':'mt','毛里塔尼亚':'mr','毛里求斯':'mu','墨西哥':'mx','密克罗尼西亚':'fm','摩尔多瓦':'md','蒙古':'mn','黑山':'me','蒙特塞拉特':'ms','摩洛哥':'ma','莫桑比克':'mz','缅甸':'mm','纳米比亚':'na','瑙鲁':'nr','尼泊尔':'np','荷兰':'nl','新西兰':'nz','尼加拉瓜':'ni','尼日尔':'ne','尼日利亚':'ng','北马其顿':'mk','挪威':'no','阿曼':'om','巴基斯坦':'pk','帕劳':'pw','巴拿马':'pa','巴布亚新几内亚':'pg','巴拉圭':'py','秘鲁':'pe','菲律宾':'ph','波兰':'pl','葡萄牙':'pt','卡塔尔':'qa','刚果共和国':'cg','罗马尼亚':'ro','俄罗斯':'ru','卢旺达':'rw','沙特阿拉伯':'sa','塞内加尔':'sn','塞尔维亚':'rs','塞舌尔':'sc','塞拉利昂':'sl','新加坡':'sg','斯洛伐克':'sk','斯洛文尼亚':'si','所罗门群岛':'sb','南非':'za','西班牙':'es','斯里兰卡':'lk','圣基茨和尼维斯':'kn','圣卢西亚':'lc','圣文森特和格林纳丁斯':'vc','苏里南':'sr','瑞典':'se','瑞士':'ch','圣多美和普林西比':'st','台湾':'tw','塔吉克斯坦':'tj','坦桑尼亚':'tz','泰国':'th','汤加':'to','特立尼达和多巴哥':'tt','突尼斯':'tn','土库曼斯坦':'tm','特克斯和凯科斯群岛':'tc','土耳其':'tr','阿联酋':'ae','乌干达':'ug','乌克兰':'ua','英国':'gb','美国':'us','乌拉圭':'uy','乌兹别克斯坦':'uz','瓦努阿图':'vu','委内瑞拉':'ve','越南':'vn','也门':'ye','赞比亚':'zm','津巴布韦':'zw' },
  DSF_MAP: { 'al':143575,'cn':143465,'dz':143563,'ao':143564,'ai':143538,'ag':143540,'ar':143505,'am':143524,'au':143460,'at':143445,'az':143568,'bs':143539,'bh':143559,'bb':143541,'by':143565,'be':143446,'bz':143555,'bj':143576,'bm':143542,'bt':143577,'bo':143556,'bw':143525,'br':143503,'vg':143543,'bn':143560,'bg':143526,'bf':143578,'kh':143579,'ca':143455,'cv':143580,'ky':143544,'td':143581,'cl':143483,'co':143501,'cr':143495,'hr':143494,'cy':143557,'cz':143489,'dk':143458,'dm':143545,'do':143508,'ec':143509,'eg':143516,'sv':143506,'ee':143518,'sz':143602,'fj':143583,'fi':143447,'fr':143442,'gm':143584,'de':143443,'gh':143573,'gr':143448,'gd':143546,'gt':143504,'gw':143585,'gy':143553,'hn':143510,'hk':143463,'hu':143482,'is':143558,'in':143467,'id':143476,'ie':143449,'il':143491,'it':143450,'jm':143511,'jp':143462,'jo':143528,'kz':143517,'ke':143529,'kr':143466,'kw':143493,'kg':143586,'la':143587,'lv':143519,'lb':143497,'lr':143588,'lt':143520,'lu':143551,'mo':143515,'mg':143531,'mw':143589,'my':143473,'ml':143532,'mt':143521,'mr':143590,'mu':143533,'mx':143468,'fm':143591,'md':143523,'mn':143592,'ms':143547,'mz':143593,'na':143594,'np':143484,'nl':143452,'nz':143461,'ni':143512,'ne':143534,'ng':143561,'mk':143530,'no':143457,'om':143562,'pk':143477,'pw':143595,'pa':143485,'pg':143597,'py':143513,'pe':143507,'ph':143474,'pl':143478,'pt':143453,'qa':143498,'cg':143582,'ro':143487,'ru':143469,'sa':143479,'sn':143535,'sc':143599,'sl':143600,'sg':143464,'sk':143496,'si':143499,'sb':143601,'za':143472,'es':143454,'lk':143486,'kn':143548,'lc':143549,'vc':143550,'sr':143554,'se':143456,'ch':143459,'st':143598,'tw':143470,'tj':143603,'tz':143572,'th':143475,'tt':143551,'tn':143536,'tm':143604,'tc':143552,'tr':143480,'ae':143481,'ug':143537,'ua':143492,'gb':143444,'us':143441,'uy':143514,'uz':143566,'ve':143502,'vn':143471,'ye':143571,'zw':143605 },
  BLOCKED_APP_IDS: new Set(['932747118']) // 在此添加需要屏蔽链接的 App ID（字符串）
};

const TARGET_COUNTRIES_FOR_AVAILABILITY = [
  { code: 'us', name: '美国' }, { code: 'hk', name: '香港' }, { code: 'mo', name: '澳门' },
  { code: 'tw', name: '台湾' }, { code: 'jp', name: '日本' }, { code: 'kr', name: '韩国' },
  { code: 'gb', name: '英国' }, { code: 'ca', name: '加拿大' }, { code: 'au', name: '澳大利亚' },
  { code: 'sg', name: '新加坡' }, { code: 'tr', name: '土耳其' }, { code: 'ng', name: '尼日利亚' }
];

const parser = new Parser({ explicitArray: false, trim: true });
const builder = new Builder({ cdata: true, rootName: 'xml', headless: true });

const HTTP = axios.create({
  timeout: 6000,
  headers: { 'user-agent': 'Mozilla/5.0 (Serverless-WeChatBot)' }
});

const SOURCE_NOTE = '*数据来源 Apple 官方*';

module.exports = async (req, res) => {
  if (req.method === 'GET') return handleVerification(req, res);
  if (req.method === 'POST') return handlePostRequest(req, res);
  res.status(200).send('');
};

function handleVerification(req, res) {
  try {
    const { signature, timestamp, nonce, echostr } = req.query;
    const params = [CONFIG.WECHAT_TOKEN || '', timestamp, nonce].sort();
    const hash = crypto.createHash('sha1').update(params.join('')).digest('hex');
    if (hash === signature) return res.status(200).send(echostr);
  } catch { /* noop */ }
  res.status(200).send('');
}

async function handlePostRequest(req, res) {
  let replyContent = '';
  let message = {};
  try {
    const rawBody = await getRawBody(req);
    const parsedXml = await parser.parseStringPromise(rawBody);
    message = parsedXml.xml || {};

    if (message.MsgType === 'event' && message.Event === 'subscribe') {
      replyContent =
        `恭喜！你发现了果粉秘密基地\n\n` +
        `› <a href="weixin://bizmsgmenu?msgmenucontent=付款方式&msgmenuid=付款方式">付款方式</a>\n获取地址信息\n\n` +
        `› <a href="weixin://bizmsgmenu?msgmenucontent=查询%20TikTok&msgmenuid=1">查询 TikTok</a>\n全球上架查询\n\n` +
        `› <a href="weixin://bizmsgmenu?msgmenucontent=榜单%20美国&msgmenuid=3">榜单 美国</a>\n获取地区榜单\n\n` +
        `› <a href="weixin://bizmsgmenu?msgmenucontent=价格%20YouTube&msgmenuid=2">价格 YouTube</a>\n查询应用价格\n\n` +
        `› <a href="weixin://bizmsgmenu?msgmenucontent=切换%20美国&msgmenuid=4">切换 美国</a>\n切换商店地区\n\n` +
        `› <a href="weixin://bizmsgmenu?msgmenucontent=图标%20QQ&msgmenuid=5">图标 QQ</a>\n获取高清图标\n\n更多服务请戳底部菜单栏了解`;
    } else if (message.MsgType === 'text' && typeof message.Content === 'string') {
      const content = message.Content.trim();
      const chartV2Match = content.match(/^榜单\s+(.+)$/i);
      const chartMatch = content.match(/^(.*?)(免费榜|付费榜)$/);
      const priceMatchAdvanced = content.match(/^价格\s+(.+?)\s+([a-zA-Z\u4e00-\u9fa5]+)$/i);
      const priceMatchSimple = content.match(/^价格\s+(.+)$/i);
      const switchRegionMatch = content.match(/^(切换|地区)\s+([a-zA-Z\u4e00-\u9fa5]+)$/i);
      const availabilityMatch = content.match(/^查询\s+(.+)$/i);

      if (chartV2Match && isSupportedRegion(chartV2Match[1])) {
        replyContent = await handleChartQuery(chartV2Match[1].trim(), '免费榜');
      } else if (chartMatch && isSupportedRegion(chartMatch[1])) {
        replyContent = await handleChartQuery(chartMatch[1].trim(), chartMatch[2]);
      } else if (priceMatchAdvanced && isSupportedRegion(priceMatchAdvanced[2])) {
        replyContent = await handlePriceQuery(priceMatchAdvanced[1].trim(), priceMatchAdvanced[2].trim(), false);
      } else if (priceMatchSimple) {
        replyContent = await handlePriceQuery(priceMatchSimple[1].trim(), '美国', true);
      } else if (switchRegionMatch && isSupportedRegion(switchRegionMatch[2])) {
        replyContent = handleRegionSwitch(switchRegionMatch[2].trim());
      } else if (availabilityMatch) {
        replyContent = await handleAvailabilityQuery(availabilityMatch[1].trim());
      } else if (content.startsWith('图标 ')) {
        const appName = content.substring(3).trim();
        if (appName) replyContent = await lookupAppIcon(appName);
      }
    }
  } catch (error) {
    console.error('Error processing POST:', error.message || error);
  }

  if (replyContent) {
    const xml = buildTextReply(message.FromUserName, message.ToUserName, replyContent);
    return res.setHeader('Content-Type', 'application/xml').status(200).send(xml);
  }
  return res.status(200).send('');
}

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => (body += chunk.toString('utf-8')));
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function getCountryCode(identifier) {
  const trimmed = String(identifier || '').trim();
  const key = trimmed.toLowerCase();
  if (CONFIG.ALL_SUPPORTED_REGIONS[trimmed]) return CONFIG.ALL_SUPPORTED_REGIONS[trimmed];
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
  const bj = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
  const yyyy = String(bj.getFullYear());
  const mm = String(bj.getMonth() + 1).padStart(2, '0');
  const dd = String(bj.getDate()).padStart(2, '0');
  const hh = String(bj.getHours()).padStart(2, '0');
  const mi = String(bj.getMinutes()).padStart(2, '0');
  return `${yyyy.slice(-2)}/${mm}/${dd} ${hh}:${mi}`;
}

function buildTextReply(toUser, fromUser, content) {
  const payload = {
    ToUserName: toUser,
    FromUserName: fromUser,
    CreateTime: Math.floor(Date.now() / 1000),
    MsgType: 'text',
    Content: content
  };
  return builder.buildObject(payload);
}

async function getJSON(url, { timeout = 6000, retries = 1 } = {}) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      const { data } = await HTTP.get(url, { timeout });
      return data;
    } catch (err) {
      lastErr = err;
      if (i < retries) await new Promise(r => setTimeout(r, 250 * Math.pow(2, i)));
    }
  }
  throw lastErr;
}

async function handleChartQuery(regionName, chartType) {
  const regionCode = getCountryCode(regionName);
  if (!regionCode) return '不支持的地区或格式错误。';

  const type = chartType === '免费榜' ? 'top-free' : 'top-paid';
  const url = `https://rss.marketingtools.apple.com/api/v2/${regionCode}/apps/${type}/10/apps.json`;

  try {
    const data = await getJSON(url);
    const apps = (data && data.feed && data.feed.results) || [];
    if (!apps.length) return '获取榜单失败，请稍后再试。';

    let resultText = `${regionName}${chartType}\n${getFormattedTime()}\n\n`;

    resultText += apps.map((app, idx) => {
      const appId = String(app.id || '');
      const appName = app.name || '未知应用';
      const appUrl = app.url;
      if (CONFIG.BLOCKED_APP_IDS.has(appId)) return `${idx + 1}、${appName}`;
      return appUrl ? `${idx + 1}、<a href="${appUrl}">${appName}</a>` : `${idx + 1}、${appName}`;
    }).join('\n');

    const toggleCmd = chartType === '免费榜' ? `${regionName}付费榜` : `${regionName}免费榜`;
    resultText += `\n› <a href="weixin://bizmsgmenu?msgmenucontent=${encodeURIComponent(toggleCmd)}&msgmenuid=${encodeURIComponent(toggleCmd)}">查看${chartType === '免费榜' ? '付费' : '免费'}榜单</a>`;
    resultText += `\n\n${SOURCE_NOTE}`;
    return resultText;
  } catch (e) {
    console.error('Error in handleChartQuery:', e.message || e);
    return '获取榜单失败，请稍后再试。';
  }
}

function pickBestMatch(query, results) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return results[0];

  // 完全相等（忽略大小写）
  const exact = results.find(r => String(r.trackName || '').toLowerCase() === q);
  if (exact) return exact;

  // 包含关系优先
  const contains = results.find(r => String(r.trackName || '').toLowerCase().includes(q));
  if (contains) return contains;

  return results[0];
}

function formatPrice(r) {
  if (r.formattedPrice) return r.formattedPrice.replace(/^Free$/i, '免费');
  if (typeof r.price === 'number') {
    return r.price === 0 ? '免费' : `${r.currency || ''} ${r.price.toFixed(2)}`.trim();
  }
  return '未知';
}

async function handlePriceQuery(appName, regionName, isDefaultSearch) {
  const code = getCountryCode(regionName);
  if (!code) return `不支持的地区或格式错误：${regionName}`;

  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(appName)}&entity=software&country=${code}&limit=5`;
  try {
    const data = await getJSON(url);
    const results = data.results || [];
    if (!results.length) return `在${regionName}未找到“${appName}”。`;

    const best = pickBestMatch(appName, results);
    const link = `<a href="${best.trackViewUrl}">${best.trackName}</a>`;
    const priceText = formatPrice(best);

    let replyText = `您搜索的“${appName}”最匹配的结果是：\n\n${link}\n\n地区：${regionName}\n价格：${priceText}\n时间：${getFormattedTime()}`;
    if (isDefaultSearch) replyText += `\n\n想查其他地区？试试发送：\n价格 ${appName} 日本`;
    return replyText + `\n\n${SOURCE_NOTE}`;
  } catch {
    return '查询价格失败，请稍后再试。';
  }
}

function handleRegionSwitch(regionName) {
  const regionCode = getCountryCode(regionName);
  const dsf = CONFIG.DSF_MAP[regionCode];
  if (!regionCode || !dsf) return '不支持的地区或格式错误。';

  const stableAppId = '375380948';
  const redirect = `/WebObjects/MZStore.woa/wa/viewSoftware?mt=8&id=${stableAppId}`;
  const fullUrl = `https://itunes.apple.com/WebObjects/MZStore.woa/wa/resetAndRedirect?dsf=${dsf}&cc=${regionCode}&url=${encodeURIComponent(redirect)}`;

  const cnCode = 'cn';
  const cnDsf = CONFIG.DSF_MAP[cnCode];
  const cnUrl = `https://itunes.apple.com/WebObjects/MZStore.woa/wa/resetAndRedirect?dsf=${cnDsf}&cc=${cnCode}&url=${encodeURIComponent(redirect)}`;

  return `注意！仅浏览，需账号才能下载。\n\n<a href="${fullUrl}">› 点击切换至【${regionName}】 App Store</a>\n\n› 点此切换至 <a href="${cnUrl}">【大陆】</a> App Store\n\n*出现“无法连接”后将自动跳转*`;
}

async function handleAvailabilityQuery(appName) {
  const appInfo = await findAppUniversalId(appName);
  if (!appInfo) {
    return `未能在主要地区（美国、中国）的应用商店中找到「${appName}」，请检查应用名称是否正确。`;
  }
  const availableCountries = await checkAvailability(appInfo.trackId);
  let replyText = `您查询的“${appName}”最匹配的结果是：\n\n${appInfo.trackName}\n\n`;
  replyText += availableCountries.length
    ? `可下载地区：\n${availableCountries.join(', ')}`
    : `在我们查询的12个热门国家/地区中，均未发现此应用上架。`;
  return replyText + `\n\n${SOURCE_NOTE}`;
}

async function findAppUniversalId(appName) {
  const endpoints = [
    `https://itunes.apple.com/search?term=${encodeURIComponent(appName)}&country=us&entity=software&limit=1`,
    `https://itunes.apple.com/search?term=${encodeURIComponent(appName)}&country=cn&entity=software&limit=1`
  ];
  for (const url of endpoints) {
    try {
      const data = await getJSON(url, { timeout: 4000 });
      if (data.resultCount > 0) {
        const app = data.results[0];
        return { trackId: app.trackId, trackName: app.trackName, trackViewUrl: app.trackViewUrl };
      }
    } catch (e) {
      console.warn('Warning: search error:', e.message || e);
    }
  }
  return null;
}

async function checkAvailability(trackId) {
  const promises = TARGET_COUNTRIES_FOR_AVAILABILITY.map(c =>
    getJSON(`https://itunes.apple.com/lookup?id=${trackId}&country=${c.code}`, { timeout: 4000 })
  );
  const settled = await Promise.allSettled(promises);
  const available = [];
  settled.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value && r.value.resultCount > 0) {
      available.push(TARGET_COUNTRIES_FOR_AVAILABILITY[i].name);
    }
  });
  return available;
}

async function lookupAppIcon(appName) {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(appName)}&country=us&entity=software&limit=1`;
    const data = await getJSON(url, { timeout: 8000 });
    if (data.resultCount === 0) return '未找到相关应用，请检查名称。';

    const app = data.results[0];
    const highRes = app.artworkUrl512 || String(app.artworkUrl100 || '').replace('100x100bb.jpg', '1024x1024bb.jpg');
    if (!highRes) return '抱歉，未能获取到该应用的高清图标。';

    const appLink = `<a href="${app.trackViewUrl}">${app.trackName}</a>`;
    return `您搜索的“${appName}”最匹配的结果是：\n\n${appLink}\n\n这是它的高清图标链接：\n${highRes}\n\n${SOURCE_NOTE}`;
  } catch (e) {
    console.error('Error in lookupAppIcon:', e.message || e);
    return '查询应用图标失败，请稍后再试。';
  }
}


