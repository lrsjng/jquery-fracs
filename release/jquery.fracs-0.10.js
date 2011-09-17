/*
 * jQuery.fracs 0.10
 * http://larsjung.de/fracs
 * 
 * provided under the terms of the MIT License
 */

/*
 * ModPlug 0.4
 * http://larsjung.de/modplug
 *
 * provided under the terms of the MIT License
 */

(function ($, undefined) {
    "use strict";

    var reference = "_mp_api";

    $.ModPlug = $.ModPlug || {
        plugin: function (namespace, options) {

            if (!namespace || $[namespace] || $.fn[namespace]) {
                // 1: no namespace specified
                // 2: static namespace not available
                // 3: namespace not available
                return !namespace ? 1 : ($[namespace] ? 2 : 3);
            }

            var defaults = {
                    statics: {},
                    methods: {},
                    defaultStatic: undefined,
                    defaultMethod: undefined
                },
                settings = $.extend({}, defaults, options),
                staticPlug = function () {

                    var args, defaultMethod;

                    args = Array.prototype.slice.call(arguments);
                    defaultMethod = settings.defaultStatic instanceof Function ? settings.defaultStatic.apply(this, args) : settings.defaultStatic;
                    if (staticPlug[defaultMethod] instanceof Function) {
                        return staticPlug[defaultMethod].apply(this, args);
                    }
                    $.error("Static method defaulted to '" + defaultMethod + "' does not exist on 'jQuery." + namespace + "'");
                },
                methods = {},
                methodPlug = function (method) {

                    var args, defaultMethod;

                    if (methods[method] instanceof Function) {
                        args = Array.prototype.slice.call(arguments, 1);
                        return methods[method].apply(this, args);
                    }

                    args = Array.prototype.slice.call(arguments);
                    defaultMethod = settings.defaultMethod instanceof Function ? settings.defaultMethod.apply(this, args) : settings.defaultMethod;
                    if (methods[defaultMethod] instanceof Function) {
                        return methods[defaultMethod].apply(this, args);
                    }
                    $.error("Method '" + method + "' defaulted to '" + defaultMethod + "' does not exist on 'jQuery." + namespace + "'");
                },
                api = {
                    addStatics: function (newStatics) {

                        $.extend(staticPlug, newStatics);
                        staticPlug[reference] = api;
                        return this;
                    },
                    addMethods: function (newMethods) {

                        $.extend(methods, newMethods);
                        return this;
                    }
                };

            api.addStatics(settings.statics).addMethods(settings.methods);
            $[namespace] = staticPlug;
            $.fn[namespace] = methodPlug;
            return 0;
        },
        module: function (namespace, options) {

            if (!$[namespace] || !$[namespace][reference]) {
                // 1: namespace not found
                // 2: namespace not a ModPlug plugin
                return !$[namespace] ? 1 : 2;
            }

            var defaults = {
                    statics: {},
                    methods: {}
                },
                settings = $.extend({}, defaults, options);

            $[namespace][reference].addStatics(settings.statics).addMethods(settings.methods);
            return 0;
        }
    };

})(jQuery);

/*
 * jQuery.fracs - Core API
 */


(function (window, $, undefined) {

    var Fracs = window.Fracs = window.Fracs || {},
        $window = $(window),
        $document = $(document);


    Fracs.Rect = function (left, top, width, height) {

        if (!(this instanceof Fracs.Rect)) {
            return new Fracs.Rect(left, top, width, height);
        }

        this.left = Math.round(left);
        this.top = Math.round(top);
        this.width = Math.round(width);
        this.height = Math.round(height);
        this.right = this.left + this.width;
        this.bottom = this.top + this.height;
    };

    Fracs.Rect.prototype = {
        equals: function (that) {

            return this.left === that.left && this.top === that.top && this.width === that.width && this.height === that.height;
        },
        area: function () {

            return this.width * this.height;
        },
        intersection: function (rect) {

            var left = Math.max(this.left, rect.left),
                right = Math.min(this.right, rect.right),
                top = Math.max(this.top, rect.top),
                bottom = Math.min(this.bottom, rect.bottom),
                width = right - left,
                height = bottom - top;

            return (width >= 0 && height >= 0) ? Fracs.Rect(left, top, width, height) : undefined;
        },
        envelope: function (rect) {

            var left = Math.min(this.left, rect.left),
                right = Math.max(this.right, rect.right),
                top = Math.min(this.top, rect.top),
                bottom = Math.max(this.bottom, rect.bottom),
                width = right - left,
                height = bottom - top;

            return Fracs.Rect(left, top, width, height);
        },
        fracs: function () {

            return Fracs.Fractions.ofRect(this);
        }
    };


    /**
     * Special constructors
     */

    Fracs.Rect.ofDocument = function () {

        return Fracs.Rect(0, 0, $document.width(), $document.height());
    };

    Fracs.Rect.ofViewport = function () {

        return Fracs.Rect($window.scrollLeft(), $window.scrollTop(), $window.width(), $window.height());
    };

    Fracs.Rect.ofElement = function (element) {

        var $element = $(element),
            offset;

        if (!$element.is(":visible")) {
            return Fracs.Rect(0,0,-1,0);
        }

        offset = $element.offset();
        return Fracs.Rect(offset.left, offset.top, $element.outerWidth(), $element.outerHeight());
    };

}(window, jQuery));


(function (window, $, undefined) {

    var Fracs = window.Fracs = window.Fracs || {};


    Fracs.Fractions = function (rectDocument, rectElement, rectViewport, visible, viewport, possible) {

        if (!(this instanceof Fracs.Fractions)) {
            return new Fracs.Fractions(rectDocument, rectElement, rectViewport, visible, viewport, possible);
        }

        if (!rectDocument || !rectElement || !rectViewport || !visible || !viewport || !possible) {
            this.rects = undefined;
            this.visible = 0;
            this.viewport = 0;
            this.possible = 0;
        } else {
            this.rects = {
                document: rectDocument,
                element: rectElement,
                viewport: rectViewport
            };
            this.visible = visible;
            this.viewport = viewport;
            this.possible = possible;
        }
    };

    Fracs.Fractions.prototype = {
        equals: function (that) {

            return this.fracsEqual(that) && this.rectsEqual(that);
        },
        fracsEqual: function (that) {

            return this.visible === that.visible && this.viewport === that.viewport && this.possible === that.possible;
        },
        rectsEqual: function (that) {

            if (!this.rects || !that.rects) {
                return this.rects === that.rects;
            }
            return this.rects.document.equals(that.rects.document) &&
                this.rects.element.equals(that.rects.element) &&
                this.rects.viewport.equals(that.rects.viewport);
        }
    };


    /**
     * Special constructors
     */

    Fracs.Fractions.ofRect = function (rect, viewport) {

        var intersection, intersectionElementSpace, intersectionViewportSpace, intersectionArea, possibleArea;

        viewport = viewport || Fracs.Rect.ofViewport();
        intersection = rect.intersection(viewport);

        if (!intersection) {
            return Fracs.Fractions();
        }

        intersectionElementSpace = Fracs.Rect(intersection.left - rect.left, intersection.top - rect.top, intersection.width, intersection.height);
        intersectionViewportSpace = Fracs.Rect(intersection.left - viewport.left, intersection.top - viewport.top, intersection.width, intersection.height);
        intersectionArea = intersection.area();
        possibleArea = Math.min(rect.width, viewport.width) * Math.min(rect.height, viewport.height);

        return Fracs.Fractions(
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

}(window, jQuery));


(function (window, $, undefined) {

    var Fracs = window.Fracs = window.Fracs || {};


    Fracs.Cursor = function (distX, distY) {

        if (!(this instanceof Fracs.Mouse)) {
            return new Fracs.Mouse(distX, distY);
        }

        this.distX = distX;
        this.distY = distY;
        this.distMin = Math.min(distX, distY);
        this.distMax = Math.max(distX, distY);
    };

    Fracs.Cursor.prototype = {
        equals: function (that) {

            return this.distX === that.distX && this.distY === that.distY;
        },
        dist: function () {

            return Math.sqrt(this.distX * this.distX + this.distY * this.distY);
        }
    };


    /**
     * Special constructors
     */

    Fracs.Cursor.ofRect = function (cursorX, cursorY, rect) {

        var x = cursorX < rect.left ? rect.left - cursorX : (cursorX > rect.right ? cursorX - rect.right : 0),
            y = cursorY < rect.top ? rect.top - cursorY : (cursorY > rect.bottom ? cursorY - rect.bottom : 0);

        return Fracs.Cursor(x, y);
    };

    Fracs.Cursor.ofElement = function (cursorX, cursorY, element) {

        return Fracs.Cursor.ofRect(cursorX, cursorY, Fracs.Rect.ofElement(element));
    };

}(window, jQuery));


(function (window, $, undefined) {

    var Fracs = window.Fracs = window.Fracs || {},
        $window = $(window);


    Fracs.Callbacks = function () {

        if (!(this instanceof Fracs.Callbacks)) {
            return new Fracs.Callbacks();
        }

        this.callbacks = [];
    };

    Fracs.Callbacks.prototype = {
        size: function () {

            return this.callbacks.length;
        },
        bind: function (callback) {

            if (callback instanceof Function && $.inArray(callback, this.callbacks) === -1) {
                this.callbacks.push(callback);
            }
        },
        unbind: function (callback) {

            var idx;

            if (callback instanceof Function) {
                idx = $.inArray(callback, this.callbacks);
                if (idx >= 0) {
                    this.callbacks.splice(idx, 1);
                }
            } else {
                this.callbacks = [];
            }
        },
        trigger: function (callee, args) {

            $.each(this.callbacks, function (idx, callback) {
                callback.apply(callee, args);
            });
        }
    };


    Fracs.FracsCallbacks = function (element) {

        if (!(this instanceof Fracs.FracsCallbacks)) {
            return new Fracs.FracsCallbacks(element);
        }

        this.callbacks = [];
        this.element = element;
        this.fracs = undefined;
        this.prevFracs = undefined;
        this.checkProxy = $.proxy(this.check, this);
        this.autoCheck();
    };

    Fracs.FracsCallbacks.prototype = $.extend({}, Fracs.Callbacks.prototype, {
        trigger: function () {

            Fracs.Callbacks.prototype.trigger.call(this, this.element, [this.fracs, this.prevFracs]);
        },
        check: function () {

            var rect = this.element instanceof Fracs.Rect ? this.element : Fracs.Rect.ofElement(this.element),
                fracs = Fracs.Fractions.ofRect(rect);

            if (!this.fracs || !this.fracs.equals(fracs)) {
                this.prevFracs = this.fracs;
                this.fracs = fracs;
                this.trigger();
                return true;
            }
            return false;
        },
        autoCheck: function (auto) {

            var events = "resize scroll load",
                fn = auto === false ? "unbind" : "bind";

            $window[fn](events, this.checkProxy);
        }
    });


    Fracs.ScrollStateCallbacks = function () {

        if (!(this instanceof Fracs.ScrollStateCallbacks)) {
            return new Fracs.ScrollStateCallbacks();
        }

        this.callbacks = [];
        this.state = undefined;
        this.prevState = undefined;
        this.checkProxy = $.proxy(this.check, this);
        this.autoCheck();
    };

    Fracs.ScrollStateCallbacks.prototype = $.extend({}, Fracs.Callbacks.prototype, {
        trigger: function () {

            Fracs.Callbacks.prototype.trigger.call(this, window, [this.state, this.prevState]);
        },
        check: function () {

            var state = Fracs.ScrollState();

            if (!this.state || !this.state.equals(state)) {
                this.prevState = this.state;
                this.state = state;
                this.trigger();
                return true;
            }
            return false;
        },
        autoCheck: function (auto) {

            var events = "resize scroll load",
                fn = auto === false ? "unbind" : "bind";

            $window[fn](events, this.checkProxy);
        }
    });


    Fracs.GroupCallbacks = function (htmlElements,type,property) {

        if (!(this instanceof Fracs.GroupCallbacks)) {
            return new Fracs.GroupCallbacks(htmlElements,type,property);
        }

        this.callbacks = [];
        this.group = Fracs.Group(htmlElements);
        this.type = type;
        this.property = property;
        this.best = undefined;
        this.prevBest = undefined;
        this.checkProxy = $.proxy(this.check, this);
        this.autoCheck();
    };

    Fracs.GroupCallbacks.prototype = $.extend({}, Fracs.Callbacks.prototype, {
        trigger: function () {

            Fracs.Callbacks.prototype.trigger.call(this, this.group, [this.best, this.prevBest]);
        },
        check: function () {

            var result = this.group[this.type](this.property),
                best = result.elements.length === 0 || result.value === 0 ? undefined : result.elements[0];

            if (!this.best || this.best !== best) {
                this.prevBest = this.best;
                this.best = best;
                this.trigger();
                return true;
            }
            return false;
        },
        autoCheck: function (auto) {

            var events = "resize scroll load",
                fn = auto === false ? "unbind" : "bind";

            $window[fn](events, this.checkProxy);
        }
    });


    Fracs.CursorCallbacks = function (element) {

        if (!(this instanceof Fracs.CursorCallbacks)) {
            return new Fracs.CursorCallbacks(element);
        }

        this.callbacks = [];
        this.element = element;
        this.cursor = undefined;
        this.prevCursor = undefined;
        this.checkProxy = $.proxy(this.check, this);
        this.autoCheck();
    };

    Fracs.CursorCallbacks.prototype = $.extend({}, Fracs.Callbacks.prototype, {
        trigger: function () {

            Fracs.Callbacks.prototype.trigger.call(this, this.element, [this.cursor, this.prevCursor]);
        },
        check: function (event) {

            var cursor = Fracs.Cursor.ofElement(event.pageX, event.pageY, this.element);

            if (!this.cursor || !this.cursor.equals(cursor)) {
                this.prevCursor = this.cursor;
                this.cursor = cursor;
                this.trigger();
                return true;
            }
            return false;
        },
        autoCheck: function (auto) {

            var events = "cursormove",
                fn = auto === false ? "unbind" : "bind";

            $window[fn](events, this.checkProxy);
        }
    });


}(window, jQuery));


(function (window, $, undefined) {

    var Fracs = window.Fracs = window.Fracs || {},
        $window = $(window),
        $htmlBody = $("html,body");


    Fracs.ScrollState = function (width, height, left, top, right, bottom) {

        if (!(this instanceof Fracs.ScrollState)) {
            return new Fracs.ScrollState();
        }

        var doc = Fracs.Rect.ofDocument(),
            vp = Fracs.Rect.ofViewport(),
            w = doc.width - vp.width,
            h = doc.height - vp.height;

        this.width = width || w <= 0 ? undefined : vp.left / w;
        this.height = height || h <= 0 ? undefined : vp.top / h;
        this.left = left || vp.left;
        this.top = top || vp.top;
        this.right = right || doc.right - vp.right;
        this.bottom = bottom || doc.bottom - vp.bottom;
    };

    Fracs.ScrollState.prototype = {
        equals: function (that) {

            return this.width === that.width && this.height === that.height &&
                this.left === that.left && this.top === that.top &&
                this.right === that.right && this.bottom === that.bottom;
        }
    };


    Fracs.ScrollState.scrollTo = function (left, top, duration) {

        duration = isNaN(duration) ? 1000 : duration;
        $htmlBody.stop(true).animate({scrollLeft: left, scrollTop: top}, duration);
    };

    Fracs.ScrollState.scroll = function (left, top, duration) {

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

}(window, jQuery));


(function (window, $, undefined) {

    var Fracs = window.Fracs = window.Fracs || {};


    Fracs.Element = function (element) {

        if (!(this instanceof Fracs.Element)) {
            return new Fracs.Element(element);
        }

        this.element = element;
        this.fracs = undefined;
        this.prevFracs = undefined;
        this.rect = undefined;
        this.prevRect = undefined;
        this.update();
    };

    Fracs.Element.prototype = {
        update: function () {

            var fracs = Fracs.Fractions.ofElement(this.element),
                rect = Fracs.Rect.ofElement(this.element),
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

}(window, jQuery));


(function (window, $, undefined) {

    var Fracs = window.Fracs = window.Fracs || {},
        fracsProps = ["possible", "visible", "viewport"],
        rectProps = ["width", "height", "left", "right", "top", "bottom"],
        propertyType = function (property) {

            if ($.inArray(property, fracsProps) >= 0) {
                return "fracs";
            } else if ($.inArray(property, rectProps) >= 0) {
                return "rect";
            }
        },
        betterMax = function (value, bestValue) {

            return value > bestValue;
        },
        betterMin = function (value, bestValue) {

            return value < bestValue;
        },
        best = function (elements, property, betterFn) {

            var bestElements, bestValue,
                type = propertyType(property);

            if (!type) {
                return {elements: [], value: undefined};
            }

            $.each(elements, function (idx, element) {

                var value;

                element.update();
                value = type === "fracs" ? element.fracs[property] : element.rect[property];

                if (bestValue === undefined || betterFn(value, bestValue)) {
                    bestElements = [element];
                    bestValue = value;
                } else if (value === bestValue) {
                    bestElements.push(element);
                }
            });

            return {elements: bestElements, value: bestValue};
        },
        htmlElementsToElements = function (htmlElements) {

            var elements = [];

            $.each(htmlElements, function (idx, htmlElement) {
                elements.push(Fracs.Element(htmlElement));
            });
            return elements;
        },
        elementsToHtmlElements = function (elements) {

            var htmlElements = [];

            $.each(elements, function (idx, element) {
                htmlElements.push(element.element);
            });
            return htmlElements;
        };


    Fracs.Group = function (htmlElements) {

        if (!(this instanceof Fracs.Group)) {
            return new Fracs.Group(htmlElements);
        }

        this.elements = htmlElementsToElements(htmlElements);
    };

    Fracs.Group.prototype = {
        max: function (property, asHTMLElements) {

            var result = best(this.elements, property, betterMax);
            return asHTMLElements === true ? elementsToHtmlElements(result.elements) : result;
        },
        min: function (property, asHTMLElements) {

            var result = best(this.elements, property, betterMin);
            return asHTMLElements === true ? elementsToHtmlElements(result.elements) : result;
        }
    };

}(window, jQuery));


(function (window, $, undefined) {

    var Fracs = window.Fracs = window.Fracs || {},
        scrollStateCallbacks,
        dataNs = "fracs",
        statics = {
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
                    return Fracs.ScrollState();
                }

                scrollStateCallbacks = scrollStateCallbacks || Fracs.ScrollStateCallbacks();
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
        methods = {
            bind: function (callback) {

                return this.each(function () {

                    var $this = $(this),
                        fracsCbs = $this.data(dataNs);

                    if (!fracsCbs) {
                        fracsCbs = Fracs.FracsCallbacks(this);
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

                        Fracs.CursorCallbacks(this).bind(callbackOrX);
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
                    Fracs.GroupCallbacks(this, "max", property).bind(callback);
                    return this;
                }

                return $(Fracs.Group(this).maxHtmlElements(property));
            },
            min: function (property, callback) {

                if (callback) {
                    Fracs.GroupCallbacks(this, "min", property).bind(callback);
                    return this;
                }

                return $(Fracs.Group(this).minHtmlElements(property));
            },
            rect: function () {

                return Fracs.Rect.ofElement(this.get(0));
            },
            softLink: function (paddingLeft, paddingTop, duration) {

                return this.filter("a[href^=#]").each(function () {
                    var $a = $(this);
                    $a.click(function () {
                        Fracs.ScrollState.scrollToElement($($a.attr("href")).get(0), paddingLeft, paddingTop, duration);
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
        defaultStatic = function () {

            return "fracs";
        },
        defaultMethod = function () {

            if (arguments.length === 0) {
                return "fracs";
            } else if (arguments[0] instanceof Function) {
                return "bind";
            }
        };

    $.ModPlug.plugin("fracs", {
        statics: statics,
        methods: methods,
        defaultStatic: defaultStatic,
        defaultMethod: defaultMethod
    });

}(window, jQuery));

/*
 * jQuery.fracs - Outline API
 */


(function (window, $, undefined) {

    var Fracs = window.Fracs = window.Fracs || {},
        $window = $(window),
        $htmlBody = $("html,body"),
        defaults = {
            crop: false,
            duration: 0,
            focusWidth: 0.5,
            focusHeight: 0.5,
            autoFocus: true,
            styles: [{
                selector: "header,footer,section,article",
                fillStyle: "rgb(230,230,230)"
            }, {
                selector: "h1",
                fillStyle: "rgb(240,140,060)"
            }, {
                selector: "h2",
                fillStyle: "rgb(200,100,100)"
            }, {
                selector: "h3",
                fillStyle: "rgb(100,200,100)"
            }, {
                selector: "h4",
                fillStyle: "rgb(100,100,200)"
            }],
            viewportStyle: {
                fillStyle: "rgba(228,77,38,0.3)"
            },
            viewportDragStyle: {
                fillStyle: "rgba(228,77,38,0.6)"
            },
            invertViewport: false
        };


    Fracs.Outline = function (canvas, options) {

        if (!(this instanceof Fracs.Outline)) {
            return new Fracs.Outline(canvas, options);
        }

        if (!canvas.nodeName || canvas.nodeName.toLowerCase() !== "canvas") {
            return undefined;
        }

        var settings = $.extend({}, defaults, options),
            $canvas = $(canvas),
            width = $canvas.attr("width"),
            height = $canvas.attr("height"),
            context = canvas.getContext("2d"),
            drag = false,
            docRect, vpRect, scale, focusWidth, focusHeight,
            drawRect = function (rect, strokeWidth, strokeStyle, fillStyle, invert) {

                if (strokeStyle || fillStyle) {
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
                }
            },
            drawElement = function (element, strokeWidth, strokeStyle, fillStyle) {

                var $element = $(element),
                    rect = Fracs.Rect.ofElement(element);

                if ($element.css("visibility") === "hidden" || rect.width === 0 || rect.height === 0) {
                    return;
                }

                strokeWidth = strokeWidth === "auto" ? parseInt($element.css("border-top-width"), 10) : strokeWidth;
                strokeStyle = strokeStyle === "auto" ? $element.css("border-top-color") : strokeStyle;
                fillStyle = fillStyle === "auto" ? $element.css("background-color") : fillStyle;
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
                    $canvas.attr("width", docRect.width * scale).attr("height", docRect.height * scale);
                }

                context.setTransform(1,0,0,1,0,0);
                context.clearRect(0, 0, $canvas.width(), $canvas.height());

                context.scale(scale, scale);
                applyStyles();
                drawViewport();
            },
            onDrag = function (event) {

                var r = $canvas.fracs("rect"),
                    x = event.pageX - r.left,
                    y = event.pageY - r.top;

                Fracs.ScrollState.scrollTo(x / scale - vpRect.width * focusWidth, y / scale - vpRect.height * focusHeight, settings.duration);
            },
            onDragEnd = function (event) {

                drag = false;
                event.preventDefault();

                $canvas.css("cursor", "pointer").removeClass("dragOn");
                $htmlBody.css("cursor", "auto");
                $window.unbind("mousemove", onDrag);
                draw();
            },
            onDragStart = function (event) {

                var r;
                if (settings.autoFocus) {
                    r = $canvas.fracs("rect");
                    focusWidth = (((event.pageX - r.left) / scale) - vpRect.left) / vpRect.width;
                    focusHeight = (((event.pageY - r.top) / scale) - vpRect.top) / vpRect.height;
                }
                if (!settings.autoFocus || focusWidth < 0 || focusWidth > 1 || focusHeight < 0 || focusHeight > 1) {
                    focusWidth = settings.focusWidth;
                    focusHeight = settings.focusHeight;
                }

                drag = true;
                event.preventDefault();

                $canvas.css("cursor", "crosshair").addClass("dragOn");
                $htmlBody.css("cursor", "crosshair");
                $window.bind("mousemove", onDrag).one("mouseup", onDragEnd);
                onDrag(event);
            },
            init = function () {

                $canvas.css("cursor", "pointer").mousedown(onDragStart);
                $window.bind("load resize scroll", draw);
                draw();
            };

        init();

        this.redraw = draw;
    };

}(window, jQuery));


(function (window, $, undefined) {

    var Fracs = window.Fracs = window.Fracs || {},
        dataNs = "outline",
        methods = {
            outline: function (options) {

                return this.each(function () {

                    var outline;

                    if (options === "redraw") {
                        outline = $(this).data(dataNs);
                        if (outline) {
                            outline.redraw();
                        }
                    } else {
                        outline = Fracs.Outline(this, options);
                        if (outline) {
                            $(this).data(dataNs, outline);
                        }
                    }
                });
            }
        };

    $.ModPlug.module("fracs", {
        methods: methods
    });

}(window, jQuery));

