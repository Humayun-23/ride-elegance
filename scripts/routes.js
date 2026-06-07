// Static routes
export const staticRoutes = [
  '/',
  '/search-vehicles',
  '/shops'
];

// Canonical vehicle types × cities — no synonym slugs
export const cities = ['guwahati', 'jorhat', 'dibrugarh', 'tezpur', 'silchar', 'shillong'];
export const vehicles = ['car', 'bike', 'scooty'];

export const seoCombinations = cities.flatMap(city =>
  vehicles.map(vehicle => `/rent/${vehicle}/in/${city}`)
);

export const allRoutes = [...staticRoutes, ...seoCombinations];
