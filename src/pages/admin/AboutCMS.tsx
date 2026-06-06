import { useState } from "react";
import { Plus, Trash2, GripVertical, Image as ImageIcon, Save, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAboutContent, useAboutFeatures, useAboutGallery } from "@/lib/api";
import { compressImage } from "@/lib/imageCompression";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const ICONS = ["MapPin", "Heart", "Utensils", "BedDouble", "Coffee", "Wifi", "Star", "Camera", "Wind", "Sun", "Moon", "Compass", "Palmtree"];

export default function AboutCMS() {
  const { data: aboutContent, refetch: refetchContent } = useAboutContent();
  const { data: features, refetch: refetchFeatures } = useAboutFeatures();
  const { data: gallery, refetch: refetchGallery } = useAboutGallery();

  const [isProcessing, setIsProcessing] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [editingFeature, setEditingFeature] = useState<any>(null);

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

  const handleUpdateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("about_page_content")
        .update({
          title: editingContent.title,
          subtitle: editingContent.subtitle,
          description: editingContent.description,
          image_url: editingContent.image_url,
          updated_at: new Date().toISOString()
        })
        .eq("id", editingContent.id);

      if (error) throw error;
      toast.success("Section updated successfully");
      setEditingContent(null);
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

      {/* CONTENT SECTIONS */}
      <div className="space-y-6">
        <h2 className="font-display text-2xl text-royal-deep border-b border-gold/20 pb-2">Page Sections</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {aboutContent?.map((section: any) => (
            <div key={section.id} className="bg-white border border-gold/20 p-6 rounded shadow-sm relative group">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setEditingContent(section)}
                  className="px-3 py-1 bg-gold/10 text-gold text-xs font-serif-sc tracking-widest rounded hover:bg-gold hover:text-white transition-colors"
                >
                  EDIT
                </button>
              </div>
              <div className="text-xs font-serif-sc tracking-widest text-gold mb-2">{section.section_key.replace('_', ' ').toUpperCase()}</div>
              <h3 className="font-display text-2xl text-royal-deep">{section.title}</h3>
              {section.subtitle && <div className="italic font-serif text-muted-foreground mt-1">{section.subtitle}</div>}
              <div className="mt-4 aspect-video rounded overflow-hidden border border-gold/10 relative">
                <img src={section.image_url} alt="Section" className="w-full h-full object-cover" />
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
            <DialogTitle className="font-display text-2xl text-gold">Edit Section Content</DialogTitle>
          </DialogHeader>
          {editingContent && (
            <form onSubmit={handleUpdateContent} className="space-y-4 font-serif">
              <div>
                <label className="text-xs font-serif-sc tracking-widest text-muted-foreground mb-1 block">TITLE</label>
                <input required type="text" value={editingContent.title} onChange={e => setEditingContent({...editingContent, title: e.target.value})} className="w-full p-2 bg-background border border-gold/30" />
              </div>
              <div>
                <label className="text-xs font-serif-sc tracking-widest text-muted-foreground mb-1 block">SUBTITLE</label>
                <input type="text" value={editingContent.subtitle || ""} onChange={e => setEditingContent({...editingContent, subtitle: e.target.value})} className="w-full p-2 bg-background border border-gold/30" />
              </div>
              <div>
                <label className="text-xs font-serif-sc tracking-widest text-muted-foreground mb-1 block">IMAGE (Upload or enter URL)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) handleImageUpload(e.target.files[0], false);
                  }} 
                  className="w-full p-2 bg-background border border-gold/30 mb-2 text-xs" 
                />
                <input required type="url" value={editingContent.image_url} onChange={e => setEditingContent({...editingContent, image_url: e.target.value})} className="w-full p-2 bg-background border border-gold/30 text-xs text-muted-foreground" />
              </div>
              <div>
                <label className="text-xs font-serif-sc tracking-widest text-muted-foreground mb-1 block">DESCRIPTION</label>
                <textarea required rows={5} value={editingContent.description} onChange={e => setEditingContent({...editingContent, description: e.target.value})} className="w-full p-2 bg-background border border-gold/30" />
              </div>
              <DialogFooter>
                <button type="submit" disabled={isProcessing} className="px-6 py-2 bg-gold text-white font-serif-sc tracking-widest flex items-center gap-2">
                  <Save size={16} /> SAVE CHANGES
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
