## Adds "Currency" as a type in for Mongoose Schemas

* Strips out symbols from the beginning of strings (sometimes users include the currency sybmole)
* Stripes out commas (sometimes users add in commas or copy paste values into forms)
* Only save from two digits past the decimal point ("$500.559" is converted to 500.55 and doesn't round)
* Strips [a-zA-Z] from strings
* You can also pass in numbers and not string representations of currencies

## How to use

```JavaScript
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Will add the Currency type to the Mongoose Schema types
var Currency = require('mongoose-currency').loadType(mongoose);

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

* Extend from the number type so that it inherites max, and min schema options
* Tests for making the value required in the Schema
* Add support for negative numbers

## Gotchas

The currency is returned as a floating point. When adding two floating points together it can have rounging errors
```
1.03+1.19; // 2.2199999999999998
```

So remember to call toFixed to get your number back how you need it
```JavaScript
var sum = 1.03+1.19;
sum.toFixed(2); // "2.22"

