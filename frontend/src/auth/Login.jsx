import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../lib/api";
import { useAuth } from "./AuthContext";

export default function Login() {
  const { setUser } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    const emailTrimmed = email.trim();
    const passwordTrimmed = password.trim();
    if (!emailTrimmed || !passwordTrimmed) {
      setErr("Email and password are required");
      return;
    }
    try {
        const me = await auth.login({ email: emailTrimmed, password: passwordTrimmed });
        
      await auth.login({ email, password });
      setUser(me);
      nav("/books");
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="p-6 max-w-sm mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Login</h2>
      {err && <div className="text-red-600">{err}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="border p-2 w-full"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border p-2 w-full"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="px-4 py-2 rounded bg-black text-white">
          Sign in
        </button>
      </form>
    </div>
  );
}
