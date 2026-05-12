import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Plus, Edit2, Trash2, Save, X, Utensils, Image as ImageIcon } from "lucide-react";
import { MultiImageUploader } from "@/components/admin/MultiImageUploader";

type Dish = {
  id: string;
  name: string;
  description: string;
  price: string;
  image_url: string | null;
  category: string;
  sort_order: number;
};

export default function DiningDishesCMS() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Dish> | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchDishes = async () => {
    try {
      const { data, error } = await supabase
        .from("dishes")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      setDishes(data as Dish[]);
    } catch (e: any) {
      toast.error("Failed to load dishes: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDishes();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.name) return;
    setSaving(true);
    try {
      const payload = {
        name: editing.name,
        description: editing.description,
        price: editing.price,
        category: editing.category || "Signature",
        image_url: editing.image_url,
        sort_order: editing.sort_order || 0
      };

      if (editing.id) {
        const { error } = await supabase.from("dishes").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast.success("Royal dish updated.");
      } else {
        const { error } = await supabase.from("dishes").insert([payload]);
        if (error) throw error;
        toast.success("New dish added to the menu.");
      }
      setEditing(null);
      fetchDishes();
    } catch (e: any) {
      toast.error("Save failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this dish from the menu?")) return;
    try {
      const { error } = await supabase.from("dishes").delete().eq("id", id);
      if (error) throw error;
      toast.success("Dish removed.");
      fetchDishes();
    } catch (e: any) {
      toast.error("Delete failed: " + e.message);
    }
  };

  if (loading) return <div className="flex justify-center h-[50vh] items-center"><Loader2 className="animate-spin text-gold w-10 h-10" /></div>;

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-foreground mb-2">Special Dishes CMS</h1>
          <p className="font-serif text-muted-foreground">Manage the items shown in the "Royal Menu" section.</p>
        </div>
        {!editing && (
          <button onClick={() => setEditing({ name: "", description: "", price: "₹", category: "Signature", sort_order: 0 })} className="bg-gold text-royal-deep font-serif-sc tracking-widest text-xs px-6 py-3 flex items-center gap-2 hover:bg-gold-glow">
            <Plus size={14} /> ADD NEW DISH
          </button>
        )}
      </div>

      {editing ? (
        <div className="bg-card border border-gold/20 p-8 shadow-frame">
          <div className="flex justify-between border-b border-gold/10 pb-4 mb-8">
             <h2 className="font-display text-3xl">{editing.id ? "Refine Dish" : "New Culinary Creation"}</h2>
             <button onClick={() => setEditing(null)}><X size={24} className="text-muted-foreground" /></button>
          </div>
          <form onSubmit={handleSave} className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
               <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">DISH NAME</label>
                    <input required type="text" value={editing.name || ""} onChange={e => setEditing({ ...editing, name: e.target.value })} className="w-full bg-background border border-gold/20 p-3 font-serif text-sm" />
                  </div>
                  <div>
                    <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">PRICE (e.g. ₹850)</label>
                    <input required type="text" value={editing.price || ""} onChange={e => setEditing({ ...editing, price: e.target.value })} className="w-full bg-background border border-gold/20 p-3 font-serif text-sm" />
                  </div>
               </div>
               <div>
                  <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">CATEGORY</label>
                  <input value={editing.category} onChange={e => setEditing({...editing, category: e.target.value})} className="w-full bg-background border border-gold/20 p-3 font-serif text-sm" placeholder="e.g. SIGNATURE / VEG / NON-VEG" />
               </div>
               <div>
                  <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">DESCRIPTION</label>
                  <textarea rows={3} value={editing.description || ""} onChange={e => setEditing({ ...editing, description: e.target.value })} className="w-full bg-background border border-gold/20 p-3 font-serif text-sm resize-none" />
               </div>
               <button disabled={saving} className="w-full bg-gold text-royal-deep py-4 font-serif-sc tracking-widest text-xs flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="animate-spin" /> : <Save />} SAVE TO MENU
               </button>
            </div>
            
            <div className="space-y-6">
               <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">DISH IMAGE</label>
               <MultiImageUploader 
                  images={editing.image_url ? [editing.image_url] : []} 
                  onChange={imgs => setEditing({...editing, image_url: imgs[0] || null})} 
                  folder="dishes"
                  bucket="dining-menu-assets"
               />
               <p className="font-serif text-[10px] text-muted-foreground italic text-center">Upload a single high-quality photo of the dish.</p>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dishes.map(dish => (
            <div key={dish.id} className="bg-card border border-gold/20 p-4 group hover:shadow-gold transition-all shadow-frame relative">
              <div className="aspect-square mb-4 overflow-hidden jharokha-frame border border-gold/10 relative">
                {dish.image_url ? (
                  <img src={dish.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full bg-gold/5 flex items-center justify-center"><Utensils className="text-gold/20" size={32} /></div>
                )}
              </div>
              <div className="text-center">
                 <div className="font-serif-sc text-gold text-[9px] tracking-widest mb-1 uppercase">{dish.category}</div>
                 <h3 className="font-display text-xl mb-2 line-clamp-1">{dish.name}</h3>
                 <div className="font-serif text-gold text-sm mb-4">{dish.price}</div>
                 
                 <div className="flex justify-center gap-3 pt-4 border-t border-gold/10">
                    <button onClick={() => setEditing(dish)} className="flex items-center gap-2 font-serif-sc text-[9px] tracking-widest text-gold hover:text-white transition-colors border border-gold/20 px-3 py-1.5 hover:bg-gold/10">
                       <Edit2 size={12}/> EDIT
                    </button>
                    <button onClick={() => handleDelete(dish.id)} className="flex items-center gap-2 font-serif-sc text-[9px] tracking-widest text-red-400 hover:text-red-500 transition-colors border border-red-900/20 px-3 py-1.5 hover:bg-red-900/10">
                       <Trash2 size={12}/> DELETE
                    </button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
