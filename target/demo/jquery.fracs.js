( function( $ ) {


	var Rect = function ( left, top, width, height ) {

		this.left = left;
		this.top = top;
		this.width = width;
		this.height = height;
		this.right = left + width;
		this.bottom = top + height;

		this.equals = function ( that ) {
			
			return this.left === that.left && this.top === that.top && this.width === that.width && this.height === that.height;
		};
		
		this.area = function () {

			return this.width * this.height;
		};

		this.intersection = function ( rect ) {

			var left = Math.max( this.left, rect.left );
			var right = Math.min( this.right, rect.right );
			var top = Math.max( this.top, rect.top );
			var bottom = Math.min( this.bottom, rect.bottom );
			var width = right - left;
			var height = bottom - top;
			if ( width < 0 || height < 0 ) {
				return undefined;
			};
			return new Rect( left, top, width, height );
		};
	};
	

	var FracsResult = function ( rect, rectRelative, visible, viewport, possible ) {

		this.rect = rect;
		this.rectRelative = rectRelative;
		this.visible = visible;
		this.viewport = viewport;
		this.possible = possible;
		
		this.equals = function ( that ) {
			
			return this.fracsEqual( that ) && this.rectsEqual( that );
		};

		this.fracsEqual = function ( that ) {
			
			return this.visible === that.visible && this.viewport === that.viewport && this.possible === that.possible;
		};

		this.rectsEqual = function ( that ) {
			
			if ( this.rect === undefined && that.rect === undefined ) {
				return true;
			} else if ( this.rect === undefined || that.rect === undefined ) {
				return false;
			};
			return this.rect.equals( that.rect ) && this.rectRelative.equals( that.rectRelative );
		};
	};


	var FracsData = function ( htmlElement, callback ) {

		this.target = htmlElement;
		this.callback = callback;
		this.prevFracs = undefined;

		var THIS = this; // so methods can be bound and unbound
		this.check = function () {

			var fracs = globals.fracs( globals.rect( THIS.target ), globals.viewport() );
			if ( THIS.prevFracs === undefined || !THIS.prevFracs.equals( fracs ) ) {
				THIS.callback.call( THIS.target, fracs, THIS.prevFracs );
				THIS.prevFracs = fracs;
			};
		};
	};


	var namespace = "fracs";


	var globals = {

		viewport: function () {

			var $window = $( window );

			return new Rect(
				$window.scrollLeft(),
				$window.scrollTop(),
				$window.width(),
				$window.height()
			);
		},

		rect: function ( htmlElement ) {

			var $target = $( htmlElement );
			var offset = $target.offset();

			return new Rect(
				offset.left,
				offset.top,
				$target.outerWidth(),
				$target.outerHeight() 
			);
		},
		
		fracs: function ( rect, viewport ) {

			var intersection = rect.intersection( viewport );

			if ( intersection === undefined ) {
				return new FracsResult( undefined, undefined, 0.0, 0.0, 0.0 );
			};

			var intersectionRelative = new Rect( intersection.left - rect.left, intersection.top - rect.top, intersection.width, intersection.height );
			var intersectionArea = intersection.area();
			var possibleArea = Math.min( rect.width, viewport.width ) * Math.min( rect.height, viewport.height );

			return new FracsResult(
				intersection,
				intersectionRelative,
				1.0 * intersectionArea / rect.area(),
				1.0 * intersectionArea / viewport.area(),
				1.0 * intersectionArea / possibleArea
			);
		},

		round: function ( value, decs ) {

			if ( isNaN( decs ) || decs <= 0 ) {
				return Math.round( value );
			};
			return Math.round( value * Math.pow( 10, decs ) ) / Math.pow( 10, decs );
		}

	};


	var methods = {

		init: function ( callback ) {

			return this.each( function () {
				
				var data = new FracsData( this, callback );
				$( this ).data( namespace, data );
				$( window )
					.bind( "scroll", data.check )
					.bind( "resize", data.check );
				data.check();
			} );
		},

		destroy: function () {

			return this.each( function () {
				
				var $this = $( this );
				var data = $this.data( namespace );
				$this.removeData( namespace );
				$( window )
					.unbind( "scroll", data.check )
					.unbind( "resize", data.check );
			} );
		},

		check: function () {

			return this.each( function () {
				
				var data = $( this ).data( namespace );
				if ( data ) {
					data.check();
				};
			} );
		},

		fracs: function () {

			return globals.fracs( globals.rect( this.get( 0 ) ), globals.viewport() );
		},

		rect: function () {

			return globals.rect( this.get( 0 ) );
		}

	};


	$[namespace] = globals;
	$.fn[namespace] = function( method ) {

		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ) );
		} else if ( method === undefined ) {
			return methods.fracs.apply( this, arguments );
		} else if ( method instanceof Function ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( "Method " +  method + " does not exist on jQuery." + namespace );
		};
	};


} )( jQuery );