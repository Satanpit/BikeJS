define(function () {
    "use strict";

    function delay(time) {
        return new Promise(function (resolve) {
            setTimeout(resolve, time);
        });
    }

    function timeout(promise, time) {
        return Promise.race([promise, delay(time).then(function () {
            throw new Error('Operation timed out');
        })]);
    }

    function promise(executor) {
        return new Promise(executor);
    }

    promise.delay = delay;
    promise.timeout = timeout;

    return promise;
});