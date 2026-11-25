# Ahz TV 1.5.7

- 状态：公开首发候选 / Open-source release candidate
- 日期：`2026-11-25`
- 主程序许可证：MIT
- Ahz-Stream 组件许可证：GPL-3.0

## 构建产物

执行：

```powershell
npm ci
npm run dist
```

生成：

- `dist/Ahz-TV-1.5.7-portable.exe`
- `dist/Ahz-TV-1.5.7-setup.exe`

发布前应运行 `npm run check`，并在产物生成后记录 SHA-256。

SHA-256：

```text
D169F8EE2EDCF882D84C18A8C4E5978F62C8E7306908ED985C10A4EBAE986ECA  Ahz-TV-1.5.7-portable.exe
62DCB13A063B288C7011C2EA8916037BB37C7E87CD8FEC43BC562B82D17616C2  Ahz-TV-1.5.7-setup.exe
```

## 本版能力

- 电视端媒体中心与本地视频播放
- Android/iPhone 局域网媒体投送
- Android 无线显示窗口捕获
- Ahz-Stream 无线接收器
- 4K、HEVC、60 FPS 默认接收配置
- 全屏与明确的退出全屏入口
- 最近播放、收藏和第三方官方网站入口
- 外部应用协议拦截
- 本机配对身份和窗口布局文件默认排除
