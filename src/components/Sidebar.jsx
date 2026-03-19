import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-60 h-screen bg-gray-900 p-6">

      <h1 className="text-xl font-bold mb-8">
        CI Analytics
      </h1>

      <nav className="flex flex-col gap-4">

        <Link to="/" className="hover:text-blue-400">
          Dashboard
        </Link>

        <Link to="/developers" className="hover:text-blue-400">
          Developers
        </Link>

        <Link to="/files" className="hover:text-blue-400">
          Files
        </Link>

        <Link to="/tests" className="hover:text-blue-400">
          Tests
        </Link>

        <Link to="/bugs" className="hover:text-blue-400">
          Bugs
        </Link>

      </nav>
    </div>
  );
}