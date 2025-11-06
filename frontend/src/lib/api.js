const API_BASE = "/api"; 
export async function fetchBooks(params = {}) {
  const base = { q: "", sort: "new", page: 1, per_page: 12, ...params };
  const qs = new URLSearchParams(base).toString();
  const res = await fetch(`/api/books?${qs}`);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Books list failed (${res.status})`);
  return { items: Array.isArray(json.items) ? json.items : [], total: json.total ?? 0, page: json.page ?? 1 };
}


export async function fetchBook(id){
    const res =await fetch(`${API_BASE}/books/${id}`)
    console.log("Fetch book", id, "response:", res.status)
    if(res.status ===404) throw new Error("Book not found")
    if(!res.ok) throw new Error(`Failed to fetch book (${res.status})`)
    return res.json()
}