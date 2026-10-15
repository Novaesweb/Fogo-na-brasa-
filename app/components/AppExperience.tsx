"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BellRing, CheckCircle2, Flame, RefreshCw, X } from "lucide-react";

type AppExperienceProps = { buildVersion: string };

export default function AppExperience({ children, buildVersion }: React.PropsWithChildren<AppExperienceProps>) {
  const pathname = usePathname();
  const [pageLoading, setPageLoading] = useState(true);
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
      {children}

      {pageLoading && (
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
