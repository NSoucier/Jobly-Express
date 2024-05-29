const { BadRequestError } = require("../expressError");

/** Helper function to parse incoming data that needs updating when there is only partial data present. 
 * 
 *  dataToUpdate: an object containing the data to update
 *  jsToSql: an object converting the keys to the sql column names
 * 
 *  Returns object of sql columns and corresponding values to be updated:
 *  { 
 *     setCols: '"column1"=$1, "column2"=$2, ...'
 *     values: [value1, value2, ...]
 *  }
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  console.log('**********************', dataToUpdate, '********', jsToSql)
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
