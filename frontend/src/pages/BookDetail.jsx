import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchBook } from "../lib/api";

export default function BookDetail() {
  const { id } = useParams();               // string like "3"
  const [b, setB] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!id) return;                        // guard if route is weird
    let alive = true;                       // avoid state set after unmount
    setErr("");
    setB(null);

    // Optional debug
    // console.log("Fetching book id:", id);

    fetchBook(id)
      .then((data) => {
        if (!alive) return;
        setB(data);
      })
      .catch((e) => {
        if (!alive) return;
        setErr(e.message || "Failed to load book");
      });

    return () => { alive = false; };
  }, [id]);

  if (err) {
    return (
      <div className="p-6">
        <div className="text-red-600 mb-2">Error: {err}</div>
        <Link to="/books" className="underline">Back to Browse</Link>
      </div>
    );
  }

  if (!b) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 grid md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <div className="aspect-[3/4] bg-gray-100 overflow-hidden rounded">
          {b.cover_image ? (
            <img src={b.cover_image} alt={b.title} className="w-full h-full object-cover" />
          ) : null}
        </div>
      </div>

      <div className="md:col-span-2">
        <h1 className="text-3xl font-bold">{b.title}</h1>
        <p className="text-gray-600 mt-1">by {b.author}</p>
        <p className="mt-3">{b.description}</p>
        <div className="mt-4 text-2xl font-semibold">
          ${Number(b.price).toFixed(2)}
        </div>
        <div className="mt-4 flex gap-2">
          <button className="px-4 py-2 rounded bg-black text-white">Read Online</button>
          <button className="px-4 py-2 rounded border">Download</button>
        </div>
      </div>
    </div>
  );
}
