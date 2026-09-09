import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useEvents } from "@/lib/api";
import { toast } from "sonner";
import { 
  Loader2, Plus, Edit2, Trash2, Save, X, ImageIcon, Calendar, Clock, 
  MapPin, Users, IndianRupee, MoveUp, MoveDown, CheckCircle2, Eye, EyeOff, Sparkles 
} from "lucide-react";
import { compressImage } from "@/lib/imageCompression";

type EventImage = {
  id?: string;
  image_url: string;
  alt_text?: string;
  sort_order: number;
};

type EventItem = {
  id?: string;
  title: string;
  short_description: string;
  full_description: string;
  category: string;
  event_date?: string;
  event_time?: string;
  venue?: string;
  capacity?: string;
  starting_price?: string;
  cta_text: string;
  cta_link: string;
  featured: boolean;
  active: boolean;
  sort_order: number;
  event_images?: EventImage[];
};

const CATEGORIES = [
  "Weddings & Intimate Celebrations",
  "Birthday Celebrations",
  "Family Gatherings",
  "Cultural Evenings",
  "Private Dinners",
  "Corporate & Small Gatherings",
  "Festivals & Traditional Events",
  "Custom Experience"
];

export default function EventsCMS() {
  const { data: dbEvents, isLoading, refetch } = useEvents();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [editing, setEditing] = useState<Partial<EventItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (dbEvents) {
      setEvents(dbEvents as EventItem[]);
    }
  }, [dbEvents]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.title) {
      toast.error("Please provide an event title.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: editing.title,
        short_description: editing.short_description || "",
        full_description: editing.full_description || "",
        category: editing.category || "Weddings & Intimate Celebrations",
        event_date: editing.event_date || null,
        event_time: editing.event_time || "",
        venue: editing.venue || "",
        capacity: editing.capacity || "",
        starting_price: editing.starting_price || "",
        cta_text: editing.cta_text || "Enquire Now",
        cta_link: editing.cta_link || "/contact",
        featured: editing.featured ?? false,
        active: editing.active ?? true,
        sort_order: editing.sort_order ?? events.length + 1,
      };

      let eventId = editing.id;

      if (editing.id) {
        const { error } = await supabase
          .from("events")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
        toast.success("Event updated successfully!");
      } else {
        const { data, error } = await supabase
          .from("events")
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        eventId = data.id;
        toast.success("Event created successfully!");
      }

      // Handle Event Images
      if (editing.event_images && eventId) {
        await supabase.from("event_images").delete().eq("event_id", eventId);

        if (editing.event_images.length > 0) {
          const imagesPayload = editing.event_images.map((img, idx) => ({
            event_id: eventId,
            image_url: img.image_url,
            alt_text: img.alt_text || editing.title,
            sort_order: idx + 1
          }));

          const { error: imgError } = await supabase
            .from("event_images")
            .insert(imagesPayload);

          if (imgError) throw imgError;
        }
      }

      setEditing(null);
      refetch();
    } catch (err: any) {
      toast.error("Failed to save event: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanently delete this event and all associated images?")) return;
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
      toast.success("Event deleted successfully!");
      refetch();
    } catch (err: any) {
      toast.error("Delete failed: " + err.message);
    }
  };

  const handleToggleActive = async (item: EventItem) => {
    try {
      const { error } = await supabase
        .from("events")
        .update({ active: !item.active })
        .eq("id", item.id);
      if (error) throw error;
      toast.success(`Event ${item.active ? "disabled" : "enabled"}`);
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      const originalKb = (file.size / 1024).toFixed(1);
      const compressedFile = await compressImage(file);
      const compressedKb = (compressedFile.size / 1024).toFixed(1);

      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.webp`;
      const filePath = `events/${fileName}`;

      // Upload to 'events' bucket, fallback to 'content'
      let publicUrl = "";
      const { error: uploadError } = await supabase.storage
        .from("events")
        .upload(filePath, compressedFile, { upsert: true });

      if (uploadError) {
        const { error: fallbackError } = await supabase.storage
          .from("content")
          .upload(filePath, compressedFile, { upsert: true });
        if (fallbackError) throw fallbackError;
        publicUrl = supabase.storage.from("content").getPublicUrl(filePath).data.publicUrl;
      } else {
        publicUrl = supabase.storage.from("events").getPublicUrl(filePath).data.publicUrl;
      }

      const currentImages = editing?.event_images || [];
      const newImages = [
        ...currentImages,
        { image_url: publicUrl, alt_text: editing?.title || "Event Image", sort_order: currentImages.length + 1 }
      ];

      setEditing(prev => ({ ...prev, event_images: newImages }));
      toast.success(`Image compressed (${originalKb} KB → ${compressedKb} KB) and uploaded!`);
    } catch (err: any) {
      toast.error("Image upload failed: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    const current = editing?.event_images || [];
    const updated = current.filter((_, i) => i !== index);
    setEditing(prev => ({ ...prev, event_images: updated }));
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const current = [...(editing?.event_images || [])];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= current.length) return;
    const temp = current[index];
    current[index] = current[targetIndex];
    current[targetIndex] = temp;
    setEditing(prev => ({ ...prev, event_images: current }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="animate-spin text-gold w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gold/10 pb-6">
        <div>
          <h1 className="font-display text-4xl mb-2 flex items-center gap-3">
            <Sparkles className="text-gold" size={32} />
            Events at Raj Mandir CMS
          </h1>
          <p className="font-serif text-muted-foreground">
            Manage luxury celebrations, weddings, private dinners, and cultural gatherings.
          </p>
        </div>
        {!editing && (
          <button
            onClick={() =>
              setEditing({
                title: "",
                category: CATEGORIES[0],
                short_description: "",
                full_description: "",
                event_date: "",
                event_time: "",
                venue: "",
                capacity: "",
                starting_price: "",
                cta_text: "Enquire Now",
                cta_link: "/contact",
                featured: false,
                active: true,
                sort_order: events.length + 1,
                event_images: []
              })
            }
            className="bg-gradient-gold text-royal-deep font-serif-sc text-xs px-6 py-3 flex items-center gap-2 hover:shadow-gold transition-all duration-300 font-bold"
          >
            <Plus size={16} /> ADD NEW EVENT
          </button>
        )}
      </div>

      {/* Form */}
      {editing && (
        <div className="bg-card border border-gold/20 p-6 md:p-8 shadow-frame relative overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between mb-8 border-b border-gold/10 pb-4">
            <h2 className="font-display text-2xl text-foreground">
              {editing.id ? "Edit Event" : "Create New Event"}
            </h2>
            <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-gold transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">EVENT TITLE *</label>
                  <input
                    required
                    type="text"
                    value={editing.title || ""}
                    onChange={e => setEditing({ ...editing, title: e.target.value })}
                    placeholder="e.g. Royal Weddings & Intimate Celebrations"
                    className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif text-foreground"
                  />
                </div>

                <div>
                  <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">CATEGORY / EVENT TYPE</label>
                  <select
                    value={editing.category || CATEGORIES[0]}
                    onChange={e => setEditing({ ...editing, category: e.target.value })}
                    className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif text-foreground"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat} className="bg-card text-foreground">{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">SHORT DESCRIPTION</label>
                  <textarea
                    rows={2}
                    value={editing.short_description || ""}
                    onChange={e => setEditing({ ...editing, short_description: e.target.value })}
                    placeholder="Brief summary displayed on event cards..."
                    className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif text-foreground resize-none"
                  />
                </div>

                <div>
                  <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">FULL DESCRIPTION</label>
                  <textarea
                    rows={4}
                    value={editing.full_description || ""}
                    onChange={e => setEditing({ ...editing, full_description: e.target.value })}
                    placeholder="Detailed explanation of the event experience..."
                    className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif text-foreground resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">DATE (OPTIONAL)</label>
                    <input
                      type="date"
                      value={editing.event_date || ""}
                      onChange={e => setEditing({ ...editing, event_date: e.target.value })}
                      className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif text-foreground"
                    />
                  </div>
                  <div>
                    <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">TIME (OPTIONAL)</label>
                    <input
                      type="text"
                      value={editing.event_time || ""}
                      onChange={e => setEditing({ ...editing, event_time: e.target.value })}
                      placeholder="e.g. 07:00 PM Onwards"
                      className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">VENUE / LOCATION</label>
                    <input
                      type="text"
                      value={editing.venue || ""}
                      onChange={e => setEditing({ ...editing, venue: e.target.value })}
                      placeholder="e.g. Rooftop Terrace"
                      className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-3 py-3 font-serif text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">CAPACITY</label>
                    <input
                      type="text"
                      value={editing.capacity || ""}
                      onChange={e => setEditing({ ...editing, capacity: e.target.value })}
                      placeholder="e.g. Up to 150 Guests"
                      className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-3 py-3 font-serif text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">STARTING PRICE</label>
                    <input
                      type="text"
                      value={editing.starting_price || ""}
                      onChange={e => setEditing({ ...editing, starting_price: e.target.value })}
                      placeholder="e.g. ₹45,000"
                      className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-3 py-3 font-serif text-foreground text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">CTA BUTTON TEXT</label>
                    <input
                      type="text"
                      value={editing.cta_text || "Enquire Now"}
                      onChange={e => setEditing({ ...editing, cta_text: e.target.value })}
                      className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif text-foreground"
                    />
                  </div>
                  <div>
                    <label className="font-serif-sc text-[10px] tracking-widest text-gold block mb-2">CTA LINK</label>
                    <input
                      type="text"
                      value={editing.cta_link || "/contact"}
                      onChange={e => setEditing({ ...editing, cta_link: e.target.value })}
                      className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif text-foreground"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editing.active ?? true}
                      onChange={e => setEditing({ ...editing, active: e.target.checked })}
                      className="accent-gold"
                    />
                    <span className="font-serif-sc text-xs tracking-widest text-foreground">ACTIVE / VISIBLE</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editing.featured ?? false}
                      onChange={e => setEditing({ ...editing, featured: e.target.checked })}
                      className="accent-gold"
                    />
                    <span className="font-serif-sc text-xs tracking-widest text-gold">FEATURED EVENT</span>
                  </label>
                </div>
              </div>

              {/* Right Column: Multi-Image Uploader */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-serif-sc text-[10px] tracking-widest text-gold block uppercase">
                      EVENT IMAGES ({editing.event_images?.length || 0})
                    </label>
                    <label className="cursor-pointer bg-gradient-gold text-royal-deep font-serif-sc text-[10px] px-4 py-2 flex items-center gap-2 font-bold shadow-sm hover:scale-[1.02] transition-all">
                      {uploadingImage ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
                      {uploadingImage ? "COMPRESSING..." : "UPLOAD NEW IMAGE"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleImageUpload(e.target.files[0]);
                          }
                        }}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>

                  <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar">
                    {editing.event_images?.map((img, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-background border border-gold/20 p-3 rounded-sm shadow-sm">
                        <img src={img.image_url} alt="Thumbnail" className="w-16 h-12 object-cover rounded-sm border border-gold/30 shrink-0" />
                        <input
                          type="text"
                          value={img.alt_text || ""}
                          onChange={e => {
                            const updated = [...(editing.event_images || [])];
                            updated[idx].alt_text = e.target.value;
                            setEditing({ ...editing, event_images: updated });
                          }}
                          placeholder="Alt text / Image caption..."
                          className="flex-1 bg-transparent border-b border-gold/20 focus:border-gold outline-none text-xs font-serif px-1 py-1"
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <button type="button" onClick={() => moveImage(idx, "up")} disabled={idx === 0} className="p-1 text-muted-foreground hover:text-gold disabled:opacity-30">
                            <MoveUp size={14} />
                          </button>
                          <button type="button" onClick={() => moveImage(idx, "down")} disabled={idx === (editing.event_images?.length || 0) - 1} className="p-1 text-muted-foreground hover:text-gold disabled:opacity-30">
                            <MoveDown size={14} />
                          </button>
                          <button type="button" onClick={() => removeImage(idx)} className="p-1 text-red-400 hover:text-red-300 ml-1">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {!editing.event_images?.length && (
                      <div className="text-center font-serif italic text-muted-foreground text-sm py-12 border border-dashed border-gold/30 bg-gold/5">
                        No images uploaded for this event yet. Click upload button above.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-gold/10 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="font-serif-sc text-xs tracking-widest text-muted-foreground hover:text-gold transition-colors px-4 py-2"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-gradient-gold text-royal-deep font-serif-sc tracking-widest text-xs px-10 py-3.5 flex items-center gap-2 shadow-gold font-bold hover:scale-[1.02] transition-all"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {saving ? "SAVING..." : "SAVE EVENT"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid gap-6">
        {events.map((evt, idx) => (
          <div
            key={evt.id || idx}
            className={`bg-card border ${evt.active ? "border-gold/20 hover:border-gold/40" : "border-gold/10 opacity-60"} p-6 flex flex-col md:flex-row gap-6 shadow-frame transition-all`}
          >
            <div className="w-full md:w-64 aspect-[16/10] bg-royal-deep relative overflow-hidden shrink-0 border border-gold/30">
              {evt.event_images && evt.event_images.length > 0 ? (
                <img src={evt.event_images[0].image_url} alt={evt.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gold/30 font-serif italic text-xs">
                  No Photo
                </div>
              )}
              {evt.featured && (
                <span className="absolute top-2 left-2 bg-gradient-gold text-royal-deep font-serif-sc text-[9px] font-bold px-2 py-0.5 shadow-sm">
                  FEATURED
                </span>
              )}
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-serif-sc text-[10px] tracking-widest text-gold block mb-1">
                    ★ {evt.category?.toUpperCase() || "EVENT"} ★
                  </span>
                  <h3 className="font-display text-2xl text-foreground">{evt.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(evt)}
                    className="p-2 border border-gold/20 text-muted-foreground hover:text-gold transition-colors"
                    title={evt.active ? "Hide Event" : "Show Event"}
                  >
                    {evt.active ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => setEditing(evt)}
                    className="p-2 border border-gold/20 text-gold hover:bg-gold hover:text-royal-deep transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => evt.id && handleDelete(evt.id)}
                    className="p-2 border border-red-900/30 text-red-400 hover:bg-red-900/20 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p className="font-serif italic text-sm text-gold-gradient line-clamp-1">{evt.short_description}</p>
              {evt.full_description && (
                <p className="font-serif text-xs text-muted-foreground line-clamp-2 leading-relaxed">{evt.full_description}</p>
              )}

              <div className="flex flex-wrap gap-4 text-xs font-serif text-muted-foreground pt-2 border-t border-gold/10">
                {evt.venue && <span className="flex items-center gap-1"><MapPin size={12} className="text-gold" /> {evt.venue}</span>}
                {evt.capacity && <span className="flex items-center gap-1"><Users size={12} className="text-gold" /> {evt.capacity}</span>}
                {evt.starting_price && <span className="flex items-center gap-1"><IndianRupee size={12} className="text-gold" /> {evt.starting_price}</span>}
                <span className="ml-auto font-serif-sc text-[10px] text-gold">{evt.event_images?.length || 0} Photos</span>
              </div>
            </div>
          </div>
        ))}

        {!events.length && (
          <div className="text-center font-serif italic text-muted-foreground py-16 bg-card border border-gold/20">
            No events registered yet. Click "Add New Event" above to create one.
          </div>
        )}
      </div>
    </div>
  );
}
