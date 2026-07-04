
interface LoadingStateProps {
  text?: string;
  type?: "default" | "rentalos";
}

let hasPlayedAnimationThisSession = false;

export function LoadingState({ text = "Loading...", type = "default" }: LoadingStateProps) {
  if (type === "rentalos") {
    const animateClass = hasPlayedAnimationThisSession ? "rentalos-no-animate" : "";
    hasPlayedAnimationThisSession = true;

    return (
      <div className="rentalos-loading-screen" role="status" aria-label="Loading RentalOS dashboard">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 286.68 93.26" className={`rentalos-loading-logo ${animateClass}`}><defs><style>{`.cls-dash-1,.cls-dash-2,.cls-dash-3{fill:#fff;}.cls-dash-2{font-size:40px;font-family:Poppins-SemiBold, Poppins;font-weight:600;}.cls-dash-3{font-size:27px;font-family:Poppins-Regular, Poppins;}`}</style></defs><g><g><rect className="cls-dash-1" x="20.46" y="34.83" width="35.45" height="11.42" rx="2.92" /><path className="cls-dash-1" d="M74.53,44.6A37.66,37.66,0,1,1,27.24.68a1.87,1.87,0,0,1,2.37,2.17l-2.09,10a1.25,1.25,0,0,1-.69.86A25.59,25.59,0,1,0,50.6,14.8a1.56,1.56,0,0,0-2.3,1L43.5,38.65l-9.92-2.07L40.8,2.22A2.79,2.79,0,0,1,44.13.07a43.85,43.85,0,0,1,16.24,6.8A36.79,36.79,0,0,1,72.9,23.55,37.7,37.7,0,0,1,74.53,44.6Z" /><text className="cls-dash-2" transform="translate(92.75 50.37)">GoPanda</text><path className="cls-dash-1" d="M54,2.22l-.74-.14,0-.19Z" /><path className="cls-dash-1" d="M54.14,2.25v0L54,2.22Z" /><text className="cls-dash-3" transform="translate(129.35 77.81)">Dashboard</text></g></g></svg>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 328.96 38.37" className={`rentalos-loading-tagline ${animateClass}`}><defs><style>{`.cls-owner{font-size:27px;fill:#fff;font-family:Poppins-Regular, Poppins;letter-spacing:0.12em;}`}</style></defs><g><g><text className="cls-owner" transform="translate(0 22.92)">FOR RENTAL OWNERS</text></g></g></svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6" style={{ animation: 'fadeIn 0.5s ease-out' }}>
        <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
        <div className="flex items-center justify-center">
          <img src="/logo.png" alt="GoPanda Logo" className="h-12 w-auto object-contain drop-shadow-sm" />
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
          {text && <span className="text-[11px] text-muted-foreground uppercase tracking-[0.2em] font-medium">{text}</span>}
        </div>
      </div>
    </div>
  );
}
