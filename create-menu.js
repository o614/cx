/**
 * WeChat Official Account - Custom Menu Creation Script
 * 运行此脚本来创建或更新您的公众号自定义菜单。
 * Run this script using: node create-menu.js
 */

const axios = require('axios');

// =======================================================================
// 1. 在这里填入您的凭证
// =======================================================================
const APP_ID = '在这里填入您的AppID';
const APP_SECRET = '在这里填入您的AppSecret';


// =======================================================================
// 2. 在这里定义您的菜单结构
// =======================================================================
const menuConfig = {
    "button": [
        {
            "name": "教程资讯",
            "sub_button": [
                {
                    "type": "click",
                    "name": "最新教程",
                    "key": "最新教程"
                },
                {
                    "type": "click",
                    "name": "付款方式",
                    "key": "付款方式"
                }
            ]
        },
        {
            "name": "查询工具",
            "sub_button": [
                {
                    "type": "click",
                    "name": "榜单查询",
                    "key": "榜单查询" // 这个key会触发您代码里的关键词回复
                },
                {
                    "type": "click",
                    "name": "订阅查询",
                    "key": "订阅查询"
                },
                {
                    "type": "view",
                    "name": "访问官网", // 示例：添加一个跳转网页的按钮
                    "url": "https://apid.me/" 
                }
            ]
        },
        {
            "type": "click",
            "name": "人工服务",
            "key": "人工服务"
        }
    ]
};


// =======================================================================
// 3. 主程序逻辑 (无需修改)
// =======================================================================
async function main() {
    // 检查凭证是否已填写
    if (APP_ID === '在这里填入您的AppID' || APP_SECRET === '在这里填入您的AppSecret') {
        console.error('❌ 错误：请先在脚本顶部填写您的 AppID 和 AppSecret！');
        return;
    }

    try {
        // 第一步：获取 access_token
        console.log('正在获取 access_token...');
        const tokenUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APP_ID}&secret=${APP_SECRET}`;
        const tokenResponse = await axios.get(tokenUrl);

        if (tokenResponse.data.errcode) {
            console.error('❌ 获取 access_token 失败:', tokenResponse.data);
            return;
        }

        const accessToken = tokenResponse.data.access_token;
        console.log('✅ access_token 获取成功!');

        // 第二步：创建菜单
        console.log('正在创建菜单...');
        const menuUrl = `https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${accessToken}`;
        const menuResponse = await axios.post(menuUrl, menuConfig);

        if (menuResponse.data.errcode === 0) {
            console.log('✅✅✅ 恭喜！自定义菜单创建成功！');
            console.log('请注意：菜单更新可能需要几分钟才能在您的微信客户端上生效。您可以尝试重新关注公众号来立即刷新。');
        } else {
            console.error('❌ 创建菜单失败:', menuResponse.data);
        }

    } catch (error) {
        console.error('❌ 操作过程中发生意外错误:', error.message);
    }
}

// 运行主程序
main();
