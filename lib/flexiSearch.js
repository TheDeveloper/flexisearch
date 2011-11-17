var net = require('net')
  , http = require('http')
  , events = require('events')
  , util = require('util')
;

module.exports = flexiSearch;

function flexiSearch(opts){
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

Core = require('./modules/core');
Util = require('./modules/util');
