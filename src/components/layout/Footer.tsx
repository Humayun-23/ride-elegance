import { Car } from "lucide-react";

const POPULAR_AREAS = [
  "Guwahati Airport",
  "Paltan Bazaar",
  "GS Road",
  "Six Mile",
  "Khanapara",
  "Ganeshguri",
  "Beltola",
  "Maligaon",
];

const CITIES = [
  { name: "Guwahati", slug: "guwahati", status: "Available Now" },
  { name: "Shillong", slug: "shillong", status: "Coming Soon" },
  { name: "Jorhat", slug: "jorhat", status: "Available Now" },
  { name: "Silchar", slug: "silchar", status: "Coming Soon" },
  { name: "Dibrugarh", slug: "dibrugarh", status: "Coming Soon" },
  { name: "Tezpur", slug: "tezpur", status: "Coming Soon" },
];

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border pt-14 pb-8 text-sm">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5 mb-10">
          <div className="space-y-3">
            <a href="/" className="font-display font-bold text-xl text-foreground tracking-tight flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <Car className="h-5 w-5 text-primary" />
              <span className="text-primary">Go</span>Panda
            </a>
            <p className="text-muted-foreground text-sm leading-relaxed">
              GoPanda helps users book bikes, scooties, and self-drive cars from verified local rental shops.
            </p>
            <div className="space-y-1.5 pt-2">
              {CITIES.map((city) => (
                <p key={city.name} className="text-xs text-muted-foreground">
                  <a
                    href={`/rent/car/in/${city.slug}`}
                    className="font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {city.name}
                  </a> - {city.status}
                </p>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-foreground">Vehicle Rentals</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="/rent/bike/in/guwahati" className="hover:text-primary transition-colors">Bike Rental in Guwahati</a>
              </li>
              <li>
                <a href="/rent/scooty/in/guwahati" className="hover:text-primary transition-colors">Scooty Rental in Guwahati</a>
              </li>
              <li>
                <a href="/rent/car/in/guwahati" className="hover:text-primary transition-colors">Self-Drive Car Rental in Guwahati</a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-foreground">Popular Areas</h4>
            <ul className="space-y-2 text-muted-foreground">
              {POPULAR_AREAS.map((area) => (
                <li key={area}>
                  <a href={`/search-vehicles?q=${encodeURIComponent(area)}`} className="hover:text-primary transition-colors">
                    {area}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-foreground">For Shops</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="/register" className="hover:text-primary transition-colors">List Your Shop</a>
              </li>
              <li>
                <a href="/login" className="hover:text-primary transition-colors">Shop Login</a>
              </li>
              <li>
                <a href="/shops" className="hover:text-primary transition-colors">Rental Shops</a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-foreground">Company</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="/search-vehicles" className="hover:text-primary transition-colors">Rent Vehicles</a>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
              </li>
              <li>
                <a href="/shops" className="hover:text-primary transition-colors">Browse Shops</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between text-muted-foreground">
          <p>© {new Date().getFullYear()} GoPanda. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Built in Assam for local rental businesses.</p>
        </div>
      </div>
    </footer>
  );
}
