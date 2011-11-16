var net = require('net')
  , http = require('http')
  , events = require('events')
  , util = require('util')
;

var flexiSearch = module.exports = function(opts){
  var self = this;
  this.opts = {
    port: 9200,
    host: 'localhost',
    connectFrequency : 1,
    connectionCheckFrequency : 5000, // in ms
    debug : true,
    verbosity : 3
  }

  if(opts){
    for(var p in opts){
      this.opts[p] = opts[p];
    }
  }
  this.active = false;
  this.lastConnectAttempt = 0;
  events.EventEmitter.call(this);
  //this.checkConnection();
}

util.inherits(flexiSearch, events.EventEmitter);

flexiSearch.prototype.createIndex = function(indexName, typeName, cb){
  this.command('PUT', '/'+indexName+(typeName ? '/'+typeName : ''), null, cb);
}

// TODO: optional opts object at arguments[0] for query parameters
flexiSearch.prototype.put = function (indexName, typeName, docId, document, cb){
  this.command('PUT', '/'+indexName+(typeName ? '/'+typeName : '')+(docId?'/'+docId : ''), document, cb);
}

flexiSearch.prototype.get = function(indexName, typeName, docId, fields, cb){
  this.command('GET', '/'+indexName+(typeName ? '/'+typeName : '')+(docId?'/'+docId : '')+(fields?'/'+fields : ''), cb);
}

flexiSearch.prototype.del = function (indexName, typeName, docId, cb){
  this.command('DELETE', '/'+indexName+(typeName ? '/'+typeName : '')+(docId?'/'+docId : ''), null, cb);
}

flexiSearch.prototype.search = function(indexName, typeName, queryObj, cb){
  this.command('POST', '/'+indexName+(typeName ? '/'+typeName : '')+'/_search', queryObj, cb);
}

flexiSearch.prototype.mapping = function(indexName, typeName, mappingObj, cb){
  this.command('PUT', '/'+indexName+(typeName ? '/'+typeName : '')+'/_mapping', mappingObj, cb);
}

flexiSearch.prototype.checkConnection = function(){
  this.debug("Checking connection", 3);
  var now = ~~((+new Date)/1000), self = this;
  if(this.active || now - this.lastConnectAttempt < this.opts.connectFrequency){
    setTimeout(self.checkConnection.bind(self), this.opts.connectionCheckFrequency);
    return true;
  }
  this.sock = new net.Socket();
  this.sock.on('error', function(e){
    self.debug(e, 1);
    self.active = false;
    self.esClient = false;
  });
  this.sock.on('end', function(){
    self.debug("Connection ended", 1);
    self.active = false;
    self.esClient = false;
  });
  this.sock.on('connect', function(){
    self.debug('Connection active', 3);
    self.active = true;
  });
  this.lastConnectAttempt = now;
  this.sock.connect(this.opts.port, this.opts.host);
  setTimeout(self.checkConnection.bind(self), this.opts.connectionCheckFrequency);
}

flexiSearch.prototype.command = function(method, path, data, cb){
  var self = this;
  if(typeof data == 'object') data = JSON.stringify(data);
  var opts = {
    host			: this.opts.host,
    port			: this.opts.port,
    path			: path,
    method			: method
  }
  if(data) opts.headers = {"Content-Length" : data.length};
  var req = http.request(opts, function(res){
    res.setEncoding('utf8');
    var response = '';
    res.on('data', function(chunk){
      //console.log(chunk);
      response += chunk
    });
    res.on('end', function(){
      try{
        var responseObj = JSON.parse(response);
      }catch(e){

      }
      if(responseObj.error){
        self.serverError(responseObj);
        cb(responseObj);
      }
      else cb(false, responseObj);
    });
  });
  req.on('error', function(e){
    self.debug(e, 1);
  });
  if(data) req.write(data);
  req.end();
}

flexiSearch.prototype.serverError = function(data){

}

/*flexiSearch.prototype.createClient = function(opts, cb){
var self = this;
if(this.active){
if(!this.client){
es.createClient(opts, function(client){
if(client){
self.esClient = client;
cb(self.esClient);
}
else cb(false);
});
}
else cb(this.esClient);
}
else cb(false);
}*/

flexiSearch.prototype.debug = function(message, verbosity){
  if(verbosity <= this.opts.verbosity && this.opts.debug){
    console.log(message);
  }
}
