import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import BookDetail from "./pages/BookDetail";
import Browse from "./pages/Browse";
import NewBook from "./pages/NewBook";
import EditBook from "./pages/EditBook";
import { auth } from "./lib/api";
import Login from "./auth/Login";
function App() {
  const [status, setStatus] = useState("checking…");
  const [me, setMe] = useState(null)
  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setStatus(d.status))
      .catch(() => setStatus("error"));
      auth.me().then(({user})=>setMe(user)).catch(()=>setMe(null))
  }, []);
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">E-Book Store</h1>
      <p className="mt-2">Backend status: {status}</p>
      <BrowserRouter>
        <header className="p-4 border-b flex gap-4">
          <Link to="/" className="font-bold">
            E-Book store
          </Link>
          <Link to="/books">Browse</Link>
          {me? (
            <>
            {["author","admin"].includes(me.role) && (
              <Link
            to="/admin/new-book"
            className="ml-auto border px-2 py-1 rounded"
          >
            Add New Book
          </Link>)}
          <span className="ml-2 text-sm text-gray-600">Hi {me.email}</span>
            </>):(<Link to="/login" className="ml-auto border px-2 py-1 rounded">Login</Link>
        )}
        </header>
        <Routes>
          <Route path="/" element={<div className="p-6">Home</div>}></Route>
          <Route path="/books" element={<Browse />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/admin/new-book" element={<NewBook />} />
          <Route path="/admin/books/:id/edit" element={<EditBook />} /> 
          <Route path="/login" element={<Login/>}/>
          <Route path="*" element={<div className="p-6">Not found</div>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
export default App;
