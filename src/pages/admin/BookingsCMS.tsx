import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Trash2, CheckCircle, XCircle, CalendarCheck, Search } from "lucide-react";

type Booking = {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  room_id: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  total_price: number;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
  room?: {
    name: string;
  };
};

export default function BookingsCMS() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          room:rooms(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      toast.error("Failed to load bookings: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: "confirmed" | "cancelled") => {
    if (!window.confirm(`Are you sure you want to mark this booking as ${status}?`)) return;
    
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id);
      
      if (error) throw error;
      toast.success(`Booking ${status} successfully.`);
      fetchBookings();
    } catch (error: any) {
      toast.error("Failed to update booking: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this booking record? This action cannot be undone.")) return;
    try {
      const { error } = await supabase.from("bookings").delete().eq("id", id);
      if (error) throw error;
      toast.success("Booking deleted successfully.");
      fetchBookings();
    } catch (error: any) {
      toast.error("Failed to delete booking: " + error.message);
    }
  };

  const filteredBookings = bookings.filter(b => 
    b.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.guest_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.id.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-foreground mb-2">Bookings</h1>
          <p className="font-serif text-muted-foreground">Manage your royal guest reservations.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search guests or ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card/50 border border-gold/20 focus:border-gold outline-none pl-10 pr-4 py-2 font-serif text-sm text-foreground transition-all duration-300"
          />
        </div>
      </div>

      <div className="grid gap-6">
        {filteredBookings.length === 0 ? (
          <div className="text-center p-12 border border-gold/20 bg-card/50 shadow-frame">
            <CalendarCheck className="mx-auto text-gold/50 w-12 h-12 mb-4" />
            <h3 className="font-display text-2xl text-foreground mb-2">No Bookings Found</h3>
            <p className="font-serif text-muted-foreground">There are currently no reservations matching your criteria.</p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-card border border-gold/20 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-gold transition-all duration-300 group">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-display text-2xl text-foreground group-hover:text-gold transition-colors">{booking.guest_name}</h3>
                  <span className={`text-[9px] font-serif-sc tracking-widest px-2 py-0.5 border ${
                    booking.status === 'confirmed' ? 'bg-green-900/20 text-green-400 border-green-900/30' :
                    booking.status === 'cancelled' ? 'bg-red-900/20 text-red-400 border-red-900/30' :
                    'bg-yellow-900/20 text-yellow-400 border-yellow-900/30'
                  }`}>
                    {booking.status.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 font-serif text-sm text-foreground/80">
                  <div>
                    <span className="block text-[10px] font-serif-sc tracking-widest text-muted-foreground mb-1">ROOM</span>
                    {booking.room?.name || "Unknown Room"}
                  </div>
                  <div>
                    <span className="block text-[10px] font-serif-sc tracking-widest text-muted-foreground mb-1">DATES</span>
                    {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="block text-[10px] font-serif-sc tracking-widest text-muted-foreground mb-1">GUESTS</span>
                    {booking.guests_count} Person(s)
                  </div>
                  <div>
                    <span className="block text-[10px] font-serif-sc tracking-widest text-muted-foreground mb-1">TOTAL</span>
                    ₹{booking.total_price}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gold/10 font-serif text-xs text-muted-foreground flex gap-4">
                  <span>Email: {booking.guest_email}</span>
                  <span>Phone: {booking.guest_phone}</span>
                  <span>ID: {booking.id.slice(0, 8)}...</span>
                </div>
              </div>
              
              <div className="flex md:flex-col gap-2 shrink-0">
                {booking.status === 'pending' && (
                  <>
                    <button onClick={() => updateStatus(booking.id, 'confirmed')} className="flex items-center justify-center gap-2 p-2 px-4 border border-green-900/30 text-green-400 hover:bg-green-900/20 transition-all duration-300 text-xs font-serif-sc tracking-widest">
                      <CheckCircle size={14} /> CONFIRM
                    </button>
                    <button onClick={() => updateStatus(booking.id, 'cancelled')} className="flex items-center justify-center gap-2 p-2 px-4 border border-red-900/30 text-red-400 hover:bg-red-900/20 transition-all duration-300 text-xs font-serif-sc tracking-widest">
                      <XCircle size={14} /> CANCEL
                    </button>
                  </>
                )}
                <button onClick={() => handleDelete(booking.id)} className="flex items-center justify-center gap-2 p-2 px-4 border border-red-900/30 text-red-400 hover:bg-red-900/20 transition-all duration-300 text-xs font-serif-sc tracking-widest mt-auto">
                  <Trash2 size={14} /> DELETE
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
