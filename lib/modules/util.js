var http = require('http')
  , flexiSearch = require('../flexiSearch')
;

flexiSearch.prototype.genPath = function(indexName, typeName, modifier, query){
  var pathComponents = [''];
  var indexArgs = [indexName, typeName];
  for(var i = indexArgs.length; i--;){
    if(indexArgs[i]){
      if(indexArgs[i] == Array) indexArgs[i] = indexName.join(',');
      pathComponents[pathComponents.length] = indexArgs[i];
    }
  }
  if(modifier) pathComponents[pathComponents.length] = modifier;
  if(typeof query == 'object'){
    query = url.format(query);
  }
  if(query) query = '?'+query;
  else query = '';
  pathComponents[pathComponents.length] = query;
  var path = pathComponents.join('/');
  return path;
}

flexiSearch.prototype.checkIfCb = function(arg, cb){
  if(typeof arg == 'function') return arg;
  return cb;
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
  this.debug(opts, 1);
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

flexiSearch.prototype.debug = function(message, verbosity){
  if(verbosity <= this.opts.verbosity && this.opts.debug){
    console.log(message);
  }
}
