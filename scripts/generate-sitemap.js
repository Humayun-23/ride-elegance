import fs from 'fs';
import path from 'path';

// Base URL of your website (canonical: www)
const BASE_URL = 'https://www.gopanda.in';

// Static routes
const staticRoutes = [
  '/',
  '/search-vehicles',
  '/shops'
];

// Canonical vehicle types × cities — no synonym slugs
const cities = ['guwahati', 'jorhat', 'dibrugarh', 'tezpur', 'silchar', 'shillong'];
const vehicles = ['car', 'bike', 'scooty'];

const seoCombinations = cities.flatMap(city =>
  vehicles.map(vehicle => `/rent/${vehicle}/in/${city}`)
);

const allRoutes = [...staticRoutes, ...seoCombinations];

const today = new Date().toISOString().split('T')[0];

// Generate the XML structure
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (route) => `  <url>
    <loc>${BASE_URL}${route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route === '/' ? 'daily' : route.includes('/rent/') ? 'hourly' : 'weekly'}</changefreq>
    <priority>${route === '/' ? '1.0' : route.includes('/rent/') ? '0.9' : '0.8'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

// Determine the output path (public folder so it's served as a static file)
const outputPath = path.resolve(process.cwd(), 'public', 'sitemap.xml');

fs.writeFileSync(outputPath, sitemap, 'utf8');

console.log(`✅ Sitemap successfully generated with ${allRoutes.length} URLs!`);
console.log(`📁 Saved to ${outputPath}`);
