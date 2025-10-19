import { Link, useLocation } from 'react-router-dom';
import { ChefHat, ShoppingCart, UtensilsCrossed, Flame, Target, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/recipe', icon: ChefHat, label: 'Recipe' },
    { path: '/shopping-list', icon: ShoppingCart, label: 'Shopping List' },
    { path: '/food', icon: UtensilsCrossed, label: 'Food' },
    { path: '/cooking', icon: Flame, label: 'Cooking' },
    { path: '/calorie', icon: Target, label: 'Calorie' },
    { path: '/leftovers', icon: RefreshCw, label: 'Leftovers' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b bg-card shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <Link to="/recipe" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <ChefHat className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Fridgly</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="md:hidden flex gap-2">
            {navItems.slice(1, 4).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
