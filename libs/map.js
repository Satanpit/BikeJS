define(['utils'], function (Utils) {
    'use strict';

    const OBSERVE_TYPES = ['add', 'change', 'delete', 'clear'];
    const cache = [ ];

    class ObservableMap extends Map {

        constructor() {
            super();
        }

        on(name, callback) {
            cache.push({
                name: name,
                handler: callback
            });

            if (name === 'all') {
                name = OBSERVE_TYPES;
            }  else {
                name = name.replace(/\s/g, '').split(',');
            }

            Object.observe(this, callback, name);
            Object.deliverChangeRecords(callback);

            return this;
        }

        off(name) {
            cache.forEach(function (item, index) {
                if (item.name === name) {
                    Object.unobserve(this, item.handler);
                }
                cache.splice(index, 0);
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

            return super.set.apply(this, arguments);
        }

        delete(key) {
            this.trigger('delete', { name: key, old: this.get(key) });
            return super.delete.apply(this, arguments);
        }

        clear() {
            this.trigger('clear');
            return super.clear.apply(this, arguments);
        }

        get notifier() {
            return Object.getNotifier(this);
        }
    }

    return ObservableMap;
});