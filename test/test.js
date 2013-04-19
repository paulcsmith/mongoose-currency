var should = require('should');
var mongoose = require('mongoose');
var Currency = require('../index.js').loadType(mongoose);
var Schema = mongoose.Schema;

var ProductSchema = Schema({
  price: { type: Currency }
});
var Product = mongoose.model('Product', ProductSchema);

describe('Currency Type', function () {
  describe('setting a currency', function () {
    it("should save correctly", function () {
      var product = new Product({ price: "$10.55" });
      product.price.should.equal(10.55);
    })
    it("should strip out dollar letters and return correct values", function () {
      var product = new Product({ price: "HF1sdf0.55" });
      product.price.should.equal(10.55);
    })
    it("should work when there are no cents", function () {
      var product = new Product({ price: "500" })
      product.price.should.equal(500);
    })
    it("should convert whole number", function () {
      var product = new Product({ price: 500})
      product.price.should.equal(500);
    })
    it("should convert number with decimal/cents", function () {
      var product = new Product({ price: 500.55})
      product.price.should.equal(500.55);
    })
  })
})
