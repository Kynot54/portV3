import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { installMatchMedia, resetMatchMedia } from "./tests/support/match-media";

installMatchMedia();

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.className = "";
  document.documentElement.removeAttribute("style");
  resetMatchMedia();
});
