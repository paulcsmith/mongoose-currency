const {MongoMemoryServer} = require('mongodb-memory-server');
const should = require('should');
const mongoose = require('mongoose');
const Currency = require('../index').loadType(mongoose);

const ProductSchema = new mongoose.Schema({
  price: {
    type: Currency
  }
});
const Product = mongoose.model('Product', ProductSchema);
const AdvancedModelSchema = new mongoose.Schema({
  price: {
    type: Currency,
    required: true,
    min: 0,
    max: 200
  }
});
const AdvancedModel = mongoose.model('AdvancedModel', AdvancedModelSchema);

describe('Currency Type', async () => {
  describe('the returned object from requiring mongoose-currency', () => {
    it('should have a loadType method', () => {
      const currencyModule = require('../index.js');
      currencyModule
        .should
        .have
        .ownProperty('loadType');
      currencyModule.loadType.should.be.a.Function;
    });
  });

  describe('mongoose.Schema.Types.Currency', () => {
    before(() => {
      require('../index.js').loadType(mongoose);
    });
    it('mongoose.Schema.Types should have a type called Currency', () => {
      mongoose
        .Schema
        .Types
        .should
        .have
        .ownProperty('Currency');
    });
    it('mongoose.Types should have a type called Currency', () => {
      mongoose
        .Types
        .should
        .have
        .ownProperty('Currency');
    });
    it('should be a function', () => {
      mongoose.Schema.Types.Currency.should.be.a.Function;
    });
    it('should have a method called cast', () => {
      mongoose.Schema.Types.Currency.prototype.cast.should.be.a.Function;
    });
  });

  describe('setting a currency field and not saving the record', () => {
    it("should store positive as an integer by multiplying by 100", () => {
      const product = new Product({price: "$9.95"});
      product
        .price
        .should
        .equal(995);
    });
    it("should store negative as an integer by multiplying by -100", () => {
      const product = new Product({price: "-$9.95"});
      product
        .price
        .should
        .equal(-995);
    });
    it("should strip out '$' and ','", () => {
      const product = new Product({price: "$1,000.55"});
      product
        .price
        .should
        .equal(100055);
    });
    it("should strip out letters and return correct money value", () => {
      const product = new Product({price: "HF1sdf0.55"});
      product
        .price
        .should
        .equal(1055);
    });
    it("should work as a string when there are no cents", () => {
      const product = new Product({price: "500"});
      product
        .price
        .should
        .equal(50000);
    });
    it("should work as a string when there are cents", () => {
      const product = new Product({price: "500.67"});
      product
        .price
        .should
        .equal(50067);
    });
    it("should work with whole number", () => {
      const product = new Product({price: 500});
      product
        .price
        .should
        .equal(500);
    });
    it("should round passed in number if they are floating point nums", () => {
      const product = new Product({price: 500.55});
      product
        .price
        .should
        .equal(501);
    });
    it('should round when there are > two digits past decimal point', () => {
      const product = new Product({price: 500.5588});
      product
        .price
        .should
        .equal(501);
      product.price = "$500.41999";
      product
        .price
        .should
        .equal(50041);
    });
    it('should not round when adding', () => {
      const product = new Product({price: 119});
      const product2 = new Product({price: 103});
      const sum = product.price + product2.price;
      sum
        .should
        .equal(222);
    });
    it('should accept negative currency as a String', () => {
      const product = new Product({price: "-$5,000.55"});
      product
        .price
        .should
        .equal(-500055);
    });
    it('should accept negative currency as a Number', () => {
      const product = new Product({price: -5000});
      product
        .price
        .should
        .equal(-5000);
    });
  });

  describe('using a schema with advanced options (required, min, max)', () => {
    it(
      'should pass validation when a price is set and field is required',
      (done) => {
        const record = new AdvancedModel();
        record.price = 100.00;
        record.validate((err) => {
          should
            .not
            .exist(err);
          done();
        });
      }
    );
    it(
      'should fail validation when a price is NOT set and field is required',
      (done) => {
        const record = new AdvancedModel();
        record.validate((err) => {
          should.exist(err);
          err
            .errors
            .should
            .have
            .property('price');
          err
            .errors
            .price
            .kind
            .should
            .equal('required');
          done();
        });
      }
    );
    it(
      'should pass validation when value is in between min and max values',
      (done) => {
        const record = new AdvancedModel();
        record.price = 100;
        record.validate((err) => {
          should
            .not
            .exist(err);
          done();
        });
      }
    );
    it('should fail validation when value is below min', (done) => {
      const record = new AdvancedModel();
      record.price = -100;
      record.validate((err) => {
        should.exist(err);
        err
          .errors
          .should
          .have
          .property('price');
        err
          .errors
          .price
          .kind
          .should
          .equal('min');
        done();
      });
    });
    it('should fail validation when value is higher than max', (done) => {
      const record = new AdvancedModel();
      record.price = 500;
      record.validate((err) => {
        should.exist(err);
        err
          .errors
          .should
          .have
          .property('price');
        err
          .errors
          .price
          .kind
          .should
          .equal('max');
        done();
      });
    });
  });

  const mongod = await MongoMemoryServer.create();
  mongoose.connect(`${mongod.getUri()}mongoose_currency_test`);

  describe('setting a currency field and saving the record', () => {
    it('should not round up and should return the correct value', (done) => {
      const product = new Product({price: "$9.95"});
      product.save((err, new_product) => {
        new_product
          .price
          .should
          .equal(995);
        Product.findById(new_product.id, (err, product) => {
          product
            .price
            .should
            .equal(995);
          done();
        });
      });
    });
    it('should not round down and should return the correct value', (done) => {
      const product = new Product({price: "$1,000.19"});
      product.save((err, new_product) => {
        new_product
          .price
          .should
          .equal(100019);
        Product.findById(new_product.id, (err, product) => {
          product
            .price
            .should
            .equal(100019);
          done();
        });
      });
    });
    it('should be able to store values and adding them together', (done) => {
      const product1 = new Product({price: 103});
      const product2 = new Product({price: 103});
      product1.save((err, product) => {
        product2.save((err, product2) => {
          const sum = product1.price + product2.price;
          sum
            .should
            .equal(206);
          done();
        })
      });
    });
  });
});
