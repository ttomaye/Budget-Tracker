
import { createContext, useContext, useReducer, useState } from "react";
import { toast } from "sonner";

// Define types
export type TransactionType = "income" | "expense";

export type Category = {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon?: string;
  budget?: number;
};

export type Transaction = {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string;
  note?: string;
};

type BudgetState = {
  transactions: Transaction[];
  categories: Category[];
};

type BudgetAction =
  | { type: "ADD_TRANSACTION"; transaction: Transaction }
  | { type: "UPDATE_TRANSACTION"; transaction: Transaction }
  | { type: "DELETE_TRANSACTION"; id: string }
  | { type: "UPDATE_CATEGORY"; category: Category }
  | { type: "RESET" };

// Initial state with sample data
const initialCategories: Category[] = [
  { id: "cat-1", name: "Salary", type: "income", color: "#0EA5E9" },
  { id: "cat-2", name: "Freelance", type: "income", color: "#3B82F6" },
  { id: "cat-3", name: "Investment", type: "income", color: "#10B981" },
  { id: "cat-4", name: "Other Income", type: "income", color: "#6366F1" },
  { id: "cat-5", name: "Rent", type: "expense", color: "#F97316", budget: 1200 },
  { id: "cat-6", name: "Utilities", type: "expense", color: "#F59E0B", budget: 200 },
  { id: "cat-7", name: "Food", type: "expense", color: "#84CC16", budget: 500 },
  { id: "cat-8", name: "Transportation", type: "expense", color: "#14B8A6", budget: 150 },
  { id: "cat-9", name: "Shopping", type: "expense", color: "#8B5CF6", budget: 300 },
  { id: "cat-10", name: "Entertainment", type: "expense", color: "#EC4899", budget: 200 },
  { id: "cat-11", name: "Misc", type: "expense", color: "#6B7280", budget: 100 },
];

// Sample transactions for demo
const initialTransactions: Transaction[] = [
  {
    id: "tx-1",
    amount: 3500,
    type: "income",
    categoryId: "cat-1",
    date: "2025-05-01",
    note: "Monthly salary",
  },
  {
    id: "tx-2",
    amount: 800,
    type: "income",
    categoryId: "cat-2",
    date: "2025-05-10",
    note: "Website project",
  },
  {
    id: "tx-3",
    amount: 1200,
    type: "expense",
    categoryId: "cat-5",
    date: "2025-05-05",
    note: "Monthly rent",
  },
  {
    id: "tx-4",
    amount: 85,
    type: "expense",
    categoryId: "cat-6",
    date: "2025-05-06",
    note: "Electricity bill",
  },
  {
    id: "tx-5",
    amount: 65,
    type: "expense",
    categoryId: "cat-6",
    date: "2025-05-07",
    note: "Water bill",
  },
  {
    id: "tx-6",
    amount: 220,
    type: "expense",
    categoryId: "cat-7",
    date: "2025-05-08",
    note: "Grocery shopping",
  },
  {
    id: "tx-7",
    amount: 60,
    type: "expense",
    categoryId: "cat-8",
    date: "2025-05-12",
    note: "Gas",
  },
  {
    id: "tx-8",
    amount: 150,
    type: "expense",
    categoryId: "cat-10",
    date: "2025-05-15",
    note: "Movie and dinner",
  },
];

const initialState: BudgetState = {
  transactions: initialTransactions,
  categories: initialCategories,
};

// Reducer function
const budgetReducer = (state: BudgetState, action: BudgetAction): BudgetState => {
  switch (action.type) {
    case "ADD_TRANSACTION":
      return {
        ...state,
        transactions: [action.transaction, ...state.transactions],
      };
    case "UPDATE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.transaction.id ? action.transaction : t
        ),
      };
    case "DELETE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.id),
      };
    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.category.id ? action.category : c
        ),
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
};

// Create context
interface BudgetContextType {
  state: BudgetState;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  updateCategory: (category: Category) => void;
  reset: () => void;
  isAddingTransaction: boolean;
  setIsAddingTransaction: (isAdding: boolean) => void;
  isEditingTransaction: boolean;
  setIsEditingTransaction: (isEditing: boolean) => void;
  currentTransaction: Transaction | null;
  setCurrentTransaction: (transaction: Transaction | null) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

// Context provider
export const BudgetProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(budgetReducer, initialState);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isEditingTransaction, setIsEditingTransaction] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: `tx-${Date.now()}`,
    };
    
    dispatch({ type: "ADD_TRANSACTION", transaction: newTransaction });
    toast.success("Transaction added successfully");
  };

  const updateTransaction = (transaction: Transaction) => {
    dispatch({ type: "UPDATE_TRANSACTION", transaction });
    toast.success("Transaction updated successfully");
  };

  const deleteTransaction = (id: string) => {
    dispatch({ type: "DELETE_TRANSACTION", id });
    toast.success("Transaction deleted successfully");
  };

  const updateCategory = (category: Category) => {
    dispatch({ type: "UPDATE_CATEGORY", category });
    toast.success("Category updated successfully");
  };

  const reset = () => {
    dispatch({ type: "RESET" });
  };

  return (
    <BudgetContext.Provider
      value={{
        state,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        updateCategory,
        reset,
        isAddingTransaction,
        setIsAddingTransaction,
        isEditingTransaction,
        setIsEditingTransaction,
        currentTransaction,
        setCurrentTransaction,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

// Custom hook to use the budget context
export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error("useBudget must be used within a BudgetProvider");
  }
  return context;
};
