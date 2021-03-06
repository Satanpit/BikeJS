function sync(generator) {
    function wait(verb, argument) {
        let result;

        try {
            result = iterator[verb](argument);
        } catch (e) {
            return Promise.reject(e);
        }

        if (result.done) {
            return result.value;
        } else {
            return Promise.resolve(result.value).then(callback, error);
        }
    }

    var iterator = generator(),
        callback = wait.bind(wait, "next"),
        error = wait.bind(wait, "throw");

    return callback();
}

sync(function* () {
    let data = yield fetch('json/config.json');
    data = yield data.json();
    console.log(data);
});

function async(generatorFunc) {
    return function () {
        var generator = generatorFunc.apply(this, arguments);

        function handle(result) {
            if (result.done) return result.value;

            return Promise.resolve(result.value).then(function (res) {
                return handle(generator.next(res));
            }, function (error) {
                return handle(generator.throw(error));
            });
        }

        try {
            return handle(generator.next());
        } catch (error) {
            return Promise.reject(error);
        }
    };
}

var generalInfo = async(function* () {
    var config = ajax.json('json/config.json'),
        user = ajax.json('json/user.json'),
        audio = ajax.json('json/audio.json');

    return {
        config: yield config,
        user: yield user,
        audio: yield audio
    }
});

sync(function* () {
    try {
        let data = yield generalInfo();

        console.log(data);
    } catch (e) {

    }
});