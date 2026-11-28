# Ahz TV

一个电视端风格的 Windows 本地视频播放器、手机投送与无线投屏入口。

当前版本：`1.6.0`

- 默认打开 Ahz TV 自己的电视媒体中心首页
- 打开电脑中的 MP4、WebM、MOV 等视频，并使用自定义播放控件播放
- 通过同一 Wi-Fi、电脑热点或局域网二维码接收 Android/iPhone 的照片和视频
- 支持接入 Windows 无线显示窗口，在 Ahz TV 内查看 Android 实时投屏
- 内置免费开源 Ahz-Stream 接收器，iPhone/iPad 无需购买 AirServer
- AirPlay 面板提供独立全屏观看入口，捕获窗口后自动进入应用全屏
- 投屏画幅支持自动适配、还原原始比例和满屏播放
- 投屏画质提供 480p、720p、1080p、1.5K、2K、4K、8K 和原画选项
- Ahz-Stream 状态显示监听、连接、实际分辨率与编码
- 支持脱敏诊断导出和端口异常自动恢复
- 画质与画幅偏好统一保存在本机设置中
- 新环境首次启用 Ahz-Stream 时默认使用 4K、HEVC 和 60 FPS
- 在“最近播放”和“我的收藏”中维护本机记录
- 通过显式标注的第三方网页插件打开红果短剧、哔哩哔哩、腾讯视频、
  爱奇艺、优酷、芒果 TV、咪咕视频等平台

## 使用

从 Releases 下载安装版或便携版。安装版会创建桌面和开始菜单快捷方式；
便携版无需安装，双击即可运行。

## 开发

需要 Windows 10 1809+、Node.js 20+ 和 PowerShell。

```powershell
npm ci
npm start
npm run check
```

打便携版 exe：

```powershell
npm run dist:portable
```

同时打便携版和安装版：

```powershell
npm run dist
```

构建产物位于 `dist`。

## 快捷键

- `Ctrl+K`：聚焦搜索框
- `F11`：应用全屏
- `Esc`：退出应用全屏；右上角也会显示“退出全屏”按钮
- `Space`：播放 / 暂停
- `←` / `→`：后退 / 前进 5 秒
- `M`：静音
- `F`：全屏
- `Ctrl+R` 或 `F5`：刷新网页
- `Alt+Left` / `Alt+Right`：后退 / 前进

## 产品边界

- Ahz TV 是独立的本地导航与网页容器，不冒充任何视频平台。
- 本地视频始终保留在用户电脑上，Ahz TV 不会上传视频文件。
- 实际能否解码取决于视频编码；推荐 H.264/AAC 的 MP4 文件。
- 红果短剧只是可选的第三方网页插件，不是 Ahz TV 的默认首页或自有内容。
- 视频、名称、画面、账号和播放服务分别归对应平台与权利人所有。
- 程序只打开平台官方网页，不抓取、下载、转码或破解受版权保护的内容。
- 第三方页面只能导航到 HTTP/HTTPS 地址；`bitbrowser://`、`douyin://`、
  `tel:` 等外部应用协议会被拦截并显示安全提示。
- 手机投送只在当前局域网内工作，文件不会上传到互联网。

## 手机投送

1. 打开 Ahz TV 左侧的“投送”。
2. 手机连接电脑同一 Wi-Fi、电脑热点或局域网。
3. 扫描二维码，在手机网页中选择照片或视频。
4. 首次使用时，允许 Windows 防火墙“专用网络”访问。

切换 Wi-Fi 或热点后，投送面板会自动刷新当前局域网地址；也可以点击
“刷新网络地址”。如果手机页面打不开，先确认二维码中的 IP 与电脑当前
WLAN IPv4 地址一致。

Android 实时镜像使用 Windows“无线显示器”接收手机画面；连接成功后，在
Ahz TV 中点击“捕获投屏窗口”。iPhone/iPad 可点击“启动 Ahz-Stream”，
然后在控制中心选择 `Ahz-Stream`，再捕获窗口。内置接收器使用独立
GPLv3 进程和 60 FPS 捕获；实际延迟受 Wi-Fi、手机编码和显卡影响，通常
约为 80–200 ms，不能保证真正 0 ms。

Ahz-Stream 基于开源项目 `moieric11/AirPlay-Windows v0.5.0`。许可证、
第三方声明和对应源码位于 `vendor/airplay-windows`，Ahz TV 主程序与
该扩展为独立进程。

如果 iPhone 显示无法连接，先在 Ahz TV 中“停止接收器”，等待两秒，再
重新“启动 Ahz-Stream”。Ahz-Stream 偶尔会在一次失败握手后停止
监听 7000 端口，重启接收器即可恢复。不要同时运行 AirServer。连接成功后，
可在接收器窗口按 `H` 隐藏两侧界面，再捕获到 Ahz TV 会得到更干净的画面。
- 少数平台的受保护视频可能要求在其官方客户端或系统浏览器中播放。

用户登录信息保存在 Electron 的本机应用数据目录中，卸载应用不会主动清除该目录。

## 开源

主程序原创代码采用 [MIT License](LICENSE)。

`vendor/airplay-windows/` 是独立的 GPLv3 组件，面向用户显示为
**Ahz-Stream**。它的许可证、对应源码和上游说明保留在该目录中，不从 MIT
重新授权。详细范围见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

参与开发前请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 和
[SECURITY.md](SECURITY.md)。

## 非官方声明

Ahz TV 与 Apple、AirServer、红果短剧、哔哩哔哩、腾讯视频、爱奇艺、
优酷、芒果 TV、咪咕视频等公司或平台均无隶属、代理或背书关系。
相关名称与商标归各自权利人所有。
