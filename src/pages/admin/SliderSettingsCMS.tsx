import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Save, Settings2 } from "lucide-react";

type SliderSettings = {
  id: string;
  section_name: string;
  slide_speed: number;
  transition_type: string;
  autoplay: boolean;
  pause_on_hover: boolean;
  show_dots: boolean;
  show_arrows: boolean;
  loop: boolean;
  easing: string;
};

const SECTIONS = ["experiences", "stories", "attractions", "dining", "gallery"];

export default function SliderSettingsCMS() {
  const [settings, setSettings] = useState<Record<string, SliderSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from("slider_settings").select("*");
      if (error) throw error;

      const settingsMap: Record<string, SliderSettings> = {};
      data?.forEach((s: SliderSettings) => {
        settingsMap[s.section_name] = s;
      });

      // Fill in defaults for missing sections
      SECTIONS.forEach(section => {
        if (!settingsMap[section]) {
          settingsMap[section] = {
            id: "",
            section_name: section,
            slide_speed: 5000,
            transition_type: "slide",
            autoplay: true,
            pause_on_hover: true,
            show_dots: true,
            show_arrows: true,
            loop: true,
            easing: "ease-in-out"
          };
        }
      });

      setSettings(settingsMap);
    } catch (error: any) {
      toast.error("Failed to load settings: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section: string, field: keyof SliderSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async (section: string) => {
    setSaving(section);
    try {
      const dataToSave = { ...settings[section] };
      // remove id if it's empty to allow insert
      if (!dataToSave.id) {
        delete (dataToSave as any).id;
      }

      const { data, error } = await supabase
        .from("slider_settings")
        .upsert([dataToSave], { onConflict: "section_name" })
        .select()
        .single();

      if (error) throw error;

      setSettings(prev => ({
        ...prev,
        [section]: data
      }));

      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} slider settings updated dynamically.`);
    } catch (error: any) {
      toast.error("Failed to save settings: " + error.message);
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <div className="flex justify-center h-[50vh] items-center"><Loader2 className="animate-spin text-gold w-10 h-10" /></div>;

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      <div className="flex items-center justify-between border-b border-gold/10 pb-6">
        <div>
          <h1 className="font-display text-4xl mb-2 flex items-center gap-4">
            <Settings2 className="text-gold" size={32} />
            Global Slider Settings
          </h1>
          <p className="font-serif text-muted-foreground">Manage cinematic slider transitions, speeds, and behavior globally.</p>
        </div>
      </div>

      <div className="space-y-12">
        {SECTIONS.map(section => (
          <div key={section} className="bg-card border border-gold/20 shadow-frame p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gold/10">
               <h2 className="font-display text-3xl capitalize text-gold">{section} Sliders</h2>
               <button 
                 onClick={() => handleSave(section)} 
                 disabled={saving === section}
                 className="bg-gold text-royal-deep font-serif-sc text-xs px-8 py-3 flex items-center gap-2 hover:shadow-gold transition-all duration-300"
               >
                 {saving === section ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
                 UPDATE LIVE
               </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
               <div className="space-y-6 lg:col-span-1">
                  <div>
                    <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">TRANSITION TYPE</label>
                    <select 
                      value={settings[section].transition_type} 
                      onChange={e => handleChange(section, "transition_type", e.target.value)}
                      className="w-full bg-background border border-gold/20 focus:border-gold px-4 py-3 font-serif outline-none appearance-none cursor-pointer"
                    >
                       <option value="slide">Slide (Horizontal)</option>
                       <option value="fade">Fade (Cinematic)</option>
                       <option value="zoom">Zoom (Immersive)</option>
                       <option value="parallax">Parallax (Depth)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2 flex justify-between">
                       <span>SLIDE SPEED (Duration)</span>
                       <span className="text-gold">{settings[section].slide_speed / 1000}s</span>
                    </label>
                    <input 
                      type="range" 
                      min="2000" 
                      max="15000" 
                      step="500" 
                      value={settings[section].slide_speed} 
                      onChange={e => handleChange(section, "slide_speed", parseInt(e.target.value))}
                      className="w-full accent-gold cursor-pointer" 
                    />
                  </div>
                  <div>
                    <label className="font-serif-sc text-[10px] tracking-widest text-muted-foreground block mb-2">EASING</label>
                    <select 
                      value={settings[section].easing} 
                      onChange={e => handleChange(section, "easing", e.target.value)}
                      className="w-full bg-background border border-gold/20 focus:border-gold px-4 py-3 font-serif outline-none appearance-none cursor-pointer"
                    >
                       <option value="ease-in-out">Smooth (Ease In Out)</option>
                       <option value="linear">Linear (Constant)</option>
                       <option value="ease-out">Decelerate (Ease Out)</option>
                    </select>
                  </div>
               </div>

               <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6 bg-background/50 p-6 border border-gold/10">
                  <label className="flex items-center justify-between p-4 border border-gold/10 hover:border-gold/30 cursor-pointer transition-colors bg-card">
                     <span className="font-serif-sc text-[11px] tracking-widest">AUTOPLAY</span>
                     <input type="checkbox" checked={settings[section].autoplay} onChange={e => handleChange(section, "autoplay", e.target.checked)} className="w-5 h-5 accent-gold" />
                  </label>
                  <label className="flex items-center justify-between p-4 border border-gold/10 hover:border-gold/30 cursor-pointer transition-colors bg-card">
                     <span className="font-serif-sc text-[11px] tracking-widest">PAUSE ON HOVER</span>
                     <input type="checkbox" checked={settings[section].pause_on_hover} onChange={e => handleChange(section, "pause_on_hover", e.target.checked)} className="w-5 h-5 accent-gold" />
                  </label>
                  <label className="flex items-center justify-between p-4 border border-gold/10 hover:border-gold/30 cursor-pointer transition-colors bg-card">
                     <span className="font-serif-sc text-[11px] tracking-widest">SHOW DOTS</span>
                     <input type="checkbox" checked={settings[section].show_dots} onChange={e => handleChange(section, "show_dots", e.target.checked)} className="w-5 h-5 accent-gold" />
                  </label>
                  <label className="flex items-center justify-between p-4 border border-gold/10 hover:border-gold/30 cursor-pointer transition-colors bg-card">
                     <span className="font-serif-sc text-[11px] tracking-widest">SHOW ARROWS</span>
                     <input type="checkbox" checked={settings[section].show_arrows} onChange={e => handleChange(section, "show_arrows", e.target.checked)} className="w-5 h-5 accent-gold" />
                  </label>
                  <label className="flex items-center justify-between p-4 border border-gold/10 hover:border-gold/30 cursor-pointer transition-colors bg-card sm:col-span-2">
                     <span className="font-serif-sc text-[11px] tracking-widest">INFINITE LOOP</span>
                     <input type="checkbox" checked={settings[section].loop} onChange={e => handleChange(section, "loop", e.target.checked)} className="w-5 h-5 accent-gold" />
                  </label>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
