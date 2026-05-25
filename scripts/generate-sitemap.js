import fs from 'fs';
import path from 'path';

// Base URL of your website
const BASE_URL = 'https://www.gopanda.in';

// Static routes
const staticRoutes = [
  '/',
  '/search-vehicles',
  '/shops'
];

// Targeted SEO keywords we want to dynamically generate routes for
const seoCombinations = [
  '/rent/car-hire/in/guwahati',
  '/rent/rental-cars/in/guwahati',
  '/rent/self-drive-car/in/guwahati',
  '/rent/self-drive-cars/in/guwahati',
  '/rent/scooty/in/guwahati',
  '/rent/bike/in/guwahati',
  '/rent/tempo-traveller/in/guwahati',
  '/rent/car-rent/in/guwahati',
];

const allRoutes = [...staticRoutes, ...seoCombinations];

// Generate the XML structure
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (route) => `  <url>
    <loc>${BASE_URL}${route}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route === '/' ? 'daily' : 'weekly'}</changefreq>
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
