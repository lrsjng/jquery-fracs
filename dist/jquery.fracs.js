/*! jquery-fracs v0.16.0 - https://larsjung.de/jquery-fracs/ */
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function () {
  var WIN = window; // eslint-disable-line

  var DOC = WIN.document;
  var $ = WIN.jQuery;
  var $win = $(WIN);
  var $doc = $(DOC);
  var extend = $.extend;
  var is_fn = $.isFunction;
  var math_max = Math.max;
  var math_min = Math.min;
  var math_round = Math.round;

  var get_id = function () {
    var ids = {};
    var next_id = 1;
    return function (el) {
      if (!el) {
        return 0;
      }

      if (!ids[el]) {
        ids[el] = next_id;
        next_id += 1;
      }

      return ids[el];
    };
  }();

  var is_typeof = function is_typeof(obj, type) {
    return _typeof(obj) === type;
  };

  var is_instanceof = function is_instanceof(obj, type) {
    return obj instanceof type;
  };

  var is_html_el = function is_html_el(obj) {
    return obj && obj.nodeType;
  };

  var get_html_el = function get_html_el(obj) {
    return is_html_el(obj) ? obj : is_instanceof(obj, $) ? obj[0] : undefined;
  };

  var reduce = function reduce(elements, fn, current) {
    $.each(elements, function (idx, el) {
      current = Reflect.apply(fn, el, [current, idx, el]);
    });
    return current;
  };

  var equal = function equal(obj1, obj2, props) {
    if (obj1 === obj2) {
      return true;
    }

    if (!obj1 || !obj2 || obj1.constructor !== obj2.constructor) {
      return false;
    }

    for (var i = 0, l = props.length; i < l; i += 1) {
      var prop = props[i];

      if (obj1[prop] && is_fn(obj1[prop].equals) && !obj1[prop].equals(obj2[prop])) {
        return false;
      }

      if (obj1[prop] !== obj2[prop]) {
        return false;
      }
    }

    return true;
  }; // Objects
  // =======
  // Rect
  // ----
  // Holds the position and dimensions of a rectangle. The position might be
  // relative to document, viewport or element space.


  function Rect(left, top, width, height) {
    // Top left corner of the rectangle rounded to integers.
    this.left = math_round(left);
    this.top = math_round(top); // Dimensions rounded to integers.

    this.width = math_round(width);
    this.height = math_round(height); // Bottom right corner of the rectangle.

    this.right = this.left + this.width;
    this.bottom = this.top + this.height;
  } // ### Prototype


  extend(Rect.prototype, {
    // Checks if this instance equals `that` in position and dimensions.
    equals: function equals(that) {
      return equal(this, that, ['left', 'top', 'width', 'height']);
    },
    // Returns the area of this rectangle.
    area: function area() {
      return this.width * this.height;
    },
    // Returns a new `Rect` representig this rect relative to `rect`.
    relativeTo: function relativeTo(rect) {
      return new Rect(this.left - rect.left, this.top - rect.top, this.width, this.height);
    },
    // Returns a new rectangle representing the intersection of this
    // instance and `rect`. If there is no intersection the return value
    // is `null`.
    intersection: function intersection(rect) {
      if (!is_instanceof(rect, Rect)) {
        return null;
      }

      var left = math_max(this.left, rect.left);
      var right = math_min(this.right, rect.right);
      var top = math_max(this.top, rect.top);
      var bottom = math_min(this.bottom, rect.bottom);
      var width = right - left;
      var height = bottom - top;
      return width >= 0 && height >= 0 ? new Rect(left, top, width, height) : null;
    },
    // Returns a new rectangle representing the smallest rectangle
    // containing this instance and `rect`.
    envelope: function envelope(rect) {
      if (!is_instanceof(rect, Rect)) {
        return this;
      }

      var left = math_min(this.left, rect.left);
      var right = math_max(this.right, rect.right);
      var top = math_min(this.top, rect.top);
      var bottom = math_max(this.bottom, rect.bottom);
      var width = right - left;
      var height = bottom - top;
      return new Rect(left, top, width, height);
    }
  }); // ### Static methods

  extend(Rect, {
    // Returns a new instance of `Rect` representing the content of the
    // specified element. Since the coordinates are in content space the
    // `left` and `top` values are always set to `0`. If `inDocSpace` is
    // `true` the rect gets returned in document space.
    ofContent: function ofContent(el, inContentSpace) {
      if (!el || el === DOC || el === WIN) {
        return new Rect(0, 0, $doc.width(), $doc.height());
      }

      if (inContentSpace) {
        return new Rect(0, 0, el.scrollWidth, el.scrollHeight);
      }

      return new Rect(el.offsetLeft - el.scrollLeft, el.offsetTop - el.scrollTop, el.scrollWidth, el.scrollHeight);
    },
    // Returns a new instance of `Rect` representing the viewport of the
    // specified element. If `inDocSpace` is `true` the rect gets returned
    // in document space instead of content space.
    ofViewport: function ofViewport(el, inContentSpace) {
      if (!el || el === DOC || el === WIN) {
        return new Rect($win.scrollLeft(), $win.scrollTop(), $win.width(), $win.height());
      }

      if (inContentSpace) {
        return new Rect(el.scrollLeft, el.scrollTop, el.clientWidth, el.clientHeight);
      }

      return new Rect(el.offsetLeft, el.offsetTop, el.clientWidth, el.clientHeight);
    },
    // Returns a new instance of `Rect` representing a given
    // `HTMLElement`. The dimensions respect padding and border widths. If
    // the element is invisible (as determined by jQuery) the return value
    // is null.
    ofElement: function ofElement(el) {
      var $el = $(el);

      if (!$el.is(':visible')) {
        return null;
      }

      var offset = $el.offset();
      return new Rect(offset.left, offset.top, $el.outerWidth(), $el.outerHeight());
    }
  }); // Fractions
  // ---------
  // The heart of the library. Creates and holds the
  // fractions data for the two specified rects. `viewport` defaults to
  // `Rect.ofViewport()`.

  function Fractions(visible, viewport, possible, rects) {
    this.visible = visible || 0;
    this.viewport = viewport || 0;
    this.possible = possible || 0;
    this.rects = rects && extend({}, rects) || null;
  } // ### Prototype


  extend(Fractions.prototype, {
    // Checks if this instance equals `that` in all attributes.
    equals: function equals(that) {
      return this.fracsEqual(that) && this.rectsEqual(that);
    },
    // Checks if this instance equals `that` in all fraction attributes.
    fracsEqual: function fracsEqual(that) {
      return equal(this, that, ['visible', 'viewport', 'possible']);
    },
    // Checks if this instance equals `that` in all rectangle attributes.
    rectsEqual: function rectsEqual(that) {
      return equal(this.rects, that.rects, ['document', 'element', 'viewport']);
    }
  }); // ### Static methods

  extend(Fractions, {
    of: function of(rect, viewport) {
      rect = is_html_el(rect) && Rect.ofElement(rect) || rect;
      viewport = is_html_el(viewport) && Rect.ofViewport(viewport) || viewport || Rect.ofViewport();

      if (!(rect instanceof Rect)) {
        return new Fractions();
      }

      var intersection = rect.intersection(viewport);

      if (!intersection) {
        return new Fractions();
      }

      var intersectionArea = intersection.area();
      var possibleArea = math_min(rect.width, viewport.width) * math_min(rect.height, viewport.height);
      return new Fractions(intersectionArea / rect.area(), intersectionArea / viewport.area(), intersectionArea / possibleArea, {
        document: intersection,
        element: intersection.relativeTo(rect),
        viewport: intersection.relativeTo(viewport)
      });
    }
  }); // Group
  // -----

  function Group(elements, viewport) {
    this.els = elements;
    this.viewport = viewport;
  } // ### Helpers
  // Accepted values for `property` parameters below.


  var rect_props = ['width', 'height', 'left', 'right', 'top', 'bottom'];
  var fracs_props = ['possible', 'visible', 'viewport']; // Returns the specified `property` for `HTMLElement element` or `0`
  // if `property` is invalid.

  var get_value = function get_value(el, viewport, property) {
    var obj;

    if (rect_props.includes(property)) {
      obj = Rect.ofElement(el);
    } else if (fracs_props.includes(property)) {
      obj = Fractions.of(el, viewport);
    }

    return obj ? obj[property] : 0;
  }; // Sorting functions.


  var sort_asc = function sort_asc(entry1, entry2) {
    return entry1.val - entry2.val;
  };

  var sort_desc = function sort_desc(entry1, entry2) {
    return entry2.val - entry1.val;
  }; // ### Prototype


  extend(Group.prototype, {
    // Returns a sorted list of objects `{el: HTMLElement, val: Number}`
    // for the specified `property`. `descending` defaults to `false`.
    sorted: function sorted(property, descending) {
      var viewport = this.viewport;
      return $.map(this.els, function (el) {
        return {
          el: el,
          val: get_value(el, viewport, property)
        };
      }).sort(descending ? sort_desc : sort_asc);
    },
    // Returns the first element of the sorted list returned by `sorted` above,
    // or `null` if this list is empty.
    best: function best(property, descending) {
      return this.els.length ? this.sorted(property, descending)[0] : null;
    }
  }); // ScrollState
  // -----------

  function ScrollState(el) {
    var content = Rect.ofContent(el, true);
    var viewport = Rect.ofViewport(el, true);
    var w = content.width - viewport.width;
    var h = content.height - viewport.height;
    this.content = content;
    this.viewport = viewport;
    this.width = w <= 0 ? null : viewport.left / w;
    this.height = h <= 0 ? null : viewport.top / h;
    this.left = viewport.left;
    this.top = viewport.top;
    this.right = content.right - viewport.right;
    this.bottom = content.bottom - viewport.bottom;
  } // ### Prototype


  extend(ScrollState.prototype, {
    // Checks if this instance equals `that`.
    equals: function equals(that) {
      return equal(this, that, ['width', 'height', 'left', 'top', 'right', 'bottom', 'content', 'viewport']);
    }
  }); // Viewport
  // --------

  function Viewport(el) {
    this.el = el || WIN;
  } // ### Prototype


  extend(Viewport.prototype, {
    // Checks if this instance equals `that`.
    equals: function equals(that) {
      return equal(this, that, ['el']);
    },
    scrollState: function scrollState() {
      return new ScrollState(this.el);
    },
    scrollTo: function scrollTo(left, top, duration) {
      var $el = this.el === WIN ? $('html,body') : $(this.el);
      left = left || 0;
      top = top || 0;
      duration = isNaN(duration) ? 1000 : duration;
      $el.stop(true).animate({
        scrollLeft: left,
        scrollTop: top
      }, duration);
    },
    scroll: function scroll(left, top, duration) {
      var $el = this.el === WIN ? $win : $(this.el);
      left = left || 0;
      top = top || 0;
      this.scrollTo($el.scrollLeft() + left, $el.scrollTop() + top, duration);
    },
    scrollToRect: function scrollToRect(rect, paddingLeft, paddingTop, duration) {
      paddingLeft = paddingLeft || 0;
      paddingTop = paddingTop || 0;
      this.scrollTo(rect.left - paddingLeft, rect.top - paddingTop, duration);
    },
    scrollToElement: function scrollToElement(el, paddingLeft, paddingTop, duration) {
      var rect = Rect.ofElement(el).relativeTo(Rect.ofContent(this.el));
      this.scrollToRect(rect, paddingLeft, paddingTop, duration);
    }
  }); // Callbacks
  // =========
  // callbacks mix-in
  // ----------------
  // Expects `context: HTMLElement` and `updatedValue: function`.

  var callbacksMixIn = {
    // Initial setup.
    init: function init() {
      this.callbacks = $.Callbacks('memory unique');
      this.currVal = null;
      this.prevVal = null; // A proxy to make `check` bindable to events.

      this.checkProxy = $.proxy(this.check, this);
      this.autoCheck();
    },
    // Adds a new callback function.
    bind: function bind(callback) {
      this.callbacks.add(callback);
    },
    // Removes a previously added callback function.
    unbind: function unbind(callback) {
      if (callback) {
        this.callbacks.remove(callback);
      } else {
        this.callbacks.empty();
      }
    },
    // Triggers all callbacks with the current values.
    trigger: function trigger() {
      this.callbacks.fireWith(this.context, [this.currVal, this.prevVal]);
    },
    // Checks if value changed, updates attributes `currVal` and
    // `prevVal` accordingly and triggers the callbacks. Returns
    // `true` if value changed, otherwise `false`.
    check: function check(event) {
      var value = this.updatedValue(event);

      if (value === undefined) {
        return false;
      }

      this.prevVal = this.currVal;
      this.currVal = value;
      this.trigger();
      return true;
    },
    // Auto-check configuration.
    $autoTarget: $win,
    autoEvents: 'load resize scroll',
    // Enables/disables automated checking for changes on the specified `window`
    // events.
    autoCheck: function autoCheck(on) {
      this.$autoTarget[on === false ? 'off' : 'on'](this.autoEvents, this.checkProxy);
    }
  }; // FracsCallbacks
  // --------------

  function FracsCallbacks(el, viewport) {
    this.context = el;
    this.viewport = viewport;
    this.init();
  } // ### Prototype


  extend(FracsCallbacks.prototype, callbacksMixIn, {
    updatedValue: function updatedValue() {
      var value = Fractions.of(this.context, this.viewport);

      if (!this.currVal || !this.currVal.equals(value)) {
        return value;
      }

      return undefined;
    }
  }); // GroupCallbacks
  // --------------

  function GroupCallbacks(elements, viewport, property, descending) {
    this.context = new Group(elements, viewport);
    this.property = property;
    this.descending = descending;
    this.init();
  } // ### Prototype


  extend(GroupCallbacks.prototype, callbacksMixIn, {
    updatedValue: function updatedValue() {
      var best = this.context.best(this.property, this.descending);

      if (best) {
        best = best.val > 0 ? best.el : null;

        if (this.currVal !== best) {
          return best;
        }
      }

      return undefined;
    }
  }); // ScrollStateCallbacks
  // --------------------

  function ScrollStateCallbacks(el) {
    if (!el || el === WIN || el === DOC) {
      this.context = WIN;
    } else {
      this.context = el;
      this.$autoTarget = $(el);
    }

    this.init();
  } // ### Prototype


  extend(ScrollStateCallbacks.prototype, callbacksMixIn, {
    updatedValue: function updatedValue() {
      var value = new ScrollState(this.context);

      if (!this.currVal || !this.currVal.equals(value)) {
        return value;
      }

      return undefined;
    }
  }); // modplug 1.6 modified

  var modplug = function modplug(namespace, options) {
    var statics = function statics() {
      return statics.fracs.apply(statics, arguments);
    };

    var methods = function methods() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // eslint-disable-line
      var method = methods.fracs;

      if (is_fn(methods[args[0]])) {
        method = methods[args[0]];
        args = args.slice(1);
      }

      return Reflect.apply(method, this, args);
    };

    var plug = function plug(opts) {
      if (opts) {
        extend(statics, opts.statics);
        extend(methods, opts.methods);
      }

      statics.modplug = plug;
    };

    plug(options);
    $[namespace] = statics;
    $.fn[namespace] = methods;
  }; // Register the plug-in
  // ====================
  // The namespace used to register the plug-in and to attach data to
  // elements.


  var namespace = 'fracs'; // The methods are sorted in alphabetical order. All methods that do not
  // provide a return value will return `this` to enable method chaining.

  modplug(namespace, {
    // Static methods
    // --------------
    // These methods are accessible via `$.fracs.<methodname>`.
    statics: {
      // Publish object constructors (for testing).
      Rect: Rect,
      Fractions: Fractions,
      Group: Group,
      ScrollState: ScrollState,
      Viewport: Viewport,
      FracsCallbacks: FracsCallbacks,
      GroupCallbacks: GroupCallbacks,
      ScrollStateCallbacks: ScrollStateCallbacks,
      // ### fracs
      // This is the **default method**. So instead of calling
      // `$.fracs.fracs(...)` simply call `$.fracs(...)`.
      //
      // Returns the fractions for a given `Rect` and `viewport`,
      // viewport defaults to `$.fracs.viewport()`.
      //
      //      $.fracs(rect: Rect, [viewport: Rect]): Fractions
      fracs: function fracs(rect, viewport) {
        return Fractions.of(rect, viewport);
      }
    },
    // Instance methods
    // ----------------
    // These methods are accessible via `$(selector).fracs('<methodname>', ...)`.
    methods: {
      // ### 'content'
      // Returns the content rect of the first selected element in content space.
      // If no element is selected it returns the document rect.
      //
      //      .fracs('content'): Rect
      content: function content(inContentSpace) {
        return this.length ? Rect.ofContent(this[0], inContentSpace) : null;
      },
      // ### 'envelope'
      // Returns the smallest rectangle that containes all selected elements.
      //
      //      .fracs('envelope'): Rect
      envelope: function envelope() {
        return reduce(this, function cb(current) {
          var rect = Rect.ofElement(this);
          return current ? current.envelope(rect) : rect;
        });
      },
      // ### 'fracs'
      // This is the **default method**. So the first parameter `'fracs'`
      // can be omitted.
      //
      // Returns the fractions for the first selected element.
      //
      //      .fracs(): Fractions
      //
      // Binds a callback function that will be invoked if fractions have changed
      // after a `window resize` or `window scroll` event.
      //
      //      .fracs(callback(fracs: Fractions, prevFracs: Fractions)): jQuery
      //
      // Unbinds the specified callback function.
      //
      //      .fracs('unbind', callback): jQuery
      //
      // Unbinds all callback functions.
      //
      //      .fracs('unbind'): jQuery
      //
      // Checks if fractions changed and if so invokes all bound callback functions.
      //
      //      .fracs('check'): jQuery
      fracs: function fracs(action, callback, viewport) {
        if (!is_typeof(action, 'string')) {
          viewport = callback;
          callback = action;
          action = null;
        }

        if (!is_fn(callback)) {
          viewport = callback;
          callback = null;
        }

        viewport = get_html_el(viewport);
        var ns = namespace + '.fracs.' + get_id(viewport);

        if (action === 'unbind') {
          return this.each(function cb() {
            var cbs = $(this).data(ns);

            if (cbs) {
              cbs.unbind(callback);
            }
          });
        } else if (action === 'check') {
          return this.each(function cb() {
            var cbs = $(this).data(ns);

            if (cbs) {
              cbs.check();
            }
          });
        } else if (is_fn(callback)) {
          return this.each(function cb() {
            var $this = $(this);
            var cbs = $this.data(ns);

            if (!cbs) {
              cbs = new FracsCallbacks(this, viewport);
              $this.data(ns, cbs);
            }

            cbs.bind(callback);
          });
        }

        return this.length ? Fractions.of(this[0], viewport) : null;
      },
      // ### 'intersection'
      // Returns the greatest rectangle that is contained in all selected elements.
      //
      //      .fracs('intersection'): Rect
      intersection: function intersection() {
        return reduce(this, function cb(current) {
          var rect = Rect.ofElement(this);
          return current ? current.intersection(rect) : rect;
        });
      },
      // ### 'max'
      // Reduces the set of selected elements to those with the maximum value
      // of the specified property.
      // Valid values for property are `possible`, `visible`, `viewport`,
      // `width`, `height`, `left`, `right`, `top`, `bottom`.
      //
      //      .fracs('max', property: String): jQuery
      //
      // Binds a callback function to the set of selected elements that gets
      // triggert whenever the element with the highest value of the specified
      // property changes.
      //
      //      .fracs('max', property: String, callback(best: Element, prevBest: Element)): jQuery
      max: function max(property, callback, viewport) {
        if (!is_fn(callback)) {
          viewport = callback;
          callback = null;
        }

        viewport = get_html_el(viewport);

        if (callback) {
          new GroupCallbacks(this, viewport, property, true).bind(callback);
          return this;
        }

        return this.pushStack(new Group(this, viewport).best(property, true).el);
      },
      // ### 'min'
      // Reduces the set of selected elements to those with the minimum value
      // of the specified property.
      // Valid values for property are `possible`, `visible`, `viewport`,
      // `width`, `height`, `left`, `right`, `top`, `bottom`.
      //
      //      .fracs('min', property: String): jQuery
      //
      // Binds a callback function to the set of selected elements that gets
      // triggert whenever the element with the lowest value of the specified
      // property changes.
      //
      //      .fracs('min', property: String, callback(best: Element, prevBest: Element)): jQuery
      min: function min(property, callback, viewport) {
        if (!is_fn(callback)) {
          viewport = callback;
          callback = null;
        }

        viewport = get_html_el(viewport);

        if (callback) {
          new GroupCallbacks(this, viewport, property).bind(callback);
          return this;
        }

        return this.pushStack(new Group(this, viewport).best(property).el);
      },
      // ### 'rect'
      // Returns the dimensions for the first selected element in document space.
      //
      //      .fracs('rect'): Rect
      rect: function rect() {
        return this.length ? Rect.ofElement(this[0]) : null;
      },
      // ### 'scrollState'
      // Returns the current scroll state for the first selected element.
      //
      //      .fracs('scrollState'): ScrollState
      //
      // Binds a callback function that will be invoked if scroll state has changed
      // after a `resize` or `scroll` event.
      //
      //      .fracs('scrollState', callback(scrollState: scrollState, prevScrollState: scrollState)): jQuery
      //
      // Unbinds the specified callback function.
      //
      //      .fracs('scrollState', 'unbind', callback): jQuery
      //
      // Unbinds all callback functions.
      //
      //      .fracs('scrollState', 'unbind'): jQuery
      //
      // Checks if scroll state changed and if so invokes all bound callback functions.
      //
      //      .fracs('scrollState', 'check'): jQuery
      scrollState: function scrollState(action, callback) {
        var ns = namespace + '.scrollState';

        if (!is_typeof(action, 'string')) {
          callback = action;
          action = null;
        }

        if (action === 'unbind') {
          return this.each(function cb() {
            var cbs = $(this).data(ns);

            if (cbs) {
              cbs.unbind(callback);
            }
          });
        } else if (action === 'check') {
          return this.each(function cb() {
            var cbs = $(this).data(ns);

            if (cbs) {
              cbs.check();
            }
          });
        } else if (is_fn(callback)) {
          return this.each(function cb() {
            var $this = $(this);
            var cbs = $this.data(ns);

            if (!cbs) {
              cbs = new ScrollStateCallbacks(this);
              $this.data(ns, cbs);
            }

            cbs.bind(callback);
          });
        }

        return this.length ? new ScrollState(this[0]) : null;
      },
      // ### 'scroll'
      // Scrolls the selected elements relative to its current position,
      // `padding` defaults to `0`, `duration` to `1000`.
      //
      //      .fracs('scroll', element: HTMLElement/jQuery, [paddingLeft: int,] [paddingTop: int,] [duration: int]): jQuery
      scroll: function scroll(left, top, duration) {
        return this.each(function cb() {
          new Viewport(this).scroll(left, top, duration);
        });
      },
      // ### 'scrollTo'
      // Scrolls the selected elements to the specified element or an absolute position,
      // `padding` defaults to `0`, `duration` to `1000`.
      //
      //      .fracs('scrollTo', element: HTMLElement/jQuery, [paddingLeft: int,] [paddingTop: int,] [duration: int]): jQuery
      //      .fracs('scrollTo', [left: int,] [top: int,] [duration: int]): jQuery
      scrollTo: function scrollTo(el, paddingLeft, paddingTop, duration) {
        if ($.isNumeric(el)) {
          duration = paddingTop;
          paddingTop = paddingLeft;
          paddingLeft = el;
          el = null;
        }

        el = get_html_el(el);
        return this.each(function cb() {
          if (el) {
            new Viewport(this).scrollToElement(el, paddingLeft, paddingTop, duration);
          } else {
            new Viewport(this).scrollTo(paddingLeft, paddingTop, duration);
          }
        });
      },
      // ### 'scrollToThis'
      // Scrolls the viewport (window) to the first selected element in the specified time,
      // `padding` defaults to `0`, `duration` to `1000`.
      //
      //      .fracs('scrollToThis', [paddingLeft: int,] [paddingTop: int,] [duration: int,] [viewport: HTMLElement/jQuery]): jQuery
      scrollToThis: function scrollToThis(paddingLeft, paddingTop, duration, viewport) {
        viewport = new Viewport(get_html_el(viewport));
        viewport.scrollToElement(this[0], paddingLeft, paddingTop, duration);
        return this;
      },
      // ### 'softLink'
      // Converts all selected page intern links `<a href="#...">` into soft links.
      // Uses `scrollTo` to scroll to the location.
      //
      //      .fracs('softLink', [paddingLeft: int,] [paddingTop: int,] [duration: int,] [viewport: HTMLElement/jQuery]): jQuery
      softLink: function softLink(paddingLeft, paddingTop, duration, viewport) {
        viewport = new Viewport(get_html_el(viewport));
        return this.filter('a[href^=#]').each(function cb() {
          var $a = $(this);
          $a.on('click', function () {
            viewport.scrollToElement($($a.attr('href'))[0], paddingLeft, paddingTop, duration);
          });
        });
      },
      // ### 'sort'
      // Sorts the set of selected elements by the specified property.
      // Valid values for property are `possible`, `visible`, `viewport`,
      // `width`, `height`, `left`, `right`, `top`, `bottom`. The default
      // sort order is descending.
      //
      //      .fracs('sort', property: String, [ascending: boolean]): jQuery
      sort: function sort(property, ascending, viewport) {
        if (!is_typeof(ascending, 'boolean')) {
          viewport = ascending;
          ascending = null;
        }

        viewport = get_html_el(viewport);
        return this.pushStack($.map(new Group(this, viewport).sorted(property, !ascending), function (entry) {
          return entry.el;
        }));
      },
      // ### 'viewport'
      // Returns the current viewport of the first selected element in content space.
      // If no element is selected it returns the document's viewport.
      //
      //      .fracs('viewport'): Rect
      viewport: function viewport(inContentSpace) {
        return this.length ? Rect.ofViewport(this[0], inContentSpace) : null;
      }
    }
  });
})();