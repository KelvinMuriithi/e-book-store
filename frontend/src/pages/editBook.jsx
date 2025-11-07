import {useState} from "react";
import {useNavigate, useParams, Link} from "react-router-dom";
import {fetchBook, editBook} from "../lib/api";

export default function EditBook() {
    const {id} = useParams();
    const nav = useNavigate();
    const [form, setForm] = useState({
        title: "", author: "", description: "", price: "", isbn:"", cover_image: ""
    });
    const [err, setErr] = useState("");

    // Fetch existing book data on mount
    useState(() => {
        fetchBook(id).then(b => {
            setForm({
                title: b.title || "", author: b.author || "", description: b.description || "",
                price: b.price || "", isbn: b.isbn || "", cover_image: b.cover_image || ""
            });
        }).catch(e => setErr(e.message || "Failed to load book"));
    }, [id]);
    
    function set(k, v){ setForm(prev => ({...prev, [k]: v})); }
    async function onSubmit(e) {
        e.preventDefault();
        setErr("");
        try{
            const data = { ...form, price: Number(form.price)}
            const b = await editBook(id, data);
            console.log("Edited book:", b);
            nav(`/books/${b.id}`);
        } catch(e){
            setErr(e.message || "Failed to edit book");
        }
    }

    return (
        <div className="p-6 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-4">Edit Book</h1>
            {err && <div className="text-red-600 mb-4">Error: {err}</div>}
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-semibold">Title</label>
                    <input type="text" value={form.title} onChange={e => set("title", e.target.value)} className="w-full border p-2"/>
                </div>
                <div>
                    <label className="block mb-1 font-semibold">Author</label>
                    <input type="text" value={form.author} onChange={e => set("author", e.target.value)} className="w-full border p-2"/>
                </div>
                <div>
                    <label className="block mb-1 font-semibold">Description</label>
                    <textarea value={form.description} onChange={e => set("description", e.target.value)} className="w-full border p-2"/>
                </div>
                <div>
                    <label className="block mb-1 font-semibold">ISBN</label>
                    <input type="text" value={form.isbn} onChange={e => set("isbn", e.target.value)} className="w-full border p-2"/>
                </div>
                <div>
                    <label className="block mb-1 font-semibold">Price (USD)</label>
                    <input type="number" step="0.01" value={form.price} onChange={e => set("price", e.target.value)} className="w-full border p-2"/>
                </div>
                <div>
                    <label className="block mb-1 font-semibold">Cover Image URL</label>
                    <input type="text" value={form.cover_image} onChange={e => set("cover_image", e.target.value)} className="w-full border p-2"/>
                </div>
                <div>
                    <button type="submit" className="px-4 py-2 rounded bg-black text-white">Save Changes</button>
                    {/* <Link to="/books">Cancel</Link> */}
                </div>
            </form>
        </div>
    );
}          

