import { isFakeSend, missingServerEnv } from "./config";
import { buildEmail } from "./email";
import type { sendEmail } from "./resend";
import type { verifyTurnstile } from "./turnstile";
import { validateContact } from "./validate";

const MAX_BODY = 20_000;

type Deps = {
  env: Record<string, string | undefined>;
  verify: typeof verifyTurnstile;
  send: typeof sendEmail;
  log?: (msg: string) => void;
};

// Responses never echo input or settings: only ok, and field errors.
const reply = (status: number, body: object) => Response.json(body, { status });

/** POST /api/contact: validate → (fake send) → config → Turnstile → Resend. */
export async function handleContact(
  request: Request,
  deps: Deps,
): Promise<Response> {
  const { env, verify, send, log = console.error } = deps;

  // JSON only: a cross-site <form> can't send application/json.
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return reply(415, { ok: false });
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY)
    return reply(400, { ok: false, errors: {} });
  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) return reply(400, { ok: false, errors: {} });
    body = JSON.parse(text);
  } catch {
    return reply(400, { ok: false, errors: {} });
  }

  const result = validateContact(body);
  if (!result.ok) return reply(400, { ok: false, errors: result.errors });

  if (isFakeSend(env)) return reply(200, { ok: true });

  const missing = missingServerEnv(env);
  if (missing.length) {
    log(`contact: missing env ${missing.join(", ")}`);
    return reply(500, { ok: false });
  }

  const token = (body as { token?: unknown }).token;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  if (
    !(await verify(
      typeof token === "string" ? token : "",
      env.TURNSTILE_SECRET_KEY!,
      ip,
    ))
  )
    return reply(403, { ok: false });

  const sent = await send(
    buildEmail(result.data, env.CONTACT_TO_EMAIL!),
    env.RESEND_API_KEY!,
  );
  if (!sent.ok) {
    log("contact: resend failed");
    return reply(500, { ok: false });
  }
  return reply(200, { ok: true });
}
