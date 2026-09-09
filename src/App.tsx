import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Rooms from "./pages/Rooms";
import RoomDetail from "./pages/RoomDetail";
import Stories from "./pages/Stories";
import Dining from "./pages/Dining";
import Experiences from "./pages/Experiences";
import Attractions from "./pages/Attractions";
import AttractionDetail from "./pages/AttractionDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";
import BookingSuccess from "./pages/BookingSuccess";
import BookingFailed from "./pages/BookingFailed";
import Feedback from "./pages/Feedback";
import GalleryPage from "./pages/Gallery";
import FAQ from "./pages/FAQ";
import DayAtRajMandir from "./pages/DayAtRajMandir";
import AdminLogin from "./pages/admin/Login";
import { ProtectedRoute } from "./components/admin/ProtectedRoute";
import { AdminLayout } from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import PageHeroesCMS from "./pages/admin/PageHeroesCMS";
import DayAtRajMandirCMS from "./pages/admin/DayAtRajMandirCMS";
import EventsCMS from "./pages/admin/EventsCMS";
import RoomsCMS from "./pages/admin/RoomsCMS";
import RoomCategoriesCMS from "./pages/admin/RoomCategoriesCMS";
import PhysicalRoomsCMS from "./pages/admin/PhysicalRoomsCMS";
import GalleryCMS from "./pages/admin/GalleryCMS";
import StoriesCMS from "./pages/admin/StoriesCMS";
import DiningCMS from "./pages/admin/DiningCMS";
import DiningDishesCMS from "./pages/admin/DiningDishesCMS";
import AttractionsCMS from "./pages/admin/AttractionsCMS";
import ExperiencesCMS from "./pages/admin/ExperiencesCMS";
import BookingsCMS from "./pages/admin/BookingsCMS";
import ReviewsCMS from "./pages/admin/ReviewsCMS";
import FAQCMS from "./pages/admin/FAQCMS";
import SettingsCMS from "./pages/admin/SettingsCMS";
import NavigationCMS from "./pages/admin/NavigationCMS";
import SliderSettingsCMS from "./pages/admin/SliderSettingsCMS";
import PaymentSettingsCMS from "./pages/admin/PaymentSettingsCMS";
import ManualPaymentsCMS from "./pages/admin/ManualPaymentsCMS";
import AmenitiesCMS from "./pages/admin/AmenitiesCMS";
import AboutCMS from "./pages/admin/AboutCMS";

import React from "react";

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: any) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: any) { console.error("Uncaught error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: '#900', backgroundColor: '#fee', minHeight: '100vh' }}>
          <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Something went wrong.</h1>
          <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#fff', padding: 16, border: '1px solid #fcc' }}>{this.state.error?.toString()}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#fff', padding: 16, border: '1px solid #fcc', marginTop: 12 }}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
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
            <Route path="/attractions/:id" element={<AttractionDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/booking-success" element={<BookingSuccess />} />
            <Route path="/booking-failed" element={<BookingFailed />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/day-at-raj-mandir" element={<DayAtRajMandir />} />

            {/* ADMIN ROUTES */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/page-heroes" element={<PageHeroesCMS />} />
                <Route path="/admin/day-at-raj-mandir" element={<DayAtRajMandirCMS />} />
                <Route path="/admin/events" element={<EventsCMS />} />
                <Route path="/admin/rooms" element={<RoomsCMS />} />
                <Route path="/admin/room-categories" element={<RoomCategoriesCMS />} />
                <Route path="/admin/physical-rooms" element={<PhysicalRoomsCMS />} />
                <Route path="/admin/bookings" element={<BookingsCMS />} />
                <Route path="/admin/gallery" element={<GalleryCMS />} />
                <Route path="/admin/dining" element={<DiningCMS />} />
                <Route path="/admin/dining-dishes" element={<DiningDishesCMS />} />
                <Route path="/admin/experiences" element={<ExperiencesCMS />} />
                <Route path="/admin/attractions" element={<AttractionsCMS />} />
                <Route path="/admin/stories" element={<StoriesCMS />} />
                <Route path="/admin/reviews" element={<ReviewsCMS />} />
                <Route path="/admin/faq" element={<FAQCMS />} />
                <Route path="/admin/navigation" element={<NavigationCMS />} />
                <Route path="/admin/settings" element={<SettingsCMS />} />
                <Route path="/admin/sliders" element={<SliderSettingsCMS />} />
                <Route path="/admin/payment-settings" element={<PaymentSettingsCMS />} />
                <Route path="/admin/manual-payments" element={<ManualPaymentsCMS />} />
                <Route path="/admin/amenities" element={<AmenitiesCMS />} />
                <Route path="/admin/about" element={<AboutCMS />} />
              </Route>
            </Route>

            {/* CATCH-ALL ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
