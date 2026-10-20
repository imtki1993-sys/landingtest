import { describe, it, expect } from "vitest";
import { orderStage } from "../lib/order-stage";

describe("colonne kanban d'une commande", () => {
  it("une commande confirmée puis expédiée n'est plus dans « Confirmé »", () => {
    expect(orderStage({ lead: { status: "CONFIRMED" }, shipment_status: "IN_TRANSIT" })).toBe("SHIPPED");
    expect(orderStage({ lead: { status: "CONFIRMED" }, shipment_status: "DELIVERED" })).toBe("DELIVERED");
    expect(orderStage({ lead: { status: "CONFIRMED" }, shipment_status: "PENDING" })).toBe("CONFIRMED");
  });
  it("retours et annulations", () => {
    expect(orderStage({ lead: { status: "CONFIRMED" }, shipment_status: "RETURNED" })).toBe("RETURNED");
    expect(orderStage({ lead: { status: "CANCELLED" } })).toBe("RETURNED");
  });
  it("appels", () => {
    expect(orderStage({ lead: { status: "NO_ANSWER" } })).toBe("NEW");
    expect(orderStage({ lead: { status: "CONTACTED" } })).toBe("CONTACTED");
    expect(orderStage({})).toBe("NEW");
  });
  it("chaque commande tombe dans exactement une colonne", () => {
    const leads = [
      "NEW",
      "CONTACTED",
      "NO_ANSWER",
      "CALL_BACK",
      "CONFIRMED",
      "SHIPPED",
      "DELIVERED",
      "RETURNED",
      "CANCELLED",
    ];
    const ships = [
      "",
      "PENDING",
      "PICKED_UP",
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "RETURNING",
      "RETURNED",
      "FAILED",
      "CANCELLED",
    ];
    for (const l of leads)
      for (const s of ships) expect(typeof orderStage({ lead: { status: l }, shipment_status: s })).toBe("string");
  });
});
