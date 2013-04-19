var should = require('should');
var mongoose = require('mongoose');
var Currency = require('../index.js').loadType(mongoose);
var Schema = mongoose.Schema;

var ProductSchema = Schema({
  price: { type: Currency }
});
var Product = mongoose.model('Product', ProductSchema);

describe('Currency Type', function () {
  describe('the returned object from requiring mongoose-currency', function () {
    it('should have a loadType method', function () {
      var currencyModule = require('../index.js');
      currencyModule.should.have.ownProperty('loadType');
      currencyModule.loadType.should.be.a('function');
    });
  });

  describe('setting a currency field and not saving the record', function () {
    it("should strip out '$' and ','", function () {
      var product = new Product({ price: "$1,000.55" });
      product.price.should.equal(1000.55);
    });
    it("should strip out letters and return correct money value", function () {
      var product = new Product({ price: "HF1sdf0.55" });
      product.price.should.equal(10.55);
    });
    it("should work as a string when there are no cents", function () {
      var product = new Product({ price: "500" })
      product.price.should.equal(500);
    });
    it("should work as a string when there are cents", function () {
      var product = new Product({ price: "500.67" })
      product.price.should.equal(500.67);
    });
    it("should work with whole number", function () {
      var product = new Product({ price: 500})
      product.price.should.equal(500);
    });
    it("should work with a number with decimal/cents", function () {
      var product = new Product({ price: 500.55})
      product.price.should.equal(500.55);
    });
    it('should not round when more there are more than two decimal points over', function () {
      var product = new Product({ price: 500.5588})
      product.price.should.equal(500.55);
      product.price = "$500.41999";
      product.price.should.equal(500.41);
    });
    it('should not round when adding', function () {
      var product = new Product({ price: 1.19})
      var product2 = new Product({ price: 1.03})
      var sum = product.price + product2.price;
      sum = sum.toFixed(2) * 1;
      sum.should.equal(2.22);
    });
  });

  describe('setting a currency field and saving the record', function () {
    before(function () {
      mongoose.connect('localhost', 'mongoose_currency_test');
    });
    after(function () {
      mongoose.connection.db.dropDatabase();
    });
    it('should not round up and should return the correct value', function (done) {
      var product = new Product({ price: "$1,000.78" });
      product.save(function (err, new_product) {
        new_product.price.should.equal(1000.78);
        done();
      });
    });
    it('should not round down and should return the correct value', function (done) {
      var product = new Product({ price: "$1,000.19" });
      product.save(function (err, new_product) {
        new_product.price.should.equal(1000.19);
        done();
      });
    });
    it('should be able to store values and adding them together returns the correct value', function (done) {
      var product1 = new Product({ price: 1.03 });
      var product2 = new Product({ price: 1.03});
      product1.save(function (err, product) {
        product2.save(function (err, product2) {
          var sum = product1.price + product2.price;
          sum.should.equal(2.06);
          done();
        })
      });
    });
  });

})
