const API_BASE = "/api"; 

async function jfetch(url, opts = {}) {
    const res = await fetch(url, {credentials:"include", ...opts})
    const json = await res.json().catch(()=>({}))
    if (!res.ok) throw new Error (json.Error || `HTTP ${res.status}`)
    return json
}

export const auth = {
    async register({email, password, role="customer"}){
        return jfetch(`${API_BASE}/auth/register`,{
            method:"POST",
            headers: {"Content-Type": "application/json"},
            body:JSON.stringify({email, password, role})
        })
    }, 

    async login({email, password}){
        return jfetch(`${API_BASE}/auth/login`, {
            method:"POST",
            headers:{"Content-Type": "application/json"},
            body:JSON.stringify({email, password})
        })
    },

    async logout(){
        return jfetch(`${API_BASE}/auth/logout`,
            {method:"POST"})
    },

    async me(){
        return jfetch(`${API_BASE}/auth/me`)
    }
}

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

export async function createBook(data){
    const res = await jfetch(`${API_BASE}/books`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({})); 
    if(!res.ok) throw new Error(json.error `Failed to create book (${res.status})`);
    return json
}

export async function editBook(id, data){
    const res = await jfetch(`${API_BASE}/books/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({})); 
    if(!res.ok) throw new Error(json.error || `Failed to edit book (${res.status})`);
    return json
}

export async function deleteBook(id){
    const res = await jfetch(`${API_BASE}/books/${id}`, {
        method: "DELETE",
    });
    if(res.status ===404) throw new Error("Book not found")
    if(!res.ok) throw new Error(`Failed to delete book (${res.status})`);
    return true
}
