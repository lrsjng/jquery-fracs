/*globals window, jQuery */
(function($) {
    'use strict';

    var generateContent = function () {

            var $body = $('body'),
                $panelFracs = $('.panel .fracs'),
                scrollToFn = function ($target) {
                    return function () {
                        $target.fracs('scrollTo', 50, 50, 500);
                    };
                },
                i, $section, $label, $ul, $rectsul, $li;

            for (i = 1; i < 10; i += 1) {

                //section
                $section = $('<section id="box-' + i + '" class="box" title="scroll to this element" />')
                    .appendTo($body)
                    .width(i * 300)
                    .height(Math.round(Math.random() * 600) + 100);

                $label = $('<div class="label"><span class="idx">#' + i + '</span></div>')
                    .appendTo($section);

                $ul = $('<ul />')
                    .appendTo($label)
                    .append($('<li><span class="info possible" /> of max possible visibility</li>'))
                    .append($('<li><span class="info visible" /> visible</li>'))
                    .append($('<li><span class="info viewport" /> of viewport</li>'));

                $rectsul = $('<li>visible rect <span class="info dims" /><ul /></li>')
                    .appendTo($ul)
                    .find('ul')
                        .append($('<li>document space <span class="info rect" /></li>'))
                        .append($('<li>element space <span class="info rectElementSpace" /></li>'))
                        .append($('<li>viewport space <span class="info rectViewportSpace" /></li>'));

                // panel
                $li = $('<li id="box-entry-' + i + '" class="section" title="scroll to this element" />')
                    .appendTo($panelFracs)
                    .append($('<span class="idx">' + i + '</span>'))
                    .append($('<span class="info possible" /><span class="info visible" /><span class="info viewport" />'));

                $section.add($li).click(scrollToFn($section));

                $section.data('panel', $li);
            }
        },
        initFracsDemo = function () {

            // init fracs
            $('.box').fracs(function (fracs) {

                var $section = $(this),
                    $panel = $section.data('panel'),
                    $label = $section.find('.label'),
                    $s, $group;

                $section.add($panel.find('.idx'))
                    .css('background-color', 'rgba(32,128,255,' + fracs.possible + ')');

                $panel
                    .find('.visible').text($.fracs.round(fracs.visible, 4)).end()
                    .find('.viewport').text($.fracs.round(fracs.viewport, 4)).end()
                    .find('.possible').text($.fracs.round(fracs.possible, 4)).end()
                    .highlight();

                $label
                    .find('.visible').text($.fracs.round(fracs.visible * 100, 1) + '%').end()
                    .find('.viewport').text($.fracs.round(fracs.viewport * 100, 1) + '%').end()
                    .find('.possible').text($.fracs.round(fracs.possible * 100, 1) + '%');

                if (!fracs.rects) {
                    $label
                        .find('.rects').text('undefined');
                } else {
                    $label
                        .find('.dims').text('w/h: ' + fracs.rects.document.width + 'x' + fracs.rects.document.height).end()
                        .find('.rect').text('l/t: ' + fracs.rects.document.left + ',' + fracs.rects.document.top).end()
                        .find('.rectElementSpace').text('l/t: ' + fracs.rects.element.left + ',' + fracs.rects.element.top).end()
                        .find('.rectViewportSpace').text('l/t: ' + fracs.rects.viewport.left + ',' + fracs.rects.viewport.top).end()
                        .stop(true)
                        .animate({
                            left: fracs.rects.element.left + 'px',
                            top: fracs.rects.element.top + 'px'
                        }, 100);
                }
            });

            // initial check
            $('.box').fracs('check');

            // test unbind
            $('#box-6')
                .fracs('unbind')
                .find('.label').empty().append('<span class="idx">#6</span> (unbound)');

            // test hidden elements
            //$('#box-3').css('display', 'none');
            //$('#box-4').hide();
            //$('#box-5').css('visibility', 'hidden');
        },
        initGroupDemo = function () {

            var $group = $('#box-4,#box-5,#box-6,#box-7,#box-8');

            $.each(['possible', 'visible', 'viewport'], function(idx, value) {

                $group.fracs('max', value, function (best) {

                    $('.panel .groups .' + value)
                        .text(best ? $(best.el).find('.idx').text() : 'undef.')
                        .highlight();
                });
            });
        },
        initScrollStateDemo = function () {

            $.fracs.scrollState(function (state, prevState) {

                $.each(['width', 'height', 'left', 'top', 'right', 'bottom'], function (idx, value) {

                    var val = state[value],
                        pval;

                    if (!prevState || val !== prevState[value]) {

                        pval = isNaN(val) ? 'undef.' : ((value === 'width' || value === 'height') ? $.fracs.round(val * 100, 1) + '%' : val + 'px');

                        $('.panel .scrollstate .' + value)
                            .text(pval)
                            .highlight();
                    }
                });
            });
        },
        initDimsDemo = function () {

            var onResize = function () {
    
                    var doc = $.fracs.document(),
                        vp = $.fracs.viewport();
    
                    $('#docDims').text('Document: ' + doc.width + 'x' + doc.height);
                    $('#vpDims').text('Viewport: ' + vp.width + 'x' + vp.height);
                };

            $(window).bind('resize', onResize);
            onResize();
        },
        initOutlineDemo = function () {

            $('#outline').fracs('outline', {
                crop: true,
                styles: [{
                    selector: '.box',
                    strokeWidth: 'auto',
                    strokeStyle: 'auto',
                    fillStyle: 'auto'
                }, {
                    selector: 'body > h1',
                    fillStyle: 'rgb(190,190,190)'
                }],
                viewportStyle: {
                    fillStyle: 'rgba(104,169,255,0.3)'
                },
                viewportDragStyle: {
                    fillStyle: 'rgba(104,169,255,0.5)'
                }
            });
        };

    $.fn.highlight = function () {

        this
            .stop(true)
            .css('background-color', 'rgb(250,250,150)')
            .animate({'background-color': '#fff'}, 1000);
    };

    $(function () {

        generateContent();
        initGroupDemo();
        initFracsDemo();
        initScrollStateDemo();
        initDimsDemo();
        initOutlineDemo();
    });

}(jQuery));
