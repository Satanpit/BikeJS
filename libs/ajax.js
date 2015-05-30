define(['utils', 'module'], function (Utils, module) {
    'use strict';

    const TIMEOUT_ERROR = 'Load timeout for resource:';

    function async(generator) {
        function wait(verb, argument) {
            let result;

            try {
                result = iterator[verb](argument);
            } catch (e) {
                return Promise.reject(e);
            }

            if (result.done) {
                return result.value;
            } else {
                return Promise.resolve(result.value).then(callback, error);
            }
        }

        var iterator = generator(),
            callback = wait.bind(wait, "next"),
            error = wait.bind(wait, "throw");

        return callback();
    }

    function status(code) {
        return Promise[(code >= 200 && code < 300) ? 'resolve' : 'reject'](code);
    }

    function timeout(promise, time) {
        var delay = new Promise(function (resolve) {
            setTimeout(resolve, time);
        });

        Promise.race([promise, delay]).catch(function () { });

        return delay;
    }

    /**
     * Create ajax request
     *
     * @param {String} url
     * @param {Object} config
     * @returns {Ajax}
     * @constructor
     */
    function Ajax(url, config) {
        if (!(this instanceof Ajax)) {
            return new Ajax(url, config);
        }

        var deferred = Promise.defer();

        Utils.defineProperties(this, {
            then: function () {
                this.send();
                return deferred.promise.then.apply(deferred.promise, arguments);
            },
            chain: deferred.promise.chain.bind(deferred.promise),
            catch: deferred.promise.catch.bind(deferred.promise),
            resolve: deferred.resolve,
            reject: deferred.reject
        });

        this.url = url;
        this.config = { };

        this.setConfig(config);
    }

    /**
     * Default static methods
     */
    Utils.defineProperties(Ajax, {
        config: {
            method: 'GET',
            baseUrl: '',
            timeout: 10*1000,
            cache: false
        },

        headers: {
            common: { 'Accept': 'application/json, text/plain, * / *' },

            get:    { 'Accept': 'application/json, text/plain, * / *' },
            post:   { 'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8' },
            put:    { 'Content-Type': 'application/json' },
            json:   { 'Accept': 'application/json', 'Content-Type': 'application/json;charset=utf-8' },
            xml:    { 'Content-Type': 'application/xml' }
        },

        async: async
    });

    /**
     * Request methods
     */
    Utils.defineProperties(Ajax.prototype, {

        /**
         * @param {Object} params
         * @returns {Ajax}
         */
        get: function (params) {
            this.params(params);
            return this.send('GET');
        },

        /**
         * @param {Object} data
         * @returns {Ajax}
         */
        post: function (data) {
            this.data(data);
            return this.send('POST');
        },

        /**
         * @param {Object} data
         * @returns {Ajax}
         */
        put: function (data) {
            this.data(data);
            return this.send('PUT');
        },

        /**
         * @param {Object} data
         * @returns {Ajax}
         */
        patch: function (data) {
            this.data(data);
            return this.send('PATCH');
        },

        /**
         * @param {Object} data
         * @returns {Ajax}
         */
        update: function (data) {
            this.data(data);
            return this.send('UPDATE');
        },

        /**
         * @param {Object} params
         * @returns {Ajax}
         */
        'delete': function (params) {
            this.params(params);
            return this.send('DELETE');
        },

        /**
         * @param {Object} params
         * @returns {Ajax}
         */
        head: function(params) {
            this.params(params);
            return this.send('HEAD');
        },

        /**
         * Set body to POST, PUT etc. request
         * @param {Object} object
         * @returns {Ajax}
         */
        data: function (object) {
            if (Utils.isObject(object)) {
                this.body = Utils.serialize(object);
            }

            return this;
        },

        /**
         * Set url params to GET, HEAD etc. request
         * @param {Object} params
         * @returns {Ajax}
         */
        params: function (params) {
            this.url = [this.url, Utils.serialize(params)].join( (~this.url.indexOf('?')) ? '&' : '?' );
            return this;
        },

        /**
         * Appoint a request method
         * @param {String} method
         * @returns {Ajax}
         */
        method: function (method) {
            if (Utils.isString(method)) {
                this.config.method = method;
            }
            return this;
        },

        /**
         * Create and send request
         * @param {String} method
         * @returns {Ajax}
         */
        send: function (method) {
            if (this.request) {
                return this;
            }

            method = (this.config.method = method  || this.config.method).toLowerCase();

            this.request = {
                method: method,
                headers: new Headers(this.config.headers || Ajax.headers[method] || Ajax.headers.common)
            };

            if (this.body) {
                if (method !== 'get') {
                    this.request.bodyUsed = true;
                    this.request.body = this.body;
                }
            }

            timeout(this, this.config.timeout).then(this.reject.bind(null, new Error( TIMEOUT_ERROR + `${this.url}` )));

            this.response = fetch(this.url, this.request).then(function (response) {
                status(response.status).then(this.resolve.bind(null, response), this.reject.bind(null, response));
            }.bind(this), this.reject);

            return this;
        },

        /**
         * Set your request configurations
         * @param {Object} config
         * @returns {Ajax}
         */
        setConfig: function (config) {
            Utils.extend(this.config, module.config, Ajax.config, config || { });
            return this;
        },

        /**
         * Set your request headers
         * @param {Object|String} headers
         * @returns {Ajax}
         */
        setHeaders: function (headers) {
            if (Utils.isString(headers) && Utils.isObject(Ajax.headers[headers])) {
                this.config.headers = Ajax.headers[headers];
            } else if (Utils.isObject(headers)) {
                this.config.headers = headers;
            }

            return this;
        }
    });

    /**
     * Request promise additional methods
     */
    Object.setPrototypeOf(Ajax.prototype, Utils.defineProperties({

        json: function () {
            this.setHeaders('json');

            return this.then(function (response) {
                return response.json();
            })
        },

        text: function () {
            return this.then(function (response) {
                return response.text();
            })
        },

        blob: function () {
            return this.then(function (response) {
                return response.blob();
            })
        },

        arrayBuffer: function () {
            return this.then(function (response) {
                return response.arrayBuffer();
            })
        },

        doc: function (type) {
            return this.then(function (response) {
                return response.text().then(function (text) {
                    try {
                        var doc = (new DOMParser()).parseFromString(text, type || response.headers.get('content-type'));
                        return Promise.resolve(doc);
                    } catch(e) {
                        return Promise.reject(e);
                    }
                });
            })
        },

        html: function () {
            return this.doc('text/html');
        },

        xml: function () {
            this.setHeaders('xml');
            return this.doc('text/xml');
        },

        headers: function (name) {
            return this.then(function (response) {
                if (Utils.isString(name)) {
                    if (response.headers.has(name)) {
                        return Promise.resolve(response.headers.get(name));
                    } else {
                        return Promise.reject();
                    }
                } else {
                    var headers = { };
                    response.headers.forEach(function (value, name) {
                        headers[name] = value;
                    });

                    return Promise.resolve(headers);
                }
            })
        },

        status: function () {
            return this.then(function (response) {
                return status(response.status);
            });
        }
    }));

    return Ajax;
});