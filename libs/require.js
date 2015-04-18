/**
 * AMD loader
 *
 * @ver 1.0.0
 * @author Alex Hyrenko
 * @email alex.hyrenko@gmail.com
 */

(function( root ) {
    "use strict";

    /**
     * @type {{baseUrl: string, paths: Object, prefix: string}}
     */
    var defaultConfig = {
        baseUrl: '',
        paths: { },
        prefix: ''
    };

    /**
     *  Executes a callback when dependencies are loaded
     *
     * @param {Array} dependencies
     * @param {Function} definition
     * @returns {Promise}
     */
    function require( dependencies, definition ) {
        return Promise.all( dependencies.map(require.getDependencyPromise, require) ).then(function( result ) {
            definition.apply(this, result);
        });
    }

    /**
     * Defines a module when all dependencies are available
     *
     * @param {String|Array|Function} name
     * @param {Array|Function} [dependencies]
     * @param {Function} [definition]
     * @returns {Promise}
     */
    function define( name, dependencies, definition ) {
        !definition && (definition = dependencies) && (dependencies = [ ]);

        if (typeof name === 'function' || Array.isArray(name)) {
            definition = Array.isArray(name) && (dependencies = name) ? definition : name;
            name = getScriptName();
        }

        return require(dependencies || [ ], function() {
            require.resolve(name, typeof definition === 'function' ? definition.apply(this, arguments) : definition);
        });
    }

    /**
     * Set require options
     *
     * @param {Object} options
     * @returns {require}
     */
    require.config = function( options ) {
        Object.keys(options).forEach(function( param ) {
            this.options[param] = options[param];
        }.bind(this));

        return this;
    };

    function getUrl( name, ext ) {
        var regExp = /^([http|https]?\/\/)(.*)(\.js)$/,
            path = require.options.paths[name] || require.options.baseUrl,
            prefix, file;

        if (regExp.test(path)) return path;

        prefix = require.options.prefix != '' ? ('?' + require.options.prefix) : '';
        file = (~path.indexOf('.js') ? '' : name + (ext && '.js') + prefix);

        return path + (path.split('/').pop() !== '' ? '/' : '') + file;
    }

    function getScriptName() {
        return document.currentScript.src.split('/').pop().replace('.js', '');
    }

    Object.setPrototypeOf(require, Object.create(Function.prototype, {
        constructor: { value: require },

        modules: { value: { } },
        resolves: { value: { } },

        options: {
            value: defaultConfig
        },

        getDependencyPromise: {
            value: function( name ) {
                this.modules[name] = this.modules[name] || new Promise(function( resolve ) {
                    this.resolves[name] = resolve;
                    return this.load(name);
                }.bind(this));

                return this.modules[name];
            }
        },

        resolve: {
            value: function( name, value ) {
                this.getDependencyPromise(name);
                this.resolves[name](value);
                delete this.resolves[name];
            }
        },

        load: {
            value: function( name ) {
                return new Promise(function( resolve, reject ) {
                    var element = document.createElement('script');
                    element.async = true;
                    element.src = getUrl(name, true);
                    element.onerror = reject;
                    element.onload = resolve;

                    document.body.appendChild(element);
                }.bind(this));
            }
        }
    }));

    root.require = require;
    root.define = define;

}(window));