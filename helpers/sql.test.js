const { sqlForPartialUpdate } = require("./sql");

describe("partial update to sql", function () {
  test("send partial companies data", function () {
    let data = {name: 'test', description: 'test description', numEmployees: 999};
    let jsToSql = { numEmployees: 'num_employees', logoUrl: 'logo_url' };
    const { setCols, values } = sqlForPartialUpdate(data, jsToSql);
    expect(values).toEqual(['test', 'test description', 999]);
    expect(setCols).toEqual('"name"=$1, "description"=$2, "num_employees"=$3')
  });

  test("send partial user data", function () {
    let data = {firstName: 'test', email: 'new@email.com'};
    let jsToSql = { firstName: 'first_name', lastName: 'last_name', isAdmin: 'is_admin' };
    const { setCols, values } = sqlForPartialUpdate(data, jsToSql);
    expect(values).toEqual(['test', 'new@email.com']);
    expect(setCols).toEqual('"first_name"=$1, "email"=$2')
  });
});
