
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useBudget } from "@/contexts/BudgetContext";
import { toast } from "sonner";

const Settings = () => {
  const { user, logout } = useAuth();
  const { state, updateCategory, reset } = useBudget();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, string>>(
    state.categories
      .filter(cat => cat.type === "expense")
      .reduce((acc, cat) => ({
        ...acc,
        [cat.id]: cat.budget?.toString() || "",
      }), {})
  );

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Name is required";
    if (!email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email";
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Success
    toast.success("Profile updated successfully");
    setFormErrors({});
  };

  const handleBudgetChange = (categoryId: string, value: string) => {
    setCategoryBudgets({
      ...categoryBudgets,
      [categoryId]: value,
    });
  };

  const handleCategoryBudgetUpdate = (categoryId: string) => {
    const value = categoryBudgets[categoryId];
    
    if (value === "") {
      // Allow clearing the budget
      const category = state.categories.find(cat => cat.id === categoryId);
      if (category) {
        updateCategory({
          ...category,
          budget: undefined
        });
        toast.success(`Budget for ${category.name} has been cleared`);
      }
      return;
    }
    
    const budget = parseFloat(value);
    if (isNaN(budget) || budget < 0) {
      toast.error("Please enter a valid budget amount");
      return;
    }
    
    const category = state.categories.find(cat => cat.id === categoryId);
    if (category) {
      updateCategory({
        ...category,
        budget
      });
      toast.success(`Budget for ${category.name} has been updated`);
    }
  };

  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset all your financial data? This cannot be undone.")) {
      reset();
      toast.success("All financial data has been reset");
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This cannot be undone.")) {
      logout();
      toast.success("Your account has been deleted successfully");
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <h2 className="text-3xl font-bold">Settings</h2>

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {formErrors.name && (
                  <p className="text-sm text-destructive">{formErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {formErrors.email && (
                  <p className="text-sm text-destructive">{formErrors.email}</p>
                )}
              </div>

              <Button type="submit">Save Profile</Button>
            </form>
          </CardContent>
        </Card>

        {/* Budget Categories Section */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Categories</CardTitle>
            <CardDescription>
              Set monthly budget limits for expense categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Monthly Budget ($)</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.categories
                    .filter((cat) => cat.type === "expense")
                    .map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <span>{category.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {category.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={categoryBudgets[category.id] || ""}
                            onChange={(e) =>
                              handleBudgetChange(
                                category.id,
                                e.target.value
                              )
                            }
                            placeholder="No budget set"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleCategoryBudgetUpdate(category.id)
                            }
                          >
                            Save
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions that will affect your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="font-medium mb-1">Reset Financial Data</h3>
                <p className="text-sm text-muted-foreground">
                  Delete all your transactions and reset your budgets
                </p>
              </div>
              <Button variant="outline" onClick={handleResetData}>
                Reset Data
              </Button>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="font-medium mb-1">Delete Account</h3>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all your data
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
