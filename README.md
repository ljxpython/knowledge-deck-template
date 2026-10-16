# Knowledge Deck Template

A browser-native template for turning structured courseware into interactive, chapter-based knowledge decks. It is separate from a long-form reading site: this repository is for explaining ideas with narrative pages, diagrams, animation, and simulations.

## Start A New Deck

## Quick Start

```bash
# 启动本地实时预览
npm run dev

# 契约合规性自检 (0 依赖，秒级通过)
npm run check

# 一键导出单文件离线自包含 HTML (免服务器，双击直接看，随时发微信/飞书)
npm run build:single
```

运行 `npm run dev` 后在浏览器打开 `http://localhost:8753/`。

## Key Capabilities & Shortcuts

- **大纲目录 (快捷键 `M`)**：左侧平滑呼出章节目录，当前页高亮，点击 `✕` 或按 `Esc` 关闭。
- **激光笔拖尾 (快捷键 `T`)**：演示高亮拖尾粒子，随光标移动，自动衰减消失。
- **涂鸦画板 (快捷键 `D`)**：全局自由批注，支持按 `Z` 撤回上一笔，按 `D` 或 `Esc` 退出。
- **触摸屏手势 (Touch Swipe)**：支持手机 / iPad 屏幕左右滑动手势切页。
- **打印与 PDF 导出**：浏览器按 `Cmd + P` / `Ctrl + P` 自动隐藏所有工具栏，高保真平铺输出报告。
- **单文件离线分发**：运行 `npm run build:single` 输出单个 30KB 左右的 `dist/deck-standalone.html`，无需任何 Web 服务器即可离线流畅运行。

## Deployment

This initial repository is a GitHub Template Repository only. GitHub Pages is intentionally not configured.

## License

MIT. The sample content is original demonstration material.
