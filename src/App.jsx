import { Routes, Route } from "react-router-dom";
import Header from "./components/UI/Header.jsx";
import Home from "./pages/Home.jsx";
import ShowDetail from "./pages/ShowDetail.jsx";

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/show/:id" element={<ShowDetail />} />
      </Routes>
    </>
  );
}
