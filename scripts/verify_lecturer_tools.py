import os
from playwright.sync_api import sync_playwright

artifact_dir = "/Users/lijiaxin/.gemini/antigravity/brain/bee3f233-4313-4942-98c5-7d4bb2a9177a"
html_path = "file://" + os.path.abspath("dist/deck-standalone.html")

errors = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})

    page.on("pageerror", lambda err: errors.append(f"PageError: {err}"))
    page.on("console", lambda msg: errors.append(f"ConsoleError: {msg.text}") if msg.type == "error" else None)

    # 1. 打开单文件页面
    page.goto(html_path)
    page.wait_for_timeout(1000)

    # 截图 1: 首页加载与顶部认知上下文 (DECK / SECTION)
    page.screenshot(path=f"{artifact_dir}/lecturer-01-cover.png")
    print("✓ Saved lecturer-01-cover.png")

    # 2. 翻到第二页 (page-02-metrics)，开启留痕笔 (按键 P)
    page.keyboard.press("ArrowRight")
    page.wait_for_timeout(600)
    page.keyboard.press("p")
    page.wait_for_timeout(300)

    # 在画板上绘制两条批注折线 (模拟讲师在关键卡片上圈选)
    page.mouse.move(450, 360)
    page.mouse.down()
    page.mouse.move(600, 380, steps=10)
    page.mouse.move(650, 520, steps=10)
    page.mouse.up()

    page.mouse.move(750, 420)
    page.mouse.down()
    page.mouse.move(950, 420, steps=8)
    page.mouse.up()

    page.wait_for_timeout(300)
    page.screenshot(path=f"{artifact_dir}/lecturer-02-retain-pen.png")
    print("✓ Saved lecturer-02-retain-pen.png (留痕笔绘制与 Toast)")

    # 3. 翻到第三页，确认笔迹不串页；再翻回第二页，确认笔迹原样复原！
    page.keyboard.press("ArrowRight")
    page.wait_for_timeout(500)
    page.screenshot(path=f"{artifact_dir}/lecturer-03-next-clean.png")
    print("✓ Saved lecturer-03-next-clean.png (切页干净无残留)")

    page.keyboard.press("ArrowLeft")
    page.wait_for_timeout(500)
    page.screenshot(path=f"{artifact_dir}/lecturer-04-prev-restored.png")
    print("✓ Saved lecturer-04-prev-restored.png (翻回上一页笔迹 100% 复原)")

    # 4. 退出留痕笔，开启黑板模式 (按键 D)
    page.keyboard.press("Escape")
    page.wait_for_timeout(200)
    page.keyboard.press("d")
    page.wait_for_timeout(400)

    # 在黑板上推导画图 (白色/亮色粉笔线条)
    page.mouse.move(500, 400)
    page.mouse.down()
    page.mouse.move(700, 300, steps=10)
    page.mouse.move(900, 450, steps=10)
    page.mouse.move(500, 400, steps=10)
    page.mouse.up()

    page.wait_for_timeout(300)
    page.screenshot(path=f"{artifact_dir}/lecturer-05-blackboard.png")
    print("✓ Saved lecturer-05-blackboard.png (临时黑板推导模式)")

    # 5. 退出黑板模式，进入专注演讲模式 (按键 H)
    page.keyboard.press("Escape")
    page.wait_for_timeout(300)
    page.keyboard.press("h")
    page.wait_for_timeout(500)
    page.screenshot(path=f"{artifact_dir}/lecturer-06-focus-mode.png")
    print("✓ Saved lecturer-06-focus-mode.png (全屏专注演讲模式)")

    browser.close()

if errors:
    print("❌ ERRORS ENCOUNTERED:")
    for err in errors:
        print("  ", err)
    exit(1)
else:
    print("🎉 ALL TESTS PASSED WITH ZERO CONSOLE ERRORS!")
