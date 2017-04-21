`use strict`
const should = require('should');

const assert = require('assert');

describe('node-mysql', () => {
  it('should return correct instance', (done) => {
    const defaultDb = require('../index')({host: 'mysql'});
    const namedDb = require('../index')({host: 'mysql', name: 'foo'});
    namedDb.should.equal(require('../index')({host: 'mysql', name: 'foo'}));
    namedDb.should.have.property('query').which.is.a.Function;
    namedDb.should.have.property('bulk').which.is.a.Function;
    namedDb.should.have.property('getConnection').which.is.a.Function;
    namedDb.should.have.property('startTransaction').which.is.a.Function;
    namedDb.should.have.property('commit').which.is.a.Function;
    namedDb.should.have.property('rollback').which.is.a.Function;
    defaultDb.should.equal(require('../index')({host: 'mysql'}));
    defaultDb.should.not.equal(namedDb);
    defaultDb.should.have.property('query').which.is.a.Function;

    done();
  });

  it('should throw an error if we do not pass a config object', (done) => {
    try {
      const db = require('../index')({});
    } catch (err) {
      assert.equal(err.message, 'The config object cannot be empty');
    }

    done();
  })

  it('should throw an error if the config object is empty', (done) => {
    try {
      const db = require('../index')();
    } catch (err) {
      assert.equal(err.message, 'The config object cannot be empty');
    }

    done();
  });
});
