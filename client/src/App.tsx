import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import BlogPost from "@/pages/BlogPost";
import NotFound from "@/pages/not-found";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import BlogGuidelines from "@/pages/blog-guidelines";
import Privacy from "@/pages/privacy";
import CookiePolicy from "@/pages/cookie-policy";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminWrite from "@/pages/AdminWrite";
import AdminLogin from "@/pages/AdminLogin";
import AdminAI from "@/pages/AdminAI";
import AdminAPIKeys from "@/pages/AdminAPIKeys";
import AdminUsers from "@/pages/AdminUsers";
import AdminPosts from "@/pages/AdminPosts";
import AdminQueue from "@/pages/AdminQueue";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import UserDashboard from "@/pages/UserDashboard";
import UserWrite from "@/pages/UserWrite";
import Category from "@/pages/Category";
import Profile from "@/pages/Profile";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/post/:id" component={BlogPost} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/blog-guidelines" component={BlogGuidelines} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/cookie-policy" component={CookiePolicy} />
      <Route path="/category/:category" component={Category} />
  <Route path="/admin" component={AdminDashboard} />
  <Route path="/admin/write" component={AdminWrite} />
  <Route path="/admin/login" component={AdminLogin} />
  <Route path="/admin/users" component={AdminUsers} />
  <Route path="/admin/posts" component={AdminPosts} />
  <Route path="/admin/ai" component={AdminAI} />
  <Route path="/admin/api-keys" component={AdminAPIKeys} />
  <Route path="/admin/queue" component={AdminQueue} />
  <Route path="/login" component={Login} />
  <Route path="/register" component={Register} />
  <Route path="/user/dashboard" component={UserDashboard} />
  <Route path="/user/write" component={UserWrite} />
  <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                  <Router />
            </main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
