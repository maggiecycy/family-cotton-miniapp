# Avatar photos（本地，不进 Git）

Put JPGs here (same person / lighting / half-body). Filenames:

`idle` `happy` `miss` `soft` `tender` `speak`

（另有 `photo.jpg` 可供 mock；`idle-loop.mp4` 为首页 idle 微动 loop 视频。）

These files are **gitignored**. Clone the repo → copy your photos into this folder locally.

## 体积限制（微信代码质量）

- **单张**须 **< 200KB**（建议 20～40KB）
- 写真 + idle 视频会计入**主包**；整包须 **< 1.5MB**
- 推荐：长边约 **480px**，JPEG quality **42～52**

示例压缩（macOS）：

```bash
sips -Z 480 -s format jpeg -s formatOptions 42 your.png --out idle.jpg
```

idle 微动视频（正脸、loop、无音轨）：

```bash
ffmpeg -y -i input.mp4 -an -t 2.5 \
  -vf "scale=320:426:force_original_aspect_ratio=increase,crop=320:426" \
  -c:v libx264 -crf 35 -preset slow -movflags +faststart -pix_fmt yuv420p idle-loop.mp4
```

目标 **< 200KB**。
