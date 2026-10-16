"use client";
// @ts-nocheck

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { createClient, type Session } from "@supabase/supabase-js";
import { Bell, Check, Flame, LogIn, LogOut, RefreshCw, ShieldCheck } from "lucide-react";

const supabase = createClient(
  "https://mabkzkawziqlmgfikwmh.supabase.co",
  "sb_publishable_j6QPu4fgCRZHhOnUPEdyvA_ixP9ibtr",
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);
type OwnerMessage = { id: string; store_id: string; category: string; title: string; body: string; created_at: string; read_at: string | null };
type OwnerOrder = { id: string; order_number: number; status: string; total_cents: number; payload: { customerName?: string; customerPhone?: string; deliveryAddress?: { street?: string; number?: string; neighborhood?: string; complement?: string }; paymentMethod?: string; notes?: string; items?: { name?: string; quantity?: number; price?: number; notes?: string; selectedAddons?: { name?: string }[] }[] }; created_at: string };

export default function OwnerPortal() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [messages, setMessages] = useState<OwnerMessage[]>([]);
  const [orders, setOrders] = useState<OwnerOrder[]>([]);
  const [ordersError, setOrdersError] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [passwordSetup, setPasswordSetup] = useState(false);

  useEffect(() => {
    document.body.classList.add("owner-login-body");
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setPasswordSetup(Boolean(data.session && (window.location.hash.includes("type=invite") || window.location.hash.includes("type=recovery"))));
      setChecking(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      if (nextSession) setPasswordSetup((current) => current || window.location.hash.includes("type=invite") || window.location.hash.includes("type=recovery"));
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); document.body.classList.remove("owner-login-body"); };
  }, []);

  const loadMessages = useCallback(async () => {
    setError("");
    const { data, error: queryError } = await supabase.from("store_owner_messages")
      .select("id,store_id,category,title,body,created_at,read_at").order("created_at", { ascending: false }).limit(100);
    if (queryError) { setError("Não foi possível carregar as mensagens. Confirme se esta conta está vinculada à loja."); return; }
    setMessages((data || []) as OwnerMessage[]);
  }, []);
  useEffect(() => { if (session && !passwordSetup) void loadMessages(); }, [session, passwordSetup, loadMessages]);
  const loadOrders = useCallback(async () => {
    setOrdersError("");
    const { data, error: queryError } = await supabase.from("delivery_orders")
      .select("id,order_number,status,total_cents,payload,created_at")
      .order("created_at", { ascending: false }).limit(100);
    if (queryError) { setOrdersError("Não foi possível carregar os pedidos. Confirme se esta conta está vinculada como proprietária da loja."); return; }
    setOrders((data || []) as OwnerOrder[]);
  }, []);
  useEffect(() => {
    if (!session || passwordSetup) return;
    void loadOrders();
    const timer = window.setInterval(() => { void loadOrders(); }, 15000);
    return () => window.clearInterval(timer);
  }, [session, passwordSetup, loadOrders]);
  async function updateOrderStatus(order: OwnerOrder, status: string) {
    setOrdersError("");
    const { error: updateError } = await supabase.from("delivery_orders").update({ status }).eq("id", order.id);
    if (updateError) { setOrdersError("Não foi possível atualizar o status deste pedido."); return; }
    setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status } : item));
  }
  const unread = useMemo(() => messages.filter((message) => !message.read_at).length, [messages]);

  async function signIn(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (authError) setError("Não foi possível entrar. Confira o e-mail e a senha ou aceite primeiro o convite enviado pela NovaesWeb.");
    else { setSession(data.session); setNotice("Acesso realizado."); }
    setBusy(false);
  }
  async function setInitialPassword(event: FormEvent) {
    event.preventDefault();
    if (newPassword.length < 8) { setError("Use uma senha com pelo menos 8 caracteres."); return; }
    setBusy(true); setError(""); setNotice("");
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) setError("Não foi possível definir a senha. Abra novamente o link de convite recebido por e-mail.");
    else { setPasswordSetup(false); setNewPassword(""); setNotice("Senha definida com sucesso."); await loadMessages(); }
    setBusy(false);
  }
  async function markRead(message: OwnerMessage) {
    if (message.read_at) return;
    const readAt = new Date().toISOString();
    const { error: updateError } = await supabase.from("store_owner_messages").update({ read_at: readAt }).eq("id", message.id);
    if (updateError) { setError("Não foi possível marcar esta mensagem como lida."); return; }
    setMessages((current) => current.map((item) => item.id === message.id ? { ...item, read_at: readAt } : item));
  }
  async function signOut() { await supabase.auth.signOut(); setSession(null); setMessages([]); setOrders([]); setPasswordSetup(false); }

  return <main className="min-h-screen bg-[#11100f] px-4 py-8 text-white sm:px-6"><div className="mx-auto max-w-3xl">
    <header className="mb-8 flex items-center justify-between gap-4 border-b border-white/10 pb-5">
      <div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400"><Flame size={25}/></span><div><p className="text-xs font-bold tracking-[0.22em] text-orange-400">FOGO NA BRASA</p><h1 className="text-xl font-bold">Painel do proprietário</h1><p className="text-xs text-stone-400">Pedidos, mensagens e operação da loja</p></div></div>
      {session && <button onClick={() => void signOut()} className="flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm text-stone-300 hover:bg-white/5"><LogOut size={15}/> Sair</button>}
    </header>
    {(error || notice) && <div role={error ? "alert" : "status"} className={`mb-4 rounded-xl border p-3 text-sm ${error ? "border-red-500/30 bg-red-950/30 text-red-200" : "border-emerald-500/30 bg-emerald-950/20 text-emerald-200"}`}>{error || notice}</div>}
    {checking ? <div className="rounded-2xl border border-white/10 p-8 text-center text-stone-400">Verificando sua sessão...</div> :
      passwordSetup && session ? <form onSubmit={setInitialPassword} className="mx-auto max-w-md space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <ShieldCheck className="text-orange-400" size={28}/><h2 className="text-lg font-semibold">Crie sua senha de acesso</h2><p className="text-sm text-stone-400">Defina uma senha segura para acessar as mensagens da sua loja.</p>
        <input className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 outline-none focus:border-orange-400" type="password" autoComplete="new-password" minLength={8} placeholder="Nova senha (mínimo 8 caracteres)" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required/>
        <button disabled={busy} className="w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-black disabled:opacity-50">{busy ? "Salvando..." : "Definir senha"}</button>
      </form> : !session ? <div className="relative overflow-hidden rounded-[28px] border border-red-500/25 bg-gradient-to-br from-[#241313] via-[#17100f] to-[#0d0c0c] shadow-2xl shadow-red-950/30"><div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-red-600/20 blur-3xl"/><div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl"/><div className="relative grid gap-8 p-6 sm:p-10 md:grid-cols-[1fr_380px] md:items-center"><div className="space-y-5"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-400 text-white shadow-lg shadow-red-900/40"><Flame size={34}/></div><div><p className="text-xs font-bold tracking-[0.28em] text-orange-300">FOGO NA BRASA</p><h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">A operação da sua loja começa aqui.</h2></div><p className="max-w-md text-sm leading-6 text-stone-300">Acompanhe pedidos, atualize os status e mantenha tudo sob controle em um só lugar.</p><div className="grid gap-3 text-sm text-stone-300 sm:grid-cols-3 md:grid-cols-1"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-orange-400"/>Pedidos em tempo real</div><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-400"/>Acesso protegido</div><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-yellow-300"/>Gestão simples</div></div></div><form onSubmit={signIn} className="space-y-4 rounded-2xl border border-white/10 bg-black/25 p-5 backdrop-blur sm:p-6"><div className="mb-5"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-400/15 text-orange-300"><LogIn size={20}/></div><h3 className="text-xl font-bold text-white">Entrar no painel</h3><p className="mt-1 text-sm leading-5 text-stone-400">Use o e-mail e a senha da conta da loja.</p></div><label className="block text-sm text-stone-300">E-mail<input className="mt-2 w-full rounded-xl border border-white/15 bg-[#0d0b0b] px-4 py-3 text-white outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20" type="email" autoComplete="email" placeholder="voce@exemplo.com" value={email} onChange={(event) => setEmail(event.target.value)} required/></label><label className="block text-sm text-stone-300">Senha<input className="mt-2 w-full rounded-xl border border-white/15 bg-[#0d0b0b] px-4 py-3 text-white outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20" type="password" autoComplete="current-password" placeholder="Digite sua senha" value={password} onChange={(event) => setPassword(event.target.value)} required/></label><button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-400 px-4 py-3 font-bold text-white shadow-lg shadow-red-950/30 transition hover:brightness-110 disabled:opacity-50">{busy ? "Entrando..." : "Entrar no painel"}<LogIn size={17}/></button><p className="pt-1 text-center text-xs leading-5 text-stone-500">Acesso reservado à equipe autorizada da loja.</p></form></div></div> : <div className="space-y-8"><section className="space-y-4">
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><Bell className="text-orange-400" size={18}/><h2 className="font-semibold">Caixa de entrada</h2></div><p className="mt-1 text-sm text-stone-400">{unread} mensagem(ns) não lida(s)</p></div><button onClick={() => void loadMessages()} className="flex items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm text-stone-300 hover:bg-white/5"><RefreshCw size={15}/> Atualizar</button></div>
        {messages.length === 0 ? <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center"><Bell className="mx-auto mb-3 text-stone-500" size={28}/><h3 className="font-semibold">Nenhuma mensagem por enquanto</h3><p className="mt-2 text-sm text-stone-400">Os comunicados administrativos da NovaesWeb aparecerão aqui.</p></div> :
          messages.map((message) => <article key={message.id} className={`rounded-2xl border p-5 ${message.read_at ? "border-white/10 bg-white/[0.02]" : "border-orange-500/30 bg-orange-500/[0.04]"}`}>
            <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-400">{message.category}</p><h3 className="mt-1 font-semibold">{message.title}</h3></div>{!message.read_at && <span className="rounded-full bg-orange-500/15 px-2 py-1 text-[10px] font-semibold text-orange-300">Nova</span>}</div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-stone-300">{message.body}</p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3 text-xs text-stone-500"><span>{new Date(message.created_at).toLocaleString("pt-BR")}</span>{!message.read_at && <button onClick={() => void markRead(message)} className="flex items-center gap-1 rounded-lg border border-white/15 px-3 py-2 text-stone-300 hover:bg-white/5"><Check size={14}/> Marcar como lida</button>}</div>
          </article>)
        }
      </section>
      <section className="mt-8 space-y-4">
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><div className="flex items-center gap-2"><Flame className="text-orange-400" size={18}/><h2 className="font-semibold">Pedidos da loja</h2></div><p className="mt-1 text-sm text-stone-400">Atualização automática a cada 15 segundos · {orders.length} pedido(s)</p></div>
          <button onClick={() => void loadOrders()} className="flex items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm text-stone-300 hover:bg-white/5"><RefreshCw size={15}/> Atualizar pedidos</button>
        </div>
        {ordersError && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-200">{ordersError}</p>}
        {orders.length === 0 ? <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center"><Flame className="mx-auto mb-3 text-stone-500" size={28}/><h3 className="font-semibold">Nenhum pedido recebido</h3><p className="mt-2 text-sm text-stone-400">Quando um cliente finalizar um pedido no site, ele aparecerá aqui.</p></div> :
          orders.map((order) => {
            const payload = order.payload || {};
            const address = payload.deliveryAddress ? [payload.deliveryAddress.street, payload.deliveryAddress.number, payload.deliveryAddress.neighborhood, payload.deliveryAddress.complement].filter(Boolean).join(", ") : "Retirada no local";
            const statusLabels: Record<string, string> = { recebido: "Recebido", preparando: "Preparando", itens_separados: "Itens separados", esperando_motoboy: "Esperando motoboy", saiu_para_entrega: "Saiu para entrega", entregue: "Entregue", cancelado: "Cancelado" };
            return <article key={order.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-orange-400">Pedido #{order.order_number}</p><h3 className="mt-1 text-lg font-semibold">{payload.customerName || "Cliente"}</h3><p className="text-xs text-stone-500">{new Date(order.created_at).toLocaleString("pt-BR")}</p></div><strong className="text-lg text-orange-300">{(order.total_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></div>
              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><p><span className="text-stone-500">Telefone:</span> {payload.customerPhone || "Não informado"}</p><p><span className="text-stone-500">Pagamento:</span> {payload.paymentMethod === "pix" ? "Pix manual" : payload.paymentMethod === "cash" ? "Dinheiro" : "Cartão na entrega"}</p><p className="sm:col-span-2"><span className="text-stone-500">Endereço:</span> {address}</p></div>
              <div className="mt-4"><p className="text-sm font-semibold">Itens do pedido</p><ul className="mt-2 space-y-1 text-sm text-stone-300">{(payload.items || []).map((item, index) => <li key={index}>{item.quantity}× {item.name}{item.selectedAddons?.length ? " · " + item.selectedAddons.map((addon) => addon.name).join(", ") : ""}{item.notes ? " · " + item.notes : ""}</li>)}</ul></div>
              {payload.notes && <p className="mt-3 text-sm text-stone-300"><span className="text-stone-500">Observações:</span> {payload.notes}</p>}
              <label className="mt-4 block text-sm text-stone-300">Status do pedido<select value={order.status} onChange={(event) => void updateOrderStatus(order, event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-[#191715] px-3 py-3 text-white sm:max-w-xs">{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            </article>;
          })
        }
      </section></div>}
    <p className="mt-8 text-center text-xs text-stone-600">A área do proprietário não mostra dados de outras lojas. Acesso controlado pela conta autenticada e pelas permissões do banco.</p>
  </div></main>;
}

