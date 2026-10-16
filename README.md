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

## Key Capabilities & Shortcuts (讲台演播武器库)

- **认知上下文面包屑**：顶部实时常驻 `DECK_TITLE ／ SECTION (PAGE/TOTAL)`，全场清晰掌握章节进度。
- **大纲目录 (快捷键 `M`)**：左侧平滑呼出章节抽屉，当前页高亮，点击 `✕` 或按 `Esc` 关闭。
- **激光笔拖尾 (快捷键 `T`)**：演示高亮拖尾粒子，随画随隐，1.2秒平滑渐淡退出。
- **留痕笔批注 (快捷键 `P`)**：讲师重点手绘批注，**按页自动持久化保存**！切页自动隐藏，翻回原页 100% 原样恢复。
- **板书黑板 (快捷键 `D`)**：一键进入全屏深邃磨砂黑板，独立进行草稿推演，按 `Esc` 退出并返回课件。
- **专注演讲模式 (快捷键 `H`)**：隐藏所有工具栏、翻页按钮与进度条，全屏纯净沉浸，适合录课与公开演讲。
- **快速调色盘 (快捷键 `C` 或数字键 `1-4`)**：内置珊瑚红、极客蓝、薄荷绿、琥珀金 4 种高对比度演播色。
- **单步撤回与一键擦除 (快捷键 `Z` / `R`)**：随时撤销笔划或一键清空当前页/黑板痕迹。
- **快捷键总览 (快捷键 `?`)**：屏幕底部浮现完整操作指南 Toast。
- **触摸屏手势 (Touch Swipe)**：支持手机 / iPad 屏幕左右滑动手势切页。
- **打印与 PDF 导出**：浏览器按 `Cmd + P` / `Ctrl + P` 自动隐藏所有工具栏，高保真平铺输出报告。
- **单文件离线极速分发**：运行 `npm run build:single` 输出纯净单文件 `dist/deck-standalone.html`（~80KB），无任何外部依赖，离线秒开，随时发微信/飞书分享。

## Deployment

This initial repository is a GitHub Template Repository only. GitHub Pages is intentionally not configured.

## License

MIT. The sample content is original demonstration material.
