import { Lock, Phone, ArrowRight } from 'lucide-react';

export default function Paywall({ shopName }: { shopName: string }) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-gradient-to-br from-background to-secondary/10">
      <div className="max-w-md w-full bg-card rounded-2xl shadow-xl border overflow-hidden p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
          <Lock className="w-10 h-10 text-primary" />
        </div>
        
        <h2 className="text-3xl font-bold tracking-tight">RentalOS Locked</h2>
        
        <p className="text-muted-foreground text-lg">
          The RentalOS access for <span className="font-semibold text-foreground">{shopName}</span> requires an active subscription. 
        </p>
        
        <div className="bg-secondary/30 rounded-xl p-6 mt-4">
          <h3 className="font-semibold text-lg mb-2">Unlock Premium Features</h3>
          <ul className="text-sm text-muted-foreground space-y-2 text-left mb-4 list-disc list-inside">
            <li>Manage offline counter bookings</li>
            <li>Digital document verification</li>
            <li>Advanced staff & fleet management</li>
            <li>Detailed financial analytics</li>
          </ul>
        </div>

        <div className="pt-4 space-y-4">
          <a href="tel:+918638578854" className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-4 rounded-xl font-medium hover:bg-primary/90 transition-colors">
            <Phone className="w-5 h-5" />
            Contact Support to Activate
          </a>
          
          <button onClick={() => window.location.href = '/'} className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground py-2 transition-colors">
            Return to Homepage <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
