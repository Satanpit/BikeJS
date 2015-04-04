(function (){
    'use strict';

    var root = this;

    function createDescriptors(properties) {
        var descriptors = { };
        Object.keys(properties).forEach(function(key) {
            descriptors[key] = Object.getOwnPropertyDescriptor(properties, key);
            descriptors[key].enumerable = false;
        });

        return descriptors;
    }

    function toArray(object) {
        return [].slice.call(object);
    }

    function isArray(array) {
        return Array.isArray(array);
    }

    function isObject(object) {
        return typeof object === 'object' ? !isArray(object) : false;
    }

    function isFunction(func) {
        return typeof func === 'function';
    }

    function isString(str) {
        return typeof str === 'string';
    }

    function isElement(element) {
        return element instanceof Element;
    }

    function isElementsList(list) {
        return list instanceof HTMLCollection;
    }

    function each(object, callback) {
        if (!isFunction(callback)) return console.error('Each: callback is not a function');

        if (isObject(object)) {
            for (var key in object) {
                callback(key, object[key]);
            }
        }
        else if (isArray(object)) {
            var i = 0, l = object.length;
            for (; i < l; i++) {
                callback(object[i], i);
            }
        }
        else return console.error('Each: invalid arguments');
    }

    function createElements(elements) {
        var object = Object.create(DOMElements.prototype);
        if (!elements) return object;

        if (isElement(elements)) {
            object.push(elements);
        }
        else elements.forEach(function(item) {
            this.push(item);
        }.bind(object));

        return object;
    }

    /**
     * Add constructor to namespace
     */
    var DOM = root.DOM = function( selector ) {
        return new DOMElements(selector);
    };

    /**
     * Static properties
     */
    DOM.isElement       = isElement;
    DOM.isElementsList  = isElementsList;

    DOM.extend = function(properties) {
        Object.defineProperties(DOMElements.prototype, createDescriptors(properties));
    };

    DOM.ready = function(callback) {
        if (!isFunction(callback)) return false;
        document.addEventListener('DOMContentLoaded', function(e) {
            callback.call({ }, DOM, e);
        }, false);
    };

    /** Events cache */
    DOM.events = [ ];

    /**
     * DOM elements collection
     * @param {string|Element|HTMLCollection} selector
     * @constructor
     */
    function DOMElements( selector ) {
        if (isElement(selector)) { this.push(selector); return; }

        var elements = isElementsList(selector) ? selector : document.querySelectorAll(selector),
            i = 0, l = elements.length;
        for (; i < l; i++) this.push(elements[i]);
    }

    DOMElements.prototype = Object.create(Array.prototype, {
        constructor: {
            value: DOMElements
        }
    });

    /**
     * Base methods
     */
    DOM.extend({
        each: function( callback ) {
            this.forEach(function(item, index) {
                callback.call(item, item, index);
            });

            return this;
        },

        text: function( text ) {
            return text ? this.each(function() {
                this.innerText = text;
            }) : this[0].innerText;
        },

        html: function( html ) {
            return html ? this.each(function(item) {
                item.innerHTML = html;
            }) : this[0].innerHTML;
        },

        val: function( value ) {
            return value ? this.each(function(item) {
                item.value = value;
            }) : this[0].value
        },

        parent: function() {
            return createElements(this[0].parentNode);
        },

        parents: function( selector ) {
            var elem = this[0],
                parents = createElements();

            while((elem = elem.parentNode)) {
                if (elem.nodeType === 1) {
                    if (selector) {
                        if (elem.matches(selector)) { parents.push(elem); break; }
                    } else {
                        parents.push(elem);
                    }
                }
            }

            return parents;
        },

        find: function( selector ) {
            var matches = [ ];

            this.each(function() {
                matches = matches.concat( toArray(this.querySelectorAll(selector)) );
            });

            return createElements(matches);
        },

        eq: function( index ) {
            return isElement(this[index]) ? createElements(this[index]) : null;
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
            return value ? this.each(function() {
                this.setAttribute(key, value);
            }) : this[0].getAttribute(key);
        },

        data: function( key, value ) {
            return value || isObject(key) ? this.each(function(item) {
                isObject(key) && each(key, function(name, val) {
                    item.dataset[name] = val;
                });

                isString(value) && (item.dataset[key] = value);
            }) : this[0].dataset[key];
        },

        remove: function() {
            this.each(function(element) {
                element.parentNode.removeChild(element);
                this.shift();
            }.bind(this));
        }
    });

    /**
     * Methods for elements classes
     */
    DOM.extend({
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
     * Methods for elements styles
     */
    DOM.extend({
        show: function () {
            return this.each(function() {
                this.style.display = 'block';
            });
        },

        hide: function () {
            return this.each(function() {
                this.style.display = 'none';
            });
        },

        css: function( name, value ) {
            return this.each(function() {
                if (isObject(name)) {
                    each(name, function(key, val) {
                        this.style[key] = val;
                    }.bind(this));
                } else {
                    this.style[name] = value;
                }
            });
        }
    });

    /**
     * Help methods
     */
    DOM.extend({
        index: function() {
            return this[0] ? toArray(this[0].parentNode.children).indexOf(this[0]) : -1;
        },

        first: function() {
            if (!isElement(this[0])) return null;
            return createElements(this[0]);
        },

        last: function() {
            if (!isElement(this[this.length - 1])) return null;
            return createElements(this[this.length - 1]);
        }
    });

    /**
     * Events methods
     */
    DOM.extend({
        on: function( name, selector, callback ) {
            var namespace = null;
            isFunction(selector) && (callback = selector) && (selector = null);
            (~name.indexOf('.')) && (name = name.split('.')) && (namespace = name[1]) && (name = name[0]);

            if (selector) {
                var delegateCallback = function(e) {
                    if (e.target === this) return;
                    if (e.target.matches(selector)) {
                        return callback.call(e.target, e);
                    }

                    for (var i = 0, l = e.path.length; i < l; i++) {
                        if (e.path[i].parentNode === this) break;
                        if (e.path[i].matches(selector)) {
                            callback.call(e.path[i], e); break;
                        }
                    }
                }
            }

            return this.each(function() {
                this.addEventListener(name, delegateCallback || callback, false);
                DOM.events.push({
                    name: name,
                    namespace: namespace,
                    node: this,
                    handler: delegateCallback || callback
                });
            });
        },

        off: function( name ) {
            var namespace = null;
            (~name.indexOf('.')) && (name = name.split('.')) && (namespace = name[1]) && (name = name[0]);

            return this.each(function() {
                DOM.events.forEach(function(item, index) {
                    if (item.name === name && item.namespace === namespace && item.node === this) {
                        this.removeEventListener(name, item.handler);
                        DOM.events.splice(index, 1);
                    }
                }.bind(this));
            });
        },

        trigger: function( eventName, detail ) {
            return this.each(function() {
                this.dispatchEvent( new CustomEvent(eventName, { detail: detail }) );
            });
        }
    });

    root.ajax = function( options ) {
        return new Promise(function(resolve, reject) {
            var request = new XMLHttpRequest();
            request.open(options.method || 'POST', options.url, options.async || true);
            request.responseType = options.type || '';
            request.addEventListener('load', function(response) {
                resolve(response.target.response, response);
            }, false);
            request.addEventListener('progress', options.progress || null, false);
            request.addEventListener('error', reject);
            request.addEventListener('abort', reject);
            request.send(options.data || null)
        });
    };

    root.post = function( url, data ) {
        return root.ajax({ url: url, data: data });
    };

    root.get = function( url ) {
        return root.ajax({ method: 'GET', url: url });
    };

}.call(window.app || (window.app = Object.create(null))));