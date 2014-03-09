/*global jQuery, tinycolor, _ */
(function ($, document, window, tinycolor, _) {
    'use strict';
    $(function () { // document ready
        var paused = false,
            config = {
                'colors': {
                    'hue': [
                        { 'range': [ 1, 50 ], 'probability': 0.83 },
                        { 'range': [ 210, 231 ], 'probability': 0.17 }
                    ],
                    'saturation': [
                        { 'range': [ 0.05, 0.43 ], 'probability': 0.46 },
                        { 'range': [ 0.44, 0.72 ], 'probability': 0.54 }
                    ],
                    'lightness': [
                        { 'range': [ 0.12, 0.24 ], 'probability': 0.08 },
                        { 'range': [ 0.25, 0.53 ], 'probability': 0.92 }
                    ]
                },
                'labels': {
                    'on': true,
                    'format': 'hex'
                },
                'square_size': 'large',
                'animation': {
                    'delay': 10,
                    'duration': [ { 'range': [ 200, 600 ], 'probability': 1 } ]
                }
            };
        function randomExec(probabilities, functions) {
            // source: http://stackoverflow.com/a/3983830
            var i,
                sum = 0,
                ar = [],
                r = Math.random();
            for (i = 0; i < probabilities.length - 1; i += 1) {
                sum += probabilities[i];
                ar[i] = sum;
            }
            for (i = 0; i < ar.length && r >= ar[i]; i += 1) ;
            return (functions[i])();
        }
        function getRandomValue(rangeConfig) {
            var i,
                probabilities = [ ],
                functions = [ ],
                makeRange = function (range) {
                    return function () {
                        var value = Math.random() * (range[1] - range[0]);
                        if (parseInt(range[0] + range[1], 10)) {
                            value = Math.floor(value);
                        }
                        return value + range[0];
                    };
                };
            for (i = 0; i < rangeConfig.length; i += 1) {
                probabilities.push(rangeConfig[i].probability);
                functions.push(makeRange(rangeConfig[i].range));
            }
            return randomExec(probabilities, functions);
        }
        function createSquare() {
            return $('<div class="square">').addClass(config.square_size);
        }
        function randomColor() {
            return tinycolor({
                'h': getRandomValue(config.colors.hue),
                's': getRandomValue(config.colors.saturation),
                'l': getRandomValue(config.colors.lightness)
            });
        }
        function render(callback) {
            var square = createSquare().hide().appendTo('body'),
                squareSize = square.outerWidth(true),
                items = Math.floor($('body').width() / squareSize)
                    * Math.floor($('body').height() / squareSize);
            square.remove();
            _.times(items, function (i) {
                var color = randomColor(),
                    label = config.labels.on === true ?
                            color.toString(config.labels.format)
                        : '',
                    clearOnLast = function () {
                        if (i === items - 1) {
                            setTimeout(
                                function () {
                                    if (paused === false) {
                                        callback();
                                    }
                                },
                                3000
                            );
                        }
                    };
                createSquare().hide().appendTo('div.container')
                    .html(label)
                    .css({ 'background': color.toString('hex') })
                    .delay(config.animation.delay * i).fadeIn(
                        getRandomValue(config.animation.duration),
                        clearOnLast
                    );
            });
        }
        function clear() {
            var reRender = function (i) {
                return function () {
                    if (i === $('div.square').size() - 1) {
                        $('div.container').empty();
                        render(clear);
                    }
                };
            };
            $('div.square').each(
                function (i) {
                    $(this).delay(config.animation.delay * i).fadeTo(
                        getRandomValue(config.animation.duration),
                        0,
                        reRender(i)
                    );
                }
            );
        }
        document.onkeydown = function (e) {
            e = e || window.event;
            if (e.keyCode === 32) {
                if (paused === true) {
                    clear();
                }
                paused = !paused;
            }
        };
        render(clear);
    });
}(jQuery, document, window, tinycolor, _));
