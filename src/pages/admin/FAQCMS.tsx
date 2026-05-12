import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Loader2,
  Search,
  Plus,
  X,
  GripVertical,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

type FAQ = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
};

export default function FAQCMS() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ question: "", answer: "", is_active: true });
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      setFaqs(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error("Both fields are required");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        const { error } = await supabase.from("faqs").update(form).eq("id", editId);
        if (error) throw error;
        toast.success("FAQ updated");
      } else {
        const nextOrder = faqs.length ? Math.max(...faqs.map((f) => f.sort_order)) + 1 : 1;
        const { error } = await supabase
          .from("faqs")
          .insert([{ ...form, sort_order: nextOrder }]);
        if (error) throw error;
        toast.success("FAQ added");
      }
      setShowModal(false);
      fetchFaqs();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteFAQ = async (id: string) => {
    if (!window.confirm("Delete this FAQ?")) return;
    try {
      const { error } = await supabase.from("faqs").delete().eq("id", id);
      if (error) throw error;
      toast.success("FAQ removed");
      fetchFaqs();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    const reordered = Array.from(faqs);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    
    setFaqs(reordered);

    const updates = reordered.map((f, idx) => ({
      id: f.id,
      sort_order: idx + 1,
      question: f.question,
      answer: f.answer,
      is_active: f.is_active
    }));

    try {
      const { error } = await supabase.from("faqs").upsert(updates);
      if (error) throw error;
      toast.success("Order saved");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filtered = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="animate-spin text-gold w-10 h-10" />
      </div>
    );

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-foreground mb-2">
            FAQ Management
          </h1>
          <p className="font-serif text-muted-foreground">
            Curate the guest-house Q&A.
          </p>
        </div>
        <button
          onClick={() => {
            setEditId(null);
            setForm({ question: "", answer: "", is_active: true });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gold text-royal-deep font-serif-sc text-xs tracking-widest hover:bg-gold/80 transition-all"
        >
          <Plus size={16} />
          ADD FAQ
        </button>
      </div>

      <div className="relative w-full max-w-sm">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4"
        />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-card/50 border border-gold/20 pl-10 pr-4 py-2 font-serif text-sm text-foreground focus:border-gold outline-none"
        />
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="faqs">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {filtered.map((f, idx) => (
                <Draggable key={f.id} draggableId={f.id} index={idx}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`bg-card border border-gold/20 p-4 flex items-start gap-4 ${
                        f.is_active ? "" : "opacity-60"
                      }`}
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="cursor-grab text-muted-foreground mt-1"
                      >
                        <GripVertical size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="font-display text-lg text-foreground">
                          {f.question}
                        </p>
                        <p className="font-serif text-muted-foreground mt-1 text-sm">
                          {f.answer}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setEditId(f.id);
                            setForm({
                              question: f.question,
                              answer: f.answer,
                              is_active: f.is_active,
                            });
                            setShowModal(true);
                          }}
                          className="text-[10px] font-serif-sc tracking-widest border border-gold/20 px-3 py-1 hover:bg-gold/10 hover:text-gold transition-all"
                        >
                          EDIT
                        </button>
                        <button
                          onClick={() => deleteFAQ(f.id)}
                          className="text-[10px] font-serif-sc tracking-widest border border-red-900/30 text-red-400 px-3 py-1 hover:bg-red-900/20 transition-all"
                        >
                          DELETE
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-gold/30 shadow-gold w-full max-w-lg p-8 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-gold"
            >
              <X size={20} />
            </button>
            <h2 className="font-display text-2xl mb-6 text-foreground">
              {editId ? "Edit FAQ" : "Add FAQ"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block font-serif-sc text-[10px] text-muted-foreground mb-2 tracking-widest">
                  QUESTION *
                </label>
                <input
                  type="text"
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  className="w-full bg-background border border-gold/20 px-4 py-2 font-serif text-sm text-foreground focus:border-gold outline-none"
                />
              </div>
              <div>
                <label className="block font-serif-sc text-[10px] text-muted-foreground mb-2 tracking-widest">
                  ANSWER *
                </label>
                <textarea
                  rows={4}
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  className="w-full bg-background border border-gold/20 px-4 py-2 font-serif text-sm text-foreground focus:border-gold outline-none resize-none"
                />
              </div>
              <div className="flex items-center gap-3">
                 <div 
                  onClick={() => setForm({ ...form, is_active: !form.is_active })}
                  className={`w-10 h-5 border transition-colors duration-300 relative cursor-pointer ${
                    form.is_active ? "bg-gold border-gold" : "bg-background border-gold/30"
                  }`}
                >
                  <div 
                    className={`absolute top-0.5 w-4 h-4 bg-white transition-transform duration-300 ${
                      form.is_active ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </div>
                <span className="font-serif-sc text-[10px] text-muted-foreground tracking-widest">
                  ACTIVE (VISIBLE ON SITE)
                </span>
              </div>
            </div>
            <div className="flex justify-end mt-8 gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 border border-gold/20 text-muted-foreground hover:border-gold hover:text-foreground font-serif-sc text-xs tracking-widest transition-all"
              >
                CANCEL
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gold text-royal-deep font-serif-sc text-xs tracking-widest disabled:opacity-50 hover:bg-gold/80 transition-all"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editId ? "UPDATE" : "SAVE"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
