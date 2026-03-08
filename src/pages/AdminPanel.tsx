import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Search, Users, Monitor, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserRow {
  user_id: string;
  display_name: string;
  created_at: string;
  email: string;
  role: string;
  mt_accounts: number;
  total_trades: number;
  total_profit: number;
}

interface AccountRow {
  id: string;
  broker_name: string;
  server_name: string;
  account_number: string;
  platform: string;
  account_label: string;
  user_name: string;
  last_synced_at: string | null;
  created_at: string;
}

export default function AdminPanel() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchData = async () => {
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

      // Fetch MT accounts
      const { data: mtAccounts } = await supabase
        .from("mt_accounts")
        .select("*")
        .order("created_at", { ascending: false });

      // Fetch trade stats per user
      const { data: trades } = await supabase
        .from("trades")
        .select("user_id, profit_loss");

      const roleMap: Record<string, string> = {};
      roles?.forEach((r: any) => { roleMap[r.user_id] = r.role; });

      const accountCountMap: Record<string, number> = {};
      (mtAccounts as any[])?.forEach((a) => {
        accountCountMap[a.user_id] = (accountCountMap[a.user_id] || 0) + 1;
      });

      const tradeStatsMap: Record<string, { count: number; profit: number }> = {};
      (trades as any[])?.forEach((t) => {
        if (!tradeStatsMap[t.user_id]) tradeStatsMap[t.user_id] = { count: 0, profit: 0 };
        tradeStatsMap[t.user_id].count++;
        tradeStatsMap[t.user_id].profit += Number(t.profit_loss);
      });

      const profileMap: Record<string, string> = {};
      profiles?.forEach((p) => { profileMap[p.user_id] = p.display_name; });

      if (profiles) {
        const merged = profiles.map((p) => ({
          user_id: p.user_id,
          display_name: p.display_name,
          created_at: p.created_at,
          email: "",
          role: roleMap[p.user_id] || "user",
          mt_accounts: accountCountMap[p.user_id] || 0,
          total_trades: tradeStatsMap[p.user_id]?.count || 0,
          total_profit: tradeStatsMap[p.user_id]?.profit || 0,
        }));
        setUsers(merged);
      }

      if (mtAccounts) {
        const mappedAccounts = (mtAccounts as any[]).map((a) => ({
          ...a,
          user_name: profileMap[a.user_id] || "Unknown",
        }));
        setAccounts(mappedAccounts);
      }

      setLoading(false);
    };
    fetchData();
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

  const filteredUsers = users.filter((u) =>
    u.display_name.toLowerCase().includes(search.toLowerCase()) ||
    u.user_id.toLowerCase().includes(search.toLowerCase())
  );

  const filteredAccounts = accounts.filter((a) =>
    a.user_name.toLowerCase().includes(search.toLowerCase()) ||
    a.broker_name.toLowerCase().includes(search.toLowerCase()) ||
    a.account_number.includes(search)
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Admin Panel</h1>
        </div>
        <p className="text-muted-foreground text-sm mt-1">Manage users, accounts, and trade stats.</p>
      </motion.div>

      <div className="flex items-center gap-3">
        <div className="glass-card flex items-center gap-2 px-3 py-1 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, broker, or account..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-8 text-sm"
          />
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5"><Users className="w-4 h-4" />{users.length} users</div>
          <div className="flex items-center gap-1.5"><Monitor className="w-4 h-4" />{accounts.length} accounts</div>
        </div>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" className="gap-1.5"><Users className="w-3.5 h-3.5" />Users</TabsTrigger>
          <TabsTrigger value="accounts" className="gap-1.5"><Monitor className="w-3.5 h-3.5" />MT Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading users...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Holder Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>MT Accounts</TableHead>
                    <TableHead>Total Trades</TableHead>
                    <TableHead>Total P/L</TableHead>
                    <TableHead>Date Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.user_id}>
                      <TableCell className="font-medium text-foreground">{u.display_name}</TableCell>
                      <TableCell>
                        <Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{u.mt_accounts}/3</TableCell>
                      <TableCell className="text-muted-foreground">{u.total_trades}</TableCell>
                      <TableCell className={u.total_profit >= 0 ? "text-profit" : "text-loss"}>
                        ${u.total_profit.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(u.created_at), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No users found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="accounts">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading accounts...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Broker</TableHead>
                    <TableHead>Server</TableHead>
                    <TableHead>Account #</TableHead>
                    <TableHead>Last Synced</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium text-foreground">{a.user_name}</TableCell>
                      <TableCell className="text-muted-foreground">{a.account_label}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{a.platform}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{a.broker_name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{a.server_name}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">{a.account_number}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {a.last_synced_at ? format(new Date(a.last_synced_at), "MMM d, h:mm a") : "Never"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredAccounts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No accounts found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
