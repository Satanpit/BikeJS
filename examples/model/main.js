(function() {
    "use strict";

    require.config({
        baseUrl: '../../libs',
        removeScriptTags: true
    });

    require(['ajax', 'model', 'collection'], function (Ajax, Model, Collection) {

        Ajax.async(function*() {
            let audio = yield Ajax('../ajax/json/audio.json').json(),
                config = yield Ajax('../ajax/json/config.json').json();

            let collection = new Collection(audio.response.items);
            let Conf = new Model(config);

            Conf.on('all', function (changes) {
                console.dir(changes);
            });

            Conf.on('change', function (changes) {
                console.log('change', changes);
            });

            Conf.set('test', 1);
            Conf.set('test', 2);

            console.dir(Conf);
        });
    });
}());