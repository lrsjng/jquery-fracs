(function () {
'use strict';

var $ = jQuery;
var $$ = QUnit;
var $window = $(window);
var $document = $(document);
var isFn = $.isFunction;

function byId(id) {

    return document.getElementById(id);
}

function membersCount(obj) {

    var count = 0;

    $.each(obj, function () {
        count += 1;
    });
    return count;
}


$$.module('Plug-in');

$$.test('access', 15, function () {

    $$.strictEqual(isFn($.fracs), true, '$.fracs is function');
    $$.strictEqual(membersCount($.fracs), 12, '$.fracs has right number of members');

    $$.strictEqual(isFn($.fracs.modplug), true, '$.fracs.modplug is function');

    $$.strictEqual($.fracs.version, '{{pkg.version}}', 'version matches');

    $$.strictEqual(isFn($.fracs.Rect), true, '$.fracs.Rect is function');
    $$.strictEqual(isFn($.fracs.Fractions), true, '$.fracs.Fractions is function');
    $$.strictEqual(isFn($.fracs.Group), true, '$.fracs.Group is function');
    $$.strictEqual(isFn($.fracs.ScrollState), true, '$.fracs.ScrollState is function');
    $$.strictEqual(isFn($.fracs.Viewport), true, '$.fracs.Viewport is function');
    $$.strictEqual(isFn($.fracs.FracsCallbacks), true, '$.fracs.FracsCallbacks is function');
    $$.strictEqual(isFn($.fracs.GroupCallbacks), true, '$.fracs.GroupCallbacks is function');
    $$.strictEqual(isFn($.fracs.ScrollStateCallbacks), true, '$.fracs.ScrollStateCallbacks is function');
    $$.strictEqual(isFn($.fracs.Outline), true, '$.fracs.Outline is function');

    $$.strictEqual(isFn($.fracs.fracs), true, '$.fracs.fracs is function');

    $$.strictEqual(isFn($().fracs), true, '$().fracs is function');
});


// Objects
// =======

var Rect = $.fracs.Rect;
var Fractions = $.fracs.Fractions;
var Group = $.fracs.Group;
var ScrollState = $.fracs.ScrollState;
var Viewport = $.fracs.Viewport;
var FracsCallbacks = $.fracs.FracsCallbacks;
var GroupCallbacks = $.fracs.GroupCallbacks;
var ScrollStateCallbacks = $.fracs.ScrollStateCallbacks;
var createElement = (function () {

        var idx = 0;

        return function (css) {

            idx += 1;
            $('<div id="el-' + idx + '"/>')
                .addClass('box')
                .css(css)
                .text(idx)
                .appendTo($('#test-elements'));

            return Rect.ofElement(byId('el-' + idx));
        };
    }());


// Rect
// ----
$$.module('Rect');

$$.test('constructor', 13, function () {

    var rect1 = new Rect(30, 50, 400, 300);
    var rect2 = new Rect(30.1, 50.4, 400.3, 299.5);

    $$.strictEqual(rect1 instanceof Rect, true, 'instanceof Rect');

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

    var rect1 = new Rect(30, 50, 400, 300);
    var rect2 = new Rect(30.1, 50.4, 400.3, 299.5);
    var rect3 = new Rect(100, 200, 400, 300);

    $$.strictEqual(rect1.equals(), false, 'unequal to undefined');
    $$.strictEqual(rect1.equals(null), false, 'unequal to null');
    $$.strictEqual(rect1.equals({}), false, 'unequal to {}');

    $$.strictEqual(rect1.equals(rect2), true, 'equal rects');
    $$.strictEqual(rect1.equals(rect3), false, 'unequal rects');
});

$$.test('area', 1, function () {

    var rect1 = new Rect(30, 50, 400, 300);

    $$.strictEqual(rect1.area(), 400 * 300, 'area');
});

$$.test('relativeTo', 1, function () {

    var rect1 = new Rect(30, 50, 400, 300);
    var rect2 = new Rect(10, 10, 10, 10);
    var rect3 = new Rect(20, 40, 400, 300);

    $$.deepEqual(rect1.relativeTo(rect2), rect3, 'relativeTo');
});

$$.test('intersection', 3, function () {

    var rect1 = new Rect(30, 50, 400, 300);
    var rect2 = new Rect(100, 200, 400, 300);
    var rect3 = new Rect(500, 200, 400, 300);
    var intersection = new Rect(100, 200, 330, 150);

    $$.deepEqual(rect1.intersection(rect2), intersection, 'intersection');
    $$.deepEqual(rect1.intersection(rect3), null, 'no intersection');
    $$.deepEqual(rect1.intersection(null), null, 'no second rect');
});

$$.test('envelope', 2, function () {

    var rect1 = new Rect(30, 50, 400, 300);
    var rect2 = new Rect(100, 200, 400, 300);
    var envelope = new Rect(30, 50, 470, 450);

    $$.deepEqual(rect1.envelope(rect2), envelope, 'envelope');
    $$.deepEqual(rect1.envelope(null), rect1, 'no second rect');
});

$$.test('ofContent', 1, function () {

    var rect1 = Rect.ofContent();
    var w = $document.width();
    var h = $document.height();

    $$.deepEqual(rect1, new Rect(0, 0, w, h), 'dims');
});

$$.test('ofViewport', 1, function () {

    var rect1 = Rect.ofViewport();
    var l = $window.scrollLeft();
    var t = $window.scrollTop();
    var w = $window.width();
    var h = $window.height();

    $$.deepEqual(rect1, new Rect(l, t, w, h), 'dims');
});

$$.test('ofElement', 8, function () {

    var left = -100;
    var top = 0;
    var rect1;

    top += 100;
    rect1 = createElement({
        left: left,
        top: top,
        width: 20,
        height: 30
    });
    $$.deepEqual(rect1, new Rect(left, top, 20, 30), 'dims');

    top += 100;
    rect1 = createElement({
        left: left,
        top: top,
        width: 20,
        height: 30,
        padding: 1
    });
    $$.deepEqual(rect1, new Rect(left, top, 22, 32), 'padding');

    top += 100;
    rect1 = createElement({
        left: left,
        top: top,
        width: 20,
        height: 30,
        paddingLeft: 1
    });
    $$.deepEqual(rect1, new Rect(left, top, 21, 30), 'one sided padding');

    top += 100;
    rect1 = createElement({
        left: left,
        top: top,
        width: 20,
        height: 30,
        borderWidth: 2
    });
    $$.deepEqual(rect1, new Rect(left, top, 24, 34), 'border');

    top += 100;
    rect1 = createElement({
        left: left,
        top: top,
        width: 20,
        height: 30,
        borderLeftWidth: 2
    });
    $$.deepEqual(rect1, new Rect(left, top, 22, 30), 'one sided border');

    top += 100;
    rect1 = createElement({
        left: left,
        top: top,
        width: 20,
        height: 30,
        padding: 1,
        borderWidth: 2
    });
    $$.deepEqual(rect1, new Rect(left, top, 26, 36), 'padding and border');

    top += 100;
    rect1 = createElement({
        left: left,
        top: top,
        width: 20,
        height: 30,
        display: 'none'
    });
    $$.strictEqual(rect1, null, 'display: none; element returns null');

    top += 100;
    rect1 = createElement({
        left: left,
        top: top,
        width: 20,
        height: 30,
        visibility: 'hidden'
    });
    $$.deepEqual(rect1, new Rect(left, top, 20, 30), 'visibility: hidden; element returns rect');
});


// Fractions
// ---------
$$.module('Fractions');

$$.test('constructor', 5, function () {

    var rect1 = new Rect(30, 50, 400, 300);
    var rect2 = new Rect(100, 200, 400, 300);
    var rect3 = new Rect(10, 20, 40, 30);
    var fr = new Fractions();

    $$.strictEqual(fr instanceof Fractions, true, 'instanceof Fractions');
    $$.strictEqual(fr.visible, 0, 'visible');
    $$.strictEqual(fr.viewport, 0, 'viewport');
    $$.strictEqual(fr.possible, 0, 'possible');
    $$.strictEqual(fr.rects, null, 'rects');
});

$$.test('equals', 12, function () {

    var rect1 = new Rect(30, 50, 400, 300);
    var rect2 = new Rect(100, 200, 400, 300);
    var rect3 = new Rect(10, 20, 40, 30);
    var rect4 = new Rect(130, 150, 1400, 1300);
    var rect5 = new Rect(100, 20, 40, 30);
    var rect6 = new Rect(123, 20, 40, 30);
    var fr1 = new Fractions(0.1, 0.2, 0.3, {document: rect1, element: rect2, viewport: rect3});
    var fr2 = new Fractions(0.1, 0.2, 0.3, {document: rect1, element: rect2, viewport: rect3});
    var fr3 = new Fractions(0.1, 0.2, 0.3, {document: rect3, element: rect2, viewport: rect1});
    var fr4 = new Fractions(0.2, 0.2, 0.3, {document: rect1, element: rect2, viewport: rect3});

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

$$.test('tests', 0, function () {

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
            width: 300,
            height: 100,
            backgroundColor: 'rgba(255,0,0,0.5)'
        })
        .text('cnt')
        .appendTo($scr);

    $('<canvas id="cvs" width="100" height="100"/>')
        .css({
            position: 'absolute',
            left: 100,
            top: 300,
            backgroundColor: '#fff',
            border: '1px solid #ccc'
        })
        .appendTo($('#test-elements'));

    $('#cvs').fracs('outline', {
        crop: true,
        styles: [{
            selector: 'div',
            fillStyle: 'auto'
        }]
    }, $('#scr'));
});

// Plug-In
// =======

// Static Methods
// --------------
$$.module('static plug-in methods');

// Methods
// -------
$$.module('plug-in methods');

}());
