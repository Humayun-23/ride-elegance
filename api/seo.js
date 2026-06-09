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
    let description = 'Self drive car rental in Guwahati — also offering bike rental from verified local shops. No middlemen, no hidden fees. Book today!';
    let h1 = '';
    let bodyText = '';
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
      h1 = `Rent a ${vType} in ${city}`;
      bodyText = `Looking for a ${vType.toLowerCase()} rental in ${city}? GoPanda connects you with verified local shops offering self-drive ${vType.toLowerCase()}s at transparent prices. Browse available vehicles, lock your dates with a small booking token, and pay the balance directly at the shop. No middlemen, no hidden fees, no platform commissions. Popular pickup points across ${city} make it easy to start your journey.`;

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
      h1 = `Rent ${formatStr(parsedVehicle)} in ${formatStr(parsedCity)}`;
      bodyText = `Find affordable ${parsedVehicle.toLowerCase()} options in ${formatStr(parsedCity)} from verified local shops on GoPanda. Book self-drive vehicles at transparent prices with no middlemen and no hidden fees.`;
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

    // Inject H1 and body text for crawlers (fixes "H1 missing" + "low word count")
    if (h1) {
      const seoBlock = `<h1 style="font-size:2.25rem;font-weight:700;padding:0 1rem;max-width:1536px;margin:0 auto;">${h1}</h1>\n      <p style="padding:0 1rem;max-width:1536px;margin:0.5rem auto;color:#666;line-height:1.6;">${bodyText}</p>`;
      // Insert before the closing </div> of #root
      html = html.replace('</div>\n    <script type="module"', `${seoBlock}\n    </div>\n    <script type="module"`);
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
