( function( $ ) {

	$( function () {

		$body = $( "body" );
		for ( var i = 1; i < 10; i++ ) {
			var $section = $( "<section />" ).appendTo( $body )
				.width( i * 300 )
				.height( Math.random() * 600 + 100 );
			$( "<div class='label'><span class='idx'>" + i + "</span><ul /></div>" ).appendTo( $section );
		};
		
		var idx = 0;
		$( "section" ).each( function () {
			idx++;
			var $li = $( "<li><span class='idx'>" + idx + "</span></li>" ).appendTo( $( "#panel ul" ) );
			$( this ).fracs( function ( fracs ) {
				$li.find( ".info" ).remove();
				$li.append( $( "<span class='info'>" + $.fracs.round( fracs.visible, 4 ) + "</span>" ) );
				$li.append( $( "<span class='info'>" + $.fracs.round( fracs.viewport, 4 ) + "</span>" ) );
				$li.append( $( "<span class='info'>" + $.fracs.round( fracs.possible, 4 ) + "</span>" ) );
				$li.find( "span.info" ).stop( true ).css( "background-color", "rgb(250,250,150)" ).animate( { "background-color": "#fff" }, 1000 );

				var $this = $( this );
				var $label = $this.find( ".label" );
				var $ul = $this.find( ".label ul" );

				$this.add( $li.find( "span.idx" ) ).css( "background-color", "rgba(200,50,50," + fracs.possible + ")" );
				$label.find( ".hint" ).remove();
				$ul.append( $( "<li class='hint'>" + $.fracs.round( fracs.visible * 100, 1 ) + "% visible</li>" ) );
				$ul.append( $( "<li class='hint'>" + $.fracs.round( fracs.possible * 100, 1 ) + "% of max possible visibility</li>" ) );
				$ul.append( $( "<li class='hint'>" + $.fracs.round( fracs.viewport * 100, 1 ) + "% of viewport</li>" ) );
				if ( fracs.rect !== undefined ) {
					$ul.append( $( "<li class='hint'>visible rect abs(" + fracs.rect.left + "," + fracs.rect.top + ") rel(" + fracs.rectRelative.left + "," + fracs.rectRelative.top + ") w/h(" + fracs.rect.width + "x" + fracs.rect.height + ")</li>" ) );
					$label
						.stop( true )
						.animate( {
							left: fracs.rectRelative.left + "px",
							top: fracs.rectRelative.top + "px",
							"max-width": ( fracs.rectRelative.width - 40 ) + "px"
						}, 100 );
				};
			} );
		} );
		$( "section" ).eq( 5 ).fracs( "destroy" ).find( ".label ul" ).empty().append( $( "<li class='hint'>off</li>" ) );
	} );

} )( jQuery );