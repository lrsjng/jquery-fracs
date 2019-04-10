(() => {
    const WIN = window; // eslint-disable-line
    const DOC = WIN.document;
    const $ = WIN.jQuery;
    const $win = $(WIN);
    const $doc = $(DOC);
    const extend = $.extend;
    const is_fn = $.isFunction;
    const math_max = Math.max;
    const math_min = Math.min;
    const math_round = Math.round;
    const is_typeof = (obj, type) => typeof obj === type;
    const is_instanceof = (obj, type) => obj instanceof type;
    const is_html_el = obj => obj && obj.nodeType;
    const get_html_el = obj => is_html_el(obj) ? obj : is_instanceof(obj, $) ? obj[0] : undefined;

    const get_id = (() => {
        const ids = {};
        let next_id = 1;

        return el => {
            if (!el) {
                return 0;
            }
            if (!ids[el]) {
                ids[el] = next_id;
                next_id += 1;
            }
            return ids[el];
        };
    })();

    const reduce = (els, fn, current) => {
        $.each(els, (idx, el) => {
            current = Reflect.apply(fn, el, [current, idx, el]);
        });
        return current;
    };

    const equal = (x, y, props) => {
        if (x === y) {
            return true;
        }
        if (!x || !y || x.constructor !== y.constructor) {
            return false;
        }
        for (let i = 0, l = props.length; i < l; i += 1) {
            const prop = props[i];
            if (x[prop] && is_fn(x[prop].equals) && !x[prop].equals(y[prop])) {
                return false;
            }
            if (x[prop] !== y[prop]) {
                return false;
            }
        }
        return true;
    };




    function Rect(left, top, width, height) {
        this.left = math_round(left);
        this.top = math_round(top);
        this.width = math_round(width);
        this.height = math_round(height);
        this.right = this.left + this.width;
        this.bottom = this.top + this.height;
    }

    extend(Rect.prototype, {
        equals(that) {
            return equal(this, that, ['left', 'top', 'width', 'height']);
        },

        area() {
            return this.width * this.height;
        },

        relativeTo(rect) {
            return new Rect(this.left - rect.left, this.top - rect.top, this.width, this.height);
        },

        intersection(rect) {
            if (!is_instanceof(rect, Rect)) {
                return null;
            }

            const left = math_max(this.left, rect.left);
            const right = math_min(this.right, rect.right);
            const top = math_max(this.top, rect.top);
            const bottom = math_min(this.bottom, rect.bottom);
            const width = right - left;
            const height = bottom - top;

            return width >= 0 && height >= 0 ? new Rect(left, top, width, height) : null;
        },

        envelope(rect) {
            if (!is_instanceof(rect, Rect)) {
                return this;
            }

            const left = math_min(this.left, rect.left);
            const right = math_max(this.right, rect.right);
            const top = math_min(this.top, rect.top);
            const bottom = math_max(this.bottom, rect.bottom);
            const width = right - left;
            const height = bottom - top;

            return new Rect(left, top, width, height);
        }
    });

    extend(Rect, {
        ofContent(el, in_content_space) {
            if (!el || el === DOC || el === WIN) {
                return new Rect(0, 0, $doc.width(), $doc.height());
            }

            if (in_content_space) {
                return new Rect(0, 0, el.scrollWidth, el.scrollHeight);
            }

            return new Rect(el.offsetLeft - el.scrollLeft, el.offsetTop - el.scrollTop, el.scrollWidth, el.scrollHeight);
        },

        ofViewport(el, in_content_space) {
            if (!el || el === DOC || el === WIN) {
                return new Rect($win.scrollLeft(), $win.scrollTop(), $win.width(), $win.height());
            }

            if (in_content_space) {
                return new Rect(el.scrollLeft, el.scrollTop, el.clientWidth, el.clientHeight);
            }

            return new Rect(el.offsetLeft, el.offsetTop, el.clientWidth, el.clientHeight);
        },

        ofElement(el) {
            const $el = $(el);
            if (!$el.is(':visible')) {
                return null;
            }

            const offset = $el.offset();
            return new Rect(offset.left, offset.top, $el.outerWidth(), $el.outerHeight());
        }
    });




    function Fractions(visible, viewport, possible, rects) {
        this.visible = visible || 0;
        this.viewport = viewport || 0;
        this.possible = possible || 0;
        this.rects = rects && extend({}, rects) || null;
    }

    extend(Fractions.prototype, {
        equals(that) {
            return this.fracsEqual(that) && this.rectsEqual(that);
        },

        fracsEqual(that) {
            return equal(this, that, ['visible', 'viewport', 'possible']);
        },

        rectsEqual(that) {
            return equal(this.rects, that.rects, ['document', 'element', 'viewport']);
        }
    });

    extend(Fractions, {
        of(rect, viewport) {
            rect = is_html_el(rect) && Rect.ofElement(rect) || rect;
            viewport = is_html_el(viewport) && Rect.ofViewport(viewport) || viewport || Rect.ofViewport();

            if (!is_instanceof(rect, Rect)) {
                return new Fractions();
            }

            const intersection = rect.intersection(viewport);
            if (!intersection) {
                return new Fractions();
            }

            const intersectionArea = intersection.area();
            const possibleArea = math_min(rect.width, viewport.width) * math_min(rect.height, viewport.height);
            return new Fractions(
                intersectionArea / rect.area(),
                intersectionArea / viewport.area(),
                intersectionArea / possibleArea,
                {
                    document: intersection,
                    element: intersection.relativeTo(rect),
                    viewport: intersection.relativeTo(viewport)
                }
            );
        }
    });




    function Group(els, viewport) {
        this.els = els;
        this.viewport = viewport;
    }

    const RECT_PROPS = ['width', 'height', 'left', 'right', 'top', 'bottom'];
    const FRACS_PROPS = ['possible', 'visible', 'viewport'];

    const get_value = (el, viewport, prop) => {
        let obj;
        if (RECT_PROPS.includes(prop)) {
            obj = Rect.ofElement(el);
        } else if (FRACS_PROPS.includes(prop)) {
            obj = Fractions.of(el, viewport);
        }
        return obj ? obj[prop] : 0;
    };

    const sort_asc = (x, y) => x.val - y.val;
    const sort_desc = (x, y) => y.val - x.val;

    extend(Group.prototype, {
        sorted(prop, desc) {
            const viewport = this.viewport;

            return $.map(this.els, el => {
                return {
                    el,
                    val: get_value(el, viewport, prop)
                };
            }).sort(desc ? sort_desc : sort_asc);
        },

        best(prop, desc) {
            return this.els.length ? this.sorted(prop, desc)[0] : null;
        }
    });




    function ScrollState(el) {
        const content = Rect.ofContent(el, true);
        const viewport = Rect.ofViewport(el, true);
        const w = content.width - viewport.width;
        const h = content.height - viewport.height;

        this.content = content;
        this.viewport = viewport;
        this.width = w <= 0 ? null : viewport.left / w;
        this.height = h <= 0 ? null : viewport.top / h;
        this.left = viewport.left;
        this.top = viewport.top;
        this.right = content.right - viewport.right;
        this.bottom = content.bottom - viewport.bottom;
    }

    extend(ScrollState.prototype, {
        equals(that) {
            return equal(this, that, ['width', 'height', 'left', 'top', 'right', 'bottom', 'content', 'viewport']);
        }
    });




    function Viewport(el) {
        this.el = el || WIN;
    }

    extend(Viewport.prototype, {
        equals(that) {
            return equal(this, that, ['el']);
        },

        scrollState() {
            return new ScrollState(this.el);
        },

        scrollTo(left, top, duration) {
            const $el = this.el === WIN ? $('html,body') : $(this.el);
            left = left || 0;
            top = top || 0;
            duration = isNaN(duration) ? 1000 : duration;
            $el.stop(true).animate({scrollLeft: left, scrollTop: top}, duration);
        },

        scroll(left, top, duration) {
            const $el = this.el === WIN ? $win : $(this.el);
            left = left || 0;
            top = top || 0;
            this.scrollTo($el.scrollLeft() + left, $el.scrollTop() + top, duration);
        },

        scrollToRect(rect, left, top, duration) {
            left = left || 0;
            top = top || 0;
            this.scrollTo(rect.left - left, rect.top - top, duration);
        },

        scrollToElement(el, left, top, duration) {
            const rect = Rect.ofElement(el).relativeTo(Rect.ofContent(this.el));
            this.scrollToRect(rect, left, top, duration);
        }
    });




    // Callbacks
    // =========

    // callbacks mix-in
    // ----------------
    // Expects `context: HTMLElement` and `updatedValue: function`.
    const callback_mixin = {
        init() {
            this.callbacks = $.Callbacks('memory unique');
            this.currVal = null;
            this.prevVal = null;

            // A proxy to make `check` bindable to events.
            this.checkProxy = $.proxy(this.check, this);

            this.autoCheck();
        },

        // Adds a new callback function.
        bind(callback) {
            this.callbacks.add(callback);
        },

        // Removes a previously added callback function.
        unbind(callback) {
            if (callback) {
                this.callbacks.remove(callback);
            } else {
                this.callbacks.empty();
            }
        },

        // Triggers all callbacks with the current values.
        trigger() {
            this.callbacks.fireWith(this.context, [this.currVal, this.prevVal]);
        },

        // Checks if value changed, updates attributes `currVal` and
        // `prevVal` accordingly and triggers the callbacks. Returns
        // `true` if value changed, otherwise `false`.
        check(event) {
            const value = this.updatedValue(event);

            if (value === undefined) {
                return false;
            }

            this.prevVal = this.currVal;
            this.currVal = value;
            this.trigger();
            return true;
        },

        // Auto-check configuration.
        $autoTarget: $win,
        autoEvents: 'load resize scroll',

        // Enables/disables automated checking for changes on the specified `window`
        // events.
        autoCheck(on) {
            this.$autoTarget[on === false ? 'off' : 'on'](this.autoEvents, this.checkProxy);
        }
    };




    function FracsCallbacks(el, viewport) {
        this.context = el;
        this.viewport = viewport;
        this.init();
    }

    extend(FracsCallbacks.prototype, callback_mixin, {
        updatedValue() {
            const value = Fractions.of(this.context, this.viewport);

            if (!this.currVal || !this.currVal.equals(value)) {
                return value;
            }
            return undefined;
        }
    });




    function GroupCallbacks(els, viewport, prop, desc) {
        this.context = new Group(els, viewport);
        this.property = prop;
        this.descending = desc;
        this.init();
    }

    extend(GroupCallbacks.prototype, callback_mixin, {
        updatedValue() {
            let best = this.context.best(this.property, this.descending);
            if (best) {
                best = best.val > 0 ? best.el : null;
                if (this.currVal !== best) {
                    return best;
                }
            }
            return undefined;
        }
    });




    function ScrollStateCallbacks(el) {
        if (!el || el === WIN || el === DOC) {
            this.context = WIN;
        } else {
            this.context = el;
            this.$autoTarget = $(el);
        }
        this.init();
    }

    extend(ScrollStateCallbacks.prototype, callback_mixin, {
        updatedValue() {
            const value = new ScrollState(this.context);

            if (!this.currVal || !this.currVal.equals(value)) {
                return value;
            }
            return undefined;
        }
    });


    const modplug = options => {
        const statics = (...args) => statics.fracs(...args);

        const methods = function (...args) { // eslint-disable-line
            let method = methods.fracs;
            if (is_fn(methods[args[0]])) {
                method = methods[args[0]];
                args = args.slice(1);
            }
            return Reflect.apply(method, this, args);
        };

        extend(statics, options.statics);
        extend(methods, options.methods);

        $.fracs = statics;
        $.fn.fracs = methods;
    };




    // The methods are sorted in alphabetical order. All methods that do not
    // provide a return value will return `this` to enable method chaining.
    modplug({
        // Static methods
        // --------------
        // These methods are accessible via `$.fracs.<methodname>`.
        statics: {
            // Publish object constructors (for testing).
            _: {
                Rect,
                Fractions,
                Group,
                ScrollState,
                Viewport,
                FracsCallbacks,
                GroupCallbacks,
                ScrollStateCallbacks
            },

            // ### fracs
            // This is the **default method**. So instead of calling
            // `$.fracs.fracs(...)` simply call `$.fracs(...)`.
            //
            // Returns the fractions for a given `Rect` and `viewport`,
            // viewport defaults to `$.fracs.viewport()`.
            //
            //      $.fracs(rect: Rect, [viewport: Rect]): Fractions
            fracs(rect, viewport) {
                return Fractions.of(rect, viewport);
            }
        },

        // Instance methods
        // ----------------
        // These methods are accessible via `$(selector).fracs('<methodname>', ...)`.
        methods: {
            // ### 'content'
            // Returns the content rect of the first selected element in content space.
            // If no element is selected it returns the document rect.
            //
            //      .fracs('content'): Rect
            content(in_content_space) {
                return this.length ? Rect.ofContent(this[0], in_content_space) : null;
            },

            // ### 'envelope'
            // Returns the smallest rectangle that containes all selected elements.
            //
            //      .fracs('envelope'): Rect
            envelope() {
                return reduce(this, function cb(current) {
                    const rect = Rect.ofElement(this);
                    return current ? current.envelope(rect) : rect;
                });
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
            fracs(action, callback, viewport) {
                if (!is_typeof(action, 'string')) {
                    viewport = callback;
                    callback = action;
                    action = null;
                }
                if (!is_fn(callback)) {
                    viewport = callback;
                    callback = null;
                }
                viewport = get_html_el(viewport);

                const ns = 'fracs.fracs.' + get_id(viewport);

                if (action === 'unbind') {
                    return this.each(function cb() {
                        const cbs = $(this).data(ns);
                        if (cbs) {
                            cbs.unbind(callback);
                        }
                    });
                } else if (action === 'check') {
                    return this.each(function cb() {
                        const cbs = $(this).data(ns);
                        if (cbs) {
                            cbs.check();
                        }
                    });
                } else if (is_fn(callback)) {
                    return this.each(function cb() {
                        const $this = $(this);
                        let cbs = $this.data(ns);
                        if (!cbs) {
                            cbs = new FracsCallbacks(this, viewport);
                            $this.data(ns, cbs);
                        }
                        cbs.bind(callback);
                    });
                }

                return this.length ? Fractions.of(this[0], viewport) : null;
            },

            // ### 'intersection'
            // Returns the greatest rectangle that is contained in all selected elements.
            //
            //      .fracs('intersection'): Rect
            intersection() {
                return reduce(this, function cb(current) {
                    const rect = Rect.ofElement(this);
                    return current ? current.intersection(rect) : rect;
                });
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
            max(prop, callback, viewport) {
                if (!is_fn(callback)) {
                    viewport = callback;
                    callback = null;
                }
                viewport = get_html_el(viewport);

                if (callback) {
                    new GroupCallbacks(this, viewport, prop, true).bind(callback);
                    return this;
                }

                return this.pushStack(new Group(this, viewport).best(prop, true).el);
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
            min(prop, callback, viewport) {
                if (!is_fn(callback)) {
                    viewport = callback;
                    callback = null;
                }
                viewport = get_html_el(viewport);

                if (callback) {
                    new GroupCallbacks(this, viewport, prop).bind(callback);
                    return this;
                }

                return this.pushStack(new Group(this, viewport).best(prop).el);
            },

            // ### 'rect'
            // Returns the dimensions for the first selected element in document space.
            //
            //      .fracs('rect'): Rect
            rect() {
                return this.length ? Rect.ofElement(this[0]) : null;
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
            scrollState(action, callback) {
                const ns = 'fracs.scrollState';

                if (!is_typeof(action, 'string')) {
                    callback = action;
                    action = null;
                }

                if (action === 'unbind') {
                    return this.each(function cb() {
                        const cbs = $(this).data(ns);
                        if (cbs) {
                            cbs.unbind(callback);
                        }
                    });
                } else if (action === 'check') {
                    return this.each(function cb() {
                        const cbs = $(this).data(ns);
                        if (cbs) {
                            cbs.check();
                        }
                    });
                } else if (is_fn(callback)) {
                    return this.each(function cb() {
                        const $this = $(this);
                        let cbs = $this.data(ns);
                        if (!cbs) {
                            cbs = new ScrollStateCallbacks(this);
                            $this.data(ns, cbs);
                        }
                        cbs.bind(callback);
                    });
                }

                return this.length ? new ScrollState(this[0]) : null;
            },

            // ### 'scroll'
            // Scrolls the selected elements relative to its current position,
            // `padding` defaults to `0`, `duration` to `1000`.
            //
            //      .fracs('scroll', element: HTMLElement/jQuery, [left: int,] [top: int,] [duration: int]): jQuery
            scroll(left, top, duration) {
                return this.each(function cb() {
                    new Viewport(this).scroll(left, top, duration);
                });
            },

            // ### 'scrollTo'
            // Scrolls the selected elements to the specified element or an absolute position,
            // `padding` defaults to `0`, `duration` to `1000`.
            //
            //      .fracs('scrollTo', element: HTMLElement/jQuery, [left: int,] [top: int,] [duration: int]): jQuery
            //      .fracs('scrollTo', [left: int,] [top: int,] [duration: int]): jQuery
            scrollTo(el, left, top, duration) {
                if ($.isNumeric(el)) {
                    duration = top;
                    top = left;
                    left = el;
                    el = null;
                }

                el = get_html_el(el);

                return this.each(function cb() {
                    if (el) {
                        new Viewport(this).scrollToElement(el, left, top, duration);
                    } else {
                        new Viewport(this).scrollTo(left, top, duration);
                    }
                });
            },

            // ### 'scrollToThis'
            // Scrolls the viewport (window) to the first selected element in the specified time,
            // `padding` defaults to `0`, `duration` to `1000`.
            //
            //      .fracs('scrollToThis', [left: int,] [top: int,] [duration: int,] [viewport: HTMLElement/jQuery]): jQuery
            scrollToThis(left, top, duration, viewport) {
                viewport = new Viewport(get_html_el(viewport));
                viewport.scrollToElement(this[0], left, top, duration);
                return this;
            },

            // ### 'softLink'
            // Converts all selected page intern links `<a href="#...">` into soft links.
            // Uses `scrollTo` to scroll to the location.
            //
            //      .fracs('softLink', [left: int,] [top: int,] [duration: int,] [viewport: HTMLElement/jQuery]): jQuery
            softLink(left, top, duration, viewport) {
                viewport = new Viewport(get_html_el(viewport));
                return this.filter('a[href^=#]').each(function cb() {
                    const $a = $(this);
                    $a.on('click', () => {
                        viewport.scrollToElement($($a.attr('href'))[0], left, top, duration);
                    });
                });
            },

            // ### 'sort'
            // Sorts the set of selected elements by the specified property.
            // Valid values for property are `possible`, `visible`, `viewport`,
            // `width`, `height`, `left`, `right`, `top`, `bottom`. The default
            // sort order is descending.
            //
            //      .fracs('sort', prop: String, [ascending: boolean]): jQuery
            sort(prop, ascending, viewport) {
                if (!is_typeof(ascending, 'boolean')) {
                    viewport = ascending;
                    ascending = null;
                }
                viewport = get_html_el(viewport);

                return this.pushStack($.map(new Group(this, viewport).sorted(prop, !ascending), entry => entry.el));
            },

            // ### 'viewport'
            // Returns the current viewport of the first selected element in content space.
            // If no element is selected it returns the document's viewport.
            //
            //      .fracs('viewport'): Rect
            viewport(in_content_space) {
                return this.length ? Rect.ofViewport(this[0], in_content_space) : null;
            }
        }
    });
})();
