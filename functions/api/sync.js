const SYNC_ROW = "main";

export async function onRequestPost(context) {
  const { PIN_SECRET, SUPABASE_URL, SUPABASE_SERVICE_KEY } = context.env;

  let body;
  try { body = await context.request.json(); }
  catch { return resp({ error: "invalid body" }, 400); }

  const { action, pin, payload } = body;

  if (!pin || pin !== PIN_SECRET) {
    return resp({ error: "unauthorized" }, 401);
  }

  if (action === "validate") {
    return resp({ ok: true });
  }

  if (action === "pull") {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/finanzas_data?id=eq.${SYNC_ROW}&select=payload,updated_at`,
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
      body: JSON.stringify({ id: SYNC_ROW, payload, updated_at: new Date().toISOString() })
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
