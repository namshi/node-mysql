let mysqlLib = require('mysql2/promise');

let pool;
let config;

/**
*
* Set Session wait timeout parameter to close connection if inactive
* Initiate transaction so all the subsequent queries to the db are not written
* to the database until commit is called
*
* @return {object} connection
**/
function startTransaction(timeout) {
  timeout = timeout || config.transactionTimeout || 20;
  let connection;
  return getConnection().then(conn => {
    connection = conn;
    return connection.query('SET SESSION wait_timeout = ?', [timeout]);
  }).then(()=> {
    return connection.query('START TRANSACTION');
  }).then(() => {
    return connection;
  });
}

function rollback(connection) {
  return connection.execute('ROLLBACK').then(()=> {
    connection.release();
  }).catch(err => {
    connection.release();

    throw err;
  });
}

function commit(connection) {
  return connection.execute('COMMIT').then(()=> {
    connection.release();
  }).catch(err => {
    connection.release();

    throw err;
  });
}

function query(query, params) {
  let connection;

  return pool.getConnection().then((conn)=> {
    console.log('getting connection');
    connection = conn;
    return connection.execute(query, params);
  }).then((results) => {
    connection && connection.connection && connection.connection.unprepare(query);
    connection && connection.release();
    console.log('ok - released connection');
    return results[0];
  }).catch(err => {
    if (!connection) {
      console.error('could not establish db connection', err.message);
      throw err;
    }
    connection.connection && connection.connection.unprepare(query);
    connection.release();
    console.error(`released connection, even with error in sql query execution. Error Message : ${err.message} - `, query, params);
    throw err;
  });
}

function getConnection() {
  return pool.getConnection().then((conn)=> {
    console.log('getting connection');
    let exec = conn.execute;
    conn.select = function(query, params) {
      return exec.call(this, query, params).then((results) => {
        return results[0];
      });
    };
    return conn;
  });
}

module.exports = function(opts) {

  if (!opts || Object.keys(opts).length <= 0) {
    throw new Error('The config object cannot be empty');
  }

  config = opts;
  pool = mysqlLib.createPool(config);

  return {
    startTransaction,
    commit,
    rollback,
    query
  }
}
