import { useState } from "react";
import { Check, X, Maximize2, ExternalLink, Calendar, MessageSquare, AlertCircle, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useManualPayments } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function ManualPaymentsCMS() {
  const { data: payments, isLoading, refetch } = useManualPayments();
  const [selectedImg, setSelectedImg] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});

  const handleVerify = async (id: string, bookingId: string, status: 'approved' | 'rejected') => {
    setIsProcessing(true);
    try {
      // 1. Update Manual Payment Status
      const { error: paymentError } = await supabase.from("manual_payment_submissions").update({
        verification_status: status,
        admin_notes: adminNotes[id] || null,
        verified_at: new Date().toISOString()
      }).eq("id", id);

      if (paymentError) throw paymentError;

      // 2. Update Booking Status
      const bookingStatus = status === 'approved' ? 'confirmed' : 'payment_rejected';
      const paymentStatus = status === 'approved' ? 'paid' : 'rejected';

      const { error: bookingError } = await supabase.from("bookings").update({
        booking_status: bookingStatus,
        payment_status: paymentStatus
      }).eq("id", bookingId);

      if (bookingError) throw bookingError;

      toast.success(`Payment successfully ${status}`);
      refetch();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this payment submission? This cannot be undone.")) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase.from("manual_payment_submissions").delete().eq("id", id);
      if (error) throw error;
      toast.success("Payment submission deleted");
      refetch();
    } catch (err: any) {
      toast.error(`Error deleting: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="text-gold">Loading payments...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-4xl text-foreground mb-2">Manual Payments</h1>
        <p className="font-serif text-muted-foreground">Verify uploaded payment screenshots from guests.</p>
      </div>

      <div className="space-y-4">
        {payments?.length === 0 ? (
          <div className="p-8 text-center border border-gold/20 text-muted-foreground font-serif italic">
            No manual payment submissions found.
          </div>
        ) : (
          payments?.map((payment: any) => (
            <div key={payment.id} className="bg-card border border-gold/30 p-6 shadow-frame flex flex-col lg:flex-row gap-6 items-start">
              
              {/* IMAGE PREVIEW */}
              <div className="relative w-full lg:w-48 h-48 bg-black/40 border border-gold/20 flex items-center justify-center shrink-0 group">
                <img src={payment.screenshot_url} alt="Proof" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                <button 
                  onClick={() => setSelectedImg(payment.screenshot_url)}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white"
                >
                  <Maximize2 size={24} />
                </button>
              </div>

              {/* DETAILS */}
              <div className="flex-1 space-y-4 w-full">
                <div className="flex flex-wrap justify-between items-start gap-4 border-b border-gold/20 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display text-xl text-foreground">{payment.bookings?.booking_number}</span>
                      <span className={cn(
                        "px-2 py-0.5 text-[10px] font-serif-sc tracking-widest",
                        payment.verification_status === 'pending' ? "bg-saffron/20 text-saffron" : 
                        payment.verification_status === 'approved' ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                      )}>
                        {payment.verification_status.toUpperCase()}
                      </span>
                    </div>
                    <div className="font-serif italic text-sm text-muted-foreground mb-2">
                      {payment.guest_name} • {payment.guest_email} • {payment.guest_phone}
                    </div>
                    <button 
                      onClick={() => handleDelete(payment.id)}
                      disabled={isProcessing}
                      className="text-xs font-serif-sc tracking-widest text-red-500/70 hover:text-red-400 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 size={12} /> DELETE SUBMISSION
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="font-serif-sc text-xs text-gold tracking-widest">AMOUNT CLAIMED</div>
                    <div className="font-display text-2xl text-gold-gradient">₹ {Number(payment.payment_amount).toLocaleString()}</div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 text-sm font-serif">
                  <div>
                    <div className="text-muted-foreground mb-1 font-serif-sc text-[10px] tracking-widest text-gold">TXN ID</div>
                    <div className="text-foreground bg-muted/50 px-2 py-1 rounded inline-block border border-gold/10 font-mono text-xs">{payment.transaction_id}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1 font-serif-sc text-[10px] tracking-widest text-gold">SUBMITTED ON</div>
                    <div className="text-foreground flex items-center gap-2"><Calendar size={14}/> {format(new Date(payment.created_at), "PPp")}</div>
                  </div>
                </div>

                {payment.payment_notes && (
                  <div className="bg-gold/5 p-3 border-l-2 border-gold font-serif italic text-sm text-foreground">
                    "{payment.payment_notes}"
                  </div>
                )}

                {/* VERIFICATION ACTIONS */}
                {payment.verification_status === 'pending' && (
                  <div className="pt-4 mt-4 border-t border-gold/20">
                    <div className="mb-3">
                      <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">ADMIN INTERNAL NOTES (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="Reason for rejection or verification notes..."
                        value={adminNotes[payment.id] || ""}
                        onChange={(e) => setAdminNotes({ ...adminNotes, [payment.id]: e.target.value })}
                        className="w-full bg-background border border-gold/20 p-2 text-foreground focus:border-gold outline-none text-sm"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleVerify(payment.id, payment.booking_id, 'approved')}
                        disabled={isProcessing}
                        className="flex-1 bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-600/50 py-2 font-serif-sc text-xs tracking-widest transition-colors flex items-center justify-center gap-2"
                      >
                        <Check size={14} /> APPROVE PAYMENT
                      </button>
                      <button 
                        onClick={() => handleVerify(payment.id, payment.booking_id, 'rejected')}
                        disabled={isProcessing}
                        className="flex-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/50 py-2 font-serif-sc text-xs tracking-widest transition-colors flex items-center justify-center gap-2"
                      >
                        <X size={14} /> REJECT
                      </button>
                    </div>
                  </div>
                )}

                {payment.verification_status !== 'pending' && payment.admin_notes && (
                   <div className="pt-2 text-xs font-serif text-muted-foreground flex items-center gap-1">
                     <AlertCircle size={12}/> Admin Note: {payment.admin_notes}
                   </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* FULLSCREEN IMAGE MODAL */}
      {selectedImg && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedImg("")}>
          <div className="relative max-w-4xl max-h-screen">
            <button onClick={() => setSelectedImg("")} className="absolute -top-10 right-0 text-white hover:text-gold transition-colors">
              <X size={32} />
            </button>
            <img src={selectedImg} alt="Fullscreen Proof" className="max-w-full max-h-[90vh] object-contain border border-gold/30 shadow-gold" />
            <a href={selectedImg} target="_blank" rel="noreferrer" className="absolute -bottom-10 right-0 flex items-center gap-2 text-gold hover:text-white transition-colors text-sm font-serif-sc tracking-widest" onClick={(e) => e.stopPropagation()}>
              OPEN ORIGINAL <ExternalLink size={14} />
            </a>
          </div>
        </div>
      )}

    </div>
  );
}
