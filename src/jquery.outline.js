/*!
 * jQuery.outline %BUILD_VERSION%
 * http://larsjung.de/fracs
 * MIT License
 */

(function (window, document, $) {
'use strict';
/*jslint browser: true, confusion: true, nomen: true, regexp: true, vars: true, white: true */
/*jshint browser: true, confusion: true, nomen: false, regexp: false, vars: false, white: false */
/*global jQuery */

        // Some often used references.
    var $window = $(window),
        $document = $(document),
        $htmlBody = $('html,body'),
        extend = $.extend,
        isFn = $.isFunction,
        slice = [].slice,
        mathMax = Math.max,
        mathMin = Math.min,
        mathRound = Math.round,
        scrollTo = function (left, top, duration) {

            left = left || 0;
            top = top || 0;
            duration = isNaN(duration) ? 1000 : duration;

            $htmlBody.stop(true).animate({scrollLeft: left, scrollTop: top}, duration);
        };





    // Objects
    // =======

    // Rect
    // ----
    // Holds the position and dimensions of a rectangle.
    // The position might be relative to document, viewport or element space.
    var Rect = function (left, top, width, height) {

        // Top left corner of the rectangle rounded to integers.
        this.left = mathRound(left);
        this.top = mathRound(top);

        // Dimensions rounded to integers.
        this.width = mathRound(width);
        this.height = mathRound(height);

        // Bottom right corner of the rectangle.
        this.right = this.left + this.width;
        this.bottom = this.top + this.height;
    };

    // ### Static methods
    extend(Rect, {

        // Returns a new instance of `Rect` representing the document.
        // Since the coordinates are in document space the `left` and `top` values
        // are always set to `0`.
        ofDocument: function () {

            return new Rect(0, 0, $document.width(), $document.height());
        },

        // Returns a new instance of `Rect` representing the viewport.
        ofViewport: function () {

            return new Rect($window.scrollLeft(), $window.scrollTop(), $window.width(), $window.height());
        },

        // Returns a new instance of `Rect` representing a given `HTMLElement`.
        // The dimensions respect padding and border widths.
        // If the element is invisible (as determined by jQuery) the return value is
        // null.
        ofElement: function (element) {

            var $element = $(element);
            if (!$element.is(':visible')) {
                return null;
            }

            var offset = $element.offset();
            return new Rect(offset.left, offset.top, $element.outerWidth(), $element.outerHeight());
        }
    });



    // Outline
    // -------
    // Quick and dirty.
    var Outline = function (canvas, options) {

        if (!canvas || canvas.nodeName !== 'CANVAS') {
            return null;
        }

        var defaults = {
                crop: false,
                duration: 0,
                focusWidth: 0.5,
                focusHeight: 0.5,
                autoFocus: true,
                styles: [{
                    selector: 'header,footer,section,article',
                    fillStyle: 'rgb(230,230,230)'
                }, {
                    selector: 'h1,h2,h3,h4',
                    fillStyle: 'rgb(255,144,55)'
                }],
                viewportStyle: {
                    fillStyle: 'rgba(255,144,55,0.3)'
                },
                viewportDragStyle: {
                    fillStyle: 'rgba(255,144,55,0.5)'
                },
                invertViewport: false
            },
            settings = extend({}, defaults, options),
            $canvas = $(canvas),
            width = $canvas.attr('width'),
            height = $canvas.attr('height'),
            context = canvas.getContext('2d'),
            drag = false,
            docRect, vpRect, scale, focusWidth, focusHeight,
            drawRect = function (rect, strokeWidth, strokeStyle, fillStyle, invert) {

                if (!rect || (!strokeStyle && !fillStyle)) {
                    return;
                }

                if (fillStyle) {
                    context.beginPath();
                    if (invert) {
                        context.rect(0, 0, docRect.width, rect.top);
                        context.rect(0, rect.top, rect.left, rect.height);
                        context.rect(rect.right, rect.top, docRect.right - rect.right, rect.height);
                        context.rect(0, rect.bottom, docRect.width, docRect.bottom - rect.bottom);
                    } else {
                        context.rect(rect.left, rect.top, rect.width, rect.height);
                    }
                    context.fillStyle = fillStyle;
                    context.fill();
                }
                if (strokeStyle) {
                    context.beginPath();
                    context.rect(rect.left, rect.top, rect.width, rect.height);
                    context.lineWidth = scale ? mathMax(strokeWidth, 0.2 / scale) : strokeWidth;
                    context.strokeStyle = strokeStyle;
                    context.stroke();
                }
            },
            drawElement = function (element, strokeWidth, strokeStyle, fillStyle) {

                var $element = $(element),
                    rect = Rect.ofElement(element);

                if (!rect || rect.width === 0 || rect.height === 0 || $element.css('visibility') === 'hidden') {
                    return;
                }

                strokeWidth = strokeWidth === 'auto' ? parseInt($element.css('border-top-width'), 10) : strokeWidth;
                strokeStyle = strokeStyle === 'auto' ? $element.css('border-top-color') : strokeStyle;
                fillStyle = fillStyle === 'auto' ? $element.css('background-color') : fillStyle;
                drawRect(rect, strokeWidth, strokeStyle, fillStyle);
            },
            applyStyles = function () {

                $.each(settings.styles, function (idx, style) {
                    $(style.selector).each(function () {
                        drawElement(this, style.strokeWidth, style.strokeStyle, style.fillStyle);
                    });
                });
            },
            drawViewport = function () {

                var style = drag && settings.viewportDragStyle ? settings.viewportDragStyle : settings.viewportStyle;

                drawRect(vpRect, style.strokeWidth, style.strokeStyle, style.fillStyle, settings.invertViewport);
            },
            draw = function () {

                docRect = Rect.ofDocument();
                vpRect = Rect.ofViewport();
                scale = mathMin(width / docRect.width, height / docRect.height);

                if (settings.crop) {
                    $canvas.attr('width', docRect.width * scale).attr('height', docRect.height * scale);
                }

                context.setTransform(1, 0, 0, 1, 0, 0);
                context.clearRect(0, 0, $canvas.width(), $canvas.height());

                context.scale(scale, scale);
                applyStyles();
                drawViewport();
            },
            onDrag = function (event) {

                var r = Rect.ofElement(canvas),
                    x = event.pageX - r.left,
                    y = event.pageY - r.top;

                scrollTo(x / scale - vpRect.width * focusWidth, y / scale - vpRect.height * focusHeight, settings.duration);
            },
            onDragEnd = function (event) {

                drag = false;
                event.preventDefault();

                $canvas.css('cursor', 'pointer').removeClass('dragOn');
                $htmlBody.css('cursor', 'auto');
                $window.off('mousemove', onDrag);
                draw();
            },
            onDragStart = function (event) {

                var r;
                if (settings.autoFocus) {
                    r = Rect.ofElement(canvas);
                    focusWidth = (((event.pageX - r.left) / scale) - vpRect.left) / vpRect.width;
                    focusHeight = (((event.pageY - r.top) / scale) - vpRect.top) / vpRect.height;
                }
                if (!settings.autoFocus || focusWidth < 0 || focusWidth > 1 || focusHeight < 0 || focusHeight > 1) {
                    focusWidth = settings.focusWidth;
                    focusHeight = settings.focusHeight;
                }

                drag = true;
                event.preventDefault();

                $canvas.css('cursor', 'crosshair').addClass('dragOn');
                $htmlBody.css('cursor', 'crosshair');
                $window.on('mousemove', onDrag).one('mouseup', onDragEnd);
                onDrag(event);
            },
            init = function () {

                $canvas.css('cursor', 'pointer').mousedown(onDragStart);
                $window.on('load resize scroll', draw);
                draw();
            };

        init();

        this.redraw = draw;
    };





    // modplug 0.7
    // ===========

    // Use <http://larsjung.de/modplug> to attach the plug-in to jQuery.
    var modplug = function (namespace, options) {

            // Save the initial settings.
        var settings = extend({}, options),

            // Helper function to apply default methods.
            applyMethod = function (obj, args, methodName, methods) {

                // If `methodName` is a function apply it to get the actual
                // method name.
                methodName = isFn(methodName) ? methodName.apply(obj, args) : methodName;

                // If method exists then apply it and return the result ...
                if (isFn(methods[methodName])) {
                    return methods[methodName].apply(obj, args);
                }

                // ... otherwise raise an error.
                $.error('Method "' + methodName + '" does not exist on jQuery.' + namespace);
            },

            // This function gets exposed as `$.<namespace>`.
            statics = function () {

                // Try to apply a default method.
                return applyMethod(this, slice.call(arguments), settings.defaultStatic, statics);
            },

            // This function gets exposed as `$(selector).<namespace>`.
            methods = function (method) {

                // If `method` exists then apply it ...
                if (isFn(methods[method])) {
                    return methods[method].apply(this, slice.call(arguments, 1));
                }

                // ... otherwise try to apply a default method.
                return applyMethod(this, slice.call(arguments), settings.defaultMethod, methods);
            },

            // Adds/overwrites plug-in methods.
            // This function gets exposed as `$.<namespace>.modplug` to make the plug-in extendable.
            plug = function (options) {

                if (options) {
                    extend(statics, options.statics);
                    extend(methods, options.methods);
                }

                // Make sure that `$.<namespace>.modplug` points to this function after adding new methods.
                statics.modplug = plug;
            };

        // Save objects or methods previously registered to the desired namespace.
        // They are available via `$.<namespace>.modplug.prev`.
        plug.prev = {
            statics: $[namespace],
            methods: $.fn[namespace]
        };

        // Init the plug-in by adding the specified statics and methods.
        plug(options);

        // Register the plug-in.
        $[namespace] = statics;
        $.fn[namespace] = methods;
    };





    // Register the plug-in
    // ===================

        // The namespace used to register the plug-in and to attach
        // data to elements.
    var namespace = 'outline';

    // The methods are sorted in alphabetical order. All methods that do
    // not provide a return value will return `this` to enable method chaining.
    modplug(namespace, {

        // Static methods
        // --------------
        // These methods are accessible via `$.outline.<methodname>`.
        statics: {

            // Build version.
            version: '%BUILD_VERSION%',

            // Publish object constructors (for testing).
            Outline: Outline
        },

        // Instance methods
        // ----------------
        // These methods are accessible via `$(selector).outline('<methodname>', ...)`.
        methods: {

            // ### 'outline'
            // Generates a document outline in a selected canvas. Will be redrawn on every
            // 'window resize` and `window scroll` event.
            //
            //      .outline([options: OutlineOptions]): jQuery
            outline: function (action) {

                return this.each(function () {

                    var outline = $(this).data(namespace);
                    if (!outline) {
                        outline = new Outline(this, action);
                        if (outline) {
                            $(this).data(namespace, outline);
                        }
                    }
                });
            },

            // ### 'redraw'
            // Manually trigger a redraw
            //
            //      .outline('redraw'): jQuery
            redraw: function () {

                return this.each(function () {

                    var outline = $(this).data(namespace);
                    if (outline) {
                        outline.redraw();
                    }
                });
            }
        },

        // Defaults
        // --------
        defaultMethod: 'outline'
    });

})(window, document, jQuery);
