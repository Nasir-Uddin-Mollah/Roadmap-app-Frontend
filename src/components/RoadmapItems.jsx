import React, { useState, useEffect } from "react";
import RoadmapItemsCard from "./RoadmapItemsCard";

export default function RoadmapItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const user_id = localStorage.getItem("user_id");

  const [searchQuery, setSearchQuery] = useState("");

  const fetchItems = async () => {
    try {
      setLoading(true);
      let url = "https://roadmap-app-co73.onrender.com/roadmaps/items/";

      if (searchQuery) {
        url += `?search=${searchQuery}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setItems(data.results);
    } catch (error) {
      console.error("Error fetching roadmap items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleEnterKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      fetchItems();
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Search roadmap items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleEnterKey}
          className="w-full sm:w-1/3 border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={fetchItems}
          className="sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition cursor-pointer"
        >
          Search
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-center mt-10 text-gray-500">
          No roadmap items found.
        </p>
      ) : (
        items.map((item) => (
          <RoadmapItemsCard
            key={item.id}
            item={item}
            token={token}
            user_id={user_id}
          />
        ))
      )}
    </div>
  );
}
