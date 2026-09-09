import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PageShell } from "@/components/palace/PageShell";
import { Upload, CheckCircle, ChevronRight, Copy, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { usePaymentSettings } from "@/lib/api";
import { compressImage } from "@/lib/imageCompression";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Payment() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = params.get("booking_id");
  const { data: settings, isLoading: settingsLoading } = usePaymentSettings();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [file, setFile] = useState<File | null>(null);
  const [txnId, setTxnId] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (!bookingId) {
      navigate("/rooms");
      return;
    }

    const fetchBooking = async () => {
      const { data, error } = await supabase.from("bookings").select("*").eq("id", bookingId).single();
      if (error || !data) {
        toast.error("Booking not found");
        navigate("/rooms");
        return;
      }
      
      // Fetch category manually to avoid missing foreign key issues
      const { data: catData } = await supabase.from("room_categories").select("name").eq("id", data.room_id).single();
      
      setBooking({ ...data, rooms: catData });
      setLoading(false);
    };

    fetchBooking();
  }, [bookingId, navigate]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    
    if (selected.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type)) {
      toast.error("Only JPG, PNG and WEBP are allowed");
      return;
    }

    setFile(selected);
    const objectUrl = URL.createObjectURL(selected);
    setPreview(objectUrl);
  };

  const submitPayment = async () => {
    if (!file) { toast.error("Please upload the payment screenshot"); return; }
    if (!txnId.trim()) { toast.error("Please enter the Transaction ID"); return; }
    
    setIsSubmitting(true);
    try {
      // 1. Compress and Upload screenshot
      const optimizedFile = await compressImage(file);
      const fileExt = "webp";
      const fileName = `${booking.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(fileName, optimizedFile);
        
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("payment-proofs")
        .getPublicUrl(fileName);

      // 2. Insert into manual_payment_submissions
      const { error: insertError } = await supabase.from("manual_payment_submissions").insert({
        booking_id: booking.id,
        guest_name: booking.guest_name,
        guest_email: booking.guest_email,
        guest_phone: booking.guest_phone,
        transaction_id: txnId,
        payment_amount: booking.advance_amount,
        screenshot_url: publicUrl,
        payment_notes: notes
      });

      if (insertError) throw insertError;

      // 3. Update booking status
      const { error: updateError } = await supabase.from("bookings").update({
        booking_status: 'pending',
        payment_status: 'pending'
      }).eq("id", booking.id);

      if (updateError) throw updateError;

      // 4. Navigate to success
      navigate(`/booking-success?type=manual&id=${booking.booking_number}`);

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to submit payment verification");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || settingsLoading) {
    return <div className="min-h-screen bg-royal-deep flex items-center justify-center text-gold"><Loader2 className="animate-spin" /></div>;
  }

  if (settings && settings.manual_payment_enabled === false) {
    return (
      <PageShell title="Payment Unavailable">
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
          <AlertCircle size={48} className="text-saffron mb-4" />
          <h1 className="font-display text-4xl text-foreground mb-4">Manual Payments Disabled</h1>
          <p className="font-serif text-muted-foreground max-w-md">The manual payment gateway is currently offline. Please contact the front desk.</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Verify Payment — Raj Mandir Hotel">
      <div className="pt-32 pb-24 px-6 max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
        
        {/* LEFT: PAYMENT INSTRUCTIONS & QR */}
        <div className="space-y-8 animate-fade-in">
          <div>
            <div className="eyebrow mb-2">★ SECURE RESERVATION ★</div>
            <h1 className="font-display text-4xl text-foreground mb-4">Complete Your Payment</h1>
            <p className="font-serif text-muted-foreground italic">
              Please complete the advance payment of {settings.advance_percentage}% to secure your royal chamber.
            </p>
          </div>

          <div className="bg-card/40 border border-gold/30 p-8 shadow-frame text-center">
            {settings.qr_image_url ? (
              <img src={settings.qr_image_url} alt="UPI QR Code" className="w-64 h-64 object-contain mx-auto mb-6 bg-white p-2 rounded-sm shadow-md" />
            ) : (
              <div className="w-64 h-64 mx-auto mb-6 bg-muted flex items-center justify-center border border-gold/20 text-muted-foreground font-serif italic text-sm">
                QR Code Not Configured
              </div>
            )}
            
            <div className="space-y-2">
              <div className="font-serif-sc text-xs tracking-widest text-gold">ACCOUNT NAME</div>
              <div className="font-display text-2xl text-foreground">{settings.account_name}</div>
              
              <div className="font-serif-sc text-xs tracking-widest text-gold mt-6">UPI ID</div>
              <div className="flex items-center justify-center gap-3">
                <div className="font-serif text-lg text-foreground bg-muted px-4 py-2 rounded-sm border border-gold/20">{settings.upi_id}</div>
                <button 
                  onClick={() => { navigator.clipboard.writeText(settings.upi_id || ""); toast.success("UPI ID Copied!"); }}
                  className="p-2 bg-gold/10 text-gold hover:bg-gold hover:text-royal-deep transition-colors"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </div>

          {settings.payment_instructions && (
            <div className="bg-gradient-night p-8 border border-gold/20 shadow-sm text-ivory">
              <h3 className="font-serif-sc text-xs tracking-widest text-gold mb-4">PAYMENT INSTRUCTIONS</h3>
              <div className="prose prose-invert prose-gold font-serif prose-sm whitespace-pre-wrap">
                {settings.payment_instructions}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: BOOKING SUMMARY & UPLOAD FORM */}
        <div className="space-y-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          
          <div className="bg-card border border-gold/30 p-8 shadow-frame">
            <h3 className="font-serif-sc text-xs tracking-widest text-gold border-b border-gold/20 pb-4 mb-6">RESERVATION LEDGER</h3>
            <div className="space-y-4 font-serif text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Booking ID</span> <span className="text-foreground">{booking.booking_number}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Chamber</span> <span className="text-foreground">{booking.rooms?.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Guest Name</span> <span className="text-foreground">{booking.guest_name}</span></div>
              
              <div className="my-6 border-t border-gold/20 pt-6 space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Total Tariff</span> <span className="text-foreground">₹ {Number(booking.total_price).toLocaleString()}</span></div>
                <div className="flex justify-between items-center">
                  <span className="font-serif-sc tracking-widest text-gold text-xs">ADVANCE ({settings.advance_percentage}%)</span> 
                  <span className="font-display text-3xl text-gold-gradient">₹ {Number(booking.advance_amount).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-gold/30 p-8 shadow-frame">
            <h3 className="font-serif-sc text-xs tracking-widest text-gold border-b border-gold/20 pb-4 mb-6">SUBMIT PAYMENT PROOF</h3>
            
            <div className="space-y-6">
              
              {/* File Upload */}
              <div>
                <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-3">PAYMENT SCREENSHOT *</label>
                {!preview ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gold/30 bg-muted/30 hover:bg-gold/5 transition-colors cursor-pointer group">
                    <Upload className="text-gold/50 group-hover:text-gold mb-2 transition-colors" size={24} />
                    <span className="font-serif text-sm text-muted-foreground group-hover:text-foreground transition-colors">Click to upload screenshot (Max 5MB)</span>
                    <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.webp" onChange={handleFile} />
                  </label>
                ) : (
                  <div className="relative w-full h-48 bg-black/20 border border-gold/30 flex items-center justify-center overflow-hidden">
                    <img src={preview} alt="Preview" className="max-h-full object-contain" />
                    <button onClick={() => { setFile(null); setPreview(""); }} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-sm shadow-md">
                      <AlertCircle size={16} />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 text-xs font-serif-sc tracking-wider flex items-center gap-1 shadow-md">
                      <CheckCircle size={12} /> ATTACHED
                    </div>
                  </div>
                )}
              </div>

              {/* TXN ID */}
              <div>
                <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-3">TRANSACTION ID (UTR / REF NO) *</label>
                <input 
                  type="text" 
                  value={txnId}
                  maxLength={50}
                  onChange={(e) => setTxnId(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                  placeholder="e.g. TXN9384729384"
                  className="w-full bg-transparent border-b border-gold/40 focus:border-gold outline-none px-1 py-3 font-serif text-lg text-foreground transition-colors"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-3">OPTIONAL NOTES</label>
                <input 
                  type="text" 
                  value={notes}
                  maxLength={200}
                  onChange={(e) => setNotes(e.target.value.replace(/[<>]/g, ''))}
                  placeholder="e.g. Paid via Google Pay from John's account"
                  className="w-full bg-transparent border-b border-gold/40 focus:border-gold outline-none px-1 py-3 font-serif text-lg text-foreground transition-colors"
                />
              </div>

              <button
                onClick={submitPayment}
                disabled={isSubmitting || !file || !txnId}
                className={cn(
                  "w-full py-4 mt-4 font-serif-sc tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-2",
                  file && txnId && !isSubmitting
                    ? "bg-gradient-gold text-royal-deep hover:shadow-gold"
                    : "bg-gold/20 text-gold/50 cursor-not-allowed"
                )}
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : "SUBMIT FOR VERIFICATION"} <ChevronRight size={16} />
              </button>

            </div>
          </div>

        </div>
      </div>
    </PageShell>
  );
}
