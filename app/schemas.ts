import { z } from "zod";

export const ShippingConfigurationSchema = z.object({
  pickUpShippingMethod: z.string(),
  payByInvoiceShippingMethod: z.string(),
  pickupLocations: z.string().array(),
  payByInvoiceTag: z.string(),
});

export type ShippingConfigurationType = z.infer<
  typeof ShippingConfigurationSchema
>;
