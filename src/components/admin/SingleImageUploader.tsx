import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Loader2, UploadCloud, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { compressImage } from "@/lib/imageCompression";

interface SingleImageUploaderProps {
  bucket: string;
  folder?: string;
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}

export const SingleImageUploader = ({ bucket, folder = "cms", value, onChange, label = "SELECT IMAGE" }: SingleImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];

    setUploading(true);
    try {
      const optimizedFile = await compressImage(file);
      const fileExt = "webp";
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, optimizedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success("Image uploaded successfully.");
    } catch (e: any) {
      toast.error("Upload failed: " + e.message);
    } finally {
      setUploading(false);
    }
  }, [bucket, folder, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif"] },
    multiple: false,
    disabled: uploading,
  });

  return (
    <div className="w-full h-full relative">
      {value ? (
        <div className="w-full h-full relative group overflow-hidden bg-black/20 jharokha-frame">
          <img src={value} className="w-full h-full object-cover" alt="Uploaded" />
          <div className="absolute inset-0 bg-royal-deep/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`w-full h-full min-h-[120px] flex flex-col items-center justify-center gap-2 border-2 border-dashed transition-all cursor-pointer jharokha-frame bg-gold/5
            ${isDragActive ? 'border-gold bg-gold/10' : 'border-gold/20 hover:border-gold/50'}
            ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <Loader2 className="animate-spin text-gold w-8 h-8" />
          ) : (
            <>
              <UploadCloud className="text-gold/40" size={32} />
              <span className="text-[9px] font-serif-sc tracking-widest text-gold/60 text-center px-2">{label}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
