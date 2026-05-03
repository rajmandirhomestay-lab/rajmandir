import maharaja from "@/assets/room-maharaja.jpg";
import rajwada from "@/assets/room-rajwada.jpg";
import haveli from "@/assets/room-haveli.jpg";
import about from "@/assets/about-palace.jpg";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import g5 from "@/assets/gallery-5.jpg";
import g6 from "@/assets/gallery-6.jpg";

export type RoomData = {
  id: string;
  name: string;
  sanskrit: string;
  tagline: string;
  story: string;
  hero: string;
  gallery: string[];
  price: number;
  oldPrice?: number;
  size: string;
  bed: string;
  view: string;
  adults: number;
  children: number;
  amenities: { icon: string; label: string; note: string }[];
  highlights: string[];
  available: number; // remaining rooms
};

export const ROOMS: RoomData[] = [
  {
    id: "maharaja",
    name: "Maharaja Suite",
    sanskrit: "महाराजा सूट",
    tagline: "The chamber of kings — frescoed ceilings, lapis & gold.",
    story:
      "A canopied four-poster of carved sheesham presides beneath a frescoed ceiling of lapis and gold. Brass lanterns cast slow shadows; the desert wind enters through three jharokha balconies that have watched over Jodhpur for one hundred and thirty winters. Wake to the sound of temple bells, retire to a copper tub set in marble.",
    hero: maharaja,
    gallery: [maharaja, about, g1, g4, g6, rajwada],
    price: 18500,
    oldPrice: 22000,
    size: "72 sq.m",
    bed: "King Canopy Bed",
    view: "Mehrangarh Fort",
    adults: 2,
    children: 2,
    available: 2,
    amenities: [
      { icon: "✦", label: "Private Terrace", note: "with rooftop divan" },
      { icon: "❖", label: "Marble Bath", note: "antique copper tub" },
      { icon: "♛", label: "Butler Service", note: "on call, 24 hrs" },
      { icon: "❀", label: "Curated Mini-Bar", note: "rajasthani spirits" },
      { icon: "✺", label: "Frescoed Ceiling", note: "hand-restored" },
      { icon: "☼", label: "Heritage Breakfast", note: "served in chamber" },
      { icon: "✧", label: "Silk Linens", note: "bandhani & brocade" },
      { icon: "♪", label: "Evening Sitar", note: "by request" },
    ],
    highlights: [
      "Three jharokha balconies overlooking the old city",
      "Hand-painted ceiling restored by Jodhpur master artisans",
      "Private rooftop access with sunset chai service",
    ],
  },
  {
    id: "rajwada",
    name: "Rajwada Chamber",
    sanskrit: "राजवाड़ा कक्ष",
    tagline: "Of indigo rooftops and morning light through carved jali.",
    story:
      "Indigo walls washed by hand, a low divan layered in bandhani silk, and jharokha windows that frame the blue rooftops of the old city. Wake to temple bells; sleep to the call of a peacock from the courtyard below.",
    hero: rajwada,
    gallery: [rajwada, g2, g3, maharaja, g5, about],
    price: 12500,
    oldPrice: 14800,
    size: "48 sq.m",
    bed: "Queen Bed",
    view: "Blue City Rooftops",
    adults: 2,
    children: 1,
    available: 4,
    amenities: [
      { icon: "✦", label: "Jharokha Alcove", note: "reading nook" },
      { icon: "❖", label: "Marble Bath", note: "rain shower" },
      { icon: "❀", label: "Hand-Painted Ceiling", note: "indigo & gold" },
      { icon: "☼", label: "Heritage Breakfast", note: "rooftop service" },
      { icon: "✧", label: "Silk Furnishings", note: "bandhani throws" },
      { icon: "♪", label: "Evening Aarti View", note: "from balcony" },
    ],
    highlights: [
      "Original 1894 hand-painted ceiling",
      "Jharokha alcove framing the blue city",
      "Bandhani silk furnishings woven in Jodhpur",
    ],
  },
  {
    id: "haveli",
    name: "Haveli Courtyard",
    sanskrit: "हवेली आँगन",
    tagline: "Where the fountain still sings beneath carved sandstone.",
    story:
      "A ground-floor sanctuary opening onto the inner courtyard — heirloom carpets, a quiet fountain at its centre, and a private veranda screened by carved sandstone jali. The painted ceiling above is original, restored leaf by leaf.",
    hero: haveli,
    gallery: [haveli, g4, g6, g1, rajwada, about],
    price: 8500,
    size: "38 sq.m",
    bed: "Twin or Queen",
    view: "Inner Courtyard",
    adults: 2,
    children: 1,
    available: 6,
    amenities: [
      { icon: "✦", label: "Courtyard Veranda", note: "private screened" },
      { icon: "❖", label: "Sandstone Bath", note: "hand-carved basin" },
      { icon: "❀", label: "Heirloom Carpets", note: "from Bikaner" },
      { icon: "☼", label: "Yoga at Dawn", note: "on courtyard lawn" },
      { icon: "♪", label: "Fountain Soundtrack", note: "all hours" },
      { icon: "✧", label: "Heritage Breakfast", note: "in courtyard" },
    ],
    highlights: [
      "Original restored painted ceiling",
      "Private veranda screened by sandstone jali",
      "Direct access to the singing fountain courtyard",
    ],
  },
];

export const getRoom = (id: string) => ROOMS.find((r) => r.id === id);
