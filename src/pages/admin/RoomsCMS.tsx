import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Plus, Edit2, Trash2, Save, X, BedDouble } from "lucide-react";

type Room = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_per_night: number;
  max_occupancy: number;
  is_featured: boolean;
  is_available: boolean;
  stock_left: number;
};

export default function RoomsCMS() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRoom, setEditingRoom] = useState<Partial<Room> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase.from("rooms").select("*").order("created_at", { ascending: true });
      if (error) throw error;
      setRooms(data || []);
    } catch (error: any) {
      toast.error("Failed to load rooms: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom?.name || !editingRoom?.slug) return;
    setSaving(true);
    try {
      if (editingRoom.id) {
        const { error } = await supabase.from("rooms").update({
          ...editingRoom,
          updated_at: new Date().toISOString(),
        }).eq("id", editingRoom.id);
        if (error) throw error;
        toast.success("Room updated successfully.");
      } else {
        const { error } = await supabase.from("rooms").insert([editingRoom]);
        if (error) throw error;
        toast.success("Room created successfully.");
      }
      setEditingRoom(null);
      fetchRooms();
    } catch (error: any) {
      toast.error("Failed to save room: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this room? This action cannot be undone.")) return;
    try {
      const { error } = await supabase.from("rooms").delete().eq("id", id);
      if (error) throw error;
      toast.success("Room deleted successfully.");
      fetchRooms();
    } catch (error: any) {
      toast.error("Failed to delete room: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="animate-spin text-gold w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-foreground mb-2">Room Management</h1>
          <p className="font-serif text-muted-foreground">Manage your royal chambers, pricing, and availability.</p>
        </div>
        {!editingRoom && (
          <button 
            onClick={() => setEditingRoom({ is_available: true, is_featured: false, stock_left: 1, max_occupancy: 2, price_per_night: 5000 })}
            className="bg-gold text-royal-deep font-serif-sc tracking-widest text-xs px-6 py-3 flex items-center gap-2 hover:bg-gold-glow transition-all duration-300"
          >
            <Plus size={16} /> ADD NEW ROOM
          </button>
        )}
      </div>

      {editingRoom ? (
        <div className="bg-card border border-gold/20 shadow-frame p-8">
          <div className="flex items-center justify-between mb-8 border-b border-gold/10 pb-4">
            <h2 className="font-display text-3xl text-foreground">{editingRoom.id ? "Edit Room" : "Create New Room"}</h2>
            <button onClick={() => setEditingRoom(null)} className="text-muted-foreground hover:text-gold transition-colors">
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">ROOM NAME</label>
                <input required type="text" value={editingRoom.name || ""} onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })} className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif text-foreground transition-all duration-300" placeholder="e.g. Maharaja Suite" />
              </div>
              <div>
                <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">URL SLUG (Unique)</label>
                <input required type="text" value={editingRoom.slug || ""} onChange={(e) => setEditingRoom({ ...editingRoom, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif text-foreground transition-all duration-300" placeholder="e.g. maharaja-suite" />
              </div>
            </div>

            <div>
              <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">ROOM DESCRIPTION</label>
              <textarea required rows={4} value={editingRoom.description || ""} onChange={(e) => setEditingRoom({ ...editingRoom, description: e.target.value })} className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif text-foreground transition-all duration-300 resize-none" placeholder="Describe the royal chamber..." />
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">PRICE PER NIGHT (₹)</label>
                <input required type="number" value={editingRoom.price_per_night || 0} onChange={(e) => setEditingRoom({ ...editingRoom, price_per_night: Number(e.target.value) })} className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif text-foreground transition-all duration-300" />
              </div>
              <div>
                <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">MAX OCCUPANCY</label>
                <input required type="number" value={editingRoom.max_occupancy || 2} onChange={(e) => setEditingRoom({ ...editingRoom, max_occupancy: Number(e.target.value) })} className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif text-foreground transition-all duration-300" />
              </div>
              <div>
                <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">STOCK LEFT (Rooms available)</label>
                <input required type="number" value={editingRoom.stock_left || 1} onChange={(e) => setEditingRoom({ ...editingRoom, stock_left: Number(e.target.value) })} className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif text-foreground transition-all duration-300" />
              </div>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={editingRoom.is_available || false} onChange={(e) => setEditingRoom({ ...editingRoom, is_available: e.target.checked })} className="w-4 h-4 accent-gold" />
                <span className="font-serif-sc text-[10px] tracking-widest text-foreground group-hover:text-gold transition-colors">IS AVAILABLE FOR BOOKING</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={editingRoom.is_featured || false} onChange={(e) => setEditingRoom({ ...editingRoom, is_featured: e.target.checked })} className="w-4 h-4 accent-gold" />
                <span className="font-serif-sc text-[10px] tracking-widest text-foreground group-hover:text-gold transition-colors">FEATURE ON HOMEPAGE</span>
              </label>
            </div>

            <div className="pt-6 border-t border-gold/10 flex justify-end">
              <button disabled={saving} type="submit" className="bg-gold text-royal-deep font-serif-sc tracking-[0.2em] text-xs px-8 py-3 flex items-center gap-2 hover:bg-gold-glow transition-all duration-300 disabled:opacity-70">
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {saving ? "SAVING..." : "SAVE ROOM"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid gap-6">
          {rooms.length === 0 ? (
            <div className="text-center p-12 border border-gold/20 bg-card/50 shadow-frame">
              <BedDouble className="mx-auto text-gold/50 w-12 h-12 mb-4" />
              <h3 className="font-display text-2xl text-foreground mb-2">No Rooms Configured</h3>
              <p className="font-serif text-muted-foreground">Click 'Add New Room' to create your first royal chamber.</p>
            </div>
          ) : (
            rooms.map((room) => (
              <div key={room.id} className="bg-card border border-gold/20 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-gold transition-all duration-300 group">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-display text-2xl text-foreground group-hover:text-gold transition-colors">{room.name}</h3>
                    {room.is_featured && <span className="bg-gold/10 text-gold text-[9px] font-serif-sc tracking-widest px-2 py-0.5 border border-gold/30">FEATURED</span>}
                    {!room.is_available && <span className="bg-red-900/20 text-red-400 text-[9px] font-serif-sc tracking-widest px-2 py-0.5 border border-red-900/30">UNAVAILABLE</span>}
                  </div>
                  <p className="font-serif-sc text-[10px] tracking-widest text-muted-foreground mb-3">SLUG: /{room.slug}</p>
                  <div className="flex items-center gap-6 font-serif text-sm text-foreground/80">
                    <span>₹{room.price_per_night} / night</span>
                    <span className="text-gold/50">•</span>
                    <span>Max: {room.max_occupancy} Guests</span>
                    <span className="text-gold/50">•</span>
                    <span>{room.stock_left} Rooms Left</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setEditingRoom(room)} className="p-3 border border-gold/30 text-gold hover:bg-gold hover:text-royal-deep transition-all duration-300">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(room.id)} className="p-3 border border-red-900/30 text-red-400 hover:bg-red-900/20 transition-all duration-300">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
