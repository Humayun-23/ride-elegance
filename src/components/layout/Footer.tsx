import { Button } from "@/components/ui/button";

const POPULAR_AREAS = [
  "Guwahati Airport",
  "Paltan Bazaar",
  "GS Road",
  "Six Mile",
  "Khanapara",
  "Ganeshguri",
];

const FOOTER_COLUMNS = [
  {
    title: "Vehicle Rentals",
    links: [
      { label: "Bike Rental in Guwahati", href: "/rent/bike/in/guwahati" },
      { label: "Scooty Rental in Guwahati", href: "/rent/scooty/in/guwahati" },
      { label: "Self-Drive Car Rental in Guwahati", href: "/rent/car/in/guwahati" },
    ],
  },
  {
    title: "Popular Areas",
    links: POPULAR_AREAS.map((area) => ({
      label: area,
      href: `/search-vehicles?q=${encodeURIComponent(area)}`,
    })),
  },
  {
    title: "For Shops",
    links: [
      { label: "List Your Shop", href: "/register" },
      { label: "Shop Login", href: "/login" },
      { label: "Partner With Us", href: "/partner-with-us" },
      { label: "RentalOS", href: "/rentalos" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Blog & Travel Guides", href: "/blog-travel-guides" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "FAQ & Help Center", href: "/faq-help-center" },
      { label: "Trust & Safety", href: "/trust-and-safety" },
      { label: "Terms & Conditions", href: "/terms-and-conditions" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Cancellation Policy", href: "/cancellation-and-refund-policy" },
    ],
  },
];

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div className="space-y-3">
      <h4 className="font-display text-sm font-semibold text-[#010101]">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="text-sm leading-5 text-[#4d5650] transition-colors hover:text-[#3bb881]"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-[#dfeee6] bg-[#f7fbf8] font-body text-sm">
      <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[1.45fr_repeat(5,minmax(0,1fr))]">
          <div className="space-y-5">
            <a href="/" className="inline-flex items-center transition-opacity hover:opacity-80">
              <img src="/logo-green-black.png" alt="GoPanda Logo" className="h-9 w-auto" />
            </a>
            <p className="max-w-[300px] text-sm leading-relaxed text-[#3f4943] text-pretty">
              GoPanda helps users book bikes, scooties, and self-drive cars from verified local rental shops.
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <FooterColumn key={column.title} title={column.title} links={column.links} />
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-[#dfeee6] pt-6 text-sm text-[#5f6963] md:flex-row md:items-center md:justify-between">
          <p>© 2026 GoPanda. All rights reserved.</p>
          <p>Built in Assam for local rental businesses.</p>
        </div>
      </div>
    </footer>
  );
}
