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

  json: function(context, propertyName) {

    return new Promise(function(resolve,reject) {

      //attempt to capture the where parameter from the
      var param = context[propertyName];

      if (param) {

        //attempt to convert where clause to object if its a string
        if (_.isString(param)) {
          try {
            param = JSON.parse(param);
          } catch (e) {
            //reject(new SuperJS.Error('transform_error', 422, 'The ' + propertyName + ' parameter provided was not valid JSON.'));
          }
        }

        context[propertyName] = param;
      }

      resolve();

    });
  }

});
