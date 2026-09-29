import os
from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:4173")
    page.wait_for_timeout(1000)

    # 1. Test multi-select lab filter popover
    page.get_by_role("button", name="All Labs").click()
    page.wait_for_timeout(800)
    page.get_by_role("button", name="Done").click()
    page.wait_for_timeout(800)

    # 2. Test "See Previous Days" button
    page.get_by_role("button", name="See Previous Days").first.click()
    page.wait_for_timeout(800)

    # 3. Open Config Labs & Techs Modal
    page.get_by_role("button", name="Config Labs & Techs").click()
    page.wait_for_timeout(800)

    # Close modal
    page.get_by_role("button", name="Save All Configurations").click()
    page.wait_for_timeout(800)

    # Screenshot
    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
