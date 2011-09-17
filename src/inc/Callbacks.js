
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
