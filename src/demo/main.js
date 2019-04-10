(() => {
    const WIN = window // eslint-disable-line
    const $ = WIN.jQuery;

    const round = Math.round;

    const generate_content = () => {
        const $body = $('body');
        const $panel_fracs = $('#fracs');
        const get_scrollto_fn = $target => () => $target.fracs('scrollToThis', 50, 50, 500);

        for (let i = 1; i < 9; i += 1) {
            const $section = $('<section id="box-' + i + '" class="box" title="scroll to this element" />')
                .appendTo($body)
                .width(i * 300)
                .height(round(Math.random() * 600 + 100));

            const $label = $('<div class="label"><span class="idx">#' + i + '</span></div>')
                .appendTo($section);

            $('<ul />')
                .appendTo($label)
                .append($('<li><span class="info possible" /> of max possible visibility</li>'))
                .append($('<li><span class="info visible" /> visible</li>'))
                .append($('<li><span class="info viewport" /> of viewport</li>'))
                .append($('<li>visible rect WXH: <span class="info dims" /></li>'))
                .append($('<li>document space L/T: <span class="info rect" /></li>'))
                .append($('<li>element space L/T: <span class="info rectElementSpace" /></li>'))
                .append($('<li>viewport space L/T: <span class="info rectViewportSpace" /></li>'));

            // panel
            const $li = $('<li id="box-entry-' + i + '" class="section" title="scroll to this element" />')
                .appendTo($panel_fracs)
                .append($('<span class="idx">' + i + '</span>'))
                .append($('<span class="info possible" /><span class="info visible" /><span class="info viewport" />'));

            $section.add($li).click(get_scrollto_fn($section));
            $section.data('panel', $li);
        }
    };

    const init_fracs_demo = () => {
        $('.box').fracs(function cb(fracs) {
            const $section = $(this);
            const $panel = $section.data('panel');
            const $label = $section.find('.label');

            $panel.find('.idx')
                .css('color', fracs.possible > 0.4 ? '#fff' : 'inherit');

            $section.add($panel.find('.idx'))
                .css('background-color', 'rgba(29,119,194,' + fracs.possible + ')');

            $panel.add($label)
                .find('.visible').text(round(fracs.visible * 100) + '%').end()
                .find('.viewport').text(round(fracs.viewport * 100) + '%').end()
                .find('.possible').text(round(fracs.possible * 100) + '%');

            if (!fracs.rects) {
                $label.find('.rects').text('undefined');
            } else {
                $label
                    .find('.dims').text(fracs.rects.document.width + 'x' + fracs.rects.document.height).end()
                    .find('.rect').text(fracs.rects.document.left + '/' + fracs.rects.document.top).end()
                    .find('.rectElementSpace').text(fracs.rects.element.left + '/' + fracs.rects.element.top).end()
                    .find('.rectViewportSpace').text(fracs.rects.viewport.left + '/' + fracs.rects.viewport.top).end()
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

    const init_scrollstate_demo = () => {
        $(WIN).fracs('scrollState', state => {
            ['width', 'height', 'left', 'top', 'right', 'bottom'].forEach(x => {
                const val = state[x];
                const txt = isNaN(val) ? 'undef.' : x === 'width' || x === 'height' ? round(val * 100) + '%' : val + 'px';
                $('#scrollstate .' + x).text(txt);
            });
        });
    };

    const init_dims_demo = () => {
        const on_resize = () => {
            const doc = $(WIN).fracs('content');
            const vp = $(WIN).fracs('viewport');
            $('.doc').text(doc.width + 'x' + doc.height);
            $('.vp').text(vp.width + 'x' + vp.height);
        };

        $(WIN).bind('resize', on_resize);
        on_resize();
    };

    const init = () => {
        init_scrollstate_demo();
        generate_content();
        init_dims_demo();
        init_fracs_demo();
    };

    $(init);
})();
