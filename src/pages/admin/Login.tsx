import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { KeyRound, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message || "Failed to authenticate.");
      setLoading(false);
      return;
    }

    if (data.user) {
      toast.success("Welcome back to the Palace Dashboard.");
      navigate("/admin/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-royal-deep flex items-center justify-center p-6 relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--gold)/0.15),transparent_60%)] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('@/assets/texture-stone.jpg')] opacity-5 mix-blend-overlay pointer-events-none" />

      <div className="relative w-full max-w-md z-10">
        <div className="bg-card/40 backdrop-blur-xl border border-gold/30 shadow-[0_0_40px_hsl(var(--gold)/0.1)] p-10 md:p-14 text-center">
          <div className="absolute inset-2 border border-gold/10 pointer-events-none" />
          
          <div className="mb-10">
            <div className="w-16 h-16 mx-auto border border-gold flex items-center justify-center mb-6 shadow-gold bg-gold/5">
              <span className="font-display text-gold text-3xl">R</span>
            </div>
            <div className="font-serif-sc tracking-[0.4em] text-gold text-[10px] mb-3">AUTHORIZED ACCESS ONLY</div>
            <h1 className="font-display text-3xl text-foreground">Palace Dashboard</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 text-left">
            <div className="relative group">
              <div className="absolute left-0 top-3 text-gold/60">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-gold/30 focus:border-gold outline-none pl-8 py-3 font-serif text-foreground transition-all duration-500 placeholder:text-muted-foreground/40"
                placeholder="Royal Mail Address"
              />
            </div>

            <div className="relative group">
              <div className="absolute left-0 top-3 text-gold/60">
                <KeyRound size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-gold/30 focus:border-gold outline-none pl-8 py-3 font-serif text-foreground transition-all duration-500 placeholder:text-muted-foreground/40"
                placeholder="Access Key"
              />
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-gold text-royal-deep font-serif-sc tracking-[0.3em] text-xs py-4 flex items-center justify-center gap-2 shadow-gold hover:scale-[1.02] transition-all duration-500 disabled:opacity-70 disabled:hover:scale-100"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : "UNLOCK DASHBOARD"}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <button className="font-serif-sc text-[10px] tracking-widest text-muted-foreground hover:text-gold transition-colors">
              FORGOT ACCESS KEY?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
