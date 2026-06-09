import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/common/SEO";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <SEO title="Page Not Found | GoPanda" noindex={true} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(45_100%_51%/0.04),transparent_50%)]" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8 relative z-10"
      >
        <div className="space-y-2">
          <p className="font-display text-8xl md:text-9xl font-bold text-gradient">404</p>
          <h1 className="font-display text-xl md:text-2xl font-bold">Page not found</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Looks like this road doesn't exist. Let's get you back on track.
          </p>
        </div>
        <Button asChild className="font-display gap-2 rounded-xl glow">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
