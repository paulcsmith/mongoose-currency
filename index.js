var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , SchemaType = mongoose.SchemaType
    , Types = mongoose.Types
    , mongo = mongoose.mongo;

function Currency(path, options) {
  SchemaType.call(this, path, options);
}

// allow { required: true }
Currency.prototype.checkRequired = function (val) {
  return undefined !== value;
}

Currency.prototype.cast = function(val) {
  var currencyAsString = val.toString();
  var digitsAndDotRegex = /\d*\.\d{1,2}/;
  currencyAsString = currencyAsString.replace(/\,+|[a-zA-Z]+/g, "");
  var currency = digitsAndDotRegex.exec(currencyAsString + ".0")[0];
  return currency * 1;
};

/*!
 * inherits
 */

Currency.prototype.__proto__ = SchemaType.prototype;

module.exports.loadType = function(mongoose) {
  mongoose.SchemaTypes.Currency = Currency;
  return mongoose.Types.Currency = Currency;
};
