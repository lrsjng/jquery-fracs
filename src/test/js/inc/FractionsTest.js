
module("Fractions");


test("constructor", function () {

    var rect1 = Fracs.Rect(30, 50, 400, 300),
        rect2 = Fracs.Rect(100, 200, 400, 300),
        rect3 = Fracs.Rect(10, 20, 40, 30),
        fr = Fracs.Fractions();

    strictEqual(fr.rects, undefined, "rects");
    strictEqual(fr.visible, 0, "visible");
    strictEqual(fr.viewport, 0, "viewport");
    strictEqual(fr.possible, 0, "possible");

    fr = Fracs.Fractions(undefined, undefined, undefined, 1, 1, 1);
    strictEqual(fr.rects, undefined, "rects");
    strictEqual(fr.visible, 0, "visible");
    strictEqual(fr.viewport, 0, "viewport");
    strictEqual(fr.possible, 0, "possible");

    fr = Fracs.Fractions(undefined, undefined, undefined, 0, 0, 1);
    strictEqual(fr.rects, undefined, "rects");
    strictEqual(fr.visible, 0, "visible");
    strictEqual(fr.viewport, 0, "viewport");
    strictEqual(fr.possible, 0, "possible");

    fr = Fracs.Fractions(undefined, undefined, undefined, 1, 1);
    strictEqual(fr.rects, undefined, "rects");
    strictEqual(fr.visible, 0, "visible");
    strictEqual(fr.viewport, 0, "viewport");
    strictEqual(fr.possible, 0, "possible");

    fr = Fracs.Fractions(rect1, rect2, rect3, 1, 1);
    strictEqual(fr.rects, undefined, "rects");
    strictEqual(fr.visible, 0, "visible");
    strictEqual(fr.viewport, 0, "viewport");
    strictEqual(fr.possible, 0, "possible");

    fr = Fracs.Fractions(rect1, rect2, rect3, 0.1, 0.2, 0.3);
    strictEqual(fr.rects.document, rect1, "rects.document");
    strictEqual(fr.rects.element, rect2, "rects.element");
    strictEqual(fr.rects.viewport, rect3, "rects.viewport");
    strictEqual(fr.visible, 0.1, "visible");
    strictEqual(fr.viewport, 0.2, "viewport");
    strictEqual(fr.possible, 0.3, "possible");
});


test("equals", function () {

    var rect1 = Fracs.Rect(30, 50, 400, 300),
        rect2 = Fracs.Rect(100, 200, 400, 300),
        rect3 = Fracs.Rect(10, 20, 40, 30),
        rect4 = Fracs.Rect(130, 150, 1400, 1300),
        rect5 = Fracs.Rect(100, 20, 40, 30),
        rect6 = Fracs.Rect(123, 20, 40, 30),
        fr1 = Fracs.Fractions(rect1, rect2, rect3, 0.1, 0.2, 0.3),
        fr2 = Fracs.Fractions(rect1, rect2, rect3, 0.1, 0.2, 0.3),
        fr3 = Fracs.Fractions(rect3, rect2, rect1, 0.1, 0.2, 0.3),
        fr4 = Fracs.Fractions(rect1, rect2, rect3, 0.2, 0.2, 0.3);

    ok(fr1.equals(fr2), "equal");
    ok(!fr1.equals(fr3), "unequal");
    ok(!fr1.equals(fr4), "unequal");

    ok(fr1.fracsEqual(fr2), "fracs equal");
    ok(fr1.fracsEqual(fr3), "fracs equal");
    ok(!fr1.fracsEqual(fr4), "fracs unequal");

    ok(fr1.rectsEqual(fr2), "rects equal");
    ok(!fr1.rectsEqual(fr3), "rects unequal");
    ok(fr1.rectsEqual(fr4), "rects equal");

});

