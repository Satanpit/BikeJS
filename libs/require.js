/**
 * AMD loader
 *
 * @ver 1.0.0
 * @author Alex Hyrenko
 * @email alex.hyrenko@gmail.com
 */

(function (root, doc) {
    "use strict";

    var defaultConfig = {
        baseUrl: '',
        paths: { },
        prefix: '',
        removeScriptTags: false,
        config: { }
    };

    /**
     *  Executes a callback when dependencies are loaded
     *
     * @param {Array|String} dependencies
     * @param {Function} definition
     * @returns {Promise}
     */
    function require(dependencies, definition) {
        var parent = arguments[2];

        if (typeof dependencies === 'string') {
            dependencies = [dependencies];
        }

        return Promise.all(dependencies.map(function (name) {
            return require.getDependencyPromise.call(this, name, parent);
        }, require)).then(function (result) {
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
                name = getScriptName();
            }
        } else {
            if (typeof name === 'function') {
                definition = name;
                dependencies = ['module'];
                name = getScriptName();
            }
        }

        return require(dependencies || [ ], function () {
            require.resolve(name, typeof definition === 'function' ? definition.apply(null, arguments) : definition);
        }, name);
    }

    /**
     * Set require options
     *
     * @param {Object} options
     * @returns {require}
     */
    require.config = function (options) {
        Object.keys(options).forEach(function (param) {
            this.options[param] = options[param];
        }.bind(this));

        return this;
    };

    function getUrl(name, ext) {
        var regExp = /^([http|https]?\/\/)(.*)(\.js)$/,
            path = require.options.paths[name] || require.options.baseUrl,
            prefix, file;

        if (regExp.test(path)) {
            return path;
        }

        prefix = require.options.prefix !== '' ? ('?' + require.options.prefix) : '';
        file = (~path.indexOf('.js') ? '' : name + (ext && '.js') + prefix);

        return path + (path.split('/').pop() !== '' ? '/' : '') + file;
    }

    function getScriptName() {
        return doc.currentScript.src.split('/').pop().replace('.js', '');
    }

    Object.setPrototypeOf(require, Object.create(require.prototype, {
        constructor: { value: require },

        modules: { value: { } },
        resolves: { value: { } },

        localModules: {
            value: {
                module: function (name) {
                    if (this.modules[name]) {
                        return {
                            name: name,
                            config: this.options.config[name] || { }
                        };
                    }
                }
            }
        },

        options: {
            value: defaultConfig
        },

        getDependencyPromise: {
            value: function (name, parent) {
                if (this.localModules[name]) {
                    return this.localModules[name].call(this, parent);
                }

                this.modules[name] = this.modules[name] || new Promise(function (resolve) {
                    this.resolves[name] = resolve;
                    return this.load(name);
                }.bind(this));

                return this.modules[name];
            }
        },

        resolve: {
            value: function (name, value) {
                this.getDependencyPromise(name);
                this.resolves[name](value);
                delete this.resolves[name];
            }
        },

        load: {
            value: function (name) {
                return new Promise(function (resolve, reject) {
                    var element = doc.createElement('script');
                    element.async = true;
                    element.src = getUrl(name, true);
                    element.onerror = reject;
                    element.onload = function() {
                        if (this.options.removeScriptTags) {
                            element.remove();
                        }
                        return resolve;
                    }.bind(this);

                    doc.body.appendChild(element);
                }.bind(this));
            }
        }
    }));

    root.hasModule = function (name) {
        return require.modules.hasOwnProperty(name);
    };

    var data = doc.currentScript.dataset;
    if (data['config'] && data['main']) {
        Promise.all([ require.load(data['config']), require.load(data['main']) ]);
    } else if (data['main']) {
        require.load(data['main']);
    }


    root.require = require;
    root.define = define;

}(window, document));