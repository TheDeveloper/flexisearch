var flexiSearch = require('./lib/flexiSearch');

module.exports.createClient = function(opts){
  return new flexiSearch(opts);
}
