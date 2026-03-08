import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Plus, BookOpen, Calendar, BarChart3, Trophy, PenLine,
  Menu, X, TrendingUp, Link2, LogOut, GraduationCap, Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/add-trade", label: "Add Trade", icon: Plus },
  { path: "/journal", label: "Journal", icon: BookOpen },
  { path: "/calendar", label: "Calendar", icon: Calendar },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { path: "/reflections", label: "Reflections", icon: PenLine },
  { path: "/connect", label: "Connect Myfxbook", icon: Link2 },
  { path: "/backtesting-guide", label: "Backtesting Guide", icon: GraduationCap },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signOut, user, isAdmin } = useAuth();

  const allNavItems = isAdmin
    ? [...navItems, { path: "/admin", label: "Admin Panel", icon: Shield }]
    : navItems;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-sidebar fixed h-full z-30">
        <div className="p-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">TradeCircle</span>
        </div>
        <nav className="flex-1 px-3 space-y-1 mt-2">
          {allNavItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <item.icon className="w-4.5 h-4.5" />
                {item.label}
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 w-0.5 h-6 bg-primary rounded-r"
                  />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 mx-3 mb-4 space-y-3">
          <div className="flex items-center justify-between glass-card p-3">
            <p className="text-xs text-muted-foreground truncate flex-1">{user?.email}</p>
            <ThemeToggle />
          </div>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-sidebar border-b border-border z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span className="text-lg font-bold text-foreground">TradeCircle</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-foreground p-1">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-30 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          >
            <motion.nav
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="w-64 h-full bg-sidebar border-r border-border pt-16 px-3 space-y-1 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1 space-y-1">
                {allNavItems.map((item) => {
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
              <div className="pb-6">
                <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </Button>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="p-4 md:p-8 pt-20 lg:pt-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
