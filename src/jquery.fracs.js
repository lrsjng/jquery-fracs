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
	

	var FracsResult = function ( rect, visible, viewport, possible ) {

		this.rect = rect;
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
			
			return this.rect.equals( that.rect );
		};
	};


	var FracsData = function ( htmlElement, callback ) {

		this.target = htmlElement;
		this.callback = callback;
		this.prevFracs = undefined;

		this.rect = function () {

			return globals.rect( this.target );
		};

		this.fracs = function () {

			return globals.fracs( globals.rect( this.target ), globals.viewport() );
		};

		this.check = function () {

			var fracs = this.fracs();
			if ( this.prevFracs === undefined || !this.prevFracs.fracsEqual( fracs ) ) {
				this.callback.call( this.target, fracs, this.prevFracs );
				this.prevFracs = fracs;
			};
		};

		this.checkProxy = $.proxy( this.check, this );
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
				return new FracsResult( undefined, 0.0, 0.0, 0.0 );
			};

			var intersectionArea = intersection.area();
			var possibleArea = Math.min( rect.width, viewport.width ) * Math.min( rect.height, viewport.height );

			return new FracsResult(
				intersection,
				1.0 * intersectionArea / rect.area(),
				1.0 * intersectionArea / viewport.area(),
				1.0 * intersectionArea / possibleArea
			);
		},

		round: function ( value, decs ) {
		
			decs = decs || 3;
			return Math.round( value * Math.pow( 10, decs ) ) / Math.pow( 10, decs );
		}

	};


	var methods = {

		init: function ( callback ) {

			return this.each( function () {
				
				var data = new FracsData( this, callback );
				$( this ).data( namespace, data );
				$( window )
					.bind( "scroll", data.checkProxy )
					.bind( "resize", data.checkProxy );
				data.check();
			} );
		},

		destroy: function () {

			return this.each( function () {
				
				var $this = $( this );
				var data = $this.data( namespace );
				$this.removeData( namespace );
				$( window )
					.unbind( "scroll", data.checkProxy )
					.unbind( "resize", data.checkProxy );
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

		current: function () {

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
		} else if ( !method ) {
			return methods.current.apply( this, arguments );
		} else if ( method instanceof Function ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( "Method " +  method + " does not exist on jQuery." + namespace );
		};
	};


} )( jQuery );