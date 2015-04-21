(function() {
    "use strict";

    require.config({
        baseUrl: '../../libs',
        removeScriptTags: true,

        config: {
            ajax: {
                method: 'POST',
                baseUrl: ''
            }
        }
    });

    require(['ajax'], function (ajax) {
        console.dir(ajax);
    });
}());