import { Router } from "express";
import { LoadItemController } from "../controllers/loadItem.controller";
import { auth } from "../auth/auth";
import { roleMiddleware } from "../middlewares/roleMiddleware";

const router = Router({ mergeParams: true });
const loadItemController = new LoadItemController();

// Get all items for a load
router.get("/", auth, loadItemController.getLoadItems);

// Get a specific item
router.get("/:itemId", auth, loadItemController.getLoadItemById);

// Create a new item
router.post(
  "/",
  auth,
  roleMiddleware(["shipper", "forwarder", "admin"]),
  loadItemController.createLoadItem
);

// Update an item
router.put(
  "/:itemId",
  auth,
  roleMiddleware(["shipper", "forwarder", "admin"]),
  loadItemController.updateLoadItem
);

// Delete an item
router.delete(
  "/:itemId",
  auth,
  roleMiddleware(["shipper", "forwarder", "admin"]),
  loadItemController.deleteLoadItem
);

export default router;
