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

    let title = 'GoPanda — Best Vehicle Rental Platform Near You';
    let description = 'Looking for the best self-drive car, bike, or scooty rentals in Guwahati? GoPanda offers premium rides from local shops. Book your ideal ride today and explore the city with ease!';
    let canonicalUrl = `${BASE_URL}${route}`;

    const rentMatch = route.match(/\/rent\/([^\/]+)\/in\/([^\/\?]+)/);
    if (rentMatch) {
      const rawVType = rentMatch[1].toLowerCase();
      const vType = formatStr(rentMatch[1]);
      const city = formatStr(rentMatch[2]);
      
      // Inject variations naturally based on vehicle type
      if (rawVType === 'car') {
        title = `Self Drive Car Rental in ${city} — Best Car Rentals | GoPanda`;
        description = `Looking for the best car rental in ${city}? Find affordable self drive car rentals in ${city} from verified local shops. Pay a small token, pick up your ride.`;
      } else if (rawVType === 'scooty') {
        title = `Scooty Rental in ${city} — Rent a Scooty Near You | GoPanda`;
        description = `Looking for a scooty rental in ${city}? Find the best and most affordable scooty rentals in ${city} from verified local shops. Easy booking, no hidden fees.`;
      } else if (rawVType === 'bike') {
        title = `Bike Rental in ${city} — Rent a Bike Near You | GoPanda`;
        description = `Looking for a bike rental in ${city}? Find the best bike rentals in ${city} from verified local shops. Pay a small token, pick up your ride.`;
      } else {
        title = `Rent ${vType} in ${city} — from local shops | GoPanda`;
        description = `Find ${vType.toLowerCase()} rentals in ${city} from verified local shops. Pay a small token, pick up your ride. No middlemen, no hidden fees.`;
      }
    }

    // Replace the tags in the HTML string
    let html = baseHtml;
    html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
    html = html.replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${description}" />`);
    html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${title}" />`);
    html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${description}" />`);
    html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${canonicalUrl}" />`);
    
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
