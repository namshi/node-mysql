`use strict`

const should = require('should');
const assert = require('assert');

describe('node-mysql', () => {
  it('should throw an error when required without any configuration object', (done) => {
    try {
      const mysql = require('../index')();
    } catch (err) {
      assert.equal(err.message, 'The config object cannot be empty');
    }
    done();
  });

  it('should not throw an error when required with a non-empty configuration object', (done) => {
    const mysql = require('../index')({host: 'mysql', user:'root', password:'root'});
    assert.notEqual(mysql, null);
    assert.notEqual(mysql.commit, null);
    assert.equal(typeof mysql.commit,'function');
    assert.notEqual(mysql.rollback, null);
    assert.equal(typeof mysql.rollback,'function');
    assert.notEqual(mysql.startTransaction, null);
    assert.equal(typeof mysql.startTransaction,'function');
    assert.notEqual(mysql.query, null);
    assert.equal(typeof mysql.query,'function');
    done();
  });
})
