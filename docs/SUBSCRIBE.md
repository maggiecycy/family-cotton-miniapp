# 订阅消息：申请模板 + 云函数推送

## 一、公众平台申请模板（具体步骤）

1. 打开 [微信公众平台](https://mp.weixin.qq.com/) → 登录小程序「给妈妈的小棉袄」
2. 左侧 **功能**（或 **基础功能**）→ **订阅消息**
3. 进入 **公共模板库**（有的账号叫「选用模板」）
4. 搜索并选用 3 个模板（名称可相近即可），例如：
   - 「留言提醒 / 新消息提醒」→ 用作 `voice`
   - 「内容更新提醒 / 相册提醒」→ 用作 `photo`
   - 「节日祝福 / 日程提醒」→ 用作 `festival`
5. 每个模板选 2～3 个关键词（常见：`事物` thing、`时间` time、`温馨提示`）
6. 添加成功后，在 **我的模板** 里复制 **模板 ID**
7. 填进代码：

```js
// miniprogram/utils/subscribe.js
const TMPL = {
  voice: '这里粘贴语音模板ID',
  photo: '这里粘贴照片模板ID',
  festival: '这里粘贴节日模板ID'
}
```

8. **怎么查看字段名（thing1 / time2…）**

1. 公众平台 → **订阅消息** → **我的模板**
2. 点开某一条模板（不要只看列表）
3. 详情里每个关键词旁边会有类似：
   - `通知类型` → `thing1` 或 `phrase1`
   - `消息时间` → `time2` 或 `date2`
   - `备注` → `thing3`
4. 把这些 **英文 key** 记下来，和 `cloudfunctions/sendNotify/index.js` 里 `buildData()` 的 key **逐个对齐**
5. 若详情页只显示中文名、看不到英文 key：点「详情」或导出/预览；也可用云端测试发一条，看报错里提示的 missing field

你已填入的模板 ID 会在发语音成功时弹出订阅授权；真正推送还要部署 `saveSubscribe` / `sendNotify`。

9. **当前项目已对齐的字段（按你的模板详情）**

| 类型 | 模板 | 字段 |
|------|------|------|
| voice | 聊天消息通知 | `thing1` 通知类型 / `time6` 消息时间 / `thing5` 备注 / `thing3` 消息来自 |
| photo | 新留言提醒 | `thing3` 留言内容 / `date4` 留言时间 / `thing2` 留言用户 / `time6` 发送时间 |
| festival | 节日祝福提醒 | `thing1` 节日名称 / `thing4` 用户姓名 / `thing5` 祝福语 / `time2` 时间 |

改完后请 **重新上传部署** `sendNotify`、`checkFestival`。  
10. 重新编译小程序；云函数见下一节部署

> 一次性订阅：用户每点一次「允许」，通常只能收到 **1 次** 对应推送；发语音前会再次弹授权，属正常。

---

## 二、部署云函数（推送 + 存 openid）

在微信开发者工具中，对下列目录分别 **右键 → 上传并部署：云端安装依赖**：

| 云函数 | 作用 |
|--------|------|
| `saveSubscribe` | 把 openid + 授权结果写入 `users.subscribe` |
| `sendNotify` | 发语音/照片后通知同家庭家长 |
| `checkFestival` | 每天 8:00 若遇节日则推送（定时触发器） |

`sendNotify` / `checkFestival` 的 `config.json` 已声明 `subscribeMessage.send` 权限。

数据库集合 **`users`** 需已存在（你之前已建）。文档字段示例：

```js
{
  openid: 'oXXXX',
  role: 'mom',
  familyId: 'xxx',
  subscribe: {
    voice: { templateId: '...', status: 'accept', updatedAt: 123 },
    festival: { templateId: '...', status: 'accept', updatedAt: 123 }
  }
}
```

---

## 三、联调顺序

1. 关演示模式，家长身份打开小程序一次（走 `login` / 绑定，确保 `users` 有 openid）  
2. 女儿发语音 → 弹订阅 → 点允许 → 云库 `users.subscribe` 应有 `accept`  
3. 再发一条语音 → 家长微信应收到服务通知（模板字段需匹配）  
4. 节日当天：可云端测试 `checkFestival`，或等早上 8 点定时器

---

## 四、认证未完成时

分享按钮会提示「未完成认证无法分享」——这是平台限制，**不是代码 bug**。  
别人仍可通过：**体验版二维码** / **正式版发布后搜索**（认证通过后才易被搜到）/ **复制邀请码手动绑定**。
