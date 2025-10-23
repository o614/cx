# 不要艾特我 - 微信公众号 App Store 助手后端

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📖 项目简介 (Introduction)

本项目是一个基于 Vercel Serverless Function 的 Node.js 后端服务，旨在为微信公众号（特别是个人订阅号）提供一系列与 Apple App Store 相关的信息查询功能。它可以帮助用户快速查询 App 的全球上架情况、价格、官方榜单，获取高清图标，甚至一键切换 App Store 地区。

**核心目标：** 打造一个轻量、易部署、功能实用的果粉 App Store 探索助手。

## ✨ 主要功能 (Features)

目前已实现以下核心功能，用户通过向公众号发送特定指令即可触发：

* **App 全球上架查询**: 查询 App 在全球多个热门国家/地区的上架情况。
    * 指令: `查询 [App名称]` (例如: `查询 TikTok`)
* **智能 App 价格查询**: 查询 App 在指定国家的价格。
    * 简单指令 (默认美国): `价格 [App名称]` (例如: `价格 Procreate`)
    * 高级指令 (指定国家): `价格 [App名称] [国家]` (例如: `价格 Procreate 日本`)
    * *特点：利用名称相似度和热度进行智能匹配；默认查询结果包含查询其他地区的指引。*
* **交互式 App Store 榜单**: 查看指定国家的 Top 10 免费或付费榜单。
    * 指令: `榜单 [国家]` (例如: `榜单 美国`)
    * *特点：默认返回免费榜，结果末尾包含切换至付费榜的交互链接。*
* **一键切换商店地区**: 生成特殊链接，点击后可快速切换手机 App Store 的地区。
    * 指令: `切换 [国家]` 或 `地区 [国家]` (例如: `切换 日本`)
    * *特点：包含“仅浏览”提示，并提供切换回中国大陆商店的选项。*
* **获取 App 高清图标**: 返回 App 的官方商店页面链接及 1024px 高清图标链接。
    * 指令: `图标 [App名称]` (例如: `图标 QQ`)

## 🚀 技术栈 (Technology Stack)

* **运行时**: Node.js
* **部署平台**: Vercel Serverless Functions
* **主要依赖**:
    * `axios`: 用于发起 HTTP 请求 (查询 Apple API)
    * `xml2js`: 用于解析和生成微信消息的 XML 格式
    * `string-similarity`: 用于 App 名称的模糊匹配

## 🛠️ 快速开始 (Getting Started)

### 先决条件 (Prerequisites)

1.  **Node.js**: 确保您的开发环境已安装 Node.js (推荐 v18 或更高版本)。
2.  **Vercel 账号**: 您需要一个 Vercel 账号来部署服务。
3.  **微信公众号**: 公众号后台获取开发者 ID (AppID) 和开发者密码 (AppSecret)，虽然本项目代码本身不直接使用它们，但微信开发通常需要。

### 安装与配置 (Installation & Configuration)

1.  **克隆仓库**:
    ```bash
    git clone [您的仓库地址]
    cd [项目目录]
    ```
2.  **安装依赖**:
    ```bash
    npm install
    # 或者 yarn install
    ```
3.  **配置环境变量 (Vercel)**:
    * 登录您的 Vercel 账号。
    * 创建或选择您的 Vercel 项目。
    * 进入项目的 `Settings` -> `Environment Variables`。
    * 添加一个环境变量：
        * **Name**: `WECHAT_TOKEN`
        * **Value**: `[您自定义的Token字符串]` (这个 Token 需要与您在微信公众号后台服务器配置中填写的 Token **完全一致**，用于服务器验证)。
        * **注意**: 确保该变量在 **Production**, **Preview**, 和 **Development** 环境下都可用。

### 部署 (Deployment)

推荐使用 Vercel 的 Git 集成进行部署：

1.  将您的代码推送到 GitHub/GitLab/Bitbucket 仓库。
2.  在 Vercel 上将该仓库导入为新项目。
3.  Vercel 会自动识别 Node.js 环境并进行部署。确保 Vercel 的部署设置指向了正确的代码目录和 Serverless Function 入口（通常 Vercel 会自动处理 `/api` 目录下的文件）。

或者，您也可以使用 Vercel CLI 手动部署：

```bash
npm install -g vercel
vercel login
vercel --prod
----------------------------------------------------------------------------------------------------------------------------------------------
### 微信公众号后台配置

1.  登录微信公众平台。
2.  进入 `开发` -> `基本配置`。
3.  **服务器配置**:
    * **URL**: 填写您的 Vercel 部署地址，格式通常为 `https://[您的Vercel域名].vercel.app/api/wechat` (确保路径是 `/api/wechat.js` 文件对应的 Serverless Function 路径)。
    * **Token**: 填写您在 Vercel 环境变量中设置的 `WECHAT_TOKEN` 值。
    * **EncodingAESKey**: 可以随机生成，本项目未使用消息加密。
    * **消息加解密方式**: 选择 “明文模式”。
4.  点击 “提交” 并 **启用** 服务器配置。

## 💬 使用方法 (Usage)

用户只需在您的公众号对话框中发送对应的指令即可，例如：

* 发送 `价格 Procreate` 查询 Procreate 的美国区价格。
* 发送 `查询 TikTok` 查询 TikTok 的全球上架情况。
* 发送 `榜单 英国` 查看英国区 App Store 免费榜。
* 发送 `切换 日本` 获取切换到日本区商店的链接。
* 发送 `图标 微信` 获取微信的高清图标。

## 🤝 贡献指南 (Contributing)

欢迎对本项目做出贡献！您可以通过以下方式参与：

1.  **报告 Bug**: 发现问题？请通过 GitHub Issues 提交详细描述。
2.  **功能建议**: 有好的想法？欢迎在 GitHub Issues 中提出。
3.  **提交代码**:
    * Fork 本仓库。
    * 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)。
    * 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)。
    * 将分支推送到您的 Fork (`git push origin feature/AmazingFeature`)。
    * 提交 Pull Request。

## 📄 开源许可 (License)

本项目采用 [MIT](https://opensource.org/licenses/MIT) 许可。详情请见 `LICENSE` 文件。

## 🙏 致谢 (Acknowledgements)

* 感谢 Apple 提供的 iTunes Search API 和 RSS Feed API。
* 感谢 Vercel 提供的便捷的 Serverless 部署平台。
* 感谢 `axios`, `xml2js`, `string-similarity` 等优秀的开源库。
