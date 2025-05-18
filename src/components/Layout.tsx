import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  CircleDollarSign,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useBudget } from "@/contexts/BudgetContext";
import { AddTransactionDialog } from "./AddTransactionDialog";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { logout } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const location = useLocation();
  const { setIsAddingTransaction, setCurrentTransaction } = useBudget();

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Adjust sidebar visibility based on screen size
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleAddTransaction = () => {
    setIsAddingTransaction(true);
    setCurrentTransaction(null);
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-sidebar border-r border-border fixed inset-y-0 left-0 z-20 w-64 transform transition-transform duration-200 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2">
              <CircleDollarSign className="h-6 w-6 text-income" />
              <span className="text-xl font-semibold">Budget Tracker</span>
            </Link>
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          <div className="px-2 py-4 flex-1">
            <h2 className="text-xs font-semibold text-muted-foreground px-4 mb-2 uppercase">
              Main Menu
            </h2>
            <nav className="space-y-1">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/80 hover:bg-secondary hover:text-foreground"
                  )
                }
              >
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </NavLink>
              <NavLink
                to="/transactions"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/80 hover:bg-secondary hover:text-foreground"
                  )
                }
              >
                <CircleDollarSign className="h-5 w-5" />
                Transactions
              </NavLink>
              <NavLink
                to="/analytics"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/80 hover:bg-secondary hover:text-foreground"
                  )
                }
              >
                <BarChart3 className="h-5 w-5" />
                Analytics
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/80 hover:bg-secondary hover:text-foreground"
                  )
                }
              >
                <Settings className="h-5 w-5" />
                Settings
              </NavLink>
            </nav>
          </div>

          <div className="p-4 border-t border-border">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground hover:text-destructive"
              onClick={logout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={cn(
          "flex-1 transition-all duration-200 ease-in-out",
          sidebarOpen ? "md:ml-64" : "ml-0"
        )}
      >
        {/* Mobile header */}
        <header className="sticky top-0 z-10 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 md:px-6">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold">
            {location.pathname === "/dashboard" && "Dashboard"}
            {location.pathname === "/transactions" && "Transactions"}
            {location.pathname === "/analytics" && "Analytics"}
            {location.pathname === "/settings" && "Settings"}
          </h1>
          <div className="ml-auto">
            <Button onClick={handleAddTransaction} size="sm" className="gap-1">
              <Plus className="h-4 w-4" /> Add Income or Expense
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Add Transaction Dialog */}
      <AddTransactionDialog />
    </div>
  );
}
