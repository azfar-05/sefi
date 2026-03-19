import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Developers from "./pages/Developers";
import Files from "./pages/Files";
import Tests from "./pages/Tests";
import Bugs from "./pages/Bugs";

export default function App() {
  return (
    <BrowserRouter>

      <div className="flex">

        <Sidebar />

        <div className="flex-1">

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/developers" element={<Developers />} />
            <Route path="/files" element={<Files />} />
            <Route path="/tests" element={<Tests />} />
            <Route path="/bugs" element={<Bugs />} />
          </Routes>

        </div>

      </div>

    </BrowserRouter>
  );
}