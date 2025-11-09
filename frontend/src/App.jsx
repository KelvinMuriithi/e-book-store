import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import BookDetail from "./pages/BookDetail";
import Browse from "./pages/Browse";
import NewBook from "./pages/NewBook";
import EditBook from "./pages/EditBook";
import { auth } from "./lib/api";
import { useAuth } from "./auth/AuthContext";
import Login from "./auth/Login";

function App() {
  const [status, setStatus] = useState("checking…");
  const { user, setUser } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    // health
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setStatus(d.status))
      .catch(() => setStatus("error"));
      
    auth
      .me()
      .then(({ user }) => setUser(user || null))
      .catch(() => setUser(null));
  }, [setUser]);

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">E-Book Store</h1>
      <p className="mt-2">Backend status: {status}</p>

      <header className="p-4 border-b flex gap-4">
        <Link to="/" className="font-bold">E-Book store</Link>
        <Link to="/books">Browse</Link>

        <div className="ml-auto flex items-center gap-2">
          {user && ["author", "admin"].includes(user.role) && (
            <Link to="/admin/new-book" className="border px-2 py-1 rounded">
              Add New Book
            </Link>
          )}

          {user ? (
            <>
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                className="border px-2 py-1 rounded"
                onClick={async () => {
                  await auth.logout();
                  setUser(null);
                  nav("/");
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="border px-2 py-1 rounded">Login</Link>
          )}
        </div>
      </header>

      <Routes>
        <Route path="/" element={<div className="p-6">Home</div>} />
        <Route path="/books" element={<Browse />} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/admin/new-book" element={<NewBook />} />
        <Route path="/admin/books/:id/edit" element={<EditBook />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<div className="p-6">Not found</div>} />
      </Routes>
    </div>
  );
}

export default App;
