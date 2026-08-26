import { useState, useRef } from "react";
import { motion, Reorder } from "framer-motion";
import { Plus, X, GripVertical, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { compressImage } from "@/lib/imageCompression";

interface MultiImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  folder?: string;
  bucket?: string;
}

export const MultiImageUploader = ({
  images = [],
  onChange,
  folder = "cms",
  bucket = "gallery",
}: MultiImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages = [...images];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let optimizedFile: any = file;
        try {
          optimizedFile = await compressImage(file);
        } catch (err) {
          console.warn("Compression fallback:", err);
        }

        const fileExt = "webp";
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        let publicUrl = "";
        const bucketsToTry = Array.from(new Set([bucket, "gallery", "cms", "public"])).filter(Boolean);

        for (const b of bucketsToTry) {
          try {
            const { error: uploadError } = await supabase.storage
              .from(b)
              .upload(filePath, optimizedFile, { upsert: true });

            if (!uploadError) {
              const { data } = supabase.storage.from(b).getPublicUrl(filePath);
              publicUrl = data.publicUrl;
              break;
            }
          } catch (e) {
            console.warn(`Bucket ${b} upload error:`, e);
          }
        }

        if (!publicUrl) {
          publicUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        }

        newImages.push(publicUrl);
      }
      onChange(newImages);
      toast.success(`${files.length} image(s) uploaded successfully.`);
    } catch (error: any) {
      toast.error("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="font-serif-sc text-[10px] tracking-widest text-gold">GALLERY ASSETS</label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 text-[10px] font-serif-sc tracking-widest text-gold hover:text-white transition-colors"
        >
          {uploading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
          ADD IMAGES
        </button>
        <input
          type="file"
          multiple
          accept="image/*"
          ref={fileInputRef}
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {images.length === 0 ? (
        <div className="border-2 border-dashed border-gold/10 rounded-lg p-12 text-center bg-gold/5">
          <ImageIcon className="mx-auto text-gold/20 mb-4" size={40} />
          <p className="font-serif italic text-sm text-muted-foreground">No images commissioned yet.</p>
        </div>
      ) : (
        <Reorder.Group axis="y" values={images} onReorder={onChange} className="space-y-3">
          {images.map((img, idx) => (
            <Reorder.Item
              key={img}
              value={img}
              className="flex items-center gap-4 bg-background border border-gold/20 p-3 shadow-sm group hover:border-gold/50 transition-all"
            >
              <div className="cursor-grab active:cursor-grabbing text-gold/30 group-hover:text-gold/60">
                <GripVertical size={16} />
              </div>
              <div className="w-16 h-16 rounded overflow-hidden border border-gold/10">
                <img src={img} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 truncate font-serif text-xs text-muted-foreground">
                {img.split('/').pop()}
              </div>
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="p-2 text-red-400/50 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
              >
                <X size={16} />
              </button>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}
    </div>
  );
};
