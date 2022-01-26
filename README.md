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

`query(sql , paramsArray, isPreparedStatment)` uses to for run sql queries `isPreparedStatment` is optional and true by
default

``` js


let dbInitFn = require('namshi-node-mysql')

let config = {
	host: "localhost",
	user: "foo",
	password: "bar",
	database: "db"
}

let db = dbInitFn(config); 

await db.query('UPDATE foo SET key = ?', ['value']);

let rows = await db.query('SELECT * FROM foo');

console.log('Look at all the foo', rows);


// using multiple databases, you can add a "name" key to your config object. For example:
let config2 = {
	name: "second-db",
	host: "localhost",
	user: "foo",
	password: "bar",
	database: "db"
}

let db2 = dbInitFn(config2); 

let users = await db2.query('SELECT * FROM users');
console.log('Hello users', users);

```

## Enable DEBUG mode to log the query being executed and its parameters.

``` js
// You can enable debugging by passing the `debug` parameter as follow:
// by default it is set to false.

let config = {
	host: "localhost",
	user: "foo",
	password: "bar",
	database: "db",
	debug: true;
}
```

## Example Usage of bulk

`bulk()` uses `execute` which supports prepared statements, and we use prepared statements for bulk.

``` js

let config = {
	host: "localhost",
	user: "foo",
	password: "bar",
	database: "db"
}

var values = [
    ['demian', 'demian@gmail.com', 1],
    ['john', 'john@gmail.com', 2],
    ['mark', 'mark@gmail.com', 3],
    ['pete', 'pete@gmail.com', 4]
];

await db.bulk('INSERT INTO foo (name, email, n) VALUES ?', values)

let rows = await  db.query('SELECT * FROM foo');
console.log('Look at all the foo', rows);

```

## Example usage of [namedPlaceholders]((https://github.com/sidorares/node-mysql2#named-placeholders))

``` js
let dbInitFn = require('namshi-node-mysql')


let config = {
	host: "localhost",
	user: "foo",
	password: "bar",
	database: "db",
	namedPlaceholders: true // must be there 
}

let db = dbInitFn(config);

let users = await db.query('SELECT * FROM users WHERE LIMIT = :limit', {limit: 10})
console.log('Hello users', users);

```

## Example usage of `where in` clause

with `where in` clause you have to set `isPreparedStatment` to `false`
look at this [node-mysql2-issue](https://github.com/sidorares/node-mysql2/issues/196)

so our query will be

```js
const query = 'SELECT * FROM users WHERE id in (?)';
const userIds = [1, 2, 3, 4];
const isPreparedStatment = false;
let users = await db.query(query, userIds, isPreparedStatment);

console.log('Hello users', users);
```

## Example usage of Transactions

with ```transactional``` you don't have to worry about committing or rollback the transactions example
```db.transactional(async (conn) => { // your transaction queries }, timout) ```.

#### Default timeout is 20

#### Example of success transaction with timeout =10

``` js
const values = 
 [ 
        ['testName1', 'testEmail1@test.com' ,1],
        ['testName2', 'testEmail2@test.com' ,2],
        //...
        ['testName1000', 'testEmail1000@test.com' ,1000], 
 ] 
await db.transactional(
    async (conn) => { 
            await conn.query('INSERT INTO user (name, email, n) VALUES ?', [values]);
            await conn.query('INSERT INTO foo (name, email, n) VALUES ?', [values]);
            await conn.query('INSERT INTO bar (name, email, n) VALUES ?', [values]);
 },10)


```

#### Example of failed transaction without timeout, So it takes the default which is = 20 sec

``` js
try{

await db.transactional(
    async (conn) => { 
         await conn.query('INSERT INTO user (name, email, n) VALUES ?', [values]);
     
         throw new Error(`bad :)`).
        
 });
 
} catch(e){

// do something here 
console.log('failed transaction!! ', e)
throw new Error ("some thing wrong happen , maybe you need to retry!");

}

```

### Example of query format

If you want format the query with the params first before running it

```js

let config = {
    host: "localhost",
    user: "foo",
    password: "bar",
    database: "db",
    namedPlaceholders: true // must be there for formattedQueryWithPlaceHolder
}

let db = dbInitFn(config);

const ids = [1, 2, 3, 4];

let formattedQueryWithPlaceHolder =
    await db.format(`select * from user where id in (:userIds)`
        , {userIds: ids});

console.log("Formated query with placeHolder ", formattedQuery);

let formattedQuery =
    await db.format(`select * from user where id in (?)`
        , [ids]);

console.log("Formated query ", formattedQuery);

// running that formatted query 
const users = await db.query(formattedQuery);
console.log("Users ", users);



```

### Stop the db connections pool

If you want to stop the db pool connections and free up the resources

```js

await db.stop();

```

## Credits

This library depends on [node-mysql2](https://github.com/sidorares/node-mysql2). It is also considered a breaking-change
upgrade of [node-mysql2-promise](https://github.com/namshi/node-mysql2-promise).
