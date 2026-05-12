import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Plus, Edit2, Trash2, Save, X, UtensilsCrossed, Sparkles, MapPin, Palette } from "lucide-react";
import { MultiImageUploader } from "@/components/admin/MultiImageUploader";

type DiningArea = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  theme_type: string;
  is_featured: boolean;
  sort_order: number;
  images: string[];
};

type Dish = {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  image_url: string;
  is_available: boolean;
};

export default function DiningCMS() {
  const [areas, setAreas] = useState<DiningArea[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"areas" | "dishes">("areas");
  const [editingArea, setEditingArea] = useState<Partial<DiningArea> | null>(null);
  const [editingDish, setEditingDish] = useState<Partial<Dish> | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: areasData } = await supabase
        .from("dining_areas")
        .select("*, dining_area_images(image_url)")
        .order("sort_order", { ascending: true });

      const formattedAreas = areasData?.map((a: any) => ({
        ...a,
        images: a.dining_area_images?.map((img: any) => img.image_url) || []
      })) || [];

      const { data: dishesData } = await supabase
        .from("dishes")
        .select("*")
        .order("sort_order", { ascending: true });

      setAreas(formattedAreas);
      setDishes(dishesData || []);
    } catch (e: any) {
      toast.error("Failed to load dining data: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArea?.title) return;
    setSaving(true);
    try {
      const areaData = {
        title: editingArea.title,
        tagline: editingArea.tagline,
        description: editingArea.description,
        theme_type: editingArea.theme_type,
        is_featured: editingArea.is_featured,
        sort_order: editingArea.sort_order,
      };

      let areaId = editingArea.id;

      if (areaId) {
        await supabase.from("dining_areas").update(areaData).eq("id", areaId);
        // Clean up and re-add images
        await supabase.from("dining_area_images").delete().eq("dining_area_id", areaId);
      } else {
        const { data, error } = await supabase.from("dining_areas").insert([areaData]).select().single();
        if (error) throw error;
        areaId = data.id;
      }

      if (editingArea.images && editingArea.images.length > 0) {
        const imageInserts = editingArea.images.map((url, idx) => ({
          dining_area_id: areaId,
          image_url: url,
          sort_order: idx
        }));
        await supabase.from("dining_area_images").insert(imageInserts);
      }

      toast.success("Dining area commissioned.");
      setEditingArea(null);
      fetchData();
    } catch (e: any) {
      toast.error("Save failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDish?.name) return;
    setSaving(true);
    try {
      if (editingDish.id) {
        await supabase.from("dishes").update(editingDish).eq("id", editingDish.id);
      } else {
        await supabase.from("dishes").insert([editingDish]);
      }
      toast.success("Dish added to the royal menu.");
      setEditingDish(null);
      fetchData();
    } catch (e: any) {
      toast.error("Save failed: " + e.message);
    } finally {
      setSaving(false);
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
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-foreground mb-2">Dining CMS</h1>
          <p className="font-serif text-muted-foreground">Manage experiences and signatures.</p>
        </div>
        <div className="flex gap-2 p-1 bg-gold/5 border border-gold/10 rounded-sm">
          <button
            onClick={() => setActiveTab("areas")}
            className={`px-6 py-2 font-serif-sc text-[10px] tracking-widest transition-all ${
              activeTab === "areas" ? "bg-gold text-royal-deep" : "text-gold hover:text-white"
            }`}
          >
            AREAS
          </button>
          <button
            onClick={() => setActiveTab("dishes")}
            className={`px-6 py-2 font-serif-sc text-[10px] tracking-widest transition-all ${
              activeTab === "dishes" ? "bg-gold text-royal-deep" : "text-gold hover:text-white"
            }`}
          >
            DISHES
          </button>
        </div>
      </div>

      {activeTab === "areas" ? (
        <div className="space-y-8">
          {!editingArea ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <button
                onClick={() => setEditingArea({ title: "", images: [], theme_type: "Luxury" })}
                className="aspect-square border-2 border-dashed border-gold/20 hover:border-gold/50 transition-all flex flex-col items-center justify-center gap-4 bg-gold/5 group"
              >
                <div className="w-16 h-16 rounded-full border border-gold/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="text-gold" size={24} />
                </div>
                <span className="font-serif-sc tracking-[0.2em] text-[10px] text-gold">ADD AREA</span>
              </button>

              {areas.map((area) => (
                <div key={area.id} className="bg-card border border-gold/20 group hover:border-gold/50 transition-all relative overflow-hidden shadow-frame">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img src={area.images[0] || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button onClick={() => setEditingArea(area)} className="p-2 bg-royal-deep/80 text-gold backdrop-blur-sm border border-gold/20 hover:bg-gold hover:text-royal-deep transition-all">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => {}} className="p-2 bg-red-900/80 text-white backdrop-blur-sm border border-red-500/20 hover:bg-red-600 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="font-serif-sc text-[9px] text-gold tracking-widest mb-2 uppercase">{area.theme_type}</div>
                    <h3 className="font-display text-2xl mb-2">{area.title}</h3>
                    <p className="font-serif text-xs text-muted-foreground line-clamp-2 italic">{area.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card border border-gold/20 p-8 shadow-frame animate-fade-in relative overflow-hidden">
               <div className="flex items-center justify-between mb-8 border-b border-gold/10 pb-4">
                  <h2 className="font-display text-2xl">{editingArea.id ? "Refine Experience" : "New Experience"}</h2>
                  <button onClick={() => setEditingArea(null)}><X size={20} className="text-muted-foreground" /></button>
               </div>
               <form onSubmit={handleSaveArea} className="grid lg:grid-cols-2 gap-12">
                  <div className="space-y-6">
                     <div>
                        <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">AREA TITLE</label>
                        <input required value={editingArea.title} onChange={e => setEditingArea({...editingArea, title: e.target.value})} className="w-full bg-background border border-gold/20 p-3 font-serif text-sm" />
                     </div>
                     <div>
                        <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">TAGLINE</label>
                        <input value={editingArea.tagline} onChange={e => setEditingArea({...editingArea, tagline: e.target.value})} className="w-full bg-background border border-gold/20 p-3 font-serif text-sm" />
                     </div>
                     <div>
                        <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">DESCRIPTION</label>
                        <textarea rows={4} value={editingArea.description} onChange={e => setEditingArea({...editingArea, description: e.target.value})} className="w-full bg-background border border-gold/20 p-3 font-serif text-sm" />
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div>
                           <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">THEME</label>
                           <select value={editingArea.theme_type} onChange={e => setEditingArea({...editingArea, theme_type: e.target.value})} className="w-full bg-background border border-gold/20 p-3 font-serif text-sm">
                              <option>Luxury</option>
                              <option>Romantic</option>
                              <option>Heritage</option>
                              <option>Casual</option>
                           </select>
                        </div>
                        <div>
                           <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">ORDER</label>
                           <input type="number" value={editingArea.sort_order} onChange={e => setEditingArea({...editingArea, sort_order: Number(e.target.value)})} className="w-full bg-background border border-gold/20 p-3 font-serif text-sm" />
                        </div>
                     </div>
                     <button disabled={saving} className="w-full bg-gold text-royal-deep py-4 font-serif-sc tracking-widest text-xs flex items-center justify-center gap-2">
                        {saving ? <Loader2 className="animate-spin" /> : <Save />} COMMISSION AREA
                     </button>
                  </div>
                  <MultiImageUploader 
                     images={editingArea.images || []} 
                     onChange={imgs => setEditingArea({...editingArea, images: imgs})} 
                     folder="dining-areas" 
                     bucket="dining-images"
                  />
               </form>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
           {!editingDish ? (
             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <button onClick={() => setEditingDish({ name: "", price: "₹", category: "Veg" })} className="border-2 border-dashed border-gold/20 aspect-square flex flex-col items-center justify-center gap-3 bg-gold/5 text-gold hover:bg-gold/10 transition-all">
                   <Plus size={20} />
                   <span className="font-serif-sc text-[9px] tracking-widest">ADD DISH</span>
                </button>
                {dishes.map(dish => (
                   <div key={dish.id} className="bg-card border border-gold/20 p-4 shadow-sm group">
                      <div className="aspect-square relative mb-4 overflow-hidden border border-gold/10">
                         <img src={dish.image_url || ""} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                         <div className="absolute top-2 right-2 flex gap-1">
                            <button onClick={() => setEditingDish(dish)} className="p-2 bg-royal-deep/80 text-gold backdrop-blur-sm border border-gold/20 hover:bg-gold hover:text-royal-deep transition-all">
                               <Edit2 size={12} />
                            </button>
                         </div>
                      </div>
                      <h4 className="font-display text-lg mb-1">{dish.name}</h4>
                      <div className="font-serif-sc text-gold text-[10px] tracking-widest mb-2">{dish.price}</div>
                      <p className="font-serif text-[10px] text-muted-foreground line-clamp-1 italic">{dish.description}</p>
                   </div>
                ))}
             </div>
           ) : (
             <div className="bg-card border border-gold/20 p-8 shadow-frame">
                <form onSubmit={handleSaveDish} className="space-y-6 max-w-2xl">
                   <div className="grid md:grid-cols-2 gap-6">
                      <div>
                         <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">DISH NAME</label>
                         <input required value={editingDish.name} onChange={e => setEditingDish({...editingDish, name: e.target.value})} className="w-full bg-background border border-gold/20 p-3 font-serif text-sm" />
                      </div>
                      <div>
                         <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">PRICE</label>
                         <input value={editingDish.price} onChange={e => setEditingDish({...editingDish, price: e.target.value})} className="w-full bg-background border border-gold/20 p-3 font-serif text-sm" />
                      </div>
                   </div>
                   <div>
                      <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">DESCRIPTION</label>
                      <textarea value={editingDish.description} onChange={e => setEditingDish({...editingDish, description: e.target.value})} className="w-full bg-background border border-gold/20 p-3 font-serif text-sm" />
                   </div>
                   <div className="grid md:grid-cols-2 gap-6">
                      <div>
                         <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">CATEGORY</label>
                         <select value={editingDish.category} onChange={e => setEditingDish({...editingDish, category: e.target.value})} className="w-full bg-background border border-gold/20 p-3 font-serif text-sm">
                            <option>Veg</option>
                            <option>Non-Veg</option>
                            <option>Dessert</option>
                            <option>Signature</option>
                         </select>
                      </div>
                      <div>
                        <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">IMAGE URL</label>
                        <input value={editingDish.image_url} onChange={e => setEditingDish({...editingDish, image_url: e.target.value})} className="w-full bg-background border border-gold/20 p-3 font-serif text-sm" />
                      </div>
                   </div>
                   <div className="flex justify-end gap-4 pt-6">
                      <button type="button" onClick={() => setEditingDish(null)} className="font-serif-sc text-[10px] tracking-widest text-muted-foreground">CANCEL</button>
                      <button disabled={saving} className="bg-gold text-royal-deep px-8 py-3 font-serif-sc text-[10px] tracking-widest flex items-center gap-2">
                         {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} SAVE TO MENU
                      </button>
                   </div>
                </form>
             </div>
           )}
        </div>
      )}
    </div>
  );
}
