from playwright.sync_api import sync_playwright

artifact_dir = "/Users/lijiaxin/.gemini/antigravity/brain/bee3f233-4313-4942-98c5-7d4bb2a9177a"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})

    # 1. 第 1 页：上一页 disabled，下一页 normal
    page.goto("http://localhost:8753/#1")
    page.wait_for_timeout(1000)
    page.screenshot(path=f"{artifact_dir}/nav-page1-disabled-prev.png")
    print("Saved nav-page1-disabled-prev.png")

    # 2. 翻到第 2 页：上一页 normal，下一页 normal
    page.click("#nav-next")
    page.wait_for_timeout(1000)
    page.screenshot(path=f"{artifact_dir}/nav-page2-both-active.png")
    print("Saved nav-page2-both-active.png")

    # 3. 鼠标悬浮在上一页按钮上，展示 Tooltip
    page.hover("#nav-prev")
    page.wait_for_timeout(300)
    page.screenshot(path=f"{artifact_dir}/nav-hover-prev-tooltip.png")
    print("Saved nav-hover-prev-tooltip.png")

    # 4. 点击上一页，验证成功翻回第 1 页
    page.click("#nav-prev")
    page.wait_for_timeout(1000)
    page.screenshot(path=f"{artifact_dir}/nav-clicked-prev-back-to-1.png")
    print("Saved nav-clicked-prev-back-to-1.png")

    browser.close()
