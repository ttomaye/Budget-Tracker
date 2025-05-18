
import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useBudget, Transaction } from "@/contexts/BudgetContext";
import {
  format,
  parseISO,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  subMonths,
  eachMonthOfInterval,
} from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MonthlyTotal {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

interface CategoryTotal {
  name: string;
  value: number;
  color: string;
}

const Analytics = () => {
  const { state } = useBudget();
  const [timeRange, setTimeRange] = useState("6months");
  const [monthlyData, setMonthlyData] = useState<MonthlyTotal[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryTotal[]>([]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const tooltip = useMemo(() => ({
    formatter: (value: number) => formatCurrency(value),
  }), []);

  // Calculate data for charts based on timeRange
  useEffect(() => {
    // Calculate number of months to look back
    const monthsLookback = 
      timeRange === "3months" ? 3 : 
      timeRange === "6months" ? 6 : 
      timeRange === "1year" ? 12 : 6;
    
    const today = new Date();
    const startDate = startOfMonth(subMonths(today, monthsLookback - 1));
    const endDate = endOfMonth(today);
    
    // Generate array of months for the selected range
    const monthsArray = eachMonthOfInterval({
      start: startDate,
      end: endDate,
    });
    
    // Calculate monthly totals
    const monthlyTotals: MonthlyTotal[] = monthsArray.map((month) => {
      const monthTransactions = state.transactions.filter((t) =>
        isSameMonth(parseISO(t.date), month)
      );
      
      const income = monthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        month: format(month, "MMM yyyy"),
        income,
        expenses,
        savings: income - expenses,
      };
    });
    
    setMonthlyData(monthlyTotals);
    
    // Calculate category totals for the selected time range
    const filteredTransactions = state.transactions.filter((t) => {
      const transactionDate = parseISO(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
    
    const expenseTransactions = filteredTransactions.filter(
      (t) => t.type === "expense"
    );
    
    // Group expenses by category
    const categoryTotals = expenseTransactions.reduce<CategoryTotal[]>(
      (acc, transaction) => {
        const category = state.categories.find(
          (c) => c.id === transaction.categoryId
        );
        if (!category) return acc;
        
        const existingCategory = acc.find((c) => c.name === category.name);
        
        if (existingCategory) {
          existingCategory.value += transaction.amount;
        } else {
          acc.push({
            name: category.name,
            value: transaction.amount,
            color: category.color,
          });
        }
        
        return acc;
      },
      []
    );
    
    // Sort by highest amount
    categoryTotals.sort((a, b) => b.value - a.value);
    
    setCategoryData(categoryTotals);
    
  }, [state.transactions, state.categories, timeRange]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Analytics</h2>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Income vs Expenses Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Income vs. Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip {...tooltip} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#0EA5E9" />
                  <Bar dataKey="expenses" name="Expenses" fill="#F97316" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Savings Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Savings Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip {...tooltip} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="savings"
                    name="Savings"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip {...tooltip} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-80 text-muted-foreground">
                  No expense data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <div className="space-y-4">
                  {categoryData.slice(0, 5).map((category, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <span className="font-semibold">
                          {formatCurrency(category.value)}
                        </span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full">
                        <div
                          className="h-full bg-expense rounded-full"
                          style={{
                            width: `${
                              (category.value /
                                (categoryData[0]?.value || 1)) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  No expense data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
