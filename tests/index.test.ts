import supertest from "supertest";
import app from "../src/app";

const request = supertest(app);

describe("Basic API Test", () => {
  it("Should return status 200 for test endpoint", async () => {
    const response = await request.get("/test").expect(200);
    expect(response.body).toEqual({ message: "API is working" });
  });
});
