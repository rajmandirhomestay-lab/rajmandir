import { supabase } from "./supabase";
import { useQuery } from "@tanstack/react-query";

// 1. Rooms
export const fetchRooms = async () => {
  const { data, error } = await supabase
    .from("rooms")
    .select(`
      *,
      room_images (
        storage_path,
        is_featured
      ),
      room_amenities (
        amenities (
          name,
          icon
        )
      )
    `)
    .eq("is_available", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
};

export const useRooms = () => useQuery({
  queryKey: ["rooms"],
  queryFn: fetchRooms,
});

export const fetchRoomBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from("rooms")
    .select(`
      *,
      room_images (
        storage_path,
        is_featured
      ),
      room_amenities (
        amenities (
          name,
          icon
        )
      )
    `)
    .eq("slug", slug)
    .single();

  if (error) throw error;
  return data;
};

export const useRoom = (slug: string) => useQuery({
  queryKey: ["room", slug],
  queryFn: () => fetchRoomBySlug(slug),
  enabled: !!slug,
});



// ---- HOMEPAGE AMENITIES ----
export const useHomepageAmenities = () => {
  return useQuery({
    queryKey: ['homepage_amenities'],
    queryFn: async () => {
      const { data, error } = await supabase.from('homepage_amenities').select('*').order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    }
  });
};

// ---- PAYMENT SETTINGS & MANUAL PAYMENTS ----
export const usePaymentSettings = () => {
  return useQuery({
    queryKey: ['payment_settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('payment_settings').select('*').limit(1).maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });
};

export const useManualPayments = () => {
  return useQuery({
    queryKey: ['manual_payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manual_payment_submissions')
        .select('*, bookings(booking_number, start_date, end_date, total_price, num_rooms, room_id)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });
};

// 2. Gallery
export const fetchGallery = async () => {
  const { data, error } = await supabase
    .from("gallery")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
};

export const useGallery = () => useQuery({
  queryKey: ["gallery"],
  queryFn: fetchGallery,
});

// 3. Dining Areas (Experiences)
export const fetchDiningAreas = async () => {
  const { data, error } = await supabase
    .from("dining_areas")
    .select("*, dining_area_images(*)")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
};

export const useDiningAreas = () => useQuery({
  queryKey: ["dining_areas"],
  queryFn: fetchDiningAreas,
});

// 3.5 Dishes (Menu Items)
export const fetchDishes = async () => {
  try {
    const { data, error } = await supabase
      .from("dishes")
      .select("*");
    if (error) {
      console.error("fetchDishes error:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("fetchDishes catch error:", err);
    return [];
  }
};

export const useDishes = () => useQuery({
  queryKey: ["dishes"],
  queryFn: fetchDishes,
});

// Generic Content Images fetcher
export const fetchContentImages = async (parentId: string, parentType: string) => {
  const { data, error } = await supabase
    .from("content_images")
    .select("*")
    .eq("parent_id", parentId)
    .eq("parent_type", parentType)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
};

// 4. Experiences
export const fetchExperiences = async () => {
  const { data, error } = await supabase
    .from("experiences")
    .select("*, experience_images(*)")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
};

export const useExperiences = () => useQuery({
  queryKey: ["experiences"],
  queryFn: fetchExperiences,
});

// 5. Travel Stories
export const fetchStories = async () => {
  const { data, error } = await supabase
    .from("travel_stories")
    .select("*, travel_story_images(*)")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
};

export const useStories = () => useQuery({
  queryKey: ["stories"],
  queryFn: fetchStories,
});

// 6. Attractions
export const fetchAttractions = async () => {
  const { data, error } = await supabase
    .from("attractions")
    .select("*, attraction_images(*)")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
};

export const useAttractions = () => useQuery({
  queryKey: ["attractions"],
  queryFn: fetchAttractions,
});

export const fetchAttractionBySlugOrId = async (identifier: string) => {
  if (!identifier) return null;
  let { data, error } = await supabase
    .from("attractions")
    .select("*, attraction_images(*)")
    .eq("slug", identifier)
    .maybeSingle();

  if (!data) {
    const res = await supabase
      .from("attractions")
      .select("*, attraction_images(*)")
      .eq("id", identifier)
      .maybeSingle();
    data = res.data;
    error = res.error;
  }

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const useAttraction = (identifier: string) => useQuery({
  queryKey: ["attraction", identifier],
  queryFn: () => fetchAttractionBySlugOrId(identifier),
  enabled: !!identifier,
});

export const fetchStoryBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from("travel_stories")
    .select("*, travel_story_images(*)")
    .eq("slug", slug)
    .single();

  if (error) throw error;
  return data;
};

export const useStory = (slug: string) => useQuery({
  queryKey: ["story", slug],
  queryFn: () => fetchStoryBySlug(slug),
  enabled: !!slug,
});

// Slider Settings
export const fetchSliderSettings = async (section_name: string) => {
  const { data, error } = await supabase
    .from("slider_settings")
    .select("*")
    .eq("section_name", section_name)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is no rows returned
  return data;
};

export const useSliderSettings = (section_name: string) => useQuery({
  queryKey: ["slider_settings", section_name],
  queryFn: () => fetchSliderSettings(section_name),
  enabled: !!section_name,
});

// 6. Reviews
export const fetchReviews = async () => {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const useReviews = () => useQuery({
  queryKey: ["reviews"],
  queryFn: fetchReviews,
});

// 7. FAQs
export const fetchFaqs = async () => {
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
};

export const useFaqs = () => useQuery({
  queryKey: ["faqs"],
  queryFn: fetchFaqs,
});

// 8. Offers
export const fetchOffers = async () => {
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const useOffers = () => useQuery({
  queryKey: ["offers"],
  queryFn: fetchOffers,
});

// 9. Settings / Homepage Sections
export const fetchHomepageSections = async () => {
  const { data, error } = await supabase
    .from("homepage_sections")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
};

export const useHomepageSections = () => useQuery({
  queryKey: ["homepage_sections"],
  queryFn: fetchHomepageSections,
});

// 9.2 Page Heroes
export const fetchPageHeroes = async () => {
  const { data, error } = await supabase
    .from("page_heroes")
    .select("*")
    .order("page_slug", { ascending: true });

  if (error) throw error;
  return data;
};

export const usePageHeroes = () => useQuery({
  queryKey: ["page_heroes"],
  queryFn: fetchPageHeroes,
});

export const fetchPageHero = async (page_slug: string) => {
  const { data, error } = await supabase
    .from("page_heroes")
    .select("*")
    .eq("page_slug", page_slug)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is no rows returned
  return data;
};

export const usePageHero = (page_slug: string) => useQuery({
  queryKey: ["page_hero", page_slug],
  queryFn: () => fetchPageHero(page_slug),
  enabled: !!page_slug,
});

// 9.5 Global Settings
export const fetchSettings = async () => {
  const { data, error } = await supabase.from("settings").select("*");
  if (error) throw error;
  
  const settingsMap: Record<string, any> = {};
  data?.forEach((s) => {
    settingsMap[s.key] = s.value;
  });
  return settingsMap;
};

export const useSettings = () => useQuery({
  queryKey: ["settings"],
  queryFn: fetchSettings,
});
// 10. Room Categories (CMS)
export const fetchRoomCategories = async () => {
  const { data, error } = await supabase
    .from("room_categories")
    .select(`
      *,
      room_category_images (
        id,
        image_url,
        sort_order
      ),
      room_seasonal_prices (
        month,
        price
      ),
      room_calendar_prices (
        id,
        start_date,
        end_date,
        price,
        price_type
      )
    `)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
};

export const useRoomCategories = () => useQuery({
  queryKey: ["room_categories"],
  queryFn: fetchRoomCategories,
});

export const fetchRoomCategoryById = async (id: string) => {
  const { data, error } = await supabase
    .from("room_categories")
    .select(`
      *,
      room_category_images (
        id,
        image_url,
        sort_order
      ),
      room_seasonal_prices (
        month,
        price
      ),
      room_calendar_prices (
        id,
        start_date,
        end_date,
        price,
        price_type
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

export const useRoomCategory = (id: string) => useQuery({
  queryKey: ["room_category", id],
  queryFn: () => fetchRoomCategoryById(id),
  enabled: !!id,
});

// 11. Physical Rooms (inventory)
export const fetchPhysicalRooms = async () => {
  const { data, error } = await supabase
    .from("physical_rooms")
    .select(`*
    `)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
};

export const usePhysicalRooms = () => useQuery({
  queryKey: ["physical_rooms"],
  queryFn: fetchPhysicalRooms,
});

// 12. Media Assets
export const fetchMediaByBucket = async (bucketId: string) => {
  const { data, error } = await supabase
    .from("media_assets")
    .select("*")
    .eq("bucket_id", bucketId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
};

export const useMedia = (bucketId: string) => useQuery({
  queryKey: ["media", bucketId],
  queryFn: () => fetchMediaByBucket(bucketId),
  enabled: !!bucketId,
});

// 13. Timeline Eras
export const fetchTimelineEras = async () => {
  const { data, error } = await supabase
    .from("timeline_eras")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
};

export const useTimelineEras = () => useQuery({
  queryKey: ["timeline_eras"],
  queryFn: fetchTimelineEras,
});

// 14. Bookings (for availability)
export const fetchAllBookings = async () => {
  const { data, error } = await supabase
    .from("bookings")
    .select("*");
  if (error) throw error;
  return data;
};

export const useAllBookings = () => useQuery({
  queryKey: ["all_bookings"],
  queryFn: fetchAllBookings,
});

// 15. About Page Content
export const useAboutContent = () => useQuery({
  queryKey: ["about_page_content"],
  queryFn: async () => {
    const { data, error } = await supabase.from("about_page_content").select("*");
    if (error) throw error;
    return data;
  },
});

export const useAboutFeatures = () => useQuery({
  queryKey: ["about_page_features"],
  queryFn: async () => {
    const { data, error } = await supabase.from("about_page_features").select("*").order("sort_order", { ascending: true });
    if (error) throw error;
    return data;
  },
});

export const useAboutGallery = () => useQuery({
  queryKey: ["about_page_gallery"],
  queryFn: async () => {
    const { data, error } = await supabase.from("about_page_gallery").select("*").order("sort_order", { ascending: true });
    if (error) throw error;
    return data;
  },
});
