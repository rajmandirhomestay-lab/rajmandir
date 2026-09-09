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
  { slug: "home", label: "Home Page" },
  { slug: "about", label: "About Us" },
  { slug: "attractions", label: "Attractions & Wonders" },
  { slug: "booking", label: "Booking & Reservations" },
  { slug: "contact", label: "Contact Us" },
  { slug: "day-at-raj-mandir", label: "A Day at Raj Mandir" },
  { slug: "dining", label: "Palace Dining" },
  { slug: "experiences", label: "Curated Experiences" },
  { slug: "faq", label: "FAQ & Inquiries" },
  { slug: "feedback", label: "Guest Feedback & Stories" },
  { slug: "gallery", label: "Palace Gallery" },
  { slug: "rooms", label: "Royal Chambers & Suites" },
  { slug: "room-details", label: "Room Details" },
  { slug: "stories", label: "Travel Chronicles" }
];

export default function PageHeroesCMS() {
  const { data: dbHeroes, isLoading, refetch } = usePageHeroes();
  const [heroes, setHeroes] = useState<Record<string, PageHero>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const heroesMap: Record<string, PageHero> = {};
    if (dbHeroes) {
      dbHeroes.forEach((h: PageHero) => {
        heroesMap[h.page_slug] = h;
      });
    }

    PAGES.forEach(page => {
      if (!heroesMap[page.slug]) {
        heroesMap[page.slug] = {
          page_slug: page.slug,
          eyebrow: "",
          title: "",
          accent: "",
          subtitle: "",
          image_url: ""
        };
      }
    });

    setHeroes(heroesMap);
  }, [dbHeroes]);

  const [activeTab, setActiveTab] = useState<string>("home");

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
      const originalSizeKb = (file.size / 1024).toFixed(1);
      const optimizedFile = await compressImage(file);
      const compressedSizeKb = (optimizedFile.size / 1024).toFixed(1);
      const fileExt = "webp";
      const fileName = `${Date.now()}-${slug}.${fileExt}`;
      const filePath = `hero/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('hero-assets')
        .upload(filePath, optimizedFile, { upsert: true });

      let finalUrl = "";
      if (uploadError) {
        // Fallback to 'content' bucket if hero-assets doesn't exist
        const { error: fallbackError } = await supabase.storage
          .from('content')
          .upload(filePath, optimizedFile, { upsert: true });

        if (fallbackError) throw fallbackError;

        const { data: { publicUrl } } = supabase.storage
          .from('content')
          .getPublicUrl(filePath);
        finalUrl = publicUrl;
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('hero-assets')
          .getPublicUrl(filePath);
        finalUrl = publicUrl;
      }

      handleChange(slug, "image_url", finalUrl);
      toast.success(`Image compressed (${originalSizeKb}KB → ${compressedSizeKb}KB) and uploaded! Save hero to apply.`);
    } catch (error: any) {
      toast.error("Error uploading image: " + error.message);
    } finally {
      setSaving(null);
    }
  };

  const handleSave = async (slug: string) => {
    setSaving(slug);
    try {
      const dataToSave = { ...heroes[slug], page_slug: slug };
      if (!dataToSave.id) {
        delete (dataToSave as any).id; // Let DB generate ID
      }

      const { error } = await supabase
        .from("page_heroes")
        .upsert([dataToSave], { onConflict: "page_slug" });

      if (error) throw error;

      if (slug === "home") {
        try {
          const combinedTitle = dataToSave.title 
            ? (dataToSave.accent ? `${dataToSave.title} ${dataToSave.accent}` : dataToSave.title)
            : "";
          await supabase
            .from("homepage_sections")
            .update({
              content: {
                title: combinedTitle,
                subtitle: dataToSave.subtitle || "",
                image_url: dataToSave.image_url || ""
              }
            })
            .eq("section_key", "hero");
        } catch (_) {}
      }

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

  const activePageObj = PAGES.find(p => p.slug === activeTab) || PAGES[0];
  const currentHero = heroes[activePageObj.slug] || { page_slug: activePageObj.slug, eyebrow: "", title: "", accent: "", subtitle: "", image_url: "" };

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      <div className="flex items-center justify-between border-b border-gold/10 pb-6">
        <div>
          <h1 className="font-display text-4xl mb-2 flex items-center gap-4">
            <LayoutTemplate className="text-gold" size={32} />
            Centralized Page Heroes CMS
          </h1>
          <p className="font-serif text-muted-foreground">Manage background images, titles, and subtitles for all website subpages & homepage heroes.</p>
        </div>
      </div>

      {/* Page Tabs */}
      <div className="flex border-b border-gold/10 overflow-x-auto no-scrollbar gap-1">
        {PAGES.map((page) => (
          <button
            key={page.slug}
            onClick={() => setActiveTab(page.slug)}
            className={`px-5 py-3 font-serif-sc text-[11px] tracking-widest transition-all relative shrink-0 border-b-2 ${
              activeTab === page.slug 
                ? "border-gold text-gold font-bold bg-gold/10" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-gold/5"
            }`}
          >
            {page.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Hero Form Card */}
      <div className="bg-card border border-gold/20 shadow-frame p-6 lg:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-gold/10">
          <div>
            <span className="font-serif-sc text-xs tracking-widest text-gold block mb-1">EDITING HERO</span>
            <h2 className="font-display text-3xl capitalize text-foreground">{activePageObj.label} Hero</h2>
          </div>
          <button 
            onClick={() => handleSave(activePageObj.slug)} 
            disabled={saving === activePageObj.slug}
            className="bg-gradient-gold text-royal-deep font-serif-sc text-xs px-8 py-3 flex items-center justify-center gap-2 hover:shadow-gold transition-all duration-300 w-full sm:w-auto"
          >
            {saving === activePageObj.slug ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
            SAVE HERO
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Image Column */}
          <div className="space-y-4">
            <label className="font-serif-sc text-[10px] tracking-widest text-gold block uppercase">HERO BACKGROUND IMAGE</label>
            <div className="aspect-[16/9] bg-background border border-gold/20 relative overflow-hidden flex items-center justify-center group/img rounded-sm shadow-md">
              {currentHero.image_url ? (
                <img src={currentHero.image_url} alt="Hero" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-6">
                  <ImageIcon className="mx-auto text-gold/50 mb-2" size={36} />
                  <p className="font-serif italic text-sm text-muted-foreground">No hero image uploaded yet.</p>
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <label className="cursor-pointer bg-gradient-gold text-royal-deep px-6 py-2.5 font-serif-sc text-xs tracking-widest shadow-gold hover:scale-[1.03] transition-all">
                  {saving === activePageObj.slug ? "UPLOADING..." : "UPLOAD NEW IMAGE"}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageUpload(activePageObj.slug, e.target.files[0]);
                      }
                    }}
                    disabled={saving === activePageObj.slug}
                  />
                </label>
              </div>
            </div>
            <input 
              type="text" 
              value={currentHero.image_url || ""} 
              onChange={e => handleChange(activePageObj.slug, "image_url", e.target.value)}
              placeholder="Or paste an image URL directly..."
              className="w-full bg-background border border-gold/20 focus:border-gold px-4 py-3 font-serif outline-none text-sm text-foreground"
            />
          </div>

          {/* Text Column */}
          <div className="space-y-6">
            <div>
              <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2 uppercase">EYEBROW BADGE TEXT</label>
              <input 
                type="text" 
                value={currentHero.eyebrow || ""} 
                onChange={e => handleChange(activePageObj.slug, "eyebrow", e.target.value)}
                className="w-full bg-background border border-gold/20 focus:border-gold px-4 py-3 font-serif outline-none placeholder:italic text-foreground"
                placeholder="e.g. WELCOME TO RAJ MANDIR"
              />
            </div>
            <div>
              <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2 uppercase">MAIN TITLE</label>
              <input 
                type="text" 
                value={currentHero.title || ""} 
                onChange={e => handleChange(activePageObj.slug, "title", e.target.value)}
                className="w-full bg-background border border-gold/20 focus:border-gold px-4 py-3 font-serif outline-none placeholder:italic text-foreground"
                placeholder="e.g. Where Heritage Meets"
              />
            </div>
            <div>
              <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2 uppercase">ACCENT WORD (Gold & Italic)</label>
              <input 
                type="text" 
                value={currentHero.accent || ""} 
                onChange={e => handleChange(activePageObj.slug, "accent", e.target.value)}
                className="w-full bg-background border border-gold/20 focus:border-gold px-4 py-3 font-serif outline-none placeholder:italic text-foreground"
                placeholder="e.g. Hospitality"
              />
            </div>
            <div>
              <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2 uppercase">SUBTITLE / PARAGRAPH</label>
              <textarea 
                value={currentHero.subtitle || ""} 
                onChange={e => handleChange(activePageObj.slug, "subtitle", e.target.value)}
                className="w-full bg-background border border-gold/20 focus:border-gold px-4 py-3 font-serif outline-none h-28 resize-none placeholder:italic text-foreground leading-relaxed"
                placeholder="e.g. Experience warm hospitality and heritage architecture in Jodhpur."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
