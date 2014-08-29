/* modplug 1.4.1 - http://larsjung.de/modplug/ */
// This function is ment to be copied into your plugin file as a local
// variable.
//
// `modplug` expects a string `namespace` and a configuration object
// `options`.
//
//      options = {
//          statics: hash of functions,
//          methods: hash of functions,
//          defaultStatic: String/function,
//          defaultMethod: String/function
//      }
//
// For more details see <http://larsjung.de/modplug>.
var modplug = function (namespace, options) {
    'use strict';

        // Some references to enhance minification.
    var slice = [].slice,
        $ = jQuery,
        extend = $.extend,
        isFn = $.isFunction,

        // Save the initial settings.
        settings = extend({}, options),

        // Helper function to apply default methods.
        applyMethod = function (obj, args, methodName, methods) {

            // If `methodName` is a function apply it to get the actual
            // method name.
            methodName = isFn(methodName) ? methodName.apply(obj, args) : methodName;

            // If method exists then apply it and return the result ...
            if (isFn(methods[methodName])) {
                return methods[methodName].apply(obj, args);
            }

            // ... otherwise raise an error.
            $.error('Method "' + methodName + '" does not exist on jQuery.' + namespace);
        },

        // This function gets exposed as `$.<namespace>`.
        statics = function () {

            // Try to apply a default method.
            return applyMethod(this, slice.call(arguments), settings.defaultStatic, statics);
        },

        // This function gets exposed as `$(selector).<namespace>`.
        methods = function (method) {

            // If `method` exists then apply it ...
            if (isFn(methods[method])) {
                return methods[method].apply(this, slice.call(arguments, 1));
            }

            // ... otherwise try to apply a default method.
            return applyMethod(this, slice.call(arguments), settings.defaultMethod, methods);
        },

        // Adds/overwrites plugin methods. This function gets exposed as
        // `$.<namespace>.modplug` to make the plugin extendable.
        plug = function (options) {

            if (options) {
                extend(statics, options.statics);
                extend(methods, options.methods);
            }

            // Make sure that `$.<namespace>.modplug` points to this function
            // after adding new methods.
            statics.modplug = plug;
        };

    // Save objects or methods previously registered to the desired namespace.
    // They are available via `$.<namespace>.modplug.prev`.
    plug.prev = {
        statics: $[namespace],
        methods: $.fn[namespace]
    };

    // Init the plugin by adding the specified statics and methods.
    plug(options);

    // Register the plugin.
    $[namespace] = statics;
    $.fn[namespace] = methods;
};
