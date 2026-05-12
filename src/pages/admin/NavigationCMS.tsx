import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Plus, GripVertical, X, Save, Navigation } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

type NavItem = {
  id: string;
  label: string;
  to: string;
};

export default function NavigationCMS() {
  const [navbarItems, setNavbarItems] = useState<NavItem[]>([]);
  const [footerItems, setFooterItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"navbar" | "footer">("navbar");

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("settings").select("*").in("key", ["navbar_items", "footer_links"]);
      if (error) throw error;
      
      const navData = data?.find(d => d.key === "navbar_items")?.value;
      const footData = data?.find(d => d.key === "footer_links")?.value;
      
      if (navData && Array.isArray(navData)) {
        setNavbarItems(navData);
      } else {
        // Fallback default
        setNavbarItems([
          { id: "1", to: "/rooms", label: "Chambers" },
          { id: "2", to: "/dining", label: "Dining" },
          { id: "3", to: "/experiences", label: "Experiences" },
          { id: "4", to: "/stories", label: "Stories" },
          { id: "5", to: "/about", label: "Heritage" },
          { id: "6", to: "/contact", label: "Contact" },
        ]);
      }

      if (footData && Array.isArray(footData)) {
        setFooterItems(footData);
      } else {
        // Fallback default
        setFooterItems([
          { id: "f1", to: "/rooms", label: "CHAMBERS" },
          { id: "f2", to: "/dining", label: "DINING" },
          { id: "f3", to: "/experiences", label: "EXPERIENCES" },
          { id: "f4", to: "/stories", label: "STORIES" },
          { id: "f5", to: "/about", label: "HERITAGE" },
          { id: "f6", to: "/contact", label: "CONTACT" },
          { id: "f7", to: "/booking", label: "RESERVE" },
          { id: "f8", to: "/feedback", label: "GUESTBOOK" },
        ]);
      }
    } catch (error: any) {
      toast.error("Failed to load navigation settings: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [
        { key: "navbar_items", value: navbarItems, category: "navigation" },
        { key: "footer_links", value: footerItems, category: "navigation" }
      ];

      const { error } = await supabase.from("settings").upsert(updates, { onConflict: "key" });
      if (error) throw error;
      toast.success("Navigation links updated successfully.");
    } catch (error: any) {
      toast.error("Failed to save settings: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const isNavbar = activeTab === "navbar";
    const items = isNavbar ? Array.from(navbarItems) : Array.from(footerItems);
    
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    
    if (isNavbar) {
      setNavbarItems(items);
    } else {
      setFooterItems(items);
    }
  };

  const addItem = () => {
    const newItem = { id: Date.now().toString(), label: "New Link", to: "/" };
    if (activeTab === "navbar") {
      setNavbarItems([...navbarItems, newItem]);
    } else {
      setFooterItems([...footerItems, newItem]);
    }
  };

  const updateItem = (id: string, field: "label" | "to", value: string) => {
    if (activeTab === "navbar") {
      setNavbarItems(navbarItems.map(item => item.id === id ? { ...item, [field]: value } : item));
    } else {
      setFooterItems(footerItems.map(item => item.id === id ? { ...item, [field]: value } : item));
    }
  };

  const removeItem = (id: string) => {
    if (activeTab === "navbar") {
      setNavbarItems(navbarItems.filter(item => item.id !== id));
    } else {
      setFooterItems(footerItems.filter(item => item.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="animate-spin text-gold w-10 h-10" />
      </div>
    );
  }

  const currentItems = activeTab === "navbar" ? navbarItems : footerItems;

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-foreground mb-2">Navigation CMS</h1>
          <p className="font-serif text-muted-foreground">Manage header and footer links across the palace website.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-gold text-royal-deep font-serif-sc text-xs tracking-widest hover:bg-gold/80 transition-all duration-300 disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          SAVE NAVIGATION
        </button>
      </div>

      <div className="flex border-b border-gold/10">
        <button
          onClick={() => setActiveTab("navbar")}
          className={`flex items-center gap-2 px-6 py-4 font-serif-sc text-[10px] tracking-widest transition-all relative ${
            activeTab === "navbar" ? "text-gold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Navigation size={14} />
          TOP NAVBAR
          {activeTab === "navbar" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("footer")}
          className={`flex items-center gap-2 px-6 py-4 font-serif-sc text-[10px] tracking-widest transition-all relative ${
            activeTab === "footer" ? "text-gold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Navigation size={14} className="rotate-180" />
          FOOTER LINKS
          {activeTab === "footer" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
          )}
        </button>
      </div>

      <div className="bg-card/30 border border-gold/20 p-8 shadow-frame backdrop-blur-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display text-2xl text-foreground">
            {activeTab === "navbar" ? "Main Navigation Links" : "Footer Navigation Links"}
          </h3>
          <button
            onClick={addItem}
            className="flex items-center gap-2 px-4 py-2 border border-gold/30 text-gold hover:bg-gold/10 font-serif-sc text-[10px] tracking-widest transition-all"
          >
            <Plus size={14} />
            ADD LINK
          </button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="links">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3"
              >
                {currentItems.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="bg-background border border-gold/20 p-4 flex items-center gap-4 group"
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-grab text-muted-foreground hover:text-gold"
                        >
                          <GripVertical size={18} />
                        </div>
                        
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <div>
                            <label className="block font-serif-sc text-[10px] text-muted-foreground mb-1 tracking-widest">LABEL</label>
                            <input
                              type="text"
                              value={item.label}
                              onChange={(e) => updateItem(item.id, "label", e.target.value)}
                              className="w-full bg-transparent border-b border-gold/20 focus:border-gold outline-none py-1 font-serif text-sm text-foreground transition-all"
                              placeholder="e.g. Chambers"
                            />
                          </div>
                          <div>
                            <label className="block font-serif-sc text-[10px] text-muted-foreground mb-1 tracking-widest">URL PATH</label>
                            <input
                              type="text"
                              value={item.to}
                              onChange={(e) => updateItem(item.id, "to", e.target.value)}
                              className="w-full bg-transparent border-b border-gold/20 focus:border-gold outline-none py-1 font-serif text-sm text-foreground transition-all"
                              placeholder="e.g. /rooms"
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-400/50 hover:text-red-400 p-2 transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove link"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}
