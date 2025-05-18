
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart3, CircleDollarSign, LayoutDashboard, PieChart } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  
  // Handle navbar background change on scroll
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className={`sticky top-0 z-50 transition-colors duration-200 ${scrolled ? "bg-background/95 backdrop-blur-sm border-b" : "bg-transparent"}`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CircleDollarSign className="h-6 w-6 text-income" />
            <span className="text-xl font-bold">Smart Budget Tracker</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0ms" }}>
              <Badge className="bg-income/10 text-income hover:bg-income/20 px-3 py-1 text-sm">
                Take Control of Your Finances
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Manage your money with <span className="text-income">confidence</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Smart Budget Tracker helps you track expenses, monitor income, and reach your financial goals with intuitive visualizations and insights.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to={user ? "/dashboard" : "/signup"}>
                  <Button size="lg" className="gap-2">
                    {user ? "Go to Dashboard" : "Start for Free"}
                  </Button>
                </Link>
                <Link to={user ? "/transactions" : "/login"}>
                  <Button variant="outline" size="lg">
                    {user ? "View Transactions" : "Login"}
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative animate-fade-in" style={{ animationDelay: "200ms" }}>
              <div className="bg-gradient-to-r from-income/20 to-income/5 rounded-3xl p-6 pt-10">
                <div className="bg-background rounded-2xl shadow-lg border border-border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-lg">Monthly Overview</h3>
                    <Badge variant="outline">May 2025</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <Card className="border-income/20">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="bg-income/10 p-2 rounded-full">
                          <div className="text-income">+</div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Income</p>
                          <p className="font-semibold text-lg text-income">$4,300</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-expense/20">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="bg-expense/10 p-2 rounded-full">
                          <div className="text-expense">-</div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Expenses</p>
                          <p className="font-semibold text-lg text-expense">$1,780</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="w-full h-2 bg-muted rounded-full mb-2">
                    <div className="bg-income h-full rounded-full" style={{ width: "60%" }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-8">60% of your income saved this month</p>
                  
                  <h4 className="font-medium mb-3">Recent Transactions</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-muted/40 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-expense"></div>
                        <span className="text-sm">Grocery Shopping</span>
                      </div>
                      <span className="text-sm font-medium text-expense">-$85.00</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted/40 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-income"></div>
                        <span className="text-sm">Freelance Project</span>
                      </div>
                      <span className="text-sm font-medium text-income">+$350.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything you need to manage your money</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Smart Budget Tracker provides all the tools you need to track spending, set budgets, and reach your financial goals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="animate-fade-in" style={{ animationDelay: "100ms" }}>
              <CardContent className="pt-6">
                <div className="bg-income/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <LayoutDashboard className="text-income h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Intuitive Dashboard</h3>
                <p className="text-muted-foreground">
                  Get a clear overview of your financial health with our easy-to-read dashboard showing income, expenses and savings.
                </p>
              </CardContent>
            </Card>
            
            <Card className="animate-fade-in" style={{ animationDelay: "200ms" }}>
              <CardContent className="pt-6">
                <div className="bg-income/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <PieChart className="text-income h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Expense Tracking</h3>
                <p className="text-muted-foreground">
                  Categorize and track every expense to understand your spending habits and identify areas to save.
                </p>
              </CardContent>
            </Card>
            
            <Card className="animate-fade-in" style={{ animationDelay: "300ms" }}>
              <CardContent className="pt-6">
                <div className="bg-income/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <BarChart3 className="text-income h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Visual Analytics</h3>
                <p className="text-muted-foreground">
                  Understand your finances better with visual charts and graphs that make financial data easy to interpret.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-income/5 border border-income/10 rounded-2xl p-8 md:p-12">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Start managing your finances today</h2>
              <p className="text-muted-foreground mb-6">
                Join thousands of users who have already taken control of their financial future with Smart Budget Tracker.
              </p>
              <Link to={user ? "/dashboard" : "/signup"}>
                <Button size="lg">
                  {user ? "Go to Dashboard" : "Get Started for Free"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <CircleDollarSign className="h-5 w-5 text-income" />
              <span className="font-medium">Smart Budget Tracker</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 Smart Budget Tracker. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
