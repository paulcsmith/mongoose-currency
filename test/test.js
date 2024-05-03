const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const should = require('should');
const Currency = require('../index.js').loadType(mongoose);
const Schema = mongoose.Schema;

const ProductSchema = Schema({
  price: { type: Currency }
});
const Product = mongoose.model('Product', ProductSchema);

describe('Currency Type', function () {
  describe('the returned object from requiring mongoose-currency', function () {
    it('should have a loadType method', function () {
      const currencyModule = require('../index.js');
      currencyModule.should.have.ownProperty('loadType');
      currencyModule.loadType.should.be.a.Function;
    });
  });

  describe('mongoose.Schema.Types.Currency', function () {
    before(function () {
      require('../index.js').loadType(mongoose);
    });
    it('mongoose.Schema.Types should have a type called Currency', function () {
      mongoose.Schema.Types.should.have.ownProperty('Currency');
    });
    it('mongoose.Types should have a type called Currency', function () {
      mongoose.Types.should.have.ownProperty('Currency');
    });
    it('should be a function', function () {
      mongoose.Schema.Types.Currency.should.be.a.Function;
    });
    it('should have a method called cast', function () {
      mongoose.Schema.Types.Currency.prototype.cast.should.be.a.Function;
    });
  });

  describe('setting a currency field and not saving the record', function () {
    it("should store positive as an integer by multiplying by 100", function () {
      const product = new Product({ price: "$9.95" });
      product.price.should.equal(995);
    });
    it("should store negative as an integer by multiplying by -100", function () {
      const product = new Product({ price: "-$9.95" });
      product.price.should.equal(-995);
    });
    it("should strip out '$' and ','", function () {
      const product = new Product({ price: "$1,000.55" });
      product.price.should.equal(100055);
    });
    it("should strip out letters and return correct money value", function () {
      const product = new Product({ price: "HF1sdf0.55" });
      product.price.should.equal(1055);
    });
    it("should work as a string when there are no cents", function () {
      const product = new Product({ price: "500" });
      product.price.should.equal(50000);
    });
    it("should work as a string when there are cents", function () {
      const product = new Product({ price: "500.67" });
      product.price.should.equal(50067);
    });
    it("should work with whole number", function () {
      const product = new Product({ price: 500 });
      product.price.should.equal(500);
    });
    it("should round passed in number if they are floating point nums", function () {
      const product = new Product({ price: 500.55 });
      product.price.should.equal(501);
    });
    it('should round when there are > two digits past decimal point', function () {
      const product = new Product({ price: 500.5588 });
      product.price.should.equal(501);
      product.price = "$500.41999";
      product.price.should.equal(50041);
    });
    it('should not round when adding', function () {
      const product = new Product({ price: 119 });
      const product2 = new Product({ price: 103 });
      const sum = product.price + product2.price;
      sum.should.equal(222);
    });
    it('should accept negative currency as a String', function () {
      const product = new Product({ price: "-$5,000.55" });
      product.price.should.equal(-500055);
    });
    it('should accept negative currency as a Number', function () {
      const product = new Product({ price: -5000 });
      product.price.should.equal(-5000);
    });
  });

  describe('setting a currency field and saving the record', function () {
    let mongoServer;
    let db;

    this.beforeAll(async function () {
      // Start MongoDB instance
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = `${mongoServer.getUri()}mongoose_currency_test`;

      /*
      (node:18152) [MONGOOSE] Deprecation Warning: Mongoose: the `strictQuery` option will be switched back to `false` by default in Mongoose 7. Use `mongoose.set('strictQuery', false);` if you want to prepare for this change. Or use `mongoose.set('strictQuery', true);` to suppress this warning.
      */
      mongoose.set('strictQuery', true);

      // Connect Mongoose to the in-memory MongoDB instance
      await mongoose.connect(mongoUri, {});
      db = mongoose.connection;
    });

    after(async function () {
      // Close MongoDB connection and stop the in-memory MongoDB instance
      await mongoose.disconnect();
      await mongoServer.stop();
    });

    beforeEach(async function () {
      // Clear the database before each test
      await db.dropDatabase();
    });

    it('should not round up and should return the correct value', function (done) {
      const product = new Product({ price: "$9.95" });
      product.save(function (err, new_product) {
        new_product.price.should.equal(995);
        Product.findById(new_product.id, function (err, product) {
          product.price.should.equal(995);
          done();
        });
      });
    });
    it('should not round down and should return the correct value', function (done) {
      const product = new Product({ price: "$1,000.19" });
      product.save(function (err, new_product) {
        new_product.price.should.equal(100019);
        Product.findById(new_product.id, function (err, product) {
          product.price.should.equal(100019);
          done();
        });
      });
    });
    it('should be able to store values and adding them together returns the correct value', function (done) {
      const product1 = new Product({ price: 103 });
      const product2 = new Product({ price: 103 });
      product1.save(function (err, product) {
        product2.save(function (err, product2) {
          const sum = product1.price + product2.price;
          sum.should.equal(206);
          done();
        });
      });
    });
  });

  describe('using a schema with advanced options (required, min, max)', function () {
    before(function () {
      const advancedSchema = Schema({
        price: { type: Currency, required: true, min: 0, max: 200 }
      });
      mongoose.model('AdvancedModel', advancedSchema);
    });

    it('should pass validation when a price is set and field is required', function (done) {
      const advancedModel = mongoose.model('AdvancedModel');
      const record = new advancedModel();
      record.price = 100.00;
      record.validate(function (err) {
        should.not.exist(err);
        done();
      });
    });
    it('should fail validation when a price is NOT set and field is required', function (done) {
      const advancedModel = mongoose.model('AdvancedModel');
      const record = new advancedModel();
      record.validate(function (err) {
        should.exist(err);
        err.errors.should.have.property('price');
        err.errors.price.kind.should.equal('required');
        done();
      });
    });
    it('should pass validation when value is in between min and max values', function (done) {
      const advancedModel = mongoose.model('AdvancedModel');
      const record = new advancedModel();
      record.price = 100;
      record.validate(function (err) {
        should.not.exist(err);
        done();
      });
    });
    it('should fail validation when value is below min', function (done) {
      const advancedModel = mongoose.model('AdvancedModel');
      const record = new advancedModel();
      record.price = -100;
      record.validate(function (err) {
        should.exist(err);
        err.errors.should.have.property('price');
        err.errors.price.kind.should.equal('min');
        done();
      });
    });
    it('should fail validation when value is higher than max', function (done) {
      const advancedModel = mongoose.model('AdvancedModel');
      const record = new advancedModel();
      record.price = 500;
      record.validate(function (err) {
        should.exist(err);
        err.errors.should.have.property('price');
        err.errors.price.kind.should.equal('max');
        done();
      });
    });
  });
});
