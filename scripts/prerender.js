import fs from 'fs';
import path from 'path';
import { allRoutes } from './routes.js';

const BASE_URL = 'https://www.gopanda.in';

const formatStr = (str) => {
  if (!str) return '';
  return str.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

async function prerender() {
  console.log('🚀 Starting static SEO generation...');
  
  const indexPath = path.resolve(process.cwd(), 'dist', 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('❌ dist/index.html not found. Run vite build first.');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(indexPath, 'utf8');

  for (const route of allRoutes) {
    if (route === '/') continue; // skip homepage

    console.log(`⏳ Generating SEO tags for ${route}...`);

    let title = 'Self Drive Car & Bike Rental in Guwahati | GoPanda';
    let description = 'Looking for a reliable self drive car rental in Guwahati? GoPanda is a top-rated car rental service in Guwahati, also offering premium bike rental in Guwahati. Book your ride from verified local shops today.';
    let canonicalUrl = `${BASE_URL}${route}`;
    let h1Text = '';
    let pText = '';

    const rentMatch = route.match(/\/rent\/([^\/]+)\/in\/([^\/\?]+)/);
    if (rentMatch) {
      const rawVType = rentMatch[1].toLowerCase();
      const vType = formatStr(rentMatch[1]);
      const city = formatStr(rentMatch[2]);
      
      // Inject variations naturally based on vehicle type
      if (rawVType === 'car') {
        title = `Self Drive Car Rental in ${city} — Best Car Rentals | GoPanda`;
        description = `Looking for a self drive car rental in ${city}? GoPanda is the premier car rental service in ${city}. Find affordable cars from verified local shops and book your ride today.`;
        h1Text = `Self Drive Car Rental in ${city}`;
        pText = `Find self-drive car rentals in ${city} from verified local rental shops. Check available cars, daily prices, pickup details, and booking options before confirming your ride.`;
      } else if (rawVType === 'scooty') {
        title = `Scooty Rental in ${city} — Rent a Scooty Near You | GoPanda`;
        description = `Looking for a scooty rental near you in ${city}? Find the most affordable scooty rentals in ${city} from verified local shops. Easy booking, no hidden fees.`;
        h1Text = `Scooty Rental in ${city}`;
        pText = `Find scooty rentals in ${city} from verified local rental shops. Check available scooties, daily prices, pickup details, and booking options before confirming your ride.`;
      } else if (rawVType === 'bike') {
        title = `Bike Rental in ${city} — Rent a Bike Near You | GoPanda`;
        description = `Looking for a premium bike rental in ${city}? Find the best bike rentals in ${city} from verified local shops. Pay a small token and pick up your ideal two-wheeler today.`;
        h1Text = `Bike Rental in ${city}`;
        pText = `Find bike rentals in ${city} from verified local rental shops. Check available bikes, daily prices, pickup details, and booking options before confirming your ride.`;
      } else {
        title = `Rent ${vType} in ${city} — from local shops | GoPanda`;
        description = `Find ${vType.toLowerCase()} rentals in ${city} from verified local shops. Pay a small token, pick up your ride. No middlemen, no hidden fees.`;
        h1Text = `${vType} Rental in ${city}`;
        pText = `Find ${vType.toLowerCase()} rentals in ${city} from verified local rental shops. Check available options, daily prices, pickup details, and booking options before confirming your ride.`;
      }
    }

    // Replace the tags in the HTML string
    let html = baseHtml;
    html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
    html = html.replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${description}" />`);
    html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${title}" />`);
    html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${description}" />`);
    html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${canonicalUrl}" />`);
    
    // Replace fallback H1 and P if we have specific text
    if (h1Text && pText) {
      html = html.replace(
        /<h1 id="seo-fallback-h1"[^>]*>[\s\S]*?<\/h1>/,
        `<h1 id="seo-fallback-h1" style="font-size:2.25rem;font-weight:700;padding:0 1rem;max-width:1536px;margin:0 auto;">\n  ${h1Text}\n</h1>`
      );
      html = html.replace(
        /<p id="seo-fallback-p"[^>]*>[\s\S]*?<\/p>/,
        `<p id="seo-fallback-p" style="padding:0 1rem;max-width:1536px;margin:0.5rem auto;color:#666;line-height:1.6;">\n    ${pText}\n  </p>`
      );
    }
    
    // Add canonical link before </head> if not already present
    if (!html.includes('rel="canonical"')) {
      html = html.replace('</head>', `  <link rel="canonical" href="${canonicalUrl}" />\n  </head>`);
    }

    // Determine the file path
    const dirPath = path.join('dist', route);
    const filePath = path.join(dirPath, 'index.html');

    // Ensure directory exists
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Save the HTML file
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`✅ Saved ${filePath}`);
  }

  console.log('\n🎉 Static SEO generation complete.');
}

prerender();
