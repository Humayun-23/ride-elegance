export default async function handler(req, res) {
  try {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host || 'www.gopanda.in';
    
    // Fetch the raw index.html to modify
    // Appending a query param to bust any potential caches for this specific serverless fetch
    const fetchUrl = `${protocol}://${host}/index.html?_seo=1`;
    const response = await fetch(fetchUrl);
    let html = await response.text();

    const url = req.url || '';
    
    let title = 'GoPanda — Best Bike Rental Platform Near You';
    let description = 'Looking for the best bike rentals near you? GoPanda offers premium and affordable two-wheelers.';
    
    // Helper to format strings
    const formatStr = (str) => {
      if (!str) return '';
      return str.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    // Parse URL to generate dynamic metadata
    // Example: /rent/car/in/guwahati
    const rentMatch = url.match(/\/rent\/([^\/]+)\/in\/([^\/\?]+)/);
    if (rentMatch) {
      const vType = formatStr(rentMatch[1]);
      const city = formatStr(rentMatch[2]);
      title = `Rent ${vType} in ${city} — from local shops | GoPanda`;
      description = `Find ${vType.toLowerCase()} rentals in ${city} from verified local shops. Pay a small token, pick up your ride.`;
    } 
    // Example: /search/cheap-car-rental-guwahati
    else if (url.includes('/search/') && !url.includes('search-vehicles')) {
      const slugParts = url.split('/search/')[1].split('?')[0];
      const parts = slugParts.replace(/-/g, ' ');
      
      let parsedVehicle = parts;
      let parsedCity = 'your area';
      
      if (slugParts.toLowerCase().includes('guwahati')) {
        parsedCity = 'Guwahati';
        parsedVehicle = parts.replace(/guwahati/i, '').trim();
      }
      
      title = `Rent ${formatStr(parsedVehicle)} in ${formatStr(parsedCity)} — from local shops | GoPanda`;
      description = `Find ${parsedVehicle.toLowerCase()} rentals in ${formatStr(parsedCity)} from verified local shops. Pay a small token, pick up your ride.`;
    }

    // Inject into HTML
    // We do a simple string replace for the <title> and add <meta> tags before </head>
    html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
    
    const metaTags = `
      <meta name="description" content="${description}" />
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${description}" />
      <meta property="og:url" content="${protocol}://${host}${url}" />
      <meta name="twitter:title" content="${title}" />
      <meta name="twitter:description" content="${description}" />
    `;
    
    html = html.replace('</head>', `${metaTags}</head>`);

    // Send modified HTML
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.status(200).send(html);
    
  } catch (error) {
    console.error('SEO injection error:', error);
    // Fallback: redirect to the actual path and let client side handle it
    res.redirect(307, req.url);
  }
}
