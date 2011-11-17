var assert = require('assert');
var flexiSearch = require('../')
  , Step = require('../lib/step')
;

var client = flexiSearch.createClient();
var indexName = 'test'
  , typeName = 'test'
  , docId = 1
  , document = {test : 1}

Step(
  function(){
    client.index(indexName, typeName, docId, document, this);
  },
  function(err, res){
    assert.ifError(err);
    assert.ok(res);
    assert.ok(res.ok);
    assert.equal(res._id, docId, 'docID not equal');
    assert.equal(res._index, indexName, 'indexName not equal');
    assert.equal(res._type, typeName, 'typeName not equal');
    client.get(indexName, typeName, docId, this);
  },
  function(err, res){
    assert.ifError(err);
    assert.ok(res);
    console.log(res);
    assert.ok(res.exists);
    assert.equal(res._id, docId, 'docID not equal');
    assert.equal(res._index, indexName, 'indexName not equal');
    assert.equal(res._type, typeName, 'typeName not equal');
    assert.deepEqual(res._source, document);
    client.delete(indexName, typeName, docId, this);
  },
  function(err, res){
    assert.ifError(err);
    assert.ok(res);
    assert.ok(res.ok);
    assert.ok(res.found);
    assert.equal(res._id, docId, 'docID not equal');
    assert.equal(res._index, indexName, 'indexName not equal');
    assert.equal(res._type, typeName, 'typeName not equal');
    var self = this;
    client.index(indexName, typeName, docId+1, {test: 1}, function(){
      client.multiGet(indexName, typeName, {ids : [docId, docId+1]}, self);
    });
  },
  function(err, res){
    assert.ifError(err);
    assert.ok(res);
    assert.ok(res.docs);
    assert.equal(res.docs.length, 2, 'Number of documents returned from multiGet command was '+res.docs.length+', expecting 2');
  }
)
