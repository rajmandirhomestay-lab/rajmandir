import { useState } from "react";
import { Plus, Trash2, Edit, Save, X, GripVertical } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useHomepageAmenities } from "@/lib/api";
import * as LucideIcons from "lucide-react";

export default function AmenitiesCMS() {
  const queryClient = useQueryClient();
  const { data: amenities, isLoading } = useHomepageAmenities();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ icon: "", label: "", description: "", display_order: 0 });
  const [isAdding, setIsAdding] = useState(false);

  // Suggested popular icons for hotel amenities
  const popularIcons = [
    "Wifi", "Coffee", "Car", "Shield", "Crown", "Utensils", "Sun", "Bath", 
    "BookOpen", "Sparkles", "GlassWater", "Monitor", "Dumbbell", "Waves", "Wind", "Key"
  ];

  const handleEdit = (amenity: any) => {
    setEditingId(amenity.id);
    setFormData({ 
      icon: amenity.icon, 
      label: amenity.label, 
      description: amenity.description || "",
      display_order: amenity.display_order
    });
    setIsAdding(false);
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({ icon: "Sparkles", label: "", description: "", display_order: (amenities?.length || 0) + 1 });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
  };

  const handleSave = async () => {
    if (!formData.label || !formData.icon) {
      toast.error("Label and Icon are required");
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from("homepage_amenities")
          .update(formData)
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Amenity updated successfully");
      } else {
        const { error } = await supabase
          .from("homepage_amenities")
          .insert([formData]);
        if (error) throw error;
        toast.success("Amenity added successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["homepage_amenities"] });
      handleCancel();
    } catch (error: any) {
      toast.error("Failed to save: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this amenity?")) return;
    try {
      const { error } = await supabase.from("homepage_amenities").delete().eq("id", id);
      if (error) throw error;
      toast.success("Amenity deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["homepage_amenities"] });
    } catch (error: any) {
      toast.error("Failed to delete: " + error.message);
    }
  };

  if (isLoading) return <div className="p-8 text-gold">Loading amenities...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-foreground mb-2">Homepage Amenities</h1>
          <p className="font-serif text-muted-foreground">Manage the thoughtful comforts displayed on the homepage.</p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20 transition-colors"
          >
            <Plus size={18} /> Add Amenity
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <div className="bg-card border border-gold/30 p-6 shadow-frame">
          <h2 className="font-display text-2xl mb-6">{editingId ? 'Edit Amenity' : 'New Amenity'}</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block font-serif-sc text-xs text-muted-foreground mb-1">LABEL</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full bg-background border border-gold/20 p-3 text-foreground focus:border-gold outline-none"
                  placeholder="e.g. High-Speed WiFi"
                />
              </div>
              <div>
                <label className="block font-serif-sc text-xs text-muted-foreground mb-1">DESCRIPTION</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-background border border-gold/20 p-3 text-foreground focus:border-gold outline-none h-24"
                  placeholder="e.g. Stay connected across the palace grounds"
                />
              </div>
              <div>
                <label className="block font-serif-sc text-xs text-muted-foreground mb-1">DISPLAY ORDER</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full bg-background border border-gold/20 p-3 text-foreground focus:border-gold outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-serif-sc text-xs text-muted-foreground mb-1">ICON IDENTIFIER (Lucide React)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full bg-background border border-gold/20 p-3 text-foreground focus:border-gold outline-none"
                  placeholder="e.g. Wifi, Coffee, Car"
                />
              </div>
              
              <div>
                <label className="block font-serif-sc text-xs text-muted-foreground mb-2">QUICK SELECT ICON</label>
                <div className="flex flex-wrap gap-2">
                  {popularIcons.map((iconName) => {
                    const IconComponent = (LucideIcons as any)[iconName];
                    return (
                      <button
                        key={iconName}
                        onClick={() => setFormData({ ...formData, icon: iconName })}
                        className={`p-3 border transition-colors ${
                          formData.icon === iconName 
                            ? "bg-gold/20 border-gold text-gold" 
                            : "bg-background border-gold/20 text-muted-foreground hover:border-gold/50"
                        }`}
                        title={iconName}
                        type="button"
                      >
                        {IconComponent && <IconComponent size={20} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-gold text-royal-deep hover:shadow-gold transition-all"
            >
              <Save size={18} /> Save Amenity
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-6 py-2 border border-gold/30 text-gold hover:bg-gold/10 transition-all"
            >
              <X size={18} /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {amenities?.length === 0 ? (
          <div className="text-center p-12 border border-gold/20 text-muted-foreground font-serif italic">
            No amenities added yet. Click "Add Amenity" to start.
          </div>
        ) : (
          amenities?.map((amenity) => {
            const IconComponent = (LucideIcons as any)[amenity.icon] || LucideIcons.Sparkles;
            
            return (
              <div 
                key={amenity.id} 
                className="flex items-center gap-6 p-4 bg-card border border-gold/20 hover:border-gold/50 transition-colors"
              >
                <div className="text-gold/50 cursor-move">
                  <GripVertical size={24} />
                </div>
                
                <div className="w-12 h-12 bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                  {IconComponent && <IconComponent size={24} />}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-display text-xl text-foreground">{amenity.label}</h3>
                  <p className="font-serif italic text-muted-foreground text-sm line-clamp-1">{amenity.description}</p>
                </div>
                
                <div className="flex items-center gap-6 font-serif-sc text-xs text-muted-foreground">
                  <span>ORDER: {amenity.display_order}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(amenity)}
                      className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(amenity.id)}
                      className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
