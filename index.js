var mongoose = require('mongoose')
    , SchemaType = mongoose.SchemaType;

function Currency(path, options) {
  mongoose.SchemaTypes.Number.call(this, path, options);
}

Currency.prototype.cast = function(val) {
  var currencyAsString = val.toString();
  var findDigitsAndDotRegex = /\d*\.\d{1,2}/;
  var findCommasAndLettersRegex = /\,+|[a-zA-Z]+/g;
  var findNegativeRegex = /^-/;
  var currency;
  currencyAsString = currencyAsString.replace(findCommasAndLettersRegex, "");
  currency = findDigitsAndDotRegex.exec(currencyAsString + ".0")[0]; // Adds .0 so it works with whole numbers
  if ( findNegativeRegex.test(currencyAsString) ) {
    return currency * -1;
  } else{
    return currency * 1;
  };
};

/*!
 * inherits
 */

Currency.prototype.__proto__ = SchemaType.prototype;

module.exports.loadType = function(mongoose) {
  mongoose.SchemaTypes.Currency = Currency;
  return mongoose.Types.Currency = Currency;
};
