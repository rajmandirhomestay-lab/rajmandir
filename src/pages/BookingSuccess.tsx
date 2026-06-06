import { Link, useSearchParams } from "react-router-dom";
import { Check } from "lucide-react";
import { PageShell } from "@/components/palace/PageShell";

const BookingSuccess = () => {
  const [params] = useSearchParams();
  const id = params.get("id");

  return (
    <PageShell title="Booking Confirmed" description="Your reservation has been sealed.">
      <div className="min-h-screen pt-32 pb-24 px-6 flex items-center justify-center marble-texture">
        <div className="relative max-w-xl w-full p-12 text-center bg-card backdrop-blur-md border border-gold/50 shadow-gold animate-scale-in">
          <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold" />
          <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold" />
          <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold" />
          <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold" />

          <div className="mx-auto mb-6 w-20 h-20 jharokha bg-gradient-gold flex items-center justify-center shadow-gold">
            <Check className="text-royal-deep" size={36} strokeWidth={3} />
          </div>
          <div className="eyebrow mb-3">★ RESERVATION SEALED ★</div>
          <h2 className="font-display text-4xl text-foreground mb-4">
            Payment Successful
          </h2>
          <div className="divider-gold max-w-xs mx-auto my-6"><span className="text-gold">❖</span></div>
          
          <p className="font-serif text-lg text-foreground mb-6">
            Your booking has been confirmed and the advance payment was received successfully.
          </p>

          {id && (
            <div className="bg-gold/5 border border-gold/30 p-4 mb-8">
              <span className="font-serif-sc tracking-widest text-[10px] text-muted-foreground block mb-1">PAYMENT ID</span>
              <span className="font-display text-gold text-xl">{id}</span>
            </div>
          )}

          <p className="font-serif italic text-muted-foreground mt-6 text-sm">
            A confirmation parchment shall arrive at your email shortly.
          </p>
          <div className="mt-8 flex gap-3 justify-center">
            <Link to="/" className="px-6 py-3 border border-gold/50 text-foreground font-serif-sc tracking-[0.2em] text-[11px] hover:border-gold hover:bg-gold/5 transition-all">
              RETURN TO PALACE
            </Link>
            <button onClick={() => window.print()} className="px-6 py-3 bg-gradient-gold text-royal-deep font-serif-sc tracking-[0.2em] text-[11px] shadow-gold hover:scale-105 transition-all">
              PRINT PARCHMENT
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default BookingSuccess;
