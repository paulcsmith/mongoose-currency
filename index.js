var mongoose = require('mongoose');
var _ = require('underscore');

module.exports.loadType = function(mongoose) {
  mongoose.SchemaTypes.Currency = Currency;
  return mongoose.Types.Currency = Currency;
};

function Currency(path, options) {
  mongoose.SchemaTypes.Number.call(this, path, options);
}

Currency.prototype.cast = function(val) {
  if ( _.isString(val) ) {
    var currencyAsString = val.toString();
    var findDigitsAndDotRegex = /\d*\.\d{1,2}/;
    var findCommasAndLettersRegex = /\,+|[a-zA-Z]+/g;
    var findNegativeRegex = /^-/;
    var currency;
    currencyAsString = currencyAsString.replace(findCommasAndLettersRegex, '');
    currency = findDigitsAndDotRegex.exec(currencyAsString + '.0')[0]; // Adds .0 so it works with whole numbers
    if ( findNegativeRegex.test(currencyAsString) ) {
      return (currency * -100).toFixed(0) * 1;
    } else{
      return (currency * 100).toFixed(0) * 1;
    }
  } else if ( _.isNumber(val) ) {
    return val.toFixed(0) * 1;
  } else {
    return new Error('Should pass in a number or string');
  }
};

/*!
 * inherits
 */

Currency.prototype.__proto__ = mongoose.SchemaTypes.Number.prototype;
