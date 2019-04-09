(() => {
    const WIN = window; // eslint-disable-line
    const DOC = WIN.document;
    const $ = WIN.jQuery;
    const $win = $(WIN);
    const $doc = $(DOC);
    const is_fn = $.isFunction;
    const by_id = id => DOC.getElementById(id);

    const test = WIN.scar.test;
    const assert = WIN.scar.assert;

    test('Plugin access', () => {
        assert.ok(is_fn($.fracs), '$.fracs is function');
        assert.equal(Object.keys($.fracs).length, 2, '$.fracs has right number of members');

        assert.equal(Object.keys($.fracs._).length, 8, '$.fracs._ has right number of members');
        assert.ok(is_fn($.fracs._.Rect), '$.fracs._.Rect is function');
        assert.ok(is_fn($.fracs._.Fractions), '$.fracs._.Fractions is function');
        assert.ok(is_fn($.fracs._.Group), '$.fracs._.Group is function');
        assert.ok(is_fn($.fracs._.ScrollState), '$.fracs._.ScrollState is function');
        assert.ok(is_fn($.fracs._.Viewport), '$.fracs._.Viewport is function');
        assert.ok(is_fn($.fracs._.FracsCallbacks), '$.fracs._.FracsCallbacks is function');
        assert.ok(is_fn($.fracs._.GroupCallbacks), '$.fracs._.GroupCallbacks is function');
        assert.ok(is_fn($.fracs._.ScrollStateCallbacks), '$.fracs._.ScrollStateCallbacks is function');

        assert.ok(is_fn($.fracs.fracs), '$.fracs.fracs is function');
        assert.ok(is_fn($().fracs), '$().fracs is function');
    });


    // Objects
    // =======

    const Rect = $.fracs._.Rect;
    const Fractions = $.fracs._.Fractions;
    const create_test_el = (() => {
        let idx = 0;
        return css => {
            idx += 1;
            $('<div id="el-' + idx + '"/>')
                .addClass('box')
                .css(css)
                .text(idx)
                .appendTo($('#test-elements'));

            return Rect.ofElement(by_id('el-' + idx));
        };
    })();


    // Rect
    // ----

    test('Rect constructor', () => {
        const rect1 = new Rect(30, 50, 400, 300);
        const rect2 = new Rect(30.1, 50.4, 400.3, 299.5);

        assert.ok(rect1 instanceof Rect, 'instanceof Rect');

        assert.equal(rect1.left, 30, 'left');
        assert.equal(rect1.top, 50, 'top');
        assert.equal(rect1.width, 400, 'width');
        assert.equal(rect1.height, 300, 'height');
        assert.equal(rect1.right, 430, 'right');
        assert.equal(rect1.bottom, 350, 'bottom');

        assert.equal(rect2.left, 30, 'left');
        assert.equal(rect2.top, 50, 'top');
        assert.equal(rect2.width, 400, 'width');
        assert.equal(rect2.height, 300, 'height');
        assert.equal(rect2.right, 430, 'right');
        assert.equal(rect2.bottom, 350, 'bottom');
    });

    test('Rect equals', () => {
        const rect1 = new Rect(30, 50, 400, 300);
        const rect2 = new Rect(30.1, 50.4, 400.3, 299.5);
        const rect3 = new Rect(100, 200, 400, 300);

        assert.ok(!rect1.equals(), 'unequal to undefined');
        assert.ok(!rect1.equals(null), 'unequal to null');
        assert.ok(!rect1.equals({}), 'unequal to {}');

        assert.ok(rect1.equals(rect2), 'equal rects');
        assert.ok(!rect1.equals(rect3), 'unequal rects');
    });

    test('Rect area', () => {
        const rect1 = new Rect(30, 50, 400, 300);
        assert.equal(rect1.area(), 400 * 300, 'area');
    });

    test('Rect relativeTo', () => {
        const rect1 = new Rect(30, 50, 400, 300);
        const rect2 = new Rect(10, 10, 10, 10);
        const rect3 = new Rect(20, 40, 400, 300);

        assert.deepEqual(rect1.relativeTo(rect2), rect3, 'relativeTo');
    });

    test('Rect intersection', () => {
        const rect1 = new Rect(30, 50, 400, 300);
        const rect2 = new Rect(100, 200, 400, 300);
        const rect3 = new Rect(500, 200, 400, 300);
        const intersection = new Rect(100, 200, 330, 150);

        assert.deepEqual(rect1.intersection(rect2), intersection, 'intersection');
        assert.deepEqual(rect1.intersection(rect3), null, 'no intersection');
        assert.deepEqual(rect1.intersection(null), null, 'no second rect');
    });

    test('Rect envelope', () => {
        const rect1 = new Rect(30, 50, 400, 300);
        const rect2 = new Rect(100, 200, 400, 300);
        const envelope = new Rect(30, 50, 470, 450);

        assert.deepEqual(rect1.envelope(rect2), envelope, 'envelope');
        assert.deepEqual(rect1.envelope(null), rect1, 'no second rect');
    });

    test('Rect ofContent', () => {
        const rect1 = Rect.ofContent();
        const w = $doc.width();
        const h = $doc.height();

        assert.deepEqual(rect1, new Rect(0, 0, w, h), 'dims');
    });

    test('Rect ofViewport', () => {
        const rect1 = Rect.ofViewport();
        const l = $win.scrollLeft();
        const t = $win.scrollTop();
        const w = $win.width();
        const h = $win.height();

        assert.deepEqual(rect1, new Rect(l, t, w, h), 'dims');
    });

    test('Rect ofElement', () => {
        const left = -100;
        let top = 0;
        let rect;

        top += 100;
        rect = create_test_el({left, top, width: 20, height: 30});
        assert.deepEqual(rect, new Rect(left, top, 20, 30), 'dims');

        top += 100;
        rect = create_test_el({left, top, width: 20, height: 30, padding: 1});
        assert.deepEqual(rect, new Rect(left, top, 22, 32), 'padding');

        top += 100;
        rect = create_test_el({left, top, width: 20, height: 30, paddingLeft: 1});
        assert.deepEqual(rect, new Rect(left, top, 21, 30), 'one sided padding');

        top += 100;
        rect = create_test_el({left, top, width: 20, height: 30, borderWidth: 2});
        assert.deepEqual(rect, new Rect(left, top, 24, 34), 'border');

        top += 100;
        rect = create_test_el({left, top, width: 20, height: 30, borderLeftWidth: 2});
        assert.deepEqual(rect, new Rect(left, top, 22, 30), 'one sided border');

        top += 100;
        rect = create_test_el({left, top, width: 20, height: 30, padding: 1, borderWidth: 2});
        assert.deepEqual(rect, new Rect(left, top, 26, 36), 'padding and border');

        top += 100;
        rect = create_test_el({left, top, width: 20, height: 30, display: 'none'});
        assert.equal(rect, null, 'display: none; element returns null');

        top += 100;
        rect = create_test_el({left, top, width: 20, height: 30, visibility: 'hidden'});
        assert.deepEqual(rect, new Rect(left, top, 20, 30), 'visibility: hidden; element returns rect');
    });


    // Fractions
    // ---------

    test('Fractions constructor', () => {
        const fr = new Fractions();

        assert.ok(fr instanceof Fractions, 'instanceof Fractions');
        assert.equal(fr.visible, 0, 'visible');
        assert.equal(fr.viewport, 0, 'viewport');
        assert.equal(fr.possible, 0, 'possible');
        assert.equal(fr.rects, null, 'rects');
    });

    test('Fractions equals', () => {
        const rect1 = new Rect(30, 50, 400, 300);
        const rect2 = new Rect(100, 200, 400, 300);
        const rect3 = new Rect(10, 20, 40, 30);
        const fr1 = new Fractions(0.1, 0.2, 0.3, {document: rect1, element: rect2, viewport: rect3});
        const fr2 = new Fractions(0.1, 0.2, 0.3, {document: rect1, element: rect2, viewport: rect3});
        const fr3 = new Fractions(0.1, 0.2, 0.3, {document: rect3, element: rect2, viewport: rect1});
        const fr4 = new Fractions(0.2, 0.2, 0.3, {document: rect1, element: rect2, viewport: rect3});

        assert.ok(!fr1.equals(), 'unequal to undefined');
        assert.ok(!fr1.equals(null), 'unequal to null');
        assert.ok(!fr1.equals({}), 'unequal to {}');

        assert.ok(fr1.equals(fr2), 'equal');
        assert.ok(!fr1.equals(fr3), 'unequal');
        assert.ok(!fr1.equals(fr4), 'unequal');

        assert.ok(fr1.fracsEqual(fr2), 'fracs equal');
        assert.ok(fr1.fracsEqual(fr3), 'fracs equal');
        assert.ok(!fr1.fracsEqual(fr4), 'fracs unequal');

        assert.ok(fr1.rectsEqual(fr2), 'rects equal');
        assert.ok(!fr1.rectsEqual(fr3), 'rects unequal');
        assert.ok(fr1.rectsEqual(fr4), 'rects equal');
    });


    test.cli();
})();
