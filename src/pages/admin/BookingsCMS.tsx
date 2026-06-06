import { useState } from "react";
import { format } from "date-fns";
import { Calendar, CheckCircle, Clock, XCircle, Search, Eye, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAllBookings, useRoomCategories } from "@/lib/api";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function BookingsCMS() {
  const { data: bookings, refetch } = useAllBookings();
  const { data: categories } = useRoomCategories();
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewBooking, setViewBooking] = useState<any>(null);

  const filteredBookings = (bookings || []).filter((b: any) => {
    if (filter !== "all" && b.booking_status !== filter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return b.booking_number?.toLowerCase().includes(term) ||
             b.guest_name?.toLowerCase().includes(term) ||
             b.guest_email?.toLowerCase().includes(term);
    }
    return true;
  }).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from("bookings").update({ booking_status: status }).eq("id", id);
      if (error) throw error;
      toast.success(`Booking marked as ${status}`);
      refetch();
      if (viewBooking?.id === id) {
        setViewBooking({ ...viewBooking, booking_status: status });
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const deleteBooking = async (id: string) => {
    if (!window.confirm("Are you sure you want to completely delete this booking? This action cannot be undone.")) return;
    try {
      const { error } = await supabase.from("bookings").delete().eq("id", id);
      if (error) throw error;
      toast.success("Booking deleted successfully");
      setViewBooking(null);
      refetch();
    } catch (err: any) {
      toast.error(`Error deleting booking: ${err.message}`);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch(status) {
      case 'confirmed': return <span className="px-2 py-1 bg-green-500/10 text-green-600 border border-green-500/20 text-xs tracking-widest font-serif-sc rounded">CONFIRMED</span>;
      case 'pending': return <span className="px-2 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs tracking-widest font-serif-sc rounded">PENDING</span>;
      case 'canceled': return <span className="px-2 py-1 bg-red-500/10 text-red-600 border border-red-500/20 text-xs tracking-widest font-serif-sc rounded">CANCELED</span>;
      case 'completed': return <span className="px-2 py-1 bg-blue-500/10 text-blue-600 border border-blue-500/20 text-xs tracking-widest font-serif-sc rounded">COMPLETED</span>;
      default: return <span className="px-2 py-1 bg-gray-500/10 text-gray-600 border border-gray-500/20 text-xs tracking-widest font-serif-sc rounded">{status?.toUpperCase()}</span>;
    }
  };

  const getRoomName = (roomId: string) => {
    if (!categories || !roomId) return "ROOM";
    const cat = categories.find((c: any) => c.id === roomId || c.slug === roomId);
    return cat ? cat.name : "ROOM";
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-royal-deep">Bookings Ledger</h1>
          <p className="font-serif text-muted-foreground mt-2">Manage all guest reservations and payments.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 border border-gold/20 rounded shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Search by ID, Name or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-gold/30 focus:border-gold outline-none font-serif"
          />
        </div>
        <div className="flex bg-background border border-gold/30 rounded overflow-hidden">
          {["all", "pending", "confirmed", "completed", "canceled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 font-serif-sc text-xs tracking-widest transition-colors ${filter === f ? 'bg-gold/10 text-gold border-b-2 border-gold' : 'text-muted-foreground hover:bg-gold/5'}`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gold/20 shadow-sm overflow-hidden rounded">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-serif">
            <thead className="bg-gold/5 border-b border-gold/20 font-serif-sc text-xs tracking-widest text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Booking ID</th>
                <th className="px-6 py-4">Guest</th>
                <th className="px-6 py-4">Stay Dates</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {filteredBookings.map((b: any) => (
                <tr key={b.id} className="hover:bg-gold/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-display text-gold">{b.booking_number || "Legacy"}</div>
                    <div className="text-xs text-muted-foreground">{format(new Date(b.created_at), "dd MMM yyyy")}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-foreground">{b.guest_name}</div>
                    <div className="text-xs text-muted-foreground">{b.guest_phone || b.guest_email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {b.start_date && format(new Date(b.start_date), "dd MMM")} → {b.end_date && format(new Date(b.end_date), "dd MMM yyyy")}
                    </div>
                    <div className="text-xs text-muted-foreground">{b.num_rooms || 1} Rooms</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-foreground">₹{Number(b.total_price).toLocaleString()}</div>
                    <div className="text-[10px] uppercase tracking-widest text-gold">{b.payment_status}</div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={b.booking_status || 'pending'} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setViewBooking(b)}
                      className="p-2 text-gold hover:bg-gold/10 rounded-full transition-colors"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                    No bookings found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!viewBooking} onOpenChange={(o) => !o && setViewBooking(null)}>
        <DialogContent className="max-w-2xl bg-card border-gold/30">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-gold flex items-center gap-3">
              Booking Details
              {viewBooking && <StatusBadge status={viewBooking.booking_status || 'pending'} />}
            </DialogTitle>
          </DialogHeader>
          
          {viewBooking && (
            <div className="grid grid-cols-2 gap-8 mt-4 font-serif">
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-serif-sc tracking-widest text-muted-foreground mb-1">BOOKING NUMBER</div>
                  <div className="text-lg">{viewBooking.booking_number || viewBooking.id}</div>
                </div>
                <div>
                  <div className="text-xs font-serif-sc tracking-widest text-muted-foreground mb-1">GUEST INFO</div>
                  <div>{viewBooking.guest_name}</div>
                  <div className="text-muted-foreground">{viewBooking.guest_email}</div>
                  <div className="text-muted-foreground">{viewBooking.guest_phone || "No phone"}</div>
                </div>
                <div>
                  <div className="text-xs font-serif-sc tracking-widest text-muted-foreground mb-1">STAY DETAILS</div>
                  {viewBooking.room_id && (
                    <div className="font-display text-gold mb-2 uppercase tracking-widest text-lg">
                      {getRoomName(viewBooking.room_id)}
                    </div>
                  )}
                  <div>{viewBooking.start_date && format(new Date(viewBooking.start_date), "PPP")} to</div>
                  <div>{viewBooking.end_date && format(new Date(viewBooking.end_date), "PPP")}</div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {viewBooking.adults || 2} Adults, {viewBooking.children || 0} Children
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {viewBooking.num_rooms || 1} Room(s), {viewBooking.extra_mattress || 0} Extra Mattress
                  </div>
                </div>
                {viewBooking.special_requests && (
                  <div>
                    <div className="text-xs font-serif-sc tracking-widest text-muted-foreground mb-1">SPECIAL REQUESTS</div>
                    <div className="italic bg-gold/5 p-3 text-sm border border-gold/20">{viewBooking.special_requests}</div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4 bg-background border border-gold/10 p-5">
                <div className="text-xs font-serif-sc tracking-widest text-gold mb-3">FINANCIAL LEDGER</div>
                
                <div className="flex justify-between border-b border-gold/10 pb-2">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span>₹{Number(viewBooking.total_price).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-gold/10 pb-2">
                  <span className="text-muted-foreground">Advance Paid</span>
                  <span className="text-green-600">₹{Number(viewBooking.advance_amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-display text-xl text-royal-deep pt-2">
                  <span>Balance Due</span>
                  <span>₹{(Number(viewBooking.total_price) - Number(viewBooking.advance_amount || 0)).toLocaleString()}</span>
                </div>

                {viewBooking.razorpay_payment_id && (
                  <div className="mt-4 pt-4 border-t border-gold/10">
                    <div className="text-[10px] font-serif-sc tracking-widest text-muted-foreground mb-1">RAZORPAY ID</div>
                    <div className="text-xs font-mono bg-black/5 p-2 truncate">{viewBooking.razorpay_payment_id}</div>
                  </div>
                )}

                <div className="mt-8 space-y-2">
                  <div className="text-[10px] font-serif-sc tracking-widest text-gold mb-2">ADMIN ACTIONS</div>
                  {viewBooking.booking_status === 'pending' && (
                    <button onClick={() => updateStatus(viewBooking.id, 'confirmed')} className="w-full flex items-center justify-center gap-2 py-2 bg-green-500/10 text-green-700 hover:bg-green-500/20 transition-colors text-sm font-serif-sc tracking-widest">
                      <CheckCircle size={16} /> CONFIRM BOOKING
                    </button>
                  )}
                  {(viewBooking.booking_status === 'pending' || viewBooking.booking_status === 'confirmed') && (
                    <button onClick={() => updateStatus(viewBooking.id, 'canceled')} className="w-full flex items-center justify-center gap-2 py-2 bg-red-500/10 text-red-700 hover:bg-red-500/20 transition-colors text-sm font-serif-sc tracking-widest">
                      <XCircle size={16} /> CANCEL BOOKING
                    </button>
                  )}
                  {viewBooking.booking_status === 'confirmed' && (
                    <button onClick={() => updateStatus(viewBooking.id, 'completed')} className="w-full flex items-center justify-center gap-2 py-2 bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 transition-colors text-sm font-serif-sc tracking-widest">
                      <CheckCircle size={16} /> MARK COMPLETED
                    </button>
                  )}
                  
                  <div className="pt-4 mt-4 border-t border-red-500/10">
                    <button onClick={() => deleteBooking(viewBooking.id)} className="w-full flex items-center justify-center gap-2 py-2 bg-red-500/5 text-red-600 hover:bg-red-500/10 hover:text-red-700 border border-red-500/20 transition-colors text-sm font-serif-sc tracking-widest">
                      <Trash2 size={16} /> PERMANENTLY DELETE
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
