/* jshint esversion: 6 */
const mysql2 = require('mysql2/promise');

let instances = {};

const createPoolByConfig = (config) => mysql2.createPool(config);

const query = (pool) => (query, params) => runQuery(pool, query, params);

const bulkInsert = (pool) => async (query, params) => {
    const connection = await pool.getConnection();
    await connection.query(query, [params]);
    await connection.release();
}


const transactional = (pool) =>
    async (func, timeout = 20) => {

        const connection = await pool.getConnection();
        await connection.query('START TRANSACTION');

        try {
            connection.query('SET SESSION wait_timeout = ?', [timeout]);
            // run queries in transaction
            await func(connection);
            //then commit
            await connection.query('COMMIT');
        } catch (e) {
            //ROLLBACK on error
            await connection.query('ROLLBACK');
            throw e;
        } finally {
            // release
            await connection.release();
        }
    };

const runQuery = async (pool, query, params) => {
    const connection = await pool.getConnection();
    let [res,] = await connection.execute(query, params);
    await connection.release();
    return res;
};

const endPool = (dbName, pool) => async () => {
    await pool.end();
    delete instances[dbName];
}

const createNewDbConnection = (name, config) => {

    let instance = {};

    // connection pool
    instance.pool = createPoolByConfig(config);

    // function to stop/end pool connections
    instance.stop = endPool(name, instance.pool);

    // async query runner function that return only result
    instance.query = query(instance.pool);
    instance.bulk = bulkInsert(instance.pool);
    instance.transactional = transactional(instance.pool);

    return instance;
}

const init = (opts) => {
    if (!opts || Object.keys(opts).length <= 0) {
        throw new Error('The config object cannot be empty');
    }

    let config = JSON.parse(JSON.stringify(opts));

    // db name for caching
    let name
    if (config.name) {
        name = config.name;
        delete config.name;
    } else {
        name = '_default_';
    }

    if (!instances[name]) {
        instances[name] = createNewDbConnection(name, config);
    }

    return instances[name];
}


module.exports = init;
