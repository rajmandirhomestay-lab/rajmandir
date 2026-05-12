import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Loader2, Star, CheckCircle, XCircle, Trash2, Crown, Search, Plus, X
} from "lucide-react";

type Review = {
  id: string;
  guest_name: string;
  guest_location: string;
  rating: number;
  review_text: string;
  status: "pending" | "approved" | "rejected";
  is_featured: boolean;
  created_at: string;
};

const emptyForm = {
  guest_name: "",
  guest_location: "",
  rating: 5,
  review_text: "",
  status: "approved" as const,
  is_featured: false,
};

export default function ReviewsCMS() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setReviews(data || []);
    } catch (e: any) {
      toast.error("Failed to load reviews: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
      if (error) throw error;
      toast.success(`Review ${status}.`);
      fetchReviews();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase.from("reviews").update({ is_featured: !current }).eq("id", id);
      if (error) throw error;
      toast.success(!current ? "Review featured on homepage." : "Review unfeatured.");
      fetchReviews();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanently delete this review?")) return;
    try {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
      toast.success("Review deleted.");
      fetchReviews();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const openAddModal = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (r: Review) => {
    setEditId(r.id);
    setForm({
      guest_name: r.guest_name,
      guest_location: r.guest_location,
      rating: r.rating,
      review_text: r.review_text,
      status: r.status,
      is_featured: r.is_featured,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.guest_name.trim() || !form.review_text.trim()) {
      toast.error("Guest name and review text are required.");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        const { error } = await supabase.from("reviews").update(form).eq("id", editId);
        if (error) throw error;
        toast.success("Review updated.");
      } else {
        const { error } = await supabase.from("reviews").insert([form]);
        if (error) throw error;
        toast.success("Review added.");
      }
      setShowModal(false);
      fetchReviews();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = reviews.filter((r) => {
    const matchesSearch =
      r.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.review_text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || r.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const StarRow = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={i <= rating ? "text-gold fill-gold" : "text-muted-foreground/30"}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="animate-spin text-gold w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-foreground mb-2">Reviews & Testimonials</h1>
          <p className="font-serif text-muted-foreground">Curate guest voices for the royal chronicles.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-6 py-3 bg-gold text-royal-deep font-serif-sc text-xs tracking-widest hover:bg-gold/80 transition-all duration-300"
        >
          <Plus size={16} /> ADD REVIEW
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search guest or review..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card/50 border border-gold/20 focus:border-gold outline-none pl-10 pr-4 py-2 font-serif text-sm text-foreground transition-all duration-300"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 font-serif-sc text-[10px] tracking-widest border transition-all duration-300 ${
                filterStatus === s
                  ? "bg-gold text-royal-deep border-gold"
                  : "border-gold/20 text-muted-foreground hover:border-gold/50 hover:text-foreground"
              }`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "TOTAL", value: reviews.length, color: "text-foreground" },
          { label: "PENDING", value: reviews.filter(r => r.status === "pending").length, color: "text-yellow-400" },
          { label: "FEATURED", value: reviews.filter(r => r.is_featured).length, color: "text-gold" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-gold/20 p-4 text-center shadow-frame">
            <p className={`font-display text-3xl ${stat.color} mb-1`}>{stat.value}</p>
            <p className="font-serif-sc text-[9px] tracking-widest text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Reviews Grid */}
      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <div className="text-center p-12 border border-gold/20 bg-card/50">
            <Star className="mx-auto text-gold/50 w-10 h-10 mb-4" />
            <p className="font-display text-2xl text-foreground mb-2">No Reviews Found</p>
            <p className="font-serif text-muted-foreground">No reviews match your current filter.</p>
          </div>
        ) : (
          filtered.map((r) => (
            <div
              key={r.id}
              className={`bg-card border p-6 transition-all duration-300 hover:shadow-gold group ${
                r.is_featured ? "border-gold/40 bg-gold/5" : "border-gold/20"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <p className="font-display text-xl text-foreground group-hover:text-gold transition-colors">
                      {r.guest_name}
                    </p>
                    {r.guest_location && (
                      <span className="font-serif-sc text-[9px] tracking-widest text-muted-foreground">
                        {r.guest_location}
                      </span>
                    )}
                    {r.is_featured && (
                      <span className="flex items-center gap-1 text-[9px] font-serif-sc tracking-widest text-gold bg-gold/10 border border-gold/30 px-2 py-0.5">
                        <Crown size={10} /> FEATURED
                      </span>
                    )}
                    <span
                      className={`text-[9px] font-serif-sc tracking-widest px-2 py-0.5 border ${
                        r.status === "approved"
                          ? "bg-green-900/20 text-green-400 border-green-900/30"
                          : r.status === "rejected"
                          ? "bg-red-900/20 text-red-400 border-red-900/30"
                          : "bg-yellow-900/20 text-yellow-400 border-yellow-900/30"
                      }`}
                    >
                      {r.status.toUpperCase()}
                    </span>
                  </div>
                  <StarRow rating={r.rating} />
                  <p className="font-serif text-muted-foreground text-sm mt-3 leading-relaxed line-clamp-3">
                    "{r.review_text}"
                  </p>
                  <p className="font-serif-sc text-[9px] tracking-widest text-muted-foreground/50 mt-3">
                    {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>

                <div className="flex md:flex-col gap-2 shrink-0">
                  {r.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(r.id, "approved")}
                        title="Approve"
                        className="flex items-center gap-1 px-3 py-2 border border-green-900/30 text-green-400 hover:bg-green-900/20 transition-all text-[10px] font-serif-sc tracking-widest"
                      >
                        <CheckCircle size={12} /> APPROVE
                      </button>
                      <button
                        onClick={() => updateStatus(r.id, "rejected")}
                        title="Reject"
                        className="flex items-center gap-1 px-3 py-2 border border-red-900/30 text-red-400 hover:bg-red-900/20 transition-all text-[10px] font-serif-sc tracking-widest"
                      >
                        <XCircle size={12} /> REJECT
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => toggleFeatured(r.id, r.is_featured)}
                    title={r.is_featured ? "Unfeature" : "Feature on homepage"}
                    className={`flex items-center gap-1 px-3 py-2 border transition-all text-[10px] font-serif-sc tracking-widest ${
                      r.is_featured
                        ? "border-gold/40 text-gold bg-gold/10 hover:bg-gold/20"
                        : "border-gold/20 text-muted-foreground hover:border-gold/40 hover:text-gold"
                    }`}
                  >
                    <Crown size={12} /> {r.is_featured ? "UNFEATURE" : "FEATURE"}
                  </button>
                  <button
                    onClick={() => openEditModal(r)}
                    className="flex items-center gap-1 px-3 py-2 border border-gold/20 text-muted-foreground hover:border-gold hover:text-gold transition-all text-[10px] font-serif-sc tracking-widest"
                  >
                    EDIT
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="flex items-center gap-1 px-3 py-2 border border-red-900/30 text-red-400 hover:bg-red-900/20 transition-all text-[10px] font-serif-sc tracking-widest"
                  >
                    <Trash2 size={12} /> DELETE
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-gold/30 shadow-gold w-full max-w-lg p-8 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-gold transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="font-display text-3xl text-foreground mb-6">
              {editId ? "Edit Review" : "Add Review"}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-serif-sc text-[10px] tracking-widest text-muted-foreground mb-2">
                    GUEST NAME *
                  </label>
                  <input
                    type="text"
                    value={form.guest_name}
                    onChange={(e) => setForm({ ...form, guest_name: e.target.value })}
                    className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-2 font-serif text-sm text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-serif-sc text-[10px] tracking-widest text-muted-foreground mb-2">
                    LOCATION
                  </label>
                  <input
                    type="text"
                    value={form.guest_location}
                    onChange={(e) => setForm({ ...form, guest_location: e.target.value })}
                    placeholder="e.g. London, UK"
                    className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-2 font-serif text-sm text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block font-serif-sc text-[10px] tracking-widest text-muted-foreground mb-2">
                  RATING
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      onClick={() => setForm({ ...form, rating: i })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={24}
                        className={i <= form.rating ? "text-gold fill-gold" : "text-muted-foreground/30"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-serif-sc text-[10px] tracking-widest text-muted-foreground mb-2">
                  REVIEW TEXT *
                </label>
                <textarea
                  value={form.review_text}
                  onChange={(e) => setForm({ ...form, review_text: e.target.value })}
                  rows={4}
                  className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-3 font-serif text-sm text-foreground resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-serif-sc text-[10px] tracking-widest text-muted-foreground mb-2">
                    STATUS
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full bg-background border border-gold/20 focus:border-gold outline-none px-4 py-2 font-serif text-sm text-foreground"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setForm({ ...form, is_featured: !form.is_featured })}
                      className={`w-10 h-5 border transition-colors duration-300 relative ${
                        form.is_featured ? "bg-gold border-gold" : "bg-background border-gold/30"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 bg-white transition-transform duration-300 ${
                          form.is_featured ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </div>
                    <span className="font-serif-sc text-[10px] tracking-widest text-muted-foreground">FEATURED</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-6 py-3 border border-gold/20 text-muted-foreground hover:border-gold hover:text-foreground font-serif-sc text-xs tracking-widest transition-all duration-300"
              >
                CANCEL
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gold text-royal-deep font-serif-sc text-xs tracking-widest hover:bg-gold/80 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                {editId ? "UPDATE" : "SAVE"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
