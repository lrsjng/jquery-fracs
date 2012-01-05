/*!
 * jQuery.fracs %BUILD_VERSION%
 * http://larsjung.de/fracs
 *
 * provided under the terms of the MIT License
 */

/*jslint browser: true, confusion: true, nomen: true, regexp: true, white: true */
/*jshint browser: true, confusion: true, nomen: false, regexp: false, white: false */
/*global jQuery */

(function (window, document, $) {
    'use strict';

    // Initial setup
    // =============

        // The top-level namespace. All public classes will be attached to this.
    var Fracs = window.Fracs = {},

        // Some often used references.
        $window = $(window),
        $document = $(document),
        $htmlBody = $('html,body'),

        // The namespace used to attach data to elements.
        dataNs = 'fracs',

        // Single reference to the window scroll state callback functions.
        scrollStateCallbacks,

        // Returns `true` if any of its arguments are undefined otherwise `false`.
        isAnyUndefined = function () {

            return $.inArray(undefined, arguments) >= 0;
        },

        // ### modplug 0.7
        //      http://larsjung.de/modplug
        //      MIT License
        modplug = function (namespace, options) {

                // Some references to enhance minification.
            var extend = $.extend,
                isFn = $.isFunction,
                slice = [].slice,

                // Save the initial settings.
                settings = extend({}, options),

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

                // Adds/overwrites plugin methods.
                // This function gets exposed as `$.<namespace>.modplug` to make the plugin extendable.
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

            // Init the plugin by adding the specified statics and methods.
            plug(options);

            // Register the plugin.
            $[namespace] = statics;
            $.fn[namespace] = methods;
        };





    // Objects
    // =======

    // Fracs.Rect
    // ----------
    // A simple object that holds the position and dimensions of a rectangle.
    // The position might be relative to document, viewport or element space.

    // Creates a new instance for the given position and dimensions.
    Fracs.Rect = function (left, top, width, height) {

        // Top left corner of the rectangle rounded to integers.
        this.left = Math.round(left);
        this.top = Math.round(top);

        // Dimensions rounded to integers.
        this.width = Math.round(width);
        this.height = Math.round(height);

        // Bottom right corner of the rectangle.
        this.right = this.left + this.width;
        this.bottom = this.top + this.height;
    };

    Fracs.Rect.prototype = {

        // Checks if this instance equals `that` in position and dimensions.
        equals: function (that) {

            if (!(that instanceof Fracs.Rect)) {
                return false;
            }

            return this.left === that.left && this.top === that.top && this.width === that.width && this.height === that.height;
        },

        // Returns the area of this rectangle.
        area: function () {

            return this.width * this.height;
        },

        // Returns a new rectangle representing the intersection of this instance and `rect`.
        // If there is no intersection the return value is `null`.
        intersection: function (rect) {

            if (!(rect instanceof Fracs.Rect)) {
                return null;
            }

            var left = Math.max(this.left, rect.left),
                right = Math.min(this.right, rect.right),
                top = Math.max(this.top, rect.top),
                bottom = Math.min(this.bottom, rect.bottom),
                width = right - left,
                height = bottom - top;

            return (width >= 0 && height >= 0) ? new Fracs.Rect(left, top, width, height) : null;
        },

        // Returns a new rectangle representing the smallesr rectangle containing this instance and `rect`.
        envelope: function (rect) {

            if (!(rect instanceof Fracs.Rect)) {
                return this;
            }

            var left = Math.min(this.left, rect.left),
                right = Math.max(this.right, rect.right),
                top = Math.min(this.top, rect.top),
                bottom = Math.max(this.bottom, rect.bottom),
                width = right - left,
                height = bottom - top;

            return new Fracs.Rect(left, top, width, height);
        },

        // Returns the fractions for this instance. This is just a shortcut method; might be removed.
        fracs: function () {

            return Fracs.Fractions.ofRect(this);
        }
    };

    // Returns a new instance of `Fracs.Rect` representing the document.
    // Since the coordinates are in document space the `left` and `top` values
    // are always set to `0`.
    Fracs.Rect.ofDocument = function () {

        return new Fracs.Rect(0, 0, $document.width(), $document.height());
    };

    // Returns a new instance of `Fracs.Rect` representing the viewport.
    Fracs.Rect.ofViewport = function () {

        return new Fracs.Rect($window.scrollLeft(), $window.scrollTop(), $window.width(), $window.height());
    };

    // Returns a new instance of `Fracs.Rect` representing a given `HTMLElement`.
    // The dimensions respect padding and border widths.
    // If the element is invisible (as determined by jQuery) the return value is
    // null.
    Fracs.Rect.ofElement = function (element) {

        var $element = $(element),
            offset;

        if (!$element.is(':visible')) {
            return null;
        }

        offset = $element.offset();
        return new Fracs.Rect(offset.left, offset.top, $element.outerWidth(), $element.outerHeight());
    };



    // Fracs.Fractions
    // ---------------
    // The heart of the library. An object that holds the fractions data.
    // There are two constructors to create this data for a given instance of `Fracs.Rect`
    // or an HTMLElement.

    // Creates a new instance.
    Fracs.Fractions = function (rectDocument, rectElement, rectViewport, visible, viewport, possible) {

        if (rectDocument && rectElement && rectViewport && visible && viewport && possible) {
            this.rects = {
                document: rectDocument,
                element: rectElement,
                viewport: rectViewport
            };
            this.visible = visible;
            this.viewport = viewport;
            this.possible = possible;
        } else {
            this.rects = null;
            this.visible = 0;
            this.viewport = 0;
            this.possible = 0;
        }
    };

    Fracs.Fractions.prototype = {

        // Checks if this instance equals `that` in all attributes.
        equals: function (that) {

            return this.fracsEqual(that) && this.rectsEqual(that);
        },

        // Checks if this instance equals `that` in all fraction attributes.
        fracsEqual: function (that) {

            if (!(that instanceof Fracs.Fractions)) {
                return false;
            }

            return this.visible === that.visible && this.viewport === that.viewport && this.possible === that.possible;
        },

        // Checks if this instance equals `that` in all rectangle attributes.
        rectsEqual: function (that) {

            if (!(that instanceof Fracs.Fractions)) {
                return false;
            }

            if (!this.rects || !that.rects) {
                return this.rects === that.rects;
            }
            return this.rects.document.equals(that.rects.document) &&
                this.rects.element.equals(that.rects.element) &&
                this.rects.viewport.equals(that.rects.viewport);
        }
    };

    Fracs.Fractions.ofRect = function (rect, viewport) {

        var intersection, intersectionElementSpace, intersectionViewportSpace, intersectionArea, possibleArea;

        viewport = viewport || Fracs.Rect.ofViewport();
        intersection = rect && rect.intersection(viewport);

        if (!intersection) {
            return new Fracs.Fractions();
        }

        intersectionElementSpace = new Fracs.Rect(intersection.left - rect.left, intersection.top - rect.top, intersection.width, intersection.height);
        intersectionViewportSpace = new Fracs.Rect(intersection.left - viewport.left, intersection.top - viewport.top, intersection.width, intersection.height);
        intersectionArea = intersection.area();
        possibleArea = Math.min(rect.width, viewport.width) * Math.min(rect.height, viewport.height);

        return new Fracs.Fractions(
            intersection,
            intersectionElementSpace,
            intersectionViewportSpace,
            intersectionArea / rect.area(),
            intersectionArea / viewport.area(),
            intersectionArea / possibleArea
       );
    };

    Fracs.Fractions.ofElement = function (element, viewport) {

        return Fracs.Fractions.ofRect(Fracs.Rect.ofElement(element), viewport);
    };



    // Fracs.Element
    // ------------

    // Creates a new instance.
    Fracs.Element = function (element) {

        this.el = element;

        this.fracs = null;
        this.prevFracs = null;
        this.rect = null;
        this.prevRect = null;

        // Init the attributes.
        this.update();
    };

    Fracs.Element.prototype = {

        // Checks if this instance equals `that` in the represented HTML element.
        equals: function (that) {

            if (!(that instanceof Fracs.Element)) {
                return false;
            }

            return this.el === that.el;
        },

        update: function (viewport) {

            var fracs = Fracs.Fractions.ofElement(this.el, viewport),
                rect = Fracs.Rect.ofElement(this.el),
                changed = false;

            if (!this.fracs || !this.fracs.equals(fracs)) {
                this.prevFracs = this.fracs;
                this.fracs = fracs;
                changed = true;
            }
            if (!this.rect || !this.rect.equals(rect)) {
                this.prevRect = this.rect;
                this.rect = rect;
                changed = true;
            }
            return changed;
        }
    };



    // Fracs.Group
    // -----------

    // Creates a new instance.
    Fracs.Group = function (htmlElements) {

        this.elements = this._htmlElementsToElements(htmlElements);
    };

    Fracs.Group.prototype = {
        _fracsProps: ['possible', 'visible', 'viewport'],
        _rectProps: ['width', 'height', 'left', 'right', 'top', 'bottom'],
        _propertyType: function (property) {

            if ($.inArray(property, this._fracsProps) >= 0) {
                return 'fracs';
            } else if ($.inArray(property, this._rectProps) >= 0) {
                return 'rect';
            }
        },
        _betterMax: function (value, bestValue) {

            return value > bestValue;
        },
        _betterMin: function (value, bestValue) {

            return value < bestValue;
        },
        _best: function (property, betterFn) {

            var bestElements,
                bestValue = null,
                type = this._propertyType(property);

            if (!type) {
                return {elements: [], value: null};
            }

            $.each(this.elements, function (idx, element) {

                var value;

                element.update();
                value = type === 'fracs' ? element.fracs[property] : element.rect[property];

                if (bestValue === null || betterFn(value, bestValue)) {
                    bestElements = [element];
                    bestValue = value;
                } else if (value === bestValue) {
                    bestElements.push(element);
                }
            });

            return {elements: bestElements, value: bestValue};
        },
        _htmlElementsToElements: function (htmlElements) {

            return $.map(htmlElements, function (htmlElement) {
                return new Fracs.Element(htmlElement);
            });
        },
        _elementsToHtmlElements: function (elements) {

            return $.map(elements, function (element) {
                return element.element;
            });
        },
        max: function (property, asHTMLElements) {

            var result = this._best(property, this._betterMax);

            return asHTMLElements === true ? this._elementsToHtmlElements(result.elements) : result;
        },
        min: function (property, asHTMLElements) {

            var result = this._best(property, this._betterMin);

            return asHTMLElements === true ? this._elementsToHtmlElements(result.elements) : result;
        }
    };



    // Fracs.Cursor
    // ------------

    // Creates a new instance of `Fracs.Cursor`.
    Fracs.Cursor = function (distX, distY) {

        this.distX = distX;
        this.distY = distY;
        this.distMin = Math.min(distX, distY);
        this.distMax = Math.max(distX, distY);
    };

    Fracs.Cursor.prototype = {

        // Checks if this instance equals `that`.
        equals: function (that) {

            if (!(that instanceof Fracs.Cursor)) {
                return false;
            }

            return this.distX === that.distX && this.distY === that.distY;
        },
        dist: function () {

            return Math.sqrt(this.distX * this.distX + this.distY * this.distY);
        }
    };

    Fracs.Cursor.ofRect = function (cursorX, cursorY, rect) {

        var x = cursorX < rect.left ? rect.left - cursorX : (cursorX > rect.right ? cursorX - rect.right : 0),
            y = cursorY < rect.top ? rect.top - cursorY : (cursorY > rect.bottom ? cursorY - rect.bottom : 0);

        return new Fracs.Cursor(x, y);
    };

    Fracs.Cursor.ofElement = function (cursorX, cursorY, element) {

        return Fracs.Cursor.ofRect(cursorX, cursorY, Fracs.Rect.ofElement(element));
    };



    // Fracs.ScrollState
    // -----------------

    // Creates a new instance of `Fracs.ScrollState`.
    Fracs.ScrollState = function (width, height, left, top, right, bottom) {

        if (isAnyUndefined(width, height, left, top, right, bottom)) {
            var doc = Fracs.Rect.ofDocument(),
                vp = Fracs.Rect.ofViewport(),
                w = doc.width - vp.width,
                h = doc.height - vp.height;

            this.width = w <= 0 ? null : vp.left / w;
            this.height = h <= 0 ? null : vp.top / h;
            this.left = vp.left;
            this.top = vp.top;
            this.right = doc.right - vp.right;
            this.bottom = doc.bottom - vp.bottom;
        } else {
            this.width = width;
            this.height = height;
            this.left = left;
            this.top = top;
            this.right = right;
            this.bottom = bottom;
        }
    };

    Fracs.ScrollState.prototype = {

        // Checks if this instance equals `that`.
        equals: function (that) {

            if (!(that instanceof Fracs.ScrollState)) {
                return false;
            }

            return this.width === that.width && this.height === that.height &&
                this.left === that.left && this.top === that.top &&
                this.right === that.right && this.bottom === that.bottom;
        }
    };

    Fracs.ScrollState.scrollTo = function (left, top, duration) {

        left = left || 0;
        top = top || 0;
        duration = isNaN(duration) ? 1000 : duration;

        $htmlBody.stop(true).animate({scrollLeft: left, scrollTop: top}, duration);
    };

    Fracs.ScrollState.scroll = function (left, top, duration) {

        left = left || 0;
        top = top || 0;

        Fracs.ScrollState.scrollTo($window.scrollLeft() + left, $window.scrollTop() + top, duration);
    };

    Fracs.ScrollState.scrollToRect = function (rect, paddingLeft, paddingTop, duration) {

        paddingLeft = paddingLeft || 0;
        paddingTop = paddingTop || 0;

        Fracs.ScrollState.scrollTo(rect.left - paddingLeft, rect.top - paddingTop, duration);
    };

    Fracs.ScrollState.scrollToElement = function (element, paddingLeft, paddingTop, duration) {

        var rect = Fracs.Rect.ofElement(element);

        Fracs.ScrollState.scrollToRect(rect, paddingLeft, paddingTop, duration);
    };





    // Fracs.Outline
    // -------------
    // Quick and dirty.

    // Constructor.
    Fracs.Outline = function (canvas, options) {

        if (!canvas.nodeName || canvas.nodeName.toLowerCase() !== 'canvas') {
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
                    selector: 'h1',
                    fillStyle: 'rgb(255,144,55)'
                }, {
                    selector: 'h2',
                    fillStyle: 'rgb(221,75,57)'
                }, {
                    selector: 'h3',
                    fillStyle: 'rgb(108,196,46)'
                }, {
                    selector: 'h4',
                    fillStyle: 'rgb(53,122,232)'
                }],
                viewportStyle: {
                    fillStyle: 'rgba(255,144,55,0.3)'
                },
                viewportDragStyle: {
                    fillStyle: 'rgba(255,144,55,0.5)'
                },
                invertViewport: false
            },
            settings = $.extend({}, defaults, options),
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
                    context.lineWidth = scale ? Math.max(strokeWidth, 0.2 / scale) : strokeWidth;
                    context.strokeStyle = strokeStyle;
                    context.stroke();
                }
            },
            drawElement = function (element, strokeWidth, strokeStyle, fillStyle) {

                var $element = $(element),
                    rect = Fracs.Rect.ofElement(element);

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

                docRect = Fracs.Rect.ofDocument();
                vpRect = Fracs.Rect.ofViewport();
                scale = Math.min(width / docRect.width, height / docRect.height);

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

                var r = $canvas.fracs('rect'),
                    x = event.pageX - r.left,
                    y = event.pageY - r.top;

                Fracs.ScrollState.scrollTo(x / scale - vpRect.width * focusWidth, y / scale - vpRect.height * focusHeight, settings.duration);
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
                    r = $canvas.fracs('rect');
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





    // Callbacks
    // =========

    // Fracs.FracsCallbacks
    // --------------------

    // Constructor.
    Fracs.FracsCallbacks = function (element) {

        this.callbacks = $.Callbacks('memory unique');

        this.el = element;
        this.currVal = null;
        this.prevVal = null;

        // A proxy to make `check` bindable to events.
        this.checkProxy = $.proxy(this.check, this);

        // Start automated checking for changes.
        this.autoCheck();
    };

    Fracs.FracsCallbacks.prototype = {
        bind: function (callback) {

            this.callbacks.add(callback);
        },
        unbind: function (callback) {

            if (callback) {
                this.callbacks.remove(callback);
            } else {
                this.callbacks.empty();
            }
        },
        trigger: function () {

            this.callbacks.fireWith(this.el, [this.currVal, this.prevVal]);
        },

        // Checks if value changed, updates attributes `currVal` and
        // `prevVal` accordingly and triggers the callbacks. Returns
        // `true` if value changed, otherwise `false`.
        check: function () {

            var value = this.el instanceof Fracs.Rect ? Fracs.Fractions.ofRect(this.el) : Fracs.Fractions.ofElement(this.el);

            if (this.currVal && this.currVal.equals(value)) {
                return false;
            }

            this.prevVal = this.currVal;
            this.currVal = value;
            this.trigger();
            return true;
        },

        // Enables/disables automated checking for changes on `window`
        // `load`, `resize` and `scroll` events.
        autoCheck: function (on) {

            $window[on === false ? 'off' : 'on']('resize scroll load', this.checkProxy);
        }
    };



    // Fracs.GroupCallbacks
    // --------------------

    // Constructor.
    Fracs.GroupCallbacks = function (htmlElements, type, property) {

        this.callbacks = $.Callbacks('memory unique');

        this.group = new Fracs.Group(htmlElements);
        this.type = type;
        this.property = property;

        this.currVal = null;
        this.prevVal = null;

        this.checkProxy = $.proxy(this.check, this);
        this.autoCheck();
    };

    Fracs.GroupCallbacks.prototype = {
        bind: function (callback) {

            this.callbacks.add(callback);
        },
        unbind: function (callback) {

            if (callback) {
                this.callbacks.remove(callback);
            } else {
                this.callbacks.empty();
            }
        },
        trigger: function () {

            this.callbacks.fireWith(this.group, [this.currVal, this.prevVal]);
        },

        // Checks if value changed, updates attributes `currVal` and
        // `prevVal` accordingly and triggers the callbacks. Returns
        // `true` if value changed, otherwise `false`.
        check: function () {

            var result = this.group[this.type](this.property),
                value = result.elements.length === 0 || result.value === 0 ? null : result.elements[0];

            if (this.currVal === value) {
                return false;
            }

            this.prevVal = this.currVal;
            this.currVal = value;
            this.trigger();
            return true;
        },

        // Enables/disables automated checking for changes on `window`
        // `load`, `resize` and `scroll` events.
        autoCheck: function (on) {

            $window[on === false ? 'off' : 'on']('resize scroll load', this.checkProxy);
        }
    };



    // Fracs.CursorCallbacks
    // ---------------------

    // Constructor.
    Fracs.CursorCallbacks = function (element) {

        this.callbacks = $.Callbacks('memory unique');

        this.el = element || window;
        this.currVal = null;
        this.prevVal = null;

        // A proxy to make `check` bindable to events.
        this.checkProxy = $.proxy(this.check, this);

        // Start automated checking for changes.
        this.autoCheck();
    };

    Fracs.CursorCallbacks.prototype = {
        bind: function (callback) {

            this.callbacks.add(callback);
        },
        unbind: function (callback) {

            if (callback) {
                this.callbacks.remove(callback);
            } else {
                this.callbacks.empty();
            }
        },
        trigger: function () {

            this.callbacks.fireWith(this.el, [this.currVal, this.prevVal]);
        },

        // Checks if value changed, updates attributes `currVal` and
        // `prevVal` accordingly and triggers the callbacks. Returns
        // `true` if value changed, otherwise `false`.
        check: function (event) {

            var value = Fracs.Cursor.ofElement(event.pageX, event.pageY, this.el);

            if (this.currVal && this.currVal.equals(value)) {
                return false;
            }

            this.prevVal = this.currVal;
            this.currVal = value;
            this.trigger();
            return true;
        },

        // Enables/disables automated checking for changes on `window`
        // `cursormove` events.
        autoCheck: function (on) {

            $window[on === false ? 'off' : 'on']('cursormove', this.checkProxy);
        }
    };



    // Fracs.ScrollStateCallbacks
    // --------------------------

    // Constructor.
    Fracs.ScrollStateCallbacks = function (element) {

        this.callbacks = $.Callbacks('memory unique');

        this.el = element || window;
        this.currVal = null;
        this.prevVal = null;

        // A proxy to make `check` bindable to events.
        this.checkProxy = $.proxy(this.check, this);

        // Start automated checking for changes.
        this.autoCheck();
    };

    Fracs.ScrollStateCallbacks.prototype = {
        bind: function (callback) {

            this.callbacks.add(callback);
        },
        unbind: function (callback) {

            if (callback) {
                this.callbacks.remove(callback);
            } else {
                this.callbacks.empty();
            }
        },
        trigger: function () {

            this.callbacks.fireWith(this.el, [this.currVal, this.prevVal]);
        },

        // Checks if value changed, updates attributes `currVal` and
        // `prevVal` accordingly and triggers the callbacks. Returns
        // `true` if value changed, otherwise `false`.
        check: function () {

            var value = new Fracs.ScrollState();

            if (this.currVal && this.currVal.equals(value)) {
                return false;
            }

            this.prevVal = this.currVal;
            this.currVal = value;
            this.trigger();
            return true;
        },

        // Enables/disables automated checking for changes on `window`
        // `load`, `resize` and `scroll` events.
        autoCheck: function (on) {

            $window[on === false ? 'off' : 'on']('resize scroll load', this.checkProxy);
        }
    };





    // Register the plugin
    // ===================

    // Use <http://larsjung.de/modplug> to attach the plugin to jQuery.
    //
    // The methods are sorted in alphabetical order. All methods that do
    // not provide a return value will return `this` to enable method chaining.
    modplug('fracs', {

        // These methods will be accessible via `$.fracs.<methodname>`
        statics: {
            document: function () {

                return Fracs.Rect.ofDocument();
            },
            fracs: function (rect, viewport) {

                return Fracs.Fractions.ofRect(rect, viewport);
            },
            rect: function (element) {

                return Fracs.Rect.ofElement(element);
            },
            round: function (value, decs) {

                var pow;

                if (isNaN(decs) || decs <= 0) {
                    return Math.round(value);
                }
                pow = Math.pow(10, decs);
                return Math.round(value * pow) / pow;
            },
            scroll: function (left, top, duration) {

                Fracs.ScrollState.scroll(left, top, duration);
                return this;
            },
            scrollState: function (callback) {

                if (!callback) {
                    return new Fracs.ScrollState();
                }

                scrollStateCallbacks = scrollStateCallbacks || new Fracs.ScrollStateCallbacks();
                scrollStateCallbacks.bind(callback);
                return this;
            },
            scrollTo: function (left, top, duration) {

                Fracs.ScrollState.scrollTo(left, top, duration);
                return this;
            },
            viewport: function () {

                return Fracs.Rect.ofViewport();
            }
        },

        // These methods will be accessible via `$(selector).fracs('<methodname>', ...)`.
        methods: {
            bind: function (callback) {

                return this.each(function () {

                    var $this = $(this),
                        fracsCbs = $this.data(dataNs);

                    if (!fracsCbs) {
                        fracsCbs = new Fracs.FracsCallbacks(this);
                        $this.data(dataNs, fracsCbs);
                    }
                    fracsCbs.bind(callback);
                });
            },
            check: function () {

                return this.each(function () {

                    var fracsCbs = $(this).data(dataNs);

                    if (fracsCbs) {
                        fracsCbs.check();
                    }
                });
            },
            cursor: function (callbackOrX, y) {

                if (callbackOrX instanceof Function) {
                    return this.each(function () {

                        (new Fracs.CursorCallbacks(this)).bind(callbackOrX);
                    });
                }

                return Fracs.Cursor.ofElement(callbackOrX, y, this.get(0));
            },
            envelope: function () {

                var envelope, rect;

                this.each(function () {
                    rect = Fracs.Rect.ofElement(this);
                    envelope = envelope ? envelope.envelope(rect) : rect;
                });
                return envelope;
            },
            fracs: function () {

                return Fracs.Fractions.ofElement(this.get(0));
            },
            max: function (property, callback) {

                if (callback) {
                    (new Fracs.GroupCallbacks(this, 'max', property)).bind(callback);
                    return this;
                }

                return $((new Fracs.Group(this)).maxHtmlElements(property));
            },
            min: function (property, callback) {

                if (callback) {
                    (new Fracs.GroupCallbacks(this, 'min', property)).bind(callback);
                    return this;
                }

                return $(new Fracs.Group(this).minHtmlElements(property));
            },
            outline: function (options) {

                return this.each(function () {

                    var outline;

                    if (options === 'redraw') {
                        outline = $(this).data(dataNs + '.outline');
                        if (outline) {
                            outline.redraw();
                        }
                    } else {
                        outline = new Fracs.Outline(this, options);
                        if (outline) {
                            $(this).data(dataNs + '.outline', outline);
                        }
                    }
                });
            },
            rect: function () {

                return Fracs.Rect.ofElement(this.get(0));
            },
            softLink: function (paddingLeft, paddingTop, duration) {

                return this.filter('a[href^=#]').each(function () {
                    var $a = $(this);
                    $a.click(function () {
                        Fracs.ScrollState.scrollToElement($($a.attr('href')).get(0), paddingLeft, paddingTop, duration);
                    });
                });
            },
            scrollTo: function (paddingLeft, paddingTop, duration) {

                Fracs.ScrollState.scrollToElement(this.get(0), paddingLeft, paddingTop, duration);
                return this;
            },
            unbind: function (callback) {

                return this.each(function () {

                    var $this = $(this),
                        fracsCbs = $this.data(dataNs);

                    if (fracsCbs) {
                        fracsCbs.unbind(callback);
                    }
                });
            }
        },

        defaultStatic: function () {

            // `$.fracs(...)` gets mapped to `$.fracs.fracs(...)`.
            return 'fracs';
        },

        defaultMethod: function (arg) {

            // `$(selector).fracs()` gets mapped to `$(selector).fracs('fracs')`.
            if (arguments.length === 0) {
                return 'fracs';
            }

            // `$(selector).fracs(function)` gets mapped to `$(selector).fracs('bind', function)`.
            if (arg instanceof Function) {
                return 'bind';
            }
        }
    });


})(window, document, jQuery);
