# 开通云开发并关闭演示

## 步骤

1. 微信开发者工具 → 顶部 **云开发** → 开通环境，复制 **环境 ID**
2. 修改 `miniprogram/app.js`：
   ```js
   wx.cloud.init({
     env: '你的环境ID',
     traceUser: true
   })
   ```
3. 右键部署云函数：
   - `cloudfunctions/login`
   - `cloudfunctions/bindFamily`
   - `cloudfunctions/getWeather`
   - `cloudfunctions/saveSubscribe`（存订阅授权）
   - `cloudfunctions/sendNotify`（发订阅推送）
   - `cloudfunctions/checkFestival`（节日定时提醒）
4. 云开发控制台创建集合：`users`、`families`、`timeline`、`daily_lines`
5. 云存储可用路径：
   - `voices/{familyId}/...`
   - `notes/{familyId}/...`
6. 安全规则见 `docs/database-security.md`
7. 小程序「我的」→ **关闭演示模式**

## 天气 API（可选）

详细步骤见 [`WEATHER_API.md`](./WEATHER_API.md)。摘要：

1. 注册 [和风天气](https://dev.qweather.com/) 获取 Key  
2. 部署云函数 `getWeather`，配置环境变量 `QWEATHER_KEY`、`QWEATHER_HOST`、`DEFAULT_CITY`  
3. `app.js` 填真实云环境 ID，并关闭演示模式  
4. 「我的」设置天气城市  

## 以后：每周 AI 关心短信（未做）

预留方向：云函数定时触发 → 调用 DeepSeek（Key 仅存云函数）→ 生成草稿 → **你审阅后**写入 `timeline` 或 `daily_lines`。  
不进当前 MVP，避免 Key 泄漏与不可控对话。
