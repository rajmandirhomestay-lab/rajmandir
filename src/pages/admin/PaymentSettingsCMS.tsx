import { useState, useEffect } from "react";
import { Save, Upload, AlertCircle, CheckCircle, Smartphone } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { usePaymentSettings } from "@/lib/api";
import { toast } from "sonner";
import { compressImage } from "@/lib/imageCompression";
import { cn } from "@/lib/utils";

export default function PaymentSettingsCMS() {
  const { data: settings, isLoading } = usePaymentSettings();
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (settings) {
      setFormData(settings);
      setPreview(settings.qr_image_url || "");
    }
  }, [settings]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    
    if (selected.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let qrUrl = formData.qr_image_url;

      if (file) {
        const optimizedFile = await compressImage(file);
        const fileExt = "webp";
        const fileName = `${Date.now()}-qr.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("payment-assets")
          .upload(fileName, optimizedFile);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("payment-assets")
          .getPublicUrl(fileName);
        
        qrUrl = publicUrl;
      }

      const updates = { ...formData, qr_image_url: qrUrl, updated_at: new Date() };

      if (settings?.id) {
        await supabase.from("payment_settings").update(updates).eq("id", settings.id);
      } else {
        await supabase.from("payment_settings").insert([updates]);
      }

      toast.success("Payment settings updated successfully");
    } catch (err: any) {
      toast.error("Failed to save settings: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="text-gold">Loading...</div>;

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      <div>
        <h1 className="font-display text-4xl text-foreground mb-2">Payment Settings</h1>
        <p className="font-serif text-muted-foreground">Manage manual payment gateway, UPI details, and QR codes.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* SETTINGS FORM */}
        <div className="space-y-6">
          <div className="bg-card border border-gold/30 p-6 shadow-frame space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-gold/20">
              <div>
                <div className="font-serif-sc text-sm text-gold tracking-widest">MANUAL PAYMENTS</div>
                <div className="text-xs text-muted-foreground mt-1">Enable to bypass Razorpay and show QR code</div>
              </div>
              <button
                onClick={() => setFormData({ ...formData, manual_payment_enabled: !formData.manual_payment_enabled })}
                className={cn("w-14 h-7 rounded-full transition-colors relative", formData.manual_payment_enabled ? "bg-green-500" : "bg-muted")}
              >
                <div className={cn("w-5 h-5 bg-white rounded-full absolute top-1 transition-all", formData.manual_payment_enabled ? "left-8" : "left-1")} />
              </button>
            </div>

            <div>
              <label className="font-serif-sc text-xs tracking-widest text-muted-foreground block mb-2">ADVANCE PERCENTAGE</label>
              <select 
                value={formData.advance_percentage || 30} 
                onChange={(e) => setFormData({ ...formData, advance_percentage: parseInt(e.target.value) })}
                className="w-full bg-background border border-gold/20 p-3 text-foreground focus:border-gold outline-none"
              >
                <option value={10}>10% Advance</option>
                <option value={20}>20% Advance</option>
                <option value={30}>30% Advance (Recommended)</option>
                <option value={50}>50% Advance</option>
                <option value={100}>100% (Full Payment)</option>
              </select>
            </div>

            <div>
              <label className="font-serif-sc text-xs tracking-widest text-muted-foreground block mb-2">ACCOUNT NAME</label>
              <input
                type="text"
                value={formData.account_name || ""}
                onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                className="w-full bg-background border border-gold/20 p-3 text-foreground focus:border-gold outline-none"
                placeholder="Raj Mandir Hotel"
              />
            </div>

            <div>
              <label className="font-serif-sc text-xs tracking-widest text-muted-foreground block mb-2">UPI ID</label>
              <input
                type="text"
                value={formData.upi_id || ""}
                onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                className="w-full bg-background border border-gold/20 p-3 text-foreground focus:border-gold outline-none"
                placeholder="rajmandir@upi"
              />
            </div>

            <div>
              <label className="font-serif-sc text-xs tracking-widest text-muted-foreground block mb-2">PAYMENT INSTRUCTIONS (Shown to guest)</label>
              <textarea
                value={formData.payment_instructions || ""}
                onChange={(e) => setFormData({ ...formData, payment_instructions: e.target.value })}
                className="w-full bg-background border border-gold/20 p-3 text-foreground focus:border-gold outline-none h-32"
                placeholder="Enter instructions..."
              />
            </div>

            <div>
              <label className="font-serif-sc text-xs tracking-widest text-muted-foreground block mb-2">QR CODE IMAGE</label>
              <div className="flex gap-4 items-start">
                {preview ? (
                  <div className="relative w-32 h-32 border border-gold/30 bg-white p-2">
                    <img src={preview} alt="QR Preview" className="w-full h-full object-contain" />
                    <button onClick={() => { setFile(null); setPreview(""); setFormData({ ...formData, qr_image_url: "" }); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><AlertCircle size={14}/></button>
                  </div>
                ) : (
                  <label className="w-32 h-32 border border-dashed border-gold/30 flex flex-col items-center justify-center cursor-pointer hover:bg-gold/10 transition-colors text-muted-foreground hover:text-gold">
                    <Upload size={20} className="mb-2" />
                    <span className="text-[10px] font-serif-sc">UPLOAD QR</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFile} />
                  </label>
                )}
                <div className="text-xs text-muted-foreground italic font-serif mt-2">
                  Square image recommended.<br/>Max size: 2MB.<br/>JPG/PNG/WEBP only.
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-gold text-royal-deep hover:shadow-gold transition-all"
            >
              {isSaving ? "SAVING..." : <><Save size={18} /> SAVE PAYMENT SETTINGS</>}
            </button>

          </div>
        </div>

        {/* LIVE PREVIEW */}
        <div>
          <div className="sticky top-8">
            <h3 className="font-serif-sc text-sm text-gold tracking-widest mb-4 flex items-center gap-2"><Smartphone size={16} /> GUEST PAYMENT PREVIEW</h3>
            
            <div className="bg-card/40 border border-gold/30 p-8 shadow-frame text-center opacity-80 pointer-events-none scale-90 origin-top-left w-[111%]">
              {preview ? (
                <img src={preview} alt="UPI QR Code" className="w-48 h-48 object-contain mx-auto mb-6 bg-white p-2 rounded-sm shadow-md" />
              ) : (
                <div className="w-48 h-48 mx-auto mb-6 bg-muted flex items-center justify-center border border-gold/20 text-muted-foreground font-serif italic text-sm">
                  QR Code Space
                </div>
              )}
              
              <div className="space-y-2">
                <div className="font-serif-sc text-[10px] tracking-widest text-gold">ACCOUNT NAME</div>
                <div className="font-display text-xl text-foreground">{formData.account_name || "Raj Mandir Hotel"}</div>
                
                <div className="font-serif-sc text-[10px] tracking-widest text-gold mt-6">UPI ID</div>
                <div className="font-serif text-md text-foreground bg-muted px-4 py-2 inline-block rounded-sm border border-gold/20">{formData.upi_id || "rajmandir@upi"}</div>
              </div>

              <div className="mt-8 text-left bg-black/40 p-4 border border-gold/20">
                <div className="font-serif-sc text-[10px] tracking-widest text-gold mb-2">INSTRUCTIONS</div>
                <div className="font-serif text-xs text-ivory/80 whitespace-pre-wrap">{formData.payment_instructions}</div>
              </div>
              
              <div className="mt-6 border-t border-gold/20 pt-4 flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Advance ({formData.advance_percentage || 30}%)</span>
                <span className="font-display text-xl text-gold-gradient">₹ 4,500</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
