import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Plus, Edit2, Trash2, Save, X, Image as ImageIcon, Sparkles } from "lucide-react";
import { MultiImageUploader } from "@/components/admin/MultiImageUploader";

type Experience = {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  type: string;
  featured: boolean;
  active: boolean;
  sort_order: number;
  images: string[];
};

export default function ExperiencesCMS() {
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Partial<Experience> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("experiences")
        .select("*, experience_images(image_url)")
        .order("sort_order", { ascending: true });

      if (error) throw error;

      const formatted = data?.map((item: any) => ({
        ...item,
        images: item.experience_images?.map((img: any) => img.image_url) || []
      })) || [];

      setItems(formatted);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.title) return;
    setSaving(true);
    try {
      const mainData = {
        title: editingItem.title,
        slug: editingItem.slug,
        short_description: editingItem.short_description,
        full_description: editingItem.full_description,
        type: editingItem.type,
        featured: editingItem.featured || false,
        active: editingItem.active !== false,
        sort_order: editingItem.sort_order ?? items.length,
      };

      let itemId = editingItem.id;

      if (itemId) {
        await supabase.from("experiences").update(mainData).eq("id", itemId);
        await supabase.from("experience_images").delete().eq("experience_id", itemId);
      } else {
        const { data, error } = await supabase.from("experiences").insert([mainData]).select().single();
        if (error) throw error;
        itemId = data.id;
      }

      if (editingItem.images && editingItem.images.length > 0) {
        const imageInserts = editingItem.images.map((url, idx) => ({
          experience_id: itemId,
          image_url: url,
          sort_order: idx
        }));
        await supabase.from("experience_images").insert(imageInserts);
      }
      
      toast.success("Experience commissioned.");
      setEditingItem(null);
      fetchItems();
    } catch (error: any) {
      toast.error("Error saving: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this experience?")) return;
    try {
      await supabase.from("experiences").delete().eq("id", id);
      toast.success("Experience deleted.");
      fetchItems();
    } catch (error: any) {
      toast.error("Delete failed.");
    }
  };

  if (loading) return <div className="flex justify-center h-[50vh] items-center"><Loader2 className="animate-spin text-gold w-10 h-10" /></div>;

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl mb-2">Experiences CMS</h1>
          <p className="font-serif text-muted-foreground">Manage safaris, city walks, and cultural nights with multiple images.</p>
        </div>
        {!editingItem && (
          <button onClick={() => setEditingItem({ images: [], active: true, featured: false })} className="bg-gold text-royal-deep font-serif-sc text-xs px-6 py-3 flex items-center gap-2 hover:bg-gold-glow">
            <Plus size={16} /> ADD EXPERIENCE
          </button>
        )}
      </div>

      {editingItem ? (
        <div className="bg-card border border-gold/20 shadow-frame p-8">
          <div className="flex justify-between border-b border-gold/10 pb-4 mb-6">
            <h2 className="font-display text-3xl">{editingItem.id ? "Refine Experience" : "New Experience"}</h2>
            <button onClick={() => setEditingItem(null)} className="text-muted-foreground hover:text-gold"><X size={24} /></button>
          </div>
          <form onSubmit={handleSave} className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
               <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">TITLE</label>
                    <input required type="text" value={editingItem.title || ""} onChange={e => setEditingItem({ ...editingItem, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') })} className="w-full bg-background border border-gold/20 focus:border-gold px-4 py-3 font-serif outline-none" />
                  </div>
                  <div>
                    <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">SLUG</label>
                    <input required type="text" value={editingItem.slug || ""} onChange={e => setEditingItem({ ...editingItem, slug: e.target.value })} className="w-full bg-background border border-gold/20 focus:border-gold px-4 py-3 font-serif outline-none" />
                  </div>
               </div>
               
               <div className="grid md:grid-cols-1 gap-6">
                  <div>
                    <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">TYPE</label>
                    <input required type="text" value={editingItem.type || ""} onChange={e => setEditingItem({ ...editingItem, type: e.target.value })} className="w-full bg-background border border-gold/20 focus:border-gold px-4 py-3 font-serif outline-none" />
                  </div>
               </div>

               <div>
                 <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">SHORT DESCRIPTION</label>
                 <textarea required rows={2} value={editingItem.short_description || ""} onChange={e => setEditingItem({ ...editingItem, short_description: e.target.value })} className="w-full bg-background border border-gold/20 focus:border-gold px-4 py-3 font-serif outline-none resize-none" />
               </div>

               <div>
                 <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">FULL DESCRIPTION</label>
                 <textarea required rows={5} value={editingItem.full_description || ""} onChange={e => setEditingItem({ ...editingItem, full_description: e.target.value })} className="w-full bg-background border border-gold/20 focus:border-gold px-4 py-3 font-serif outline-none resize-none" />
               </div>

               <div className="flex gap-6 border-y border-gold/10 py-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                     <input type="checkbox" checked={editingItem.featured} onChange={e => setEditingItem({...editingItem, featured: e.target.checked})} className="w-4 h-4 accent-gold" />
                     <span className="font-serif-sc text-[10px] tracking-widest text-gold">FEATURED</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                     <input type="checkbox" checked={editingItem.active} onChange={e => setEditingItem({...editingItem, active: e.target.checked})} className="w-4 h-4 accent-gold" />
                     <span className="font-serif-sc text-[10px] tracking-widest text-gold">ACTIVE</span>
                  </label>
               </div>

               <button disabled={saving} type="submit" className="w-full bg-gold text-royal-deep font-serif-sc text-xs py-4 flex items-center justify-center gap-2 hover:bg-gold-glow">
                 {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} COMMISSION EXPERIENCE
               </button>
            </div>

            <div className="space-y-6">
               <MultiImageUploader 
                  images={editingItem.images || []} 
                  onChange={imgs => setEditingItem({...editingItem, images: imgs})} 
                  folder="experiences" 
                  bucket="experience-images"
               />
            </div>
          </form>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {items.map(item => (
            <div key={item.id} className="bg-card border border-gold/20 group hover:border-gold/50 transition-all shadow-frame overflow-hidden">
              <div className="aspect-video relative overflow-hidden">
                 {item.images[0] ? (
                    <img src={item.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-gold/20 bg-gold/5"><ImageIcon size={48}/></div>
                 )}
                 <div className="absolute top-2 right-2 flex gap-2">
                    <button onClick={() => setEditingItem(item)} className="p-3 bg-royal-deep/80 text-gold backdrop-blur-sm border border-gold/20 hover:bg-gold hover:text-royal-deep transition-all">
                       <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-3 bg-red-900/80 text-white backdrop-blur-sm border border-red-500/20 hover:bg-red-600 transition-all">
                       <Trash2 size={16} />
                    </button>
                 </div>
              </div>
              <div className="p-6">
                <div className="font-serif-sc text-gold text-[10px] tracking-widest mb-2">{item.type}</div>
                <h3 className="font-display text-3xl mb-4">{item.title}</h3>
                <div className="flex gap-2 mb-2">
                   {item.featured && <span className="bg-gold text-royal-deep text-[8px] font-serif-sc px-2 py-0.5 tracking-tighter">FEATURED</span>}
                   {!item.active && <span className="bg-red-900/50 text-white text-[8px] font-serif-sc px-2 py-0.5 tracking-tighter border border-red-500/20">INACTIVE</span>}
                </div>
                <p className="font-serif text-sm text-muted-foreground/80 line-clamp-2 italic">{item.short_description || item.full_description}</p>
                <div className="mt-4 flex gap-1">
                   {item.images.slice(0, 5).map((img, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border border-gold/20 overflow-hidden">
                         <img src={img} className="w-full h-full object-cover" />
                      </div>
                   ))}
                   {item.images.length > 5 && <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-[8px] text-gold">+{item.images.length - 5}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
