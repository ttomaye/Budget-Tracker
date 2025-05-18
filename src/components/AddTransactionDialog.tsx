import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBudget, TransactionType } from "@/contexts/BudgetContext";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function AddTransactionDialog() {
  const { 
    state, 
    addTransaction, 
    updateTransaction, 
    isAddingTransaction, 
    setIsAddingTransaction, 
    isEditingTransaction, 
    setIsEditingTransaction,
    currentTransaction,
    setCurrentTransaction
  } = useBudget();
  
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // When dialog opens for editing, set form values
  useEffect(() => {
    if (isEditingTransaction && currentTransaction) {
      setType(currentTransaction.type);
      setAmount(currentTransaction.amount.toString());
      setCategoryId(currentTransaction.categoryId);
      setDate(new Date(currentTransaction.date));
      setNote(currentTransaction.note || "");
    } else if (isAddingTransaction) {
      // Reset form for adding new transaction
      setType("expense");
      setAmount("");
      setCategoryId("");
      setDate(new Date());
      setNote("");
    }
  }, [isAddingTransaction, isEditingTransaction, currentTransaction]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }
    
    if (!categoryId) {
      newErrors.category = "Please select a category";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const transactionData = {
      amount: Number(amount),
      type,
      categoryId,
      date: format(date, "yyyy-MM-dd"),
      note
    };
    
    if (isEditingTransaction && currentTransaction) {
      updateTransaction({
        ...transactionData,
        id: currentTransaction.id
      });
      setIsEditingTransaction(false);
    } else {
      addTransaction(transactionData);
      setIsAddingTransaction(false);
    }
    
    setCurrentTransaction(null);
  };

  const handleClose = () => {
    if (isEditingTransaction) {
      setIsEditingTransaction(false);
    } else {
      setIsAddingTransaction(false);
    }
    setCurrentTransaction(null);
    setErrors({});
  };

  const filteredCategories = state.categories.filter(category => category.type === type);

  return (
    <Dialog 
      open={isAddingTransaction || isEditingTransaction} 
      onOpenChange={handleClose}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditingTransaction ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Transaction Type</Label>
            <RadioGroup 
              value={type}
              onValueChange={(value) => {
                setType(value as TransactionType);
                setCategoryId(""); // Reset category when type changes
              }}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense" className="text-expense font-medium">Expense</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income" className="text-income font-medium">Income</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
              <Input 
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-8"
                min="0"
                step="0.01"
              />
            </div>
            {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={categoryId}
              onValueChange={setCategoryId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No categories available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
          </div>
          
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "MM/dd/yyyy") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea 
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add details about this transaction"
              className="resize-none"
            />
          </div>
        
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditingTransaction ? "Save Changes" : "Add Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
