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
- read: 用户所属 `familyId` 匹配
- create: 用户 `role == daughter` 且 `familyId` 匹配
- update: 妈妈仅可 `inc` reactions；女儿可改自己创建的内容（可选）
- delete: 仅女儿

### `daily_lines`
- read: 同家庭
- write: 仅女儿

## 云存储

路径建议：

- `voices/{familyId}/{timestamp}.mp3`
- `notes/{familyId}/{timestamp}_{i}.jpg`

- 同家庭可读
- 仅女儿可写
- 禁止匿名公开读

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
