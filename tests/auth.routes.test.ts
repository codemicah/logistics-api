import supertest from "supertest";
import app from "../src/app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

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

describe("Auth Routes", () => {
  const testUser = {
    email: "test@example.com",
    password: "Password123!",
    role: "shipper",
    profile: {
      name: "Test User",
      company: "Test Company",
      contactNumber: "1234567890",
    },
  };

  let authToken: string;

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const response = await request
        .post("/api/auth/register")
        .send(testUser)
        .expect(201);

      expect(response.body.data).toHaveProperty("token");
      expect(response.body.data).toHaveProperty("email");
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data.role).toBe(testUser.role);
    });

    it("should return 409 if email already exists", async () => {
      const response = await request
        .post("/api/auth/register")
        .send(testUser)
        .expect(409);

      expect(response.body).toHaveProperty("message");
    });

    it("should return 400 if required fields are missing", async () => {
      const response = await request
        .post("/api/auth/register")
        .send({ email: "incomplete@example.com" })
        .expect(400);

      expect(response.body).toHaveProperty("message");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login successfully with correct credentials", async () => {
      const response = await request
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body.data).toHaveProperty("token");
      expect(response.body.data).toHaveProperty("email");
      expect(response.body.data.email).toBe(testUser.email);

      // Save token for later tests
      authToken = response.body.data.token;
    });

    it("should return 401 with incorrect password", async () => {
      const response = await request
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: "wrongpassword",
        })
        .expect(401);

      expect(response.body).toHaveProperty("message");
    });

    it("should return 401 with non-existent email", async () => {
      const response = await request
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "Password123!",
        })
        .expect(401);

      expect(response.body).toHaveProperty("message");
    });
  });
});
