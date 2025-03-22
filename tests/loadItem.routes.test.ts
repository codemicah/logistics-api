import supertest from "supertest";
import app from "../src/app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Shipment from "../src/models/shipment";
import ShipmentLoad from "../src/models/shipmentLoad";

const request = supertest(app);
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Setup in-memory MongoDB server for testing
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("LoadItem Routes", () => {
  const testUser = {
    email: "loaditem-test@example.com",
    password: "Password123!",
    role: "shipper",
    profile: {
      name: "LoadItem Test User",
      company: "Test Shipping Co",
      contactNumber: "1234567890",
    },
  };

  let token: string;
  let userId: string;
  let shipmentId: string;
  let loadId: string;
  let loadItemId: string;

  // Setup test user, create shipment and load before running tests
  beforeAll(async () => {
    // Register user
    const userResponse = await request
      .post("/api/auth/register")
      .send(testUser);
    token = userResponse.body.data.token;
    userId = userResponse.body.data.id;

    // Create shipment directly in the database
    const shipment = new Shipment({
      shipperId: userId,
      shipmentNumber: `SHP-${Date.now().toString().slice(-6)}`,
      origin: "Singapore",
      destination: "Bangkok, Thailand",
      estimatedDeparture: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      estimatedArrival: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: "draft",
    });

    const savedShipment = await shipment.save();
    shipmentId = (savedShipment._id as any).toString();

    // Create load directly in the database
    const load = new ShipmentLoad({
      shipmentId,
      loadNumber: `${savedShipment.shipmentNumber}-L01`,
      reference: `LOAD-${Date.now().toString().slice(-6)}`,
      description: "Test Load",
      transportMode: "FCL",
      pickupAddress: "Singapore Port",
      deliveryAddress: "Bangkok Port, Thailand",
      status: "pending",
    });

    const savedLoad = await load.save();
    loadId = (savedLoad._id as any).toString();
  });

  // Test load item creation
  describe("POST /api/shipments/:shipmentId/loads/:loadId/items", () => {
    it("should create a new load item when authenticated", async () => {
      const loadItemData = {
        description: "Container load item",
        type: "FCL",
        dangerousGoods: false,
        specialInstructions: "Handle with care",
        details: {
          containerSize: "40ft",
          containerType: "Standard",
        },
      };

      const response = await request
        .post(`/api/shipments/${shipmentId}/loads/${loadId}/items`)
        .set("Authorization", `Bearer ${token}`)
        .send(loadItemData)
        .expect(201);

      expect(response.body.data).toHaveProperty("_id");
      expect(response.body.data.description).toBe(loadItemData.description);
      expect(response.body.data.type).toBe(loadItemData.type);

      // Save load item ID for later tests
      loadItemId = response.body.data._id;
    });

    it("should return 401 when not authenticated", async () => {
      const loadItemData = {
        description: "Unauthorized item",
        type: "LCL",
        details: {
          weight: 1000,
          cbm: 10,
        },
      };

      await request
        .post(`/api/shipments/${shipmentId}/loads/${loadId}/items`)
        .send(loadItemData)
        .expect(401);
    });

    it("should return 400 with invalid data", async () => {
      const invalidData = {
        description: "Invalid load item",
        // Missing required type field
        dangerousGoods: false,
      };

      await request
        .post(`/api/shipments/${shipmentId}/loads/${loadId}/items`)
        .set("Authorization", `Bearer ${token}`)
        .send(invalidData)
        .expect(400);
    });

    it("should return 400 with missing details", async () => {
      const invalidData = {
        description: "Invalid load item",
        type: "FCL",
        dangerousGoods: false,
        // Missing required details
      };

      await request
        .post(`/api/shipments/${shipmentId}/loads/${loadId}/items`)
        .set("Authorization", `Bearer ${token}`)
        .send(invalidData)
        .expect(400);
    });
  });

  // Test getting all load items
  describe("GET /api/shipments/:shipmentId/loads/:loadId/items", () => {
    it("should get all load items when authenticated", async () => {
      const response = await request
        .get(`/api/shipments/${shipmentId}/loads/${loadId}/items`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBeTruthy();
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it("should return 401 when not authenticated", async () => {
      await request
        .get(`/api/shipments/${shipmentId}/loads/${loadId}/items`)
        .expect(401);
    });
  });

  // Test getting a specific load item
  describe("GET /api/shipments/:shipmentId/loads/:loadId/items/:itemId", () => {
    it("should get a load item by ID when authenticated", async () => {
      const response = await request
        .get(`/api/shipments/${shipmentId}/loads/${loadId}/items/${loadItemId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.data._id).toBe(loadItemId);
      expect(response.body.data).toHaveProperty("type");
      expect(response.body.data).toHaveProperty("description");
    });

    it("should return 404 for non-existent load item", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      await request
        .get(`/api/shipments/${shipmentId}/loads/${loadId}/items/${fakeId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404);
    });
  });

  // Test updating a load item
  describe("PUT /api/shipments/:shipmentId/loads/:loadId/items/:itemId", () => {
    it("should update a load item when authenticated", async () => {
      const updateData = {
        description: "Updated FCL Container",
        specialInstructions: "Updated handling instructions",
      };

      const response = await request
        .put(`/api/shipments/${shipmentId}/loads/${loadId}/items/${loadItemId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data._id).toBe(loadItemId);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.specialInstructions).toBe(
        updateData.specialInstructions
      );
    });

    it("should return 401 when not authenticated", async () => {
      const updateData = {
        description: "Unauthorized update",
      };

      await request
        .put(`/api/shipments/${shipmentId}/loads/${loadId}/items/${loadItemId}`)
        .send(updateData)
        .expect(401);
    });
  });

  // Test deleting a load item
  describe("DELETE /api/shipments/:shipmentId/loads/:loadId/items/:itemId", () => {
    it("should delete a load item when authenticated", async () => {
      // First create a new load item to be deleted
      const newItemData = {
        description: "Item to be deleted",
        type: "LCL",
        dangerousGoods: false,
        details: {
          weight: 500,
          cbm: 5,
        },
      };

      const createResponse = await request
        .post(`/api/shipments/${shipmentId}/loads/${loadId}/items`)
        .set("Authorization", `Bearer ${token}`)
        .send(newItemData);

      const itemToDeleteId = createResponse.body.data._id;

      // Now delete the item
      const response = await request
        .delete(
          `/api/shipments/${shipmentId}/loads/${loadId}/items/${itemToDeleteId}`
        )
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toContain("deleted successfully");
    });

    it("should return 401 when not authenticated", async () => {
      await request
        .delete(
          `/api/shipments/${shipmentId}/loads/${loadId}/items/${loadItemId}`
        )
        .expect(401);
    });
  });
});
