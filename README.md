## Adds "Currency" as a type in for Mongoose Schemas

```JavaScript
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Currency = require('mongoose-currency').loadType(mongoose);

var ProductSchema = Schema({
  price: { type: Currency }
});
var Product = mongoose.model('Product', ProductSchema);

var product = new Product({ price: "$1,200.55" });
product.price; // Number: 1200.55
```

## Testing

Make sure to have mocha installed `npm install mocha`

in the root directory of the project run `mocha test`
