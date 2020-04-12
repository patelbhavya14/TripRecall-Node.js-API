const app = require("../app");
const request = require("supertest");
let token = "";

describe("Sample Test", () => {
  test("Create a User should return 201", async (done) => {
    let body = {
      username: "Test",
      password: "Test123*",
      email: "test@gmail.com",
    };

    const response = await request(app).post("/v1/user").send(body);
    token = response.body.token;
    expect(response.statusCode).toBe(201);
    done();
  });

  test("Get a User should return 200", async (done) => {
    const response = await request(app)
      .get("/v1/user/self")
      .set("Authorization", token);
    expect(response.statusCode).toBe(200);
    done();
  });

  test("Get a User should return 401 without token", async (done) => {
    const response = await request(app).get("/v1/user/self");
    expect(response.statusCode).toBe(401);
    done();
  });

  test("Create a trip should return 201", async (done) => {
    let body = {
      trip_name: "USA Trip",
      place_id: "ChIJCzYy5IS16lQRQrfeQ5K5Oxw",
      start_date: "2020-04-12",
      end_date: "2020-05-25",
    };

    const response = await request(app)
      .post("/v1/trip")
      .set("Authorization", token)
      .send(body);
    expect(response.statusCode).toBe(201);
    done();
  });

  test("Get all trips should return 200", async (done) => {
    const response = await request(app)
      .get("/v1/trips")
      .set("Authorization", token);
    expect(response.statusCode).toBe(200);
    done();
  });

  test("Get a trip should return 404 when id is invalid", async (done) => {
    const response = await request(app)
      .get("/v1/trip/abc")
      .set("Authorization", token);
    expect(response.statusCode).toBe(404);
    done();
  });
});
