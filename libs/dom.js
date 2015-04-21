/**
 * Module for working with DOM
 *
 * @ver 1.0.0
 * @author Alex Hyrenko
 * @email alex.hyrenko@gmail.com
 */

define(['utils'], function (utils) {
    "use strict";

    function extend(properties) {
        return utils.setObjectPrototype(DOMElements.prototype, properties);
    }

    function ready(callback) {
        if (!utils.isFunction(callback)) {
            return console.error('DOM: callback is not a function');
        }

        if (~['interactive', 'complete'].indexOf(document.readyState)) {
            callback.call(this, document);
        } else {
            document.addEventListener('DOMContentLoaded', callback.bind(this, document));
        }
    }

    function setPrototypeOf(array) {
        return Object.setPrototypeOf(array, DOMElements.prototype);
    }

    /**
     * DOM elements collection
     * @param {String|Element|HTMLCollection} selector
     * @constructor
     */
    function DOMElements(selector) {
        let elements = [ ];

        if (utils.isElement(selector)) {
            this.push(selector);
            return this;
        }

        if (utils.isElementsList(selector)) {
            elements = selector;
        } else if (utils.isString(selector)) {
            elements = document.querySelectorAll(selector);
        } else {
            return console.error('DOM: invalid selector');
        }

        utils.toArray(elements).forEach(function (item) {
            this.push(item);
        }.bind(this));
    }

    DOMElements.prototype = Object.create(Array.prototype, {
        constructor: {
            value: DOMElements
        }
    });

    var root = function (selector) {
        return new DOMElements(selector);
    };

    /** Events cache */
    root.events = [ ];

    /** Static methods */
    root.extend = extend;
    root.ready = ready;

    /**
     * Base methods
     */
    root.extend({
        each: function (callback) {
            this.forEach(function (item, index) {
                callback.call(item, item, index);
            });

            return this;
        },

        find: function (selector) {
            var matches = [ ];
            this.each(function() {
                matches = matches.concat( utils.toArray(this.querySelectorAll(selector)) );
            });

            return setPrototypeOf(matches);
        },

        text: function( text ) {
            if (utils.isString(text)) {
                return this.each(function () {
                    this.textContent = text;
                });
            } else {
                return this[0].textContent;
            }
        },

        html: function( html ) {
            if (utils.isString(text)) {
                return this.each(function () {
                    this.innerHTML = html;
                });
            } else {
                return this[0].innerHTML;
            }
        },

        val: function( value ) {
            if (utils.isString(value)) {
                return this.each(function () {
                    if (!utils.isUndefined(this.value)) {
                        this.value = value;
                    }
                });
            } else {
                return this[0].value;
            }
        },

        parent: function() {
            return setPrototypeOf(this[0].parentElement);
        },

        parents: function( selector ) {
            var elem = this[0],
                parents = setPrototypeOf([ ]);

            while((elem = elem.parentElement)) {
                if (selector) {
                    if (elem.matches(selector)) { parents.push(elem); break; }
                } else {
                    parents.push(elem);
                }
            }

            return parents;
        },

        eq: function( index ) {
            return utils.isElement(this[index]) ? setPrototypeOf(this[index]) : null;
        },

        append: function( html ) {
            return this.each(function() {
                this.insertAdjacentHTML('beforeend', html);
            });
        },

        after: function( html ) {
            return this.each(function() {
                this.insertAdjacentHTML('afterend', html);
            });
        },

        prepend: function( html ) {
            return this.each(function() {
                this.insertAdjacentHTML('afterbegin', html);
            });
        },

        before: function( html ) {
            return this.each(function() {
                this.insertAdjacentHTML('beforebegin', html);
            });
        },

        attr: function( key, value ) {
            if (utils.isString(value)) {
                return this.each(function () {
                    this.setAttribute(key, value);
                });
            } else {
                return this[0].getAttribute(key);
            }
        },

        data: function( key, value ) {
            if (utils.isString(value) || utils.isObject(key)) {
                return this.each(function (item) {
                    utils.isObject(key) && utils.each(key, function(name, val) {
                        item.dataset[name] = val
                    });

                    if (utils.isString(value)) {
                        item.dataset[key] = value;
                    }
                });
            } else {
                return this[0].dataset[key];
            }
        },

        remove: function() {
            this.each(function(item) {
                item.remove();
            });

            this.length = 0;
            return this;
        }
    });

    /**
     * Methods for elements classes
     */
    root.extend({
        hasClass: function( name ) {
            return this[0].classList.contains(name);
        },

        addClass: function( name ) {
            return this.each(function() {
                this.classList.add(name);
            });
        },

        removeClass: function( name ) {
            return this.each(function() {
                this.classList.remove(name);
            });
        },

        toggleClass: function( name ) {
            return this.each(function() {
                this.classList.toggle(name);
            });
        }
    });

    /**
     * Help methods
     */
    root.extend({
        index: function() {
            return this[0] ? utils.toArray(this[0].parentElement.children).indexOf(this[0]) : -1;
        },

        first: function() {
            if (!utils.isElement(this[0])) {
                return null;
            }

            return setPrototypeOf(this[0]);
        },

        last: function() {
            if (!utils.isElement(this[this.length - 1])) {
                return null;
            }

            return setPrototypeOf(this[this.length - 1]);
        }
    });

    root.extend({
        on: function (name, selector, callback) {
            var namespace = null;
            utils.isFunction(selector) && (callback = selector) && (selector = null);
            (~name.indexOf('.')) && (name = name.split('.')) && (namespace = name[1]) && (name = name[0]);

            if (selector) {
                var delegateCallback = function (e) {
                    if (e.target === this) {
                        return;
                    }

                    if (e.target.matches(selector)) {
                        return callback.call(e.target, e);
                    }

                    for (var i = 0, l = e.path.length; i < l; i++) {
                        if (e.path[i].parentElement === this) {
                            break;
                        }

                        if (e.path[i].matches(selector)) {
                            callback.call(e.path[i], e);
                            break;
                        }
                    }
                }
            }

            return this.each(function() {
                this.addEventListener(name, delegateCallback || callback, false);
                root.events.push({
                    name: name,
                    namespace: namespace,
                    node: this,
                    handler: delegateCallback || callback
                });
            });
        },

        off: function (name) {
            var namespace = null;
            (~name.indexOf('.')) && (name = name.split('.')) && (namespace = name[1]) && (name = name[0]);

            return this.each(function () {
                root.events.forEach(function (item, index) {
                    if (item.name === name && (namespace ? item.namespace === namespace : 1) && item.node === this) {
                        this.removeEventListener(name, item.handler);
                        root.events.splice(index, 1);
                    }
                }.bind(this));
            });
        },

        trigger: function (name, detail) {
            return this.each(function () {
                this.dispatchEvent( new CustomEvent(name, { detail: detail }) );
            });
        }
    });

    return root;
});