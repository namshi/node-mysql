# node-mysql

## Usage

You need to have a host config object that looks as follow (yaml format):
```
    host: 'mysql'
    user: 'root'
    password: 'root'
    connectTimeout: 10000
    waitTimeout: 20
    connectionLimit: 8
```
Assuming that the object above is called `dbConf`, you will need to pass it to `node-mysql` when you require it:

`const myql = require('node-mysql')(dbConf);`

## Available Functions
`startTransaction(timeout)`

By default the timeout is set to `dbConf.transactionTimeout` or 20. `startTransaction` will also return a connection that you can later use as parameter to `commit(connection)` and/or `rollback(connection)`.

`commit(connection)`,

`rollback(connection)`,

`query(query, params)`

## Credits

We copied the original code from the [shipments app](https://github.com/namshi/shipments.namshi.net) written mainly by Geshan.
