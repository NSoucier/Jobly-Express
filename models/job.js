"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, companyHandle }
   *
   * Returns { title, salary, equity, company_handle }
   *
   * 
   * */

  static async create({ title, salary, equity, companyHandle }) {

    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING title, salary, equity, company_handle AS "companyHandle"`,
        [title, salary, equity, companyHandle],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ title, salary, equity, companyHandle }, ...]
   * */

  static async findAll() {
    const resp = await db.query(
          `SELECT title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           ORDER BY title`);
    return resp.rows;
  }

  /** Find all jobs where filters are met.
   * 
   * filters: {colName: filter_value, ...}
   *
   * Returns [{ title, salary, equity, company_handle }, ...]
   * */

    static async findWhere(filters) {
      let filter = [];
      let values = [];
      let index = 1;

      // add title filter to query
      if (!!filters.title) {
        values.push(`%${filters.title}%`)
        filter.push(`"title" ILIKE $${index}`)
        index++;
      }

      // add minSalary filter to query
      if (!!filters.minSalary) {
        values.push(filters.minSalary)
        filter.push(`"salary" >= $${index}`)
        index++;
      }

      // add hasEquity filter to query 
      if (filters.hasEquity) {
        filter.push(`"equity" > 0`)
      }
      
      // join query by AND if more than one query exists
      filter = filter.join(' AND ');
      // console.log('***********************************', filter, values)

      const jobsResp = await db.query(
            `SELECT title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"
             FROM jobs
             WHERE ${filter}
             ORDER BY title`,
            values);
      return jobsResp.rows;
    }

  /** Given a job id, return data about job.
   *
   * Returns { title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const resp = await db.query(
          `SELECT title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = $1`,
        [id]);

    const job = resp.rows[0];

    if (!job) throw new NotFoundError(`No job with ID ${id}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {title, salary, equity, companyHandle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          companyHandle: "company_handle",
        });
    console.log('//////////////////', setCols, '\\\\\\\\\\', values)
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${handleVarIdx} 
                      RETURNING title, salary, equity, company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    console.log('%%%%%%%%%%%%%%%%%%%', job)

    if (!job) throw new NotFoundError(`No job id: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
        [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job id: ${id}`);
  }
}


module.exports = Job;
