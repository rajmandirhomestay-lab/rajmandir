import { useState, useEffect } from "react";
import { Plus, Trash2, GripVertical, Image as ImageIcon, Save, CheckCircle2, Video as VideoIcon, BarChart3, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useAboutContent, useAboutFeatures, useAboutGallery } from "@/lib/api";
import { compressImage } from "@/lib/imageCompression";
import { compressVideo, isVideoUrl } from "@/lib/videoCompression";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const ICONS = ["MapPin", "Heart", "Utensils", "BedDouble", "Coffee", "Wifi", "Star", "Camera", "Wind", "Sun", "Moon", "Compass", "Palmtree"];

export default function AboutCMS() {
  const queryClient = useQueryClient();
  const { data: aboutContent, refetch: refetchContent } = useAboutContent();
  const { data: features, refetch: refetchFeatures } = useAboutFeatures();
  const { data: gallery, refetch: refetchGallery } = useAboutGallery();

  const [isProcessing, setIsProcessing] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [editingFeature, setEditingFeature] = useState<any>(null);

  const [stats, setStats] = useState({
    stat1_num: "130+",
    stat1_label: "YEARS OF LEGACY",
    stat2_num: "12",
    stat2_label: "ROYAL CHAMBERS",
    stat3_num: "4.9",
    stat3_label: "GUEST RATING",
  });
  const [isSavingStats, setIsSavingStats] = useState(false);

  useEffect(() => {
    supabase
      .from("homepage_sections")
      .select("*")
      .or("section_key.eq.story,section_key.eq.about")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.content) {
          setStats({
            stat1_num: data.content.stat1_num ?? "130+",
            stat1_label: data.content.stat1_label ?? "YEARS OF LEGACY",
            stat2_num: data.content.stat2_num ?? "12",
            stat2_label: data.content.stat2_label ?? "ROYAL CHAMBERS",
            stat3_num: data.content.stat3_num ?? "4.9",
            stat3_label: data.content.stat3_label ?? "GUEST RATING",
          });
        }
      });
  }, []);

  const handleSaveStats = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingStats(true);
    try {
      const { data: existing } = await supabase
        .from("homepage_sections")
        .select("*")
        .or("section_key.eq.story,section_key.eq.about")
        .maybeSingle();

      const existingContent = existing?.content || {};
      const { error } = await supabase
        .from("homepage_sections")
        .upsert({
          section_key: existing?.section_key || "story",
          content: {
            ...existingContent,
            stat1_num: stats.stat1_num,
            stat1_label: stats.stat1_label,
            stat2_num: stats.stat2_num,
            stat2_label: stats.stat2_label,
            stat3_num: stats.stat3_num,
            stat3_label: stats.stat3_label,
          },
          updated_at: new Date().toISOString()
        }, { onConflict: 'section_key' });

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["homepage_sections"] });
      toast.success("Homepage About Us stats updated successfully!");
    } catch (err: any) {
      toast.error("Failed to update stats: " + err.message);
    } finally {
      setIsSavingStats(false);
    }
  };

  const handleImageUpload = async (file: File, isGallery: boolean) => {
    try {
      setIsProcessing(true);
      const toastId = toast.loading("Compressing and uploading image...");
      
      const optimized = await compressImage(file);
      const fileName = `${Date.now()}-${optimized.name}`;

      const { error: uploadError } = await supabase.storage
        .from("gallery-images")
        .upload(fileName, optimized);
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("gallery-images")
        .getPublicUrl(fileName);

      if (isGallery) {
        const { error } = await supabase.from("about_page_gallery").insert([{ image_url: publicUrl, sort_order: (gallery?.length || 0) + 1 }]);
        if (error) throw error;
        toast.success("Image added to gallery", { id: toastId });
        refetchGallery();
      } else {
        setEditingContent({...editingContent, image_url: publicUrl});
        toast.success("Image uploaded. Remember to Save Changes!", { id: toastId });
      }
    } catch (err: any) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVideoUpload = async (file: File) => {
    let toastId = "";
    try {
      setIsProcessing(true);
      const origMb = (file.size / (1024 * 1024)).toFixed(1);
      toastId = toast.loading(`Compressing video (${origMb}MB)... saving bandwidth.`);

      let fileToUpload: File = file;
      try {
        fileToUpload = await compressVideo(file, {
          maxWidth: 1280,
          maxHeight: 720,
          targetBitrate: 1800000,
          onProgress: (p) => {
            if (toastId) toast.loading(`Compressing video: ${p}%`, { id: toastId });
          }
        });
      } catch (cErr) {
        console.warn("Video compression error, falling back to original file:", cErr);
        fileToUpload = file;
      }

      const compMb = (fileToUpload.size / (1024 * 1024)).toFixed(1);
      toast.loading(`Uploading video (${compMb}MB)...`, { id: toastId });

      const fileExt = fileToUpload.name.split('.').pop() || "webm";
      const fileName = `about-video-${Date.now()}.${fileExt}`;
      const filePath = `hero/${fileName}`;
      const cleanContentType = (fileToUpload.type || 'video/webm').split(';')[0].trim();

      let finalUrl = "";
      // Upload to hero-assets (which allows video MIME types)
      const { error: heroErr } = await supabase.storage
        .from("hero-assets")
        .upload(filePath, fileToUpload, { upsert: true, contentType: cleanContentType });

      if (!heroErr) {
        finalUrl = supabase.storage.from("hero-assets").getPublicUrl(filePath).data.publicUrl;
      } else {
        console.warn("hero-assets upload failed, trying brand-assets fallback:", heroErr);
        const { error: brandErr } = await supabase.storage
          .from("brand-assets")
          .upload(filePath, fileToUpload, { upsert: true, contentType: cleanContentType });

        if (!brandErr) {
          finalUrl = supabase.storage.from("brand-assets").getPublicUrl(filePath).data.publicUrl;
        } else {
          console.warn("brand-assets upload failed, trying gallery-images fallback:", brandErr);
          const { error: galleryErr } = await supabase.storage
            .from("gallery-images")
            .upload(fileName, fileToUpload, { upsert: true, contentType: cleanContentType });

          if (galleryErr) {
            throw new Error(heroErr.message || brandErr.message || galleryErr.message);
          }
          finalUrl = supabase.storage.from("gallery-images").getPublicUrl(fileName).data.publicUrl;
        }
      }

      setEditingContent({ ...editingContent, image_url: finalUrl });
      toast.success(`Video attached (${origMb}MB → ${compMb}MB) and ready! Save changes to apply.`, { id: toastId });
    } catch (err: any) {
      console.error("Video upload failed:", err);
      toast.error("Video upload failed: " + (err.message || "Unknown error"), { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      if (editingContent.id) {
        const { error } = await supabase
          .from("about_page_content")
          .update({
            title: editingContent.title,
            subtitle: editingContent.subtitle || "",
            description: editingContent.description || "",
            image_url: editingContent.image_url || "",
            updated_at: new Date().toISOString()
          })
          .eq("id", editingContent.id);

        if (error) throw error;
        toast.success("Section updated successfully");
      } else {
        const sectionKey = editingContent.section_key || `section_${Date.now()}`;
        const { error } = await supabase
          .from("about_page_content")
          .insert([{
            section_key: sectionKey,
            title: editingContent.title,
            subtitle: editingContent.subtitle || "",
            description: editingContent.description || "",
            image_url: editingContent.image_url || "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) throw error;
        toast.success("New section created successfully");
      }
      setEditingContent(null);
      refetchContent();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this section?")) return;
    try {
      setIsProcessing(true);
      const { error } = await supabase.from("about_page_content").delete().eq("id", id);
      if (error) throw error;
      toast.success("Section deleted successfully");
      refetchContent();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      if (editingFeature.id) {
        const { error } = await supabase
          .from("about_page_features")
          .update({
            title: editingFeature.title,
            description: editingFeature.description,
            icon: editingFeature.icon,
            sort_order: editingFeature.sort_order
          })
          .eq("id", editingFeature.id);
        if (error) throw error;
        toast.success("Feature updated");
      } else {
        const { error } = await supabase
          .from("about_page_features")
          .insert([{
            title: editingFeature.title,
            description: editingFeature.description,
            icon: editingFeature.icon,
            sort_order: (features?.length || 0) + 1
          }]);
        if (error) throw error;
        toast.success("Feature created");
      }
      setEditingFeature(null);
      refetchFeatures();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteFeature = async (id: string) => {
    if (!window.confirm("Delete this feature?")) return;
    try {
      const { error } = await supabase.from("about_page_features").delete().eq("id", id);
      if (error) throw error;
      toast.success("Feature deleted");
      refetchFeatures();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAddGalleryImage = async () => {
    // Replaced by direct file input onChange handler below
  };

  const handleDeleteGalleryImage = async (id: string) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      const { error } = await supabase.from("about_page_gallery").delete().eq("id", id);
      if (error) throw error;
      toast.success("Image deleted");
      refetchGallery();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      <div>
        <h1 className="font-display text-4xl text-royal-deep">About Page CMS</h1>
        <p className="font-serif text-muted-foreground mt-2">Manage the boutique about page content, features, and gallery.</p>
      </div>

      {/* HOMEPAGE ABOUT US STATS (ROOMS, RATING, YEARS) */}
      <div className="bg-white border border-gold/30 p-6 rounded shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-gold/40 flex items-center justify-center bg-gold/10 text-gold rounded">
              <BarChart3 size={20} />
            </div>
            <div>
              <h2 className="font-display text-2xl text-royal-deep">Homepage "About Us" Stats Counters</h2>
              <p className="font-serif text-xs text-muted-foreground mt-0.5">
                Update the numbers and labels displayed on the homepage About Us section (Years, Chambers/Rooms, Rating).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleSaveStats()}
            disabled={isSavingStats}
            className="flex items-center gap-2 px-6 py-2.5 bg-gold text-royal-deep font-serif-sc text-xs tracking-widest rounded hover:bg-gold-glow transition-colors uppercase font-bold shadow-sm disabled:opacity-60"
          >
            {isSavingStats ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {isSavingStats ? "SAVING..." : "SAVE HOMEPAGE STATS"}
          </button>
        </div>

        <form onSubmit={handleSaveStats} className="grid sm:grid-cols-3 gap-6">
          <div className="p-4 bg-[#faf6f0] border border-gold/20 rounded space-y-2">
            <span className="text-[10px] font-serif-sc tracking-widest text-gold font-bold uppercase block">
              STAT 1 — LEGACY YEARS
            </span>
            <label className="text-xs font-serif text-muted-foreground block">Number Value</label>
            <input
              type="text"
              value={stats.stat1_num}
              onChange={(e) => setStats({ ...stats, stat1_num: e.target.value })}
              placeholder="130+"
              className="w-full bg-white border border-gold/20 px-3 py-2 text-xl font-display font-bold text-royal-deep rounded outline-none focus:border-gold"
            />
            <label className="text-xs font-serif text-muted-foreground block pt-1">Stat Label</label>
            <input
              type="text"
              value={stats.stat1_label}
              onChange={(e) => setStats({ ...stats, stat1_label: e.target.value })}
              placeholder="YEARS OF LEGACY"
              className="w-full bg-white border border-gold/20 px-3 py-1.5 text-xs font-serif-sc tracking-wider text-foreground rounded outline-none focus:border-gold uppercase font-bold"
            />
          </div>

          <div className="p-4 bg-[#faf6f0] border border-gold/20 rounded space-y-2">
            <span className="text-[10px] font-serif-sc tracking-widest text-gold font-bold uppercase block">
              STAT 2 — ROOMS / CHAMBERS
            </span>
            <label className="text-xs font-serif text-muted-foreground block">Number Value</label>
            <input
              type="text"
              value={stats.stat2_num}
              onChange={(e) => setStats({ ...stats, stat2_num: e.target.value })}
              placeholder="12"
              className="w-full bg-white border border-gold/20 px-3 py-2 text-xl font-display font-bold text-royal-deep rounded outline-none focus:border-gold"
            />
            <label className="text-xs font-serif text-muted-foreground block pt-1">Stat Label</label>
            <input
              type="text"
              value={stats.stat2_label}
              onChange={(e) => setStats({ ...stats, stat2_label: e.target.value })}
              placeholder="ROYAL CHAMBERS"
              className="w-full bg-white border border-gold/20 px-3 py-1.5 text-xs font-serif-sc tracking-wider text-foreground rounded outline-none focus:border-gold uppercase font-bold"
            />
          </div>

          <div className="p-4 bg-[#faf6f0] border border-gold/20 rounded space-y-2">
            <span className="text-[10px] font-serif-sc tracking-widest text-gold font-bold uppercase block">
              STAT 3 — RATING / CUSTOMERS
            </span>
            <label className="text-xs font-serif text-muted-foreground block">Number Value</label>
            <input
              type="text"
              value={stats.stat3_num}
              onChange={(e) => setStats({ ...stats, stat3_num: e.target.value })}
              placeholder="4.9"
              className="w-full bg-white border border-gold/20 px-3 py-2 text-xl font-display font-bold text-royal-deep rounded outline-none focus:border-gold"
            />
            <label className="text-xs font-serif text-muted-foreground block pt-1">Stat Label</label>
            <input
              type="text"
              value={stats.stat3_label}
              onChange={(e) => setStats({ ...stats, stat3_label: e.target.value })}
              placeholder="GUEST RATING"
              className="w-full bg-white border border-gold/20 px-3 py-1.5 text-xs font-serif-sc tracking-wider text-foreground rounded outline-none focus:border-gold uppercase font-bold"
            />
          </div>
        </form>
      </div>

      {/* CONTENT SECTIONS */}
      <div className="space-y-6">
        <div className="flex justify-between items-end border-b border-gold/20 pb-2">
          <div>
            <h2 className="font-display text-2xl text-royal-deep">Page Sections</h2>
            <p className="font-serif text-xs text-muted-foreground mt-1">Add or edit storytelling sections with compressed images or videos.</p>
          </div>
          <button 
            onClick={() => setEditingContent({ title: "", subtitle: "", description: "", image_url: "", section_key: `section_${Date.now()}` })}
            className="flex items-center gap-2 px-4 py-2 bg-gold text-white font-serif-sc text-xs tracking-widest rounded hover:bg-gold/90 transition-colors uppercase font-bold shadow-sm"
          >
            <Plus size={16} /> ADD SECTION
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {aboutContent?.map((section: any) => (
            <div key={section.id} className="bg-white border border-gold/20 p-6 rounded shadow-sm relative group">
              <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button 
                  onClick={() => setEditingContent(section)}
                  className="px-3 py-1 bg-gold/10 text-gold text-xs font-serif-sc tracking-widest rounded hover:bg-gold hover:text-white transition-colors uppercase font-bold"
                >
                  EDIT
                </button>
                {section.section_key !== 'about_raj_mandir' && section.section_key !== 'the_experience' && (
                  <button 
                    onClick={() => handleDeleteSection(section.id)}
                    className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-600 hover:text-white transition-colors"
                    title="Delete section"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="text-xs font-serif-sc tracking-widest text-gold mb-2">{section.section_key.replace('_', ' ').toUpperCase()}</div>
              <h3 className="font-display text-2xl text-royal-deep">{section.title}</h3>
              {section.subtitle && <div className="italic font-serif text-muted-foreground mt-1">{section.subtitle}</div>}
              <div className="mt-4 aspect-video rounded overflow-hidden border border-gold/10 relative bg-black/10">
                {isVideoUrl(section.image_url) ? (
                  <video src={section.image_url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                ) : (
                  <img src={section.image_url} alt="Section" className="w-full h-full object-cover" />
                )}
              </div>
              <p className="mt-4 font-serif text-sm text-foreground/80 line-clamp-3">{section.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div className="space-y-6">
        <div className="flex justify-between items-end border-b border-gold/20 pb-2">
          <h2 className="font-display text-2xl text-royal-deep">Why Choose Us Cards</h2>
          <button 
            onClick={() => setEditingFeature({})}
            className="flex items-center gap-2 px-4 py-2 bg-gold text-white font-serif-sc text-xs tracking-widest rounded hover:bg-gold/90 transition-colors"
          >
            <Plus size={16} /> ADD CARD
          </button>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {features?.map((feature: any) => (
            <div key={feature.id} className="bg-white border border-gold/20 p-4 rounded shadow-sm flex flex-col items-center text-center relative group">
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditingFeature(feature)} className="text-gold hover:text-gold/70"><CheckCircle2 size={16} /></button>
                <button onClick={() => handleDeleteFeature(feature.id)} className="text-red-500 hover:text-red-400"><Trash2 size={16} /></button>
              </div>
              <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center mb-4">
                <span className="text-xs font-mono">{feature.icon}</span>
              </div>
              <h4 className="font-display text-lg text-royal-deep">{feature.title}</h4>
              <p className="font-serif text-xs text-muted-foreground mt-2 line-clamp-2">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* GALLERY */}
      <div className="space-y-6">
        <div className="flex justify-between items-end border-b border-gold/20 pb-2">
          <h2 className="font-display text-2xl text-royal-deep">Bottom Gallery Strip</h2>
          <label className="flex items-center gap-2 px-4 py-2 bg-gold text-white font-serif-sc text-xs tracking-widest rounded hover:bg-gold/90 transition-colors cursor-pointer">
            <ImageIcon size={16} /> ADD IMAGE
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) handleImageUpload(e.target.files[0], true);
              }} 
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-4">
          {gallery?.map((img: any) => (
            <div key={img.id} className="relative w-40 aspect-square rounded overflow-hidden border border-gold/20 group">
              <img src={img.image_url} alt="Gallery" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <button onClick={() => handleDeleteGalleryImage(img.id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DIALOGS */}
      <Dialog open={!!editingContent} onOpenChange={(o) => !o && setEditingContent(null)}>
        <DialogContent className="max-w-2xl bg-card border-gold/30">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-gold">
              {editingContent?.id ? "Edit Section Content" : "Add New Page Section"}
            </DialogTitle>
          </DialogHeader>
          {editingContent && (
            <form onSubmit={handleSaveSection} className="space-y-4 font-serif">
              <div>
                <label className="text-xs font-serif-sc tracking-widest text-muted-foreground mb-1 block">TITLE</label>
                <input required type="text" value={editingContent.title || ""} onChange={e => setEditingContent({...editingContent, title: e.target.value})} className="w-full p-2 bg-background border border-gold/30" />
              </div>
              <div>
                <label className="text-xs font-serif-sc tracking-widest text-muted-foreground mb-1 block">SUBTITLE</label>
                <input type="text" value={editingContent.subtitle || ""} onChange={e => setEditingContent({...editingContent, subtitle: e.target.value})} className="w-full p-2 bg-background border border-gold/30" />
              </div>
              <div>
                <label className="text-xs font-serif-sc tracking-widest text-muted-foreground mb-1 block">
                  MEDIA ASSET (Image or Video)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 text-gold border border-gold/30 hover:bg-gold hover:text-white rounded text-xs font-serif-sc tracking-wider cursor-pointer transition-colors uppercase font-bold">
                    <ImageIcon size={14} /> UPLOAD IMAGE (COMPRESSED)
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) handleImageUpload(e.target.files[0], false);
                      }} 
                    />
                  </label>

                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-heritage-orange/10 text-heritage-orange border border-heritage-orange/30 hover:bg-heritage-orange hover:text-white rounded text-xs font-serif-sc tracking-wider cursor-pointer transition-colors uppercase font-bold">
                    <VideoIcon size={14} /> UPLOAD VIDEO (COMPRESSED)
                    <input 
                      type="file" 
                      accept="video/mp4,video/webm,video/*" 
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) handleVideoUpload(e.target.files[0]);
                      }} 
                    />
                  </label>
                </div>

                <input 
                  type="text" 
                  value={editingContent.image_url || ""} 
                  onChange={e => setEditingContent({...editingContent, image_url: e.target.value})} 
                  placeholder="Or paste media URL (.webp, .jpg, .mp4, .webm, YouTube)..."
                  className="w-full p-2 bg-background border border-gold/30 text-xs text-foreground" 
                />
                <p className="text-[10px] font-serif italic text-muted-foreground mt-1">
                  ⚡ Client-side video and image compression saves bandwidth and ensures instant playback.
                </p>

                {editingContent.image_url && (
                  <div className="mt-3 aspect-video rounded overflow-hidden border border-gold/30 relative max-h-48 bg-black/20">
                    {isVideoUrl(editingContent.image_url) ? (
                      <video src={editingContent.image_url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                    ) : (
                      <img src={editingContent.image_url} alt="Media Preview" className="w-full h-full object-cover" />
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-serif-sc tracking-widest text-muted-foreground mb-1 block">DESCRIPTION</label>
                <textarea required rows={5} value={editingContent.description || ""} onChange={e => setEditingContent({...editingContent, description: e.target.value})} className="w-full p-2 bg-background border border-gold/30" />
              </div>
              <DialogFooter>
                <button type="submit" disabled={isProcessing} className="px-6 py-2 bg-gold text-white font-serif-sc tracking-widest flex items-center gap-2 uppercase font-bold">
                  <Save size={16} /> {editingContent?.id ? "SAVE CHANGES" : "ADD SECTION"}
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingFeature} onOpenChange={(o) => !o && setEditingFeature(null)}>
        <DialogContent className="max-w-lg bg-card border-gold/30">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-gold">{editingFeature?.id ? 'Edit Feature' : 'Add Feature'}</DialogTitle>
          </DialogHeader>
          {editingFeature && (
            <form onSubmit={handleSaveFeature} className="space-y-4 font-serif">
              <div>
                <label className="text-xs font-serif-sc tracking-widest text-muted-foreground mb-1 block">TITLE</label>
                <input required type="text" value={editingFeature.title || ""} onChange={e => setEditingFeature({...editingFeature, title: e.target.value})} className="w-full p-2 bg-background border border-gold/30" />
              </div>
              <div>
                <label className="text-xs font-serif-sc tracking-widest text-muted-foreground mb-1 block">DESCRIPTION</label>
                <textarea required rows={3} value={editingFeature.description || ""} onChange={e => setEditingFeature({...editingFeature, description: e.target.value})} className="w-full p-2 bg-background border border-gold/30" />
              </div>
              <div>
                <label className="text-xs font-serif-sc tracking-widest text-muted-foreground mb-1 block">ICON NAME (Lucide)</label>
                <select required value={editingFeature.icon || "MapPin"} onChange={e => setEditingFeature({...editingFeature, icon: e.target.value})} className="w-full p-2 bg-background border border-gold/30">
                  {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <DialogFooter>
                <button type="submit" disabled={isProcessing} className="px-6 py-2 bg-gold text-white font-serif-sc tracking-widest flex items-center gap-2">
                  <Save size={16} /> SAVE FEATURE
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
