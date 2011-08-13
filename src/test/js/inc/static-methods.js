
module( "static methods" );


test( "rect", function () {

	var $ele = $( "<div/>" )
		.appendTo( $( "body" ) )
		.css( {
			position: "absolute",
			left: "30px",
			top: "50px",
			width: "400px",
			height: "300px"
		} );
	var rect = $.fracs.rect( $ele );
	var expected  = new Rect( 30, 50, 400, 300 );
	deepEqual( rect, expected, "rect" );
} );


test( "round", function () {
	
	strictEqual( $.fracs.round( 1.234567 ), 1, "round 1.234567 with no precision" );
	strictEqual( $.fracs.round( 1.234567, -1 ), 1, "round 1.234567 to precision -1" );
	strictEqual( $.fracs.round( 1.234567, 0 ), 1, "round 1.234567 to precision 0" );
	strictEqual( $.fracs.round( 1.234567, 1 ), 1.2, "round 1.234567 to precision 1" );
	strictEqual( $.fracs.round( 1.234567, 2 ), 1.23, "round 1.234567 to precision 2" );
	strictEqual( $.fracs.round( 1.234567, 3 ), 1.235, "round 1.234567 to precision 3" );
	strictEqual( $.fracs.round( 1.234567, 4 ), 1.2346, "round 1.234567 to precision 4" );
} );
