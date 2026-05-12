import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Plus, Edit2, Trash2, Save, X, BedDouble } from "lucide-react";

type PhysicalRoom = {
  id: string;
  room_number: string;
  category_id: string | null;
  status: "available" | "occupied" | "cleaning" | "maintenance";
  sort_order: number;
};

type CategoryOption = {
  id: string;
  name: string;
};

export default function PhysicalRoomsCMS() {
  const [rooms, setRooms] = useState<PhysicalRoom[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<PhysicalRoom> | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("room_categories")
        .select("id, name")
        .order("name", { ascending: true });
      if (error) throw error;
      setCategories(data as CategoryOption[]);
    } catch (e: any) {
      toast.error("Failed to load categories: " + e.message);
    }
  };

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from("physical_rooms")
        .select("*")
        .order("room_number", { ascending: true });
      if (error) throw error;
      setRooms(data as PhysicalRoom[]);
    } catch (e: any) {
      toast.error("Failed to load physical rooms: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchRooms();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.room_number || !editing?.category_id) {
      toast.error("Please provide a room number and select a category.");
      return;
    }
    setSaving(true);
    try {
      if (editing.id) {
        const { error } = await supabase
          .from("physical_rooms")
          .update(editing as any)
          .eq("id", editing.id);
        if (error) throw error;
        toast.success("Room updated successfully.");
      } else {
        const { error } = await supabase
          .from("physical_rooms")
          .insert([editing]);
        if (error) throw error;
        toast.success("Room created successfully.");
      }
      setEditing(null);
      fetchRooms();
    } catch (e: any) {
      toast.error("Save failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this room from the palace inventory?")) return;
    try {
      const { error } = await supabase.from("physical_rooms").delete().eq("id", id);
      if (error) throw error;
      toast.success("Room removed.");
      fetchRooms();
    } catch (e: any) {
      toast.error("Delete failed: " + e.message);
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
          <h1 className="font-display text-4xl text-foreground mb-2">Physical Rooms</h1>
          <p className="font-serif text-muted-foreground">
            Manage each inventory unit, assign it to a category and set its status.
          </p>
        </div>
        {!editing && (
          <button
            onClick={() =>
              setEditing({ room_number: "", category_id: null, status: "available", sort_order: 0 })
            }
            className="bg-gold text-royal-deep font-serif-sc tracking-widest text-xs px-6 py-3 flex items-center gap-2 hover:bg-gold-glow transition-all duration-300"
          >
            <Plus size={14} /> ADD ROOM
          </button>
        )}
      </div>

      {editing ? (
        <div className="bg-card border border-gold/20 p-8 shadow-frame animate-fade-in">
          <div className="flex items-center justify-between mb-8 border-b border-gold/10 pb-4">
            <h2 className="font-display text-3xl text-foreground">
              {editing.id ? "Edit Room" : "Create New Room"}
            </h2>
            <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-gold transition-colors">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">
                  ROOM NAME (CATEGORY)
                </label>
                <select
                  required
                  value={editing.category_id || ""}
                  onChange={e => setEditing({ ...editing, category_id: e.target.value || null })}
                  className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif text-foreground transition-all duration-300"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">
                  ROOM NUMBER / IDENTIFIER
                </label>
                <input
                  required
                  type="text"
                  value={editing.room_number || ""}
                  onChange={e => setEditing({ ...editing, room_number: e.target.value })}
                  className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif text-foreground transition-all duration-300"
                  placeholder="e.g. 101 or 'Royal Suite A'"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">
                  INITIAL STATUS
                </label>
                <select
                  value={editing.status || "available"}
                  onChange={e => setEditing({ ...editing, status: e.target.value as any })}
                  className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif text-foreground transition-all duration-300"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div>
                <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">
                  SORT ORDER
                </label>
                <input
                  type="number"
                  value={editing.sort_order ?? 0}
                  onChange={e => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                  className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif text-foreground transition-all duration-300"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gold/10 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-gold text-royal-deep font-serif-sc tracking-[0.2em] text-xs px-8 py-3 flex items-center gap-2 hover:bg-gold-glow transition-all duration-300 disabled:opacity-70"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {saving ? "SAVING…" : "SAVE ROOM"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid gap-6">
          {rooms.length === 0 ? (
            <div className="text-center p-12 border border-gold/20 bg-card/50 shadow-frame">
              <BedDouble className="mx-auto text-gold/50 w-12 h-12 mb-4" />
              <h3 className="font-display text-2xl text-foreground mb-2">No Physical Rooms</h3>
              <p className="font-serif text-muted-foreground">Inventory is currently empty.</p>
            </div>
          ) : (
            rooms.map(room => (
              <div key={room.id} className="bg-card border border-gold/20 p-6 flex items-center justify-between hover:shadow-gold transition-all duration-500 group shadow-frame">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-display text-2xl text-foreground group-hover:text-gold transition-colors">{room.room_number}</h3>
                    <span className={`text-[9px] font-serif-sc tracking-widest px-2 py-0.5 border ${
                      room.status === 'available' ? 'bg-green-500/10 text-green-500 border-green-500/30' :
                      room.status === 'occupied' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                      'bg-gold/10 text-gold border-gold/30'
                    }`}>
                      {room.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="font-serif-sc text-[10px] tracking-widest text-muted-foreground">
                    CATEGORY: {categories.find(c => c.id === room.category_id)?.name.toUpperCase() || "UNASSIGNED"}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setEditing(room)} className="p-3 border border-gold/30 text-gold hover:bg-gold hover:text-royal-deep transition-all duration-300">
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
