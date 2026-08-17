# 云数据库安全规则（建议）

> 在微信开发者工具 → 云开发 → 数据库 → 权限设置中配置。  
> 演示模式不依赖这些规则；正式给妈妈用前必须配好。

## 设计原则

- 同 `familyId` 可读
- 仅 `role === 'daughter'` 可写 timeline / 上传语音
- 妈妈可更新 `reactions`
- guest 不写库（演示走本地 mock）

## 伪规则示意

实际控制台语法以当前云开发文档为准，以下为逻辑说明：

### `users`
- read: `doc.openid == auth.openid`
- write: `doc.openid == auth.openid`（仅本人字段；role/familyId 建议只由云函数改）

### `families`
- read: 成员可读自己的家庭
- create: 仅云函数 `bindFamily`
- update: 禁止客户端直接改 inviteCode

### `timeline`
- **开发期快捷权限（推荐先用这个，否则妈妈读不到女儿写的记录）：**
  - 控制台把 `timeline` 设为：**所有用户可读，仅创建者可写**
  - 云存储（照片/语音）同样建议：**所有用户可读，仅创建者可写**
- **原因：** 默认「仅创建者可读写」时，女儿上传的文档/文件，妈妈的 openid 查不到 → 照片墙空白
- 正式加固后再改自定义规则：`doc.familyId` 与当前用户 `users.familyId` 一致才可读；女儿与家长都可写 `type=photo`

### `daily_lines`
- read: 同家庭
- write: 仅女儿

## 家人互相看得见的检查清单

1. 「我的」→ **关闭演示模式**（演示数据只在本机，另一部手机永远看不到）
2. 女儿生成真实邀请码 → 妈妈用同一邀请码绑定（两边 `familyId` 必须相同）
3. 云库 `timeline` + 云存储权限按上表改为「所有用户可读…」
4. 看照片请到时光轴 **「照片墙」** Tab（「全部」里已不再显示照片）

## 云存储

路径建议：

- `voices/{familyId}/{timestamp}.mp3`
- `photos/{familyId}/{timestamp}.jpg`
- `notes/{familyId}/{timestamp}_{i}.jpg`

- 同家庭可读
- 仅女儿可写
- 禁止匿名公开读

### 照片空白转圈（必查）

库里有记录、卡片能出来，但图片一直转圈：

1. **免费套餐往往改不了云存储权限**（会提示升级）——不必强行改权限
2. 已提供云函数 **`getMediaUrls`**：用管理员权限换临时 HTTPS 链接，妈妈端可看女儿上传的图
3. 请右键部署 `cloudfunctions/getMediaUrls`（云端安装依赖）后重新编译
4. 若仍失败：看控制台是否有 `getMediaUrls call failed` / `status != 0`

以后若升级付费，也可把存储改成「所有用户可读，仅创建者可写」，效果类似。

## timeline.transfer 字段补充

```js
{
  type: 'transfer',
  direction: 'mom_to_daughter' | 'daughter_to_mom',
  amount, category, remark, message, ...
}
```

## timeline.note 字段补充

```js
{
  type: 'note',
  text,
  images: ['cloud://...'] // 0～3 张
}
```


## 推荐：写操作尽量走云函数

客户端直写容易绕权限；`login` / `bindFamily` / 发布语音 优先云函数校验角色后再写库。
