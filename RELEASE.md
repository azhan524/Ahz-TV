# Ahz TV 1.6.0

- 状态：公开首发候选 / Open-source release candidate
- 日期：`2026-11-29`
- 主程序许可证：MIT
- Ahz-Stream 组件许可证：GPL-3.0

## 构建产物

执行：

```powershell
npm ci
npm run dist
```

生成：

- `dist/Ahz-TV-1.6.0-portable.exe`
- `dist/Ahz-TV-1.6.0-setup.exe`

发布前应运行 `npm run check`，并在产物生成后记录 SHA-256。

SHA-256：

```text
1ABB79B1010D870253D845B7824D8319640330DBC3B9A241B767F88A52E1766E  Ahz-TV-1.6.0-portable.exe
6F0187EF170996988B00AC8C8F6CBD528E0CB2AFEF044D31098F9E9E27F5217D  Ahz-TV-1.6.0-setup.exe
```

## 本版能力

- 电视端媒体中心与本地视频播放
- Android/iPhone 局域网媒体投送
- Android 无线显示窗口捕获
- Ahz-Stream 无线接收器
- 4K、HEVC、60 FPS 默认接收配置
- 全屏与明确的退出全屏入口
- 自动适配、原始比例、满屏播放三种画幅模式
- 480p、720p、1080p、1.5K、2K、4K、8K、原画画质选择，默认原画
- 接收器监听、连接、实际编码和分辨率状态
- 脱敏诊断导出与端口异常自动恢复
- 最近播放、收藏和第三方官方网站入口
- 外部应用协议拦截
- 本机配对身份和窗口布局文件默认排除
