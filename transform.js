/**
 * Transforms can be enabled for model attributes or controller action parameters.
 *
 * @exports Transform
 * @namespace SuperJS.Validator
 * @extends SuperJS.Class
 */

"use strict";

var SuperJS = require('superjs');
var Promise = require('bluebird');
var _ = require('underscore');

module.exports = SuperJS.Class.extend({

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
        console.log(':: executing transform:', JSON.stringify({property: propertyName, transform: transform}));
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

      //attempt to capture the where parameter from the
      var value = context[propertyName];

      if (typeof value !== 'undefined' ) {

        //attempt to convert parameter clause to object if its a string
        if( typeof value === 'string' ) {
          try {
            value = JSON.parse(value);
          } catch (e) {
            return reject(new SuperJS.Error('transform_error', 422, 'The ' + propertyName + ' parameter could not be transformed into an object.'));
          }
        } else if( !typeof value === 'object' ) {
          return reject(new SuperJS.Error('transform_error', 422, 'The ' + propertyName + ' parameter could not be transformed into an object.'));
        }

        //set the new value on the context
        context[propertyName] = value;
      }

      resolve();

    });
  },

  boolean: function(context, propertyName) {

    return new Promise(function(resolve,reject) {


      //attempt to capture the where parameter from the
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
