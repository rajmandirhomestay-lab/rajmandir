import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Save, Globe, Phone, MapPin, Mail, Share2, Palette, Check, Sparkles, Plus, RefreshCw } from "lucide-react";
import { PRESET_THEMES, ThemeConfig, applyThemeToDOM } from "@/lib/theme";

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
