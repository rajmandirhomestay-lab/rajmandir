import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Plus, X, Tag, Trash2, Calendar, Percent, Image as ImageIcon, CheckCircle, XCircle } from "lucide-react";
import { ImageSelector } from "@/components/admin/ImageSelector";

type Offer = {
  id: string;
  title: string;
  description: string;
  discount_pct: number;
  start_date: string;
  end_date: string;
  banner_image: string;
  is_active: boolean;
  created_at: string;
};

export default function OffersCMS() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showBannerSelector, setShowBannerSelector] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    discount_pct: 0,
    start_date: "",
    end_date: "",
    banner_image: "",
    is_active: true,
  });

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setOffers(data || []);
    } catch (error: any) {
      toast.error("Failed to load offers: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required.");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        const { error } = await supabase.from("offers").update(form).eq("id", editId);
        if (error) throw error;
        toast.success("Royal offer updated successfully.");
      } else {
        const { error } = await supabase.from("offers").insert([form]);
        if (error) throw error;
        toast.success("New royal offer created.");
      }
      setShowModal(false);
      fetchOffers();
    } catch (error: any) {
      toast.error("Failed to save offer: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase.from("offers").update({ is_active: !current }).eq("id", id);
      if (error) throw error;
      toast.success(current ? "Offer deactivated." : "Offer activated.");
      fetchOffers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteOffer = async (id: string) => {
    if (!window.confirm("Permanently remove this offer?")) return;
    try {
      const { error } = await supabase.from("offers").delete().eq("id", id);
      if (error) throw error;
      toast.success("Offer deleted.");
      fetchOffers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const openEdit = (o: Offer) => {
    setEditId(o.id);
    setForm({
      title: o.title,
      description: o.description,
      discount_pct: o.discount_pct,
      start_date: o.start_date,
      end_date: o.end_date,
      banner_image: o.banner_image,
      is_active: o.is_active,
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="animate-spin text-gold w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-foreground mb-2">Seasonal Offers</h1>
          <p className="font-serif text-muted-foreground">Manage your palace's promotional packages and festival discounts.</p>
        </div>
        <button
          onClick={() => {
            setEditId(null);
            setForm({ title: "", description: "", discount_pct: 0, start_date: "", end_date: "", banner_image: "", is_active: true });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gold text-royal-deep font-serif-sc text-xs tracking-widest hover:bg-gold/80 transition-all"
        >
          <Plus size={16} /> CREATE OFFER
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.length === 0 ? (
          <div className="col-span-full text-center p-12 border border-gold/20 bg-card/50">
            <Tag className="mx-auto text-gold/50 w-12 h-12 mb-4" />
            <h3 className="font-display text-2xl text-foreground mb-2">No Active Offers</h3>
            <p className="font-serif text-muted-foreground">Create your first royal discount package to attract new guests.</p>
          </div>
        ) : (
          offers.map((offer) => (
            <div key={offer.id} className={`bg-card border p-6 flex flex-col gap-4 shadow-frame transition-all duration-500 hover:shadow-gold group ${offer.is_active ? 'border-gold/30' : 'border-gold/10 opacity-70'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-gold">
                  <Tag size={16} />
                  <span className="font-serif-sc text-[10px] tracking-[0.2em]">{offer.discount_pct}% OFF</span>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => openEdit(offer)} className="text-muted-foreground hover:text-gold transition-colors">
                    <span className="font-serif-sc text-[10px] tracking-widest">EDIT</span>
                  </button>
                  <button onClick={() => deleteOffer(offer.id)} className="text-muted-foreground hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="font-display text-2xl text-foreground mb-2 group-hover:text-gold transition-colors">{offer.title}</h3>
                <p className="font-serif text-muted-foreground text-sm line-clamp-3 leading-relaxed">{offer.description}</p>
              </div>

              <div className="mt-auto pt-4 border-t border-gold/10 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[10px] font-serif-sc tracking-widest text-muted-foreground">
                  <Calendar size={12} />
                  {new Date(offer.start_date).toLocaleDateString()} - {new Date(offer.end_date).toLocaleDateString()}
                </div>
                <button 
                  onClick={() => toggleStatus(offer.id, offer.is_active)}
                  className={`w-full py-2 text-[9px] font-serif-sc tracking-[0.3em] transition-all border ${
                    offer.is_active 
                      ? "bg-gold/10 text-gold border-gold/30" 
                      : "bg-muted text-muted-foreground border-transparent"
                  }`}
                >
                  {offer.is_active ? "ACTIVE" : "INACTIVE"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-gold/30 shadow-gold w-full max-w-lg p-8 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-gold"
            >
              <X size={20} />
            </button>
            <h2 className="font-display text-3xl text-foreground mb-8">
              {editId ? "Edit Offer" : "New Offering"}
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block font-serif-sc text-[10px] tracking-widest text-muted-foreground mb-2">OFFER TITLE</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-background border border-gold/20 px-4 py-3 font-serif text-sm text-foreground focus:border-gold outline-none transition-all"
                  placeholder="e.g. Festival Heritage Package"
                />
              </div>

              <div>
                <label className="block font-serif-sc text-[10px] tracking-widest text-muted-foreground mb-2">DESCRIPTION</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-background border border-gold/20 px-4 py-3 font-serif text-sm text-foreground focus:border-gold outline-none transition-all resize-none"
                  placeholder="Describe the offer..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-serif-sc text-[10px] tracking-widest text-muted-foreground mb-2">DISCOUNT %</label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-3 text-gold/50" size={14} />
                    <input
                      type="number"
                      value={form.discount_pct}
                      onChange={(e) => setForm({ ...form, discount_pct: parseInt(e.target.value) || 0 })}
                      className="w-full bg-background border border-gold/20 pl-10 pr-4 py-3 font-serif text-sm text-foreground focus:border-gold outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                   <div 
                    onClick={() => setForm({ ...form, is_active: !form.is_active })}
                    className={`w-10 h-5 border transition-colors duration-300 relative cursor-pointer ${
                      form.is_active ? "bg-gold border-gold" : "bg-background border-gold/30"
                    }`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white transition-transform duration-300 ${form.is_active ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                  <span className="ml-3 font-serif-sc text-[10px] tracking-widest text-muted-foreground">IS ACTIVE</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-serif-sc text-[10px] tracking-widest text-muted-foreground mb-2">START DATE</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="w-full bg-background border border-gold/20 px-4 py-2 font-serif text-sm text-foreground focus:border-gold outline-none transition-all [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block font-serif-sc text-[10px] tracking-widest text-muted-foreground mb-2">END DATE</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className="w-full bg-background border border-gold/20 px-4 py-2 font-serif text-sm text-foreground focus:border-gold outline-none transition-all [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            {/* Banner Image Selector */}
            <div className="mt-6">
              <label className="block font-serif-sc text-[10px] tracking-widest text-muted-foreground mb-3">BANNER IMAGE</label>
              {form.banner_image ? (
                <div className="relative h-32 border border-gold/30 group overflow-hidden">
                  <img src={form.banner_image} className="w-full h-full object-cover" alt="Banner" />
                  <div className="absolute inset-0 bg-royal-deep/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                    <button type="button" onClick={() => setShowBannerSelector(true)} className="bg-gold text-royal-deep p-2 rounded-full hover:scale-110"><ImageIcon size={16} /></button>
                    <button type="button" onClick={() => setForm({...form, banner_image: ""})} className="bg-red-500 text-white p-2 rounded-full hover:scale-110"><X size={16} /></button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => setShowBannerSelector(true)} className="w-full h-32 border-2 border-dashed border-gold/20 hover:border-gold/50 flex flex-col items-center justify-center gap-2 bg-gold/5 group">
                  <ImageIcon size={32} className="text-gold/20 group-hover:text-gold/40" />
                  <span className="font-serif-sc text-[9px] tracking-widest text-gold/40">SELECT BANNER</span>
                </button>
              )}
            </div>

            <div className="flex gap-4 mt-10">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-4 border border-gold/20 text-muted-foreground hover:border-gold hover:text-foreground font-serif-sc text-xs tracking-widest transition-all"
              >
                CANCEL
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-gold text-royal-deep font-serif-sc text-xs tracking-widest hover:bg-gold/80 transition-all disabled:opacity-50"
              >
                {saving && <Loader2 className="animate-spin" size={16} />}
                {editId ? "UPDATE OFFER" : "CREATE OFFER"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showBannerSelector && (
        <ImageSelector
          bucketId="offers-banners"
          onClose={() => setShowBannerSelector(false)}
          onSelect={url => {
            setForm({...form, banner_image: url});
            setShowBannerSelector(false);
          }}
        />
      )}
    </div>
  );
}
