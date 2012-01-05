/*
 * Tests for jQuery.fracs %BUILD_VERSION%
 * http://larsjung.de/fracs
 *
 * provided under the terms of the MIT License
 */

/*globals jQuery, QUnit, Fracs */


(function ($, $$, Fracs) {
    'use strict';

    // Objects
    // =======

    // Rect
    // ----
    $$.module('Rect');

    $$.test('constructor', function () {

        var rect1 = new Fracs.Rect(30, 50, 400, 300),
            rect2 = new Fracs.Rect(30.1, 50.4, 400.3, 299.5);

        $$.strictEqual(rect1 instanceof Fracs.Rect, true, 'instanceof Fracs.Rect');

        $$.strictEqual(rect1.left, 30, 'left');
        $$.strictEqual(rect1.top, 50, 'top');
        $$.strictEqual(rect1.width, 400, 'width');
        $$.strictEqual(rect1.height, 300, 'height');
        $$.strictEqual(rect1.right, 430, 'right');
        $$.strictEqual(rect1.bottom, 350, 'bottom');

        $$.strictEqual(rect2.left, 30, 'left');
        $$.strictEqual(rect2.top, 50, 'top');
        $$.strictEqual(rect2.width, 400, 'width');
        $$.strictEqual(rect2.height, 300, 'height');
        $$.strictEqual(rect2.right, 430, 'right');
        $$.strictEqual(rect2.bottom, 350, 'bottom');
    });

    $$.test('equals', function () {

        var rect1 = new Fracs.Rect(30, 50, 400, 300),
            rect2 = new Fracs.Rect(30.1, 50.4, 400.3, 299.5),
            rect3 = new Fracs.Rect(100, 200, 400, 300);

        $$.strictEqual(rect1.equals(rect2), true, 'equal rects');
        $$.strictEqual(rect1.equals(rect3), false, 'unequal rects');
    });

    $$.test('area', function () {

        var rect1 = new Fracs.Rect(30, 50, 400, 300);

        $$.strictEqual(rect1.area(), 400 * 300, 'area');
    });

    $$.test('intersection', function () {

        var rect1 = new Fracs.Rect(30, 50, 400, 300),
            rect2 = new Fracs.Rect(100, 200, 400, 300),
            rect3 = new Fracs.Rect(500, 200, 400, 300),
            intersection = new Fracs.Rect(100, 200, 330, 150);

        $$.deepEqual(rect1.intersection(rect2), intersection, 'intersection');
        $$.deepEqual(rect1.intersection(rect3), null, 'no intersection');
        $$.deepEqual(rect1.intersection(null), null, 'no second rect');
    });

    $$.test('envelope', function () {

        var rect1 = new Fracs.Rect(30, 50, 400, 300),
            rect2 = new Fracs.Rect(100, 200, 400, 300),
            envelope = new Fracs.Rect(30, 50, 470, 450);

        $$.deepEqual(rect1.envelope(rect2), envelope, 'envelope');
        $$.deepEqual(rect1.envelope(null), rect1, 'no second rect');
    });

    $$.test('ofDocument', function () {

        var rect1 = Fracs.Rect.ofDocument();

        $$.strictEqual(rect1 instanceof Fracs.Rect, true, 'instanceof Fracs.Rect');
    });

    $$.test('ofViewport', function () {

        var rect1 = Fracs.Rect.ofViewport();

        $$.strictEqual(rect1 instanceof Fracs.Rect, true, 'instanceof Fracs.Rect');
    });

    $$.test('ofElement', function () {

        var rect1 = Fracs.Rect.ofElement($('body').get(0));

        $$.strictEqual(rect1 instanceof Fracs.Rect, true, 'instanceof Fracs.Rect');
    });



    // Fractions
    // ---------
    $$.module('Fractions');

    $$.test('constructor', function () {

        var rect1 = new Fracs.Rect(30, 50, 400, 300),
            rect2 = new Fracs.Rect(100, 200, 400, 300),
            rect3 = new Fracs.Rect(10, 20, 40, 30),
            fr = new Fracs.Fractions();

        $$.strictEqual(fr instanceof Fracs.Fractions, true, 'instanceof Fracs.Fractions');
        $$.strictEqual(fr.rects, null, 'rects');
        $$.strictEqual(fr.visible, 0, 'visible');
        $$.strictEqual(fr.viewport, 0, 'viewport');
        $$.strictEqual(fr.possible, 0, 'possible');

        fr = new Fracs.Fractions(undefined, undefined, undefined, 1, 1, 1);
        $$.strictEqual(fr instanceof Fracs.Fractions, true, 'instanceof Fracs.Fractions');
        $$.strictEqual(fr.rects, null, 'rects');
        $$.strictEqual(fr.visible, 0, 'visible');
        $$.strictEqual(fr.viewport, 0, 'viewport');
        $$.strictEqual(fr.possible, 0, 'possible');

        fr = new Fracs.Fractions(undefined, undefined, undefined, 0, 0, 1);
        $$.strictEqual(fr instanceof Fracs.Fractions, true, 'instanceof Fracs.Fractions');
        $$.strictEqual(fr.rects, null, 'rects');
        $$.strictEqual(fr.visible, 0, 'visible');
        $$.strictEqual(fr.viewport, 0, 'viewport');
        $$.strictEqual(fr.possible, 0, 'possible');

        fr = new Fracs.Fractions(undefined, undefined, undefined, 1, 1);
        $$.strictEqual(fr instanceof Fracs.Fractions, true, 'instanceof Fracs.Fractions');
        $$.strictEqual(fr.rects, null, 'rects');
        $$.strictEqual(fr.visible, 0, 'visible');
        $$.strictEqual(fr.viewport, 0, 'viewport');
        $$.strictEqual(fr.possible, 0, 'possible');

        fr = new Fracs.Fractions(rect1, rect2, rect3, 1, 1);
        $$.strictEqual(fr instanceof Fracs.Fractions, true, 'instanceof Fracs.Fractions');
        $$.strictEqual(fr.rects, null, 'rects');
        $$.strictEqual(fr.visible, 0, 'visible');
        $$.strictEqual(fr.viewport, 0, 'viewport');
        $$.strictEqual(fr.possible, 0, 'possible');

        fr = new Fracs.Fractions(rect1, rect2, rect3, 0.1, 0.2, 0.3);
        $$.strictEqual(fr instanceof Fracs.Fractions, true, 'instanceof Fracs.Fractions');
        $$.strictEqual(fr.rects.document, rect1, 'rects.document');
        $$.strictEqual(fr.rects.element, rect2, 'rects.element');
        $$.strictEqual(fr.rects.viewport, rect3, 'rects.viewport');
        $$.strictEqual(fr.visible, 0.1, 'visible');
        $$.strictEqual(fr.viewport, 0.2, 'viewport');
        $$.strictEqual(fr.possible, 0.3, 'possible');
    });

    $$.test('equals', function () {

        var rect1 = new Fracs.Rect(30, 50, 400, 300),
            rect2 = new Fracs.Rect(100, 200, 400, 300),
            rect3 = new Fracs.Rect(10, 20, 40, 30),
            rect4 = new Fracs.Rect(130, 150, 1400, 1300),
            rect5 = new Fracs.Rect(100, 20, 40, 30),
            rect6 = new Fracs.Rect(123, 20, 40, 30),
            fr1 = new Fracs.Fractions(rect1, rect2, rect3, 0.1, 0.2, 0.3),
            fr2 = new Fracs.Fractions(rect1, rect2, rect3, 0.1, 0.2, 0.3),
            fr3 = new Fracs.Fractions(rect3, rect2, rect1, 0.1, 0.2, 0.3),
            fr4 = new Fracs.Fractions(rect1, rect2, rect3, 0.2, 0.2, 0.3);

        $$.strictEqual(fr1.equals(fr2), true, 'equal');
        $$.strictEqual(fr1.equals(fr3), false, 'unequal');
        $$.strictEqual(fr1.equals(fr4), false, 'unequal');

        $$.strictEqual(fr1.fracsEqual(fr2), true, 'fracs equal');
        $$.strictEqual(fr1.fracsEqual(fr3), true, 'fracs equal');
        $$.strictEqual(fr1.fracsEqual(fr4), false, 'fracs unequal');

        $$.strictEqual(fr1.rectsEqual(fr2), true, 'rects equal');
        $$.strictEqual(fr1.rectsEqual(fr3), false, 'rects unequal');
        $$.strictEqual(fr1.rectsEqual(fr4), true, 'rects equal');
    });





    // Plug-In API
    // ===========

    // Static Methods
    // --------------
    $$.module('static methods');

    $$.test('round', function () {

        $$.strictEqual($.fracs.round(1.234567), 1, 'round 1.234567 with no precision');
        $$.strictEqual($.fracs.round(1.234567, -1), 1, 'round 1.234567 to precision -1');
        $$.strictEqual($.fracs.round(1.234567, 0), 1, 'round 1.234567 to precision 0');
        $$.strictEqual($.fracs.round(1.234567, 1), 1.2, 'round 1.234567 to precision 1');
        $$.strictEqual($.fracs.round(1.234567, 2), 1.23, 'round 1.234567 to precision 2');
        $$.strictEqual($.fracs.round(1.234567, 3), 1.235, 'round 1.234567 to precision 3');
        $$.strictEqual($.fracs.round(1.234567, 4), 1.2346, 'round 1.234567 to precision 4');
    });



    // Methods
    // -------
    $$.module('methods');



}(jQuery, QUnit, Fracs));

