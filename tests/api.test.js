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
    expect(response.statusCode).toBe(201);
    done();
  });
});
