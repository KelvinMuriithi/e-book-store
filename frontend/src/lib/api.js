const API_BASE = "/api";

async function jfetch(url, opts = {}) {
    const res = await fetch(url, { credentials: "include", ...opts })
    const isNoContent = res.status === 204 || res.headers.get("Content-Length") === "0"
    let json = null
    if (!isNoContent) {
        json = await res.json().catch(() => ({}))
    }
    if (!res.ok) {
        const msg = (json && (json.error || json.Error)) ||
            (res.status === 403 ? "Forbidden" : `HTTP ${res.status}`) 
        throw new Error(msg)
    }
    return json ?? true
}

export const auth = {
    async register({ email, password, role = "customer" }) {
        return jfetch(`${API_BASE}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, role })
        })
    },

    async login({ email, password }) {
        return jfetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        })
    },

    async logout() {
        return jfetch(`${API_BASE}/auth/logout`,
            { method: "POST" })
    },

    async me() {
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


export async function fetchBook(id) {
    const res = await fetch(`${API_BASE}/books/${id}`)
    console.log("Fetch book", id, "response:", res.status)
    if (res.status === 404) throw new Error("Book not found")
    if (!res.ok) throw new Error(`Failed to fetch book (${res.status})`)
    return res.json()
}

export async function createBook(data) {
    try{
        const res = await jfetch(`${API_BASE}/books`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return res;
    }catch(e){
        if(e.message === "Forbidden"){
            throw new Error("You do not have permission to create a book");
        } else {
            alert(`Failed to create book: ${e.message}`);
        }
    }   
}

export async function editBook(id, data) {
    try{
        await jfetch(`${API_BASE}/books/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    } catch(e){
        if(e.message === "Forbidden"){
            throw new Error("You do not have permission to edit this book");
        } else {
            alert(`Failed to edit book: ${e.message}`);
        }
    }
    return fetchBook(id);
}

export async function deleteBook(id) {
    try {
        const ok = await jfetch(`${API_BASE}/books/${id}`, { method: "DELETE"});
           
        return ok === true || ok===undefined;
    } catch(e) {
        const msg = (e?.message || "")
        if(msg === "Forbidden" || msg==="403"){
            throw new Error("You do not have permission to delete this book");
        }
        if(msg === "Not Found" || msg==="404"){
            throw new Error("Book not found");
        }
        alert(`Failed to delete book: ${msg}`);
        return false;
    }
}
