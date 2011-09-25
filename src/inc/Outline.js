/******************
 * Outline
 ******************/
/*globals $, Fracs, $window, $htmlBody */

Fracs.Outline = function (canvas, options) {

    if (!(this instanceof Fracs.Outline)) {
        return new Fracs.Outline(canvas, options);
    }

    if (!canvas.nodeName || canvas.nodeName.toLowerCase() !== "canvas") {
        return undefined;
    }

    var defaults = {
            crop: false,
            duration: 0,
            focusWidth: 0.5,
            focusHeight: 0.5,
            autoFocus: true,
            styles: [{
                selector: "header,footer,section,article",
                fillStyle: "rgb(230,230,230)"
            }, {
                selector: "h1",
                fillStyle: "rgb(255,144,55)"
            }, {
                selector: "h2",
                fillStyle: "rgb(221,75,57)"
            }, {
                selector: "h3",
                fillStyle: "rgb(108,196,46)"
            }, {
                selector: "h4",
                fillStyle: "rgb(53,122,232)"
            }],
            viewportStyle: {
                fillStyle: "rgba(255,144,55,0.3)"
            },
            viewportDragStyle: {
                fillStyle: "rgba(255,144,55,0.5)"
            },
            invertViewport: false
        },
        settings = $.extend({}, defaults, options),
        $canvas = $(canvas),
        width = $canvas.attr("width"),
        height = $canvas.attr("height"),
        context = canvas.getContext("2d"),
        drag = false,
        docRect, vpRect, scale, focusWidth, focusHeight,
        drawRect = function (rect, strokeWidth, strokeStyle, fillStyle, invert) {

            if (strokeStyle || fillStyle) {
                if (fillStyle) {
                    context.beginPath();
                    if (invert) {
                        context.rect(0, 0, docRect.width, rect.top);
                        context.rect(0, rect.top, rect.left, rect.height);
                        context.rect(rect.right, rect.top, docRect.right - rect.right, rect.height);
                        context.rect(0, rect.bottom, docRect.width, docRect.bottom - rect.bottom);
                    } else {
                        context.rect(rect.left, rect.top, rect.width, rect.height);
                    }
                    context.fillStyle = fillStyle;
                    context.fill();
                }
                if (strokeStyle) {
                    context.beginPath();
                    context.rect(rect.left, rect.top, rect.width, rect.height);
                    context.lineWidth = scale ? Math.max(strokeWidth, 0.2 / scale) : strokeWidth;
                    context.strokeStyle = strokeStyle;
                    context.stroke();
                }
            }
        },
        drawElement = function (element, strokeWidth, strokeStyle, fillStyle) {

            var $element = $(element),
                rect = Fracs.Rect.ofElement(element);

            if ($element.css("visibility") === "hidden" || rect.width === 0 || rect.height === 0) {
                return;
            }

            strokeWidth = strokeWidth === "auto" ? parseInt($element.css("border-top-width"), 10) : strokeWidth;
            strokeStyle = strokeStyle === "auto" ? $element.css("border-top-color") : strokeStyle;
            fillStyle = fillStyle === "auto" ? $element.css("background-color") : fillStyle;
            drawRect(rect, strokeWidth, strokeStyle, fillStyle);
        },
        applyStyles = function () {

            $.each(settings.styles, function (idx, style) {
                $(style.selector).each(function () {
                    drawElement(this, style.strokeWidth, style.strokeStyle, style.fillStyle);
                });
            });
        },
        drawViewport = function () {

            var style = drag && settings.viewportDragStyle ? settings.viewportDragStyle : settings.viewportStyle;

            drawRect(vpRect, style.strokeWidth, style.strokeStyle, style.fillStyle, settings.invertViewport);
        },
        draw = function () {

            docRect = Fracs.Rect.ofDocument();
            vpRect = Fracs.Rect.ofViewport();
            scale = Math.min(width / docRect.width, height / docRect.height);

            if (settings.crop) {
                $canvas.attr("width", docRect.width * scale).attr("height", docRect.height * scale);
            }

            context.setTransform(1,0,0,1,0,0);
            context.clearRect(0, 0, $canvas.width(), $canvas.height());

            context.scale(scale, scale);
            applyStyles();
            drawViewport();
        },
        onDrag = function (event) {

            var r = $canvas.fracs("rect"),
                x = event.pageX - r.left,
                y = event.pageY - r.top;

            Fracs.ScrollState.scrollTo(x / scale - vpRect.width * focusWidth, y / scale - vpRect.height * focusHeight, settings.duration);
        },
        onDragEnd = function (event) {

            drag = false;
            event.preventDefault();

            $canvas.css("cursor", "pointer").removeClass("dragOn");
            $htmlBody.css("cursor", "auto");
            $window.unbind("mousemove", onDrag);
            draw();
        },
        onDragStart = function (event) {

            var r;
            if (settings.autoFocus) {
                r = $canvas.fracs("rect");
                focusWidth = (((event.pageX - r.left) / scale) - vpRect.left) / vpRect.width;
                focusHeight = (((event.pageY - r.top) / scale) - vpRect.top) / vpRect.height;
            }
            if (!settings.autoFocus || focusWidth < 0 || focusWidth > 1 || focusHeight < 0 || focusHeight > 1) {
                focusWidth = settings.focusWidth;
                focusHeight = settings.focusHeight;
            }

            drag = true;
            event.preventDefault();

            $canvas.css("cursor", "crosshair").addClass("dragOn");
            $htmlBody.css("cursor", "crosshair");
            $window.bind("mousemove", onDrag).one("mouseup", onDragEnd);
            onDrag(event);
        },
        init = function () {

            $canvas.css("cursor", "pointer").mousedown(onDragStart);
            $window.bind("load resize scroll", draw);
            draw();
        };

    init();

    this.redraw = draw;
};
