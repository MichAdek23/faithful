import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useSEO } from "./hooks/useSEO";
import { HeroSection } from "./sections/HeroSection";
import { FeaturesSection } from "./sections/FeaturesSection";
import { AboutSection } from "./sections/AboutSection";
import { ServicesSection } from "./sections/ServicesSection";
import { HowItWorksSection } from "./sections/HowItWorksSection";
import { WhyChooseUsSection } from "./sections/WhyChooseUsSection";
import { StatisticsSection } from "./sections/StatisticsSection";
import { PricingSection } from "./sections/PricingSection";
import { ReviewsSection } from "./sections/ReviewsSection";
import { FAQSection } from "./sections/FAQSection";
import { FooterSection } from "./sections/FooterSection";
import { BookingPage } from "./pages/BookingPage";
import ViewBookingsPage from "./pages/ViewBookingsPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminBookings } from "./pages/admin/AdminBookings";
import { AdminCustomers } from "./pages/admin/AdminCustomers";
import { AdminServices } from "./pages/admin/AdminServices";
import { AdminReviews } from "./pages/admin/AdminReviews";
import { AdminTeams } from "./pages/admin/AdminTeams";
import { AdminTimeSlot } from "./pages/admin/AdminTimeSlot";
import { AdminNotifications } from "./pages/admin/AdminNotifications";
import { AdminNotificationsList } from "./pages/admin/AdminNotificationsList";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminSignIn from "./pages/admin/auth/AdminSignIn";
import AdminSignUp from "./pages/admin/auth/AdminSignUp";
import AdminForgotPassword from "./pages/admin/auth/AdminForgotPassword";
import AdminResetPassword from "./pages/admin/auth/AdminResetPassword";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import { AdBanner } from "./components/AdBanner";
import { BlogPage } from "./pages/BlogPage";
import { BlogPostPage } from "./pages/BlogPostPage";
import { AdminBlog } from "./pages/admin/AdminBlog";
import { AdminBlogEditor } from "./pages/admin/AdminBlogEditor";

function HomePage() {
  useSEO({
    title: "Faithful Auto Care - Professional Mobile Car Wash & Detailing in the UK",
    description:
      "Faithful Auto Care offers premium mobile car wash and detailing services across the UK. We come to you with professional exterior wash, interior valet, and full detailing packages. Book online today.",
    canonical: "/",
    keywords:
      "mobile car wash, car detailing, car valet, professional car wash, exterior wash, interior valet, car cleaning service, mobile detailing, UK car wash, Faithful Auto Care",
  });

  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <AboutSection />
      <ServicesSection />
      <AdBanner className="max-w-5xl mx-auto px-4 py-6" />
      <HowItWorksSection />
      <WhyChooseUsSection />
      <StatisticsSection />
      <PricingSection />
      <AdBanner className="max-w-5xl mx-auto px-4 py-6" />
      <ReviewsSection />
      <FAQSection />
      <AdBanner className="max-w-5xl mx-auto px-4 py-6" />
      <FooterSection />
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <AdminAuthProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/book-now" element={<BookingPage />} />
        <Route path="/view-bookings" element={<ViewBookingsPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />

        <Route path="/admin/signin" element={<AdminSignIn />} />
        <Route path="/admin/signup" element={<AdminSignUp />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
        <Route path="/admin/reset-password" element={<AdminResetPassword />} />

        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/bookings" element={<ProtectedRoute><AdminBookings /></ProtectedRoute>} />
        <Route path="/admin/timeslot" element={<ProtectedRoute><AdminTimeSlot /></ProtectedRoute>} />
        <Route path="/admin/customers" element={<ProtectedRoute><AdminCustomers /></ProtectedRoute>} />
        <Route path="/admin/services" element={<ProtectedRoute><AdminServices /></ProtectedRoute>} />
        <Route path="/admin/reviews" element={<ProtectedRoute><AdminReviews /></ProtectedRoute>} />
        <Route path="/admin/teams" element={<ProtectedRoute><AdminTeams /></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute><AdminNotificationsList /></ProtectedRoute>} />
        <Route path="/admin/notifications/settings" element={<ProtectedRoute><AdminNotifications /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
        <Route path="/admin/blog" element={<ProtectedRoute><AdminBlog /></ProtectedRoute>} />
        <Route path="/admin/blog/new" element={<ProtectedRoute><AdminBlogEditor /></ProtectedRoute>} />
        <Route path="/admin/blog/edit/:id" element={<ProtectedRoute><AdminBlogEditor /></ProtectedRoute>} />
      </Routes>
    </AdminAuthProvider>
  );
}

export default App;
