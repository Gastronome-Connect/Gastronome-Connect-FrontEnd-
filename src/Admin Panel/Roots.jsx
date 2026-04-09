import { useNavigate } from "react-router";
import { Lock, ShieldOff, SearchX, AlertTriangle, ShieldCheck } from "lucide-react";

export default function Root() {
  const navigate = useNavigate();

  const errorPages = [
    {
      code: "401",
      title: "Unauthorized",
      description: "Access restricted - authentication required",
      icon: Lock,
      color: "#F57600",
      path: "/401",
    },
    {
      code: "403",
      title: "Forbidden",
      description: "Permission denied - insufficient privileges",
      icon: ShieldOff,
      color: "#0060A9",
      path: "/403",
    },
    {
      code: "404",
      title: "Not Found",
      description: "Recipe missing - page doesn't exist",
      icon: SearchX,
      color: "#00B4FA",
      path: "/404",
    },
    {
      code: "500",
      title: "Server Error",
      description: "Kitchen overload - internal server error",
      icon: AlertTriangle,
      color: "#0060A9",
      path: "/500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFCF9] via-gray-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-[#0060A9] mb-3 tracking-tighter uppercase">
            Gastronome Connect
          </h1>
          <p className="text-gray-500 font-medium">
            Admin Dashboard & Error Pages Showcase
          </p>
        </div>

        {/* Admin Dashboard Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-gray-900 mb-6 uppercase tracking-tight flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-[#0060A9] to-[#00B4FA] rounded-full" />
            Admin Dashboard
          </h2>
          <button
            onClick={() => navigate("/admin")}
            className="w-full bg-gradient-to-br from-[#0060A9] to-[#00B4FA] rounded-[2rem] p-8 shadow-2xl hover:shadow-3xl transition-all hover:scale-105 border-2 border-transparent hover:border-[#F57600] group text-left"
          >
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <ShieldCheck size={40} className="text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">
                  Admin Panel
                </h3>
                <p className="text-blue-100 font-medium mb-4">
                  Complete admin dashboard with user management, statistics, and moderation tools
                </p>
                <div className="flex gap-4 text-xs font-black uppercase tracking-wider text-white/80">
                  <span>✓ User Timeout Review</span>
                  <span>✓ Account Restoration</span>
                  <span>✓ Statistics & Analytics</span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Error Pages Section */}
        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-6 uppercase tracking-tight flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-[#F57600] to-[#F0AE35] rounded-full" />
            Error Pages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {errorPages.map((error) => {
              const Icon = error.icon;
              return (
                <button
                  key={error.code}
                  onClick={() => navigate(error.path)}
                  className="bg-white rounded-[2rem] p-8 shadow-lg hover:shadow-2xl transition-all hover:scale-105 border-2 border-transparent hover:border-[#F57600] group text-left"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: `${error.color}15` }}
                    >
                      <Icon size={32} style={{ color: error.color }} strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <p
                        className="text-[10px] font-black uppercase tracking-[0.3em] mb-1"
                        style={{ color: error.color }}
                      >
                        Error {error.code}
                      </p>
                      <h2 className="text-2xl font-black text-gray-900 group-hover:text-[#F57600] transition-colors">
                        {error.title}
                      </h2>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">{error.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-12 bg-white rounded-[2rem] p-8 shadow-lg">
          <h2 className="text-2xl font-black text-gray-900 mb-4">Design Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
            <div className="flex items-start gap-3">
              <span className="text-[#F57600] font-black">✨</span>
              <p>Animated components with Motion (Framer Motion)</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#F57600] font-black">🎨</span>
              <p>60/30/10 color rule: White, Blue (#0060A9), Orange (#F57600)</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#F57600] font-black">🎭</span>
              <p>Smooth transitions and hover effects throughout</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#F57600] font-black">📱</span>
              <p>Fully responsive and mobile-optimized design</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#F57600] font-black">🎯</span>
              <p>Consistent UI hierarchy and typography system</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#F57600] font-black">⚡</span>
              <p>Kitchen/culinary themed messaging for brand consistency</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}