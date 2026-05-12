import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Plus, Edit2, Trash2, Save, X, LayoutGrid, Image as ImageIcon, Sparkles } from "lucide-react";
import { ImageSelector } from "@/components/admin/ImageSelector";

type RoomCategoryImage = {
  id: string;
  image_url: string;
  sort_order: number;
};

type SeasonalPrice = {
  month: number;
  price: number;
};

type Category = {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  hover_image_url: string | null;
  price: number;
  extra_mattress_price: number;
  occupancy: number;
  is_featured: boolean;
  sort_order: number;
  room_category_images?: RoomCategoryImage[];
  room_seasonal_prices?: SeasonalPrice[];
};

export default function RoomCategoriesCMS() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Image Selector States
  const [selectorTarget, setSelectorTarget] = useState<'featured' | 'hover' | 'gallery' | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("room_categories")
        .select("*, room_category_images(*), room_seasonal_prices(*)")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      setCategories(data as Category[]);
    } catch (e: any) {
      toast.error("Failed to load categories: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.name) return;
    setSaving(true);

    const payload = {
      name: editing.name,
      description: editing.description || "",
      image_url: editing.image_url,
      hover_image_url: editing.hover_image_url,
      price: editing.price || 0,
      extra_mattress_price: editing.extra_mattress_price || 0,
      occupancy: editing.occupancy || 1,
      is_featured: editing.is_featured || false,
      sort_order: editing.sort_order || 0,
    };

    try {
      let categoryId = editing.id;

      if (editing.id) {
        const { error } = await supabase
          .from("room_categories")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
        toast.success("Category updated.");
      } else {
        const { data, error } = await supabase.from("room_categories").insert([payload]).select().single();
        if (error) throw error;
        categoryId = data.id;
        toast.success("Category created.");
      }

      // Handle Gallery Images (Simple replacement for now or incremental)
      if (editing.room_category_images) {
        // First delete existing (or implement complex diff)
        await supabase.from("room_category_images").delete().eq("category_id", categoryId);
        
        if (editing.room_category_images.length > 0) {
          const galleryPayload = editing.room_category_images.map((img, idx) => ({
            category_id: categoryId,
            image_url: img.image_url,
            sort_order: idx
          }));
          const { error: gError } = await supabase.from("room_category_images").insert(galleryPayload);
          if (gError) throw gError;
        }
      }
      // Handle Seasonal Prices
      const seasonalPrices = (editing as any).room_seasonal_prices;
      if (seasonalPrices) {
        // Prepare 12 months of prices (default to base price if not set)
        const seasonalPayload = Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          const found = seasonalPrices.find((sp: any) => sp.month === month);
          return {
            category_id: categoryId,
            month,
            price: found ? found.price : editing.price || 0
          };
        });

        const { error: sError } = await supabase
          .from("room_seasonal_prices")
          .upsert(seasonalPayload, { onConflict: 'category_id,month' });
        if (sError) throw sError;
      }

      setEditing(null);
      fetchCategories();
    } catch (e: any) {
      toast.error("Save failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this category permanently?")) return;
    try {
      const { error } = await supabase.from("room_categories").delete().eq("id", id);
      if (error) throw error;
      toast.success("Deleted.");
      fetchCategories();
    } catch (e: any) {
      toast.error("Delete failed: " + e.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="animate-spin text-gold w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-foreground mb-2">Room Categories</h1>
          <p className="font-serif text-muted-foreground">
            Manage the visual identity and specifications of your chambers.
          </p>
        </div>
        {!editing && (
          <button
            onClick={() =>
              setEditing({ is_featured: false, sort_order: categories.length, occupancy: 2, price: 0, room_category_images: [] })
            }
            className="bg-gold text-royal-deep font-serif-sc tracking-widest text-xs px-6 py-3 flex items-center gap-2 hover:bg-gold-glow transition-all duration-300"
          >
            <Plus size={14} /> NEW CHAMBER TYPE
          </button>
        )}
      </div>

      {/* Form */}
      {editing && (
        <div className="bg-card border border-gold/20 p-8 shadow-frame animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Sparkles size={120} className="text-gold" />
          </div>
          
          <div className="flex items-center justify-between mb-8 border-b border-gold/10 pb-4 relative z-10">
            <h2 className="font-display text-2xl text-foreground">
              {editing.id ? "Refine Chamber" : "Commission New Chamber"}
            </h2>
            <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-gold transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Left Column: Info */}
              <div className="space-y-6">
                <div>
                  <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">
                    CATEGORY NAME *
                  </label>
                  <input
                    required
                    type="text"
                    value={editing.name || ""}
                    onChange={e => setEditing({ ...editing, name: e.target.value })}
                    className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif text-foreground transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">
                    CHAMBER DESCRIPTION
                  </label>
                  <textarea
                    rows={4}
                    value={editing.description || ""}
                    onChange={e => setEditing({ ...editing, description: e.target.value })}
                    className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif text-foreground transition-all duration-300 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">
                      PRICE PER NIGHT (₹)
                    </label>
                    <input
                      type="number"
                      value={editing.price ?? 0}
                      onChange={e => setEditing({ ...editing, price: Number(e.target.value) })}
                      className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif text-foreground transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">
                      EXTRA MATTRESS (₹)
                    </label>
                    <input
                      type="number"
                      value={editing.extra_mattress_price ?? 0}
                      onChange={e => setEditing({ ...editing, extra_mattress_price: Number(e.target.value) })}
                      className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif text-foreground transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">
                      MAX OCCUPANCY
                    </label>
                    <input
                      type="number"
                      value={editing.occupancy ?? 2}
                      onChange={e => setEditing({ ...editing, occupancy: Number(e.target.value) })}
                      className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif text-foreground transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={editing.is_featured ?? false}
                      onChange={e => setEditing({ ...editing, is_featured: e.target.checked })}
                      className="w-4 h-4 accent-gold"
                    />
                    <span className="font-serif-sc text-[10px] tracking-widest text-foreground group-hover:text-gold transition-colors">
                      FEATURED ON HOMEPAGE
                    </span>
                  </label>
                </div>

                {/* Seasonal Pricing Section */}
                <div className="pt-6 border-t border-gold/10">
                  <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-4">
                    SEASONAL TARIFFS (₹)
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"].map((month, idx) => {
                      const monthNum = idx + 1;
                      const sp = editing.room_seasonal_prices?.find(p => p.month === monthNum);
                      return (
                        <div key={month} className="space-y-1">
                          <label className="text-[8px] font-serif-sc text-muted-foreground tracking-widest uppercase">{month}</label>
                          <input
                            type="number"
                            placeholder={editing.price?.toString()}
                            value={sp?.price ?? ""}
                            onChange={e => {
                              const newPrice = Number(e.target.value);
                              const existing = editing.room_seasonal_prices || [];
                              const updated = existing.some(p => p.month === monthNum)
                                ? existing.map(p => p.month === monthNum ? { ...p, price: newPrice } : p)
                                : [...existing, { month: monthNum, price: newPrice }];
                              setEditing({ ...editing, room_seasonal_prices: updated });
                            }}
                            className="w-full bg-background border border-gold/10 focus:border-gold outline-none px-2 py-1.5 font-serif text-xs text-foreground transition-all"
                          />
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-[9px] font-serif italic text-muted-foreground">
                    Leave blank to use the default price of ₹{editing.price?.toLocaleString()}.
                  </p>
                </div>
              </div>

              {/* Right Column: Imagery */}
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  {/* Featured Image */}
                  <div>
                    <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-3">
                      FEATURED IMAGE
                    </label>
                    {editing.image_url ? (
                      <div className="relative aspect-[4/3] border border-gold/30 group overflow-hidden jharokha-frame">
                        <img src={editing.image_url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-royal-deep/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                          <button type="button" onClick={() => setSelectorTarget('featured')} className="p-2 bg-gold text-royal-deep rounded-full"><Edit2 size={14} /></button>
                          <button type="button" onClick={() => setEditing({...editing, image_url: null})} className="p-2 bg-red-500 text-white rounded-full"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => setSelectorTarget('featured')}
                        className="w-full aspect-[4/3] border-2 border-dashed border-gold/20 hover:border-gold/50 transition-colors flex flex-col items-center justify-center gap-2 bg-gold/5 jharokha-frame"
                      >
                        <ImageIcon className="text-gold/20" size={32} />
                        <span className="text-[9px] font-serif-sc tracking-widest text-gold/40">SELECT IMAGE</span>
                      </button>
                    )}
                  </div>

                  {/* Hover Image */}
                  <div>
                    <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-3">
                      HOVER PREVIEW
                    </label>
                    {editing.hover_image_url ? (
                      <div className="relative aspect-[4/3] border border-gold/30 group overflow-hidden jharokha-frame">
                        <img src={editing.hover_image_url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-royal-deep/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                          <button type="button" onClick={() => setSelectorTarget('hover')} className="p-2 bg-gold text-royal-deep rounded-full"><Edit2 size={14} /></button>
                          <button type="button" onClick={() => setEditing({...editing, hover_image_url: null})} className="p-2 bg-red-500 text-white rounded-full"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => setSelectorTarget('hover')}
                        className="w-full aspect-[4/3] border-2 border-dashed border-gold/20 hover:border-gold/50 transition-colors flex flex-col items-center justify-center gap-2 bg-gold/5 jharokha-frame"
                      >
                        <ImageIcon className="text-gold/20" size={32} />
                        <span className="text-[9px] font-serif-sc tracking-widest text-gold/40">SELECT IMAGE</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Gallery */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground">
                      CHAMBER GALLERY
                    </label>
                    <button 
                      type="button"
                      onClick={() => setSelectorTarget('gallery')}
                      className="text-gold flex items-center gap-2 font-serif-sc text-[10px] tracking-widest hover:underline"
                    >
                      <Plus size={12} /> ADD GALLERY PHOTO
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3">
                    {editing.room_category_images?.map((img, idx) => (
                      <div key={idx} className="relative aspect-square border border-gold/20 group overflow-hidden jharokha-frame shadow-sm">
                        <img src={img.image_url} className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => {
                            const newGallery = editing.room_category_images?.filter((_, i) => i !== idx);
                            setEditing({...editing, room_category_images: newGallery});
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                    {(!editing.room_category_images || editing.room_category_images.length === 0) && (
                      <div className="col-span-4 py-8 text-center border border-gold/10 bg-gold/5 font-serif text-xs text-muted-foreground italic">
                        No gallery photos added yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Save Actions */}
            <div className="pt-8 border-t border-gold/10 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="font-serif-sc text-xs tracking-widest text-muted-foreground hover:text-gold transition-colors px-4 py-2"
              >
                DISCARD
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-gold text-royal-deep font-serif-sc tracking-[0.2em] text-xs px-10 py-4 flex items-center gap-2 hover:bg-gold-glow transition-all duration-300 shadow-gold"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {saving ? "SAVING..." : "COMMISSION CHANGES"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid gap-6">
        {categories.map((cat, idx) => (
          <div
            key={cat.id}
            className="bg-card border border-gold/20 flex flex-col md:flex-row gap-6 p-6 group hover:border-gold/40 transition-all duration-500 shadow-frame"
          >
            <div className="w-full md:w-64 aspect-[4/3] bg-royal-deep relative overflow-hidden jharokha-frame shrink-0">
              {cat.image_url ? (
                <img src={cat.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><ImageIcon size={40} className="text-gold/10" /></div>
              )}
              <div className="absolute top-2 left-2 px-3 py-1 bg-royal-deep/80 backdrop-blur-md border border-gold/30 text-gold font-display text-sm">
                {String(idx + 1).padStart(2, '0')}
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-display text-3xl text-foreground">{cat.name}</h3>
                    {cat.is_featured && (
                      <span className="bg-gold/10 text-gold text-[9px] font-serif-sc tracking-widest px-2 py-0.5 border border-gold/30">FEATURED</span>
                    )}
                  </div>
                  <p className="font-serif text-sm text-muted-foreground line-clamp-2">{cat.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditing(cat)} className="p-3 border border-gold/20 text-gold hover:bg-gold hover:text-royal-deep transition-all duration-300">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="p-3 border border-red-900/20 text-red-400 hover:bg-red-900/40 transition-all duration-300">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-gold/10 pt-4">
                <div>
                  <div className="text-[9px] font-serif-sc text-gold/60 tracking-widest">TARIFF</div>
                  <div className="font-display text-lg">₹{cat.price.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[9px] font-serif-sc text-gold/60 tracking-widest">CAPACITY</div>
                  <div className="font-serif italic">{cat.occupancy} Guests</div>
                </div>
                <div>
                  <div className="text-[9px] font-serif-sc text-gold/60 tracking-widest">GALLERY</div>
                  <div className="font-serif italic">{cat.room_category_images?.length || 0} Photos</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image Selector Overlay */}
      {selectorTarget && (
        <ImageSelector
          bucketId="room-categories"
          onClose={() => setSelectorTarget(null)}
          onSelect={(url) => {
            if (selectorTarget === 'featured') setEditing({...editing!, image_url: url});
            if (selectorTarget === 'hover') setEditing({...editing!, hover_image_url: url});
            if (selectorTarget === 'gallery') {
              const gallery = editing?.room_category_images || [];
              setEditing({...editing!, room_category_images: [...gallery, { id: '', image_url: url, sort_order: gallery.length }]});
            }
            setSelectorTarget(null);
          }}
        />
      )}
    </div>
  );
}
