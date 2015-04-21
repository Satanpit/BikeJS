define(['utils'], function(Utils) {
    "use strict";

    function Class(definition) {

    }

    /*Utils.defineProperties(Class.prototype, {
        name: 'Test'
    });*/

    Utils.defineProperties(Class, {
        /**
         * Creates parent prototype, current prototype on after this
         * @param {Object} properties
         */
        extend: function (properties) {

        },

        /**
         * Create class instance in current prototype
         * @param {Object} properties
         */
        implement: function (properties) {

        },

        /**
         * Add mixin prototypes of the class to current prototype
         * not replace current
         * @param {Object} properties
         */
        include: function (properties) {

        }
    });

    return Class;
});