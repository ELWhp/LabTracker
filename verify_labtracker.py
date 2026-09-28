import os
from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:4173")
    page.wait_for_timeout(1000)

    # 1. Filter by Lab using locator
    lab_select = page.locator("select").filter(has_text="All Labs")
    lab_select.select_option(index=1)
    page.wait_for_timeout(800)

    # 2. Reset Filter
    lab_select.select_option(value="all")
    page.wait_for_timeout(800)

    # 3. Open Config Labs & Techs Modal
    page.get_by_role("button", name="Config Labs & Techs").click()
    page.wait_for_timeout(800)

    # 4. Switch to Stations tab
    page.get_by_role("button", name="Stations & Capabilities").click()
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
