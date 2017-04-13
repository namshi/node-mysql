# node-mysql

This wrapper provides some enhancements for [`node-mysql2`](https://github.com/sidorares/node-mysql2)

[![Build Status](https://travis-ci.com/namshi/node-mysql.svg?token=V2NdsNG4wfMuQLkCArk9&branch=master)](https://travis-ci.com/namshi/node-mysql)

## Installation

This module can be installed with either yarn or npm:


``` bash
$ yarn add namshi-node-mysql
```

``` bash
$ npm install namshi-node-mysql --save
```

## Example Usage of query

`query()` uses [prepared-statements](https://github.com/sidorares/node-mysql2#prepared-statements).

``` js

let config = {
	host: "localhost",
	user: "foo",
	password: "bar",
	database: "db"
}

let db = require('namshi-node-mysql')(config);

db.query('UPDATE foo SET key = ?', ['value']).then(() => {
	return db.query('SELECT * FROM foo');
}).spread(rows => {
	console.log('Look at all the foo', rows);
});

// using multiple databases, you can add a "name" key to your config object. For example:
let config = {
	name: "second-db",
	host: "localhost",
	user: "foo",
	password: "bar",
	database: "db"
}

let db2 = require('namshi-node-mysql')(config);

db2.query('SELECT * FROM users').spread(users => {
	console.log('Hello users', users);
});


```

## Example usage of [namedPlaceholders]((https://github.com/sidorares/node-mysql2#named-placeholders))

``` js
let config = {
	host: "localhost",
	user: "foo",
	password: "bar",
	database: "db"
}

let db = require('namshi-node-mysql')(config);


db.pool.on('connection', poolConnection => {
    poolConnection.config.namedPlaceholders = true;
});

db.execute('SELECT * FROM users WHERE LIMIT = :limit', {limit: 10}).spread( users => {
	console.log('Hello users', users);
});

```

## Example usage of startTransaction, commit and rollback


``` js
let config = {
	host: "localhost",
	user: "foo",
	password: "bar",
	database: "db"
}

let db = require('namshi-node-mysql')(config);

let connection;

db.startTransaction(30).then(conn => {
	connection = con;
}).catch(err) {
	//handle error
};

//default timeout here is set to 20
db.startTransaction().then(conn => {
	connection = con;
}).catch(err) {
	//handle error
};

db.commit(connection).catch(err => {
	//handle err
});

db.rollback(connection).catch(err => {
	//handle err
});
```

## Credits

This library depends on [node-mysql2](https://github.com/sidorares/node-mysql2). It is also considered a breaking-change upgrade of [node-mysql2-promise](https://github.com/namshi/node-mysql2-promise).
