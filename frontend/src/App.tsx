import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WhatsAppWidget } from "@/components/WhatsAppWidget";

import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import TreksList from "@/pages/TreksList";
import TrekDetail from "@/pages/TrekDetail";
import BlogList from "@/pages/BlogList";
import BlogDetail from "@/pages/BlogDetail";
import BookingSuccess from "@/pages/BookingSuccess";

/* 👉 NEW PAGES */
import About from "@/pages/About";
import Team from "@/pages/Team";
import Contact from "@/pages/Contact";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import RefundPolicy from "@/pages/RefundPolicy";

function Router() {
  return (
    <Switch>
      {/* Core Pages */}
      <Route path="/" component={Home} />
      <Route path="/treks" component={TreksList} />
      <Route path="/treks/:slug" component={TrekDetail} />
      <Route path="/blog" component={BlogList} />
      <Route path="/blog/:slug" component={BlogDetail} />
      <Route path="/booking-success" component={BookingSuccess} />

      {/* Static Company Pages */}
      <Route path="/about" component={About} />
      <Route path="/team" component={Team} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/refund-policy" component={RefundPolicy} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/treks" component={AdminDashboard} />
      <Route path="/admin" component={AdminDashboard} />

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <WhatsAppWidget />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
