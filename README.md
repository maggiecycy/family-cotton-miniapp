# 云端小棉袄 / Family Cotton

给父母的陪伴小程序：写真女儿、时光轴（语音 / 心意 / 纸条）、天气关心。  
WeChat mini-program for parents: photo avatar, timeline, weather tips.

**原生微信小程序 + 云开发**（勿用 uni-app / Taro）

## 开始

1. 用 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) 导入本仓库
2. 填真实 AppID（测试号不能开云开发）
3. 本地放入写真 `miniprogram/assets/avatar/*.jpg`、问候 `assets/audio/greet-*.m4a`（已 gitignore）
4. 编译；默认演示模式，可不配云

## 功能

| 页面 | 能力 |
|------|------|
| 陪陪我 | 换表情、点图问候、天气穿衣、统计 |
| 时光轴 | 语音 / 心意（非支付）/ 纸条；未读角标 |
| 我的 | 演示、字体、身份、城市 |

不做：父母发帖、微信支付、AI 对话。

## 云与天气

见 [`docs/CLOUD_SETUP.md`](docs/CLOUD_SETUP.md)、[`docs/WEATHER_API.md`](docs/WEATHER_API.md)。

1. 确认 `app.js` 的云环境 ID  
2. 部署 `login` / `bindFamily` / `getWeather`  
3. `getWeather` 配 `QWEATHER_KEY`、`DEFAULT_CITY`  
4. 「我的」关闭演示模式  

演示话术：[`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md)

## 隐私

写真与问候音频不进 Git。仓库保持 **Private**。勿提交 API Key。  
若改 Public，需先清掉历史里的旧头像文件。

## 结构

```text
miniprogram/      pages · components · utils · mock · assets（本地）
cloudfunctions/   login · bindFamily · getWeather
docs/
```
