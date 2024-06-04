"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token, u4Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "job1",
    salary: 100,
    equity: 0.01,
    companyHandle: "c1",
  };

  test("ok for admin users", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({job: {
      title: "job1",
      salary: 100,
      equity: "0.01",
      companyHandle: "c1",
    }});
  });

  test("not ok for non-admin users", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
    
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data by admin", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "new job",
          salary: 10,
        })
        .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data by admin", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: 65,
          salary: "1",
          equity: "1",
          companyHandle: "c1",
        })
        .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
          [
            {
              title: "job0",
              salary: 0,
              equity: "0",
              companyHandle: "c1",
          },
          {
            title: "job2",
            salary: 2000,
            equity: "0.05",
            companyHandle: "c1",
          }
          ],
    });
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
        .get("/jobs")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });

  test('test filtered results using title', async function () {
    const resp = await request(app).get('/jobs').send({ title: 'job2'});
    expect(resp.statusCode).toEqual(200)
    expect(resp.body).toEqual({ jobs: [{
      title: "job2",
      salary: 2000,
      equity: "0.05",
      companyHandle: "c1",
    }]});
  });

  test('test filtered results minSalary', async function () {
    const resp = await request(app).get('/jobs').send({ minSalary: 200 });
    expect(resp.statusCode).toEqual(200)
    expect(resp.body).toEqual({ jobs: [{
      title: "job2",
      salary: 2000,
      equity: "0.05",
      companyHandle: "c1",
    }]});
  });

  test('test filtered results hasEquity', async function () {
    const resp = await request(app).get('/jobs').send({ hasEquity: false });
    expect(resp.statusCode).toEqual(200)
    expect(resp.body).toEqual({ jobs: [{
      title: "job0",
      salary: 0,
      equity: "0",
      companyHandle: "c1",
    },
    {
      title: "job2",
      salary: 2000,
      equity: "0.05",
      companyHandle: "c1",
    }]});
  });

});

// /************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/1`);
    expect(resp.body).toEqual({
      job: {
        title: "job0",
        salary: 0,
        equity: "0",
        companyHandle: "c1",
    },
    });
  });

  test("not found for no such job id", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /companies/:handle */

describe("PATCH /jobs/:id", function () {
  test("works for admin users", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          salary: 999,
        })
        .set("authorization", `Bearer ${u4Token}`);
    expect(resp.body).toEqual({
      job: {
        title: "job0",
        salary: 999,
        equity: "0",
        companyHandle: "c1",
    },
    });
  });

  test("doesn't work for non-admin users", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          salary: 999,
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          salary: 999,
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job id", async function () {
    const resp = await request(app)
        .patch(`/jobs/0`)
        .send({
          title: "new job",
        })
        .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          title: 888,
        })
        .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /companies/:handle */

describe("DELETE /jobs/:id", function () {
  test("doesn't work for non-admin users", async function () {
    const resp = await request(app)
        .delete(`/jobs/1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/jobs/1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such company", async function () {
    const resp = await request(app)
        .delete(`/jobs/0`)
        .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("works for admin users", async function () {
    const resp = await request(app)
        .delete(`/jobs/1`)
        .set("authorization", `Bearer ${u4Token}`);
    expect(resp.body).toEqual({ deleted: "1" });
  });
});
