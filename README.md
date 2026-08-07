# 云端小棉袄

给妈妈用的「家庭陪伴 + 纪录」**原生微信小程序**。

打开不是功能宫格，而是写实照片风的「虚拟女儿」；能翻看**妈妈的心意**、语音留言、带图小纸条；首页还有天气穿衣关心。

> 技术选型已固定：**原生微信小程序 + 微信云开发**。不要改成 uni-app / Taro。

---

## 快速开始（演示模式优先）

1. 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)（Apple 芯片选 **ARM** 版）
2. 导入本项目根目录
3. AppID：测试号即可
4. 编译预览：默认 **演示模式开启**，无需云开发也能完整演示

演示话术：[`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md)  
云开发开通：[`docs/CLOUD_SETUP.md`](docs/CLOUD_SETUP.md)

---

## 功能一览

| 页面 | 能力 |
|------|------|
| 陪陪我 | 写实角色换表情、天气+穿衣关心、长按问候、陪伴统计 |
| 时光轴 | 语音 / **妈妈的心意（双向）** / 带图纸条；Tab **未读角标** |
| 发布（女儿） | 记心意、发语音、写纸条（最多 3 图） |
| 我的 | 演示模式、大字体、身份、天气城市、邀请码 |

**产品叙事**：默认记录「妈妈 → 我」的支持（感恩）；也支持「我 → 妈妈」的回报。不是微信支付。

**明确不做**：妈妈录音/发帖、微信支付商户、AI 自由对话（每周 AI 润色短信仅作远期，见 CLOUD_SETUP）。

---

## 换上你自己的脸（路线 A）

覆盖 `miniprogram/assets/avatar/` 下 6 张图：

`idle` / `happy` / `miss` / `speak` / `serious` / `sleepy`

要求：同一发型衣服光线、半身构图；`speak` 做成微张嘴。详见该目录 README。

---

## 开通云开发并关演示

详见 [`docs/CLOUD_SETUP.md`](docs/CLOUD_SETUP.md)。摘要：

1. 开通云环境，改 `app.js` 的 `env`
2. 部署 `login` / `bindFamily` / `getWeather`
3. 建集合 + 配安全规则
4. 「我的」关闭演示模式

天气：可选配置和风 `QWEATHER_KEY`；不配也有温和假数据。

---

## 数据存在哪

| 模式 | 时光轴等内容 | 设置/未读 |
|------|----------------|-----------|
| 演示模式（默认） | `miniprogram/mock/data.js` | 本地 Storage |
| 关闭演示 + 已配云 | 微信云数据库 / 云存储 | 本地 + 云用户资料 |

---

## 项目结构

```text
family-cotton-miniapp/
├── miniprogram/
│   ├── pages/ home · timeline · mine · publish-*
│   ├── components/ avatar-girl · timeline-card · voice-player
│   ├── utils/ cloud · unread · weather · auth · date
│   ├── mock/ 演示数据
│   └── assets/avatar|audio|tab
├── cloudfunctions/ login · bindFamily · getWeather
└── docs/ DEMO_SCRIPT · CLOUD_SETUP · TECH_SHOWOFF · database-security
```
