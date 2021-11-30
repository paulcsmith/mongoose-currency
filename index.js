const mongoose = require('mongoose');
const util = require('util');

const REGEX_FIND_DIGITS_AND_DOT = /\d*\.\d{1,2}/;
const REGEX_FIND_COMMAS_AND_LETTERS = /\,+|[a-zA-Z]+/g;
const REGEX_FIND_NEGATIVE = /^-/;

function Currency(path, options) {
  mongoose
    .SchemaTypes
    .Number
    .call(this, path, options);
}

/*!
 * inherits
 */
util.inherits(Currency, mongoose.SchemaTypes.Number);

Currency.prototype.cast = function(val) {
  if (typeof val === 'string') {
    let currencyAsString = val.toString();
    currencyAsString = currencyAsString.replace(REGEX_FIND_COMMAS_AND_LETTERS, "");
    const currency = REGEX_FIND_DIGITS_AND_DOT.exec(currencyAsString + ".0")[0]; // Adds .0 so it works with whole numbers
    if (REGEX_FIND_NEGATIVE.test(currencyAsString)) {
      return (currency * -100).toFixed(0) * 1;
    } else {
      return (currency * 100).toFixed(0) * 1;
    }
  } else if (typeof val === 'number') {
    return val.toFixed(0) * 1;
  } else {
    return new Error('Should pass in a number or string');
  }
};

module.exports.loadType = function(mongoose) {
  mongoose.Types.Currency = mongoose.SchemaTypes.Currency = Currency;
  return Currency;
}
