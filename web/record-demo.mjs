/**
 * Record a 1080p demo video of the Chinese version.
 * Usage: node record-demo.mjs
 */
import { chromium } from "playwright";
import { execFileSync } from "child_process";
import { join } from "path";

const OUTPUT_DIR = join(import.meta.dirname, "..", "simulations", "operation_kaboom", "output");
const WIDTH = 1920;
const HEIGHT = 1080;
const BASE_URL = "http://localhost:3001";

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function smoothScroll(page, distance, duration = 1500) {
  const steps = 30;
  const stepDist = distance / steps;
  const stepDelay = duration / steps;
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, stepDist);
    await sleep(stepDelay);
  }
}

(async () => {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    locale: "zh-CN",
    recordVideo: {
      dir: OUTPUT_DIR,
      size: { width: WIDTH, height: HEIGHT },
    },
  });

  const page = await context.newPage();

  // 1. Navigate to app (auto-detects zh-CN locale)
  console.log("Navigating to app...");
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await sleep(2000);

  // 2. Verify we're in Chinese mode — if not, click the language toggle
  const langBtn = page.locator(".lang-toggle");
  const langText = await langBtn.textContent();
  if (langText?.trim() === "中") {
    // Currently in English, click to switch to Chinese
    await langBtn.click();
    await sleep(1000);
  }

  // 3. Pause at hero section
  console.log("Recording hero section...");
  await sleep(2500);

  // 4. Slowly scroll through charts
  console.log("Scrolling through charts...");
  await smoothScroll(page, 600, 2000);
  await sleep(2000);

  // Panel 01 & 02
  await smoothScroll(page, 500, 1500);
  await sleep(2000);

  // Panel 03 & 04
  await smoothScroll(page, 500, 1500);
  await sleep(2000);

  // Panel 05
  await smoothScroll(page, 400, 1500);
  await sleep(2000);

  // 5. Scroll to summary stats
  console.log("Summary stats...");
  await smoothScroll(page, 400, 1500);
  await sleep(2000);

  // 6. Scroll to parameters section
  console.log("Scrolling to parameters...");
  await smoothScroll(page, 500, 1500);
  await sleep(1500);

  // 7. Click "C2 崩溃" scenario preset
  console.log("Clicking C2 Collapse preset...");
  const c2Btn = page.locator("button", { hasText: "C2" });
  if (await c2Btn.count() > 0) {
    await c2Btn.first().click();
    await sleep(1000);
  }

  // 8. Click "展开高级参数"
  console.log("Expanding advanced params...");
  const advBtn = page.locator("button", { hasText: "高级参数" });
  if (await advBtn.count() > 0) {
    await advBtn.first().click();
    await sleep(1500);
  }

  // Show the advanced params
  await smoothScroll(page, 300, 1000);
  await sleep(1500);

  // 9. Click LAUNCH SIMULATION
  console.log("Launching simulation...");
  const launchBtn = page.locator("button", { hasText: "启动仿真" });
  if (await launchBtn.count() > 0) {
    await launchBtn.first().click();
    await sleep(2000);
  }

  // 10. Auto-scroll back up to see results
  console.log("Scrolling to results...");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await sleep(2000);

  // Scroll through updated charts
  await smoothScroll(page, 500, 2000);
  await sleep(2000);

  await smoothScroll(page, 500, 1500);
  await sleep(2000);

  await smoothScroll(page, 500, 1500);
  await sleep(2000);

  // 11. Final pause
  console.log("Final pause...");
  await sleep(2000);

  // Close context to finalize video
  console.log("Finalizing video...");
  const video = page.video();
  await context.close();

  if (video) {
    const videoPath = await video.path();
    console.log(`\nWebM recorded at: ${videoPath}`);
    console.log(`\nConverting to MP4 1080p...`);

    // Convert webm to mp4 using ffmpeg
    const mp4Path = join(OUTPUT_DIR, "demo_zh_1080p.mp4");
    try {
      execFileSync("ffmpeg", [
        "-y",
        "-i", videoPath,
        "-vf", "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2",
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        mp4Path,
      ], { stdio: "inherit" });
      console.log(`\nMP4 saved: ${mp4Path}`);
    } catch (e) {
      console.log(`FFmpeg conversion failed, WebM still available at: ${videoPath}`);
    }
  }

  await browser.close();
  console.log("Done!");
})();
