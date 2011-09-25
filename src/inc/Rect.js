/******************
 * Rect
 ******************/
/*globals $, Fracs, $window, $document, $htmlBody */

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

$.extend(Fracs.Rect, {
    prototype: {
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
    },
    ofDocument: function () {

        return Fracs.Rect(0, 0, $document.width(), $document.height());
    },
    ofViewport: function () {

        return Fracs.Rect($window.scrollLeft(), $window.scrollTop(), $window.width(), $window.height());
    },
    ofElement: function (element) {

        var $element = $(element),
            offset;

        if (!$element.is(":visible")) {
            return Fracs.Rect(0,0,-1,0);
        }

        offset = $element.offset();
        return Fracs.Rect(offset.left, offset.top, $element.outerWidth(), $element.outerHeight());
    }
});
