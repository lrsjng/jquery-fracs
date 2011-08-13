/*
 * jQuery.fracs - core
 */

( function( $ ) {


	var Rect = function ( left, top, width, height ) {

		var fracsData = undefined;
		this.left = Math.round( left );
		this.top = Math.round( top );
		this.width = Math.round( width );
		this.height = Math.round( height );
		this.right = this.left + this.width;
		this.bottom = this.top + this.height;

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

		this.envelope = function ( rect ) {

			var left = Math.min( this.left, rect.left );
			var right = Math.max( this.right, rect.right );
			var top = Math.min( this.top, rect.top );
			var bottom = Math.max( this.bottom, rect.bottom );
			var width = right - left;
			var height = bottom - top;
			return new Rect( left, top, width, height );
		};

		this.bind = function ( callback ) {

			if ( fracsData === undefined ) {
				fracsData = new FracsData( this );	
				$( window )
					.bind( "scroll", fracsData.check )
					.bind( "resize", fracsData.check );
			};
			fracsData.bind( callback );
		},

		this.unbind = function ( callback ) {

			if ( fracsData !== undefined ) {
				fracsData.unbind( callback );
				if ( fracsData.callbacks.length === 0 ) {
					$( window )
						.unbind( "scroll", fracsData.check )
						.unbind( "resize", fracsData.check );
					fracsData = undefined;
				};
			};
		};

		this.check = function () {

			if ( fracsData ) {
				fracsData.check();
			};
		};

		this.fracs = function () {

			$.fracs.fracs( this );
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


	var ScrollState = function () {
		
		var document = $.fracs.document();
		var viewport = $.fracs.viewport();
		
		var width = document.width - viewport.width;
		var height = document.height - viewport.height;
		
		this.width = width <= 0 ? undefined : viewport.left / width;
		this.height = height <= 0 ? undefined : viewport.top / height;
		
		this.left = viewport.left;
		this.top = viewport.top;
		this.right = document.right - viewport.right;
		this.bottom = document.bottom - viewport.bottom;
		
		this.equals = function ( that ) {
			
			return this.width === that.width && this.height === that.height
				&& this.left === that.left && this.top === that.top
				&& this.right === that.right && this.bottom === that.bottom;
		};
	};


	var ScrollStateTracker = function () {
		
		this.prevState = new ScrollState();
		this.callbacks = [];
		
		$( window ).bind( "resize scroll load", $.proxy( function () {
			
			var state = new ScrollState();
			if ( !this.prevState.equals( state ) ) {
				$.each( this.callbacks, $.proxy( function ( idx, callback ) {
					callback.call( window, state, this.prevState );					
				}, this ) );
				this.prevState = state;
			};
		}, this ) );
	}
	
	
	var FracsElement = function ( htmlElement, fracs ) {
		
		this.element = htmlElement;
		this.fracs = fracs;
		
		this.update = function () {
			
			var fracs = $.fracs.fracs( this.element );
			var changed = this.fracs === undefined || !this.fracs.equals( fracs );
			this.fracs = fracs;
			return changed;
		};
	};
	

	var FracsData = function ( htmlElementOrRect ) {

		this.target = htmlElementOrRect;
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

		// method uses proxy so it can be easily bound to events
		this.check = $.proxy( function () {

			var rect = this.target instanceof HTMLElement ? $.fracs.rect( this.target ) : this.target;
			var fracs = $.fracs.fracs( rect, $.fracs.viewport() );
			if ( this.prevFracs === undefined || !this.prevFracs.equals( fracs ) ) {
				$.each( this.callbacks, $.proxy( function ( idx, callback ) {
					callback.call( this.target, fracs, this.prevFracs );					
				}, this ) );
				this.prevFracs = fracs;
			};
		}, this );
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

		// method uses proxy so it can be easily bound to events
		this.check = $.proxy( function () {

			var best = undefined;
			var viewport = $.fracs.viewport();

			for ( var idx in this.targets ) {
				var target = this.targets[idx];
				target.update();
				if ( best === undefined || target.fracs[this.property] > best.fracs[this.property] ) {
					best = target;
				};
			};

			if ( best.fracs[this.property] == 0.0 ) {
				best = undefined;
			};
			
			if ( this.prevBest !== best ) {
				this.callback.call( this, best, this.prevBest );					
				this.prevBest = best;
			};
		}, this );
	};



	/*******************************
	 * init and register plugin
	 *******************************/

	$.fracs = function () {

		return $.fracs.fracs.apply( this, arguments );
	};
	$.fracs.internal = {

		dataNs: "fracs",
		methods: {},
		objects: {}
	};
	$.fn.fracs = function( method ) {

		var methods = $.fracs.internal.methods;
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ) );
		} else if ( method === undefined ) {
			return methods.fracs.apply( this, arguments );
		} else if ( method instanceof Function ) {
			return methods.bind.apply( this, arguments );
		} else {
			$.error( "Method " +  method + " does not exist on jQuery.fracs" );
		};
	};



	/*******************************
	 * static methods
	 *******************************/

	$.extend( $.fracs, {

		document: function () {

			var $document = $( document );
			return new Rect( 0, 0, $document.width(), $document.height() );
		},

		viewport: function () {

			var $window = $( window );
			return new Rect( $window.scrollLeft(), $window.scrollTop(), $window.width(), $window.height() );
		},

		rect: function ( htmlElement ) {

			var $target = $( htmlElement );
			var offset = $target.offset();
			return new Rect( offset.left, offset.top, $target.outerWidth(), $target.outerHeight() );
		},
		
		fracs: function ( rect, viewport ) {

			rect = rect instanceof HTMLElement ? $.fracs.rect( rect ) : rect;
			viewport = viewport || $.fracs.viewport();

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
				intersectionArea / rect.area(),
				intersectionArea / viewport.area(),
				intersectionArea / possibleArea
			);
		},

		round: function ( value, decs ) {

			if ( isNaN( decs ) || decs <= 0 ) {
				return Math.round( value );
			};
			return Math.round( value * Math.pow( 10, decs ) ) / Math.pow( 10, decs );
		},

		scrollTo: function ( left, top, duration ) {

			duration = duration !== undefined ? duration : 1000;
			$( "html,body" ).stop( true ).animate( { scrollLeft: left, scrollTop: top }, duration );
		},
		
		scroll: function ( left, top, duration ) {

			duration = duration !== undefined ? duration : 1000;
			var $window = $( window );
			$( "html,body" ).stop( true ).animate( { scrollLeft: $window.scrollLeft() + left, scrollTop: $window.scrollTop() + top }, duration );
		},
		
		scrollState: function ( callback ) {
			
			if ( callback instanceof Function ) {
				scrollStateTracker.callbacks.push( callback );
			} else {
				return new ScrollState();
			};
		}
	} );



	/*******************************
	 * methods
	 *******************************/

	$.extend( $.fracs.internal.methods, {

		bind: function ( callback ) {

			return this.each( function () {
				
				var $this = $( this );
				var data = $this.data( $.fracs.internal.dataNs );
				if ( data === undefined ) {
					data = new FracsData( this );	
					$this.data( $.fracs.internal.dataNs, data );
					$( window ).bind( "scroll resize", data.check );
				};
				data.bind( callback );
			} );
		},

		unbind: function ( callback ) {

			return this.each( function () {
				
				var $this = $( this );
				var data = $this.data( $.fracs.internal.dataNs );
				if ( data !== undefined ) {
					data.unbind( callback );
					if ( data.callbacks.length === 0 ) {
						$this.removeData( $.fracs.internal.dataNs );
						$( window ).unbind( "scroll resize", data.check );
					};
				};
			} );
		},

		check: function () {

			return this.each( function () {
				
				var data = $( this ).data( $.fracs.internal.dataNs );
				if ( data ) {
					data.check();
				};
			} );
		},

		fracs: function () {

			return $.fracs.fracs( $.fracs.rect( this.get( 0 ) ), $.fracs.viewport() );
		},

		rect: function () {

			return $.fracs.rect( this.get( 0 ) );
		},

		max: function ( property, callback ) {

			if ( callback instanceof Function ) {
				var data = new FracsGroup( this, property, callback );
				$( window ).bind( "scroll resize", data.check );
				data.check();
				return this;
			} else {
				var obj = undefined;
				if ( $.inArray( property, [ "possible", "visible", "viewport" ] ) >= 0 ) {
					obj = "fracs";
				} else if ( $.inArray( property, [ "width", "height", "left", "right", "top", "bottom" ] ) >= 0 ) {
					obj = "rect";
				} else {
					return this;
				};

				var elements = [];
				var maxValue = undefined;
				this.each( function () {
					var fracs = $.fracs[obj]( this );
					if ( maxValue === undefined || fracs[property] > maxValue ) {
						elements = [ this ];
						maxValue = fracs[property];
					} else if ( fracs[property] === maxValue ) {
						elements.push( this );
					};
				} );
				return $( elements );
			};
		},

		min: function ( property ) {

			var obj = undefined;
			if ( $.inArray( property, [ "possible", "visible", "viewport" ] ) >= 0 ) {
				obj = "fracs";
			} else if ( $.inArray( property, [ "width", "height", "left", "right", "top", "bottom" ] ) >= 0 ) {
				obj = "rect";
			} else {
				return this;
			};
			
			var elements = [];
			var minValue = undefined;
			this.each( function () {
				var fracs = $.fracs[obj]( this );
				if ( minValue === undefined || fracs[property] < minValue ) {
					elements = [ this ];
					minValue = fracs[property];
				} else if ( fracs[property] === minValue ) {
					elements.push( this );
				};
			} );
			return $( elements );
		},

		envelope: function () {

			var envelope = undefined;
			this.each( function () {
				var rect = $.fracs.rect( this );
				envelope = envelope === undefined ? rect : envelope.envelope( rect );
			} );
			return envelope;
		},

		scrollTo: function ( paddingLeft, paddingTop, duration ) {
			
			paddingLeft = paddingLeft || 0;
			paddingTop = paddingTop || 0;

			var rect = $.fracs.rect( this.get( 0 ) );
			$.fracs.scrollTo( rect.left - paddingLeft, rect.top - paddingTop, duration );
			return this;
		},
		
		softLink: function ( paddingLeft, paddingTop, duration ) {
			
			return this.filter( "a[href^=#]" ).each( function () {

				var $a = $( this );
				var href = $a.attr( "href" );
				$a.click( function () {
					$( href ).fracs( "scrollTo", paddingLeft, paddingTop, duration );
				} );
			} );
		}

	} );


	
	/*******************************
	 * objects
	 *******************************/

	$.extend( $.fracs.internal.objects, {

		Rect: Rect,
		FracsResult: FracsResult,
		ScrollState: ScrollState,
		ScrollStateTracker: ScrollStateTracker,
		FracsElement: FracsElement,
		FracsData: FracsData,
		FracsGroup: FracsGroup
	} );


	var scrollStateTracker = new ScrollStateTracker();

	
} )( jQuery );


