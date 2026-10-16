"use client";

import { useCallback, useEffect, useState, type PropsWithChildren } from "react";
import { usePathname } from "next/navigation";
import { BellRing, CheckCircle2, Clock3, Flame, Megaphone, RefreshCw, Wrench, X } from "lucide-react";

type AppExperienceProps = { buildVersion: string };
const STORE_ID = "6fab38d7-aa0b-4b27-9c93-1beac81fec39";
type SiteStatus = { available: boolean; message: string; returnAt: string };

export default function AppExperience({ children, buildVersion }: PropsWithChildren<AppExperienceProps>) {
  const pathname = usePathname();
  const isOwnerPortal = pathname.startsWith("/proprietario");
  const [pageLoading, setPageLoading] = useState(true);
  const [siteStatus, setSiteStatus] = useState<SiteStatus | null>(null);
  const [siteStatusChecked, setSiteStatusChecked] = useState(false);
  const [updateVersion, setUpdateVersion] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateError, setUpdateError] = useState("");

  const checkVersion = useCallback(async () => {
    try {
      const response = await fetch("/api/version", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { version?: string };
      if (data.version && buildVersion && buildVersion !== "local" && data.version !== buildVersion) {
        setUpdateVersion(data.version);
      }
    } catch {
      // A temporary network issue should never interrupt the current version.
    }
  }, [buildVersion]);

  useEffect(() => {
    let cancelled = false;
    const checkStoreStatus = async () => {
      try {
        const response = await fetch("https://mabkzkawziqlmgfikwmh.supabase.co/functions/v1/novaesweb-site-status", {
          method: "POST",
          headers: { "Content-Type": "application/json", "apikey": "sb_publishable_j6QPu4fgCRZHhOnUPEdyvA_ixP9ibtr" },
          body: JSON.stringify({ store_id: STORE_ID, nx_id: "NX-FOGONABRASA-01" }),
          cache: "no-store"
        });
        if (!response.ok) throw new Error("Status indisponível");
        const data = await response.json();
        if (!cancelled) setSiteStatus({
          available: data.available === true,
          message: typeof data.message === "string" ? data.message : "",
          returnAt: typeof data.returnAt === "string" ? data.returnAt : typeof data.estimatedReturnAt === "string" ? data.estimatedReturnAt : typeof data.return_at === "string" ? data.return_at : "",
        });
      } catch {
        // Uma falha temporária de rede é repetida no próximo ciclo.
      } finally {
        if (!cancelled) setSiteStatusChecked(true);
      }
    };
    void checkStoreStatus();
    const poll = window.setInterval(() => void checkStoreStatus(), 30_000);
    const onFocus = () => void checkStoreStatus();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    setPageLoading(true);
    const timer = window.setTimeout(() => setPageLoading(false), 950);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    void checkVersion();
    const poll = window.setInterval(() => void checkVersion(), 60_000);
    const onFocus = () => void checkVersion();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(poll);
      window.removeEventListener("focus", onFocus);
    };
  }, [checkVersion]);

  async function applyUpdate() {
    if (updateLoading) return;
    setUpdateLoading(true);
    setUpdateProgress(8);
    setUpdateError("");
    try {
      const response = await fetch("/api/version", { cache: "no-store" });
      if (!response.ok) throw new Error("Não foi possível confirmar a nova versão.");
      await response.json();
      // Progress tracks the confirmation and preparation stages before reloading.
      for (let progress = 16; progress <= 100; progress += 6) {
        setUpdateProgress(Math.min(progress, 100));
        await new Promise((resolve) => window.setTimeout(resolve, 95));
      }
      window.location.reload();
    } catch {
      setUpdateLoading(false);
      setUpdateProgress(0);
      setUpdateError("Não conseguimos confirmar a atualização. Verifique sua conexão e tente novamente.");
    }
  }

  return (
    <>
      {!isOwnerPortal && siteStatusChecked && siteStatus && !siteStatus.available ? (
        <main className="store-blocked-screen">
          <div className="store-blocked-glow store-blocked-glow-blue" /><div className="store-blocked-glow store-blocked-glow-pink" />
          <section className="store-blocked-shell" aria-labelledby="store-blocked-title">
            <header className="store-blocked-brand"><span className="store-blocked-logo">N<span>N</span></span><strong>Novaes<span>Web</span></strong></header>
            <div className="store-blocked-card">
              <div className="store-blocked-status"><Wrench size={15} /> EM MANUTENÇÃO</div>
              <h1 id="store-blocked-title">Voltamos em breve</h1>
              <p className="store-blocked-subtitle">Esta loja está temporariamente indisponível.</p>
              <div className="store-blocked-message"><Megaphone size={28} /><div><strong>COMUNICADO DA LOJA</strong><p>{siteStatus.message || "Estamos fazendo alguns ajustes para atender você melhor. Tente novamente mais tarde."}</p></div></div>
              {siteStatus.returnAt && <div className="store-blocked-return"><Clock3 size={29} /><div><strong>Previsão de retorno</strong><span>{new Date(siteStatus.returnAt).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" })}</span></div></div>}
            </div>
            <footer className="store-blocked-footer"><i /> NovaesWeb Connect · Acesso seguro <i /></footer>
          </section>
        </main>
      ) : !isOwnerPortal && !siteStatusChecked ? (
        <div className="min-h-screen bg-[#171514] text-white flex items-center justify-center" role="status">Verificando disponibilidade da loja...</div>
      ) : children}

      {pageLoading && (isOwnerPortal || (siteStatusChecked && (!siteStatus || siteStatus.available))) && (
        <div className="app-loading-screen" role="status" aria-live="polite">
          <div className="app-loading-content">
            <span className="app-loading-logo"><Flame size={32} strokeWidth={2.2} /></span>
            <strong>FOGO <span>NA BRASA</span></strong>
            <p>Preparando sua experiência...</p>
            <div className="app-loading-track"><span /></div>
            <small>Carregando página</small>
          </div>
        </div>
      )}

      {updateVersion && !updateLoading && (
        <aside className="app-update-banner" role="status" aria-live="polite">
          <span className="app-update-icon"><BellRing size={21} /></span>
          <div className="app-update-copy">
            <strong>⚠️ Nova atualização disponível</strong>
            <span>Há uma nova versão pronta. Você pode continuar usando esta versão até decidir atualizar.</span>
            {updateError && <small className="app-update-error">{updateError}</small>}
          </div>
          <button type="button" className="app-update-button" onClick={() => void applyUpdate()}>
            <RefreshCw size={16} /> Atualizar
          </button>
          <button type="button" className="app-update-dismiss" aria-label="Dispensar aviso" onClick={() => setUpdateVersion("")}>
            <X size={17} />
          </button>
        </aside>
      )}

      {updateLoading && (
        <div className="app-update-overlay" role="status" aria-live="polite">
          <div className="app-update-progress-card">
            <span className="app-loading-logo"><RefreshCw size={27} className="app-update-spin" /></span>
            <strong>Atualizando o sistema</strong>
            <p>Preparando a nova versão. Não feche esta página.</p>
            <div className="app-update-progress-track"><span style={{ width: `${updateProgress}%` }} /></div>
            <div className="app-update-progress-label"><span>Preparando a nova versão</span><b>{updateProgress}%</b></div>
            <small><CheckCircle2 size={14} /> A página será recarregada automaticamente</small>
          </div>
        </div>
      )}
    </>
  );
}

