import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, UploadCloud, Trash2, Image as ImageIcon, Search, Filter, Edit2, Check, X } from "lucide-react";
import { useDropzone } from "react-dropzone";

const BUCKETS = [
  { id: 'hero-assets', label: 'Hero Assets' },
  { id: 'room-categories', label: 'Room Categories' },
  { id: 'physical-room-images', label: 'Physical Room Images' },
  { id: 'dining-images', label: 'Dining Images' },
  { id: 'experience-images', label: 'Experience Images' },
  { id: 'travel-stories', label: 'Travel Stories' },
  { id: 'gallery-images', label: 'Gallery Images' },
  { id: 'testimonial-assets', label: 'Testimonial Assets' },
  { id: 'offers-banners', label: 'Offers & Banners' },
  { id: 'dining-menu-assets', label: 'Dining Menu Assets' },
  { id: 'brand-assets', label: 'Brand Assets' },
];

type MediaAsset = {
  id: string;
  bucket_id: string;
  storage_path: string;
  url: string;
  alt_text: string | null;
  caption: string | null;
  category: string | null;
  created_at: string;
};

export default function MediaCMS() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState(BUCKETS[0].id);
  const [editingAsset, setEditingAsset] = useState<MediaAsset | null>(null);

  useEffect(() => {
    fetchAssets();
  }, [selectedBucket]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("media_assets")
        .select("*")
        .eq("bucket_id", selectedBucket)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      setAssets(data || []);
    } catch (e: any) {
      toast.error("Failed to load media: " + e.message);
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
        // Convert filename to safe format
        const fileExt = file.name.split('.').pop();
        const safeName = file.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        const fileName = `${Date.now()}-${safeName}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from(selectedBucket)
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(selectedBucket)
          .getPublicUrl(filePath);

        // Save to database
        const { error: dbError } = await supabase
          .from("media_assets")
          .insert({
            bucket_id: selectedBucket,
            storage_path: filePath,
            url: publicUrl,
            alt_text: file.name,
          });

        if (dbError) throw dbError;
      }
      
      toast.success("Upload complete", { id: toastId });
      fetchAssets();
    } catch (e: any) {
      toast.error("Upload failed: " + e.message, { id: toastId });
    } finally {
      setUploading(false);
    }
  }, [selectedBucket]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.svg', '.gif']
    }
  });

  const handleDelete = async (asset: MediaAsset) => {
    if (!window.confirm("Permanently delete this image?")) return;
    
    try {
      // 1. Delete from storage
      const { error: storageError } = await supabase.storage
        .from(asset.bucket_id)
        .remove([asset.storage_path]);
        
      if (storageError) throw storageError;

      // 2. Delete from DB
      const { error: dbError } = await supabase
        .from("media_assets")
        .delete()
        .eq("id", asset.id);

      if (dbError) throw dbError;
      
      toast.success("Image deleted");
      setAssets(assets.filter(a => a.id !== asset.id));
    } catch (e: any) {
      toast.error("Delete failed: " + e.message);
    }
  };

  const handleUpdateMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;
    
    try {
      const { error } = await supabase
        .from("media_assets")
        .update({
          alt_text: editingAsset.alt_text,
          caption: editingAsset.caption,
          category: editingAsset.category
        })
        .eq("id", editingAsset.id);
        
      if (error) throw error;
      
      toast.success("Metadata updated");
      setEditingAsset(null);
      fetchAssets();
    } catch (e: any) {
      toast.error("Update failed: " + e.message);
    }
  };

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl text-foreground mb-2">Media Library</h1>
          <p className="font-serif text-muted-foreground">
            Manage all imagery across the Raj Mandir website.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold" />
            <select
              value={selectedBucket}
              onChange={(e) => setSelectedBucket(e.target.value)}
              className="bg-card border border-gold/20 pl-10 pr-10 py-3 font-serif-sc tracking-widest text-xs text-foreground focus:border-gold outline-none appearance-none cursor-pointer"
            >
              {BUCKETS.map(b => (
                <option key={b.id} value={b.id}>{b.label.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Uploader */}
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed transition-all duration-300 p-12 text-center cursor-pointer jharokha-frame bg-card/30
          ${isDragActive ? 'border-gold bg-gold/5' : 'border-gold/20 hover:border-gold/50'}
          ${uploading ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="w-12 h-12 text-gold mx-auto mb-4" />
        <h3 className="font-display text-2xl text-foreground mb-2">
          {isDragActive ? "Drop royal assets here..." : "Upload to " + BUCKETS.find(b => b.id === selectedBucket)?.label}
        </h3>
        <p className="font-serif text-muted-foreground text-sm max-w-md mx-auto">
          Drag & drop high-resolution images here, or click to browse. Images will be optimized and saved to the selected bucket.
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-gold w-10 h-10" />
        </div>
      ) : assets.length === 0 ? (
        <div className="text-center py-20 border border-gold/10 bg-card/20">
          <ImageIcon className="w-16 h-16 text-gold/20 mx-auto mb-4" />
          <h3 className="font-display text-xl text-foreground">No media found</h3>
          <p className="font-serif text-muted-foreground mt-2">Upload images to populate this bucket.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {assets.map(asset => (
            <div key={asset.id} className="group relative bg-card border border-gold/20 overflow-hidden hover:border-gold/50 transition-colors">
              <div className="aspect-square relative overflow-hidden bg-black/20">
                <img 
                  src={asset.url} 
                  alt={asset.alt_text || "Media asset"} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-royal-deep/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                  <button 
                    onClick={() => setEditingAsset(asset)}
                    className="w-10 h-10 rounded-full bg-gold/20 border border-gold text-gold flex items-center justify-center hover:bg-gold hover:text-royal-deep transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(asset)}
                    className="w-10 h-10 rounded-full bg-red-900/40 border border-red-500/50 text-red-300 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="p-3">
                <p className="font-serif text-sm text-foreground truncate">{asset.alt_text || "Untitled"}</p>
                <p className="font-serif-sc text-[9px] tracking-widest text-gold mt-1 truncate">
                  {new Date(asset.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-royal-deep/90 backdrop-blur-sm">
          <div className="bg-card border border-gold p-8 max-w-lg w-full shadow-gold relative">
            <button 
              onClick={() => setEditingAsset(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-gold"
            >
              <X size={20} />
            </button>
            
            <h2 className="font-display text-2xl mb-6 text-foreground">Edit Metadata</h2>
            
            <form onSubmit={handleUpdateMeta} className="space-y-4">
              <div>
                <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">ALT TEXT</label>
                <input 
                  type="text" 
                  value={editingAsset.alt_text || ""} 
                  onChange={e => setEditingAsset({...editingAsset, alt_text: e.target.value})}
                  className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif"
                />
              </div>
              <div>
                <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">CAPTION</label>
                <textarea 
                  value={editingAsset.caption || ""} 
                  onChange={e => setEditingAsset({...editingAsset, caption: e.target.value})}
                  className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif resize-none h-24"
                />
              </div>
              <div>
                <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">CATEGORY / TAG</label>
                <input 
                  type="text" 
                  value={editingAsset.category || ""} 
                  onChange={e => setEditingAsset({...editingAsset, category: e.target.value})}
                  className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif"
                />
              </div>
              
              <div className="pt-4 flex justify-end">
                <button type="submit" className="bg-gold text-royal-deep px-6 py-3 font-serif-sc tracking-widest text-xs flex items-center gap-2">
                  <Check size={16} /> SAVE CHANGES
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
