const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  // ---- 读取输入 (由 GitHub Actions 通过环境变量传入) ----
  const url = process.env.URL;
  if (!url) { console.error('缺少环境变量 URL'); process.exit(1); }

  const format = (process.env.FORMAT || 'jpg').toLowerCase();   // jpg | png | webp
  const mode = (process.env.MODE || 'full').toLowerCase();       // full | viewport
  const width = parseInt(process.env.WIDTH || '1280', 10);
  const waitMs = parseInt(process.env.WAIT || '1500', 10);
  const type = format === 'jpg' ? 'jpeg' : format;              // Playwright 用 jpeg
  const quality = (type === 'jpeg' || type === 'webp') ? 90 : undefined;

  fs.mkdirSync('output', { recursive: true });
  const outPath = path.join('output', `screenshot.${format}`);

  console.log(`[screenshot] url=${url} format=${format} mode=${mode} width=${width} wait=${waitMs}`);

  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage({
    viewport: { width, height: 900 },
    deviceScaleFactor: 2,   // 高清：清晰度翻倍
  });

  // 友好等待：最多 60s，网络空闲即可
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
    .catch(e => console.warn('[warn] goto:', e.message));
  await page.waitForTimeout(waitMs);

  const shotOpts = { path: outPath, type, quality };
  if (mode === 'full') shotOpts.fullPage = true;

  await page.screenshot(shotOpts);

  const { size } = fs.statSync(outPath);
  console.log(`[screenshot] 已保存 ${outPath} (${size} bytes)`);

  await browser.close();
})().catch(e => { console.error('截图失败:', e); process.exit(1); });
