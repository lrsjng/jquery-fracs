/*
 * jQuery.fracs - Outline API
 */

// @include "Outline.js"

(function (window, $, undefined) {

    var Fracs = window.Fracs = window.Fracs || {},
        dataNs = "outline",
        methods = {
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
        };

    $.ModPlug.module("fracs", {
        methods: methods
    });

}(window, jQuery));
