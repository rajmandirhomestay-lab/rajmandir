import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Save, Globe, Phone, MapPin, Mail, Share2, Palette } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState("general");

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
    } catch (error: any) {
      toast.error("Failed to load settings: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
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
      toast.success("Royal settings updated successfully.");
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
    { id: "general", label: "GENERAL", icon: Globe },
    { id: "contact", label: "CONTACT", icon: Phone },
    { id: "social", label: "SOCIAL", icon: Share2 },
    { id: "branding", label: "BRANDING", icon: Palette },
    { id: "financials", label: "FINANCIALS", icon: Palette },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-foreground mb-2">Global Settings</h1>
          <p className="font-serif text-muted-foreground">Manage your palace's digital identity.</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-gold text-royal-deep font-serif-sc text-xs tracking-widest hover:bg-gold/80 transition-all duration-300 disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          SAVE ALL CHANGES
        </button>
      </div>

      <div className="flex border-b border-gold/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 font-serif-sc text-[10px] tracking-widest transition-all relative ${
              activeTab === tab.id ? "text-gold" : "text-muted-foreground hover:text-foreground"
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

      <div className="bg-card/30 border border-gold/20 p-8 shadow-frame backdrop-blur-sm">
        {activeTab === "general" && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="font-display text-2xl text-foreground mb-6">General Information</h3>
            <div className="grid gap-6">
              <SettingField
                label="SITE TITLE"
                value={settings.site_title || "Raj Mandir Guest House"}
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
