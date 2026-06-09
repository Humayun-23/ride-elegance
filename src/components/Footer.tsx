import { Car, Store } from "lucide-react";

const CITIES = ['guwahati', 'jorhat', 'dibrugarh', 'tezpur', 'silchar', 'shillong'];
const VEHICLE_TYPES = [
  { slug: 'car', label: 'Car' },
  { slug: 'bike', label: 'Bike' },
  { slug: 'scooty', label: 'Scooty' },
];

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border pt-14 pb-8 text-sm">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <a href="/" className="font-display font-bold text-xl text-foreground tracking-tight flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <Car className="h-5 w-5 text-primary" />
              <span className="text-primary">Go</span>Panda
            </a>
            <p className="text-muted-foreground pr-4 text-sm leading-relaxed">
              We connect you with <strong>local rental shops</strong> in Guwahati and across Assam. Find a ride, book it, go.
            </p>
          </div>

          {/* Rent by City — Cars */}
          <div className="space-y-3">
            <h4 className="font-bold text-foreground">Car Rental</h4>
            <ul className="space-y-2 text-muted-foreground">
              {CITIES.map((city) => (
                <li key={city}>
                  <a href={`/rent/car/in/${city}`} className="hover:text-primary transition-colors">
                    Car rental in {titleCase(city)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Rent by City — Bikes */}
          <div className="space-y-3">
            <h4 className="font-bold text-foreground">Bike Rental</h4>
            <ul className="space-y-2 text-muted-foreground">
              {CITIES.map((city) => (
                <li key={city}>
                  <a href={`/rent/bike/in/${city}`} className="hover:text-primary transition-colors">
                    Bike rental in {titleCase(city)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Rent by City — Scooty */}
          <div className="space-y-3">
            <h4 className="font-bold text-foreground">Scooty Rental</h4>
            <ul className="space-y-2 text-muted-foreground">
              {CITIES.map((city) => (
                <li key={city}>
                  <a href={`/rent/scooty/in/${city}`} className="hover:text-primary transition-colors">
                    Scooty rental in {titleCase(city)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links + Partners + Legal */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-6">
              <div className="space-y-3">
                <h4 className="font-bold text-foreground">Explore</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <a href="/search-vehicles" className="hover:text-primary transition-colors">Search Vehicles</a>
                  </li>
                  <li>
                    <a href="/shops" className="hover:text-primary transition-colors">Browse Shops</a>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-foreground">Partners</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <a href="/register" className="hover:text-primary transition-colors">Register Shop</a>
                  </li>
                  <li>
                    <a href="/login" className="hover:text-primary transition-colors">Shop Login</a>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-foreground">Legal</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between text-muted-foreground">
          <p>© {new Date().getFullYear()} GoPanda. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Made with ❤️ in Assam for local businesses.</p>
        </div>
      </div>
    </footer>
  );
}
