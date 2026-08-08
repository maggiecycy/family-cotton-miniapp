# Avatar photos（本地，不进 Git）

Put JPGs here (same person / lighting / half-body). Filenames:

`idle` `happy` `cheer` `miss` `soft` `tender` `playful` `calm` `speak`

（另有 `photo.jpg` 可供时光轴 mock 使用。）

These files are **gitignored**. Clone the repo → copy your photos into this folder locally.

## 体积限制（微信代码质量）

- **单张**须 **< 200KB**（建议 30～80KB）
- 写真会计入**主包**；与音频合计后主包须 **< 1.5MB**
- 推荐：长边约 **560px**，JPEG quality **50～60**

示例压缩（macOS）：

```bash
sips -Z 560 -s format jpeg -s formatOptions 52 your.jpg --out idle.jpg
```

写真放本目录；已被 `.gitignore` 忽略，推 GitHub 不会带上。
