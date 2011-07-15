/*
 * %BUILD_NAME% %BUILD_VERSION%
 * http://larsjung.de/fracs
 * 
 * provided under the terms of the CC BY-SA 3.0 License
 * http://creativecommons.org/licenses/by-sa/3.0/
 */

( function( $ ) {

	var Rect = function ( left, top, width, height ) {

		this.left = Math.round( left );
		this.top = Math.round( top );
		this.width = Math.round( width );
		this.height = Math.round( height );
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


	var FracsResult = function ( rectDocument, rectElement, rectViewport, visible, viewport, possible ) {

		this.rects = rectDocument === undefined ? undefined : {
			document: rectDocument,
			element: rectElement,
			viewport: rectViewport
		};
		this.visible = visible || 0.0;
		this.viewport = viewport || 0.0;
		this.possible = possible || 0.0;

		this.equals = function ( that ) {
			
			return this.fracsEqual( that ) && this.rectsEqual( that );
		};

		this.fracsEqual = function ( that ) {
			
			return this.visible === that.visible && this.viewport === that.viewport && this.possible === that.possible;
		};

		this.rectsEqual = function ( that ) {
			
			if ( this.rects === undefined || that.rects === undefined ) {
				return this.rects === that.rects;
			};
			return this.rects.document.equals( that.rects.document )
				&& this.rects.element.equals( that.rects.element )
				&& this.rects.viewport.equals( that.rects.viewport );
		};
	};

	
	var FracsElement = function ( htmlElement, fracs ) {
		
		this.element = htmlElement;
		this.fracs = fracs;
		
		this.update = function () {
			
			var fracs = globals.fracs( this.element );
			var changed = this.fracs === undefined || !this.fracs.equals( fracs );
			this.fracs = fracs;
			return changed;
		};
	};
	

	var FracsData = function ( htmlElement ) {

		this.target = htmlElement;
		this.callbacks = [];
		this.prevFracs = undefined;

		this.bind = function ( callback ) {

			if ( callback !== undefined && $.inArray( callback, this.callbacks ) === -1 ) {
				this.callbacks.push( callback );
			};
		};

		this.unbind = function ( callback ) {

			if ( callback === undefined ) {
				this.callbacks = [];
			} else {
				var idx = $.inArray( callback, this.callbacks );
				if ( idx >= 0 ) {
					this.callbacks.splice( idx, 1 );
				};
			};
		};

		var THIS = this; // so method can be easily bound to events
		this.check = function () {

			var fracs = globals.fracs( globals.rect( THIS.target ), globals.viewport() );
			if ( THIS.prevFracs === undefined || !THIS.prevFracs.equals( fracs ) ) {
				$.each( THIS.callbacks, function ( idx, callback ) {
					callback.call( THIS.target, fracs, THIS.prevFracs );					
				} );
				THIS.prevFracs = fracs;
			};
		};
	};


	var FracsGroup = function ( targets, property, callback ) {

		this.targets = [];
		this.callback = callback;
		this.prevBest = undefined;
		this.property = property;

		for ( var idx in targets ) {
			var target = targets[idx];
			if ( target instanceof HTMLElement ) {
				this.targets.push( new FracsElement( target ) );
			};
		};

		var THIS = this; // so method can be easily bound to events
		this.check = function () {

			var best = undefined;
			var viewport = globals.viewport();

			for ( var idx in THIS.targets ) {
				var target = THIS.targets[idx];
				target.update();
				if ( best === undefined || target.fracs[ THIS.property ] > best.fracs[ THIS.property ] ) {
					best = target;
				};
			};

			if ( best.fracs[ THIS.property ] == 0.0 ) {
				best = undefined;
			};
			
			if ( THIS.prevBest !== best ) {
				THIS.callback.call( THIS, best, THIS.prevBest );					
				THIS.prevBest = best;
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

			rect = rect instanceof HTMLElement ? globals.rect( rect ) : rect;
			viewport = viewport || globals.viewport();

			var intersection = rect.intersection( viewport );

			if ( intersection === undefined ) {
				return new FracsResult();
			};

			var intersectionElementSpace = new Rect( intersection.left - rect.left, intersection.top - rect.top, intersection.width, intersection.height );
			var intersectionViewportSpace = new Rect( intersection.left - viewport.left, intersection.top - viewport.top, intersection.width, intersection.height );
			var intersectionArea = intersection.area();
			var possibleArea = Math.min( rect.width, viewport.width ) * Math.min( rect.height, viewport.height );

			return new FracsResult(
				intersection,
				intersectionElementSpace,
				intersectionViewportSpace,
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
		},

		scrollTo: function ( left, top, duration ) {

			duration = duration || 1000;
			$( "html,body" ).stop( true ).animate( { scrollLeft: left, scrollTop: top }, duration );
		}

	};


	var methods = {

		bind: function ( callback ) {

			return this.each( function () {
				
				var $this = $( this );
				var data = $this.data( namespace );
				if ( data === undefined ) {
					data = new FracsData( this );	
					$this.data( namespace, data );
					$( window )
						.bind( "scroll", data.check )
						.bind( "resize", data.check );
				};
				data.bind( callback );
			} );
		},

		unbind: function ( callback ) {

			return this.each( function () {
				
				var $this = $( this );
				var data = $this.data( namespace );
				if ( data !== undefined ) {
					data.unbind( callback );
					if ( data.callbacks.length === 0 ) {
						$this.removeData( namespace );
						$( window )
							.unbind( "scroll", data.check )
							.unbind( "resize", data.check );
					};
				};
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
		},

		max: function ( property, callback ) {

			var data = new FracsGroup( this, property, callback );
			$( window )
				.bind( "scroll", data.check )
				.bind( "resize", data.check );
			data.check();
			return this;
		},

		scrollTo: function ( paddingLeft, paddingTop, duration ) {
			
			paddingLeft = paddingLeft || 0;
			paddingTop = paddingTop || 0;

			var rect = globals.rect( this.get( 0 ) );
			globals.scrollTo( rect.left - paddingLeft, rect.top - paddingTop, duration );
			return this;
		}

	};


	$[namespace] = globals;
	$.fn[namespace] = function( method ) {

		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ) );
		} else if ( method === undefined ) {
			return methods.fracs.apply( this, arguments );
		} else if ( method instanceof Function ) {
			return methods.bind.apply( this, arguments );
		} else {
			$.error( "Method " +  method + " does not exist on jQuery." + namespace );
		};
	};


} )( jQuery );