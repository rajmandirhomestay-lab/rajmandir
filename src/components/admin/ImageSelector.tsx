import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { compressImage } from "@/lib/imageCompression";
import { Loader2, Image as ImageIcon, X, Check, Search, UploadCloud, Plus } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

type MediaAsset = {
  id: string;
  url: string;
  alt_text: string | null;
  bucket_id: string;
};

interface ImageSelectorProps {
  bucketId: string;
  selectedUrl?: string;
  onSelect: (url: string) => void;
  onClose: () => void;
}

export const ImageSelector = ({ bucketId, selectedUrl, onSelect, onClose }: ImageSelectorProps) => {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"browse" | "upload">("browse");

  useEffect(() => {
    fetchAssets();
  }, [bucketId]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("media_assets")
        .select("*")
        .eq("bucket_id", bucketId)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      setAssets(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setUploading(true);

    try {
      for (const file of acceptedFiles) {
        // Compress the image to WebP
        const compressed = await compressImage(file);
        const fileName = `${Date.now()}-${compressed.name}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(bucketId)
          .upload(fileName, compressed);

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucketId)
          .getPublicUrl(fileName);

        // Register in media_assets table
        const { error: dbError } = await supabase.from("media_assets").insert({
          bucket_id: bucketId,
          storage_path: fileName,
          url: publicUrl,
          alt_text: file.name.replace(/\.[^/.]+$/, ""),
          category: bucketId,
        });

        if (dbError) throw dbError;
      }

      toast.success(`${acceptedFiles.length} image${acceptedFiles.length > 1 ? 's' : ''} uploaded & compressed`);
      await fetchAssets();
      setTab("browse");
    } catch (e: any) {
      toast.error("Upload failed: " + e.message);
    } finally {
      setUploading(false);
    }
  }, [bucketId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif"] },
    multiple: true,
    disabled: uploading,
  });

  const filtered = assets.filter(a => 
    (a.alt_text || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-royal-deep/90 backdrop-blur-md animate-fade-in">
      <div className="bg-card border border-gold w-full max-w-4xl h-[80vh] flex flex-col shadow-gold">
        {/* Header */}
        <div className="p-6 border-b border-gold/20 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-foreground">Select Royal Asset</h2>
            <p className="font-serif text-xs text-muted-foreground mt-1">Bucket: {bucketId}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-gold transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gold/10">
          <button
            onClick={() => setTab("browse")}
            className={`flex items-center gap-2 px-6 py-3 font-serif-sc text-[10px] tracking-widest transition-all relative ${
              tab === "browse" ? "text-gold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ImageIcon size={14} />
            BROWSE LIBRARY
            {tab === "browse" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
            )}
          </button>
          <button
            onClick={() => setTab("upload")}
            className={`flex items-center gap-2 px-6 py-3 font-serif-sc text-[10px] tracking-widest transition-all relative ${
              tab === "upload" ? "text-gold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UploadCloud size={14} />
            UPLOAD NEW
            {tab === "upload" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
            )}
          </button>
        </div>

        {/* Content */}
        {tab === "browse" ? (
          <>
            {/* Search */}
            <div className="p-4 border-b border-gold/10">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/50" />
                <input 
                  type="text" 
                  placeholder="Search assets..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-background border border-gold/20 focus:border-gold outline-none pl-10 pr-4 py-2 font-serif text-sm"
                />
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="animate-spin text-gold w-8 h-8" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                  <ImageIcon size={48} className="mb-4" />
                  <p className="font-serif mb-4">No assets found in this bucket</p>
                  <button
                    onClick={() => setTab("upload")}
                    className="flex items-center gap-2 px-6 py-3 border border-gold/40 text-gold hover:bg-gold/10 font-serif-sc text-[10px] tracking-widest transition-all"
                  >
                    <Plus size={14} /> UPLOAD YOUR FIRST IMAGE
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filtered.map(asset => (
                    <button
                      key={asset.id}
                      onClick={() => onSelect(asset.url)}
                      className={`group relative aspect-square border-2 transition-all duration-300 overflow-hidden
                        ${selectedUrl === asset.url ? 'border-gold shadow-gold' : 'border-transparent hover:border-gold/50'}`}
                    >
                      <img 
                        src={asset.url} 
                        alt={asset.alt_text || ""} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {selectedUrl === asset.url && (
                        <div className="absolute inset-0 bg-gold/20 flex items-center justify-center">
                          <div className="bg-gold text-royal-deep p-1 rounded-full">
                            <Check size={16} />
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-white truncate font-serif">{asset.alt_text || 'Untitled'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Upload Tab */
          <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <div
              {...getRootProps()}
              className={`w-full max-w-lg border-2 border-dashed rounded-sm p-12 text-center cursor-pointer transition-all duration-500
                ${isDragActive ? 'border-gold bg-gold/10 scale-[1.02]' : 'border-gold/30 hover:border-gold/60 hover:bg-gold/5'}
                ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <input {...getInputProps()} />
              {uploading ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="animate-spin text-gold w-12 h-12" />
                  <p className="font-serif text-gold">Compressing & uploading...</p>
                  <p className="font-serif text-xs text-muted-foreground italic">Converting to optimized WebP format</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 border-2 border-gold/40 rounded-full flex items-center justify-center">
                    <UploadCloud size={32} className="text-gold" />
                  </div>
                  <div>
                    <p className="font-display text-xl text-foreground mb-2">
                      {isDragActive ? "Release to upload" : "Drop images here"}
                    </p>
                    <p className="font-serif text-sm text-muted-foreground">
                      or click to browse your files
                    </p>
                  </div>
                  <div className="mt-4 space-y-1">
                    <p className="font-serif-sc text-[9px] tracking-widest text-gold/60">
                      ✦ AUTO-COMPRESSED TO WEBP
                    </p>
                    <p className="font-serif-sc text-[9px] tracking-widest text-gold/60">
                      ✦ MAX 1200PX WIDTH · 85% QUALITY
                    </p>
                    <p className="font-serif-sc text-[9px] tracking-widest text-gold/60">
                      ✦ JPG · PNG · WEBP · GIF ACCEPTED
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gold/20 flex justify-between items-center">
          <p className="font-serif text-xs text-muted-foreground">
            {assets.length} asset{assets.length !== 1 ? 's' : ''} in bucket
          </p>
          <button 
            onClick={onClose}
            className="font-serif-sc text-xs tracking-widest text-muted-foreground hover:text-gold transition-colors px-6 py-2"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};
