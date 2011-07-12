( function( $ ) {

	$( function () {

		$body = $( "body" );
		for ( var i = 0; i < 9; i++ ) {
			$( "<section />" ).appendTo( $body )
				.text( i )
				.width( i * 400 + 60 )
				.height( Math.random() * 800 + 60 );
		};
		
		var idx = 0;
		$( "section" ).each( function () {
			idx++;
			var $li = $( "<li><span class='idx'>" + idx + "</span></li>" ).appendTo( $( "#log ul" ) );
			$( this ).text( idx );
			$( this ).fracs( function ( fracs ) {
				$li.find( ".info" ).remove();
				$li.append( $( "<span class='info'>" + fracs.visible + "</span>" ) );
				$li.append( $( "<span class='info'>" + fracs.viewport + "</span>" ) );
				$li.append( $( "<span class='info'>" + fracs.possible + "</span>" ) );
				$li.find( "span.info" ).stop( true ).css( "background-color", "rgb(250,250,150)" ).animate( { "background-color": "#fff" }, 1000 );
				$( this ).add( $li.find( "span.idx" ) ).css( "background-color", "rgba(200,50,50," + fracs.possible + ")" );
			} );
		} );
		$( "section" ).eq( 5 ).fracs( "destroy" ).append( " off" );
	} );

} )( jQuery );