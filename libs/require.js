/**
 * AMD loader
 *
 * @ver 1.1.1
 * @author Alex Hyrenko
 * @email alex.hyrenko@gmail.com
 */

(function (root, doc) {
    "use strict";

    const options = {
        baseUrl: '',
        paths: { },
        prefix: '',
        removeScriptTags: false,
        config: { },
        timeout: 10 * 1000
    };

    const delay = { };

    /**
     * DOM ready promise
     */
    const ready = (function () {
        let deferred = Promise.defer();

        if (~['interactive', 'complete'].indexOf(doc.readyState)) {
            deferred.resolve();
            return deferred.promise;
        }

        doc.addEventListener('DOMContentLoaded', deferred.resolve);

        return deferred.promise;
    }());

    /**
     * Utilities to work with path string
     */
    const Path = {

        optimize: function (path) {
            if (!path) {
                return path;
            }

            this.link.href = path;
            return this.link.pathname.replace(/\/*([^\/]+)\/*/g, '/$1');
        },

        toURL: function (name, ext) {
            let regExp = /^([http|https]?\/\/)(.*)(\.js)$/,
                path = this.get(name),
                prefix, file;

            if (regExp.test(path)) {
                return path;
            }

            prefix = require.options.prefix !== '' ? ('?' + require.options.prefix) : '';
            file = (~path.indexOf('.js') ? '' : name + (ext && '.js') + prefix);

            if (name === 'test') {
                console.log(this.join(path, file))
            }

            return this.join(path, file);
        },

        join: function () {
            let args = Array.prototype.splice.call(arguments, 0);

            return this.optimize(args.reduce(function (prev, current) {
                if (!current) {
                    return prev;
                }

                return prev + (prev && '/') + current;
            }));
        },

        get: function (name) {
            return this.join(require.options.baseUrl, require.options.paths[name]);
        },

        ext: function (src) {
            return src.split('.').pop();
        },

        get current() {
            return doc.currentScript.src;
        },

        get toName() {
            let src = this.current.replace(/\.[a-zA-Z]+$/, ''),
                name = src.split('/').pop(),
                path = this.get(name);

            return this.optimize(src).substr(path.length + 1);
        },

        link: doc.createElement('a')
    };

    const registry = {
        modules: { },
        resolves: { },

        localModules: {
            module: function (name) {
                if (this.modules[name]) {
                    return {
                        name: name,
                        config: require.options.config[name] || { }
                    };
                }
            }
        },

        getDependencyPromise: function (name, parent) {
            if (this.localModules[name]) {
                return this.localModules[name].call(this, parent);
            }

            if (!this.modules[name]) {
                this.modules[name] = new Promise(function (resolve, reject) {
                    this.resolves[name] = resolve;

                    delay[name] = setTimeout(function () {
                        reject('Timeout error', name);
                    }, require.options.timeout);

                    return require.loader.load(name);
                }.bind(this));

                this.modules[name].then(clearTimeout.bind(null, delay[name]));
            }

            return this.modules[name]
        },

        resolve: function (name, value) {
            this.getDependencyPromise(name);
            this.resolves[name](value);
            delete this.resolves[name];
        }
    };

    const loader = (function () {

        function defaultLoader(src, resolve, reject) {
            let element = doc.createElement('script');

            element.async   = true;
            element.src     = src;
            element.onerror = reject.bind(this);
            element.onload  = resolve.bind(this);

            doc.body.appendChild(element);
        }

        return {
            loaders: {
                'default': defaultLoader
            },

            load: function (name) {
                let src = Path.toURL(name, true),
                    ext = Path.ext(src),
                    loader = this.loaders[ext] || this.loaders.default;

                return ready.then(function () {
                    return new Promise(function (resolve, reject) {
                        loader.call(this, src, resolve, reject);
                    }.bind(this));
                }.bind(this));
            },

            set: function (ext, loader) {
                if (typeof ext !== 'string' || typeof loader !== 'function') {
                    return false;
                }

                this.loaders[ext] = loader;
                return this;
            }
        }

    }());


    /**
     *  Executes a callback when dependencies are loaded
     *
     * @param {Array|String} dependencies
     * @param {Function} definition
     * @returns {Promise}
     */
    function require(dependencies, definition) {
        let parent = arguments[2];

        if (typeof dependencies === 'string') {
            dependencies = [dependencies];
        }

        return Promise.all(dependencies.map(function (name) {
            return registry.getDependencyPromise.call(this, name, parent);
        }, registry)).then(function (result) {
            if (typeof definition === 'function') {
                definition.apply(this, result);
            }
        });
    }

    /**
     * Defines a module when all dependencies are available
     *
     * @param {String|Array|Function|Object} name|dependencies|definition
     * @param {Array|Function|Object} [dependencies]
     * @param {Function|Object} [definition]
     * @returns {Promise}
     */
    function define(name, dependencies, definition) {
        if (arguments.length > 1) {
            !definition && (definition = dependencies) && (dependencies = [ ]);

            if (typeof name !== 'string') {
                definition = Array.isArray(name) && (dependencies = name) ? definition : name;
                name = Path.toName;
            }
        } else {
            if (typeof name === 'function') {
                definition = name;
                dependencies = ['module'];
                name = Path.toName;
            }
        }

        return require(dependencies || [ ], function () {
            registry.resolve(name, typeof definition === 'function' ? definition.apply(null, arguments) : definition);
        }, name);
    }


    /**
     * Define static methods for require
     */
    Object.defineProperties(require, {
        options: {
            value: options
        },

        loader: {
            value: loader
        },

        config: {
            value: function (options) {
                Object.keys(options).forEach(function (key) {
                    this.options[key] = options[key];
                }, this);

                return this;
            }
        },

        has: {
            value: function (name) {
                return registry.modules.hasOwnProperty(name);
            }
        }
    });

    /**
     * Load main and config scripts
     * with data-attributes
     */
    let data = doc.currentScript.dataset;

    if (data['config'] && data['main']) {
        Promise.all([ loader.load(data['config']), loader.load(data['main']) ]);
    } else if (data['main']) {
        loader.load(data['main']);
    }

    /**
     * Add methods to namespace
     * @namespace window
     */
    root.require = require;
    root.define = define;

}(window, document));