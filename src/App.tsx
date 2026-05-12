import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Rooms from "./pages/Rooms.tsx";
import RoomDetail from "./pages/RoomDetail.tsx";
import Stories from "./pages/Stories.tsx";
import Dining from "./pages/Dining.tsx";
import Experiences from "./pages/Experiences.tsx";
import Attractions from "./pages/Attractions.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import Booking from "./pages/Booking.tsx";
import Feedback from "./pages/Feedback.tsx";
import GalleryPage from "./pages/Gallery.tsx";
import FAQ from "./pages/FAQ.tsx";
import AdminLogin from "./pages/admin/Login.tsx";
import { ProtectedRoute } from "./components/admin/ProtectedRoute.tsx";
import { AdminLayout } from "./components/admin/AdminLayout.tsx";
import Dashboard from "./pages/admin/Dashboard.tsx";
import HomepageCMS from "./pages/admin/HomepageCMS.tsx";
import RoomsCMS from "./pages/admin/RoomsCMS.tsx";
import RoomCategoriesCMS from "./pages/admin/RoomCategoriesCMS.tsx";
import PhysicalRoomsCMS from "./pages/admin/PhysicalRoomsCMS.tsx";
import GalleryCMS from "./pages/admin/GalleryCMS.tsx";
import MediaCMS from "./pages/admin/MediaCMS.tsx";
import StoriesCMS from "./pages/admin/StoriesCMS.tsx";
import DiningCMS from "./pages/admin/DiningCMS.tsx";
import DiningDishesCMS from "./pages/admin/DiningDishesCMS.tsx";
import AttractionsCMS from "./pages/admin/AttractionsCMS.tsx";
import ExperiencesCMS from "./pages/admin/ExperiencesCMS.tsx";
import BookingsCMS from "./pages/admin/BookingsCMS.tsx";
import ReviewsCMS from "./pages/admin/ReviewsCMS.tsx";
import FAQCMS from "./pages/admin/FAQCMS.tsx";
import OffersCMS from "./pages/admin/OffersCMS.tsx";
import SettingsCMS from "./pages/admin/SettingsCMS.tsx";
import NavigationCMS from "./pages/admin/NavigationCMS.tsx";
import SliderSettingsCMS from "./pages/admin/SliderSettingsCMS.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:id" element={<RoomDetail />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/dining" element={<Dining />} />
          <Route path="/experiences" element={<Experiences />} />
          <Route path="/attractions" element={<Attractions />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/faq" element={<FAQ />} />

          {/* ADMIN ROUTES */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/homepage" element={<HomepageCMS />} />
              <Route path="/admin/rooms" element={<RoomsCMS />} />
              <Route path="/admin/room-categories" element={<RoomCategoriesCMS />} />
              <Route path="/admin/physical-rooms" element={<PhysicalRoomsCMS />} />
              <Route path="/admin/bookings" element={<BookingsCMS />} />
              <Route path="/admin/media" element={<MediaCMS />} />
              <Route path="/admin/gallery" element={<GalleryCMS />} />
              <Route path="/admin/dining" element={<DiningCMS />} />
              <Route path="/admin/dining-dishes" element={<DiningDishesCMS />} />
              <Route path="/admin/experiences" element={<ExperiencesCMS />} />
              <Route path="/admin/attractions" element={<AttractionsCMS />} />
              <Route path="/admin/stories" element={<StoriesCMS />} />
              <Route path="/admin/reviews" element={<ReviewsCMS />} />
              <Route path="/admin/faq" element={<FAQCMS />} />
              <Route path="/admin/offers" element={<OffersCMS />} />
              <Route path="/admin/navigation" element={<NavigationCMS />} />
              <Route path="/admin/settings" element={<SettingsCMS />} />
              <Route path="/admin/sliders" element={<SliderSettingsCMS />} />
            </Route>
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
