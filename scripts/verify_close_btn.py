from playwright.sync_api import sync_playwright

artifact_dir = "/Users/lijiaxin/.gemini/antigravity/brain/bee3f233-4313-4942-98c5-7d4bb2a9177a"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})

    page.goto("http://localhost:8753/")
    page.wait_for_timeout(1000)

    # 1. 打开目录抽屉
    page.click("#btn-menu")
    page.wait_for_timeout(500)
    page.screenshot(path=f"{artifact_dir}/menu-drawer-sleek.png")
    print("Saved menu-drawer-sleek.png")

    # 2. 悬浮在关闭按钮上
    page.hover("#close-menu")
    page.wait_for_timeout(300)
    page.screenshot(path=f"{artifact_dir}/menu-close-btn-hover.png")
    print("Saved menu-close-btn-hover.png")

    # 3. 点击关闭按钮
    page.click("#close-menu")
    page.wait_for_timeout(500)
    page.screenshot(path=f"{artifact_dir}/menu-drawer-closed.png")
    print("Saved menu-drawer-closed.png")

    browser.close()
