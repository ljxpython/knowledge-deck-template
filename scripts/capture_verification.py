import time
from playwright.sync_api import sync_playwright

artifact_dir = "/Users/lijiaxin/.gemini/antigravity/brain/bee3f233-4313-4942-98c5-7d4bb2a9177a"

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # 1. 访问首页 Cover
        print("Visiting cover page...")
        page.goto("http://localhost:8753/#1")
        page.wait_for_timeout(1500)
        page.screenshot(path=f"{artifact_dir}/g1-absorbed-cover.png")
        print("Saved g1-absorbed-cover.png")

        # 1b. 测试侧边栏 hover tooltip
        print("Hovering on pen button...")
        page.hover("#btn-pen")
        page.wait_for_timeout(300)
        page.screenshot(path=f"{artifact_dir}/g1-absorbed-tooltip.png")
        print("Saved g1-absorbed-tooltip.png")
        page.mouse.move(720, 450)

        # 2. 点击颜色选择器
        print("Testing color picker popup...")
        page.click("#btn-color")
        page.wait_for_timeout(500)
        page.screenshot(path=f"{artifact_dir}/g1-absorbed-color-popup.png")
        print("Saved g1-absorbed-color-popup.png")
        page.click("#btn-color") # 关闭 popup
        page.mouse.move(720, 450)

        # 3. 访问第 3 页 Transition Door Slide
        print("Visiting transition door slide...")
        page.goto("http://localhost:8753/#trans-evaluate")
        page.mouse.move(720, 450)
        page.wait_for_timeout(1500)
        page.screenshot(path=f"{artifact_dir}/g1-absorbed-transition.png")
        print("Saved g1-absorbed-transition.png")

        # 4. 访问第 11 页 Dual-Track Simulator (initial)
        print("Visiting dual-track simulator...")
        page.goto("http://localhost:8753/#simulation")
        page.mouse.move(720, 450)
        page.wait_for_timeout(1500)
        page.screenshot(path=f"{artifact_dir}/g1-absorbed-simulator-initial.png")
        print("Saved g1-absorbed-simulator-initial.png")

        # 5. 点击推演场景并等待执行完毕
        print("Triggering simulation step...")
        page.wait_for_selector("#sim-ask-btn", timeout=5000)
        page.click("#sim-ask-btn")
        page.mouse.move(720, 450)
        page.wait_for_timeout(2600)
        page.screenshot(path=f"{artifact_dir}/g1-absorbed-simulator-stepped.png")
        print("Saved g1-absorbed-simulator-stepped.png")

        browser.close()

if __name__ == "__main__":
    main()
