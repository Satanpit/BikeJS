(function() {
    "use strict";

    require.config({
        baseUrl: '../../libs',
        removeScriptTags: true
    });

    require(['class'], function (Class) {

        var TestClass = new Class({

            initialize: function (attributes) {

            },

            myMethod: function () {

            }
        });

        console.dir(Class);

        console.dir(TestClass);
    });
}());