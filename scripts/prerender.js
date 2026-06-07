import { preview } from 'vite';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { allRoutes } from './routes.js';

async function prerender() {
  console.log('🚀 Starting Vite preview server for prerendering...');
  
  // Start the Vite preview server serving the `dist` folder
  const server = await preview({
    preview: {
      port: 4173,
      host: true,
    },
    build: {
      outDir: 'dist',
    }
  });

  const url = server.resolvedUrls.local[0];
  console.log(`✅ Server running at ${url}`);

  console.log('🚀 Launching Puppeteer...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // We can optimize the crawl by aborting unnecessary requests like images/css if we only care about SEO HTML
  // But wait, the React app might need JS and API requests to render properly.
  // We will let it load everything.

  for (const route of allRoutes) {
    const routeUrl = `${url.replace(/\/$/, '')}${route}`;
    console.log(`\n⏳ Prerendering ${route}...`);

    try {
      // Go to the page and wait until network connections are idle (app fully mounted and data fetched)
      await page.goto(routeUrl, { waitUntil: 'networkidle0', timeout: 30000 });
      
      // Additional wait to ensure React Helmet injected the meta tags
      await page.waitForFunction(() => {
        const title = document.title;
        return title && title !== 'GoPanda — Best Bike Rental Platform Near You' || document.querySelector('meta[property="og:title"]');
      }, { timeout: 5000 }).catch(() => {}); // catch timeout if it happens to be the homepage

      // Get the fully rendered HTML
      const html = await page.content();

      // Determine the file path
      // If route is '/', filePath is 'dist/index.html'
      // If route is '/shops', filePath is 'dist/shops/index.html'
      const isIndex = route === '/';
      const dirPath = isIndex ? 'dist' : path.join('dist', route);
      const filePath = path.join(dirPath, 'index.html');

      // Ensure directory exists
      if (!isIndex && !fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      // Save the HTML file
      fs.writeFileSync(filePath, html, 'utf8');
      console.log(`✅ Saved ${filePath}`);
    } catch (err) {
      console.error(`❌ Failed to prerender ${route}:`, err);
    }
  }

  console.log('\n🎉 Prerendering complete. Shutting down...');
  await browser.close();
  server.httpServer.close();
  process.exit(0);
}

prerender();
