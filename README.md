## What it does

* Strips out symbols from the beginning of strings (sometimes users include the currency symbol)
* Stripes out commas (sometimes users add in commas or copy paste values into forms, e.g. "1,000.50)
* Only save from two digits past the decimal point ("$500.559" is converted to 500.55 and doesn't round)
* Strips [a-zA-Z] from strings
* Pass in a string or a number. Numbers will be converted without rounding (e.g. 500.559 -> 500.55)

## How to use

```JavaScript
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Will add the Currency type to the Mongoose Schema types
require('mongoose-currency').loadType(mongoose);
var Currency - mongoose.Types.Currency;

// If you don't have the Currency variable declared you can use 'mongoose.Types.Currency'
var ProductSchema = Schema({
  price: { type: Currency }
});

var Product = mongoose.model('Product', ProductSchema);

var product = new Product({ price: "$1,200.55" });
product.price; // Number: 1200.55
product.price = 1200.5599;
product.price; // Number 1200.55 It will not round and will only save two digits over
```

## Testing

Make sure to have mocha installed `npm install mocha`

in the root directory of the project run `mocha test`

## Todo

* Add currency validation?
* Add option for what Currency strips by default (, or .) Will work better in countries where values are represented like this: 1.000.000,00
* Add option for precision
* Add currency validator?

## Gotchas

The currency is returned as a floating point. When adding two floating points together it can have rounding errors
```
1.03+1.19; // 2.2199999999999998
```

So remember to call toFixed to get your number back how you need it.

```JavaScript
var sum = 1.03+1.19;
sum.toFixed(2); // "2.22"

// Or do this..

var num1 = 1.03; // These numbers would normally be from your mongoose record
var num2 = 1.19;
var sum = num1*100 + num2*100;
sum / 100; // Number: 2.22

```

