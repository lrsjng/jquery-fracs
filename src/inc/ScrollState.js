
(function (window, $, undefined) {
    "use strict";

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
