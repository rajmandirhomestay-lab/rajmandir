import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { 
  LayoutDashboard, BedDouble, CalendarCheck, Image as ImageIcon, 
  UtensilsCrossed, Compass, BookOpen, Star, MessageSquare, 
  Tag, LayoutTemplate, Settings, LogOut, Navigation, MapPin, Sliders
} from "lucide-react";

const navItems = [
  { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Homepage CMS", path: "/admin/homepage", icon: LayoutTemplate },
  { name: "Rooms Management", path: "/admin/physical-rooms", icon: BedDouble },
  { name: "Room Categories", path: "/admin/room-categories", icon: LayoutTemplate },
  { name: "Gallery CMS", path: "/admin/gallery", icon: ImageIcon },
  { name: "Media Library", path: "/admin/media", icon: ImageIcon },
  { name: "Dining CMS", path: "/admin/dining", icon: UtensilsCrossed },
  { name: "Special Dishes", path: "/admin/dining-dishes", icon: UtensilsCrossed },
  { name: "Experiences", path: "/admin/experiences", icon: Compass },
  { name: "Attractions", path: "/admin/attractions", icon: MapPin },
  { name: "Travel Stories", path: "/admin/stories", icon: BookOpen },
  { name: "Reviews CMS", path: "/admin/reviews", icon: Star },
  { name: "FAQ Management", path: "/admin/faq", icon: MessageSquare },
  { name: "Seasonal Offers", path: "/admin/offers", icon: Tag },
  { name: "Navigation", path: "/admin/navigation", icon: Navigation },
  { name: "Global Settings", path: "/admin/settings", icon: Settings },
  { name: "Slider Settings", path: "/admin/sliders", icon: Sliders },
];

export const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Successfully logged out.");
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card/50 backdrop-blur-md border-r border-gold/20 flex flex-col fixed h-full z-20 shadow-frame">
        <div className="p-6 border-b border-gold/10 text-center">
          <div className="w-10 h-10 mx-auto border border-gold flex items-center justify-center mb-3 bg-gold/5">
            <span className="font-display text-gold text-xl">R</span>
          </div>
          <h2 className="font-serif-sc text-[10px] tracking-widest text-gold">PALACE REGISTRY</h2>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm font-serif-sc tracking-widest transition-all duration-300 border border-transparent ${
                  isActive 
                    ? "bg-gold/10 text-gold border-gold/30 shadow-[inset_0_0_10px_rgba(212,175,55,0.1)]" 
                    : "text-muted-foreground hover:bg-gold/5 hover:text-foreground"
                }`
              }
            >
              <item.icon size={16} className="shrink-0" />
              {item.name.toUpperCase()}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gold/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-serif-sc tracking-widest text-red-400/80 hover:bg-red-900/20 hover:text-red-400 border border-transparent hover:border-red-900/30 transition-all duration-300"
          >
            <LogOut size={16} />
            DEPART
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 relative min-h-screen">
        <div className="absolute inset-0 marble-texture pointer-events-none opacity-50" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
