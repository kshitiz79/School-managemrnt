import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ExpenseHead from './ExpenseHead'
import AddExpense from './AddExpense'
import SearchExpense from './SearchExpense'
import IncomeHead from './IncomeHead'
import AddIncome from './AddIncome'
import SearchIncome from './SearchIncome'
import ProfitLoss from './ProfitLoss'

const FinanceRoutes = () => {
  return (
    <Routes>
      <Route path="expense-head" element={<ExpenseHead />} />
      <Route path="add-expense" element={<AddExpense />} />
      <Route path="search-expense" element={<SearchExpense />} />
      <Route path="income-head" element={<IncomeHead />} />
      <Route path="add-income" element={<AddIncome />} />
      <Route path="search-income" element={<SearchIncome />} />
      <Route path="profit-loss" element={<ProfitLoss />} />
    </Routes>
  )
}

export default FinanceRoutes
