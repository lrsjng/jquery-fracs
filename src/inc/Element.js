
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
