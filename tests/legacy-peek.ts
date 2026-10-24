import { test as base, expect } from "@playwright/test";
// Existing hold-control regression journeys explicitly exercise the supported
// hold preference. The default swipe flow has its own private-swipe spec.
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() =>
      localStorage.setItem("hudl-welcome-v1", "true"),
    );
    await page.goto("/");
    await page.getByRole("button", {name:"Settings",exact:true}).click();
    await page.getByRole("checkbox", {name:"Swipe to reveal",exact:false}).uncheck();
    await use(page);
  },
});
export { expect };
