## What it does

* Saves a String as an integer (by stripping non digits and multiplying by 100) to prevent rounding errors when performing calculations (See gotchas for details)
* Strips out symbols from the beginning of strings (sometimes users include the currency symbol)
* Strips out commas (sometimes users add in commas or copy paste values into forms, e.g. "1,000.50)
* Only save from two digits past the decimal point ("$500.559" is converted to 50055 and doesn't round)
* Strips [a-z, A-Z] from strings
* Pass in a string or a number. Numbers will be stored AS IS.
* Assumes that if you set the value to an integer you have already done the conversion (e.g. 50000 = $500.00)
* If a floating point number is passed in it will round it. (500.55 -> 501). Just pass in integers to be safe.

## How to use

```JavaScript
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Will add the Currency type to the Mongoose Schema types
require('mongoose-currency').loadType(mongoose);
var Currency = mongoose.Types.Currency;

// If you don't have the Currency variable declared you can use 'mongoose.Types.Currency'
var ProductSchema = Schema({
  price: { type: Currency }
});

var Product = mongoose.model('Product', ProductSchema);

var product = new Product({ price: "$1,200.55" });
product.price; // Number: 120055
product.price = 1200;
product.price; // Number 1200 It will not round or multiply. Stored AS IS and should represent $12.00
```
### Schema options

Accepts mongoose [number schema options](http://mongoosejs.com/docs/api.html#schema-number-js)

```JavaScript
// Will validate that the minimum is $200.00 and max is $500.00
var ProductSchema = Schema({
  price: { type: Currency, required: true, min: -20000, max: 50000 }
});

// See Gotchas (bottom) for details
```
### Displaying to end users (views, reports, etc.)

To display values to end users remember to call `.toFixed(2)`
```JavaScript
product.price.toFixed(2); // Returns 1200.55
```

## Testing

Make sure to have mocha installed `npm install mocha`

in the root directory of the project run `mocha test`

## Todo

* Add currency validation?
* Add option for what Currency strips by default (, or .) Will work better in countries where values are represented like this: 1.000.000,00
* Add option for precision
* Add currency validator?
* Change min/max validators to accept currency format e.g. 200 is $200.00 not $2.00. Not sure if this is the best way or not.

## Gotchas

The currency is returned as an integer. Why? Because adding two floating points together can have rounding errors.
```
// Not good
1.03+1.19; // 2.2199999999999998
```

### Calculations with currency with mongoose-currency.

```JavaScript
var product1 = Product.findById('id');
var product2 = Product.findById('id2');
product1.price; // returns 103 which represents $1.03
product2.price; // returns 119 which represents $1.19
var sum = product1.price+product2.price / 100;
sum.toFixed(2); // returns a number: 2.22
```

### Displaying values for end users

```JavaScript
var record = Product.findById('yourid');
record.price; // 10050 which represents $100.50
record.price.toFixed(2); // return 100.50
```

When you set an integer it will NOT be multiplied by 100. It will be stored AS IS!
This is on purpose. This library is mainly for accepting USER generated inputs from forms, etc.
```
product.price = 100;
product.price; // Returns 100 Does not multiply by 100. Represents $1.00
```

### Queries and validators

Remember when doing queries that to find values greater than, less than, etc. you need to multiply by 100!

So to get values greater than $100.00 you need to run your query with 100 * 100 e.g. 10000

*It is considered best practice to store money values as ints.
It will cause far fewer problems down the road*

For further reading: http://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html

Just remember to call toFixed(2) whenever you want to display those values to end users.



[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/paulcsmith/mongoose-currency/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

