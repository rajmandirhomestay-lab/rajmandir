import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { format, isWithinInterval, parseISO } from "date-fns";
import { useSearchParams, Link } from "react-router-dom";
import { PageShell } from "@/components/palace/PageShell";
import { PageHero } from "@/components/palace/PageHero";
import heroImgFallback from "@/assets/page-booking-hero.jpg";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronLeft, ChevronRight, Sparkles, CalendarIcon, Minus, Plus, Tag, AlertCircle, X, Bed } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROOMS } from "@/data/rooms";
import { useRoomCategories, useHomepageSections, usePhysicalRooms, useAllBookings, useSettings } from "@/lib/api";
import { supabase } from "@/lib/supabase";

const COUPONS: Record<string, { off: number; label: string; desc: string }> = {
  ROYAL10: { off: 0.1, label: "ROYAL10", desc: "10% courtier's discount" },
  HERITAGE25: { off: 0.25, label: "HERITAGE25", desc: "25% heritage festival" },
  MAHARAJA: { off: 0.15, label: "MAHARAJA", desc: "15% royal welcome" },
};

const steps = ["Chamber", "Stay Details", "Royal Guest", "Confirm"];
const EXTRA_MATTRESS_PRICE = 2500;

const Booking = () => {
  const [params] = useSearchParams();
  const ref = useRef<HTMLElement>(null);
  const presetId = params.get("room");
  const { data: dbCategories } = useRoomCategories();
  const { data: dbPhysicalRooms } = usePhysicalRooms();
  const { data: dbBookings } = useAllBookings();
  const { data: sections } = useHomepageSections();
  const { data: globalSettings } = useSettings();

  const bookingSection = sections?.find(s => s.section_key === 'booking');
  const heroImg = bookingSection?.content?.image_url || heroImgFallback;

  const [step, setStep] = useState(presetId ? 1 : 0);
  const [roomId, setRoomId] = useState<string | null>(presetId);
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({});
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [numRooms, setNumRooms] = useState(1);
  const [extraMattress, setExtraMattress] = useState(0);
  const [guest, setGuest] = useState({ name: "", email: "", phone: "", notes: "" });
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ off: number; label: string; desc: string } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [touched, setTouched] = useState(false);
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper: Calculate availability for a category on selected dates
  const getAvailability = (categoryId: string) => {
    if (!dbPhysicalRooms || !dbBookings) return 0;
    
    const totalPhysical = dbPhysicalRooms.filter(r => r.category_id === categoryId).length;
    if (totalPhysical === 0) return 0;

    if (!range.from || !range.to) return totalPhysical;

    // Count bookings for this category that overlap with the selected range
    const overlappingBookings = dbBookings.filter(b => {
      if (b.room_id !== categoryId || b.status === 'canceled') return false;
      const bStart = parseISO(b.start_date);
      const bEnd = parseISO(b.end_date);
      return range.from! <= bEnd && range.to! >= bStart;
    });

    return Math.max(0, totalPhysical - overlappingBookings.length);
  };

  // Helper: Get price for a category on selected month
  const getPrice = (cat: any) => {
    if (!cat) return 0;
    if (!range.from) return Number(cat.price);

    const month = range.from.getMonth() + 1; // 1-12
    const seasonal = cat.room_seasonal_prices?.find((sp: any) => sp.month === month);
    return seasonal && seasonal.price ? Number(seasonal.price) : Number(cat.price);
  };

  const activeRooms = dbCategories ? dbCategories.map((cat, i) => {
    const avail = getAvailability(cat.id);
    return {
      id: cat.id,
      name: cat.name,
      tagline: `Capacity: ${cat.occupancy} Guests`,
      price: getPrice(cat),
      available: avail,
      adults: cat.occupancy,
      children: 1,
      hero: cat.image_url || (ROOMS[i % ROOMS.length].hero)
    };
  }) : [];

  const room = activeRooms.find((r) => r.id === roomId) || null;
  const nights = range.from && range.to ? Math.max(1, Math.ceil((+range.to - +range.from) / 86400000)) : 0;
  const baseSubtotal = room ? room.price * Math.max(nights, 1) * numRooms : 0;
  const mattressPrice = room ? (dbCategories?.find(c => c.id === room.id)?.extra_mattress_price || 0) : 0;
  const mattressTotal = extraMattress * Number(mattressPrice) * Math.max(nights, 1);
  const subtotal = baseSubtotal + mattressTotal;
  const gstRate = globalSettings?.gst_percentage ? Number(globalSettings.gst_percentage) / 100 : 0.12;
  const taxes = Math.round(subtotal * gstRate);
  const discount = appliedCoupon ? Math.round(subtotal * appliedCoupon.off) : 0;
  const total = subtotal + taxes - discount;

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current.querySelectorAll(".step-anim"),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.07 }
    );
  }, [step]);

  // Animate price changes
  const priceRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!priceRef.current) return;
    gsap.fromTo(priceRef.current, { scale: 1.15, opacity: 0.6 }, { scale: 1, opacity: 1, duration: 0.6, ease: "power2.out" });
  }, [total]);

  const validateStep = () => {
    if (step === 0) return !!room;
    if (step === 1) return !!(range.from && range.to);
    if (step === 2)
      return !!(guest.name.trim() && /\S+@\S+\.\S+/.test(guest.email) && guest.phone.trim().length >= 7);
    return true;
  };
  const canNext = validateStep();

  const next = async () => {
    setTouched(true);
    if (step === 3) { 
      setIsSubmitting(true);
      try {
        await supabase.from("bookings").insert({
          room_id: roomId, // Now refers to category_id
          guest_name: guest.name,
          guest_email: guest.email,
          start_date: range.from?.toISOString().split('T')[0],
          end_date: range.to?.toISOString().split('T')[0],
          total_price: total,
          status: 'pending'
        });
        setDone(true); 
      } catch (err) {
        console.error("Booking error", err);
      } finally {
        setIsSubmitting(false);
      }
      return; 
    }
    if (canNext) { setStep((s) => s + 1); setTouched(false); }
  };

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (!code) { setCouponError("Enter a coupon code"); return; }
    const found = COUPONS[code];
    if (!found) { setCouponError("That seal is not recognised"); setAppliedCoupon(null); return; }
    setAppliedCoupon(found);
    setCouponError("");
  };

  // SUCCESS MODAL
  if (done) {
    return (
      <PageShell title="Reservation Sealed — Raj Mandir" description="Your royal chamber has been reserved.">
        <PageHero
          eyebrow="THE GATES OPEN"
          title="A chamber"
          accent="awaits you"
          subtitle="Your reservation has been pressed into the palace ledger."
          image={heroImg}
          alt="Royal palace chamber"
        />
        <div className="fixed inset-0 z-[100] bg-royal-deep/85 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
          <div className="relative max-w-xl w-full p-12 text-center bg-card backdrop-blur-md border border-gold/50 shadow-gold animate-scale-in">
            <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold" />
            <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold" />
            <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold" />
            <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold" />

            <div className="mx-auto mb-6 w-20 h-20 jharokha bg-gradient-gold flex items-center justify-center shadow-gold">
              <Check className="text-royal-deep" size={36} strokeWidth={3} />
            </div>
            <div className="eyebrow mb-3">★ RESERVATION SEALED ★</div>
            <h2 className="font-display text-4xl text-foreground mb-4">
              Welcome, <span className="text-gold-gradient italic">{guest.name.split(" ")[0]}</span>
            </h2>
            <div className="divider-gold max-w-xs mx-auto my-6"><span className="text-gold">❖</span></div>
            <div className="font-serif text-lg text-foreground space-y-2">
              <div>{room?.name} · {numRooms} {numRooms === 1 ? "room" : "rooms"} · {nights} {nights === 1 ? "night" : "nights"}</div>
              <div className="text-muted-foreground italic">
                {range.from && format(range.from, "PPP")} — {range.to && format(range.to, "PPP")}
              </div>
              <div className="font-display text-3xl text-gold-gradient mt-4">₹ {total.toLocaleString("en-IN")}</div>
            </div>
            <p className="font-serif italic text-muted-foreground mt-6 text-sm">
              A confirmation parchment shall arrive at <span className="text-gold">{guest.email}</span>.
            </p>
            <div className="mt-8 flex gap-3 justify-center">
              <Link to="/" className="px-6 py-3 border border-gold/50 text-foreground font-serif-sc tracking-[0.2em] text-[11px] hover:border-gold hover:bg-gold/5 transition-all">
                RETURN TO PALACE
              </Link>
              <button onClick={() => window.print()} className="px-6 py-3 bg-gradient-gold text-royal-deep font-serif-sc tracking-[0.2em] text-[11px] shadow-gold hover:scale-105 transition-all">
                PRINT PARCHMENT
              </button>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Reserve a Royal Chamber — Raj Mandir Guest House"
      description="A four-step royal reservation flow at Raj Mandir Guest House, Jodhpur."
    >
      <PageHero
        eyebrow="ROYAL RESERVATION"
        title="Reserve your"
        accent="chamber"
        subtitle="Four small ceremonies stand between you and the palace gates."
        image={heroImg}
        alt="Royal chamber interior"
      />

      <section ref={ref} className="relative py-24 px-6 marble-texture">
        <div className="relative max-w-7xl mx-auto">
          {/* Progress */}
          <div className="flex items-center justify-between mb-14 max-w-3xl mx-auto">
            {steps.map((s, i) => (
              <div key={s} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      "w-12 h-8 jharokha flex items-center justify-center font-display text-xs transition-all duration-700 border",
                      i < step && "bg-gradient-gold text-royal-deep border-gold shadow-gold",
                      i === step && "bg-royal-deep text-gold border-gold shadow-gold scale-110",
                      i > step && "bg-transparent text-muted-foreground border-gold/30"
                    )}
                  >
                    {i < step ? <Check size={14} /> : i + 1}
                  </div>
                  <div className="font-serif-sc text-[9px] tracking-[0.25em] mt-2 text-center text-muted-foreground hidden sm:block">
                    {s.toUpperCase()}
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div className={cn("h-px flex-1 transition-all duration-700", i < step ? "bg-gold" : "bg-gold/20")} />
                )}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Step content */}
            <div className="lg:col-span-2 relative p-8 md:p-10 bg-card/70 backdrop-blur-md border border-gold/30 shadow-frame min-h-[480px]">
              <span className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-gold" />
              <span className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-gold" />
              <span className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-gold" />
              <span className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-gold" />

              {/* STEP 0 — CHAMBER */}
              {step === 0 && (
                <div>
                  <h3 className="step-anim font-display text-3xl text-foreground mb-2">Choose your chamber</h3>
                  <p className="step-anim font-serif italic text-muted-foreground mb-8">Each is a different mood of the palace.</p>
                  <div className="space-y-5">
                    {activeRooms.map((r) => {
                      const isNotAvailable = r.available === 0;
                      return (
                        <button
                          key={r.id}
                          disabled={isNotAvailable}
                          onClick={() => setRoomId(r.id)}
                          className={cn(
                            "step-anim w-full text-left flex gap-5 p-4 border transition-all duration-700 hover:-translate-y-1",
                            roomId === r.id ? "border-gold bg-gold/10 shadow-gold" : "border-gold/20 hover:border-gold/60",
                            isNotAvailable && "opacity-50 grayscale cursor-not-allowed"
                          )}
                        >
                          <div className="w-28 h-24 overflow-hidden jharokha-frame shrink-0">
                            <img src={r.hero} alt={r.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <div className="font-display text-xl text-foreground">{r.name}</div>
                            <div className="font-serif italic text-sm text-muted-foreground mt-1">{r.tagline}</div>
                            <div className="flex items-center gap-3 mt-3">
                              <span className="font-serif-sc text-gold tracking-[0.2em] text-xs">
                                ₹ {r.price.toLocaleString("en-IN")} <span className="text-muted-foreground">/ NIGHT</span>
                              </span>
                              {isNotAvailable ? (
                                <span className="text-[9px] px-2 py-0.5 border border-red-500 text-red-500 font-serif-sc tracking-[0.2em] bg-red-500/10 uppercase">
                                  Not Available
                                </span>
                              ) : r.available <= 2 && (
                                <span className="text-[9px] px-2 py-0.5 border border-saffron text-saffron font-serif-sc tracking-[0.2em] bg-saffron/10">
                                  ONLY {r.available} LEFT
                                </span>
                              )}
                            </div>
                          </div>
                          {roomId === r.id && <Check className="text-gold self-center" size={22} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 1 — STAY DETAILS */}
              {step === 1 && (
                <div>
                  <h3 className="step-anim font-display text-3xl text-foreground mb-2">Your stay</h3>
                  <p className="step-anim font-serif italic text-muted-foreground mb-8">When shall the palace prepare your chamber?</p>

                  <div className="step-anim grid md:grid-cols-2 gap-6 mb-8">
                    <DateField
                      label="ARRIVAL"
                      date={range.from}
                      onSelect={(d) => setRange({ ...range, from: d })}
                      disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                    <DateField
                      label="DEPARTURE"
                      date={range.to}
                      onSelect={(d) => setRange({ ...range, to: d })}
                      disabled={(d) => !range.from || d <= range.from!}
                    />
                  </div>

                  <div className="step-anim grid md:grid-cols-2 gap-6 mb-8">
                    <Counter label="ADULTS" sub="13 years and over" value={adults} setValue={setAdults} min={1} max={room ? room.adults * numRooms : 8} />
                    <Counter label="CHILDREN" sub="under 12 years" value={children} setValue={setChildren} min={0} max={room ? room.children * numRooms : 4} />
                  </div>

                  <div className="step-anim grid md:grid-cols-2 gap-6 mb-8">
                    <Counter label="ROOMS" sub="of selected chamber" value={numRooms} setValue={setNumRooms} min={1} max={room?.available || 3} />
                    <Counter label="EXTRA MATTRESS" sub={`+ ₹${EXTRA_MATTRESS_PRICE.toLocaleString("en-IN")} / night`} value={extraMattress} setValue={setExtraMattress} min={0} max={2} icon={<Bed size={14} />} />
                  </div>

                  {/* Room type swap */}
                  <div className="step-anim">
                    <label className="font-serif-sc text-[11px] tracking-[0.4em] text-gold block mb-3">CHAMBER TYPE</label>
                    <div className="relative">
                      <select
                        value={roomId || ""}
                        onChange={(e) => setRoomId(e.target.value)}
                        className="w-full appearance-none bg-transparent border-b border-gold/40 focus:border-gold outline-none px-1 py-3 pr-10 font-serif text-lg text-foreground cursor-pointer"
                      >
                        {activeRooms.map((r) => (
                          <option key={r.id} value={r.id} className="bg-card text-foreground">
                            {r.name} — ₹ {r.price.toLocaleString("en-IN")} / night
                          </option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 text-gold rotate-90 pointer-events-none" size={16} />
                    </div>
                  </div>

                  {nights > 0 && (
                    <div className="step-anim text-center mt-8 font-serif italic text-foreground">
                      <span className="text-gold-gradient text-2xl font-display">{nights}</span> {nights === 1 ? "night" : "nights"} of palace stay · {numRooms} {numRooms === 1 ? "room" : "rooms"}
                    </div>
                  )}
                  {touched && !canNext && (
                    <ValidationLine msg="Please choose both arrival and departure dates." />
                  )}
                </div>
              )}

              {/* STEP 2 — GUEST */}
              {step === 2 && (
                <div>
                  <h3 className="step-anim font-display text-3xl text-foreground mb-2">Royal guest details</h3>
                  <p className="step-anim font-serif italic text-muted-foreground mb-8">For the welcome scroll at your chamber door.</p>
                  <div className="space-y-7">
                    <div className="step-anim grid md:grid-cols-2 gap-7">
                      <BField label="Full Name" value={guest.name} onChange={(v) => setGuest({ ...guest, name: v })} maxLength={100} required touched={touched} validate={(v) => v.trim().length > 1} err="Please enter your name" />
                      <BField label="Email" type="email" value={guest.email} onChange={(v) => setGuest({ ...guest, email: v })} maxLength={120} required touched={touched} validate={(v) => /\S+@\S+\.\S+/.test(v)} err="A valid email, please" />
                    </div>
                    <div className="step-anim">
                      <BField label="Phone" value={guest.phone} onChange={(v) => setGuest({ ...guest, phone: v })} maxLength={30} required touched={touched} validate={(v) => v.trim().length >= 7} err="Please enter a phone number" />
                    </div>
                    <div className="step-anim">
                      <label className="font-serif-sc text-[11px] tracking-[0.4em] text-gold block mb-3">SPECIAL WISHES</label>
                      <textarea
                        rows={3}
                        maxLength={500}
                        value={guest.notes}
                        onChange={(e) => setGuest({ ...guest, notes: e.target.value })}
                        placeholder="Saffron tea on arrival, jharokha-facing chamber…"
                        className="w-full bg-transparent border-b border-gold/40 focus:border-gold outline-none px-1 py-3 font-serif italic text-lg text-foreground focus:shadow-[0_4px_30px_-15px_hsl(var(--gold))] transition-all duration-700 resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3 — CONFIRM */}
              {step === 3 && (
                <div className="step-anim">
                  <h3 className="font-display text-3xl text-foreground mb-2">Confirm your reservation</h3>
                  <p className="font-serif italic text-muted-foreground mb-8">A final glance before the palace seal.</p>
                  <div className="space-y-3 font-serif text-foreground">
                    <Row k="Chamber" v={room?.name || ""} />
                    <Row k="Rooms" v={`${numRooms}`} />
                    <Row k="Arrival" v={range.from ? format(range.from, "PPP") : ""} />
                    <Row k="Departure" v={range.to ? format(range.to, "PPP") : ""} />
                    <Row k="Nights" v={`${nights}`} />
                    <Row k="Guests" v={`${adults} adults · ${children} children`} />
                    {extraMattress > 0 && <Row k="Extra Mattress" v={`${extraMattress}`} />}
                    <Row k="Guest" v={guest.name} />
                    <Row k="Email" v={guest.email} />
                    {appliedCoupon && <Row k="Coupon" v={appliedCoupon.label} />}
                  </div>
                </div>
              )}
            </div>

            {/* SUMMARY */}
            <aside className="relative p-8 bg-gradient-night text-ivory border border-gold/30 shadow-frame self-start sticky top-28 overflow-hidden">
              <div className="absolute inset-0 lattice-pattern opacity-10 pointer-events-none" />
              <div className="relative">
                <div className="font-serif-sc text-gold tracking-[0.4em] text-[10px] mb-4">★ ROYAL LEDGER ★</div>
                <h4 className="font-display text-2xl text-ivory mb-6">Your Reservation</h4>
                <div className="divider-gold mb-6"><span className="text-gold text-xs">❖</span></div>

                <div className="space-y-4 font-serif text-sm">
                  <SumRow k="Chamber" v={room?.name || "—"} />
                  <SumRow k="Rooms × Nights" v={nights ? `${numRooms} × ${nights}` : "—"} />
                  <SumRow k="Guests" v={`${adults}+${children}`} />
                  {extraMattress > 0 && <SumRow k="Extra Mattress" v={`${extraMattress}`} />}
                </div>

                {/* Price breakdown */}
                {room && nights > 0 && (
                  <div className="mt-6 pt-5 border-t border-gold/20 space-y-2 font-serif text-sm text-ivory/85">
                    <Line k="Subtotal" v={`₹ ${baseSubtotal.toLocaleString("en-IN")}`} />
                    {mattressTotal > 0 && <Line k="Mattress" v={`₹ ${mattressTotal.toLocaleString("en-IN")}`} />}
                    <Line k="Taxes (12%)" v={`₹ ${taxes.toLocaleString("en-IN")}`} />
                    {discount > 0 && <Line k={`Discount · ${appliedCoupon?.label}`} v={`− ₹ ${discount.toLocaleString("en-IN")}`} highlight />}
                  </div>
                )}

                {/* COUPON CARD */}
                <div className="mt-6 relative p-4 border border-dashed border-gold/50 bg-gold/5">
                  <div className="absolute -top-2 left-3 px-2 bg-royal-deep font-serif-sc text-[9px] tracking-[0.4em] text-gold flex items-center gap-1">
                    <Tag size={10} /> ROYAL COUPON
                  </div>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between mt-1">
                      <div>
                        <div className="font-display text-gold text-lg">{appliedCoupon.label}</div>
                        <div className="font-serif italic text-xs text-ivory/70">{appliedCoupon.desc}</div>
                      </div>
                      <button onClick={() => { setAppliedCoupon(null); setCoupon(""); }} className="text-ivory/60 hover:text-gold transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-1 space-y-2">
                      <div className="flex gap-2">
                        <input
                          value={coupon}
                          onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setCouponError(""); }}
                          placeholder="ROYAL10"
                          maxLength={20}
                          className="flex-1 bg-transparent border-b border-gold/40 focus:border-gold outline-none px-1 py-1.5 font-display text-sm tracking-[0.2em] text-ivory placeholder:text-ivory/30"
                        />
                        <button
                          onClick={applyCoupon}
                          className="px-3 py-1.5 bg-gold/20 hover:bg-gradient-gold hover:text-royal-deep text-gold border border-gold/40 font-serif-sc text-[10px] tracking-[0.3em] transition-all duration-500"
                        >
                          APPLY
                        </button>
                      </div>
                      {couponError && (
                        <div className="flex items-center gap-2 text-[10px] font-serif italic text-saffron">
                          <AlertCircle size={11} /> {couponError}
                        </div>
                      )}
                      <div className="font-serif italic text-[10px] text-ivory/50">try ROYAL10 · HERITAGE25 · MAHARAJA</div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-5 border-t border-gold/30 flex items-baseline justify-between">
                  <div className="font-serif-sc text-[10px] tracking-[0.4em] text-gold">TOTAL</div>
                  <div ref={priceRef} className="font-display text-3xl text-gold-gradient">
                    ₹ {total.toLocaleString("en-IN")}
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => { setStep((s) => Math.max(0, s - 1)); setTouched(false); }}
                    disabled={step === 0 || isSubmitting}
                    className="flex-1 px-4 py-3 border border-gold/40 text-ivory font-serif-sc tracking-[0.2em] text-[11px] hover:border-gold disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-500 flex items-center justify-center gap-2"
                  >
                    <ChevronLeft size={14} /> BACK
                  </button>
                  <button
                    onClick={next}
                    disabled={isSubmitting || !canNext}
                    className={cn(
                      "flex-1 px-4 py-3 font-serif-sc tracking-[0.2em] text-[11px] transition-all duration-500 flex items-center justify-center gap-2",
                      canNext && !isSubmitting
                        ? "bg-gradient-gold text-royal-deep shadow-gold hover:scale-[1.02]"
                        : "bg-gold/30 text-royal-deep/60 cursor-not-allowed"
                    )}
                  >
                    {isSubmitting ? "SEALING..." : step === 3 ? <><Sparkles size={14} /> SEAL</> : <>NEXT <ChevronRight size={14} /></>}
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </PageShell>
  );
};

/* ---------- helpers ---------- */

const DateField = ({
  label, date, onSelect, disabled,
}: { label: string; date?: Date; onSelect: (d: Date) => void; disabled?: (d: Date) => boolean }) => (
  <div>
    <label className="font-serif-sc text-[11px] tracking-[0.4em] text-gold block mb-3">{label}</label>
    <Popover>
      <PopoverTrigger asChild>
        <button className="w-full flex items-center justify-between border-b border-gold/40 hover:border-gold transition-colors px-1 py-3 font-serif italic text-lg text-foreground">
          <span className={cn(!date && "text-muted-foreground/60")}>
            {date ? format(date, "PPP") : "Pick a date"}
          </span>
          <CalendarIcon className="text-gold" size={16} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-gold/40" align="start">
        <Calendar mode="single" selected={date} onSelect={(d) => d && onSelect(d)} disabled={disabled} initialFocus className={cn("p-3 pointer-events-auto bg-card")} />
      </PopoverContent>
    </Popover>
  </div>
);

const Counter = ({
  label, sub, value, setValue, min, max, icon,
}: { label: string; sub?: string; value: number; setValue: (n: number) => void; min: number; max: number; icon?: React.ReactNode }) => (
  <div>
    <label className="font-serif-sc text-[11px] tracking-[0.4em] text-gold mb-3 flex items-center gap-2">{icon}{label}</label>
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => setValue(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-10 h-10 border border-gold/40 hover:border-gold hover:bg-gold/10 disabled:opacity-30 transition-all flex items-center justify-center text-gold"
      >
        <Minus size={14} />
      </button>
      <div className="flex-1 text-center">
        <div className="font-display text-3xl text-gold-gradient">{value}</div>
        {sub && <div className="font-serif italic text-[11px] text-muted-foreground">{sub}</div>}
      </div>
      <button
        type="button"
        onClick={() => setValue(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-10 h-10 border border-gold/40 hover:border-gold hover:bg-gold/10 disabled:opacity-30 transition-all flex items-center justify-center text-gold"
      >
        <Plus size={14} />
      </button>
    </div>
  </div>
);

const BField = ({
  label, value, onChange, type = "text", maxLength, required, touched, validate, err,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; maxLength?: number; required?: boolean; touched?: boolean; validate?: (v: string) => boolean; err?: string }) => {
  const invalid = touched && required && validate && !validate(value);
  return (
    <div>
      <label className="font-serif-sc text-[11px] tracking-[0.4em] text-gold block mb-3">{label.toUpperCase()}</label>
      <input
        type={type}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full bg-transparent border-b outline-none px-1 py-3 font-serif text-lg text-foreground transition-all duration-700",
          invalid ? "border-saffron focus:shadow-[0_4px_30px_-15px_hsl(var(--saffron))]" : "border-gold/40 focus:border-gold focus:shadow-[0_4px_30px_-15px_hsl(var(--gold))]"
        )}
      />
      {invalid && (
        <div className="flex items-center gap-2 mt-2 text-[10px] font-serif italic text-saffron">
          <AlertCircle size={11} /> {err}
        </div>
      )}
    </div>
  );
};

const ValidationLine = ({ msg }: { msg: string }) => (
  <div className="mt-6 flex items-center gap-2 text-sm font-serif italic text-saffron">
    <AlertCircle size={14} /> {msg}
  </div>
);

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex items-center justify-between py-3 border-b border-gold/20">
    <span className="font-serif-sc text-[10px] tracking-[0.3em] text-gold">{k.toUpperCase()}</span>
    <span className="font-serif italic">{v || "—"}</span>
  </div>
);

const SumRow = ({ k, v }: { k: string; v: string }) => (
  <div className="flex items-center justify-between">
    <span className="font-serif-sc text-[10px] tracking-[0.3em] text-ivory/60">{k.toUpperCase()}</span>
    <span className="font-serif italic text-ivory">{v}</span>
  </div>
);

const Line = ({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) => (
  <div className="flex items-center justify-between">
    <span className={cn("font-serif italic text-xs", highlight ? "text-gold-glow" : "text-ivory/70")}>{k}</span>
    <span className={cn("font-serif", highlight && "text-gold-gradient font-display")}>{v}</span>
  </div>
);

export default Booking;
