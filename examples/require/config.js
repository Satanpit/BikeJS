(function () {
    "use strict";

    require.config({
        baseUrl: '../../libs',
        removeScriptTags: true,

        config: {
            ajax: {
                type: 'GET',
                url: '//my.api.com/'
            }
        }
    });
}());