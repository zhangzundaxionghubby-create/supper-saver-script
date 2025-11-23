import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Recipe from "./pages/Recipe";
import RecipeSwipe from "./pages/RecipeSwipe";
import ShoppingList from "./pages/ShoppingList";
import Basket from "./pages/Basket";
import Cooking from "./pages/Cooking";
import Nutrients from "./pages/Nutrients";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/recipe" element={<ProtectedRoute><Recipe /></ProtectedRoute>} />
          <Route path="/recipe-swipe" element={<ProtectedRoute><RecipeSwipe /></ProtectedRoute>} />
          <Route path="/shopping-list" element={<ProtectedRoute><ShoppingList /></ProtectedRoute>} />
          <Route path="/basket" element={<ProtectedRoute><Basket /></ProtectedRoute>} />
          <Route path="/cooking" element={<ProtectedRoute><Cooking /></ProtectedRoute>} />
          <Route path="/nutrients" element={<ProtectedRoute><Nutrients /></ProtectedRoute>} />
          <Route path="/calorie" element={<ProtectedRoute><Nutrients /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
