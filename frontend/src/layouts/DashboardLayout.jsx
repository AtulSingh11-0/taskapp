import { Outlet } from "react-router";
import Navbar from "../components/Sidebar";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-td-bg dark:bg-td-dark-bg">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 sm:px-8 py-10">
        <Outlet />
      </main>
    </div>
  );
}
