(function() {
    "use strict";

    require.config({
        baseUrl: '../../libs',
        removeScriptTags: true
    });

    require(['ajax', 'utils'], function (Ajax) {

        Ajax.async(function*() {
            let config = yield Ajax('json/config.json').json();

            console.log(config);
        });
    });
}());