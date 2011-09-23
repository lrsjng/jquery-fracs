/*
 * jQuery.fracs - Outline API
 */

(function ($) {
    "use strict";

    var Fracs = window.Fracs = window.Fracs || {},
        $window = $(window),
        $htmlBody = $("html,body"),
        dataNs = "outline";

    // @include "Outline.js"

    $.ModPlug.module("fracs", {
        methods: {
            outline: function (options) {

                return this.each(function () {

                    var outline;

                    if (options === "redraw") {
                        outline = $(this).data(dataNs);
                        if (outline) {
                            outline.redraw();
                        }
                    } else {
                        outline = Fracs.Outline(this, options);
                        if (outline) {
                            $(this).data(dataNs, outline);
                        }
                    }
                });
            }
        }
    });

}(jQuery));
