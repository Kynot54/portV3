// Test-only, controllable window.matchMedia for jsdom (which has none).
type Listener = (e: MediaQueryListEvent) => void;

const state = {
  prefersDark: false,
  minWidth640: false,
  finePointer: true,
  reducedMotion: false,
};
const listeners = new Map<string, Set<Listener>>();

function evaluate(query: string): boolean {
  const q = query.replace(/\s+/g, "");
  if (q === "(prefers-color-scheme:dark)") return state.prefersDark;
  if (q === "(prefers-color-scheme:light)") return !state.prefersDark;
  if (q === "(min-width:640px)") return state.minWidth640;
  if (q === "(hover:hover)and(pointer:fine)") return state.finePointer;
  if (q === "(prefers-reduced-motion:reduce)") return state.reducedMotion;
  return false;
}

function notify(...queries: string[]) {
  for (const query of queries) {
    for (const fn of listeners.get(query) ?? []) {
      fn({ matches: evaluate(query), media: query } as MediaQueryListEvent);
    }
  }
}

export function installMatchMedia(): void {
  window.matchMedia = (query: string): MediaQueryList => {
    const key = query.replace(/\s+/g, "");
    const set = listeners.get(key) ?? new Set<Listener>();
    listeners.set(key, set);
    return {
      get matches() {
        return evaluate(key);
      },
      media: query,
      onchange: null,
      addEventListener: (_: string, fn: Listener) => set.add(fn),
      removeEventListener: (_: string, fn: Listener) => set.delete(fn),
      addListener: (fn: Listener) => set.add(fn),
      removeListener: (fn: Listener) => set.delete(fn),
      dispatchEvent: () => true,
    } as unknown as MediaQueryList;
  };
}

export function resetMatchMedia(): void {
  state.prefersDark = false;
  state.minWidth640 = false;
  state.finePointer = true;
  state.reducedMotion = false;
  listeners.clear();
}

export function setPrefersDark(dark: boolean): void {
  state.prefersDark = dark;
  notify("(prefers-color-scheme:dark)", "(prefers-color-scheme:light)");
}

export function setMinWidth640(matches: boolean): void {
  state.minWidth640 = matches;
  notify("(min-width:640px)");
}

/** A mouse or trackpad that can hover (false = touch-only phone or tablet). */
export function setFinePointer(matches: boolean): void {
  state.finePointer = matches;
  notify("(hover:hover)and(pointer:fine)");
}

export function setReducedMotion(matches: boolean): void {
  state.reducedMotion = matches;
  notify("(prefers-reduced-motion:reduce)");
}
