
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
