"use strict";

var UserModel = {
    id: 666,
    firstName: 'John',
    lastName: 'Doe',
    birthDate: '17 jan 1988'
};

document.registerElement('data-model', {
    prototype: Object.create(HTMLElement.prototype, {
        model: {
            value: UserModel
        },

        createdCallback: {
            value: function() {
                this.template = document.querySelector('#data-model');

                var users = new Map();

                var regExp = /(?:\{{2})\s*([\w\-\.]+)\s*(?:\}{2})/ig;

                Object.observe(this.model, function (changes) {
                    changes.forEach(function (data) {
                        if (~[ 'add', 'update'].indexOf(data.type) && users.has(data.name)) {
                            users.get(data.name).textContent = data.object[data.name];
                        }
                    })
                });

                [].forEach.call(this.childNodes, function (item) {
                    if (~item.textContent.indexOf('{{')) {
                        item.textContent = item.textContent.replace(regExp, function(tpl, name) {
                            users.set(name, item);
                            return (this.model[name] || "");
                        }.bind(this));
                    }
                }.bind(this));

                this.createShadowRoot().appendChild(this.template.content.cloneNode(true));
            }
        }
    })
});

UserModel.test = "Xss";