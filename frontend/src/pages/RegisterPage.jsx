import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function Logo({ size = 52 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#dc4c3e" />
      <path
        d="M6.5 12.5l3.5 3.5 7.5-7.5"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await register(name, email, password);
      toast.success(`Welcome, ${data.name}!`);
      navigate("/tasks");
    } catch {
      // Axios interceptor shows error toast
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-td-surface dark:bg-td-dark-bg px-4">
      <div className="w-full max-w-[440px]">
        <div className="text-center mb-10">
          <div className="mx-auto mb-5 w-fit">
            <Logo size={56} />
          </div>
          <h1 className="text-[32px] font-extrabold text-td-text dark:text-td-dark-text tracking-tight">
            Sign up
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-td-text dark:text-td-dark-text mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-xl border border-td-border-strong dark:border-td-dark-border
                bg-td-surface dark:bg-td-dark-surface text-td-text dark:text-td-dark-text text-base
                placeholder:text-td-text-tertiary dark:placeholder:text-td-dark-text-tertiary
                focus:outline-none focus:border-td-red focus:ring-1 focus:ring-td-red/30"
              placeholder="Enter your name..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-td-text dark:text-td-dark-text mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-xl border border-td-border-strong dark:border-td-dark-border
                bg-td-surface dark:bg-td-dark-surface text-td-text dark:text-td-dark-text text-base
                placeholder:text-td-text-tertiary dark:placeholder:text-td-dark-text-tertiary
                focus:outline-none focus:border-td-red focus:ring-1 focus:ring-td-red/30"
              placeholder="Enter your email..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-td-text dark:text-td-dark-text mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full h-12 px-4 rounded-xl border border-td-border-strong dark:border-td-dark-border
                bg-td-surface dark:bg-td-dark-surface text-td-text dark:text-td-dark-text text-base
                placeholder:text-td-text-tertiary dark:placeholder:text-td-dark-text-tertiary
                focus:outline-none focus:border-td-red focus:ring-1 focus:ring-td-red/30"
              placeholder="6+ characters"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl text-base font-bold text-white cursor-pointer
              bg-td-red hover:bg-td-red-hover active:scale-[0.98]
              disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-td-border dark:border-td-dark-border text-center">
          <p className="text-sm text-td-text-secondary dark:text-td-dark-text-secondary">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-td-red font-semibold hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
