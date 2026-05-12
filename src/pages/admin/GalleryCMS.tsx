import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, UploadCloud, Trash2, Save, Image as ImageIcon, Plus } from "lucide-react";
import { compressImage } from "@/lib/imageCompression";
import { ImageSelector } from "@/components/admin/ImageSelector";
import { useDropzone } from "react-dropzone";

type GalleryItem = {
  id: string;
  image_url: string;
  category: string;
  title: string;
  sort_order: number;
};

const CATEGORIES = ["Rooms", "Dining", "Experiences", "Heritage", "Jodhpur"];

export default function GalleryCMS() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("Heritage");
  const [title, setTitle] = useState("");
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const { data, error } = await supabase.from("gallery").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast.error("Failed to load gallery: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setUploading(true);
    const toastId = toast.loading(`Uploading ${acceptedFiles.length} file(s)...`);

    try {
      for (const file of acceptedFiles) {
        // Compress
        const optimized = await compressImage(file);
        const fileName = `${Date.now()}-${optimized.name}`;

        // Upload to gallery-images bucket
        const { error: uploadError } = await supabase.storage
          .from("gallery-images")
          .upload(fileName, optimized);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("gallery-images")
          .getPublicUrl(fileName);

        // Also save to media_assets for the Media Library
        await supabase.from("media_assets").insert({
          bucket_id: "gallery-images",
          storage_path: fileName,
          url: publicUrl,
          alt_text: title || file.name,
          category: category,
        });

        // Save to gallery table
        await supabase.from("gallery").insert([{
          image_url: publicUrl,
          category,
          title: title || file.name,
          sort_order: items.length
        }]);
      }
      
      toast.success("Upload complete", { id: toastId });
      setTitle("");
      fetchGallery();
    } catch (error: any) {
      toast.error("Upload failed: " + error.message, { id: toastId });
    } finally {
      setUploading(false);
    }
  }, [category, title, items.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'] }
  });

  const addFromLibrary = async (url: string) => {
    try {
      const { error } = await supabase.from("gallery").insert([{
        image_url: url,
        category,
        title: title || "Gallery Image",
        sort_order: items.length
      }]);
      if (error) throw error;
      toast.success("Image added to gallery.");
      setShowSelector(false);
      fetchGallery();
    } catch (e: any) {
      toast.error("Failed: " + e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this image from the gallery?")) return;
    try {
      const { error } = await supabase.from("gallery").delete().eq("id", id);
      if (error) throw error;
      toast.success("Image removed.");
      fetchGallery();
    } catch (error: any) {
      toast.error("Failed to delete: " + error.message);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-[50vh]"><Loader2 className="animate-spin text-gold w-10 h-10" /></div>;
  }

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      <div>
        <h1 className="font-display text-4xl text-foreground mb-2">Gallery Management</h1>
        <p className="font-serif text-muted-foreground">Upload and categorize high-resolution WebP images to your royal portfolio.</p>
      </div>

      {/* Uploader Section */}
      <div className="bg-card border border-gold/20 shadow-frame p-8">
        <h2 className="font-serif-sc text-sm tracking-widest text-gold mb-6 border-b border-gold/10 pb-4">ADD NEW ARTIFACT</h2>
        
        <div className="grid lg:grid-cols-2 gap-8">
          <div 
            {...getRootProps()}
            className={`border-2 border-dashed transition-all duration-300 h-64 flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden
              ${isDragActive ? 'border-gold bg-gold/10' : 'border-gold/30 bg-background/50 hover:bg-gold/5'}
              ${uploading ? 'pointer-events-none opacity-50' : ''}`}
          >
            <input {...getInputProps()} />
            <UploadCloud className="text-gold/50 w-12 h-12 mb-4" />
            <p className="font-display text-xl text-foreground mb-1">
              {isDragActive ? "Drop images here..." : "Drag & Drop to Upload"}
            </p>
            <p className="font-serif text-muted-foreground text-sm">Images are automatically compressed to WebP</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">CAPTION / TITLE</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif text-foreground transition-all duration-300" placeholder="e.g. Sunset from the Jharokha" />
            </div>
            
            <div>
              <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">CATEGORY</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`font-serif-sc text-[10px] tracking-widest py-2 px-3 border transition-all duration-300 ${category === cat ? "bg-gold/10 text-gold border-gold/40" : "bg-transparent text-muted-foreground border-gold/10 hover:border-gold/30"}`}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowSelector(true)}
              className="w-full border border-gold/30 text-gold font-serif-sc tracking-[0.2em] text-xs px-6 py-3 flex items-center justify-center gap-2 hover:bg-gold/10 transition-all"
            >
              <Plus size={14} /> ADD FROM MEDIA LIBRARY
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="bg-card border border-gold/20 shadow-frame p-8">
        <h2 className="font-serif-sc text-sm tracking-widest text-gold mb-6 border-b border-gold/10 pb-4 flex items-center gap-2">
          <ImageIcon size={18} /> CURRENT EXHIBITION ({items.length} IMAGES)
        </h2>
        
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-serif text-muted-foreground">The gallery is currently empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item) => (
              <div key={item.id} className="group relative aspect-square overflow-hidden border border-gold/10 jharokha-frame">
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-royal-deep/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center backdrop-blur-sm">
                  <div className="font-serif-sc text-[9px] tracking-widest text-gold mb-1">{item.category.toUpperCase()}</div>
                  <h3 className="font-display text-sm text-foreground mb-4 leading-tight">{item.title}</h3>
                  <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-900/40 text-red-400 rounded-full hover:bg-red-900/80 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showSelector && (
        <ImageSelector
          bucketId="gallery-images"
          onClose={() => setShowSelector(false)}
          onSelect={addFromLibrary}
        />
      )}
    </div>
  );
}
