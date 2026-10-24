import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Save, Globe, Phone, MapPin, Mail, Share2, Palette, Check, Sparkles, Plus, RefreshCw, UploadCloud, Image as ImageIcon, Play, RotateCcw, Type } from "lucide-react";
import { PRESET_THEMES, ThemeConfig, applyThemeToDOM } from "@/lib/theme";
import { compressImage } from "@/lib/imageCompression";

type Settings = {
  id: string;
  key: string;
  value: any;
  category: string;
};

export default function SettingsCMS() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("theme");
  const [curtainPreviewOpen, setCurtainPreviewOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeConfig>(PRESET_THEMES[0]);
  const [customTheme, setCustomTheme] = useState<ThemeConfig>({
    id: "custom",
    name: "Custom Created Theme",
    background: "#faf6f0",
    foreground: "#091a28",
    card: "#ffffff",
    cardFg: "#091a28",
    primary: "#145992",
    gold: "#b45309",
    isCustom: true,
  });

  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    const toastId = toast.loading("Uploading logo image...");
    try {
      const optimized = await compressImage(file);
      const fileName = `logo-${Date.now()}.${optimized.name.split('.').pop() || 'webp'}`;
      const filePath = `settings/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('content')
        .upload(filePath, optimized, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('content')
        .getPublicUrl(filePath);

      handleUpdate("site_logo", publicUrl);
      toast.success("Logo uploaded successfully! Click 'SAVE ALL CHANGES' to save.", { id: toastId });
    } catch (error: any) {
      toast.error("Failed to upload logo: " + error.message, { id: toastId });
    } finally {
      setUploadingLogo(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("settings").select("*");
      if (error) throw error;
      
      const settingsMap: Record<string, any> = {};
      data?.forEach((s) => {
        settingsMap[s.key] = s.value;
      });
      setSettings(settingsMap);

      if (settingsMap.theme_config) {
        setSelectedTheme(settingsMap.theme_config);
        if (settingsMap.theme_config.id === "custom" || settingsMap.theme_config.isCustom) {
          setCustomTheme(settingsMap.theme_config);
        }
        applyThemeToDOM(settingsMap.theme_config);
      }
    } catch (error: any) {
      toast.error("Failed to load settings: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectPresetTheme = (theme: ThemeConfig) => {
    setSelectedTheme(theme);
    handleUpdate("theme_config", theme);
    applyThemeToDOM(theme);
    toast.success(`Theme "${theme.name}" selected. Click "SAVE ALL CHANGES" to apply globally.`);
  };

  const handleCustomThemeChange = (field: keyof ThemeConfig, val: string) => {
    const updated = { ...customTheme, [field]: val, id: "custom", isCustom: true };
    setCustomTheme(updated);
    setSelectedTheme(updated);
    handleUpdate("theme_config", updated);
    applyThemeToDOM(updated);
  };

  const handleThemeFieldChange = (field: keyof ThemeConfig, val: string) => {
    const updated = { ...selectedTheme, [field]: val };
    setSelectedTheme(updated);
    if (updated.id === "custom" || updated.isCustom) {
      setCustomTheme(updated);
    }
    handleUpdate("theme_config", updated);
    applyThemeToDOM(updated);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
      }));

      const { error } = await supabase.from("settings").upsert(updates, { onConflict: "key" });
      if (error) throw error;
      toast.success("Royal theme & settings saved successfully!");
    } catch (error: any) {
      toast.error("Failed to save settings: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="animate-spin text-gold w-10 h-10" />
      </div>
    );
  }

  const tabs = [
    { id: "theme", label: "THEME & COLORS", icon: Palette },
    { id: "curtain", label: "CURTAIN OPENER", icon: Sparkles },
    { id: "general", label: "GENERAL", icon: Globe },
    { id: "contact", label: "CONTACT", icon: Phone },
    { id: "social", label: "SOCIAL", icon: Share2 },
    { id: "financials", label: "FINANCIALS", icon: Palette },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-foreground mb-2">Global Settings</h1>
          <p className="font-serif text-muted-foreground">Manage your palace's digital identity and active color theme.</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-gold text-royal-deep font-serif-sc text-xs tracking-widest hover:bg-gold-glow transition-all duration-300 disabled:opacity-50 font-bold shadow-gold"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          SAVE ALL CHANGES
        </button>
      </div>

      <div className="flex border-b border-gold/10 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 font-serif-sc text-[10px] tracking-widest transition-all relative shrink-0 ${
              activeTab === tab.id ? "text-gold font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
            )}
          </button>
        ))}
      </div>

      <div className="bg-card border border-gold/20 p-8 shadow-frame backdrop-blur-sm">
        {activeTab === "theme" && (
          <div className="space-y-10">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-2xl text-foreground">Global Color Themes</h3>
                  <p className="font-serif text-sm text-muted-foreground mt-1">Select from 10 luxury theme presets or create your custom palette.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 rounded-sm">
                  <Sparkles className="text-gold" size={14} />
                  <span className="font-serif-sc text-xs text-gold font-bold">ACTIVE: {selectedTheme.name.toUpperCase()}</span>
                </div>
              </div>

              {/* 10 Theme Presets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-6">
                {PRESET_THEMES.map((theme) => {
                  const isSelected = selectedTheme.id === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => handleSelectPresetTheme(theme)}
                      className={`cursor-pointer p-4 rounded-sm border transition-all duration-300 flex flex-col justify-between relative group ${
                        isSelected
                          ? "border-gold ring-2 ring-gold/40 shadow-gold scale-[1.02]"
                          : "border-gold/20 hover:border-gold/60 hover:scale-[1.01]"
                      }`}
                      style={{ backgroundColor: theme.background, color: theme.foreground }}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gold text-royal-deep flex items-center justify-center shadow-md">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                      <div>
                        <div className="font-serif-sc text-[10px] tracking-widest font-bold mb-3 uppercase" style={{ color: theme.primary }}>
                          {theme.name}
                        </div>
                        <div className="font-display text-base font-bold mb-2">
                          Raj Mandir
                        </div>
                        <p className="font-serif text-[11px] opacity-80 line-clamp-2 italic mb-4">
                          Heritage hospitality in Jodhpur.
                        </p>
                      </div>

                      {/* Color Swatch Bar */}
                      <div className="flex items-center gap-1.5 pt-3 border-t border-black/10 dark:border-white/10">
                        <span className="w-5 h-5 rounded-full border border-black/20 shadow-sm" style={{ backgroundColor: theme.background }} title="Background" />
                        <span className="w-5 h-5 rounded-full border border-black/20 shadow-sm" style={{ backgroundColor: theme.foreground }} title="Text Color" />
                        <span className="w-5 h-5 rounded-full border border-black/20 shadow-sm" style={{ backgroundColor: theme.primary }} title="Primary Accent" />
                        <span className="w-5 h-5 rounded-full border border-black/20 shadow-sm" style={{ backgroundColor: theme.gold }} title="Gold Accent" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Theme Builder Section */}
            <div className="border-t border-gold/20 pt-8 mt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="font-display text-2xl text-foreground">Create Your Own Custom Theme</h3>
                  <p className="font-serif text-xs text-muted-foreground">Customize exact background, text, primary, card, and gold accent colors with live preview.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 bg-background/50 border border-gold/20 p-6 rounded-sm">
                <div className="space-y-4">
                  <label className="block font-serif-sc text-[10px] tracking-widest text-gold font-bold">BACKGROUND COLOR</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={customTheme.background}
                      onChange={(e) => handleCustomThemeChange("background", e.target.value)}
                      className="w-10 h-10 rounded border border-gold/30 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={customTheme.background}
                      onChange={(e) => handleCustomThemeChange("background", e.target.value)}
                      className="flex-1 bg-background border border-gold/20 px-3 py-2 text-xs font-mono text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block font-serif-sc text-[10px] tracking-widest text-gold font-bold">TEXT / FOREGROUND COLOR</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={customTheme.foreground}
                      onChange={(e) => handleCustomThemeChange("foreground", e.target.value)}
                      className="w-10 h-10 rounded border border-gold/30 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={customTheme.foreground}
                      onChange={(e) => handleCustomThemeChange("foreground", e.target.value)}
                      className="flex-1 bg-background border border-gold/20 px-3 py-2 text-xs font-mono text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block font-serif-sc text-[10px] tracking-widest text-gold font-bold">PRIMARY ACCENT COLOR</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={customTheme.primary}
                      onChange={(e) => handleCustomThemeChange("primary", e.target.value)}
                      className="w-10 h-10 rounded border border-gold/30 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={customTheme.primary}
                      onChange={(e) => handleCustomThemeChange("primary", e.target.value)}
                      className="flex-1 bg-background border border-gold/20 px-3 py-2 text-xs font-mono text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block font-serif-sc text-[10px] tracking-widest text-gold font-bold">CARD BACKGROUND</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={customTheme.card}
                      onChange={(e) => handleCustomThemeChange("card", e.target.value)}
                      className="w-10 h-10 rounded border border-gold/30 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={customTheme.card}
                      onChange={(e) => handleCustomThemeChange("card", e.target.value)}
                      className="flex-1 bg-background border border-gold/20 px-3 py-2 text-xs font-mono text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block font-serif-sc text-[10px] tracking-widest text-gold font-bold">CARD TEXT COLOR</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={customTheme.cardFg}
                      onChange={(e) => handleCustomThemeChange("cardFg", e.target.value)}
                      className="w-10 h-10 rounded border border-gold/30 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={customTheme.cardFg}
                      onChange={(e) => handleCustomThemeChange("cardFg", e.target.value)}
                      className="flex-1 bg-background border border-gold/20 px-3 py-2 text-xs font-mono text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block font-serif-sc text-[10px] tracking-widest text-gold font-bold">GOLD ACCENT COLOR</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={customTheme.gold}
                      onChange={(e) => handleCustomThemeChange("gold", e.target.value)}
                      className="w-10 h-10 rounded border border-gold/30 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={customTheme.gold}
                      onChange={(e) => handleCustomThemeChange("gold", e.target.value)}
                      className="flex-1 bg-background border border-gold/20 px-3 py-2 text-xs font-mono text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Custom Theme Preview Box */}
              <div className="mt-6 p-6 rounded-sm border" style={{ backgroundColor: customTheme.background, color: customTheme.foreground, borderColor: customTheme.gold }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="font-serif-sc text-xs tracking-widest font-bold" style={{ color: customTheme.gold }}>LIVE CUSTOM THEME PREVIEW</div>
                  <button
                    onClick={() => handleSelectPresetTheme(customTheme)}
                    className="px-4 py-1.5 font-serif-sc text-[10px] tracking-widest font-bold border rounded-sm"
                    style={{ backgroundColor: customTheme.primary, color: '#ffffff', borderColor: customTheme.gold }}
                  >
                    ACTIVATE CUSTOM THEME
                  </button>
                </div>
                <h4 className="font-display text-3xl mb-2" style={{ color: customTheme.foreground }}>The Raj Mandir Palace</h4>
                <p className="font-serif italic text-base mb-4" style={{ color: customTheme.foreground, opacity: 0.85 }}>Experience bespoke Rajasthani luxury carved in stone.</p>
                <div className="p-4 rounded-sm border" style={{ backgroundColor: customTheme.card, color: customTheme.cardFg, borderColor: customTheme.gold }}>
                  <div className="font-serif-sc text-xs font-bold mb-1" style={{ color: customTheme.primary }}>PREVIEW CARD</div>
                  <div className="font-serif text-sm">Cards and interactive components render with this background and copy contrast.</div>
                </div>
              </div>
            </div>

            {/* Navbar & Footer Color Customization Section */}
            <div className="border-t border-gold/20 pt-8 mt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                  <Palette size={18} />
                </div>
                <div>
                  <h3 className="font-display text-2xl text-foreground">Navbar & Footer Color Customization</h3>
                  <p className="font-serif text-xs text-muted-foreground">Customize background and text colors for the Navigation Bar and Footer across the website.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 bg-background/50 border border-gold/20 p-6 rounded-sm">
                <div className="space-y-4">
                  <label className="block font-serif-sc text-[10px] tracking-widest text-gold font-bold">NAVBAR BACKGROUND</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={selectedTheme.navbarBg || "#091a28"}
                      onChange={(e) => handleThemeFieldChange("navbarBg", e.target.value)}
                      className="w-10 h-10 rounded border border-gold/30 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={selectedTheme.navbarBg || "#091a28"}
                      onChange={(e) => handleThemeFieldChange("navbarBg", e.target.value)}
                      className="flex-1 bg-background border border-gold/20 px-3 py-2 text-xs font-mono text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block font-serif-sc text-[10px] tracking-widest text-gold font-bold">NAVBAR TEXT / LINKS</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={selectedTheme.navbarFg || "#ffffff"}
                      onChange={(e) => handleThemeFieldChange("navbarFg", e.target.value)}
                      className="w-10 h-10 rounded border border-gold/30 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={selectedTheme.navbarFg || "#ffffff"}
                      onChange={(e) => handleThemeFieldChange("navbarFg", e.target.value)}
                      className="flex-1 bg-background border border-gold/20 px-3 py-2 text-xs font-mono text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block font-serif-sc text-[10px] tracking-widest text-gold font-bold">FOOTER BACKGROUND</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={selectedTheme.footerBg || "#091a28"}
                      onChange={(e) => handleThemeFieldChange("footerBg", e.target.value)}
                      className="w-10 h-10 rounded border border-gold/30 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={selectedTheme.footerBg || "#091a28"}
                      onChange={(e) => handleThemeFieldChange("footerBg", e.target.value)}
                      className="flex-1 bg-background border border-gold/20 px-3 py-2 text-xs font-mono text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block font-serif-sc text-[10px] tracking-widest text-gold font-bold">FOOTER TEXT / LINKS</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={selectedTheme.footerFg || "#ffffff"}
                      onChange={(e) => handleThemeFieldChange("footerFg", e.target.value)}
                      className="w-10 h-10 rounded border border-gold/30 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={selectedTheme.footerFg || "#ffffff"}
                      onChange={(e) => handleThemeFieldChange("footerFg", e.target.value)}
                      className="flex-1 bg-background border border-gold/20 px-3 py-2 text-xs font-mono text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview for Navbar & Footer */}
              <div className="mt-6 pt-6 border-t border-gold/15 space-y-3">
                <span className="block font-serif-sc text-xs tracking-widest text-gold font-bold">
                  LIVE PREVIEW: NAVBAR & FOOTER COLORS
                </span>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Navbar Preview */}
                  <div 
                    className="p-4 rounded-sm border border-gold/20 flex items-center justify-between shadow-sm"
                    style={{ backgroundColor: selectedTheme.navbarBg || "#091a28", color: selectedTheme.navbarFg || "#ffffff" }}
                  >
                    <div className="font-display font-bold text-sm" style={{ color: selectedTheme.navbarFg || "#ffffff" }}>
                      RAJ MANDIR
                    </div>
                    <div className="flex gap-3 font-serif-sc text-[10px] tracking-wider" style={{ color: selectedTheme.navbarFg || "#ffffff" }}>
                      <span className="opacity-90">CHAMBERS</span>
                      <span className="opacity-90">DINING</span>
                      <span className="opacity-90">CONTACT</span>
                    </div>
                  </div>

                  {/* Footer Preview */}
                  <div 
                    className="p-4 rounded-sm border border-gold/20 text-center space-y-1.5 shadow-sm"
                    style={{ backgroundColor: selectedTheme.footerBg || "#091a28", color: selectedTheme.footerFg || "#ffffff" }}
                  >
                    <div className="font-display font-bold text-base" style={{ color: selectedTheme.footerFg || "#ffffff" }}>
                      The Raj Mandir
                    </div>
                    <div className="font-serif-sc text-[9px] tracking-widest" style={{ color: selectedTheme.footerFg || "#ffffff", opacity: 0.85 }}>
                      JODHPUR · EST. 1894
                    </div>
                    <div className="flex justify-center gap-2 font-serif-sc text-[9px] tracking-wider" style={{ color: selectedTheme.footerFg || "#ffffff" }}>
                      <span>CHAMBERS</span>·<span>DINING</span>·<span>CONTACT</span>·<span>RESERVE</span>
                    </div>
                    <div className="text-[9px] font-serif italic" style={{ color: selectedTheme.footerFg || "#ffffff", opacity: 0.8 }}>
                      Old City, near Mehrangarh Fort · Reservations at +91 291 000 0000
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Link Banner to Curtain Customization */}
            <div className="border-t border-gold/20 pt-8 mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-background/40 border border-gold/15 p-6 rounded-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shrink-0">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="font-display text-lg text-foreground">Royal Entrance Curtain Opener</h4>
                  <p className="font-serif text-xs text-muted-foreground">Customize curtain opening animation, fabric color, edge trim, typography and ceremony texts.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("curtain")}
                className="px-5 py-2.5 bg-gold/10 hover:bg-gold/20 border border-gold/40 text-gold font-serif-sc text-xs tracking-widest font-bold transition-all shrink-0"
              >
                CUSTOMIZE CURTAIN →
              </button>
            </div>
          </div>
        )}

        {/* Curtain Opener Customization Tab */}
        {activeTab === "curtain" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-display text-2xl text-foreground">Royal Entrance Curtain Opener</h3>
                  <p className="font-serif text-xs text-muted-foreground">
                    Customize the grand opening curtain animation, fabric colors, edge trims, and ceremony texts.
                  </p>
                </div>
              </div>

              {/* Curtain Animation Enabled Toggle */}
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-background/60 border border-gold/20 rounded-sm">
                <input
                  type="checkbox"
                  checked={settings.curtain_enabled !== false}
                  onChange={(e) => handleUpdate("curtain_enabled", e.target.checked)}
                  className="w-4 h-4 accent-gold cursor-pointer"
                />
                <span className="font-serif-sc text-xs tracking-wider text-foreground font-bold">
                  {settings.curtain_enabled !== false ? "CURTAIN ANIMATION ENABLED" : "CURTAIN DISABLED"}
                </span>
              </label>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column: Form Controls */}
              <div className="space-y-6">
                {/* 1. Curtain Colors */}
                <div className="p-6 bg-background/50 border border-gold/20 rounded-sm space-y-5">
                  <h4 className="font-serif-sc text-xs tracking-widest text-gold font-bold flex items-center gap-2">
                    <Palette size={14} /> CURTAIN FABRIC & EDGE ACCENT COLORS
                  </h4>

                  {/* Curtain Fabric Color */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-serif-sc text-[10px] tracking-widest text-foreground font-bold">
                        FABRIC BACKGROUND COLOR
                      </label>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {settings.curtain_bg_color || "#3d1a0c"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.curtain_bg_color || "#3d1a0c"}
                        onChange={(e) => handleUpdate("curtain_bg_color", e.target.value)}
                        className="w-10 h-10 rounded border border-gold/30 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={settings.curtain_bg_color || "#3d1a0c"}
                        onChange={(e) => handleUpdate("curtain_bg_color", e.target.value)}
                        placeholder="#3d1a0c"
                        className="flex-1 bg-background border border-gold/20 px-3 py-2 text-xs font-mono text-foreground"
                      />
                    </div>
                    {/* Quick Swatches */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <span className="text-[10px] font-serif text-muted-foreground mr-1">Palace Presets:</span>
                      {[
                        { name: "Royal Ochre", color: "#3d1a0c" },
                        { name: "Maroon Crimson", color: "#4a0e17" },
                        { name: "Midnight Navy", color: "#091a28" },
                        { name: "Emerald Forest", color: "#0d2e1f" },
                        { name: "Velvet Obsidian", color: "#141416" },
                      ].map((swatch) => (
                        <button
                          key={swatch.color}
                          type="button"
                          onClick={() => handleUpdate("curtain_bg_color", swatch.color)}
                          className="px-2 py-1 text-[10px] font-serif rounded-sm border border-gold/30 hover:border-gold transition-all flex items-center gap-1.5 bg-background"
                          title={swatch.name}
                        >
                          <span className="w-2.5 h-2.5 rounded-full inline-block border border-black/40" style={{ backgroundColor: swatch.color }} />
                          {swatch.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Curtain Edge Color */}
                  <div className="space-y-3 pt-3 border-t border-gold/10">
                    <div className="flex items-center justify-between">
                      <label className="font-serif-sc text-[10px] tracking-widest text-foreground font-bold">
                        EDGE TRIM ACCENT COLOR
                      </label>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {settings.curtain_edge_color || "#d4af37"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.curtain_edge_color || "#d4af37"}
                        onChange={(e) => handleUpdate("curtain_edge_color", e.target.value)}
                        className="w-10 h-10 rounded border border-gold/30 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={settings.curtain_edge_color || "#d4af37"}
                        onChange={(e) => handleUpdate("curtain_edge_color", e.target.value)}
                        placeholder="#d4af37"
                        className="flex-1 bg-background border border-gold/20 px-3 py-2 text-xs font-mono text-foreground"
                      />
                    </div>
                    {/* Quick Swatches for Edge */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <span className="text-[10px] font-serif text-muted-foreground mr-1">Trim Presets:</span>
                      {[
                        { name: "Royal Gold", color: "#d4af37" },
                        { name: "Sunset Amber", color: "#c45b0a" },
                        { name: "Champagne", color: "#e6be8a" },
                        { name: "Palace Silver", color: "#e2e8f0" },
                      ].map((swatch) => (
                        <button
                          key={swatch.color}
                          type="button"
                          onClick={() => handleUpdate("curtain_edge_color", swatch.color)}
                          className="px-2 py-1 text-[10px] font-serif rounded-sm border border-gold/30 hover:border-gold transition-all flex items-center gap-1.5 bg-background"
                          title={swatch.name}
                        >
                          <span className="w-2.5 h-2.5 rounded-full inline-block border border-black/40" style={{ backgroundColor: swatch.color }} />
                          {swatch.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Curtain Typography & Content */}
                <div className="p-6 bg-background/50 border border-gold/20 rounded-sm space-y-5">
                  <h4 className="font-serif-sc text-xs tracking-widest text-gold font-bold flex items-center gap-2">
                    <Type size={14} /> CURTAIN TYPOGRAPHY & TEXT CUSTOMIZATION
                  </h4>

                  {/* Main Title */}
                  <div className="space-y-3">
                    <label className="font-serif-sc text-[10px] tracking-widest text-foreground font-bold">
                      MAIN TITLE TEXT
                    </label>
                    <input
                      type="text"
                      value={settings.curtain_title_text ?? "Raj Mandir"}
                      onChange={(e) => handleUpdate("curtain_title_text", e.target.value)}
                      placeholder="Raj Mandir"
                      className="w-full bg-background border border-gold/20 px-4 py-2.5 text-sm font-serif text-foreground outline-none focus:border-gold transition-all"
                    />

                    {/* Main Title Color */}
                    <div className="pt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-serif-sc text-[10px] tracking-widest text-foreground font-bold">
                          MAIN TITLE COLOR
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdate("curtain_title_color", "");
                            handleUpdate("curtain_text_color", "");
                          }}
                          className={`text-[10px] font-serif-sc tracking-wider px-2 py-0.5 rounded border transition-all ${
                            !settings.curtain_title_color && !settings.curtain_text_color
                              ? "bg-gold/20 border-gold text-gold font-bold"
                              : "border-gold/20 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          USE ROYAL GOLD GRADIENT (DEFAULT)
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={settings.curtain_title_color || settings.curtain_text_color || "#d4af37"}
                          onChange={(e) => {
                            handleUpdate("curtain_title_color", e.target.value);
                            handleUpdate("curtain_text_color", e.target.value);
                          }}
                          className="w-10 h-10 rounded border border-gold/30 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={settings.curtain_title_color || settings.curtain_text_color || ""}
                          onChange={(e) => {
                            handleUpdate("curtain_title_color", e.target.value);
                            handleUpdate("curtain_text_color", e.target.value);
                          }}
                          placeholder="Leave empty for Royal Gold gradient, or enter #hex"
                          className="flex-1 bg-background border border-gold/20 px-3 py-2 text-xs font-mono text-foreground"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Eyebrow Text & Color */}
                  <div className="space-y-3 pt-3 border-t border-gold/10">
                    <label className="font-serif-sc text-[10px] tracking-widest text-foreground font-bold">
                      EYEBROW BADGE TEXT
                    </label>
                    <input
                      type="text"
                      value={settings.curtain_eyebrow_text ?? "★ PADHARO MHARE DESH ★"}
                      onChange={(e) => handleUpdate("curtain_eyebrow_text", e.target.value)}
                      placeholder="★ PADHARO MHARE DESH ★"
                      className="w-full bg-background border border-gold/20 px-4 py-2.5 text-xs font-mono text-foreground outline-none focus:border-gold transition-all"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <label className="font-serif-sc text-[10px] tracking-widest text-foreground font-bold">
                        EYEBROW TEXT COLOR
                      </label>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {settings.curtain_eyebrow_color || "#e67e22"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.curtain_eyebrow_color || "#e67e22"}
                        onChange={(e) => handleUpdate("curtain_eyebrow_color", e.target.value)}
                        className="w-10 h-10 rounded border border-gold/30 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={settings.curtain_eyebrow_color || "#e67e22"}
                        onChange={(e) => handleUpdate("curtain_eyebrow_color", e.target.value)}
                        placeholder="#e67e22"
                        className="flex-1 bg-background border border-gold/20 px-3 py-2 text-xs font-mono text-foreground"
                      />
                    </div>
                  </div>

                  {/* Subtitle Text & Color */}
                  <div className="space-y-3 pt-3 border-t border-gold/10">
                    <label className="font-serif-sc text-[10px] tracking-widest text-foreground font-bold">
                      SUBTITLE TEXT
                    </label>
                    <input
                      type="text"
                      value={settings.curtain_subtitle_text ?? "— a palace awakens —"}
                      onChange={(e) => handleUpdate("curtain_subtitle_text", e.target.value)}
                      placeholder="— a palace awakens —"
                      className="w-full bg-background border border-gold/20 px-4 py-2.5 text-xs font-serif italic text-foreground outline-none focus:border-gold transition-all"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <label className="font-serif-sc text-[10px] tracking-widest text-foreground font-bold">
                        SUBTITLE TEXT COLOR
                      </label>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {settings.curtain_subtitle_color || "#faf6f0"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.curtain_subtitle_color || "#faf6f0"}
                        onChange={(e) => handleUpdate("curtain_subtitle_color", e.target.value)}
                        className="w-10 h-10 rounded border border-gold/30 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={settings.curtain_subtitle_color || "#faf6f0"}
                        onChange={(e) => handleUpdate("curtain_subtitle_color", e.target.value)}
                        placeholder="#faf6f0"
                        className="flex-1 bg-background border border-gold/20 px-3 py-2 text-xs font-mono text-foreground"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Interactive Mockup & Test */}
              <div className="space-y-6">
                <div className="p-6 bg-background/50 border border-gold/20 rounded-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif-sc text-xs tracking-widest text-gold font-bold flex items-center gap-2">
                      <Sparkles size={14} /> LIVE CURTAIN OPENER PREVIEW
                    </h4>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCurtainPreviewOpen(!curtainPreviewOpen)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/15 hover:bg-gold/25 border border-gold/40 text-gold font-serif-sc text-[10px] tracking-wider rounded-sm transition-all font-bold"
                      >
                        <Play size={12} className={curtainPreviewOpen ? "rotate-90" : ""} />
                        {curtainPreviewOpen ? "CLOSE CURTAIN" : "TEST OPENING ANIMATION"}
                      </button>
                    </div>
                  </div>

                  {/* Stage Container */}
                  <div className="relative h-80 rounded-sm overflow-hidden border border-gold/30 shadow-2xl bg-royal-deep flex items-center justify-center select-none">
                    {/* Background Palace Reveal when curtain opens */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-radial-vignette">
                      <div className="w-14 h-14 rounded-full border border-gold/40 flex items-center justify-center mb-3 bg-gold/10 text-gold">
                        <Sparkles size={24} />
                      </div>
                      <h5 className="font-display text-2xl text-ivory mb-1">Palace Homepage Revealed</h5>
                      <p className="font-serif text-xs text-ivory/80 max-w-xs">
                        Mehrangarh views, royal suites & bespoke Rajasthani hospitality.
                      </p>
                    </div>

                    {/* Centered Typography (fades when opened) */}
                    <div
                      className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 transition-all duration-700 ease-out pointer-events-none"
                      style={{
                        opacity: curtainPreviewOpen ? 0 : 1,
                        transform: curtainPreviewOpen ? "scale(0.9) translateY(10px)" : "scale(1) translateY(0)",
                      }}
                    >
                      <div
                        className="font-serif-sc tracking-[0.35em] text-[10px] md:text-xs mb-3 font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                        style={{ color: settings.curtain_eyebrow_color || "#e67e22" }}
                      >
                        {settings.curtain_eyebrow_text || "★ PADHARO MHARE DESH ★"}
                      </div>
                      <div
                        className={`font-display text-3xl md:text-5xl font-bold drop-shadow-[0_8px_25px_rgba(0,0,0,0.95)] ${
                          settings.curtain_title_color || settings.curtain_text_color
                            ? ""
                            : "bg-gradient-to-r from-[#ffe4b5] via-[#d4af37] to-[#e67e22] bg-clip-text text-transparent"
                        }`}
                        style={
                          settings.curtain_title_color || settings.curtain_text_color
                            ? { color: settings.curtain_title_color || settings.curtain_text_color }
                            : undefined
                        }
                      >
                        {settings.curtain_title_text || "Raj Mandir"}
                      </div>
                      <div
                        className="font-serif italic mt-2 text-xs md:text-sm tracking-widest drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] font-medium"
                        style={{ color: settings.curtain_subtitle_color || "#faf6f0" }}
                      >
                        {settings.curtain_subtitle_text || "— a palace awakens —"}
                      </div>
                    </div>

                    {/* Left Curtain Panel */}
                    <div
                      className="absolute top-0 left-0 h-full w-[51%] z-10 transition-transform duration-1000 ease-in-out"
                      style={{
                        transform: curtainPreviewOpen ? "translateX(-102%)" : "translateX(0)",
                        backgroundColor: settings.curtain_bg_color || "#3d1a0c",
                        backgroundImage: `repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.65) 0px, rgba(255, 255, 255, 0.12) 14px, rgba(212, 175, 55, 0.22) 22px, rgba(255, 255, 255, 0.08) 26px, rgba(0, 0, 0, 0.4) 32px, rgba(0, 0, 0, 0.65) 44px), linear-gradient(135deg, ${settings.curtain_bg_color || "#3d1a0c"}, rgba(0,0,0,0.85))`,
                        boxShadow: "inset 0 0 100px rgba(0, 0, 0, 0.85), 0 0 60px rgba(0, 0, 0, 0.7)",
                      }}
                    >
                      <div
                        className="absolute top-0 right-0 h-full w-[3px]"
                        style={{
                          background: `linear-gradient(180deg, ${settings.curtain_edge_color || "#d4af37"} 0%, #ffffff 50%, ${settings.curtain_edge_color || "#d4af37"} 100%)`,
                          boxShadow: `0 0 12px ${settings.curtain_edge_color || "#d4af37"}`,
                        }}
                      />
                    </div>

                    {/* Right Curtain Panel */}
                    <div
                      className="absolute top-0 right-0 h-full w-[51%] z-10 transition-transform duration-1000 ease-in-out"
                      style={{
                        transform: curtainPreviewOpen ? "translateX(102%)" : "translateX(0)",
                        backgroundColor: settings.curtain_bg_color || "#3d1a0c",
                        backgroundImage: `repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.65) 0px, rgba(255, 255, 255, 0.12) 14px, rgba(212, 175, 55, 0.22) 22px, rgba(255, 255, 255, 0.08) 26px, rgba(0, 0, 0, 0.4) 32px, rgba(0, 0, 0, 0.65) 44px), linear-gradient(135deg, ${settings.curtain_bg_color || "#3d1a0c"}, rgba(0,0,0,0.85))`,
                        boxShadow: "inset 0 0 100px rgba(0, 0, 0, 0.85), 0 0 60px rgba(0, 0, 0, 0.7)",
                      }}
                    >
                      <div
                        className="absolute top-0 left-0 h-full w-[3px]"
                        style={{
                          background: `linear-gradient(180deg, ${settings.curtain_edge_color || "#d4af37"} 0%, #ffffff 50%, ${settings.curtain_edge_color || "#d4af37"} 100%)`,
                          boxShadow: `0 0 12px ${settings.curtain_edge_color || "#d4af37"}`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Reset Defaults button */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdate("curtain_bg_color", "#3d1a0c");
                        handleUpdate("curtain_edge_color", "#d4af37");
                        handleUpdate("curtain_title_text", "Raj Mandir");
                        handleUpdate("curtain_title_color", "");
                        handleUpdate("curtain_text_color", "");
                        handleUpdate("curtain_eyebrow_text", "★ PADHARO MHARE DESH ★");
                        handleUpdate("curtain_eyebrow_color", "#e67e22");
                        handleUpdate("curtain_subtitle_text", "— a palace awakens —");
                        handleUpdate("curtain_subtitle_color", "#faf6f0");
                        handleUpdate("curtain_enabled", true);
                        toast.success("Curtain settings reset to palace defaults. Click 'SAVE ALL CHANGES' to save.");
                      }}
                      className="flex items-center gap-1.5 text-xs font-serif text-muted-foreground hover:text-gold transition-colors"
                    >
                      <RotateCcw size={12} /> Reset to Palace Defaults
                    </button>

                    <span className="font-serif text-[11px] text-muted-foreground italic">
                      Click "SAVE ALL CHANGES" at the top right to apply.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "general" && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="font-display text-2xl text-foreground mb-6">General Information</h3>
            <div className="grid gap-6">
              <SettingField
                label="SITE TITLE"
                value={settings.site_title || "Raj Mandir Hotel"}
                onChange={(v) => handleUpdate("site_title", v)}
              />

              {/* Site Logo Section */}
              <div className="space-y-3 bg-background/50 border border-gold/20 p-6 rounded-sm">
                <label className="block font-serif-sc text-xs tracking-widest text-gold font-bold">
                  SITE LOGO (HEADER LEFT CORNER)
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {settings.site_logo ? (
                    <div className="h-16 w-32 bg-royal-deep/80 border border-gold/30 rounded-sm p-2 flex items-center justify-center shrink-0">
                      <img src={settings.site_logo} alt="Site Logo" className="max-h-full max-w-full object-contain" />
                    </div>
                  ) : (
                    <div className="h-16 w-32 bg-background border border-dashed border-gold/40 rounded-sm flex flex-col items-center justify-center text-xs text-muted-foreground shrink-0">
                      <ImageIcon size={18} className="text-gold/50 mb-1" />
                      <span>No logo</span>
                    </div>
                  )}

                  <div className="flex-1 w-full space-y-3">
                    <input
                      type="text"
                      value={settings.site_logo || ""}
                      onChange={(e) => handleUpdate("site_logo", e.target.value)}
                      placeholder="Paste image URL or upload image file below..."
                      className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-2.5 font-serif text-xs text-foreground transition-all"
                    />

                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/40 text-gold font-serif-sc text-[10px] tracking-widest cursor-pointer hover:bg-gold/20 transition-all">
                      {uploadingLogo ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                      {uploadingLogo ? "UPLOADING LOGO..." : "UPLOAD LOGO IMAGE"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleLogoUpload(e.target.files[0]);
                          }
                        }}
                        disabled={uploadingLogo}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <SettingField
                label="META DESCRIPTION"
                value={settings.meta_description || ""}
                onChange={(v) => handleUpdate("meta_description", v)}
                type="textarea"
              />
              <SettingField
                label="HERO TAGLINE"
                value={settings.hero_tagline || ""}
                onChange={(v) => handleUpdate("hero_tagline", v)}
              />
              <SettingField
                label="ESTABLISHED YEAR (e.g. 1998)"
                value={settings.established_year || "1998"}
                onChange={(v) => handleUpdate("established_year", v)}
              />
            </div>
          </div>
        )}

        {activeTab === "contact" && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="font-display text-2xl text-foreground mb-6">Contact Details</h3>
            <div className="grid gap-6">
              <SettingField
                label="OFFICIAL EMAIL"
                value={settings.contact_email || ""}
                onChange={(v) => handleUpdate("contact_email", v)}
                icon={Mail}
              />
              <SettingField
                label="PHONE NUMBER"
                value={settings.contact_phone || ""}
                onChange={(v) => handleUpdate("contact_phone", v)}
                icon={Phone}
              />
              <SettingField
                label="WHATSAPP NUMBER"
                value={settings.contact_whatsapp || ""}
                onChange={(v) => handleUpdate("contact_whatsapp", v)}
                icon={Phone}
              />
              <SettingField
                label="PALACE ADDRESS"
                value={settings.contact_address || ""}
                onChange={(v) => handleUpdate("contact_address", v)}
                icon={MapPin}
                type="textarea"
              />
              <SettingField
                label="GOOGLE MAPS EMBED LINK (iframe src)"
                value={settings.contact_maps_url || ""}
                onChange={(v) => handleUpdate("contact_maps_url", v)}
                icon={Globe}
                type="textarea"
              />
            </div>
          </div>
        )}

        {activeTab === "social" && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="font-display text-2xl text-foreground mb-6">Social Connections</h3>
            <div className="grid gap-6">
              <SettingField
                label="INSTAGRAM URL"
                value={settings.social_instagram || ""}
                onChange={(v) => handleUpdate("social_instagram", v)}
              />
              <SettingField
                label="FACEBOOK URL"
                value={settings.social_facebook || ""}
                onChange={(v) => handleUpdate("social_facebook", v)}
              />
              <SettingField
                label="TRIPADVISOR URL"
                value={settings.social_tripadvisor || ""}
                onChange={(v) => handleUpdate("social_tripadvisor", v)}
              />
            </div>
          </div>
        )}

        {activeTab === "branding" && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="font-display text-2xl text-foreground mb-6">Visual Identity</h3>
            <div className="grid gap-6">
              <p className="font-serif text-muted-foreground text-sm italic">
                Manage your royal assets and color palette. Logo management via Supabase storage is recommended.
              </p>
              <SettingField
                label="PRIMARY GOLD COLOR"
                value={settings.theme_gold || "#D4AF37"}
                onChange={(v) => handleUpdate("theme_gold", v)}
              />
              <SettingField
                label="DARK OVERLAY OPACITY"
                value={settings.theme_overlay || "0.5"}
                onChange={(v) => handleUpdate("theme_overlay", v)}
              />
            </div>
          </div>
        )}

        {activeTab === "financials" && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="font-display text-2xl text-foreground mb-6">Financial & Tax Settings</h3>
            <div className="grid gap-6">
              <p className="font-serif text-muted-foreground text-sm italic">
                Manage tax percentages and other financial parameters.
              </p>
              <SettingField
                label="GST PERCENTAGE (%)"
                value={settings.gst_percentage || "12"}
                onChange={(v) => handleUpdate("gst_percentage", v)}
                type="number"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const SettingField = ({ label, value, onChange, type = "text", icon: Icon }: any) => (
  <div className="space-y-2">
    <label className="block font-serif-sc text-[10px] tracking-widest text-gold">{label}</label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-3 text-gold/50">
          <Icon size={16} />
        </div>
      )}
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif text-sm text-foreground transition-all min-h-[100px] ${Icon ? "pl-10" : ""}`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif text-sm text-foreground transition-all ${Icon ? "pl-10" : ""}`}
        />
      )}
    </div>
  </div>
);
