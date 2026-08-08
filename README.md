# 云端小棉袄 / Family Cotton

给父母用的家庭陪伴微信小程序：写实「虚拟女儿」、时光轴（语音 / 心意 / 小纸条）、首页天气关心。

A WeChat mini-program for family care: photo-style daughter avatar, timeline (voice / transfers / notes), and home weather tips.

> **原生微信小程序 + 微信云开发** · Native WeChat mini-program + WeChat CloudBase  
> 不要改成 uni-app / Taro.

---

## 接下来做什么 / Next steps

1. **云天气** · Deploy `cloudfunctions/getWeather` → set `QWEATHER_KEY` + `DEFAULT_CITY` → turn off demo mode in「我的」  
   详见 [`docs/WEATHER_API.md`](docs/WEATHER_API.md)
2. **本地素材** · Put your photos in `miniprogram/assets/avatar/*.jpg` and greetings in `assets/audio/greet-*.m4a`（已 gitignore，不会进仓库；单文件 <200KB，主包 <1.5MB）
3. **推送** · Prefer a **private** GitHub repo（见下方）
4. **上线** · Upload in WeChat DevTools → submit review when ready

演示话术 · Demo script: [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md)

---

## 快速开始 / Quick start

1. 安装微信开发者工具 · Install [WeChat DevTools](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入本仓库根目录 · Import the repo root
3. 填入你的 AppID · Use your AppID（勿用测试号开云开发）
4. 把写真/录音放到本地 `assets/`（见上）· Add local avatar/audio assets
5. 编译 · Compile（默认演示模式可先不配云）

---

## 功能 / Features

| | 中文 | English |
|---|------|---------|
| 陪陪我 | 换表情、点图听问候、天气穿衣、陪伴统计 | Moods, greet audio, weather tip, stats |
| 时光轴 | 语音 / 心意（非支付）/ 带图纸条；未读角标 | Voice / memorial transfers / notes; unread badge |
| 我的 | 演示模式、字体、身份、天气城市 | Demo mode, font, role, city |

**不做** · Out of scope: 父母发帖、微信支付商户、AI 自由对话。

---

## 隐私：照片不进 GitHub / Keep photos off GitHub

`.gitignore` 已忽略：

- `miniprogram/assets/avatar/*.{jpg,png,…}`
- `miniprogram/assets/audio/greet-*.{m4a,wav,mp3}`

本地文件照常使用；`git add` 不会带上它们。

**推荐操作**

1. GitHub 建 **Private** 仓库（家人项目首选）
2. 提交代码时不要 `git add miniprogram/assets/avatar/` 下的图片
3. 推送：`git push -u origin main`

**若仓库要公开 Public**

- Initial commit 里曾有旧版 `avatar/*.png`，公开前必须从历史删掉，否则别人仍能翻到。  
  未推送过可用：删图后 `git filter-repo` / BFG，或重建仓库只提交无图历史。  
- 或继续用 Private，最省事。

**切勿提交** · Never commit: 和风 `API KEY`、云环境密钥、真实家人语音（除非你有意公开）。

---

## 云开发 / Cloud

见 [`docs/CLOUD_SETUP.md`](docs/CLOUD_SETUP.md)。摘要：

1. 开通环境，确认 `miniprogram/app.js` 中 `env`
2. 部署 `login` / `bindFamily` / `getWeather`
3. 建库表 + 安全规则 · [`docs/database-security.md`](docs/database-security.md)
4. 关闭演示模式

---

## 结构 / Layout

```text
miniprogram/     pages · components · utils · mock · assets(local)
cloudfunctions/  login · bindFamily · getWeather
docs/            DEMO_SCRIPT · CLOUD_SETUP · WEATHER_API · FAMILY_MODEL
```

---

## License / 说明

私人家庭项目；公开前请自行确认素材与隐私合规。  
Personal family project — review privacy before making the repo public.
