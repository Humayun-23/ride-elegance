export default async function handler(req, res) {
  try {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host || 'www.gopanda.in';
    
    // Fetch the raw index.html to modify
    const fetchUrl = `${protocol}://${host}/index.html?_seo=1`;
    const response = await fetch(fetchUrl);
    let html = await response.text();

    const url = req.url || '';
    
    let title = 'GoPanda — Best Bike Rental Platform Near You';
    let description = 'Looking for the best bike rentals near you? GoPanda offers premium and affordable two-wheelers.';
    let canonicalUrl = `${protocol}://${host}${url.split('?')[0]}`;
    
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
      
      // Normalize canonical for synonym slugs
      const vTypeLower = rentMatch[1].toLowerCase();
      let canonicalVehicle = rentMatch[1];
      if (vTypeLower.includes('car')) canonicalVehicle = 'car';
      else if (vTypeLower.includes('scooty') || vTypeLower.includes('scooter')) canonicalVehicle = 'scooty';
      else if (vTypeLower.includes('bike') || vTypeLower.includes('motorcycle')) canonicalVehicle = 'bike';
      canonicalUrl = `${protocol}://${host}/rent/${canonicalVehicle}/in/${rentMatch[2].toLowerCase()}`;
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

    // Replace <title> tag
    html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
    
    // Replace existing meta tags instead of appending duplicates
    html = html.replace(
      /<meta name="description" content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${description}" />`
    );
    html = html.replace(
      /<meta property="og:title" content="[^"]*"\s*\/?>/,
      `<meta property="og:title" content="${title}" />`
    );
    html = html.replace(
      /<meta property="og:description" content="[^"]*"\s*\/?>/,
      `<meta property="og:description" content="${description}" />`
    );
    html = html.replace(
      /<meta property="og:url" content="[^"]*"\s*\/?>/,
      `<meta property="og:url" content="${canonicalUrl}" />`
    );
    html = html.replace(
      /<meta name="twitter:image" content="[^"]*"\s*\/?>/,
      `<meta name="twitter:image" content="${protocol}://${host}/og-image.png" />`
    );
    
    // Add canonical link before </head> if not already present
    if (!html.includes('rel="canonical"')) {
      html = html.replace('</head>', `  <link rel="canonical" href="${canonicalUrl}" />\n  </head>`);
    }

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
