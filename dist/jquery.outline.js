/*! jquery-fracs v0.16.0 - https://larsjung.de/jquery-fracs/ */
"use strict";

(function () {
  var WIN = window; // eslint-disable-line

  var $ = WIN.jQuery;
  var $win = $(WIN);
  var extend = $.extend;
  var fracs = $.fracs;
  var Rect = fracs.Rect;
  var Viewport = fracs.Viewport; // Outline
  // -------

  var DEFAULTS = {
    crop: false,
    duration: 0,
    focusWidth: 0.5,
    focusHeight: 0.5,
    autoFocus: true,
    styles: [{
      selector: 'header,footer,section,article',
      fillStyle: 'rgb(230,230,230)'
    }, {
      selector: 'h1,h2,h3,h4',
      fillStyle: 'rgb(255,144,55)'
    }],
    viewportStyle: {
      fillStyle: 'rgba(255,144,55,0.3)'
    },
    viewportDragStyle: {
      fillStyle: 'rgba(255,144,55,0.5)'
    },
    invertViewport: false
  }; // Quick and dirty.

  function Outline(canvas, options, viewport) {
    if (!canvas || !$.isFunction(canvas.getContext)) {
      return null;
    }

    var context = canvas.getContext('2d');

    if (!context) {
      return null;
    }

    viewport = viewport || WIN;
    var settings = extend({}, DEFAULTS, options);
    var $canvas = $(canvas);
    var width = $canvas.attr('width');
    var height = $canvas.attr('height');
    var $viewport = $(viewport);
    var viewport_obj = new Viewport(viewport);
    var find = viewport === WIN ? function (selector) {
      return $(selector);
    } : function (selector) {
      return $viewport.find(selector);
    };
    var drag = false;
    var currentContentRect;
    var currentViewportRect;
    var currentScale;
    var focusWidth;
    var focusHeight;

    var draw_rect = function draw_rect(rect, strokeWidth, strokeStyle, fillStyle, invert) {
      if (!rect || !(strokeStyle || fillStyle)) {
        return;
      }

      if (fillStyle) {
        context.beginPath();

        if (invert) {
          context.rect(0, 0, currentContentRect.width, rect.top);
          context.rect(0, rect.top, rect.left, rect.height);
          context.rect(rect.right, rect.top, currentContentRect.width - rect.right, rect.height);
          context.rect(0, rect.bottom, currentContentRect.width, currentContentRect.height - rect.bottom);
        } else {
          context.rect(rect.left, rect.top, rect.width, rect.height);
        }

        context.fillStyle = fillStyle;
        context.fill();
      }

      if (strokeStyle) {
        context.beginPath();
        context.rect(rect.left, rect.top, rect.width, rect.height);
        context.lineWidth = currentScale ? Math.max(strokeWidth, 0.2 / currentScale) : strokeWidth;
        context.strokeStyle = strokeStyle;
        context.stroke();
      }
    };

    var draw_el = function draw_el(element, strokeWidth, strokeStyle, fillStyle) {
      var $element = $(element);
      var rect = Rect.ofElement(element);

      if (!rect || rect.width <= 0 || rect.height <= 0 || $element.css('visibility') === 'hidden') {
        return;
      }

      rect = rect.relativeTo(currentContentRect);
      strokeWidth = strokeWidth === 'auto' ? parseInt($element.css('border-top-width'), 10) : strokeWidth;
      strokeStyle = strokeStyle === 'auto' ? $element.css('border-top-color') : strokeStyle;
      fillStyle = fillStyle === 'auto' ? $element.css('background-color') : fillStyle;
      draw_rect(rect, strokeWidth, strokeStyle, fillStyle);
    };

    var apply_styles = function apply_styles() {
      $.each(settings.styles, function (idx, style) {
        find(style.selector).each(function cb() {
          draw_el(this, style.strokeWidth, style.strokeStyle, style.fillStyle);
        });
      });
    };

    var draw_viewport = function draw_viewport() {
      var style = drag && settings.viewportDragStyle ? settings.viewportDragStyle : settings.viewportStyle;
      draw_rect(currentViewportRect, style.strokeWidth, style.strokeStyle, style.fillStyle, settings.invertViewport);
    };

    var draw = function draw() {
      currentContentRect = Rect.ofContent(viewport);
      currentViewportRect = Rect.ofViewport(viewport, true);
      currentScale = Math.min(width / currentContentRect.width, height / currentContentRect.height);

      if (settings.crop) {
        $canvas.attr('width', currentContentRect.width * currentScale).attr('height', currentContentRect.height * currentScale);
      }

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, $canvas.width(), $canvas.height());
      context.scale(currentScale, currentScale);
      apply_styles();
      draw_viewport();
    };

    var on_drag = function on_drag(event) {
      var r = Rect.ofElement(canvas);
      var x = (event.pageX - r.left) / currentScale - currentViewportRect.width * focusWidth;
      var y = (event.pageY - r.top) / currentScale - currentViewportRect.height * focusHeight;
      viewport_obj.scrollTo(x, y, settings.duration);
    };

    var on_drag_end = function on_drag_end(event) {
      drag = false;
      event.preventDefault();
      $canvas.css('cursor', 'pointer').removeClass('dragOn');
      $('body').css('cursor', 'auto');
      $win.off('mousemove', on_drag);
      draw();
    };

    var on_drag_start = function on_drag_start(event) {
      if (settings.autoFocus) {
        var r = Rect.ofElement(canvas);
        focusWidth = ((event.pageX - r.left) / currentScale - currentViewportRect.left) / currentViewportRect.width;
        focusHeight = ((event.pageY - r.top) / currentScale - currentViewportRect.top) / currentViewportRect.height;
      }

      if (!settings.autoFocus || focusWidth < 0 || focusWidth > 1 || focusHeight < 0 || focusHeight > 1) {
        focusWidth = settings.focusWidth;
        focusHeight = settings.focusHeight;
      }

      drag = true;
      event.preventDefault();
      $canvas.css('cursor', 'crosshair').addClass('dragOn');
      $('body').css('cursor', 'crosshair');
      $win.on('mousemove', on_drag).one('mouseup', on_drag_end);
      on_drag(event);
    };

    var init = function init() {
      $canvas.css('cursor', 'pointer').mousedown(on_drag_start);
      $viewport.on('load resize scroll', draw);
      draw();
    };

    init();
    this.redraw = draw;
  } // Register the plug-in
  // ===================
  // The namespace used to register the plug-in and to attach
  // data to elements.


  var namespace = 'fracs.outline'; // The methods are sorted in alphabetical order. All methods that do
  // not provide a return value will return `this` to enable method chaining.

  fracs.modplug({
    // Static methods
    // --------------
    // These methods are accessible via `$.outline.<methodname>`.
    statics: {
      // Publish object constructors (for testing).
      Outline: Outline
    },
    // Instance methods
    // ----------------
    // These methods are accessible via `$(selector).outline('<methodname>', ...)`.
    methods: {
      // ### 'outline'
      // Generates a document outline in a selected canvas. Will be redrawn on every
      // 'window resize` and `window scroll` event.
      //
      //      .outline([options: OutlineOptions]): jQuery
      outline: function outline(action, options, viewport) {
        console.log('YIPPU');

        if (typeof action !== 'string') {
          viewport = options;
          options = action;
          action = null;
        }

        if (viewport instanceof $) {
          viewport = viewport[0];
        }

        if (action === 'redraw') {
          return this.each(function cb() {
            var outline = $(this).data(namespace);

            if (outline) {
              outline.redraw();
            }
          });
        }

        return this.each(function cb() {
          var outline = $(this).data(namespace);

          if (!outline) {
            outline = new Outline(this, options, viewport);

            if (outline) {
              $(this).data(namespace, outline);
            }
          }
        });
      }
    }
  });
})();