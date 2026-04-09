import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Files from "./pages/Files";
import Tests from "./pages/Tests"
import Commits from "./pages/Commits"
import CommitChain from "./pages/CommitChain"
import MTTR from "./pages/MTTR";
import Generate from "./pages/Generate";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/files" element ={<Files />} />
        <Route path="/tests" element={<Tests />} />
        <Route path="/commits" element={<Commits />} />
        <Route path="/chain" element={<CommitChain />} />
        <Route path="/mttr" element={<MTTR/ >} />
        <Route path="/generate" element={<Generate />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
