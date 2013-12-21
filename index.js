'use strict';
var mongoose = require('mongoose');
var _ = require('underscore');
var util = require('util');

module.exports.loadType = function(mongoose) {
  mongoose.Types.Currency = mongoose.SchemaTypes.Currency = Currency;
  return Currency;
};

function Currency(path, options) {
  mongoose.SchemaTypes.Number.call(this, path, options);
}

/*!
 * inherits
 */

util.inherits(Currency, mongoose.SchemaTypes.Number);

Currency.prototype.cast = function(val) {
  if ( _.isString(val) ) {
    var currencyAsString = val.toString();
    var findDigitsAndDotRegex = /\d*\.\d{1,2}/;
    var findCommasAndLettersRegex = /\,+|[a-zA-Z]+/g;
    var findNegativeRegex = /^-/;
    var currency;
    currencyAsString = currencyAsString.replace(findCommasAndLettersRegex, "");
    currency = findDigitsAndDotRegex.exec(currencyAsString + ".0")[0]; // Adds .0 so it works with whole numbers
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
