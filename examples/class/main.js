(function() {
    "use strict";

    require.config({
        baseUrl: '../../libs',
        removeScriptTags: true
    });

    require(['class'], function (Class) {

        var TestClass = Class({

            initialize: function (attributes) {

            },

            myMethod: function () {

            }
        });

        console.dir(new TestClass);
        console.dir(Class);

        console.log(new Class instanceof Class);
    });
}());