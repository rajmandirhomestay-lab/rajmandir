import { Users, BedDouble, CalendarCheck, TrendingUp, Image as ImageIcon, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [stats, setStats] = useState({
    rooms: 0,
    bookings: 0,
    reviews: 0,
    gallery: 0,
  });

  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          { count: roomsCount },
          { count: bookingsCount, data: recent },
          { count: reviewsCount },
          { count: galleryCount }
        ] = await Promise.all([
          supabase.from("rooms").select("*", { count: "exact", head: true }),
          supabase.from("bookings").select("*, rooms(title)", { count: "exact" }).order("created_at", { ascending: false }).limit(3),
          supabase.from("reviews").select("*", { count: "exact", head: true }),
          supabase.from("gallery").select("*", { count: "exact", head: true })
        ]);

        setStats({
          rooms: roomsCount || 0,
          bookings: bookingsCount || 0,
          reviews: reviewsCount || 0,
          gallery: galleryCount || 0,
        });

        if (recent) setRecentBookings(recent);
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      }
    };
    fetchDashboardData();
  }, []);

  const statCards = [
    { title: "Total Rooms", value: stats.rooms.toString(), icon: BedDouble, trend: "Active" },
    { title: "Total Bookings", value: stats.bookings.toString(), icon: CalendarCheck, trend: "All Time" },
    { title: "Guest Reviews", value: stats.reviews.toString(), icon: Star, trend: "Published" },
    { title: "Gallery Images", value: stats.gallery.toString(), icon: ImageIcon, trend: "Live" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-foreground mb-2">Palace Overview</h1>
          <p className="font-serif text-muted-foreground">Monitor your royal estate's live performance and database.</p>
        </div>
        <div className="font-serif-sc text-xs tracking-widest text-gold border border-gold/30 px-4 py-2 bg-gold/5">
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-card border border-gold/20 p-6 shadow-frame hover:shadow-gold transition-all duration-500 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-gold/5 rounded-full blur-2xl group-hover:bg-gold/10 transition-colors duration-500" />
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="w-10 h-10 border border-gold/30 flex items-center justify-center bg-background group-hover:border-gold/60 transition-colors">
                <stat.icon size={18} className="text-gold" />
              </div>
              <span className="font-serif-sc text-[10px] text-green-400 tracking-wider bg-green-400/10 px-2 py-1">
                {stat.trend}
              </span>
            </div>
            <div className="relative z-10">
              <h3 className="font-display text-3xl text-foreground mb-1">{stat.value}</h3>
              <p className="font-serif-sc text-[10px] tracking-widest text-muted-foreground">{stat.title.toUpperCase()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card border border-gold/20 p-8 shadow-frame">
          <h2 className="font-serif-sc text-sm tracking-widest text-gold border-b border-gold/10 pb-4 mb-6">RECENT BOOKINGS</h2>
          <div className="space-y-4">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-muted/30 border border-transparent hover:border-gold/20 transition-colors">
                  <div>
                    <p className="font-serif text-foreground">{booking.guest_name}</p>
                    <p className="font-serif-sc text-[10px] tracking-widest text-muted-foreground mt-1">
                      {booking.rooms?.title?.toUpperCase()} • {new Date(booking.check_in_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`font-serif-sc text-[10px] px-3 py-1 border ${
                    booking.status === 'confirmed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                    booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                    'bg-gold/10 text-gold border-gold/20'
                  }`}>
                    {booking.status?.toUpperCase() || 'NEW'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground font-serif italic text-sm p-4">No recent bookings found.</div>
            )}
          </div>
        </div>

        <div className="bg-card border border-gold/20 p-8 shadow-frame">
          <h2 className="font-serif-sc text-sm tracking-widest text-gold border-b border-gold/10 pb-4 mb-6">QUICK DECREES</h2>
          <div className="space-y-3">
            <a href="/admin/bookings" className="block w-full text-left px-4 py-3 bg-muted/30 hover:bg-gold/10 hover:text-gold font-serif-sc text-xs tracking-widest transition-colors border border-transparent hover:border-gold/30">
              → VIEW ALL BOOKINGS
            </a>
            <a href="/admin/rooms" className="block w-full text-left px-4 py-3 bg-muted/30 hover:bg-gold/10 hover:text-gold font-serif-sc text-xs tracking-widest transition-colors border border-transparent hover:border-gold/30">
              → MANAGE CHAMBERS
            </a>
            <a href="/admin/stories" className="block w-full text-left px-4 py-3 bg-muted/30 hover:bg-gold/10 hover:text-gold font-serif-sc text-xs tracking-widest transition-colors border border-transparent hover:border-gold/30">
              → ADD NEW STORY
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
