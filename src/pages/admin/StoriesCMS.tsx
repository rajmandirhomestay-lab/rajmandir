import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Plus, Edit2, Trash2, Save, X, BookOpen, Image as ImageIcon } from "lucide-react";
import { MultiImageUploader } from "@/components/admin/MultiImageUploader";

type Story = {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  featured: boolean;
  active: boolean;
  seo_title: string;
  seo_description: string;
  images: string[];
};

export default function StoriesCMS() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStory, setEditingStory] = useState<Partial<Story> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from("travel_stories")
        .select("*, travel_story_images(image_url)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formatted = data?.map((s: any) => ({
        ...s,
        images: s.travel_story_images?.map((img: any) => img.image_url) || []
      })) || [];

      setStories(formatted);
    } catch (error: any) {
      toast.error("Failed to load stories: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory?.title || !editingStory?.slug) return;
    
    setSaving(true);
    try {
      const payload = {
        title: editingStory.title,
        slug: editingStory.slug,
        short_description: editingStory.short_description,
        full_description: editingStory.full_description,
        featured: editingStory.featured || false,
        active: editingStory.active !== false,
        seo_title: editingStory.seo_title,
        seo_description: editingStory.seo_description,
        updated_at: new Date().toISOString(),
      };

      let storyId = editingStory.id;

      if (storyId) {
        await supabase.from("travel_stories").update(payload).eq("id", storyId);
        await supabase.from("travel_story_images").delete().eq("travel_story_id", storyId);
      } else {
        const { data, error } = await supabase.from("travel_stories").insert([payload]).select().single();
        if (error) throw error;
        storyId = data.id;
      }

      if (editingStory.images && editingStory.images.length > 0) {
        const imageInserts = editingStory.images.map((url, idx) => ({
          travel_story_id: storyId,
          image_url: url,
          sort_order: idx
        }));
        await supabase.from("travel_story_images").insert(imageInserts);
      }
      
      toast.success("Chronicle saved to the palace archives.");
      setEditingStory(null);
      fetchStories();
    } catch (error: any) {
      toast.error("Failed to save story: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  if (loading) return <div className="flex justify-center h-[50vh] items-center"><Loader2 className="animate-spin text-gold w-10 h-10" /></div>;

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-foreground mb-2">Travel Stories CMS</h1>
          <p className="font-serif text-muted-foreground">Manage your royal chronicles with multiple image sliders.</p>
        </div>
        {!editingStory && (
          <button onClick={() => setEditingStory({ featured: false, active: true, images: [] })} className="bg-gold text-royal-deep font-serif-sc text-xs px-6 py-3 flex items-center gap-2 hover:bg-gold-glow">
            <Plus size={16} /> WRITE NEW STORY
          </button>
        )}
      </div>

      {editingStory ? (
        <div className="bg-card border border-gold/20 shadow-frame p-8">
           <div className="flex justify-between border-b border-gold/10 pb-4 mb-8">
              <h2 className="font-display text-3xl">{editingStory.id ? "Refine Chronicle" : "New Dispatch"}</h2>
              <button onClick={() => setEditingStory(null)}><X size={24} className="text-muted-foreground" /></button>
           </div>
           <form onSubmit={handleSave} className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                 <div className="grid md:grid-cols-2 gap-6">
                    <div>
                       <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">STORY TITLE</label>
                       <input required type="text" value={editingStory.title || ""} onChange={e => setEditingStory({ ...editingStory, title: e.target.value, slug: generateSlug(e.target.value) })} className="w-full bg-background border border-gold/20 p-3 font-serif text-sm" />
                    </div>
                    <div>
                       <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">URL SLUG</label>
                       <input required type="text" value={editingStory.slug || ""} onChange={e => setEditingStory({ ...editingStory, slug: generateSlug(e.target.value) })} className="w-full bg-background border border-gold/20 p-3 font-serif text-sm" />
                    </div>
                 </div>
                 <div className="grid md:grid-cols-2 gap-6">
                    <div>
                       <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">SEO TITLE</label>
                       <input value={editingStory.seo_title || ""} onChange={e => setEditingStory({...editingStory, seo_title: e.target.value})} className="w-full bg-background border border-gold/20 p-3 font-serif text-sm" />
                    </div>
                    <div>
                       <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">SEO DESCRIPTION</label>
                       <input value={editingStory.seo_description || ""} onChange={e => setEditingStory({...editingStory, seo_description: e.target.value})} className="w-full bg-background border border-gold/20 p-3 font-serif text-sm" />
                    </div>
                 </div>
                 <div>
                    <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">SHORT DESCRIPTION / EXCERPT</label>
                    <textarea rows={2} required value={editingStory.short_description || ""} onChange={e => setEditingStory({...editingStory, short_description: e.target.value})} className="w-full bg-background border border-gold/20 p-3 font-serif text-sm resize-none" />
                 </div>
                 <div>
                    <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">FULL CONTENT</label>
                    <textarea rows={8} required value={editingStory.full_description || ""} onChange={e => setEditingStory({...editingStory, full_description: e.target.value})} className="w-full bg-background border border-gold/20 p-3 font-serif text-sm resize-none" />
                 </div>
                 <div className="flex items-center gap-6 py-2 border-y border-gold/10">
                    <label className="flex items-center gap-3 cursor-pointer">
                       <input type="checkbox" checked={editingStory.featured} onChange={e => setEditingStory({...editingStory, featured: e.target.checked})} className="w-4 h-4 accent-gold" />
                       <span className="font-serif-sc text-[10px] tracking-widest">SET AS FEATURED</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                       <input type="checkbox" checked={editingStory.active} onChange={e => setEditingStory({...editingStory, active: e.target.checked})} className="w-4 h-4 accent-gold" />
                       <span className="font-serif-sc text-[10px] tracking-widest">ACTIVE / PUBLISHED</span>
                    </label>
                 </div>
                 <button disabled={saving} className="w-full bg-gold text-royal-deep py-4 font-serif-sc tracking-widest text-xs flex items-center justify-center gap-2">
                    {saving ? <Loader2 className="animate-spin" /> : <Save />} ARCHIVE STORY
                 </button>
              </div>
              <MultiImageUploader 
                 images={editingStory.images || []} 
                 onChange={imgs => setEditingStory({...editingStory, images: imgs})} 
                 folder="stories" 
                 bucket="travel-stories"
              />
           </form>
        </div>
      ) : (
        <div className="grid gap-6">
           {stories.map(story => (
              <div key={story.id} className="bg-card border border-gold/20 p-4 flex gap-6 group hover:shadow-gold transition-all shadow-frame">
                 <div className="w-48 h-32 shrink-0 border border-gold/10 overflow-hidden relative">
                    {story.images[0] ? <img src={story.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <div className="w-full h-full bg-gold/5 flex items-center justify-center text-gold/20"><ImageIcon size={32}/></div>}
                    {story.featured && <div className="absolute top-2 left-2 bg-gold text-royal-deep text-[8px] font-serif-sc px-2 py-0.5 tracking-tighter">FEATURED</div>}
                    {!story.active && <div className="absolute top-2 right-2 bg-red-900/80 text-white text-[8px] font-serif-sc px-2 py-0.5 tracking-tighter">DRAFT</div>}
                 </div>
                 <div className="flex-grow flex flex-col justify-center">
                    <h3 className="font-display text-2xl mb-1">{story.title}</h3>
                    <p className="font-serif text-xs text-muted-foreground line-clamp-2 italic mt-2">{story.short_description}</p>
                 </div>
                 <div className="flex flex-col gap-2 justify-center">
                    <button onClick={() => setEditingStory(story)} className="p-3 border border-gold/20 text-gold hover:bg-gold hover:text-royal-deep transition-all"><Edit2 size={16} /></button>
                    <button onClick={() => {}} className="p-3 border border-red-900/20 text-red-400 hover:bg-red-900/40 transition-all"><Trash2 size={16} /></button>
                 </div>
              </div>
           ))}
        </div>
      )}
    </div>
  );
}
