import { Router } from "express";
import { ShipmentController } from "../controllers/shipment.controller";
import { auth } from "../auth/auth";
import { roleMiddleware } from "../middlewares/roleMiddleware";

const router = Router();
const shipmentController = new ShipmentController();

/**
 * @route GET /api/shipments
 * @desc Get all shipments for the authenticated user
 * @access Private
 */
router.get("/", auth, shipmentController.getShipments);

/**
 * @route GET /api/shipments/:id
 * @desc Get a shipment by ID
 * @access Private
 */
router.get("/:id", auth, shipmentController.getShipmentById);

/**
 * @route POST /api/shipments
 * @desc Create a new shipment
 * @access Private - Shipper and Admin only
 */
router.post(
  "/",
  auth,
  roleMiddleware(["shipper", "admin"]),
  shipmentController.createShipment
);

/**
 * @route PUT /api/shipments/:id
 * @desc Update a shipment
 * @access Private
 */
router.put("/:id", auth, shipmentController.updateShipment);

/**
 * @route DELETE /api/shipments/:id
 * @desc Delete a shipment
 * @access Private
 */
router.delete("/:id", auth, shipmentController.deleteShipment);

/**
 * @route PUT /api/shipments/:id/submit
 * @desc Submit a shipment for processing
 * @access Private - Shipper and Admin only
 */
router.put(
  "/:id/submit",
  auth,
  roleMiddleware(["shipper", "admin"]),
  shipmentController.submitShipment
);

/**
 * @route PUT /api/shipments/:id/assign-forwarder
 * @desc Assign a forwarder to a shipment
 * @access Private - Admin only
 */
router.put(
  "/:id/assign-forwarder",
  auth,
  roleMiddleware(["admin"]),
  shipmentController.assignForwarder
);

/**
 * @route PUT /api/shipments/:id/status
 * @desc Update shipment status
 * @access Private
 */
router.put("/:id/status", auth, shipmentController.updateStatus);

export default router;
