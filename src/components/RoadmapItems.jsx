import { useState, useEffect, use } from "react";
import RoadmapItemsCard from "./RoadmapItemsCard";

export default function RoadmapItems({ itemsPromise }) {
  const initialItems = use(itemsPromise);
  const [items, setItems] = useState(initialItems);

  const token = localStorage.getItem("token");
  const user_id = localStorage.getItem("user_id");

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (!value.trim()) {
      setItems(initialItems);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setItems(initialItems);
  };

  const fetchItems = async () => {
    if (!searchQuery.trim()) {
      setItems(initialItems);
      return;
    }

    try {
      const response = await fetch(
        `https://roadmap-app-co73.onrender.com/roadmaps/items/?search=${searchQuery.trim()}`
      );
      const data = await response.json();
      setItems(data.results);
    } catch (error) {
      console.error("Error fetching roadmap items:", error);
    }
  };

  const handleEnterKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      fetchItems();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <div className="flex gap-2 mb-6">
        <div className="relative w-full sm:w-1/3">
          <input
            type="text"
            placeholder="Search roadmap items..."
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleEnterKey}
            className="w-full border border-gray-300 rounded-lg pl-4 pr-9 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5 text-xs font-bold"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
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
