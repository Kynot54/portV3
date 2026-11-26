import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { setPrefersDark } from "../support/match-media";

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );
}

test("starts on System and resolves from the OS", async () => {
  setPrefersDark(true);
  renderToggle();
  expect(
    await screen.findByRole("button", {
      name: "Theme: System. Switch to light",
    }),
  ).toBeInTheDocument();
  expect(document.documentElement).toHaveClass("dark");
});

test("clicking cycles and applies the class", async () => {
  setPrefersDark(true);
  renderToggle();
  await userEvent.click(
    await screen.findByRole("button", { name: /^Theme: System/ }),
  );
  expect(document.documentElement).toHaveClass("light");
  expect(screen.getByRole("button")).toHaveAccessibleName(
    "Theme: Light. Switch to dark",
  );
});

test("choosing System again follows the OS", async () => {
  setPrefersDark(false);
  renderToggle();
  const btn = await screen.findByRole("button", { name: /^Theme: System/ });
  await userEvent.click(btn); // light
  await userEvent.click(btn); // dark
  await userEvent.click(btn); // system
  expect(btn).toHaveAccessibleName("Theme: System. Switch to light");
  expect(document.documentElement).toHaveClass("light");
  act(() => setPrefersDark(true));
  expect(document.documentElement).toHaveClass("dark");
});
