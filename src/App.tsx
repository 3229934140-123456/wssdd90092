import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import EventsList from "@/pages/EventsList";
import EventDetail from "@/pages/EventDetail";
import ReviewsList from "@/pages/ReviewsList";
import MaterialsList from "@/pages/MaterialsList";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<EventsList />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/reviews" element={<ReviewsList />} />
        <Route path="/materials" element={<MaterialsList />} />
      </Routes>
    </Router>
  );
}
