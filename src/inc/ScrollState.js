

/******************
 * ScrollState
 ******************/

Fracs.ScrollState = function (width, height, left, top, right, bottom) {

    if (!(this instanceof Fracs.ScrollState)) {
        return new Fracs.ScrollState(width, height, left, top, right, bottom);
    }

    if (width === undefined || height === undefined || left === undefined || top === undefined || right === undefined || bottom === undefined) {
        var doc = Fracs.Rect.ofDocument(),
            vp = Fracs.Rect.ofViewport(),
            w = doc.width - vp.width,
            h = doc.height - vp.height;

        this.width = w <= 0 ? undefined : vp.left / w;
        this.height = h <= 0 ? undefined : vp.top / h;
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

$.extend(Fracs.ScrollState, {
    prototype: {
        equals: function (that) {

            return this.width === that.width && this.height === that.height &&
                this.left === that.left && this.top === that.top &&
                this.right === that.right && this.bottom === that.bottom;
        }
    },
    scrollTo: function (left, top, duration) {

        left = left || 0;
        top = top || 0;
        duration = isNaN(duration) ? 1000 : duration;

        $htmlBody.stop(true).animate({scrollLeft: left, scrollTop: top}, duration);
    },
    scroll: function (left, top, duration) {

        left = left || 0;
        top = top || 0;

        Fracs.ScrollState.scrollTo($window.scrollLeft() + left, $window.scrollTop() + top, duration);
    },
    scrollToRect: function (rect, paddingLeft, paddingTop, duration) {

        paddingLeft = paddingLeft || 0;
        paddingTop = paddingTop || 0;

        Fracs.ScrollState.scrollTo(rect.left - paddingLeft, rect.top - paddingTop, duration);
    },
    scrollToElement: function (element, paddingLeft, paddingTop, duration) {

        var rect = Fracs.Rect.ofElement(element);

        Fracs.ScrollState.scrollToRect(rect, paddingLeft, paddingTop, duration);
    }
});

