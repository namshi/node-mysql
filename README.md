# node-mysql

## Usage

You need to have a host config object:
```
    host: 'mysql'
    user: 'root'
    password: 'root'
    connectTimeout: 10000
    waitTimeout: 20
    connectionLimit: 8
```
imagine, you call this config `dbConf`. You will pass the config object to node-mysq when you rquire it as follow:
const myql = require('node-mysql')(dbConf);

## Available Functions
`startTransaction(timeout)`
By default the timeout is set to `dbConf.transactionTimeout` or 20. `startTransaction will also return a connection that you can later use as param to `commit()` and/or `rollback()`.

`commit(connection)`,

`rollback(connection)`,

`query(query, params)`

## Credits

We copied the originan code from the [shipments app](https://github.com/namshi/shipments.namshi.net) written mainly by Geshan.
