( function( $ ) {

	$( function () {

		$body = $( "body" );
		$panelFracs = $( "#panel .fracs" );

		// generate content
		for ( var i = 1; i < 10; i++ ) {
			
			//section
			var $section = $( "<section />" ).appendTo( $body )
				.width( i * 300 )
				.height( Math.round( Math.random() * 600 ) + 100 );
			var $label = $( "<div class='label'><span class='idx'>#" + i + "</span></div>" ).appendTo( $section );
			var $ul = $( "<ul />" ).appendTo( $label );
			$ul.append( $( "<li><span class='info possible' /> of max possible visibility</li>" ) );
			$ul.append( $( "<li><span class='info visible' /> visible</li>" ) );
			$ul.append( $( "<li><span class='info viewport' /> of viewport</li>" ) );
			var $rectsul = $( "<li>visible rect <span class='info dims' /><ul /></li>" ).appendTo( $ul ).find( "ul" );
			$rectsul.append( $( "<li>document space <span class='info rect' /></li>" ) );
			$rectsul.append( $( "<li>element space <span class='info rectElementSpace' /></li>" ) );
			$rectsul.append( $( "<li>viewport space <span class='info rectViewportSpace' /></li>" ) );
			
			// panel
			var $li = $( "<li />" ).appendTo( $panelFracs );
			$li.append( $( "<span class='idx'>" + i + "</span>" ) );
			$li.append( $( "<span class='info possible' /><span class='info visible' /><span class='info viewport' />" ) );

			$section.data( "panel", $li );
		};

		// init fracs
		$( "section" ).fracs( function ( fracs ) {
			var $section = $( this );
			var $panel = $section.data( "panel" );
			var $label = $section.find( ".label" );

			$section.add( $panel.find( ".idx" ) ).css( "background-color", "rgba(100,200,100," + fracs.possible + ")" );
			
			$panel.find( ".visible" ).text( $.fracs.round( fracs.visible, 4 ) );
			$panel.find( ".viewport" ).text( $.fracs.round( fracs.viewport, 4 ) );
			$panel.find( ".possible" ).text( $.fracs.round( fracs.possible, 4 ) );
			$panel.find( ".info" ).stop( true ).css( "background-color", "rgb(250,250,150)" ).animate( { "background-color": "#fff" }, 1000 );

			$label.find( ".visible" ).text( $.fracs.round( fracs.visible * 100, 1 ) + "%" );
			$label.find( ".viewport" ).text( $.fracs.round( fracs.viewport * 100, 1 ) + "%" );
			$label.find( ".possible" ).text( $.fracs.round( fracs.possible * 100, 1 ) + "%" );
			if ( fracs.rects === undefined ) {
				$label.find( ".rects" ).text( "undefined" );
			} else {
				$label.find( ".dims" ).text( "w/h: " + fracs.rects.document.width + "x" + fracs.rects.document.height );
				$label.find( ".rect" ).text( "l/t: " + fracs.rects.document.left + "," + fracs.rects.document.top );
				$label.find( ".rectElementSpace" ).text( "l/t: " + fracs.rects.element.left + "," + fracs.rects.element.top );
				$label.find( ".rectViewportSpace" ).text( "l/t: " + fracs.rects.viewport.left + "," + fracs.rects.viewport.top );
				$label.stop( true ).animate( {
					left: fracs.rects.element.left + "px",
					top: fracs.rects.element.top + "px"
				}, 100 );
			};
		} );

		// initial check
		$( "section" ).fracs( "check" );

		// test unbind
		$( "section" ).eq( 5 ).fracs( "unbind" ).find( ".label" ).empty().append( "<span class='idx'>#6</span> (unbound)" );

		// test multiple binds
		$( "section" ).eq( 7 ).fracs( function ( fracs ) {
			if ( fracs.possible == 1 ) {
				console.log( "#8 max possible visibility" );
			};
		} );
		
		// init groups
		var $s = $( "section" );
		var $group = $s.eq(3).add( $s.eq(4) ).add( $s.eq(5) ).add( $s.eq(6) ).add( $s.eq(7) );
		$group.fracs( "max", "possible", function ( best ) {
			$( "#panel .groups .possible" )
				.text( best !== undefined ? $( best.element ).find( ".idx" ).text(): "N/A" )
				.stop( true ).css( "background-color", "rgb(250,250,150)" ).animate( { "background-color": "#fff" }, 1000 );
		} );
		$group.fracs( "max", "visible", function ( best ) {
			$( "#panel .groups .visible" )
				.text( best !== undefined ? $( best.element ).find( ".idx" ).text(): "N/A" )
				.stop( true ).css( "background-color", "rgb(250,250,150)" ).animate( { "background-color": "#fff" }, 1000 );
		} );
		$group.fracs( "max", "viewport", function ( best ) {
			$( "#panel .groups .viewport" )
				.text( best !== undefined ? $( best.element ).find( ".idx" ).text(): "N/A" )
				.stop( true ).css( "background-color", "rgb(250,250,150)" ).animate( { "background-color": "#fff" }, 1000 );
		} );
	} );

} )( jQuery );