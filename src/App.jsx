import { Suspense } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Register from "./components/Register";
import Login from "./components/Login";
import RoadmapItems from "./components/RoadmapItems";
import Footer from "./components/Footer";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const fetchRoadmapItems = async () => {
  try {
    const response = await fetch("https://roadmap-app-co73.onrender.com/roadmaps/items/");
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error fetching roadmap items:", error);
    return [];
  }
};

const itemsPromise = fetchRoadmapItems();

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar brandName="Roadmap" />
        <main className="flex-1">
          <Suspense fallback={<p className="text-center mt-10">Loading...</p>}>
            <Routes>
              <Route
                path="/"
                element={<RoadmapItems itemsPromise={itemsPromise} />}
              />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
