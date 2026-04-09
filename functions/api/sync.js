const OWNER_ROW = "main";

async function getUserId(pin, env) {
  if (pin === env.PIN_SECRET) return OWNER_ROW;
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/fz_users?code=eq.${encodeURIComponent(pin)}&select=code`,
    { headers: sbHeaders(env.SUPABASE_SERVICE_KEY) }
  );
  const rows = await res.json();
  if (Array.isArray(rows) && rows.length > 0) return rows[0].code;
  return null;
}

export async function onRequestPost(context) {
  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = context.env;

  let body;
  try { body = await context.request.json(); }
  catch { return resp({ error: "invalid body" }, 400); }

  const { action, pin, payload } = body;
  if (!pin) return resp({ error: "unauthorized" }, 401);

  const userId = await getUserId(pin, context.env);
  if (!userId) return resp({ error: "unauthorized" }, 401);

  if (action === "validate") {
    return resp({ ok: true });
  }

  if (action === "pull") {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/finanzas_data?id=eq.${encodeURIComponent(userId)}&select=payload,updated_at`,
      { headers: sbHeaders(SUPABASE_SERVICE_KEY) }
    );
    const rows = await res.json();
    return resp(rows[0] || null);
  }

  if (action === "push") {
    await fetch(`${SUPABASE_URL}/rest/v1/finanzas_data`, {
      method: "POST",
      headers: {
        ...sbHeaders(SUPABASE_SERVICE_KEY),
        "Prefer": "resolution=merge-duplicates,return=minimal"
      },
      body: JSON.stringify({ id: userId, payload, updated_at: new Date().toISOString() })
    });
    return resp({ ok: true });
  }

  return resp({ error: "unknown action" }, 400);
}

function sbHeaders(key) {
  return {
    "apikey": key,
    "Authorization": `Bearer ${key}`,
    "Content-Type": "application/json"
  };
}

function resp(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
