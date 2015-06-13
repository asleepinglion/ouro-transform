"use strict";

var Base = require('ouro-base');
var Ouro = require('ouro');
var Promise = require('bluebird');
var _ = require('underscore');

module.exports = Base.extend(Ouro.Meta, {

  _metaFile: function() {
    this._loadMeta(__filename);
  },

  //setup transforms for the given property by creating an array of closures
  //which contain promises to transform
  setup: function(transforms, context, propertyName) {

    //maintain reference to instance
    var self = this;

    //maintain list of closures
    var list = [];

    //loop through transorms
    for( var transform in transforms ) {

      var options = transforms[transform];

      list.push(function() {
        //console.log(':: executing transform:', JSON.stringify({property: propertyName, transform: transform}));
        return self[transform](context, propertyName, options);
      });

    }

    return list;
  },

  process: function(list) {

    //maintain list of promises for all parameters of this request
    var transforms = [];

    //execute each closure and append each promise to the array
    for( var closure in list ) {
      transforms.push(list[closure]());
    }

    //settle all validations and resolve with any exceptions
    return Promise.all(transforms);
  },

  object: function(context, propertyName) {

    return new Promise(function(resolve,reject) {

      //attempt to capture the parameter value
      var value = context[propertyName];

      if (typeof value !== 'undefined' ) {

        //attempt to convert parameter clause to object if its a string
        if( typeof value === 'string' ) {
          try {
            value = JSON.parse(value);
          } catch (e) {
            return reject(new Ouro.Error('transform_error', 'The ' + propertyName + ' parameter could not be transformed into an object.', {status: 422}));
          }
        } else if( typeof value !== 'object' ) {
          return reject(new Ouro.Error('transform_error', 'The ' + propertyName + ' parameter could not be transformed into an object.', {status: 422}));
        }

        //set the new value on the context
        context[propertyName] = value;
      }

      resolve();

    });
  },

  boolean: function(context, propertyName) {

    return new Promise(function(resolve,reject) {


      //attempt to capture the parameter's value
      var property = context[propertyName];

      if( typeof property === 'boolean' ) {

        //do nothing if boolean

      } else if( typeof property === 'string' ) {

        if( property === '1' || property === 'true' ) {
          context[propertyName] = true;
        } else {
          context[propertyName] = false;
        }

      } else if( typeof property === 'number' ) {
        if( property === 1 ) {
          context[propertyName] = true;
        } else {
          context[propertyName] = false;
        }

      } else {
        context[propertyName] = false;
      }

      resolve();

    });
  }

});
