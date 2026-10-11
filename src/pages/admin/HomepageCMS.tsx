import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Save, Type, Image as ImageIcon, Eye, EyeOff, LayoutTemplate, BedDouble, Utensils, Compass, Quote, MessageSquare, Clock, BookOpen, Video as VideoIcon } from "lucide-react";
import { SingleImageUploader } from "@/components/admin/SingleImageUploader";
import { compressVideo, isVideoUrl } from "@/lib/videoCompression";

type HomepageSection = {
  section_key: string;
  title: string;
  subtitle: string;
  description?: string;
  is_visible: boolean;
  content?: any;
};

export default function HomepageCMS() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("story");
    
  const [sections, setSections] = useState<Record<string, HomepageSection>>({
    story: { section_key: "story", title: "A Legacy of Warm Welcome.", subtitle: "Built in 1894 at the foot of Mehrangarh Fort, Raj Mandir was once the summer residence of a Marwari noble.", description: "Today, our family opens these doors as guardians — not owners — inviting travelers to walk softly through history.", is_visible: true, content: {} },
    day_at_raj_mandir: { section_key: "day_at_raj_mandir", title: "A Day at Raj Mandir", subtitle: "From your first morning chai to dinner beneath the Jodhpur sky, discover how a day at Raj Mandir can become part of your journey.", description: "Experience the rhythmic flow of a royal day — sunrise chai, rooftop breakfasts, heritage walking tours, lazy afternoon siestas, and sunset dinner overlooking Mehrangarh Fort.", is_visible: true, content: {} },
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
        setSections((prev) => {
          const sectionsMap = { ...prev };
          data.forEach((s) => {
            sectionsMap[s.section_key] = {
              section_key: s.section_key,
              title: s.content?.title || sectionsMap[s.section_key]?.title || "",
              subtitle: s.content?.subtitle || sectionsMap[s.section_key]?.subtitle || "",
              description: s.content?.description || sectionsMap[s.section_key]?.description || "",
              is_visible: s.is_visible !== false,
              content: s.content || {},
            };
          });
          return sectionsMap;
        });
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

  const handleVideoUpload = async (file: File) => {
    try {
      setSaving(true);
      const origMb = (file.size / (1024 * 1024)).toFixed(1);
      const toastId = toast.loading(`Compressing video (${origMb}MB)... saving bandwidth.`);

      const compressed = await compressVideo(file, {
        maxWidth: 1280,
        maxHeight: 720,
        targetBitrate: 1800000,
        onProgress: (p) => {
          toast.loading(`Compressing video: ${p}%`, { id: toastId });
        }
      });

      const compMb = (compressed.size / (1024 * 1024)).toFixed(1);
      toast.loading(`Uploading compressed video (${compMb}MB)...`, { id: toastId });

      const fileExt = compressed.name.split('.').pop() || "webm";
      const fileName = `homepage-${activeSection}-${Date.now()}.${fileExt}`;
      const filePath = `homepage-${activeSection}/${fileName}`;

      const bucket = activeNavItem?.bucket || "brand-assets";
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, compressed, { upsert: true, contentType: compressed.type || 'video/webm' });

      let finalUrl = "";
      if (uploadError) {
        const { error: fallbackErr } = await supabase.storage
          .from("content")
          .upload(filePath, compressed, { upsert: true, contentType: compressed.type || 'video/webm' });
        if (fallbackErr) throw fallbackErr;
        finalUrl = supabase.storage.from("content").getPublicUrl(filePath).data.publicUrl;
      } else {
        finalUrl = supabase.storage.from(bucket).getPublicUrl(filePath).data.publicUrl;
      }

      handleUpdateContent(activeSection, { image_url: finalUrl, video_url: finalUrl });
      toast.success(`Video compressed (${origMb}MB → ${compMb}MB) and attached! Click Save Section to publish.`, { id: toastId });
    } catch (err: any) {
      toast.error("Video upload failed: " + err.message);
    } finally {
      setSaving(false);
    }
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
            subtitle: section.subtitle,
            description: section.description,
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
    { id: "story", label: "OUR STORY", icon: BookOpen, bucket: 'brand-assets' },
    { id: "day_at_raj_mandir", label: "DAY AT RAJ MANDIR", icon: Clock, bucket: 'brand-assets' },
    { id: "rooms", label: "ROOMS", icon: BedDouble, bucket: 'room-categories' },
    { id: "dining", label: "DINING", icon: Utensils, bucket: 'dining-images' },
    { id: "experiences", label: "EXPERIENCES", icon: Compass, bucket: 'experience-images' },
    { id: "testimonials", label: "REVIEWS", icon: Quote, bucket: 'testimonial-assets' },
    { id: "faq", label: "FAQ", icon: MessageSquare, bucket: 'brand-assets' },
  ];

  const currentSection = sections[activeSection] || { section_key: activeSection, title: "", subtitle: "", is_visible: true, content: {} };
  const activeNavItem = navItems.find(n => n.id === activeSection);

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="font-display text-4xl text-foreground mb-2">Homepage CMS</h1>
        <p className="font-serif text-muted-foreground">Manage the content, titles, descriptions, and images that guests see on the Homepage.</p>
      </div>

      <div className="flex border-b border-gold/10 overflow-x-auto no-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`flex items-center gap-2 px-6 py-4 font-serif-sc text-[10px] tracking-widest transition-all relative shrink-0 ${
              activeSection === item.id ? "text-gold font-bold" : "text-muted-foreground hover:text-foreground"
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
              <p className="font-serif text-xs text-muted-foreground mt-1">Manage titles, description text, and featured image</p>
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
                  className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-display text-xl text-foreground transition-all duration-300"
                />
              </div>

              <div>
                <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">
                  SECTION SUBTITLE / SHORT TAGLINE
                </label>
                <textarea
                  rows={3}
                  value={currentSection.subtitle}
                  onChange={(e) => handleUpdate(activeSection, "subtitle", e.target.value)}
                  className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif text-foreground transition-all duration-300 resize-none"
                />
              </div>

              <div>
                <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">
                  FULL DESCRIPTION (OPTIONAL)
                </label>
                <textarea
                  rows={4}
                  value={currentSection.description || ""}
                  onChange={(e) => handleUpdate(activeSection, "description", e.target.value)}
                  placeholder="Enter detailed description paragraph..."
                  className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif text-foreground transition-all duration-300 resize-none"
                />
              </div>

              {/* Text Color & Background Override Controls */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gold/10">
                <div>
                  <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2 uppercase">
                    TEXT COLOR OVERRIDE
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentSection.content?.text_color || "#091a28"}
                      onChange={(e) => handleUpdateContent(activeSection, { text_color: e.target.value })}
                      className="w-9 h-9 rounded border border-gold/30 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={currentSection.content?.text_color || ""}
                      onChange={(e) => handleUpdateContent(activeSection, { text_color: e.target.value })}
                      placeholder="e.g. #091a28 or #ffffff"
                      className="w-full bg-background border border-gold/20 px-3 py-2 text-xs font-mono text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2 uppercase">
                    BACKGROUND STYLE MODE
                  </label>
                  <select
                    value={currentSection.content?.bg_mode || "theme"}
                    onChange={(e) => handleUpdateContent(activeSection, { bg_mode: e.target.value })}
                    className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-3 py-2 font-serif text-xs text-foreground"
                  >
                    <option value="theme">Default Active Theme</option>
                    <option value="cream">Light Palace Cream (#faf6f0)</option>
                    <option value="royal">Royal Midnight Navy (#091a28)</option>
                    <option value="white">Pure White (#ffffff)</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground uppercase">
                  {activeSection} MEDIA VISUAL (IMAGE / VIDEO)
                </label>
                {isVideoUrl(currentSection.content?.image_url || currentSection.content?.video_url) && (
                  <span className="text-[10px] font-serif-sc text-heritage-orange border border-heritage-orange/40 px-2 py-0.5 rounded-sm bg-heritage-orange/10 font-bold">
                    ★ VIDEO ACTIVE
                  </span>
                )}
              </div>
              
              <div className="aspect-video w-full mb-3 relative rounded-sm overflow-hidden border border-gold/20 bg-black/10">
                {isVideoUrl(currentSection.content?.image_url || currentSection.content?.video_url) ? (
                  <div className="relative w-full h-full group">
                    <video 
                      src={currentSection.content?.video_url || currentSection.content?.image_url} 
                      autoPlay 
                      muted 
                      loop 
                      playsInline 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleUpdateContent(activeSection, { image_url: null, video_url: null })}
                        className="px-4 py-2 bg-red-600 text-white font-serif-sc text-xs tracking-widest rounded shadow"
                      >
                        REMOVE VIDEO
                      </button>
                    </div>
                  </div>
                ) : (
                  <SingleImageUploader 
                    bucket={activeNavItem?.bucket || "brand-assets"}
                    folder={`homepage-${activeSection}`}
                    value={currentSection.content?.image_url || null}
                    onChange={(url) => handleUpdateContent(activeSection, { image_url: url })}
                    label={`UPLOAD ${activeSection.toUpperCase()} VISUAL`}
                  />
                )}
              </div>

              {/* Compressed Video Upload Option for Story / Hero */}
              <div className="space-y-2">
                <label className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-heritage-orange/10 text-heritage-orange border border-heritage-orange/30 hover:bg-heritage-orange hover:text-white rounded-sm font-serif-sc text-[10px] tracking-widest cursor-pointer transition-colors font-bold">
                  <VideoIcon size={14} />
                  UPLOAD COMPRESSED VIDEO ({activeSection.toUpperCase()})
                  <input 
                    type="file" 
                    accept="video/mp4,video/webm,video/*" 
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) handleVideoUpload(e.target.files[0]);
                    }} 
                  />
                </label>

                <input 
                  type="text" 
                  value={currentSection.content?.video_url || currentSection.content?.image_url || ""} 
                  onChange={(e) => handleUpdateContent(activeSection, { video_url: e.target.value, image_url: e.target.value })}
                  placeholder="Or paste video / media URL directly..."
                  className="w-full bg-background border border-gold/20 px-3 py-2 text-xs font-serif text-foreground outline-none focus:border-gold"
                />
                <p className="text-[10px] font-serif italic text-muted-foreground">
                  ⚡ Automatic client-side compression caps bitrate and optimizes resolutions so playback consumes minimal bandwidth.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gold/10 flex justify-end">
          <button
            onClick={() => saveSection(activeSection)}
            disabled={saving}
            className="bg-gold text-royal-deep font-serif-sc tracking-[0.2em] text-xs px-8 py-3 flex items-center gap-2 hover:bg-gold-glow transition-all duration-300 disabled:opacity-70 font-bold"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {saving ? "SAVING..." : "SAVE SECTION"}
          </button>
        </div>
      </div>
    </div>
  );
}
