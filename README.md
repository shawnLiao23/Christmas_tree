# Christmas_tree

一棵由 ASCII 字母、数字和符号构成的 3D 圣诞树。包含彩色分层树冠、金色螺旋灯带、带厚度的金星与礼物、树干和树根、飘雪及可修改祝福。

公开播放与下载：https://shawnliao23.github.io/Christmas_tree/

## GitHub Pages 部署

仓库：https://github.com/shawnLiao23/Christmas_tree

已启用 GitHub Pages（Source: GitHub Actions）。推送 `main` 分支中的 `dist/` 变更会自动运行 `.github/workflows/deploy-pages.yml`，将网页、MP4 和源码 ZIP 一起发布。也可以在 Actions 中手动运行 `Publish Christmas animation`。所有拿到公开链接的人都可访问与下载，不需要登录 GitHub。

## 文件

- `dist/christmas-ascii-20s.mp4`：20 秒，1080 × 1920，30fps，H.264 / yuv420p，静音。
- `dist/index.html`、`styles.css`、`scene.js`、`app.js`：无需构建和外部资源的可修改网页。
- `dist/christmas-ascii.html`：所有样式和脚本内嵌的单文件版，双击即可离线播放。
- `dist/christmas-ascii-source.zip`：可修改网页与说明。
- `scripts/render-video.cjs`：重新导出影片。
- `scripts/check-playback.cjs`：实际完整播放 MP4，生成解码帧数、时长和截图报告。

## 修改与运行

直接打开 `dist/index.html` 或单文件版。网页支持暂停、时间轴、拖动旋转、祝福文字、旋转速度、雪量、辉光与全屏。

修改 `dist/scene.js` 的 `defaults` 可更改默认祝福及效果。`greens`、`golds` 控制配色；`radius()` 控制分层轮廓；`gifts` 控制礼物位置、大小与颜色。所有树、星星、礼物与树根均由 `fillText` 生成的 ASCII 字符精灵，经三维旋转、透视投影、深度排序显示，不使用贴图模型或外部字体。

修改 `dist/styles.css` 和 `dist/app.js` 可调整界面。修改后运行 `node scripts/package-source.cjs` 更新单文件版和源码 ZIP。

网页调整仅影响实时画面，已经下载的 MP4 保持原始版本。

## 重新导出 MP4

需要 Node.js、Python 3 及本机 Chrome。依赖仅用于导出，网页播放不需要安装依赖。

```powershell
npm install
python -m pip install imageio-ffmpeg
python -m http.server 8000 --directory dist
```

另开终端：

```powershell
node scripts/render-video.cjs http://127.0.0.1:8000/ dist/christmas-ascii-20s.mp4
node scripts/check-playback.cjs dist/christmas-ascii-20s.mp4 qa/playback
```

可用环境变量 `CHROME_PATH`、`FFMPEG_PATH` 指定可执行文件位置。默认 Chrome 路径为 Windows 标准安装位置。渲染固定为 600 帧 / 30fps，网页和影片使用同一渲染器。`window.__christmas.renderAt(seconds)` 提供确定性的逐帧渲染接口。

## 参考与验证

参考为用户提供的小红书短链 https://xhslink.cn/o/6zW7cwbUIsU ，作品来自 Lilliannn。已从公开分享页取得视频并完整播放检查（16.972 秒）。本项目按用户要求重新实现完整竖屏场景，未包含原视频素材或代码编辑器录屏。

成片另做全时长实际播放检查。具体结果见 `VERIFICATION.md`。
