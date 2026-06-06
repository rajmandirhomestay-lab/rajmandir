import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { PageShell } from "@/components/palace/PageShell";

const BookingFailed = () => {
  const [params] = useSearchParams();
  const error = params.get("error");

  return (
    <PageShell title="Booking Failed" description="There was an issue sealing your reservation.">
      <div className="min-h-screen pt-32 pb-24 px-6 flex items-center justify-center marble-texture">
        <div className="relative max-w-xl w-full p-12 text-center bg-card backdrop-blur-md border border-saffron/50 shadow-[0_0_40px_rgba(200,80,50,0.1)] animate-scale-in">
          <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-saffron" />
          <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-saffron" />
          <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-saffron" />
          <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-saffron" />

          <div className="mx-auto mb-6 w-20 h-20 jharokha border border-saffron/30 bg-saffron/5 flex items-center justify-center">
            <AlertCircle className="text-saffron" size={36} strokeWidth={2} />
          </div>
          <div className="eyebrow mb-3 text-saffron">★ PAYMENT INTERRUPTED ★</div>
          <h2 className="font-display text-4xl text-foreground mb-4">
            Payment Failed
          </h2>
          <div className="divider-gold max-w-xs mx-auto my-6"><span className="text-saffron">❖</span></div>
          
          <p className="font-serif text-lg text-foreground mb-6">
            We could not secure the advance payment for your reservation. 
            {error && <span className="block mt-2 text-saffron font-serif italic text-sm">{error}</span>}
          </p>

          <p className="font-serif italic text-muted-foreground mt-6 text-sm">
            Your selected dates remain unlocked. Please try again or contact the palace directly.
          </p>
          <div className="mt-8 flex gap-3 justify-center">
            <Link to="/contact" className="px-6 py-3 border border-saffron/50 text-foreground font-serif-sc tracking-[0.2em] text-[11px] hover:border-saffron hover:bg-saffron/5 transition-all">
              CONTACT PALACE
            </Link>
            <Link to="/booking" className="px-6 py-3 bg-saffron text-white font-serif-sc tracking-[0.2em] text-[11px] hover:bg-saffron/90 transition-all">
              RETRY BOOKING
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default BookingFailed;
