"use client";

import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { loadScript } from "@/lib/load-script";
import { cn } from "@/lib/utils";
import {
  FIELDS,
  validateContact,
  type ContactErrors,
  type ContactField,
} from "@/lib/contact/validate";

const TURNSTILE_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type Turnstile = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

const SENT =
  "Thanks, your message is on its way. I reply within 2–3 business days.";
const FAILED = "Something went wrong. Try again, or book a call instead.";

const LABELS: Record<ContactField, string> = {
  name: "Name",
  email: "Email",
  company: "Company (optional)",
  role: "Your role (optional)",
  message: "Message",
};
const AUTOCOMPLETE: Record<ContactField, string> = {
  name: "name",
  email: "email",
  company: "organization",
  role: "organization-title",
  message: "off",
};

const field =
  "mt-2 block w-full rounded-md border border-input bg-background px-3 py-2.5 text-base text-foreground aria-[invalid=true]:border-destructive";

/*
 * The message form. Turnstile (managed, invisible unless Cloudflare needs a
 * click) loads on the first focus inside the form, never on page load.
 */
export function ContactForm({ siteKey }: { siteKey: string | undefined }) {
  const empty = Object.fromEntries(FIELDS.map((f) => [f, ""])) as Record<
    ContactField,
    string
  >;
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">(
    "idle",
  );
  const formRef = useRef<HTMLFormElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const token = useRef("");
  const started = useRef(false);
  const sending = useRef(false);

  const startTurnstile = () => {
    if (started.current || !siteKey) return;
    started.current = true;
    loadScript(TURNSTILE_SRC)
      .then(() => {
        if (!window.turnstile || !widgetRef.current) return;
        widgetId.current = window.turnstile.render(widgetRef.current, {
          sitekey: siteKey,
          appearance: "interaction-only",
          size: "flexible",
          callback: (t: string) => (token.current = t),
          "expired-callback": () => (token.current = ""),
          "error-callback": () => (token.current = ""),
        });
      })
      .catch(() => {
        started.current = false;
      });
  };

  const showErrors = (errs: ContactErrors) => {
    setErrors(errs);
    const first = FIELDS.find((f) => errs[f]);
    if (first)
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  };

  const fail = () => {
    setStatus("failed");
    if (widgetId.current) {
      token.current = "";
      window.turnstile?.reset(widgetId.current);
    }
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (sending.current) return;
    const result = validateContact(values);
    if (!result.ok) {
      showErrors(result.errors);
      return;
    }
    setErrors({});
    if (!siteKey) {
      fail();
      return;
    }
    sending.current = true;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...result.data, token: token.current }),
      });
      if (res.ok) {
        setValues(empty);
        setStatus("sent");
      } else if (res.status === 400) {
        const json = (await res.json().catch(() => ({}))) as {
          errors?: ContactErrors;
        };
        if (json.errors && Object.keys(json.errors).length) {
          setStatus("idle");
          showErrors(json.errors);
        } else fail();
      } else fail();
    } catch {
      fail();
    } finally {
      sending.current = false;
    }
  }

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={onSubmit}
      onFocus={startTurnstile}
      className="flex flex-col gap-5"
    >
      {FIELDS.map((f) => {
        const Input = f === "message" ? "textarea" : "input";
        return (
          <div key={f}>
            <label htmlFor={`contact-${f}`} className="text-sm font-medium">
              {LABELS[f]}
            </label>
            <Input
              id={`contact-${f}`}
              name={f}
              type={
                f === "email" ? "email" : f === "message" ? undefined : "text"
              }
              autoComplete={AUTOCOMPLETE[f]}
              rows={f === "message" ? 6 : undefined}
              value={values[f]}
              onChange={(e) =>
                setValues((v) => ({ ...v, [f]: e.target.value }))
              }
              aria-invalid={errors[f] ? true : undefined}
              aria-describedby={errors[f] ? `contact-${f}-error` : undefined}
              className={cn(field, f === "message" && "resize-y")}
            />
            {errors[f] && (
              <p
                id={`contact-${f}-error`}
                className="mt-1.5 text-sm text-destructive"
              >
                {errors[f]}
              </p>
            )}
          </div>
        );
      })}

      <div ref={widgetRef} />

      <div className="flex flex-col items-start gap-3">
        <Button
          type="submit"
          disabled={status === "sending"}
          className="h-11 px-5 text-sm"
        >
          {status === "sending" ? "Sending…" : "Send message"}
        </Button>
        {/* Always present, so screen readers announce the text when it appears. */}
        <p role="status" className="text-sm text-foreground empty:hidden">
          {status === "sent" ? SENT : ""}
        </p>
        {status === "failed" && (
          <p role="alert" className="text-sm text-destructive">
            {FAILED}
          </p>
        )}
      </div>
    </form>
  );
}
