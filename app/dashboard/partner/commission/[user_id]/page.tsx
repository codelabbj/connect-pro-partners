"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/useApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display";

export default function CommissionStatPage({ params }: { params: { user_id: string } }) {
  const userId = params.user_id;
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState("");
  const [lastPeriodEnd, setLastPeriodEnd] = useState<string | null>(null);
  const apiFetch = useApi();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError("");
      try {
        const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/admin/users/${userId}/commission-stats/`;
        const data = await apiFetch(endpoint);
        setStats(data);
        // Find last period_end from commission_history
        if (data.commission_history && data.commission_history.length > 0) {
          const last = data.commission_history[data.commission_history.length - 1];
          setLastPeriodEnd(last.period_end);
        }
      } catch (err: any) {
        setError(extractErrorMessages(err));
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [userId, baseUrl, apiFetch]);

  const handlePayCommission = async () => {
    setPayLoading(true);
    setPayError("");
    try {
      const now = new Date().toISOString();
      const payload = {
        amount: parseFloat(amount),
        period_start: lastPeriodEnd || stats?.period_info?.start || now,
        period_end: now,
        admin_notes: adminNote,
      };
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/admin/users/${userId}/pay-commission/`;
      await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
      setModalOpen(false);
      setAmount("");
      setAdminNote("");
      // Optionally, refetch stats
      window.location.reload();
    } catch (err: any) {
      setPayError(extractErrorMessages(err));
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="flex justify-end mb-4">
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow" style={{minWidth:120}}>Pay Commission</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pay Commission</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="number"
                placeholder="Amount (e.g. 25000.00)"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
              <Input
                placeholder="Admin Note (e.g. Reason for payment)"
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
              />
              {payError && <ErrorDisplay error={payError} />}
            </div>
            <DialogFooter>
              <Button onClick={handlePayCommission} disabled={payLoading}>
                {payLoading ? "Paying..." : "Pay"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-6">
        {/* Carte Infos Utilisateur */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de l'utilisateur</CardTitle>
          </CardHeader>
          <CardContent>
            <div><b>UID :</b> {stats?.user_info?.uid}</div>
            <div><b>Nom :</b> {stats?.user_info?.name}</div>
            <div><b>Email :</b> {stats?.user_info?.email}</div>
          </CardContent>
        </Card>
        {/* Carte Infos Période */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de la période</CardTitle>
          </CardHeader>
          <CardContent>
            <div><b>Début :</b> {stats?.period_info?.start}</div>
            <div><b>Fin :</b> {stats?.period_info?.end}</div>
            <div><b>Inclure payés :</b> {stats?.period_info?.include_paid ? "Oui" : "Non"}</div>
          </CardContent>
        </Card>
        {/* Cartes Totaux séparées */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-blue-500">
            <CardHeader>
              <CardTitle className="text-blue-700">Dépôts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Nombre</div>
              <div className="text-2xl font-bold text-blue-700">{stats?.totals?.deposits?.count}</div>
              <div className="text-sm text-muted-foreground mt-2">Montant</div>
              <div className="text-xl font-bold text-blue-700">{stats?.totals?.deposits?.amount}</div>
            </CardContent>
          </Card>
          <Card className="border-green-500">
            <CardHeader>
              <CardTitle className="text-green-700">Retraits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Nombre</div>
              <div className="text-2xl font-bold text-green-700">{stats?.totals?.withdrawals?.count}</div>
              <div className="text-sm text-muted-foreground mt-2">Montant</div>
              <div className="text-xl font-bold text-green-700">{stats?.totals?.withdrawals?.amount}</div>
            </CardContent>
          </Card>
          <Card className="border-purple-500">
            <CardHeader>
              <CardTitle className="text-purple-700">Toutes opérations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Nombre</div>
              <div className="text-2xl font-bold text-purple-700">{stats?.totals?.all?.count}</div>
              <div className="text-sm text-muted-foreground mt-2">Montant</div>
              <div className="text-xl font-bold text-purple-700">{stats?.totals?.all?.amount}</div>
            </CardContent>
          </Card>
        </div>
        {/* Carte Statistiques par réseau */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiques par réseau</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.stats_by_network && Object.keys(stats.stats_by_network).length > 0 ? (
              <pre className="bg-muted p-2 rounded text-xs">{JSON.stringify(stats.stats_by_network, null, 2)}</pre>
            ) : (
              <div>Aucune statistique réseau disponible pour cette période.</div>
            )}
          </CardContent>
        </Card>
        {/* Carte Historique des commissions */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des commissions</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.commission_history && stats.commission_history.length > 0 ? (
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-left">Début période</th>
                    <th className="px-2 py-1 text-left">Fin période</th>
                    <th className="px-2 py-1 text-left">Montant</th>
                    <th className="px-2 py-1 text-left">Note admin</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.commission_history.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="px-2 py-1">{item.period_start}</td>
                      <td className="px-2 py-1">{item.period_end}</td>
                      <td className="px-2 py-1 font-semibold">{item.amount}</td>
                      <td className="px-2 py-1">{item.admin_notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div>Aucune commission payée pour l'instant.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
