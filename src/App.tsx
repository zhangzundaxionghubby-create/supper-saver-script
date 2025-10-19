import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Recipe from "./pages/Recipe";
import ShoppingList from "./pages/ShoppingList";
import Basket from "./pages/Basket";
import Cooking from "./pages/Cooking";
import Calorie from "./pages/Calorie";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/recipe" replace />} />
          <Route path="/recipe" element={<Recipe />} />
          <Route path="/shopping-list" element={<ShoppingList />} />
          <Route path="/basket" element={<Basket />} />
          <Route path="/cooking" element={<Cooking />} />
          <Route path="/calorie" element={<Calorie />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
