import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("main app surfaces and validation text remain readable in both themes", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("hudl-welcome-v1", "true"),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  for (const dark of [false, true]) {
    const toggle = page.getByRole("button", {
      name: dark ? "Switch to dark mode" : "Switch to light mode",
      exact: true,
    });
    if (await toggle.count()) await toggle.click();
    for (const name of ["Games", "Crew", "Packs", "Scores"]) {
      const nav = page.getByRole("button", { name, exact: true });
      if (await nav.count()) await nav.last().click();
      await page.waitForTimeout(250);
      const report = await new AxeBuilder({ page })
        .withRules(["color-contrast"])
        .analyze();
      expect(report.violations, `${name} dark=${dark}`).toEqual([]);
    }
    await page.evaluate(() => {
      const p = document.createElement("p");
      p.className = "error";
      p.textContent = "Choose a group for everyone before starting.";
      p.id = "contrast-probe";
      document.querySelector("main")!.append(p);
    });
    const report = await new AxeBuilder({ page })
      .withRules(["color-contrast"])
      .analyze();
    expect(report.violations).toEqual([]);
    await page.locator("#contrast-probe").evaluate((el) => el.remove());
  }
});
