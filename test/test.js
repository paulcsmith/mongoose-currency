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
      var product = new Product({ price: "$1,000.05" });
      product.save(function (err, new_product) {
        new_product.price.should.equal(1000.05);
        done();
      });
    });
  });

})
