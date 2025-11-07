import { useEffect, useState } from "react";
import { fetchBooks } from "../lib/api";
import { Link } from "react-router-dom";

export default function Browse() {
  const [data, setData] = useState({ items: [] });
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("new");
  const [err, setErr] = useState("");

  useEffect(() => {
    setErr("");
    fetchBooks({ q, sort })
        .then((d) =>{
            // console.log(d)
            setData(d)
        })
      .catch((e) => setErr(e.message));
  }, [q, sort]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex gap-2">
        <input
          className="border p-2 flex-1"
          placeholder="Search title or author..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="border p-2"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="new">Newest</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
          <option value="title">Title A-Z</option>
        </select>
      </div>

      {/* <pre className="text-xs bg-gray-50 p-2 border rounded overflow-auto">
        {JSON.stringify(
          { err, count: data.items?.length, sample: data.items?.[0] },
          null,
          2
        )}
      </pre> */}

      {err && <div className="text-red-600">Error: {err}</div>}
      {data.items.length === 0 && !err && <div>No books found</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(data.items?? []).map((b) => (
          <Link
            key={b.id}
            to={`/books/${b.id}`}
            className="border rounded p-3 hover:shadow block"
          >
            <div className="aspect-[3/4] bg-gray-100 mb-2 overflow-hidden">
              {b.cover_image ? (
                <img
                  src={b.cover_image}
                  alt={b.title}
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
            <div className="font-semibold line-clamp-2">{b.title} </div>
            <div className="text-sm text-gray-500">{b.author}</div>
            <div className="text-sm mt-1">${Number(b.price).toFixed(2)}</div>
          
          </Link>
        ))}
      </div>
    </div>
  );
}
