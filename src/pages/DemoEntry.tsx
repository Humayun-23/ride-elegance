// TODO: Remove this demo entry page before real public launch.
// It auto-logs in with demo@gopanda.in / demo1234 and redirects to RentalOS.
// Also delete the /rentalos/demo route in App.tsx and the demo shop from the DB.
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

const DEMO_EMAIL = "demo@gopanda.in";
const DEMO_PASSWORD = "demo1234";

const steps = [
  "Authenticating demo account…",
  "Loading RentalOS workspace…",
  "Preparing your demo environment…",
];

export default function DemoEntry() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const run = async () => {
      // Animate through steps with slight delays for UX
      const stepTimer1 = setTimeout(() => setStepIndex(1), 800);
      const stepTimer2 = setTimeout(() => setStepIndex(2), 1600);

      try {
        await login(DEMO_EMAIL, DEMO_PASSWORD);
        clearTimeout(stepTimer1);
        clearTimeout(stepTimer2);
        // Evict any stale RentalOS access cache from a prior session so
        // RentalOSLayout re-fetches the demo user's shop access fresh.
        await queryClient.removeQueries({ queryKey: ['rentalos'] });
        // Small pause at last step before redirect
        setTimeout(() => navigate("/rentalos", { replace: true }), 400);
      } catch (err: any) {
        clearTimeout(stepTimer1);
        clearTimeout(stepTimer2);
        setError(err?.message || "Demo account not found. Please ensure the demo account is set up.");
      }
    };

    run();
  }, [login, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Ambient gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(152_45%_36%/0.08),transparent_65%)]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center gap-8 text-center px-6 max-w-sm"
      >
        {/* Logo */}
        <img
          src="/wordmark.png"
          alt="GoPanda"
          className="h-9 w-auto object-contain"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />

        {error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-4 items-center"
          >
            <div className="h-12 w-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-2xl">
              ⚠️
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">Demo unavailable</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="text-sm text-primary hover:underline font-medium"
            >
              Go to login →
            </button>
          </motion.div>
        ) : (
          <>
            {/* Spinner ring */}
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full border-4 border-border/30" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
              <div className="absolute inset-[10px] rounded-full bg-primary/10 flex items-center justify-center text-xl">
                🏍️
              </div>
            </div>

            {/* Animated step text */}
            <div className="h-6 flex items-center">
              <motion.p
                key={stepIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-muted-foreground"
              >
                {steps[stepIndex]}
              </motion.p>
            </div>

            {/* Progress dots */}
            <div className="flex gap-2">
              {steps.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    backgroundColor: i <= stepIndex ? "hsl(152 45% 36%)" : "hsl(var(--border))",
                    scale: i === stepIndex ? 1.3 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  className="h-1.5 w-1.5 rounded-full"
                />
              ))}
            </div>

            <p className="text-xs text-muted-foreground/60">
              This is a read-only demo of GoPanda RentalOS
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
