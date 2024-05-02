'use strict';
const mongoose = require('mongoose');
const util = require('util');

module.exports.loadType = function (mongoose) {
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

Currency.prototype.cast = function (val) {
  if (isType('String', val)) {
    let currencyAsString = val.toString();
    const findDigitsAndDotRegex = /\d*\.\d{1,2}/;
    const findCommasAndLettersRegex = /\,+|[a-zA-Z]+/g;
    const findNegativeRegex = /^-/;
    let currency;
    
    currencyAsString = currencyAsString.replace(findCommasAndLettersRegex, "");
    currency = findDigitsAndDotRegex.exec(currencyAsString + ".0")[0]; // Adds .0 so it works with whole numbers

    if (findNegativeRegex.test(currencyAsString)) {
      return (currency * -100).toFixed(0) * 1;
    } else {
      return (currency * 100).toFixed(0) * 1;
    }
  } else if (isType('Number', val)) {
    return val.toFixed(0) * 1;
  } else {
    return new Error('Should pass in a number or string');
  }
};

/**
 * isType(type, obj)
 * Supported types: 'Function', 'String', 'Number', 'Date', 'RegExp',
 * 'Arguments'
 * source: https://github.com/jashkenas/underscore/blob/1.5.2/underscore.js#L996
 */

function isType(type, obj) {
  return Object.prototype.toString.call(obj) == '[object ' + type + ']';
}
