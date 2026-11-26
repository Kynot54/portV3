import { handleContact } from "@/lib/contact/handler";
import { sendEmail } from "@/lib/contact/resend";
import { verifyTurnstile } from "@/lib/contact/turnstile";

export async function POST(request: Request) {
  return handleContact(request, {
    env: process.env,
    verify: verifyTurnstile,
    send: sendEmail,
  });
}
