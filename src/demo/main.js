(() => {
    const WIN = window // eslint-disable-line
    const $ = WIN.jQuery;

    const round = (value, decs) => {
        if (isNaN(decs) || decs <= 0) {
            return Math.round(value);
        }
        const pow = Math.pow(10, decs);
        return Math.round(value * pow) / pow;
    };

    const generate_content = () => {
        const $body = $('body');
        const $panelFracs = $('.panel .fracs');
        const scrollToFn = $target => () => $target.fracs('scrollToThis', 50, 50, 500);

        for (let i = 1; i < 9; i += 1) {
            const $section = $('<section id="box-' + i + '" class="box" title="scroll to this element" />')
                .appendTo($body)
                .width(i * 300)
                .height(Math.round(Math.random() * 600 + 100));

            const $label = $('<div class="label"><span class="idx">#' + i + '</span></div>')
                .appendTo($section);

            const $ul = $('<ul />')
                .appendTo($label)
                .append($('<li><span class="info possible" /> of max possible visibility</li>'))
                .append($('<li><span class="info visible" /> visible</li>'))
                .append($('<li><span class="info viewport" /> of viewport</li>'));

            $('<li>visible rect <span class="info dims" /><ul /></li>')
                .appendTo($ul)
                .find('ul')
                .append($('<li>document space <span class="info rect" /></li>'))
                .append($('<li>element space <span class="info rectElementSpace" /></li>'))
                .append($('<li>viewport space <span class="info rectViewportSpace" /></li>'));

            // panel
            const $li = $('<li id="box-entry-' + i + '" class="section" title="scroll to this element" />')
                .appendTo($panelFracs)
                .append($('<span class="idx">' + i + '</span>'))
                .append($('<span class="info possible" /><span class="info visible" /><span class="info viewport" />'));

            $section.add($li).click(scrollToFn($section));

            $section.data('panel', $li);
        }
    };

    const init_fracs_demo = () => {
        $('.box').fracs(function cb(fracs) {
            const $section = $(this);
            const $panel = $section.data('panel');
            const $label = $section.find('.label');

            $section.add($panel.find('.idx'))
                .css('background-color', 'rgba(29,119,194,' + fracs.possible + ')');

            $panel
                .find('.visible').text(round(fracs.visible * 100) + '%').end()
                .find('.viewport').text(round(fracs.viewport * 100) + '%').end()
                .find('.possible').text(round(fracs.possible * 100) + '%').end();

            $label
                .find('.visible').text(round(fracs.visible * 100) + '%').end()
                .find('.viewport').text(round(fracs.viewport * 100) + '%').end()
                .find('.possible').text(round(fracs.possible * 100) + '%');

            if (!fracs.rects) {
                $label.find('.rects').text('undefined');
            } else {
                $label
                    .find('.dims').text('WxH: ' + fracs.rects.document.width + 'x' + fracs.rects.document.height).end()
                    .find('.rect').text('L,T: ' + fracs.rects.document.left + ',' + fracs.rects.document.top).end()
                    .find('.rectElementSpace').text('L,T: ' + fracs.rects.element.left + ',' + fracs.rects.element.top).end()
                    .find('.rectViewportSpace').text('L,T: ' + fracs.rects.viewport.left + ',' + fracs.rects.viewport.top).end()
                    .stop(true)
                    .animate({
                        left: fracs.rects.element.left + 'px',
                        top: fracs.rects.element.top + 'px'
                    }, 100);
            }
        });

        $('.box').fracs('check');

        $('#box-6')
            .fracs('unbind')
            .find('.label').empty().append('<span class="idx">#6</span> (unbound)');
    };

    const init_group_demo = () => {
        const $group = $('#box-4,#box-5,#box-6,#box-7,#box-8');

        $.each(['possible', 'visible', 'viewport'], (idx, value) => {
            $group.fracs('max', value, best => {
                $('.panel .groups .' + value).text(best ? $(best).find('.idx').text() : 'undef.');
            });
        });
    };

    const init_scrollstate_demo = () => {
        $(WIN).fracs('scrollState', (state, prevState) => {
            $.each(['width', 'height', 'left', 'top', 'right', 'bottom'], (idx, value) => {
                const val = state[value];
                let pval;

                if (!prevState || val !== prevState[value]) {
                    pval = isNaN(val) ? 'undef.' : value === 'width' || value === 'height' ? round(val * 100) + '%' : val + 'px';
                    $('.panel .scrollstate .' + value).text(pval);
                }
            });
        });
    };

    const init_dims_demo = () => {
        const on_resize = () => {
            const doc = $(WIN).fracs('content');
            const vp = $(WIN).fracs('viewport');
            $('#docDims').text('Document: ' + doc.width + 'x' + doc.height);
            $('#vpDims').text('Viewport: ' + vp.width + 'x' + vp.height);
        };

        $(WIN).bind('resize', on_resize);
        on_resize();
    };

    const init = () => {
        generate_content();
        init_group_demo();
        init_fracs_demo();
        init_scrollstate_demo();
        init_dims_demo();
    };

    $(init);
})();
