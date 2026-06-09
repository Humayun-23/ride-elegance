export default async function handler(req, res) {
  const host = req.headers.host || 'www.gopanda.in';
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const baseUrl = `${protocol}://${host}`;
  const apiBase = process.env.VITE_API_BASE_URL || 'https://api.gopanda.in/api/v1';

  const cities = ['guwahati', 'jorhat', 'dibrugarh', 'tezpur', 'silchar', 'shillong'];
  const vehicleTypes = ['car', 'bike', 'scooty'];

  const today = new Date().toISOString().split('T')[0];
  const urls = [];

  // Static priority pages
  urls.push({ loc: `${baseUrl}/`,                changefreq: 'daily',  priority: '1.0' });
  urls.push({ loc: `${baseUrl}/search-vehicles`, changefreq: 'hourly', priority: '0.9' });
  urls.push({ loc: `${baseUrl}/shops`,           changefreq: 'daily',  priority: '0.8' });

  // Canonical city × vehicle landing pages
  cities.forEach(city => {
    vehicleTypes.forEach(vehicle => {
      urls.push({
        loc: `${baseUrl}/rent/${vehicle}/in/${city}`,
        changefreq: 'hourly',
        priority: '0.9'
      });
    });
  });

  // Fetch live shop and vehicle IDs from backend (best-effort — fails silently)
  const [shopsResult, vehiclesResult] = await Promise.allSettled([
    fetch(`${apiBase}/shops/?limit=500`).then(r => r.json()),
    fetch(`${apiBase}/bikes/?limit=1000&is_available=true`).then(r => r.json()),
  ]);

  if (shopsResult.status === 'fulfilled') {
    const shops = Array.isArray(shopsResult.value) ? shopsResult.value
      : Array.isArray(shopsResult.value?.items) ? shopsResult.value.items : [];
    shops.forEach(shop => {
      if (shop?.id) {
        urls.push({ loc: `${baseUrl}/shops/${shop.id}`, changefreq: 'weekly', priority: '0.7' });
      }
    });
  }

  if (vehiclesResult.status === 'fulfilled') {
    const vehicles = Array.isArray(vehiclesResult.value) ? vehiclesResult.value
      : Array.isArray(vehiclesResult.value?.items) ? vehiclesResult.value.items : [];
    vehicles.forEach(vehicle => {
      if (vehicle?.id) {
        urls.push({ loc: `${baseUrl}/bikes/${vehicle.id}`, changefreq: 'daily', priority: '0.6' });
      }
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=43200, s-maxage=43200');
  res.status(200).send(xml);
}
