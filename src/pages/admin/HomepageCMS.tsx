import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Save, Type, Image as ImageIcon, Eye, EyeOff, LayoutTemplate, BedDouble, Utensils, Compass, Quote, MessageSquare, X } from "lucide-react";
import { ImageSelector } from "@/components/admin/ImageSelector";

type HomepageSection = {
  section_key: string;
  title: string;
  subtitle: string;
  is_visible: boolean;
  content?: any;
};

export default function HomepageCMS() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [showImageSelector, setShowImageSelector] = useState(false);
  
  const [sections, setSections] = useState<Record<string, HomepageSection>>({
    hero: { section_key: "hero", title: "Raj Mandir", subtitle: "Where history meets luxury.", is_visible: true, content: {} },
    rooms: { section_key: "rooms", title: "Royal Chambers", subtitle: "Experience the legacy.", is_visible: true, content: {} },
    dining: { section_key: "dining", title: "Palace Dining", subtitle: "A culinary journey.", is_visible: true, content: {} },
    experiences: { section_key: "experiences", title: "Curated Experiences", subtitle: "Bespoke adventures.", is_visible: true, content: {} },
    testimonials: { section_key: "testimonials", title: "Guest Voices", subtitle: "Chronicles of joy.", is_visible: true, content: {} },
    faq: { section_key: "faq", title: "Inquiries", subtitle: "Essential knowledge.", is_visible: true, content: {} },
  });

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from("homepage_sections")
        .select("*");

      if (error) throw error;
      
      if (data) {
        const sectionsMap = { ...sections };
        data.forEach((s) => {
          sectionsMap[s.section_key] = {
            section_key: s.section_key,
            title: s.content?.title || sectionsMap[s.section_key]?.title,
            subtitle: s.content?.subtitle || sectionsMap[s.section_key]?.subtitle,
            is_visible: s.is_visible !== false,
            content: s.content || {},
          };
        });
        setSections(sectionsMap);
      }
    } catch (error: any) {
      toast.error("Failed to load CMS data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (key: string, field: string, value: any) => {
    setSections((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleUpdateContent = (key: string, value: any) => {
    setSections((prev) => ({
      ...prev,
      [key]: { ...prev[key], content: { ...prev[key].content, ...value } },
    }));
  };

  const saveSection = async (key: string) => {
    setSaving(true);
    try {
      const section = sections[key];
      const { error } = await supabase
        .from("homepage_sections")
        .upsert({
          section_key: key,
          content: {
            ...(section.content || {}),
            title: section.title,
            subtitle: section.subtitle
          },
          is_visible: section.is_visible,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'section_key' });

      if (error) throw error;
      toast.success(`${key.toUpperCase()} section updated successfully.`);
    } catch (error: any) {
      toast.error("Failed to save data: " + error.message);
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

  const navItems = [
    { id: "hero", label: "HERO", icon: LayoutTemplate, bucket: 'hero-assets' },
    { id: "rooms", label: "ROOMS", icon: BedDouble, bucket: 'room-categories' },
    { id: "dining", label: "DINING", icon: Utensils, bucket: 'dining-images' },
    { id: "experiences", label: "EXPERIENCES", icon: Compass, bucket: 'experience-images' },
    { id: "testimonials", label: "REVIEWS", icon: Quote, bucket: 'testimonial-assets' },
    { id: "faq", label: "FAQ", icon: MessageSquare, bucket: 'brand-assets' },
  ];

  const currentSection = sections[activeSection];
  const activeNavItem = navItems.find(n => n.id === activeSection);

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="font-display text-4xl text-foreground mb-2">Homepage CMS</h1>
        <p className="font-serif text-muted-foreground">Manage the content that guests see when they arrive at the Palace gates.</p>
      </div>

      <div className="flex border-b border-gold/10 overflow-x-auto no-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`flex items-center gap-2 px-6 py-4 font-serif-sc text-[10px] tracking-widest transition-all relative shrink-0 ${
              activeSection === item.id ? "text-gold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon size={14} />
            {item.label}
            {activeSection === item.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
            )}
          </button>
        ))}
      </div>

      <div className="bg-card border border-gold/20 shadow-frame p-8">
        <div className="flex items-center justify-between border-b border-gold/10 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-gold/30 flex items-center justify-center bg-gold/5">
              <Type size={18} className="text-gold" />
            </div>
            <div>
              <h2 className="font-serif-sc text-sm tracking-widest text-gold">{activeSection.toUpperCase()} SECTION</h2>
              <p className="font-serif text-xs text-muted-foreground mt-1">Manage titles and media</p>
            </div>
          </div>
          <button 
            onClick={() => handleUpdate(activeSection, "is_visible", !currentSection.is_visible)}
            className={`flex items-center gap-2 px-4 py-2 font-serif-sc text-[10px] tracking-widest transition-colors ${
              currentSection.is_visible 
                ? "bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20" 
                : "bg-muted text-muted-foreground border border-transparent hover:border-muted-foreground/30"
            }`}
          >
            {currentSection.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
            {currentSection.is_visible ? "VISIBLE" : "HIDDEN"}
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">
                  SECTION TITLE
                </label>
                <input
                  type="text"
                  value={currentSection.title}
                  onChange={(e) => handleUpdate(activeSection, "title", e.target.value)}
                  className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-display text-2xl text-foreground transition-all duration-300"
                />
              </div>

              <div>
                <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">
                  SECTION SUBTITLE / TAGLINE
                </label>
                <textarea
                  rows={4}
                  value={currentSection.subtitle}
                  onChange={(e) => handleUpdate(activeSection, "subtitle", e.target.value)}
                  className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif text-foreground transition-all duration-300 resize-none"
                />
              </div>
            </div>

            <div>
              <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-4 uppercase">
                {activeSection} BACKGROUND / FEATURED IMAGE
              </label>
              
              {currentSection.content?.image_url ? (
                <div className="relative w-full aspect-video border border-gold/30 group overflow-hidden jharokha-frame bg-black/40">
                  <img 
                    src={currentSection.content.image_url} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    alt={currentSection.title} 
                  />
                  <div className="absolute inset-0 bg-royal-deep/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                    <button 
                      onClick={() => setShowImageSelector(true)}
                      className="bg-gold text-royal-deep p-3 rounded-full hover:scale-110 transition-transform shadow-gold"
                      title="Change Image"
                    >
                      <ImageIcon size={20} />
                    </button>
                    <button 
                      onClick={() => handleUpdateContent(activeSection, { image_url: null })}
                      className="bg-red-500 text-white p-3 rounded-full hover:scale-110 transition-transform shadow-lg"
                      title="Remove Image"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowImageSelector(true)}
                  className="w-full aspect-video border-2 border-dashed border-gold/20 hover:border-gold/50 transition-colors flex flex-col items-center justify-center gap-3 bg-gold/5 group jharokha-frame"
                >
                  <ImageIcon size={48} className="text-gold/20 group-hover:text-gold/40 transition-colors" />
                  <span className="font-serif-sc text-[10px] tracking-widest text-gold/40">SELECT PALACE VISUAL</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gold/10 flex justify-end">
          <button
            onClick={() => saveSection(activeSection)}
            disabled={saving}
            className="bg-gold text-royal-deep font-serif-sc tracking-[0.2em] text-xs px-8 py-3 flex items-center gap-2 hover:bg-gold-glow transition-all duration-300 disabled:opacity-70"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {saving ? "SAVING..." : "SAVE SECTION"}
          </button>
        </div>
      </div>

      {showImageSelector && activeNavItem && (
        <ImageSelector
          bucketId={activeNavItem.bucket}
          selectedUrl={currentSection.content?.image_url}
          onSelect={(url) => {
            handleUpdateContent(activeSection, { image_url: url });
            setShowImageSelector(false);
          }}
          onClose={() => setShowImageSelector(false)}
        />
      )}
    </div>
  );
}
