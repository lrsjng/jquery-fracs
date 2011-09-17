/*
 * ModPlug 0.4
 * http://larsjung.de/modplug
 *
 * provided under the terms of the MIT License
 */

(function ($, undefined) {
    "use strict";

    var reference = "_mp_api";

    $.ModPlug = $.ModPlug || {
        plugin: function (namespace, options) {

            if (!namespace || $[namespace] || $.fn[namespace]) {
                // 1: no namespace specified
                // 2: static namespace not available
                // 3: namespace not available
                return !namespace ? 1 : ($[namespace] ? 2 : 3);
            }

            var defaults = {
                    statics: {},
                    methods: {},
                    defaultStatic: undefined,
                    defaultMethod: undefined
                },
                settings = $.extend({}, defaults, options),
                staticPlug = function () {

                    var args, defaultMethod;

                    args = Array.prototype.slice.call(arguments);
                    defaultMethod = settings.defaultStatic instanceof Function ? settings.defaultStatic.apply(this, args) : settings.defaultStatic;
                    if (staticPlug[defaultMethod] instanceof Function) {
                        return staticPlug[defaultMethod].apply(this, args);
                    }
                    $.error("Static method defaulted to '" + defaultMethod + "' does not exist on 'jQuery." + namespace + "'");
                },
                methods = {},
                methodPlug = function (method) {

                    var args, defaultMethod;

                    if (methods[method] instanceof Function) {
                        args = Array.prototype.slice.call(arguments, 1);
                        return methods[method].apply(this, args);
                    }

                    args = Array.prototype.slice.call(arguments);
                    defaultMethod = settings.defaultMethod instanceof Function ? settings.defaultMethod.apply(this, args) : settings.defaultMethod;
                    if (methods[defaultMethod] instanceof Function) {
                        return methods[defaultMethod].apply(this, args);
                    }
                    $.error("Method '" + method + "' defaulted to '" + defaultMethod + "' does not exist on 'jQuery." + namespace + "'");
                },
                api = {
                    addStatics: function (newStatics) {

                        $.extend(staticPlug, newStatics);
                        staticPlug[reference] = api;
                        return this;
                    },
                    addMethods: function (newMethods) {

                        $.extend(methods, newMethods);
                        return this;
                    }
                };

            api.addStatics(settings.statics).addMethods(settings.methods);
            $[namespace] = staticPlug;
            $.fn[namespace] = methodPlug;
            return 0;
        },
        module: function (namespace, options) {

            if (!$[namespace] || !$[namespace][reference]) {
                // 1: namespace not found
                // 2: namespace not a ModPlug plugin
                return !$[namespace] ? 1 : 2;
            }

            var defaults = {
                    statics: {},
                    methods: {}
                },
                settings = $.extend({}, defaults, options);

            $[namespace][reference].addStatics(settings.statics).addMethods(settings.methods);
            return 0;
        }
    };

})(jQuery);
