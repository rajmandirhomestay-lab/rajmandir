import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useDayAtRajMandir } from "@/lib/api";
import { toast } from "sonner";
import { 
  Loader2, Save, Plus, Trash2, Edit, MoveUp, MoveDown, Eye, EyeOff, 
  Upload, Image as ImageIcon, Clock, Sun, Moon, Utensils, Compass, Coffee, Sparkles, X, Check
} from "lucide-react";
import { compressImage } from "@/lib/imageCompression";
import { cn } from "@/lib/utils";

type DayItem = {
  id?: string;
  time: string;
  title: string;
  short_description: string;
  full_description: string;
  icon: string;
  category: string;
  sort_order: number;
  active: boolean;
  day_at_raj_mandir_images?: { id?: string; image_url: string; alt_text?: string; sort_order: number }[];
};

const ICONS = ["Sun", "Coffee", "Utensils", "Compass", "Moon", "Sparkles", "Clock"];
const CATEGORIES = ["Morning", "Afternoon", "Evening", "Night", "General"];

export default function DayAtRajMandirCMS() {
  const { data: dbItems, isLoading, refetch } = useDayAtRajMandir();
  const [items, setItems] = useState<DayItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<DayItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (dbItems) {
      setItems(dbItems);
      if (!selectedId && dbItems.length > 0) {
        setSelectedId(dbItems[0].id || null);
        setEditingItem(dbItems[0]);
      }
    }
  }, [dbItems]);

  const handleSelectItem = (item: DayItem) => {
    setSelectedId(item.id || null);
    setEditingItem(JSON.parse(JSON.stringify(item)));
  };

  const handleAddNew = () => {
    const newItem: DayItem = {
      time: "08:00 AM",
      title: "New Day Experience",
      short_description: "A wonderful experience at Raj Mandir.",
      full_description: "Detailed story of this activity for our palace guests.",
      icon: "Sun",
      category: "Morning",
      sort_order: items.length + 1,
      active: true,
      day_at_raj_mandir_images: []
    };
    setEditingItem(newItem);
    setSelectedId("new");
  };

  const handleSaveItem = async () => {
    if (!editingItem) return;
    if (!editingItem.title.trim() || !editingItem.time.trim()) {
      toast.error("Please enter at least a title and time.");
      return;
    }

    setSaving(true);
    try {
      // 1. Upsert activity
      const payload: any = {
        time: editingItem.time,
        title: editingItem.title,
        short_description: editingItem.short_description,
        full_description: editingItem.full_description,
        icon: editingItem.icon,
        category: editingItem.category,
        sort_order: editingItem.sort_order,
        active: editingItem.active,
        updated_at: new Date().toISOString()
      };

      if (editingItem.id && editingItem.id !== "new") {
        payload.id = editingItem.id;
      }

      const { data: savedData, error: upsertError } = await supabase
        .from("day_at_raj_mandir")
        .upsert(payload)
        .select()
        .single();

      if (upsertError) throw upsertError;

      const itemId = savedData.id;

      // 2. Save nested images if any
      if (editingItem.day_at_raj_mandir_images && editingItem.day_at_raj_mandir_images.length > 0) {
        // Delete existing images not in editing list
        if (editingItem.id && editingItem.id !== "new") {
          const keepIds = editingItem.day_at_raj_mandir_images
            .map(img => img.id)
            .filter(Boolean);
          
          if (keepIds.length > 0) {
            await supabase
              .from("day_at_raj_mandir_images")
              .delete()
              .eq("day_item_id", itemId)
              .not("id", "in", `(${keepIds.join(",")})`);
          } else {
            await supabase
              .from("day_at_raj_mandir_images")
              .delete()
              .eq("day_item_id", itemId);
          }
        }

        // Upsert images
        const imagePayloads = editingItem.day_at_raj_mandir_images.map((img, idx) => ({
          ...(img.id ? { id: img.id } : {}),
          day_item_id: itemId,
          image_url: img.image_url,
          alt_text: img.alt_text || editingItem.title,
          sort_order: idx + 1
        }));

        const { error: imgError } = await supabase
          .from("day_at_raj_mandir_images")
          .upsert(imagePayloads);

        if (imgError) console.error("Error saving images:", imgError);
      }

      toast.success("Activity saved successfully!");
      await refetch();
    } catch (err: any) {
      toast.error("Failed to save activity: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (id?: string) => {
    if (!id || id === "new") {
      setEditingItem(null);
      setSelectedId(null);
      return;
    }

    if (!confirm("Are you sure you want to delete this activity?")) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("day_at_raj_mandir")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Activity deleted.");
      setEditingItem(null);
      setSelectedId(null);
      refetch();
    } catch (err: any) {
      toast.error("Delete failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImage = async (file: File) => {
    if (!editingItem) return;
    setUploadingImage(true);
    try {
      const origKb = (file.size / 1024).toFixed(1);
      const compressed = await compressImage(file);
      const compKb = (compressed.size / 1024).toFixed(1);

      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.webp`;
      const filePath = `activities/${fileName}`;

      // Upload to 'day-at-raj-mandir' bucket, fallback to 'content'
      let publicUrl = "";
      const { error: uploadErr } = await supabase.storage
        .from("day-at-raj-mandir")
        .upload(filePath, compressed, { upsert: true });

      if (uploadErr) {
        const { error: fallbackErr } = await supabase.storage
          .from("content")
          .upload(filePath, compressed, { upsert: true });
        if (fallbackErr) throw fallbackErr;
        publicUrl = supabase.storage.from("content").getPublicUrl(filePath).data.publicUrl;
      } else {
        publicUrl = supabase.storage.from("day-at-raj-mandir").getPublicUrl(filePath).data.publicUrl;
      }

      const newImages = [...(editingItem.day_at_raj_mandir_images || [])];
      newImages.push({
        image_url: publicUrl,
        alt_text: editingItem.title,
        sort_order: newImages.length + 1
      });

      setEditingItem({ ...editingItem, day_at_raj_mandir_images: newImages });
      toast.success(`Image compressed (${origKb}KB → ${compKb}KB) and added!`);
    } catch (err: any) {
      toast.error("Image upload failed: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    if (!editingItem) return;
    const newImages = (editingItem.day_at_raj_mandir_images || []).filter((_, i) => i !== index);
    setEditingItem({ ...editingItem, day_at_raj_mandir_images: newImages });
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    if (!editingItem || !editingItem.day_at_raj_mandir_images) return;
    const imgs = [...editingItem.day_at_raj_mandir_images];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= imgs.length) return;

    const temp = imgs[index];
    imgs[index] = imgs[targetIdx];
    imgs[targetIdx] = temp;

    setEditingItem({ ...editingItem, day_at_raj_mandir_images: imgs });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="animate-spin text-gold w-10 h-10" /></div>;
  }

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gold/10 pb-6">
        <div>
          <h1 className="font-display text-4xl mb-2 flex items-center gap-3">
            <Clock className="text-gold" size={32} />
            A Day at Raj Mandir CMS
          </h1>
          <p className="font-serif text-muted-foreground">Manage the chronological day experiences, activities, times, and multiple activity photos.</p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-gradient-gold text-royal-deep font-serif-sc text-xs px-6 py-3 flex items-center gap-2 hover:shadow-gold transition-all"
        >
          <Plus size={16} /> ADD NEW ACTIVITY
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* LEFT LIST COLUMN */}
        <div className="lg:col-span-5 space-y-3">
          <div className="font-serif-sc text-xs tracking-widest text-gold uppercase px-1">ACTIVITIES TIMELINE</div>
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => handleSelectItem(item)}
              className={cn(
                "p-4 bg-card border cursor-pointer transition-all flex items-center justify-between group",
                selectedId === item.id 
                  ? "border-gold bg-gold/10 shadow-gold" 
                  : "border-gold/20 hover:border-gold/60"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="font-serif-sc text-xs text-gold font-bold px-2 py-1 bg-gold/10 border border-gold/30 rounded-sm">
                  {item.time}
                </span>
                <div>
                  <h4 className="font-display text-lg text-foreground leading-snug">{item.title}</h4>
                  <p className="font-serif italic text-xs text-muted-foreground line-clamp-1">{item.short_description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!item.active && <EyeOff size={16} className="text-muted-foreground" />}
                {item.day_at_raj_mandir_images && item.day_at_raj_mandir_images.length > 0 && (
                  <span className="text-[10px] font-serif-sc text-gold/80 px-1.5 py-0.5 border border-gold/30">
                    {item.day_at_raj_mandir_images.length} 📷
                  </span>
                )}
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="p-8 text-center border border-dashed border-gold/30 font-serif italic text-muted-foreground">
              No activities found. Click "ADD NEW ACTIVITY" to create one.
            </div>
          )}
        </div>

        {/* RIGHT EDIT FORM COLUMN */}
        <div className="lg:col-span-7">
          {editingItem ? (
            <div className="bg-card border border-gold/20 shadow-frame p-6 lg:p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-gold/10 pb-4">
                <h3 className="font-display text-2xl text-foreground">
                  {editingItem.id === "new" ? "New Activity" : `Edit: ${editingItem.title}`}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeleteItem(editingItem.id)}
                    disabled={saving}
                    className="p-2 border border-red-500/40 text-red-400 hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={handleSaveItem}
                    disabled={saving}
                    className="bg-gradient-gold text-royal-deep font-serif-sc text-xs px-6 py-2 flex items-center gap-2 hover:shadow-gold transition-all"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} SAVE ACTIVITY
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">TIME STAMP</label>
                  <input
                    type="text"
                    value={editingItem.time}
                    onChange={(e) => setEditingItem({ ...editingItem, time: e.target.value })}
                    placeholder="e.g. 07:30 AM"
                    className="w-full bg-background border border-gold/20 focus:border-gold px-4 py-2.5 font-serif outline-none text-foreground"
                  />
                </div>

                <div>
                  <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">CATEGORY</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full bg-background border border-gold/20 focus:border-gold px-4 py-2.5 font-serif outline-none text-foreground"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">ACTIVITY TITLE</label>
                  <input
                    type="text"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    placeholder="e.g. Wake Up & Morning Tea"
                    className="w-full bg-background border border-gold/20 focus:border-gold px-4 py-2.5 font-serif text-lg text-foreground outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">SHORT DESCRIPTION (Main Timeline)</label>
                  <textarea
                    rows={2}
                    value={editingItem.short_description}
                    onChange={(e) => setEditingItem({ ...editingItem, short_description: e.target.value })}
                    placeholder="Brief summary for the timeline..."
                    className="w-full bg-background border border-gold/20 focus:border-gold px-4 py-2 font-serif text-foreground outline-none resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">DETAILED DESCRIPTION (Optional)</label>
                  <textarea
                    rows={3}
                    value={editingItem.full_description || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, full_description: e.target.value })}
                    placeholder="Extended story of this experience..."
                    className="w-full bg-background border border-gold/20 focus:border-gold px-4 py-2 font-serif text-foreground outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">SORT ORDER</label>
                  <input
                    type="number"
                    value={editingItem.sort_order}
                    onChange={(e) => setEditingItem({ ...editingItem, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full bg-background border border-gold/20 focus:border-gold px-4 py-2.5 font-serif outline-none text-foreground"
                  />
                </div>

                <div>
                  <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">STATUS</label>
                  <button
                    type="button"
                    onClick={() => setEditingItem({ ...editingItem, active: !editingItem.active })}
                    className={cn(
                      "w-full py-2.5 px-4 font-serif-sc text-xs tracking-widest border flex items-center justify-center gap-2 transition-all",
                      editingItem.active ? "border-gold text-gold bg-gold/10" : "border-muted text-muted-foreground bg-muted/20"
                    )}
                  >
                    {editingItem.active ? <Check size={14} /> : <EyeOff size={14} />}
                    {editingItem.active ? "ACTIVE" : "INACTIVE"}
                  </button>
                </div>
              </div>

              {/* MULTIPLE IMAGES SECTION */}
              <div className="pt-6 border-t border-gold/10 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="font-serif-sc text-xs tracking-widest text-gold uppercase block">ACTIVITY PHOTOGRAPHY & CAROUSEL IMAGES</label>
                  <label className="cursor-pointer bg-gold/10 border border-gold/40 text-gold hover:bg-gold hover:text-royal-deep px-4 py-1.5 font-serif-sc text-[11px] tracking-widest transition-all flex items-center gap-2">
                    {uploadingImage ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    UPLOAD PHOTO
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleUploadImage(e.target.files[0]);
                        }
                      }}
                      disabled={uploadingImage}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {(editingItem.day_at_raj_mandir_images || []).map((img, idx) => (
                    <div key={idx} className="relative aspect-[4/3] bg-background border border-gold/20 group overflow-hidden shadow-sm">
                      <img src={img.image_url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                        {idx > 0 && (
                          <button onClick={() => handleMoveImage(idx, 'up')} className="p-1.5 bg-black/80 text-gold hover:text-white rounded-sm">
                            <MoveUp size={14} />
                          </button>
                        )}
                        {idx < (editingItem.day_at_raj_mandir_images || []).length - 1 && (
                          <button onClick={() => handleMoveImage(idx, 'down')} className="p-1.5 bg-black/80 text-gold hover:text-white rounded-sm">
                            <MoveDown size={14} />
                          </button>
                        )}
                        <button onClick={() => handleRemoveImage(idx)} className="p-1.5 bg-red-900/80 text-red-300 hover:text-white rounded-sm">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {(!editingItem.day_at_raj_mandir_images || editingItem.day_at_raj_mandir_images.length === 0) && (
                    <div className="col-span-full py-8 border border-dashed border-gold/30 text-center font-serif italic text-muted-foreground text-sm">
                      No photos added yet. Click "UPLOAD PHOTO" to attach images for this activity.
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 border border-gold/20 bg-card text-center font-serif italic text-muted-foreground">
              Select an activity from the list on the left to edit, or click "ADD NEW ACTIVITY".
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
