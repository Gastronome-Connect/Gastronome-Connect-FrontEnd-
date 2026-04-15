import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { ShieldCheck, Monitor } from "lucide-react";

function MobileBlock() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0060A9] to-[#00B4FA] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 shadow-xl">
        <Monitor size={36} className="text-white" />
      </div>
      <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
        <ShieldCheck size={28} className="text-white" strokeWidth={2.5} />
      </div>
      <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
        Desktop Only
      </h1>
      <p className="text-blue-100 text-sm font-medium leading-relaxed max-w-xs">
        The Admin Panel is only accessible on desktop. Please switch to a larger
        screen to continue.
      </p>
      <div className="mt-8 px-5 py-2.5 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-widest">
        Gastronome · Admin Panel
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const token =
    localStorage.getItem("adminAccessToken") ||
    localStorage.getItem("accessToken");

  if (!token) {
    return <Navigate to="/401" replace />;
  }

  return (
    <>
      {/* Block on mobile/tablet — show friendly message below lg breakpoint */}
      <div className="lg:hidden">
        <MobileBlock />
      </div>

      {/* Full admin UI — only rendered on lg+ */}
      <div className="hidden lg:flex min-h-screen bg-[#FDFCF9]">
        <AdminSidebar onCollapse={() => {}} />
        <main className="flex-1 overflow-auto" style={{ minWidth: 0 }}>
          <Outlet />
        </main>
      </div>
    </>
  );
}
