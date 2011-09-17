(function($) {

    var demo = function () {

        var $body = $("body"),
            $panelFracs = $(".panel .fracs"),
            i;

        // generate content
        for (i = 1; i < 10; i++) {

            (function () {

                    //section
                var $section = $("<section id='box-" + i + "' class='box' title='scroll to this element' />")
                        .appendTo($body)
                        .width(i * 300)
                        .height(Math.round(Math.random() * 600) + 100),
                    $label = $("<div class='label'><span class='idx'>#" + i + "</span></div>")
                        .appendTo($section),
                    $ul = $("<ul />")
                        .appendTo($label)
                        .append($("<li><span class='info possible' /> of max possible visibility</li>"))
                        .append($("<li><span class='info visible' /> visible</li>"))
                        .append($("<li><span class='info viewport' /> of viewport</li>")),
                    $rectsul = $("<li>visible rect <span class='info dims' /><ul /></li>")
                        .appendTo($ul).find("ul")
                        .append($("<li>document space <span class='info rect' /></li>"))
                        .append($("<li>element space <span class='info rectElementSpace' /></li>"))
                        .append($("<li>viewport space <span class='info rectViewportSpace' /></li>")),

                    // panel
                    $li = $("<li id='box-entry-" + i + "' class='section' title='scroll to this element' />")
                        .appendTo($panelFracs)
                        .append($("<span class='idx'>" + i + "</span>"))
                        .append($("<span class='info possible' /><span class='info visible' /><span class='info viewport' />"));

                $section.add($li).click(function () {
                    $section.fracs("scrollTo", 50, 50, 500);
                });

                $section.data("panel", $li);
            })();
        }

        // init fracs
        $(".box").fracs(function (fracs) {

            var $section = $(this),
                $panel = $section.data("panel"),
                $label = $section.find(".label"),
                $s,
                $group;

            $section.add($panel.find(".idx")).css("background-color", "rgba(100,200,100," + fracs.possible + ")");

            $panel.find(".visible").text($.fracs.round(fracs.visible, 4));
            $panel.find(".viewport").text($.fracs.round(fracs.viewport, 4));
            $panel.find(".possible").text($.fracs.round(fracs.possible, 4));
            $panel.find(".info").stop(true).css("background-color", "rgb(250,250,150)").animate({"background-color": "#fff"}, 1000);

            $label.find(".visible").text($.fracs.round(fracs.visible * 100, 1) + "%");
            $label.find(".viewport").text($.fracs.round(fracs.viewport * 100, 1) + "%");
            $label.find(".possible").text($.fracs.round(fracs.possible * 100, 1) + "%");
            if (!fracs.rects) {
                $label.find(".rects").text("undefined");
            } else {
                $label.find(".dims").text("w/h: " + fracs.rects.document.width + "x" + fracs.rects.document.height);
                $label.find(".rect").text("l/t: " + fracs.rects.document.left + "," + fracs.rects.document.top);
                $label.find(".rectElementSpace").text("l/t: " + fracs.rects.element.left + "," + fracs.rects.element.top);
                $label.find(".rectViewportSpace").text("l/t: " + fracs.rects.viewport.left + "," + fracs.rects.viewport.top);
                $label.stop(true).animate({
                    left: fracs.rects.element.left + "px",
                    top: fracs.rects.element.top + "px"
                }, 100);
            }
        });

        // initial check
        $(".box").fracs("check");

        // test unbind
        $("#box-6").fracs("unbind").find(".label").empty().append("<span class='idx'>#6</span> (unbound)");

        // test hidden elements
        // $("#box-3").css("display", "none");
        // $("#box-4").hide();
        // $("#box-5").css("visibility", "hidden");

        // init groups
        var $s, $group;
        $s = $("body > section");
        $group = $("#box-4,#box-5,#box-6,#box-7,#box-8");
        $group = $("#box-7,#box-8");
        $group.fracs("max", "possible", function (best) {
            $(".panel .groups .possible")
                .text(best ? $(best.element).find(".idx").text() : "undef.")
                .stop(true).css("background-color", "rgb(250,250,150)").animate({"background-color": "#fff"}, 1000);
        });
        $group.fracs("max", "visible", function (best) {
            $(".panel .groups .visible")
                .text(best ? $(best.element).find(".idx").text() : "undef.")
                .stop(true).css("background-color", "rgb(250,250,150)").animate({"background-color": "#fff"}, 1000);
        });
        $group.fracs("max", "viewport", function (best) {
            $(".panel .groups .viewport")
                .text(best ? $(best.element).find(".idx").text() : "undef.")
                .stop(true).css("background-color", "rgb(250,250,150)").animate({"background-color": "#fff"}, 1000);
        });

        $.fracs.scrollState(function (state, prevState) {
            if (!prevState || state.width !== prevState.width) {
                $(".panel .scrollstate .width")
                    .text(isNaN(state.width) ? "undef." : $.fracs.round(state.width * 100, 1) + "%")
                    .stop(true).css("background-color", "rgb(250,250,150)").animate({"background-color": "#fff"}, 1000);
            }
            if (!prevState || state.height !== prevState.height) {
                $(".panel .scrollstate .height")
                    .text(isNaN(state.height) ? "undef." : $.fracs.round(state.height * 100, 1) + "%")
                    .stop(true).css("background-color", "rgb(250,250,150)").animate({"background-color": "#fff"}, 1000);
            }
        });
    };


    $(function () {

        var doc;

        demo();

        doc = $.fracs.document();
        $("#outlineHeader").text("Document " + doc.width + "x" + doc.height);
        $("#outline").fracs("outline", {
            crop: true,
            styles: [{
                selector: ".box",
                strokeWidth: "auto",
                strokeStyle: "auto",
                fillStyle: "auto"
            }, {
                selector: "body > h1",
                fillStyle: "rgb(200,200,200)"
            }]
        });
    });

})(jQuery);
