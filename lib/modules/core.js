var flexiSearch = require('../flexiSearch')
;

flexiSearch.prototype.createIndex = function(indexName, typeName, cb){
  this.command('PUT', '/'+indexName+(typeName ? '/'+typeName : ''), null, cb);
}

flexiSearch.prototype.index = function (indexName, typeName, docId, document, query, cb){
  if(typeof query == 'function'){
    cb = query; query = '';
  }
  var path = this.genPath(indexName, typeName, docId, query);
  this.command('PUT', path, document, cb);
}

flexiSearch.prototype.get = function(indexName, typeName, docId, query, cb){
  if(typeof query == 'function'){
    cb = query; query = '';
  }
  var path = this.genPath(indexName, typeName, docId, query);
  this.command('GET', path, null, cb);
}

flexiSearch.prototype.multiGet = function(indexName, typeName, document, cb){
  var path = this.genPath(indexName, typeName, '_mget');
  this.command('GET', path, document, cb);
}

flexiSearch.prototype.delete = function(indexName, typeName, docId, query, cb){
  if(typeof query == 'function'){
    cb = query; query = '';
  }
  var path = this.genPath(indexName, typeName, docId, query);
  this.command('DELETE', path, null, cb);
}

flexiSearch.prototype.search = function(indexName, typeName, document, query, cb){
  cb = this.checkIfCb(query, cb);
  var path = this.genPath(indexName, typeName, '_search', query);
  this.command('POST', path, document, cb);
}

flexiSearch.prototype.mapping = function(indexName, typeName, mappingObj, cb){
  this.command('PUT', '/'+indexName+(typeName ? '/'+typeName : '')+'/_mapping', mappingObj, cb);
}
