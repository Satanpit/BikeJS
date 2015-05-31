define(['utils', 'map'], function (Utils, ObservableMap) {
   'use strict';

    const defaultOptions = {
        idAttribute: 'id',
        defaults: null
    };


    class Model extends ObservableMap {

        constructor(attributes, options) {
            super();

            Object.defineProperty(this, 'options', {
                writable: true,
                editable: true,
                value: Utils.extend(defaultOptions, options || { })
            });

            if (Utils.isObject(attributes)) {
                Object.keys(attributes).forEach(function (name) {
                    this.set(name, attributes[name]);
                }.bind(this));
            }

            if (this.options.idAttribute && this.has(this.options.idAttribute)) {
                this.id = this.get(this.options.idAttribute);
            }
        }

        toObject() {
            let tmp = { };
            this.forEach(function (value, key) {
                tmp[key] = value;
            });

            return tmp;
        }
    }

    return Model;
});