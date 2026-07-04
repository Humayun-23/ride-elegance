// TODO: Remove this demo entry page before real public launch.
// It auto-logs in with demo@gopanda.in / demo1234 and redirects to RentalOS.
// Also delete the /rentalos/demo route in App.tsx and the demo shop from the DB.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Play, Sparkles, ShieldCheck, Zap } from "lucide-react";

const DEMO_EMAIL = "demo@gopanda.in";
const DEMO_PASSWORD = "demo1234";

export default function DemoEntry() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const startDemo = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setError(null);
    try {
      await login(DEMO_EMAIL, DEMO_PASSWORD);
      
      // Evict any stale RentalOS access cache from a prior session so
      // RentalOSLayout re-fetches the demo user's shop access fresh.
      await queryClient.removeQueries({ queryKey: ['rentalos'] });
      
      // Small pause before redirect for smooth transition
      setTimeout(() => navigate("/rentalos", { replace: true }), 600);
    } catch (err: any) {
      setError(err?.message || "Demo account not found. Please ensure the demo account is set up.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Premium subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#3bb881]/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        className="relative z-10 w-full max-w-lg px-6 flex flex-col items-center text-center"
      >
        <img
          src="/wordmark.png"
          alt="GoPanda"
          className="h-10 w-auto object-contain mb-8"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
        
        <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-8 sm:p-10 border border-slate-100 w-full">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#3bb881]/10 text-[#3bb881] rounded-full text-[11px] font-black tracking-widest uppercase mb-6 border border-[#3bb881]/20">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Demo
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight leading-tight mb-4">
            Experience the future of rental management.
          </h1>
          
          <p className="text-[15px] font-medium text-slate-500 leading-relaxed mb-8">
            You are about to enter a fully functional sandbox environment. Feel free to explore, create bookings, manage fleets, and test every feature. 
            <br className="hidden sm:block" /> No real transactions will be made.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mb-10">
            <div className="flex gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[13px] font-black text-slate-800">Test Everything</h4>
                <p className="text-[12px] font-semibold text-slate-500 mt-0.5">All premium features are unlocked for you.</p>
              </div>
            </div>
            <div className="flex gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[13px] font-black text-slate-800">Safe Sandbox</h4>
                <p className="text-[12px] font-semibold text-slate-500 mt-0.5">Feel free to add fake data. It won't break.</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[13px] font-bold flex flex-col items-center">
              <span>{error}</span>
              <button onClick={() => navigate("/login")} className="mt-2 text-red-700 underline hover:text-red-900">
                Go to standard login
              </button>
            </div>
          )}

          <button
            onClick={startDemo}
            disabled={isProcessing}
            className="w-full h-14 rounded-2xl bg-[#3bb881] hover:bg-[#32a06f] text-white font-black text-[15px] shadow-[0_10px_30px_-10px_rgba(59,184,129,0.5)] transition-all hover:shadow-[0_15px_40px_-10px_rgba(59,184,129,0.6)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Enter Demo Shop <Play className="w-4 h-4 fill-white" />
              </>
            )}
          </button>
        </div>
        
        <p className="text-[12px] font-bold text-slate-400 mt-8">
          By entering, you acknowledge this is a demonstration environment.
        </p>
      </motion.div>
    </div>
  );
}
