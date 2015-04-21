/**
 * Utils module
 */

define(function () {
    "use strict";

    return {
        isString: function (string) {
            return typeof string === 'string';
        },

        isNumber: function (number) {
            return (typeof number === 'number') && (number).toString() !== 'NaN';
        },

        isNull: function (property) {
            return property === null;
        },

        isArray: Array.isArray,

        isObject: function (object) {
            return typeof object === 'object' ? !this.isArray(object) : false;
        },

        isFunction: function (func) {
            return typeof func === 'function';
        },

        isElement: function (element) {
            return element instanceof Element;
        },

        isElementsList: function (list) {
            return list instanceof HTMLCollection;
        },

        isUndefined: function (param) {
            return typeof param === 'undefined';
        },

        clone: function (target) {
            if (this.isArray(target)) {
                return this.ofArray.apply(this, arguments);
            }

            if (this.isNull(target) || this.isUndefined(target)) {
                throw new TypeError('Cannot convert first argument to object');
            }

            var to = Object(target);

            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource === undefined || nextSource === null) {
                    continue;
                }
                nextSource = Object(nextSource);

                var keysArray = Object.keys(Object(nextSource));
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }

            return to;
        },

        ofArray: function() {
            return Array.prototype.slice.call(arguments);
        },

        each: function (items, callback) {
            if (!this.isFunction(callback)) {
                return console.error('Each: callback is not a function');
            }

            if (this.isObject(items)) {
                for (var key in items) {
                    if (items.hasOwnProperty(key)) {
                        callback(key, items[key]);
                    }
                }
            } else if (this.isArray(items)) {
                var i = 0, l = items.length;
                for (; i < l; i++) {
                    callback(items[i], i);
                }
            } else {
                return console.error('Each: invalid arguments');
            }
        },

        setPropertyDescriptors: function (properties, enumerable) {
            var descriptors = { };

            Object.keys(properties).forEach(function(key) {
                descriptors[key] = Object.getOwnPropertyDescriptor(properties, key);
                (!enumerable) && (descriptors[key].enumerable =  false);
            });

            return descriptors;
        },

        defineProperties: function (object, properties) {
            return Object.defineProperties(object, this.setPropertyDescriptors(properties));
        },

        setObjectPrototype: function (properties, prototype) {
            return Object.create(Object.defineProperties({ }, this.setPropertyDescriptors(prototype)) || null, this.setPropertyDescriptors(properties))
        },

        extend: function (target) {
            Array.prototype.forEach.call(arguments, function(src) {
                if (target === src) return false;

                Object.defineProperties(target, this.setPropertyDescriptors(src, true))
            }.bind(this));

            return target;
        },

        toArray: function (object) {
            return [].slice.call(object);
        }
    };
});