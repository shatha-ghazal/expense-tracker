import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { PlusCircle, List, PieChart } from "lucide-react";
import "./App.css";

ChartJS.register(ArcElement, Tooltip, Legend);

// ---------------- CONTEXT ----------------
const ExpensesContext = createContext();
const useExpenses = () => useContext(ExpensesContext);

const DEFAULT_CATEGORIES = ["Food", "Travel", "Shopping", "Other"];

const ExpensesProvider = ({ children }) => {
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem("expenses");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (exp) => setExpenses([...expenses, exp]);
  const deleteExpense = (id) => setExpenses(expenses.filter((e) => e.id !== id));

  return (
    <ExpensesContext.Provider value={{ expenses, addExpense, deleteExpense }}>
      {children}
    </ExpensesContext.Provider>
  );
};

// ---------------- SIDEBAR ----------------
const Sidebar = () => {
  return (
    <aside className="sidebar">
      <h1 className="logo">Expense Tracker</h1>
      <nav className="nav-links">
        <Link to="/add" className="nav-link">
          <PlusCircle size={18} /> Add
        </Link>
        <Link to="/expenses" className="nav-link">
          <List size={18} /> Expenses
        </Link>
        <Link to="/dashboard" className="nav-link">
          <PieChart size={18} /> Chart
        </Link>
      </nav>
    </aside>
  );
};

// ---------------- ADD EXPENSE PAGE ----------------
const AddExpense = () => {
  const { addExpense } = useExpenses();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const onSave = () => {
    if (!name || !amount) return alert("Please fill all fields");
    addExpense({ id: Date.now().toString(), name, amount: Number(amount), category, date });
    navigate("/expenses");
  };

  return (
    <main className="main-content">
      <div className="card">
        <h2>Add Expense</h2>
        <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input" placeholder="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
          {DEFAULT_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <div>
          <button className="btn btn-primary" onClick={onSave}>
            Add
          </button>
          <button className="btn btn-secondary" onClick={() => navigate("/expenses")}>
            Cancel
          </button>
        </div>
      </div>
    </main>
  );
};

// ---------------- EXPENSES LIST PAGE ----------------
const Expenses = () => {
  const { expenses, deleteExpense } = useExpenses();

  return (
    <main className="main-content">
      <div className="card">
        <h2>Expenses List</h2>
        {expenses.length === 0 ? (
          <p>No expenses yet.</p>
        ) : (
          <ul className="list">
            {expenses.map((e) => (
              <li key={e.id} className="list-item">
                <span>
                  {e.name} - ${e.amount} ({e.category})
                </span>
                <button className="delete-btn" onClick={() => deleteExpense(e.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
};

// ---------------- DASHBOARD PAGE ----------------
const Dashboard = () => {
  const { expenses } = useExpenses();
  const totals = DEFAULT_CATEGORIES.map((cat) =>
    expenses.filter((e) => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
  );

  const data = {
    labels: DEFAULT_CATEGORIES,
    datasets: [
      {
        data: totals,
        backgroundColor: ["#A78BFA", "#60A5FA", "#F472B6", "#34D399"],
      },
    ],
  };

  return (
    <main className="main-content">
      <div className="card">
        <h2>Category Chart</h2>
        <Pie data={data} />
      </div>
    </main>
  );
};

// ---------------- APP ----------------
export default function App() {
  return (
    <Router>
      <ExpensesProvider>
        <div className="app-container">
          <Sidebar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/add" element={<AddExpense />} />
          </Routes>
        </div>
      </ExpensesProvider>
    </Router>
  );
}
