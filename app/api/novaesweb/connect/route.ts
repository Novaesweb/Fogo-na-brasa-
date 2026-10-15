import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_ACTIONS = new Set([
  "request_site_registration",
  "get_site_registration_status",
  "site_checkin",
]);

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization") ?? "";
  if (!/^Bearer\s+\S+$/i.test(authorization)) {
    return jsonError("Entre na sua conta para continuar.", 401);
  }

  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const publishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !publishableKey) {
    return jsonError("Integração NovaesWeb ainda não configurada no servidor.", 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Envie um corpo JSON válido.", 400);
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("action" in body) ||
    typeof body.action !== "string" ||
    !ALLOWED_ACTIONS.has(body.action)
  ) {
    return jsonError("Ação de integração inválida.", 400);
  }

  const { action, ...payload } = body as Record<string, unknown>;
  const upstream = await fetch(
    `${supabaseUrl}/functions/v1/novaesweb-admin`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        apikey: publishableKey,
        authorization,
      },
      body: JSON.stringify({ action, ...payload }),
      cache: "no-store",
    },
  );

  const responseText = await upstream.text();
  let responseBody: unknown;
  try {
    responseBody = responseText ? JSON.parse(responseText) : {};
  } catch {
    responseBody = { error: "Resposta inválida do serviço NovaesWeb." };
  }

  return NextResponse.json(responseBody, {
    status: upstream.status,
    headers: { "cache-control": "no-store" },
  });
}
