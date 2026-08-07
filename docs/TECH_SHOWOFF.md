# 技术炫耀卡（给懂行亲戚）

## 一句话

原生微信小程序 + 云开发的家庭陪伴应用：写实虚拟形象、双向心意纪录、语音/带图纸条、未读角标、天气穿衣关心、离线演示模式。

## 技术点

| 点 | 说明 |
|----|------|
| 原生而非 uni-app | 官方 API 路径最短 |
| 未读 | 本地 `lastReadAt` + `setTabBarBadge` |
| 心意模型 | `direction: mom_to_daughter \| daughter_to_mom`，无支付 |
| 天气 | 云函数 `getWeather` + 穿衣模板；演示走 mock |
| 纸条图片 | `chooseMedia` → 云存储 `notes/{familyId}/` |
| 演示双轨 | mock 与云链路分离，现场零依赖 |
| 权限 | `familyId` 隔离；仅女儿发布 |

## 架构

```text
小程序
 ├─ 演示 → mock + 本地 Storage（含 lastReadAt）
 └─ 真实 → 云函数 / 云库 / 云存储
      ├─ timeline（voice | transfer | note+images）
      ├─ voices/ · notes/
      └─ getWeather（可选和风 Key）
```

## 作品集可强调

1. 产品叙事贴合真实家庭（感恩纪录，而非假装已有收入）
2. 妈妈向 UX：大字、未读、天气关心、轻反馈
3. 范围控制：不做自由对话 LLM、不做微信支付

## 诚实占位

- 头像需换成本人写真
- `app.js` 需填真实云环境 ID
- 和风 Key 可选；AI 周短信未实现
