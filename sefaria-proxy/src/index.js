const ALLOWED_ORIGINS = [
  "https://akohlgould.github.io",
  "http://localhost:5173",
  "http://localhost:4173",
];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
  };
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get("Origin") || "";
    const headers = corsHeaders(origin);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    const url = new URL(request.url);
    const targetPath = url.pathname + url.search;

    // Only proxy /api/ paths
    if (!targetPath.startsWith("/api/")) {
      return new Response("Not found", { status: 404, headers });
    }

    const sefariaUrl = "https://www.sefaria.org" + targetPath;

    const sefariaResponse = await fetch(sefariaUrl, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: request.method === "POST" ? request.body : undefined,
    });

    const responseBody = await sefariaResponse.text();

    return new Response(responseBody, {
      status: sefariaResponse.status,
      headers: {
        ...headers,
        "Content-Type": sefariaResponse.headers.get("Content-Type") || "application/json",
      },
    });
  },
};
