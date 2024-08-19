import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const checkout = async (page: Page) => {
  await page.goto("/products/test-shirt");

  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.waitForRequest("**/cart?section_id=cart-drawer");
  await page.goto("/cart");
  await page.getByRole("button", { name: "Check out" }).click();
  await page.waitForURL("**/checkouts/**");
};

test.describe("b2b customer with pay by invoice tag", () => {
  test.use({ storageState: "tests/e2e/.auth/b2b.json" });
  test("Free direct delivery should be available", async ({ page }) => {
    await checkout(page);
    await page.getByText("Free direct delivery").waitFor({ state: "visible" });

    await page.getByRole("button", { name: "Shipping method" }).click();
    const shippingMethods = (
      await page.locator("#shippingMethod-collapsible-control").innerText()
    ).replace(/[\W_]+/g, "-");

    expect(shippingMethods).toMatch(
      /^Choose-a-shipping-method-Free-direct-delivery-Free-Standard-\d-to-\d-business-days-\d+-\d+$/,
    );
  });
});

test.describe("retail customer without pay by invoice tag, with pick up enabled locality", () => {
  test.use({ storageState: "tests/e2e/.auth/retail.json" });
  test("Standard shipping and pick up options", async ({ page }) => {
    await checkout(page);

    await page.getByText("Pick up from").waitFor({ state: "visible" });

    await page.getByRole("button", { name: "Shipping method" }).click();
    const shippingMethods = (
      await page.locator("#shippingMethod-collapsible-control").innerText()
    ).replace(/[\W_]+/g, "-");

    expect(shippingMethods).toMatch(
      /^Choose-a-shipping-method-Pick-up-from-Sydney-Ryde-Free-Standard-\d-to-\d-business-days-\d+-\d+$/,
    );
  });
});

test.describe("Guest customer", () => {
  test("Only standard shipping option", async ({ page }) => {
    await checkout(page);

    await page.getByLabel("First name").fill("John");
    await page.getByLabel("Last name").fill("Smith");
    await page.getByPlaceholder("Address").fill("32 Martin");
    await page.getByText("32 Martin Place, Sydney").click();

    await page
      .getByText(
        "Enter your shipping address to view available shipping methods",
      )
      .waitFor({ state: "detached" });

    await page
      .getByText("Standard", { exact: true })
      .waitFor({ state: "visible" });

    const shippingMethods = await page.locator("#shipping_methods").innerText();

    expect(shippingMethods).toMatch(
      /Choose a shipping method\s*Standard\s*.*business days\s*\$\d+\.\d+$/,
    );
  });
});
