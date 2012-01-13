(function (window, document, $, $$) {
    'use strict';
    /*globals window, jQuery, QUnit */

    var $window = $(window),
        $document = $(document),
        byId = function (id) {

            return document.getElementById(id);
        },
        membersCount = function (obj) {

            var count = 0;

            $.each(obj, function (idx, member) {
                count += 1;
            });
            return count;
        },
        idx = 0,
        createElement = function (css) {

            idx += 1;
            $('<div id="el-' + idx + '"/>')
                .addClass('box')
                .css(css)
                .text(idx)
                .appendTo($('#test-elements'));

            return $.fracs.Rect.ofElement(byId('el-' + idx));
        };

    $$.module('Plug-in');

    $$.test('access', 19, function () {

        $$.strictEqual($.isFunction($.fracs), true, '$.fracs is function');
        $$.strictEqual(membersCount($.fracs), 16, '$.fracs has right number of members');

        $$.strictEqual($.isFunction($.fracs.modplug), true, '$.fracs.modplug is function');

        $$.strictEqual($.fracs.version, '%BUILD_VERSION%', 'version matches');

        $$.strictEqual($.isFunction($.fracs.Rect), true, '$.fracs.Rect is function');
        $$.strictEqual($.isFunction($.fracs.Fractions), true, '$.fracs.Fractions is function');
        $$.strictEqual($.isFunction($.fracs.Group), true, '$.fracs.Group is function');
        $$.strictEqual($.isFunction($.fracs.ScrollState), true, '$.fracs.ScrollState is function');
        $$.strictEqual($.isFunction($.fracs.FracsCallbacks), true, '$.fracs.FracsCallbacks is function');
        $$.strictEqual($.isFunction($.fracs.GroupCallbacks), true, '$.fracs.GroupCallbacks is function');
        $$.strictEqual($.isFunction($.fracs.ScrollStateCallbacks), true, '$.fracs.ScrollStateCallbacks is function');

        $$.strictEqual($.isFunction($.fracs.document), true, '$.fracs.document is function');
        $$.strictEqual($.isFunction($.fracs.fracs), true, '$.fracs.fracs is function');
        $$.strictEqual($.isFunction($.fracs.rect), true, '$.fracs.rect is function');
        $$.strictEqual($.isFunction($.fracs.scroll), true, '$.fracs.scroll is function');
        $$.strictEqual($.isFunction($.fracs.scrollState), true, '$.fracs.scrollState is function');
        $$.strictEqual($.isFunction($.fracs.scrollTo), true, '$.fracs.scrollTo is function');
        $$.strictEqual($.isFunction($.fracs.viewport), true, '$.fracs.viewport is function');

        $$.strictEqual($.isFunction($().fracs), true, '$().fracs is function');
    });



    // Objects
    // =======

    // Rect
    // ----
    $$.module('Rect');

    $$.test('constructor', 13, function () {

        var rect1 = new $.fracs.Rect(30, 50, 400, 300),
            rect2 = new $.fracs.Rect(30.1, 50.4, 400.3, 299.5);

        $$.strictEqual(rect1 instanceof $.fracs.Rect, true, 'instanceof Rect');

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

    $$.test('equals', 5, function () {

        var rect1 = new $.fracs.Rect(30, 50, 400, 300),
            rect2 = new $.fracs.Rect(30.1, 50.4, 400.3, 299.5),
            rect3 = new $.fracs.Rect(100, 200, 400, 300);

        $$.strictEqual(rect1.equals(), false, 'unequal to undefined');
        $$.strictEqual(rect1.equals(null), false, 'unequal to null');
        $$.strictEqual(rect1.equals({}), false, 'unequal to {}');

        $$.strictEqual(rect1.equals(rect2), true, 'equal rects');
        $$.strictEqual(rect1.equals(rect3), false, 'unequal rects');
    });

    $$.test('area', 1, function () {

        var rect1 = new $.fracs.Rect(30, 50, 400, 300);

        $$.strictEqual(rect1.area(), 400 * 300, 'area');
    });

    $$.test('relativeTo', 1, function () {

        var rect1 = new $.fracs.Rect(30, 50, 400, 300),
            rect2 = new $.fracs.Rect(10, 10, 10, 10),
            rect3 = new $.fracs.Rect(20, 40, 400, 300);

        $$.deepEqual(rect1.relativeTo(rect2), rect3, 'relativeTo');
    });

    $$.test('intersection', 3, function () {

        var rect1 = new $.fracs.Rect(30, 50, 400, 300),
            rect2 = new $.fracs.Rect(100, 200, 400, 300),
            rect3 = new $.fracs.Rect(500, 200, 400, 300),
            intersection = new $.fracs.Rect(100, 200, 330, 150);

        $$.deepEqual(rect1.intersection(rect2), intersection, 'intersection');
        $$.deepEqual(rect1.intersection(rect3), null, 'no intersection');
        $$.deepEqual(rect1.intersection(null), null, 'no second rect');
    });

    $$.test('envelope', 2, function () {

        var rect1 = new $.fracs.Rect(30, 50, 400, 300),
            rect2 = new $.fracs.Rect(100, 200, 400, 300),
            envelope = new $.fracs.Rect(30, 50, 470, 450);

        $$.deepEqual(rect1.envelope(rect2), envelope, 'envelope');
        $$.deepEqual(rect1.envelope(null), rect1, 'no second rect');
    });

    $$.test('ofDocument', 1, function () {

        var rect1 = $.fracs.Rect.ofDocument(),
            w = $document.width(),
            h = $document.height();

        $$.deepEqual(rect1, new $.fracs.Rect(0, 0, w, h), 'dims');
    });

    $$.test('ofViewport', 1, function () {

        var rect1 = $.fracs.Rect.ofViewport(),
            l = $window.scrollLeft(),
            t = $window.scrollTop(),
            w = $window.width(),
            h = $window.height();

        $$.deepEqual(rect1, new $.fracs.Rect(l, t, w, h), 'dims');
    });

    $$.test('ofElement', 7, function () {

        var left = -100,
            top = 0,
            rect1;

        top += 100;
        rect1 = createElement({
            left: left,
            top: top,
            width: 20,
            height: 30
        });
        $$.deepEqual(rect1, new $.fracs.Rect(left, top, 20, 30), 'dims');

        top += 100;
        rect1 = createElement({
            left: left,
            top: top,
            width: 20,
            height: 30,
            padding: 1
        });
        $$.deepEqual(rect1, new $.fracs.Rect(left, top, 22, 32), 'padding');

        top += 100;
        rect1 = createElement({
            left: left,
            top: top,
            width: 20,
            height: 30,
            paddingLeft: 1
        });
        $$.deepEqual(rect1, new $.fracs.Rect(left, top, 21, 30), 'one sided padding');

        top += 100;
        rect1 = createElement({
            left: left,
            top: top,
            width: 20,
            height: 30,
            borderWidth: 2
        });
        $$.deepEqual(rect1, new $.fracs.Rect(left, top, 24, 34), 'border');

        top += 100;
        rect1 = createElement({
            left: left,
            top: top,
            width: 20,
            height: 30,
            borderLeftWidth: 2
        });
        $$.deepEqual(rect1, new $.fracs.Rect(left, top, 22, 30), 'one sided border');

        top += 100;
        rect1 = createElement({
            left: left,
            top: top,
            width: 20,
            height: 30,
            padding: 1,
            borderWidth: 2
        });
        $$.deepEqual(rect1, new $.fracs.Rect(left, top, 26, 36), 'padding and border');

        top += 100;
        rect1 = createElement({
            left: left,
            top: top,
            width: 20,
            height: 30,
            display: 'none'
        });
        $$.strictEqual(rect1, null, 'invisible element returns null');
    });



    // Fractions
    // ---------
    $$.module('Fractions');

    $$.test('constructor', 32, function () {

        var rect1 = new $.fracs.Rect(30, 50, 400, 300),
            rect2 = new $.fracs.Rect(100, 200, 400, 300),
            rect3 = new $.fracs.Rect(10, 20, 40, 30),
            fr = new $.fracs.Fractions();

        $$.strictEqual(fr instanceof $.fracs.Fractions, true, 'instanceof Fractions');
        $$.strictEqual(fr.rects, null, 'rects');
        $$.strictEqual(fr.visible, 0, 'visible');
        $$.strictEqual(fr.viewport, 0, 'viewport');
        $$.strictEqual(fr.possible, 0, 'possible');

        fr = new $.fracs.Fractions(undefined, undefined, undefined, 1, 1, 1);
        $$.strictEqual(fr instanceof $.fracs.Fractions, true, 'instanceof Fractions');
        $$.strictEqual(fr.rects, null, 'rects');
        $$.strictEqual(fr.visible, 0, 'visible');
        $$.strictEqual(fr.viewport, 0, 'viewport');
        $$.strictEqual(fr.possible, 0, 'possible');

        fr = new $.fracs.Fractions(undefined, undefined, undefined, 0, 0, 1);
        $$.strictEqual(fr instanceof $.fracs.Fractions, true, 'instanceof Fractions');
        $$.strictEqual(fr.rects, null, 'rects');
        $$.strictEqual(fr.visible, 0, 'visible');
        $$.strictEqual(fr.viewport, 0, 'viewport');
        $$.strictEqual(fr.possible, 0, 'possible');

        fr = new $.fracs.Fractions(undefined, undefined, undefined, 1, 1);
        $$.strictEqual(fr instanceof $.fracs.Fractions, true, 'instanceof Fractions');
        $$.strictEqual(fr.rects, null, 'rects');
        $$.strictEqual(fr.visible, 0, 'visible');
        $$.strictEqual(fr.viewport, 0, 'viewport');
        $$.strictEqual(fr.possible, 0, 'possible');

        fr = new $.fracs.Fractions(rect1, rect2, rect3, 1, 1);
        $$.strictEqual(fr instanceof $.fracs.Fractions, true, 'instanceof Fractions');
        $$.strictEqual(fr.rects, null, 'rects');
        $$.strictEqual(fr.visible, 0, 'visible');
        $$.strictEqual(fr.viewport, 0, 'viewport');
        $$.strictEqual(fr.possible, 0, 'possible');

        fr = new $.fracs.Fractions(rect1, rect2, rect3, 0.1, 0.2, 0.3);
        $$.strictEqual(fr instanceof $.fracs.Fractions, true, 'instanceof Fractions');
        $$.strictEqual(fr.rects.document, rect1, 'rects.document');
        $$.strictEqual(fr.rects.element, rect2, 'rects.element');
        $$.strictEqual(fr.rects.viewport, rect3, 'rects.viewport');
        $$.strictEqual(fr.visible, 0.1, 'visible');
        $$.strictEqual(fr.viewport, 0.2, 'viewport');
        $$.strictEqual(fr.possible, 0.3, 'possible');
    });

    $$.test('equals', 12, function () {

        var rect1 = new $.fracs.Rect(30, 50, 400, 300),
            rect2 = new $.fracs.Rect(100, 200, 400, 300),
            rect3 = new $.fracs.Rect(10, 20, 40, 30),
            rect4 = new $.fracs.Rect(130, 150, 1400, 1300),
            rect5 = new $.fracs.Rect(100, 20, 40, 30),
            rect6 = new $.fracs.Rect(123, 20, 40, 30),
            fr1 = new $.fracs.Fractions(rect1, rect2, rect3, 0.1, 0.2, 0.3),
            fr2 = new $.fracs.Fractions(rect1, rect2, rect3, 0.1, 0.2, 0.3),
            fr3 = new $.fracs.Fractions(rect3, rect2, rect1, 0.1, 0.2, 0.3),
            fr4 = new $.fracs.Fractions(rect1, rect2, rect3, 0.2, 0.2, 0.3);

        $$.strictEqual(fr1.equals(), false, 'unequal to undefined');
        $$.strictEqual(fr1.equals(null), false, 'unequal to null');
        $$.strictEqual(fr1.equals({}), false, 'unequal to {}');

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



    // ScrollState
    // -----------
    $$.module('ScrollState');

    $$.test('tests', function () {

        $('<div id="scr"/>')
            .addClass('box')
            .css({
                overflow: 'auto'
            })
            .text('scr')
            .appendTo($('#test-elements'));

        var $scr = $('#scr');

        $('<div id="cnt"/>')
            .addClass('box')
            .css({
                left: 10,
                top: 10,
                width: 100,
                height: 300,
                backgroundColor: 'rgba(255,0,0,0.5)'
            })
            .text('cnt')
            .appendTo($scr);

    });



    // Plug-In
    // =======

    // Static Methods
    // --------------
    $$.module('static plug-in methods');

    // Methods
    // -------
    $$.module('plug-in methods');


}(window, document, jQuery, QUnit));

