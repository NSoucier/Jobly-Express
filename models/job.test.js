"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError.js");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "job1",
    salary: 1,
    equity: "1",
    companyHandle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual(newJob);

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'job1'`);
    expect(result.rows).toEqual([
      {
        title: "job1",
        salary: 1,
        equity: "1",
        company_handle: "c1",
      },
    ]);
  });


});

/************************************** findAll */

describe("findAll", function () {
  test("works", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        title: "job0",
        salary: 0,
        equity: "0",
        companyHandle: "c1",
      },
    ]);
  });
});


// /************************************** findWhere */

// describe("findWhere", function () {
//   test('works: with name filter', async function () {
//     let companies = await Company.findWhere({ name: "c2" });
//     expect(companies).toEqual([{
//       handle: "c2",
//       name: "C2",
//       description: "Desc2",
//       numEmployees: 2,
//       logoUrl: "http://c2.img",
//     }]);
//   });

//   test('works: with employee filter', async function () {
//     let companies = await Company.findWhere({ minEmployees: 3 });
//     expect(companies).toEqual([{
//       handle: "c3",
//       name: "C3",
//       description: "Desc3",
//       numEmployees: 3,
//       logoUrl: "http://c3.img",
//     }]);
//   });
  
//   test('does not work: invalid employee range', async function () {
//     let companies = await Company.findWhere({ minEmployees: 5, maxEmployees: 2 });
//     expect(companies).toEqual([]);
//   });
// });

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(1);
    expect(job).toEqual({
      title: "job0",
      salary: 0,
      equity: "0",
      companyHandle: "c1",
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    salary: 110,
    equity: 0.1,
  };

  test("works", async function () {
    let job = await Job.update(1, updateData);
    expect(job).toEqual({
      title: "job0",
      salary: 110,
      equity: "0.1",
      companyHandle: "c1",
    });

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE id = 1`);
    expect(result.rows).toEqual([{
      title: "job0",
      salary: 110,
      equity: "0.1",
      company_handle: "c1",
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      salary: null,
      equity: null,
    };

    let job = await Job.update(1, updateDataSetNulls);
    expect(job).toEqual({
      title: "job0",
      salary: null,
      equity: null,
      companyHandle: "c1",
    });

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE id = 1`);
    expect(result.rows).toEqual([{
      title: "job0",
      salary: null,
      equity: null,
      company_handle: "c1",
    }]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(0, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(1);
    const res = await db.query(
        "SELECT title FROM jobs WHERE id=1");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
