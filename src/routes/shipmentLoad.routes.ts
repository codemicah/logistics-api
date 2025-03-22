import { Router } from "express";
import { ShipmentLoadController } from "../controllers/shipmentLoad.controller";
import { auth } from "../auth/auth";
import { roleMiddleware } from "../middlewares/roleMiddleware";

const router = Router({ mergeParams: true });
const shipmentLoadController = new ShipmentLoadController();

// Get all loads for a shipment
router.get("/", auth, shipmentLoadController.getShipmentLoads);

// Get a specific load
router.get("/:loadId", auth, shipmentLoadController.getShipmentLoadById);

// Create a new load
router.post(
  "/",
  auth,
  roleMiddleware(["shipper", "forwarder", "admin"]),
  shipmentLoadController.createShipmentLoad
);

// Update a load
router.put(
  "/:loadId",
  auth,
  roleMiddleware(["shipper", "forwarder", "admin"]),
  shipmentLoadController.updateShipmentLoad
);

// Delete a load
router.delete(
  "/:loadId",
  auth,
  roleMiddleware(["shipper", "forwarder", "admin"]),
  shipmentLoadController.deleteShipmentLoad
);

export default router;
