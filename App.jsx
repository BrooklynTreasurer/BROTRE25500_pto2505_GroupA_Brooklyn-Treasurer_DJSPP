import { Routes, Route } from "react-router-dom";
import Header from "./components/UI/Header.jsx";
import Home from "./pages/Home.jsx";
import ShowDetail from "./pages/ShowDetail.jsx";
import { PodcastProvider } from "./context/PodcastContext.jsx";
import { useParams } from "react-router-dom";

export default function App() {
  return (
    <>
    <Header />
    <PodcastProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/show/:id" element={<ShowDetail />} />
      </Routes>
    </PodcastProvider>
    </>
   );
}