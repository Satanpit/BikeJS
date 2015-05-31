define(['utils', 'model', 'map'], function (Utils, Model, ObservableMap) {
    'use strict';

    class CollectionModel extends Model {

        constructor(attributes, options) {
            super(attributes, options);
        }

        next() {
            let index = this.collection.index(this.id);
            return this.collection.at(index + 1);
        }

        prev() {
            let index = this.collection.index(this.id);
            return this.collection.at(index - 1);
        }

        clear() {
            this.collection.clear();
            return this;
        }
    }

    const DEFAULT_OPTIONS = {
        idAttribute: 'id',
        model: CollectionModel
    };

    class Collection extends ObservableMap {

        [Symbol.iterator]() {
            return this.values();
        }

        constructor(items, options) {
            super();

            Utils.defineProperties(this, {
                options: Utils.extend(DEFAULT_OPTIONS, options || { }),
                ordered: new Map
            });

            return this.add(items);
        }

        add(items) {
            if (!Utils.isArray(items)) {
                return this;
            }

            items.forEach(function (item, index) {
                item = new this.options.model(item);
                Object.defineProperty(item, 'collection', { writable: true, editable: true, value: this });

                this.set(item.id, item);
                this.ordered.set(index, item.id);
            }.bind(this));

            return this;
        }

        delete(key) {
            this.ordered.delete(this.index(key));
            super.delete(key);
            return this;
        }

        clear() {
            super.clear();
            this.ordered.clear();
            return this;
        }

        where(object) {
            if (!Utils.isObject(object)) {
                return undefined;
            }

            let keys = Object.keys(object),
                matches = [ ];

            this.forEach(function (model) {
                let tmp = 0;
                keys.forEach(function (key) {
                    if (model.get(key) && model.get(key) == object[key]) {
                        tmp++;
                    }
                });

                if (tmp === keys.length) {
                    matches.push(model.toObject());
                }
            });

            if (matches.length) {
                return new Collection(matches);
            }

            return undefined;
        }

        last() {
            return this.get(this.ordered.get(this.ordered.size - 1));
        }

        first() {
            return this.get(this.ordered.get(0));
        }

        at(index) {
            return this.get(this.ordered.get(index));
        }

        index(key) {
            return Array.from(this.ordered.values()).indexOf(key);
        }

        toArray() {
            return Array.from(this.values());
        }
    }

    return Collection
});