/* jshint esversion: 6 */
const mysql2 = require('mysql2/promise');

let instances = {};


const createPoolByConfig = (config) => mysql2.createPool(config);

const query = (pool) => (query, params, isPrepared = true) => runQuery(pool, query, params, isPrepared);

const format = (pool) =>
    async (query, params) => safePoolFn(pool, async connection => connection.format(query, params))

const bulkInsert = (pool) => async (query, params) => safePoolFn(pool, conn => conn.query(query, [params]))


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

const runQuery = async (pool, query, params, isPrepared = true) => {
    return safePoolFn(pool, async (conn) => {

        if (isPrepared) {
            let [res,] = await conn.execute(query, params);
            return res;
        }

        let [res,] = await conn.query(query, params);
        return res;
    })

};


const safePoolFn = async (pool, fn) => {
    const connection = await pool.getConnection();
    try {
        return fn(pool);
    } catch (e) {
        throw e;
    } finally {
        connection.release();
    }
}

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
    instance.format = format(instance.pool);
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
