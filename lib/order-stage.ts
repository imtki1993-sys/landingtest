// Colonne du kanban d'une commande : une seule, la plus avancée.
// Le statut de livraison (transporteur) l'emporte sur le statut d'appel du lead :
// une commande confirmée puis expédiée est « Expédié », plus « Confirmé ».
export type OrderStage = "NEW" | "CONTACTED" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "RETURNED";

const RETURN_SHIPMENT = ["RETURNED", "RETURNING", "CANCELLED", "FAILED"];
const MOVING_SHIPMENT = ["PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"];

export function orderStage(o: {
  shipment_status?: string | null;
  lead?: { status?: string | null } | null;
}): OrderStage {
  const ship = String(o.shipment_status || ""),
    lead = String(o.lead?.status || "NEW");
  if (ship === "DELIVERED") return "DELIVERED";
  if (RETURN_SHIPMENT.includes(ship) || lead === "RETURNED" || lead === "CANCELLED") return "RETURNED";
  if (lead === "DELIVERED") return "DELIVERED";
  if (MOVING_SHIPMENT.includes(ship) || lead === "SHIPPED") return "SHIPPED";
  if (lead === "CONFIRMED") return "CONFIRMED";
  if (lead === "CONTACTED") return "CONTACTED";
  return "NEW";
}
