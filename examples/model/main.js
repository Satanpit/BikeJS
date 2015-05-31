(function() {
    "use strict";

    require.config({
        baseUrl: '../../libs',
        removeScriptTags: true
    });

    require(['ajax', 'model', 'collection'], function (Ajax, Model, Collection) {

        class TracksCollection extends Collection {

            fetch() {
                Ajax('../ajax/json/audio.json').json().then(function (data) {
                    this.add(data.response.items);
                    this.trigger('load');
                }.bind(this));

                return this;
            }

            get observeTypes() {
                return super.observeTypes.concat(['load']);
            }
        }

        let tracks = new TracksCollection().fetch();

        tracks.on('load', function () {
            console.dir(tracks);
        });

        Ajax('index.html').post({test: 1});

        /*Ajax.async(function*() {
            let audio = yield Ajax('../ajax/json/audio.json').json(),
                config = yield Ajax('../ajax/json/config.json').json();
        });*/
    });
}());