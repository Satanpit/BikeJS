define(['utils'], function (Utils) {
    'use strict';

    const CACHE = [ ];

    class ObservableMap extends Map {
        constructor() {
            super();
        }

        on(name, callback) {
            CACHE.push({
                name: name,
                handler: callback
            });

            if (name === 'all') {
                name = this.observeTypes;
            }  else {
                name = name.replace(/\s/g, '').split(',');
            }

            Object.observe(this, callback, name);
            Object.deliverChangeRecords(callback);

            return this;
        }

        off(name) {
            CACHE.forEach(function (item, index) {
                if (item.name === name) {
                    Object.unobserve(this, item.handler);
                }
                CACHE.splice(index, 0);
            }.bind(this));
        }

        trigger(type, data) {
            data = data || { };
            data.type = type;
            this.notifier.notify(data);
        }

        set(key, value) {
            if (this.has(key)) {
                let data = {
                    name: key,
                    value: value,
                    oldValue: this.get(key)
                };

                this.trigger('change', data);
                this.trigger('change:' + key, data);
            } else {
                this.trigger('add', { name: key, value: value });
            }

            return super.set(key, value);
        }

        delete(key) {
            this.trigger('delete', { name: key, value: this.get(key) });
            return super.delete(key);
        }

        clear() {
            this.trigger('clear');
            return super.clear();
        }

        get notifier() {
            return Object.getNotifier(this);
        }

        get observeTypes() {
            return ['add', 'change', 'delete', 'clear'];
        }
    }

    return ObservableMap;
});