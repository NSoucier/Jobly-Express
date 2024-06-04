"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, ExpressError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();


/** POST / { job } =>  { job: {job data} }
 *
 * job should be { title, salary, equity, companyHandle }
 *
 * Returns { title, salary, equity, company_handle }
 *
 * Authorization required: Admin
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { jobs: [{ title, salary, equity, companyHandle }, ...] }
 *
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
    // destructure JSON body for filters
    let { title, minSalary, hasEquity } = req.body;
    // if filters have been passed through
    if (title || minSalary || hasEquity) {
      const jobs = await Job.findWhere(req.body)
      return res.json({ jobs })
    } else {
      // show all companies if no filters are present 
      const jobs = await Job.findAll();      
      return res.json({ jobs });
    }
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  =>  { job }
 *
 *  job is { title, salary, equity, companyHandle }
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  try {
    const job = await Job.get(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[id]
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity }
 *
 * Returns {title, salary, equity, companyHandle}
 *
 * Authorization required: Admin
 */

router.patch("/:id", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: Admin
 */

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    await Job.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
