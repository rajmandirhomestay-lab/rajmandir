import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { usePageHeroes } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Save, Image as ImageIcon, LayoutTemplate } from "lucide-react";
import { compressImage } from "@/lib/imageCompression";

type PageHero = {
  id?: string;
  page_slug: string;
  eyebrow: string;
  title: string;
  accent: string;
  subtitle: string;
  image_url: string;
};

const PAGES = [
  "about",
  "attractions",
  "booking",
  "contact",
  "dining",
  "experiences",
  "faq",
  "feedback",
  "gallery",
  "rooms",
  "stories"
];

export default function PageHeroesCMS() {
  const { data: dbHeroes, isLoading, refetch } = usePageHeroes();
  const [heroes, setHeroes] = useState<Record<string, PageHero>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (dbHeroes) {
      const heroesMap: Record<string, PageHero> = {};
      dbHeroes.forEach((h: PageHero) => {
        heroesMap[h.page_slug] = h;
      });

      PAGES.forEach(slug => {
        if (!heroesMap[slug]) {
          heroesMap[slug] = {
            page_slug: slug,
            eyebrow: "",
            title: "",
            accent: "",
            subtitle: "",
            image_url: ""
          };
        }
      });

      setHeroes(heroesMap);
    }
  }, [dbHeroes]);

  const handleChange = (slug: string, field: keyof PageHero, value: string) => {
    setHeroes(prev => ({
      ...prev,
      [slug]: {
        ...prev[slug],
        [field]: value
      }
    }));
  };

  const handleImageUpload = async (slug: string, file: File) => {
    try {
      setSaving(slug);
      const optimizedFile = await compressImage(file);
      const fileExt = "webp";
      const fileName = `${Date.now()}-${slug}.${fileExt}`;
      const filePath = `hero/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('content')
        .upload(filePath, optimizedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('content')
        .getPublicUrl(filePath);

      handleChange(slug, "image_url", publicUrl);
      toast.success("Image uploaded successfully. Don't forget to save!");
    } catch (error: any) {
      toast.error("Error uploading image: " + error.message);
    } finally {
      setSaving(null);
    }
  };

  const handleSave = async (slug: string) => {
    setSaving(slug);
    try {
      const dataToSave = { ...heroes[slug] };
      if (!dataToSave.id) {
        delete (dataToSave as any).id; // Let DB generate ID
      }

      const { error } = await supabase
        .from("page_heroes")
        .upsert([dataToSave], { onConflict: "page_slug" });

      if (error) throw error;

      toast.success(`${slug.toUpperCase()} hero section updated successfully!`);
      refetch();
    } catch (error: any) {
      toast.error("Failed to save: " + error.message);
    } finally {
      setSaving(null);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center h-[50vh] items-center"><Loader2 className="animate-spin text-gold w-10 h-10" /></div>;
  }

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      <div className="flex items-center justify-between border-b border-gold/10 pb-6">
        <div>
          <h1 className="font-display text-4xl mb-2 flex items-center gap-4">
            <LayoutTemplate className="text-gold" size={32} />
            Page Heroes
          </h1>
          <p className="font-serif text-muted-foreground">Manage the hero section background images and text for all subpages.</p>
        </div>
      </div>

      <div className="space-y-12">
        {PAGES.map(slug => (
          <div key={slug} className="bg-card border border-gold/20 shadow-frame p-6 lg:p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-gold/10 relative z-10">
               <h2 className="font-display text-3xl capitalize text-gold">{slug} Hero</h2>
               <button 
                 onClick={() => handleSave(slug)} 
                 disabled={saving === slug}
                 className="bg-gold text-royal-deep font-serif-sc text-xs px-8 py-3 flex items-center justify-center gap-2 hover:shadow-gold transition-all duration-300 w-full sm:w-auto"
               >
                 {saving === slug ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
                 SAVE HERO
               </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-10 relative z-10">
               {/* Image Column */}
               <div className="space-y-4">
                  <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block">HERO BACKGROUND IMAGE</label>
                  <div className="aspect-[16/9] bg-background border border-gold/20 relative overflow-hidden flex items-center justify-center group/img">
                    {heroes[slug]?.image_url ? (
                      <img src={heroes[slug].image_url} alt="Hero" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-6">
                        <ImageIcon className="mx-auto text-gold/50 mb-2" size={32} />
                        <p className="font-serif italic text-sm text-muted-foreground">No image set.</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <label className="cursor-pointer bg-gold text-royal-deep px-6 py-2 font-serif-sc text-xs tracking-widest hover:shadow-gold transition-all">
                        {saving === slug ? "UPLOADING..." : "UPLOAD NEW IMAGE"}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleImageUpload(slug, e.target.files[0]);
                            }
                          }}
                          disabled={saving === slug}
                        />
                      </label>
                    </div>
                  </div>
                  <input 
                    type="text" 
                    value={heroes[slug]?.image_url || ""} 
                    onChange={e => handleChange(slug, "image_url", e.target.value)}
                    placeholder="Or paste an image URL here..."
                    className="w-full bg-background border border-gold/20 focus:border-gold px-4 py-3 font-serif outline-none"
                  />
               </div>

               {/* Text Column */}
               <div className="space-y-6">
                  <div>
                    <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">EYEBROW TEXT</label>
                    <input 
                      type="text" 
                      value={heroes[slug]?.eyebrow || ""} 
                      onChange={e => handleChange(slug, "eyebrow", e.target.value)}
                      className="w-full bg-background border border-gold/20 focus:border-gold px-4 py-3 font-serif outline-none placeholder:italic"
                      placeholder="e.g. A CULTURAL EXPERIENCE"
                    />
                  </div>
                  <div>
                    <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">MAIN TITLE</label>
                    <input 
                      type="text" 
                      value={heroes[slug]?.title || ""} 
                      onChange={e => handleChange(slug, "title", e.target.value)}
                      className="w-full bg-background border border-gold/20 focus:border-gold px-4 py-3 font-serif outline-none placeholder:italic"
                      placeholder="e.g. More Than a"
                    />
                  </div>
                  <div>
                    <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">ACCENT WORD (Gold & Italic)</label>
                    <input 
                      type="text" 
                      value={heroes[slug]?.accent || ""} 
                      onChange={e => handleChange(slug, "accent", e.target.value)}
                      className="w-full bg-background border border-gold/20 focus:border-gold px-4 py-3 font-serif outline-none placeholder:italic"
                      placeholder="e.g. Stay"
                    />
                  </div>
                  <div>
                    <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">SUBTITLE / PARAGRAPH</label>
                    <textarea 
                      value={heroes[slug]?.subtitle || ""} 
                      onChange={e => handleChange(slug, "subtitle", e.target.value)}
                      className="w-full bg-background border border-gold/20 focus:border-gold px-4 py-3 font-serif outline-none h-28 resize-none placeholder:italic"
                      placeholder="e.g. Experience Rajasthan like never before. Your royal escape begins here."
                    />
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
