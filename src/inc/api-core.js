/*
 * jQuery.fracs - Core API
 */

// @include "Rect.js"
// @include "Fractions.js"
// @include "Cursor.js"
// @include "Callbacks.js"
// @include "ScrollState.js"
// @include "Element.js"
// @include "Group.js"

(function (window, $, undefined) {
    "use strict";

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
