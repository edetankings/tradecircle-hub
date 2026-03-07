import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface UserRow {
  user_id: string;
  display_name: string;
  created_at: string;
  email: string;
  role: string;
}

export default function AdminPanel() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchUsers = async () => {
      setLoading(true);
      // Fetch profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, created_at")
        .order("created_at", { ascending: false });

      // Fetch roles
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (profiles) {
        const roleMap: Record<string, string> = {};
        roles?.forEach((r: any) => { roleMap[r.user_id] = r.role; });

        const merged = profiles.map((p) => ({
          user_id: p.user_id,
          display_name: p.display_name,
          created_at: p.created_at,
          email: "", // email not directly available from profiles
          role: roleMap[p.user_id] || "user",
        }));
        setUsers(merged);
      }
      setLoading(false);
    };
    fetchUsers();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="glass-card p-8 text-center space-y-3">
          <Shield className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="text-lg font-semibold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground text-sm">Admin privileges required.</p>
        </div>
      </div>
    );
  }

  const filtered = users.filter((u) =>
    u.display_name.toLowerCase().includes(search.toLowerCase()) ||
    u.user_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Admin Panel</h1>
        </div>
        <p className="text-muted-foreground text-sm mt-1">Manage all registered users.</p>
      </motion.div>

      <div className="flex items-center gap-3">
        <div className="glass-card flex items-center gap-2 px-3 py-1 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-8 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{users.length} users</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card overflow-hidden"
      >
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading users...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Holder Name</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Date Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.user_id}>
                  <TableCell className="font-medium text-foreground">{u.display_name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs font-mono">{u.user_id.slice(0, 8)}...</TableCell>
                  <TableCell>
                    <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(u.created_at), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </motion.div>
    </div>
  );
}
