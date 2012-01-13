/*!
 * jQuery.fracs %BUILD_VERSION%
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
        isInstanceOf = function (obj, type) {

            return obj instanceof type;
        },
        equal = function (obj1, obj2, props) {

            var i, l, prop;

            if (obj1 === obj2) {
                return true;
            }
            if (!obj1 || !obj2 || obj1.constructor !== obj2.constructor) {
                return false;
            }
            for (i = 0, l = props.length; i < l; i += 1) {
                prop = props[i];
                if (obj1[prop] && isFn(obj1[prop].equals) && !obj1[prop].equals(obj2[prop])) {
                    return false;
                }
                if (obj1[prop] !== obj2[prop]) {
                    return false;
                }
            }
            return true;
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

    // ### Prototype
    extend(Rect.prototype, {

        // Checks if this instance equals `that` in position and dimensions.
        equals: function (that) {

            return equal(this, that, ['left', 'top', 'width', 'height']);
        },

        // Returns the area of this rectangle.
        area: function () {

            return this.width * this.height;
        },

        // Returns a new `Rect` representig this rect relative to `rect`.
        relativeTo: function (rect) {

            return new Rect(this.left - rect.left, this.top - rect.top, this.width, this.height);
        },

        // Returns a new rectangle representing the intersection of this instance and `rect`.
        // If there is no intersection the return value is `null`.
        intersection: function (rect) {

            if (!isInstanceOf(rect, Rect)) {
                return null;
            }

            var left = mathMax(this.left, rect.left),
                right = mathMin(this.right, rect.right),
                top = mathMax(this.top, rect.top),
                bottom = mathMin(this.bottom, rect.bottom),
                width = right - left,
                height = bottom - top;

            return (width >= 0 && height >= 0) ? new Rect(left, top, width, height) : null;
        },

        // Returns a new rectangle representing the smallest rectangle containing this instance and `rect`.
        envelope: function (rect) {

            if (!isInstanceOf(rect, Rect)) {
                return this;
            }

            var left = mathMin(this.left, rect.left),
                right = mathMax(this.right, rect.right),
                top = mathMin(this.top, rect.top),
                bottom = mathMax(this.bottom, rect.bottom),
                width = right - left,
                height = bottom - top;

            return new Rect(left, top, width, height);
        }
    });

    // ### Static methods
    extend(Rect, {

        // Returns a new instance of `Rect` representing the document.
        // Since the coordinates are in document space the `left` and `top` values
        // are always set to `0`.
        ofDocument: function (element) {

            if (!element || element === document || element === window) {
                return new Rect(0, 0, $document.width(), $document.height());
            }

            return new Rect(0, 0, element.scrollWidth, element.scrollHeight);
        },

        // Returns a new instance of `Rect` representing the viewport.
        ofViewport: function (element) {

            if (!element || element === document || element === window) {
                return new Rect($window.scrollLeft(), $window.scrollTop(), $window.width(), $window.height());
            }

            return new Rect(element.scrollLeft, element.scrollTop, element.clientWidth, element.clientHeight);
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



    // Fractions
    // ---------
    // The heart of the library. Holds the fractions data.
    // There are two constructors to create this data for a given instance of `Rect`
    // or an `HTMLElement`.
    var Fractions = function (rectDocument, rectElement, rectViewport, visible, viewport, possible) {

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

    // ### Prototype
    extend(Fractions.prototype, {

        // Checks if this instance equals `that` in all attributes.
        equals: function (that) {

            return this.fracsEqual(that) && this.rectsEqual(that);
        },

        // Checks if this instance equals `that` in all fraction attributes.
        fracsEqual: function (that) {

            return equal(this, that, ['visible', 'viewport', 'possible']);
        },

        // Checks if this instance equals `that` in all rectangle attributes.
        rectsEqual: function (that) {

            return equal(this.rects, that.rects, ['document', 'element', 'viewport']);
        }
    });

    // ### Static methods
    extend(Fractions, {

        // Returns a new instance of `Fractions` for the given `rect: Rect`
        // and `viewport: Rect`.
        // `viewport` defaults to `Rect.ofViewport()`.
        ofRect: function (rect, viewport) {

            var intersection, intersectionArea, possibleArea;

            viewport = viewport || Rect.ofViewport();
            intersection = rect && rect.intersection(viewport);

            if (!intersection) {
                return new Fractions();
            }

            intersectionArea = intersection.area();
            possibleArea = mathMin(rect.width, viewport.width) * mathMin(rect.height, viewport.height);

            return new Fractions(
                intersection,
                intersection.relativeTo(rect),
                intersection.relativeTo(viewport),
                intersectionArea / rect.area(),
                intersectionArea / viewport.area(),
                intersectionArea / possibleArea
           );
        },

        // Returns a new instance of `Fractions` for the given `element: HTMLElement`
        // and `viewport: Rect`.
        ofElement: function (element, viewport) {

            return Fractions.ofRect(Rect.ofElement(element), viewport);
        }
    });



    // Group
    // -----
    var Group = function (htmlElements) {

        this.els = htmlElements;
    };

    // ### Helpers

        // Accepted values for `property` parameters below.
    var rectProps = ['width', 'height', 'left', 'right', 'top', 'bottom'],
        fracsProps = ['possible', 'visible', 'viewport'],

        // Returns the specified `property` for `HTMLElement element` or `0`
        // if `property` is invalid.
        getValue = function (element, property) {

            if ($.inArray(property, rectProps) >= 0) {
                return Rect.ofElement(element)[property];
            } else if ($.inArray(property, fracsProps) >= 0) {
                return Fractions.ofElement(element)[property];
            }
            return 0;
        },

        // Sorting functions.
        sortAscending = function (entry1, entry2) {

            return entry1.val - entry2.val;
        },
        sortDescending = function (entry1, entry2) {

            return entry2.val - entry1.val;
        };

    // ### Prototype
    extend(Group.prototype, {

        // Returns a sorted list of objects `{el: HTMLElement, val: Number}`
        // for the specified `property`. `descending` defaults to `false`.
        sorted: function (property, descending) {

            return $.map(this.els, function (element) {

                        return {
                            el: element,
                            val: getValue(element, property)
                        };
                    })
                    .sort(descending ? sortDescending : sortAscending);
        },

        // Returns the first element of the sorted list returned by `sorted` above,
        // or `null` if this list is empty.
        best: function (property, descending) {

            return this.els.length ? this.sorted(property, descending)[0] : null;
        }
    });



    // ScrollState
    // -----------
    var ScrollState = function (element) {

        var doc = Rect.ofDocument(element),
            vp = Rect.ofViewport(element),
            w = doc.width - vp.width,
            h = doc.height - vp.height;

        this.el = element || window;
        this.content = doc;
        this.viewport = vp;
        this.width = w <= 0 ? null : vp.left / w;
        this.height = h <= 0 ? null : vp.top / h;
        this.left = vp.left;
        this.top = vp.top;
        this.right = doc.right - vp.right;
        this.bottom = doc.bottom - vp.bottom;
    };

    // ### Prototype
    extend(ScrollState.prototype, {

        // Checks if this instance equals `that`.
        equals: function (that) {

            return equal(this, that, ['el', 'width', 'height', 'left', 'top', 'right', 'bottom', 'content', 'viewport']);
        }
    });

    // ### Static methods
    extend(ScrollState, {

        scrollTo: function (left, top, duration) {

            left = left || 0;
            top = top || 0;
            duration = isNaN(duration) ? 1000 : duration;

            $htmlBody.stop(true).animate({scrollLeft: left, scrollTop: top}, duration);
        },

        scroll: function (left, top, duration) {

            left = left || 0;
            top = top || 0;

            ScrollState.scrollTo($window.scrollLeft() + left, $window.scrollTop() + top, duration);
        },

        scrollToRect: function (rect, paddingLeft, paddingTop, duration) {

            paddingLeft = paddingLeft || 0;
            paddingTop = paddingTop || 0;

            ScrollState.scrollTo(rect.left - paddingLeft, rect.top - paddingTop, duration);
        },

        scrollToElement: function (element, paddingLeft, paddingTop, duration) {

            var rect = Rect.ofElement(element);

            ScrollState.scrollToRect(rect, paddingLeft, paddingTop, duration);
        }
    });





    // Callbacks
    // =========

    // callbacks mix-in
    // ----------------
    // Expects `context: HTMLElement` and `updatedValue: function`.
    var callbacksMixIn = {

        // Initial setup.
        init: function () {

            this.callbacks = $.Callbacks('memory unique');
            this.currVal = null;
            this.prevVal = null;

            // A proxy to make `check` bindable to events.
            this.checkProxy = $.proxy(this.check, this);

            this.autoCheck();
        },

        // Adds a new callback function.
        bind: function (callback) {

            this.callbacks.add(callback);
        },

        // Removes a previously added callback function.
        unbind: function (callback) {

            if (callback) {
                this.callbacks.remove(callback);
            } else {
                this.callbacks.empty();
            }
        },

        // Triggers all callbacks with the current values.
        trigger: function () {

            this.callbacks.fireWith(this.context, [this.currVal, this.prevVal]);
        },

        // Checks if value changed, updates attributes `currVal` and
        // `prevVal` accordingly and triggers the callbacks. Returns
        // `true` if value changed, otherwise `false`.
        check: function (event) {

            var value = this.updatedValue(event);

            if (value === undefined) {
                return false;
            }

            this.prevVal = this.currVal;
            this.currVal = value;
            this.trigger();
            return true;
        },

        // Auto-check configuration.
        $autoTarget: $window,
        autoEvents: 'load resize scroll',

        // Enables/disables automated checking for changes on the specified `window`
        // events.
        autoCheck: function (on) {

            this.$autoTarget[on === false ? 'off' : 'on'](this.autoEvents, this.checkProxy);
        }
    };



    // FracsCallbacks
    // --------------
    var FracsCallbacks = function (element) {

        this.context = element;
        this.init();
    };

    // ### Prototype
    extend(FracsCallbacks.prototype, callbacksMixIn, {
        updatedValue: function () {

            var value = isInstanceOf(this.context, Rect) ? Fractions.ofRect(this.context) : Fractions.ofElement(this.context);

            if (!this.currVal || !this.currVal.equals(value)) {
                return value;
            }
        }
    });



    // GroupCallbacks
    // --------------
    var GroupCallbacks = function (htmlElements, property, descending) {

        this.context = new Group(htmlElements);
        this.property = property;
        this.descending = descending;
        this.init();
    };

    // ### Prototype
    extend(GroupCallbacks.prototype, callbacksMixIn, {
        updatedValue: function () {

            var best = this.context.best(this.property, this.descending);

            if (best) {
                best = best.val > 0 ? best.el : null;
                if (this.currVal !== best) {
                    return best;
                }
            }
        }
    });



    // ScrollStateCallbacks
    // --------------------
    var ScrollStateCallbacks = function (element) {

        if (!element || element === window || element === document) {
            this.context = window;
        } else {
            this.context = element;
            this.$autoTarget = $(element);
        }
        this.init();
    };

    // ### Prototype
    extend(ScrollStateCallbacks.prototype, callbacksMixIn, {
        updatedValue: function () {

            var value = new ScrollState(this.context);

            if (!this.currVal || !this.currVal.equals(value)) {
                return value;
            }
        }
    });





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
    var namespace = 'fracs',

        // Single reference to the window scroll state callback functions.
        scrollStateCbs = new ScrollStateCallbacks();

    // The methods are sorted in alphabetical order. All methods that do
    // not provide a return value will return `this` to enable method chaining.
    modplug(namespace, {

        // Static methods
        // --------------
        // These methods are accessible via `$.fracs.<methodname>`.
        statics: {

            // Build version.
            version: '%BUILD_VERSION%',

            // Publish object constructors (for testing).
            Rect: Rect,
            Fractions: Fractions,
            Group: Group,
            ScrollState: ScrollState,
            FracsCallbacks: FracsCallbacks,
            GroupCallbacks: GroupCallbacks,
            ScrollStateCallbacks: ScrollStateCallbacks,

            // ### document
            // Returns the dimension of the whole document.
            //
            //      $.fracs.document(): Rect
            document: function () {

                return Rect.ofDocument();
            },

            // ### fracs
            // This is the **default method**. So instead of calling `$.fracs.fracs(...)`
            // simply call `$.fracs(...)`.
            //
            // Returns the fractions for an `Rect` or `HTMLElement` and `viewport`,
            // viewport defaults to `$.fracs.viewport()`.
            //
            //      $.fracs(rect: Rect, [viewport: Rect]): Fractions
            //      $.fracs(element: HTMLElement, [viewport: Rect]): Fractions
            fracs: function (rect, viewport) {

                return isInstanceOf(rect, Rect) ? Fractions.ofRect(rect, viewport) : Fractions.ofElement(rect, viewport);
            },

            // ### rect
            // Returns the element's dimensions in document space.
            //
            //      $.Rect(element: HTMLElement): Rect
            rect: function (element) {

                return Rect.ofElement(element);
            },

            // ### scroll
            // Scrolls the viewport relative to the current position, `duration`
            // defaults to `1000`.
            //
            //      $.fracs.scroll(left: int, top: int, [duration: int])
            scroll: function (left, top, duration) {

                ScrollState.scroll(left, top, duration);
                return this;
            },

            // ### scrollState
            // Returns the current scroll state.
            //
            //      $.ScrollState(): ScrollState
            //
            // Binds a callback function that will be invoked if scroll state has changed
            // after a `window resize` or `window scroll` event.
            //
            //      $.ScrollState(callback(state: ScrollState, prevState: ScrollState)): jQuery
            //
            // Unbinds the specified callback function.
            //
            //      $.ScrollState('unbind', callback): jQuery
            //
            // Unbinds all callback functions.
            //
            //      $.ScrollState('unbind'): jQuery
            scrollState: function (unbind, callback) {

                if (isFn(unbind)) {
                    callback = unbind;
                    unbind = null;
                }

                if (unbind === 'unbind') {
                    scrollStateCbs.unbind(callback);
                    return this;
                } else if (isFn(callback)) {
                    scrollStateCbs.bind(callback);
                    return this;
                }

                return new ScrollState();
            },

            // ### scrollTo
            // Scrolls the viewport, `duration` defaults to `1000`.
            //
            //      $.fracs.scrollTo(left: int, top: int, [duration: int])
            scrollTo: function (left, top, duration) {

                ScrollState.scrollTo(left, top, duration);
                return this;
            },

            // ### viewport
            // Returns the current viewport in document space.
            //
            //      $.fracs.viewport(): Rect
            viewport: function () {

                return Rect.ofViewport();
            }
        },

        // Instance methods
        // ----------------
        // These methods are accessible via `$(selector).fracs('<methodname>', ...)`.
        methods: {

            // ### 'envelope'
            // Returns the smallest rectangle that containes all selected elements.
            //
            //      .fracs('envelope'): Rect
            envelope: function () {

                var envelope = null,
                    rect;

                this.each(function () {
                    rect = Rect.ofElement(this);
                    envelope = envelope ? envelope.envelope(rect) : rect;
                });
                return envelope;
            },

            // ### 'fracs'
            // This is the **default method**. So the first parameter `'fracs'`
            // can be omitted.
            //
            // Returns the fractions for the first selected element.
            //
            //      .fracs(): Fractions
            //
            // Binds a callback function that will be invoked if fractions have changed
            // after a `window resize` or `window scroll` event.
            //
            //      .fracs(callback(fracs: Fractions, prevFracs: Fractions)): jQuery
            //
            // Unbinds the specified callback function.
            //
            //      .fracs('unbind', callback): jQuery
            //
            // Unbinds all callback functions.
            //
            //      .fracs('unbind'): jQuery
            //
            // Checks if fractions changed and if so invokes all bound callback functions.
            //
            //      .fracs('check'): jQuery
            fracs: function (action, callback) {

                var ns = namespace + '.fracs';

                if (isFn(action)) {
                    callback = action;
                    action = null;
                }

                if (action === 'unbind') {
                    return this.each(function () {

                        var cbs = $(this).data(ns);

                        if (cbs) {
                            cbs.unbind(callback);
                        }
                    });
                } else if (action === 'check') {
                    return this.each(function () {

                        var cbs = $(this).data(ns);

                        if (cbs) {
                            cbs.check();
                        }
                    });
                } else if (isFn(callback)) {
                    return this.each(function () {

                        var $this = $(this),
                            cbs = $this.data(ns);

                        if (!cbs) {
                            cbs = new FracsCallbacks(this);
                            $this.data(ns, cbs);
                        }
                        cbs.bind(callback);
                    });
                }

                return Fractions.ofElement(this[0]);
            },

            // ### 'max'
            // Reduces the set of selected elements to those with the maximum value
            // of the specified property.
            // Valid values for property are `possible`, `visible`, `viewport`,
            // `width`, `height`, `left`, `right`, `top`, `bottom`.
            //
            //      .fracs('max', property: String): jQuery
            //
            // Binds a callback function to the set of selected elements that gets
            // triggert whenever the element with the highest value of the specified
            // property changes.
            //
            //      .fracs('max', property: String, callback(best: Element, prevBest: Element)): jQuery
            max: function (property, callback) {

                if (callback) {
                    new GroupCallbacks(this, property, true).bind(callback);
                    return this;
                }

                return $(new Group(this).best(property, true).el);
            },

            // ### 'min'
            // Reduces the set of selected elements to those with the minimum value
            // of the specified property.
            // Valid values for property are `possible`, `visible`, `viewport`,
            // `width`, `height`, `left`, `right`, `top`, `bottom`.
            //
            //      .fracs('min', property: String): jQuery
            //
            // Binds a callback function to the set of selected elements that gets
            // triggert whenever the element with the lowest value of the specified
            // property changes.
            //
            //      .fracs('min', property: String, callback(best: Element, prevBest: Element)): jQuery
            min: function (property, callback) {

                if (callback) {
                    new GroupCallbacks(this, property).bind(callback);
                    return this;
                }

                return $(new Group(this).best(property).el);
            },

            // ### 'rect'
            // Returns the dimensions for the first selected element in document space.
            //
            //      .fracs('rect'): Rect
            rect: function () {

                return Rect.ofElement(this[0]);
            },

            // ### 'scrollState'
            // Returns the current scroll state for the first selected element.
            //
            //      .fracs('scrollState'): ScrollState
            //
            // Binds a callback function that will be invoked if scroll state has changed
            // after a `resize` or `scroll` event.
            //
            //      .fracs('scrollState', callback(scrollState: scrollState, prevScrollState: scrollState)): jQuery
            //
            // Unbinds the specified callback function.
            //
            //      .fracs('scrollState', 'unbind', callback): jQuery
            //
            // Unbinds all callback functions.
            //
            //      .fracs('scrollState', 'unbind'): jQuery
            //
            // Checks if scroll state changed and if so invokes all bound callback functions.
            //
            //      .fracs('scrollState', 'check'): jQuery
            scrollState: function (action, callback) {

                var ns = namespace + '.scrollState';

                if (isFn(action)) {
                    callback = action;
                    action = null;
                }

                if (action === 'unbind') {
                    return this.each(function () {

                        var cbs = $(this).data(ns);

                        if (cbs) {
                            cbs.unbind(callback);
                        }
                    });
                } else if (action === 'check') {
                    return this.each(function () {

                        var cbs = $(this).data(ns);

                        if (cbs) {
                            cbs.check();
                        }
                    });
                } else if (isFn(callback)) {
                    return this.each(function () {

                        var $this = $(this),
                            cbs = $this.data(ns);

                        if (!cbs) {
                            cbs = new ScrollStateCallbacks(this);
                            $this.data(ns, cbs);
                        }
                        cbs.bind(callback);
                    });
                }

                return new ScrollState(this[0]);
            },

            // ### 'scrollTo'
            // Scrolls the viewport (window) to the first selected element in the specified time,
            // `padding` defaults to `0`, `duration` to `1000`.
            //
            //      .fracs('scrollTo', [paddingLeft: int,] [paddingTop: int,] [duration: int]): jQuery
            scrollTo: function (paddingLeft, paddingTop, duration) {

                ScrollState.scrollToElement(this[0], paddingLeft, paddingTop, duration);
                return this;
            },

            // ### 'softLink'
            // Converts all selected page intern links `<a href="#...">` into soft links.
            // Uses `scrollTo` to scroll to the location.
            //
            //      .fracs('softLink', [paddingLeft: int,] [paddingTop: int,] [duration: int]): jQuery
            softLink: function (paddingLeft, paddingTop, duration) {

                return this.filter('a[href^=#]').each(function () {
                    var $a = $(this);
                    $a.click(function () {
                        ScrollState.scrollToElement($($a.attr('href'))[0], paddingLeft, paddingTop, duration);
                    });
                });
            },

            // ### 'sort'
            // Sorts the set of selected elements by the specified property.
            // Valid values for property are `possible`, `visible`, `viewport`,
            // `width`, `height`, `left`, `right`, `top`, `bottom`. The default
            // sort order is descending.
            //
            //      .fracs('sort', property: String, [ascending: boolean]): jQuery
            sort: function (property, ascending) {

                return $($.map(new Group(this).sorted(property, !ascending), function (entry) {
                    return entry.el;
                }));
            }
        },

        // Defaults
        // --------
        defaultStatic: 'fracs',
        defaultMethod: 'fracs'
    });

})(window, document, jQuery);
