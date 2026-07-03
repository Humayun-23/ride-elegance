// Static routes
export const staticRoutes = [
  '/',
  '/search-vehicles',
  '/shops',
  '/contact',
  '/about-us',
  '/blog-travel-guides',
  '/cancellation-and-refund-policy',
  '/faq-help-center',
  '/partner-with-us',
  '/privacy-policy',
  '/rental-partner-terms',
  '/rentalos-data-handling',
  '/terms-and-conditions',
  '/trust-and-safety'
];

// Canonical vehicle types × cities — no synonym slugs
export const cities = ['guwahati', 'jorhat', 'dibrugarh', 'tezpur', 'silchar', 'shillong'];
export const vehicles = ['car', 'bike', 'scooty'];

export const seoCombinations = cities.flatMap(city =>
  vehicles.map(vehicle => `/rent/${vehicle}/in/${city}`)
);

export const allRoutes = [...staticRoutes, ...seoCombinations];
