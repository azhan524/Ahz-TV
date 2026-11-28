# Ahz TV 1.5.8

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

- `dist/Ahz-TV-1.5.8-portable.exe`
- `dist/Ahz-TV-1.5.8-setup.exe`

发布前应运行 `npm run check`，并在产物生成后记录 SHA-256。

SHA-256：

```text
5F49873A69CFA02F39377828D783DAAD6A5A28D00BD6A0AF0580178EDCDAE83F  Ahz-TV-1.5.8-portable.exe
C3734743DA9A450F418B8E9BE59783A99AAD94EADBEDB37167A026C0EEC7B9AD  Ahz-TV-1.5.8-setup.exe
```

## 本版能力

- 电视端媒体中心与本地视频播放
- Android/iPhone 局域网媒体投送
- Android 无线显示窗口捕获
- Ahz-Stream 无线接收器
- 4K、HEVC、60 FPS 默认接收配置
- 全屏与明确的退出全屏入口
- 自动适配、原始比例、满屏播放三种画幅模式
- 最近播放、收藏和第三方官方网站入口
- 外部应用协议拦截
- 本机配对身份和窗口布局文件默认排除
