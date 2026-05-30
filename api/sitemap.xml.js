export default function handler(req, res) {
  const host = req.headers.host || 'www.gopanda.in';
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const baseUrl = `${protocol}://${host}`;

  const cities = ['Guwahati', 'Jorhat', 'Dibrugarh', 'Tezpur', 'Silchar', 'Shillong'];
  const vehicles = ['car', 'bike', 'scooty'];
  
  const urls = [];
  
  // Add base URLs
  urls.push({ loc: `${baseUrl}/`, changefreq: 'daily', priority: '1.0' });
  urls.push({ loc: `${baseUrl}/search-vehicles`, changefreq: 'hourly', priority: '0.9' });
  urls.push({ loc: `${baseUrl}/shops`, changefreq: 'daily', priority: '0.8' });

  // Add all programmatic city permutations
  cities.forEach(city => {
    const citySlug = city.toLowerCase().replace(/\\s+/g, '-');
    
    vehicles.forEach(vehicle => {
      // 1. Standard city page
      urls.push({ 
        loc: `${baseUrl}/rent/${vehicle}/in/${citySlug}`, 
        changefreq: 'hourly', 
        priority: '0.9' 
      });
      
      // 2. Long-tail permutations
      urls.push({ 
        loc: `${baseUrl}/search/cheap-${vehicle}-rental-${citySlug}`, 
        changefreq: 'daily', 
        priority: '0.7' 
      });
    });
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  res.status(200).send(xml);
}
