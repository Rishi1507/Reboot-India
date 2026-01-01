import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import TreksList from "@/pages/TreksList";
import TrekDetail from "@/pages/TrekDetail";
import BlogList from "@/pages/BlogList";
import BlogDetail from "@/pages/BlogDetail";
import BookingSuccess from "@/pages/BookingSuccess";

// Initialize Scroll to top on route change
function ScrollToTop() {
  const [location] = window.location.pathname;
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/treks" component={TreksList} />
      <Route path="/treks/:slug" component={TrekDetail} />
      <Route path="/blog" component={BlogList} />
      <Route path="/blog/:slug" component={BlogDetail} />
      <Route path="/booking-success" component={BookingSuccess} />
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
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
