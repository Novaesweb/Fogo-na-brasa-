"use client";

import { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff, Flame, LogIn, LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import { createClient, type Session } from "@supabase/supabase-js";

const supabase = createClient("https://mabkzkawziqlmgfikwmh.supabase.co", "sb_publishable_j6QPu4fgCRZHhOnUPEdyvA_ixP9ibtr", { auth: { persistSession: true, autoRefreshToken: true } });
type Order = { id: string; order_number: number; status: string; total_cents: number; payload: any; created_at: string };
const statusLabels: Record<string, string> = { recebido: "Recebido", preparando: "Preparando", itens_separados: "Itens separados", esperando_motoboy: "Esperando motoboy", saiu_para_entrega: "Saiu para entrega", entregue: "Entregue", cancelado: "Cancelado" };

export default function Proprietario() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => { supabase.auth.getSession().then(({ data }) => { setSession(data.session); setChecking(false); }); const listener = supabase.auth.onAuthStateChange((_event, next) => setSession(next)); return () => listener.data.subscription.unsubscribe(); }, []);
  async function login(event: FormEvent) { event.preventDefault(); setBusy(true); setError(""); const { data, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password }); if (authError) setError("E-mail ou senha inválidos. Confira seus dados e tente novamente."); else setSession(data.session); setBusy(false); }
  async function loadOrders() { if (!session) return; const { data, error: queryError } = await supabase.from("delivery_orders").select("id,order_number,status,total_cents,payload,created_at").order("created_at", { ascending: false }).limit(100); if (!queryError) setOrders((data || []) as Order[]); }
  async function updateStatus(order: Order, status: string) { const { error: updateError } = await supabase.from("delivery_orders").update({ status }).eq("id", order.id); if (!updateError) setOrders((items) => items.map((item) => item.id === order.id ? { ...item, status } : item)); }
  useEffect(() => { if (session) { void loadOrders(); const timer = window.setInterval(() => void loadOrders(), 15000); return () => window.clearInterval(timer); } }, [session]);
  if (checking) return <div className="owner-loading"><Flame size={34}/><span>Carregando painel...</span></div>;
  if (!session) return <main className="owner-login-screen"><div className="owner-login-backdrop"/><section className="owner-login-content"><div className="owner-login-copy"><div className="owner-brand"><span><Flame size={31}/></span><b>FOGO <strong>NA BRASA</strong></b><small>SABOR QUE UNE</small></div><p className="owner-kicker">GESTÃO DA SUA LOJA</p><h1>Painel do<br/><em>proprietário.</em></h1><p className="owner-lead">Acompanhe pedidos, organize a operação e mantenha sua equipe no ritmo certo.</p><div className="owner-points"><span><ShieldCheck/> Acesso protegido</span><span><Flame/> Pedidos em tempo real</span></div></div><form className="owner-login-card" onSubmit={login}><div className="owner-card-icon"><LogIn size={23}/></div><h2>Bem-vindo de volta</h2><p>Entre para acessar o painel da loja.</p>{error && <div className="owner-error" role="alert">{error}</div>}<label>E-mail<input type="email" autoComplete="email" placeholder="voce@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required/></label><label>Senha<div className="owner-password"><input type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Digite sua senha" value={password} onChange={(e) => setPassword(e.target.value)} required/><button type="button" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={19}/> : <Eye size={19}/>}</button></div></label><label className="owner-remember"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}/><span>Lembrar de mim</span></label><button className="owner-submit" disabled={busy}>{busy ? "Entrando..." : "Entrar no painel"}<LogIn size={18}/></button><small className="owner-secure">Sua sessão é protegida pelo Supabase.</small></form></section></main>;
  return <main className="owner-dashboard"><header><div className="owner-brand"><span><Flame size={26}/></span><b>FOGO <strong>NA BRASA</strong></b><small>PAINEL DO PROPRIETÁRIO</small></div><button className="owner-logout" onClick={() => void supabase.auth.signOut()}><LogOut size={16}/> Sair</button></header><section className="owner-dashboard-head"><div><p className="owner-kicker">OPERAÇÃO DA LOJA</p><h1>Pedidos recebidos.</h1><p>Acompanhe e atualize os pedidos em tempo real.</p></div><button className="owner-refresh" onClick={() => void loadOrders()}><RefreshCw size={16}/> Atualizar</button></section><section className="owner-orders">{orders.length === 0 ? <div className="owner-empty"><Flame size={32}/><h2>Nenhum pedido recebido</h2><p>Quando um cliente finalizar um pedido, ele aparecerá aqui.</p></div> : orders.map((order) => { const payload = order.payload || {}; return <article className="owner-order" key={order.id}><div><b>Pedido #{order.order_number}</b><h2>{payload.customerName || "Cliente"}</h2><p>{new Date(order.created_at).toLocaleString("pt-BR")} · {payload.customerPhone || "Sem telefone"}</p></div><div className="owner-order-right"><strong>R$ {(order.total_cents / 100).toFixed(2).replace(".", ",")}</strong><select value={order.status} onChange={(e) => void updateStatus(order, e.target.value)}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div></article>; })}</section></main>;
}

