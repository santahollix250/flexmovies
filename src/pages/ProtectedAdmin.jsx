import { useState } from "react";
import Admin from "./Admin";

const ADMIN_PASSWORD = "santa250"; // 🔐 Change your password

export default function ProtectedAdmin() {
  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (password === ADMIN_PASSWORD) {
      setAuthorized(true);
      setError("");
    } else {
      setError("Wrong password");
    }
  }

  if (authorized) {
    return <Admin />;
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-6 rounded w-full max-w-sm"
      >
        <h1 className="text-xl font-bold text-white mb-4 text-center">
          Admin Login
        </h1>

        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-3 bg-gray-800 text-white rounded"
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button className="w-full bg-red-600 py-2 rounded font-semibold">
          Login
        </button>
      </form>
    </div>
  );
}
