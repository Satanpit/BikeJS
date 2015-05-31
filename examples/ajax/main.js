(function() {
    "use strict";

    require.config({
        baseUrl: '../../libs',
        removeScriptTags: true,

        config: {
            ajax: {
                method: 'POST',
                baseUrl: '',
                cache: false,
                timeout: 10 * 1000,
                paramDefaults: null
            }
        }
    });

    require(['ajax', 'utils'], function (Ajax) {
        let config = Ajax('json/config.json').json();
        let index = Ajax('index.html').params({time: new Date().getTime()}).html();

        config.then(console.dir.bind(console)).then(null, console.warn.bind(console));
        index.then(console.dir.bind(console)).then(null, console.warn.bind(console));
    });
}());