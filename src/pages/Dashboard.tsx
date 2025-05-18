import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { useBudget } from "@/contexts/BudgetContext";
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { Layout } from "@/components/Layout";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

// Define monthly summary type
type MonthlySummary = {
  income: number;
  expenses: number;
  balance: number;
  categories: { name: string; value: number; color: string; }[];
};

const Dashboard = () => {
  const { state } = useBudget();
  const [summary, setSummary] = useState<MonthlySummary>({
    income: 0,
    expenses: 0,
    balance: 0,
    categories: []
  });
  
  // Calculate monthly summary
  useEffect(() => {
    const now = new Date();
    const firstDay = startOfMonth(now);
    const lastDay = endOfMonth(now);
    
    // Filter transactions for current month
    const currentMonthTransactions = state.transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return isWithinInterval(transactionDate, { start: firstDay, end: lastDay });
    });
    
    // Calculate totals
    const totalIncome = currentMonthTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpenses = currentMonthTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Group expenses by category
    const expensesByCategory = currentMonthTransactions
      .filter(t => t.type === "expense")
      .reduce((acc, transaction) => {
        const category = state.categories.find(c => c.id === transaction.categoryId);
        if (!category) return acc;
        
        const existing = acc.find(item => item.name === category.name);
        if (existing) {
          existing.value += transaction.amount;
        } else {
          acc.push({
            name: category.name,
            value: transaction.amount,
            color: category.color
          });
        }
        return acc;
      }, [] as { name: string; value: number; color: string }[]);
    
    // Sort categories by value (descending)
    expensesByCategory.sort((a, b) => b.value - a.value);
    
    setSummary({
      income: totalIncome,
      expenses: totalExpenses,
      balance: totalIncome - totalExpenses,
      categories: expensesByCategory
    });
    
  }, [state.transactions, state.categories]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Calculate budget progress
  const getBudgetProgress = (categoryId: string, spent: number) => {
    const category = state.categories.find(c => c.id === categoryId);
    if (!category || !category.budget) return 0;
    return Math.min(100, (spent / category.budget) * 100);
  };
  
  // Get top spending categories with budget
  const topCategories = state.categories
    .filter(cat => cat.type === "expense" && cat.budget)
    .map(category => {
      const spent = state.transactions
        .filter(t => t.type === "expense" && t.categoryId === category.id)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        id: category.id,
        name: category.name,
        budget: category.budget || 0,
        spent,
        progress: getBudgetProgress(category.id, spent),
        color: category.color
      };
    })
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 4);
  
  return (
    <Layout>
      <div className="space-y-8">
        {/* Month summary */}
        <h2 className="text-3xl font-bold tracking-tight">
          {format(new Date(), "MM/dd/yyyy")}
        </h2>

        {/* Overview cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ArrowUpIcon className="h-4 w-4 text-income mr-2" />
                <span className="text-2xl font-bold text-income">
                  {formatCurrency(summary.income)}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ArrowDownIcon className="h-4 w-4 text-expense mr-2" />
                <span className="text-2xl font-bold text-expense">
                  {formatCurrency(summary.expenses)}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <span className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-success' : 'text-warning'}`}>
                  {formatCurrency(summary.balance)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and budget progress */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Expense breakdown chart */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {summary.categories.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={summary.categories}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={40}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {summary.categories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-80 text-muted-foreground">
                  No expense data for current month
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Budget progress */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {topCategories.length > 0 ? (
                topCategories.map(category => (
                  <div key={category.id} className="space-y-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{category.name}</span>
                      <span>
                        {formatCurrency(category.spent)} / {formatCurrency(category.budget)}
                      </span>
                    </div>
                    <Progress 
                      value={category.progress} 
                      className={
                        category.progress > 90 ? "h-2 bg-warning" : 
                        category.progress > 75 ? "h-2 bg-expense" : 
                        "h-2 bg-success"
                      }
                    />
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No budget data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {state.transactions.length > 0 ? (
                state.transactions.slice(0, 5).map(transaction => {
                  const category = state.categories.find(c => c.id === transaction.categoryId);
                  return (
                    <div 
                      key={transaction.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category?.color || (transaction.type === 'income' ? '#0EA5E9' : '#F97316') }}
                        ></div>
                        <div>
                          <p className="font-medium">{category?.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(transaction.date), 'MM/dd/yyyy')}
                            {transaction.note && ` • ${transaction.note}`}
                          </p>
                        </div>
                      </div>
                      <span className={`font-semibold ${transaction.type === 'income' ? 'text-income' : 'text-expense'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No transactions yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
