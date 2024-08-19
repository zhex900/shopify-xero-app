import { createRemixStub } from "@remix-run/testing";
import { render, screen, user } from "@testing-library/polaris";
import { waitFor } from "@testing-library/react";
import { expect, test } from "vitest";

import IndexPage from "~/routes/app._index";
const mockConfig = {
  tags: ["Local pick up", "pay by invoice", "some other tag"],
  localities: [
    "Newcastle",
    "Sydney - Ryde",
    "Sydney - Randwick",
    "Sydney - Hills",
    "Sydney - Bayside",
    "Sydney - City",
    "Sydney - Blacktown",
    "Sydney - Penrith",
    "Sydney - Gosford",
    "Gold Coast",
  ],
  configuration: {
    deliveryCustomizationId: "gid://shopify/DeliveryCustomization/11",
    payByInvoiceShippingMethod: "Free direct delivery",
    payByInvoiceTag: "pay by invoice",
    pickupLocations: [
      "Sydney - Randwick",
      "Sydney - Bayside",
      "Sydney - Ryde",
      "Sydney - Hills",
      "Sydney - City",
      "Sydney - Blacktown",
      "Sydney - Penrith",
      "Sydney - Gosford",
    ],
    pickUpShippingMethod: "Local pick up",
  },
  deliveryCustomizationId: "gid://shopify/DeliveryCustomization/11",
  deliveryMethods: [
    "Free shipping",
    "Standard",
    "Local pick up",
    "Free direct delivery",
  ],
};

test("display tag, delivery options and localities from configuration", async () => {
  const App = createRemixStub([
    {
      path: "/",
      Component: IndexPage,
      loader: () => mockConfig,
    },
  ]);
  render(<App initialEntries={["/"]} />);
  await waitFor(() => screen.findByText("Pick up configuration"));

  expect(
    screen.getByPlaceholderText("Select a pick up shipping method"),
  ).toHaveValue(mockConfig.configuration.pickUpShippingMethod);

  expect(
    screen.getByPlaceholderText(
      "Select a shipping method for pay by invoice customers",
    ),
  ).toHaveValue(mockConfig.configuration.payByInvoiceShippingMethod);

  expect(
    screen.getByPlaceholderText(
      "Select a shipping method for pay by invoice customers",
    ),
  ).toHaveValue(mockConfig.configuration.payByInvoiceShippingMethod);

  expect(screen.getByPlaceholderText("Select a customer tag")).toHaveValue(
    mockConfig.configuration.payByInvoiceTag,
  );

  mockConfig.configuration.pickupLocations.forEach((location) => {
    expect(screen.getByText(location)).toBeVisible();
  });

  // no changes, save button should be disabled
  expect(screen.getByRole("button", { name: /Save/i })).toHaveAttribute(
    "aria-disabled",
    "true",
  );

  expect(screen.getByRole("button", { name: /Cancel/i })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
});

test("save changes", async () => {
  let actionRequest = undefined as Request | undefined;
  const App = createRemixStub([
    {
      path: "/",
      Component: IndexPage,
      loader: () => mockConfig,
      action: ({ request }) => {
        actionRequest = request;
        return {
          status: 200,
        };
      },
    },
  ]);
  render(<App initialEntries={["/"]} />);
  await waitFor(() => screen.findByText("Pick up configuration"));

  await user.click(screen.getByPlaceholderText("Select a customer tag"));
  mockConfig.tags.forEach((tag) => {
    expect(screen.getByText(tag)).toBeVisible();
  });

  await user.click(screen.getByPlaceholderText("Select a customer tag"));
  await user.click(
    screen.getByText(mockConfig.tags[mockConfig.tags.length - 1]),
  );

  await user.click(
    screen.getByPlaceholderText("Select a pick up shipping method"),
  );
  mockConfig.deliveryMethods.forEach((deliveryMethod) => {
    expect(screen.getByText(deliveryMethod)).toBeVisible();
  });
  await user.click(
    screen.getByPlaceholderText("Select a pick up shipping method"),
  );

  await user.click(screen.getByText(mockConfig.deliveryMethods[1]));
  await user.click(
    screen.getByPlaceholderText(
      "Select a shipping method for pay by invoice customers",
    ),
  );
  await user.click(screen.getByText(mockConfig.deliveryMethods[2]));
  await user.click(
    screen.getByRole("button", { name: /Remove Sydney - Randwick/i }),
  );
  await user.click(
    screen.getByRole("button", { name: /Remove Sydney - Bayside/i }),
  );
  await user.click(
    screen.getByRole("button", { name: /Remove Sydney - Ryde/i }),
  );
  await user.click(
    screen.getByRole("button", { name: /Remove Sydney - Hills/i }),
  );
  await user.click(
    screen.getByRole("button", { name: /Remove Sydney - City/i }),
  );
  await user.click(
    screen.getByRole("button", { name: /Remove Sydney - Gosford/i }),
  );
  await user.click(
    screen.getByRole("button", { name: /Remove Sydney - Blacktown/i }),
  );

  await user.click(
    screen.getByPlaceholderText("Select location that allow pick up"),
  );

  await user.click(screen.getByText("Newcastle"));

  await user.click(screen.getByRole("button", { name: /Save/i }));
  expect(actionRequest).toBeDefined();

  // save should send POST request with the selected tag and payment method
  expect(actionRequest?.method).toBe("POST");
  const formData = await actionRequest?.formData();
  expect(formData).toBeDefined();

  if (!formData) {
    throw new Error("formData is undefined");
  }

  expect(Object.fromEntries(formData)).toMatchObject({
    deliveryCustomizationId: "gid://shopify/DeliveryCustomization/11",
    payByInvoiceShippingMethod: mockConfig.deliveryMethods[2],
    payByInvoiceTag: mockConfig.tags[mockConfig.tags.length - 1],
    pickupLocations: '["Sydney - Penrith","Newcastle"]',
    pickUpShippingMethod: mockConfig.deliveryMethods[1],
  });
});
