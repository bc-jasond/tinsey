const knex = require('knex');

const mysqlConnectionConfig = {
  host: process.env.NODE_ENV === 'production' ? 'db' : 'localhost', // docker-compose.yml service name
  port: 3306,
  user: 'root',
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: 'tinsey',
};

let knexConnection;
async function getKnex() {
  if (!knexConnection) {
    console.info('Connecting to MySQL...');
    knexConnection = knex({
      client: 'mysql2',
      connection: mysqlConnectionConfig,
      asyncStackTraces: true,
      debug: true,
    });
  }
  return knexConnection;
}

export function getMysqlDatetime(date = null) {
  if (date && !(date instanceof Date)) {
    throw new Error(`getMysqlDatetime: ${date} isn't a built-in JS Date()`);
  }
  const dateInstance = date || new Date();
  // dirty! https://stackoverflow.com/a/15103764/1991322
  return (
    dateInstance.getFullYear() +
    '-' +
    ('0' + (dateInstance.getMonth() + 1)).slice(-2) +
    '-' +
    ('0' + dateInstance.getDate()).slice(-2) +
    ' ' +
    ('0' + dateInstance.getHours()).slice(-2) +
    ':' +
    ('0' + dateInstance.getMinutes()).slice(-2) +
    ':' +
    ('0' + dateInstance.getSeconds()).slice(-2)
  );
}

export async function getUser(googleUser) {
  const knex = await getKnex();
  const [userData] = await knex('user').where({ email: googleUser.email });
  return userData;
}

export async function createUser({ email }) {
  const username = email.split('@')[0];
  const knex = await getKnex();
  await knex('user').insert({ email, username, meta: JSON.stringify({}) });
  const [user] = await knex('user').where({ email });
  return user;
}

export async function saveUser({ email, meta }) {
  const knex = await getKnex();
  await knex('user')
    .update({ meta: JSON.stringify(meta) })
    .where({ email });
  const [user] = await knex('user').where({ email });
  return user;
}
