import { createCollectionModel } from "../db/documentModel.js";

export const Order = createCollectionModel("orders", {
  defaults: () => ({
    items: [],
    mrpTotal: 0,
    productDiscount: 0,
    shipping: 0,
    paymentFee: 0,
    discount: 0,
    totalDiscount: 0,
    tax: 0,
    shippingMethod: "standard",
    paymentMethod: "cod",
    paymentApp: "",
    paymentProvider: "manual",
    paymentReference: "",
    paymentStatus: "pending",
    trackingId: "",
    courierPartner: "",
    adminNotes: "",
    status: "placed"
  })
});
