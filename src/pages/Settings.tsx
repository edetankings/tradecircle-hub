import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings as SettingsIcon, User, FileText, LogOut, Camera, Save, Printer, Download, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTrades } from "@/hooks/useTrades";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Settings() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { data: trades = [] } = useTrades();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    display_name: "",
    avatar_url: "",
    full_name: "",
    phone: "",
    country: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile((p) => ({
            ...p,
            display_name: data.display_name || "",
            avatar_url: data.avatar_url || "",
          }));
        }
      });
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: profile.display_name })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Profile updated successfully" });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `avatars/${user.id}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("screenshots").upload(path, file, { upsert: true });
    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("screenshots").getPublicUrl(path);
    const avatar_url = urlData.publicUrl;

    await supabase.from("profiles").update({ avatar_url }).eq("user_id", user.id);
    setProfile((p) => ({ ...p, avatar_url }));
    setUploading(false);
    toast({ title: "Avatar updated" });
  };

  const filteredTrades = trades.filter((t) => {
    if (dateFrom && t.date < dateFrom) return false;
    if (dateTo && t.date > dateTo) return false;
    return true;
  });

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Trading Statement", 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), "PPpp")}`, 14, 30);
    doc.text(`Account: ${user?.email || ""}`, 14, 36);
    if (dateFrom || dateTo) {
      doc.text(`Period: ${dateFrom || "Start"} to ${dateTo || "Present"}`, 14, 42);
    }

    const rows = filteredTrades.map((t) => [
      t.id.slice(0, 8),
      t.pair,
      t.type,
      t.entry_price.toFixed(5),
      t.exit_price.toFixed(5),
      t.lot_size.toString(),
      `$${t.profit_loss.toFixed(2)}`,
      t.date,
    ]);

    autoTable(doc, {
      startY: dateFrom || dateTo ? 48 : 42,
      head: [["ID", "Pair", "Type", "Entry", "Exit", "Lots", "P/L", "Date"]],
      body: rows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 30, 30] },
    });

    const totalPL = filteredTrades.reduce((s, t) => s + t.profit_loss, 0);
    const finalY = (doc as any).lastAutoTable?.finalY || 100;
    doc.setFontSize(11);
    doc.text(`Total P/L: $${totalPL.toFixed(2)}`, 14, finalY + 10);
    doc.text(`Total Trades: ${filteredTrades.length}`, 14, finalY + 16);

    return doc;
  };

  const handleExportPDF = () => {
    const doc = generatePDF();
    doc.save(`trading-statement-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    toast({ title: "PDF exported" });
  };

  const handlePrint = () => {
    const doc = generatePDF();
    doc.autoPrint();
    window.open(doc.output("bloburl"), "_blank");
  };

  const initials = (profile.display_name || user?.email || "U").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
          <SettingsIcon className="w-7 h-7 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5 text-primary" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <Avatar className="w-20 h-20 border-2 border-border">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-lg bg-primary/10 text-primary">{initials}</AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={uploading}
              >
                <Camera className="w-5 h-5 text-foreground" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-xs text-muted-foreground">Account ID</p>
              <p className="text-xs font-mono text-muted-foreground">{user?.id?.slice(0, 12)}...</p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={profile.display_name}
                onChange={(e) => setProfile((p) => ({ ...p, display_name: e.target.value }))}
                placeholder="Enter username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ""} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+1 234 567 890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={profile.country}
                onChange={(e) => setProfile((p) => ({ ...p, country: e.target.value }))}
                placeholder="Enter country"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Date Joined</Label>
            <Input value={user?.created_at ? format(new Date(user.created_at), "PPP") : ""} disabled className="bg-muted" />
          </div>

          <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Trading Statement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-primary" />
            Trading Statement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Generate a detailed trading report like a bank statement.</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> From</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> To</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-foreground">Preview ({filteredTrades.length} trades)</p>
              <p className="text-sm font-semibold text-foreground">
                Total: <span className={filteredTrades.reduce((s, t) => s + t.profit_loss, 0) >= 0 ? "text-profit" : "text-loss"}>
                  ${filteredTrades.reduce((s, t) => s + t.profit_loss, 0).toFixed(2)}
                </span>
              </p>
            </div>
            {filteredTrades.length > 0 ? (
              <div className="overflow-x-auto max-h-48">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="py-1.5 text-left">ID</th>
                      <th className="py-1.5 text-left">Pair</th>
                      <th className="py-1.5 text-right">Entry</th>
                      <th className="py-1.5 text-right">Exit</th>
                      <th className="py-1.5 text-right">Lots</th>
                      <th className="py-1.5 text-right">P/L</th>
                      <th className="py-1.5 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrades.slice(0, 10).map((t) => (
                      <tr key={t.id} className="border-b border-border/30">
                        <td className="py-1 font-mono">{t.id.slice(0, 6)}</td>
                        <td className="py-1">{t.pair}</td>
                        <td className="py-1 text-right">{t.entry_price}</td>
                        <td className="py-1 text-right">{t.exit_price}</td>
                        <td className="py-1 text-right">{t.lot_size}</td>
                        <td className={`py-1 text-right font-medium ${t.profit_loss >= 0 ? "text-profit" : "text-loss"}`}>${t.profit_loss.toFixed(2)}</td>
                        <td className="py-1 text-right">{t.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredTrades.length > 10 && <p className="text-[10px] text-muted-foreground mt-1">...and {filteredTrades.length - 10} more</p>}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">No trades in selected period</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button onClick={handleExportPDF} variant="outline" className="gap-2" disabled={filteredTrades.length === 0}>
              <Download className="w-4 h-4" /> Export PDF
            </Button>
            <Button onClick={handlePrint} variant="outline" className="gap-2" disabled={filteredTrades.length === 0}>
              <Printer className="w-4 h-4" /> Print
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card>
        <CardContent className="py-6">
          <Button variant="destructive" className="w-full gap-2" onClick={signOut}>
            <LogOut className="w-4 h-4" />
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
