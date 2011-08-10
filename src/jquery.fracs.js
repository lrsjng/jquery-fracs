/*
 * %BUILD_NAME% %BUILD_VERSION%
 * http://larsjung.de/fracs
 * 
 * provided under the terms of the MIT License
 */

( function( $ ) {


	var Rect = function ( left, top, width, height ) {

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


		var fracsData = undefined;

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


	var Outline = function ( canvas, options ) {

		if ( !( canvas instanceof HTMLElement ) || canvas.nodeName.toLowerCase() !== "canvas" ) {
			return undefined;
		};

		var defaults = {
			crop: false,
			duration: 100,
			focusWidth: 0.5,
			focusHeight: 0.5,
			styles: [
				{
					selector: "header,footer,section,article",
					fillStyle: "rgb(230,230,230)"
				},
				{
					selector: "h1",
					fillStyle: "rgb(240,140,060)"
				},
				{
					selector: "h2",
					fillStyle: "rgb(200,100,100)"
				},
				{
					selector: "h3",
					fillStyle: "rgb(100,200,100)"
				},
				{
					selector: "h4",
					fillStyle: "rgb(100,100,200)"
				}
			],
			viewportStyle: {
				fillStyle: "rgba(228,77,38,0.3)"
			},
			viewportDragStyle: {
				fillStyle: "rgba(228,77,38,0.6)"
			},
			invertViewport: false
		};
		this.settings = $.extend( {}, defaults, options );
		
		this.context = canvas.getContext( "2d" );
		this.$canvas = $( canvas );
		this.width = this.$canvas.attr( "width" );
		this.height = this.$canvas.attr( "height" );
		this.$window = $( window );
		this.$htmlBody = $( "html,body" );
		this.docRect;
		this.vpRect;
		this.scale;
		this.drag = false;

		var THIS = this;

		this.init = function () {

			var scrollProxy = $.proxy( this.scroll, this );
			this.$canvas
				.css( "cursor", "pointer" )
				.mousedown( $.proxy( function ( event ) {
					this.drag = true;
					this.scroll( event );
					this.$canvas.css( "cursor", "crosshair" ).addClass( "dragOn" );
					this.$htmlBody.css( "cursor", "crosshair" );
					this.$window
						.bind( "mousemove", scrollProxy )
						.one( "mouseup", $.proxy( function ( event ) {
							this.$canvas.css( "cursor", "pointer" ).removeClass( "dragOn" );
							this.$htmlBody.css( "cursor", "auto" );
							this.$window.unbind( "mousemove", scrollProxy );
							this.drag = false;
							this.draw();
						}, this ) );
					return false;
				}, this ) )
				.attr( "unselectable", "on" )
				.css( "-webkit-user-select", "none" )
				.css( "-khtml-user-select", "none" )
				.css( "-moz-user-select", "none" )
				.css( "-o-user-select", "none" )
				.css( "user-select", "none" )
				.each( function () { 
					this.onselectstart = function () {
						return false;
					};
				} );
			this.$window.bind( "load resize scroll", $.proxy( this.draw, this ) );
			this.draw();
		};
		
		
		this.applyStyles = function ( context ) {
			
			for ( idx in this.settings.styles ) {
				var style = this.settings.styles[idx];
				$( style.selector ).each( function () {
					THIS.drawElement( context, this, style.strokeWidth, style.strokeStyle, style.fillStyle );
				} );
			};
		};


		this.drawElement = function ( context, htmlElement, strokeWidth, strokeStyle, fillStyle ) {

			var $element = $( htmlElement );
			var rect = $element.fracs( "rect" );
			strokeWidth = strokeWidth === "auto" ? $element.css( "border-width" ) : strokeWidth;
			strokeStyle = strokeStyle === "auto" ? $element.css( "border-color" ) : strokeStyle;
			fillStyle = fillStyle === "auto" ? $element.css( "background-color" ) : fillStyle;
			this.drawRect( context, rect, strokeWidth, strokeStyle,	fillStyle );				
		};


		this.drawRect = function ( context, rect, lineWidth, strokeStyle, fillStyle, invert ) {

			invert = invert || false;

			if ( lineWidth !== undefined && this.scale !== undefined ) {
				lineWidth = lineWidth > 0.2 / this.scale ? lineWidth : 0.2 / this.scale;
			};

			if ( strokeStyle !== undefined || fillStyle !== undefined ) {
				if ( invert === false ) {
						context.beginPath();
						context.rect( rect.left, rect.top, rect.width, rect.height );
						if ( fillStyle !== undefined ) {
							context.fillStyle = fillStyle;
							context.fill();
						};
						if ( strokeStyle !== undefined ) {
							context.lineWidth = lineWidth;
							context.strokeStyle = strokeStyle;
							context.stroke();
						};
				} else {
					if ( fillStyle !== undefined ) {
						context.beginPath();
						context.rect( 0, 0, this.docRect.width, rect.top );
						context.rect( 0, rect.top, rect.left, rect.height );
						context.rect( rect.right, rect.top, this.docRect.right - rect.right, rect.height );
						context.rect( 0, rect.bottom, this.docRect.width, this.docRect.bottom - rect.bottom );
						context.fillStyle = fillStyle;
						context.fill();
					};
					if ( strokeStyle !== undefined ) {
						context.beginPath();
						context.rect( rect.left, rect.top, rect.width, rect.height );
						context.lineWidth = lineWidth;
						context.strokeStyle = strokeStyle;
						context.stroke();
					};
				};
			};
		};

		
		this.drawViewport = function () {

			if ( this.drag === true && this.settings.viewportDragStyle !== undefined ) {
				var storkeWidth = this.settings.viewportDragStyle.storkeWidth;
				var strokeStyle = this.settings.viewportDragStyle.strokeStyle;
				var fillStyle = this.settings.viewportDragStyle.fillStyle;
			} else {
				var storkeWidth = this.settings.viewportStyle.storkeWidth;
				var strokeStyle = this.settings.viewportStyle.strokeStyle;
				var fillStyle = this.settings.viewportStyle.fillStyle;
			};
			this.drawRect( this.context, this.vpRect, storkeWidth, strokeStyle, fillStyle, this.settings.invertViewport );
		};


		this.draw = function () {

			this.docRect = $.fracs.document();
			this.vpRect = $.fracs.viewport();
			var scaleX = this.width / this.docRect.width;
			var scaleY = this.height / this.docRect.height;
			this.scale = scaleX < scaleY ? scaleX : scaleY;

			if ( this.settings.crop ) {
				this.$canvas.attr( "width", this.docRect.width * this.scale ).attr( "height", this.docRect.height * this.scale );
			};

			this.context.clearRect( 0, 0, this.$canvas.width(), this.$canvas.height() );

			this.context.scale( this.scale, this.scale );
			//this.drawRect( this.context, this.docRect, 1, "#000" );
			this.applyStyles( this.context );
			this.drawViewport();
			this.context.scale( 1 / this.scale, 1 / this.scale );
		};


		this.scroll = function ( event ) {

			var r = this.$canvas.fracs( "rect" );
			var x = event.pageX - r.left;
			var y = event.pageY - r.top;
			$.fracs.scrollTo( x / this.scale - this.vpRect.width * this.settings.focusWidth, y / this.scale - this.vpRect.height * this.settings.focusHeight, this.settings.duration );
		};


		this.init();
	};




	/*******************************
	 * jQuery.fracs static methods
	 *******************************/

	$.fracs = {

		// just for testing purposes
		internal: {
			
			Rect: Rect,
			FracsResult: FracsResult,
			FracsElement: FracsElement,
			FracsData: FracsData,
			FracsGroup: FracsGroup,
			Outline: Outline
		},

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

			duration = duration !== undefined ? duration : 1000;
			$( "html,body" ).stop( true ).animate( { scrollLeft: left, scrollTop: top }, duration );
		},
		
		scroll: function ( left, top, duration ) {

			duration = duration !== undefined ? duration : 1000;
			var $window = $( window );
			$( "html,body" ).stop( true ).animate( { scrollLeft: $window.scrollLeft() + left, scrollTop: $window.scrollTop() + top }, duration );
		},
		
		scrollState: function () {
			
			var document = $.fracs.document();
			var viewport = $.fracs.viewport();
			
			var width = document.width - viewport.width;
			var height = document.height - viewport.height;
			
			return {
				right: width <= 0 ? undefined : viewport.left / width,
				bottom: height <= 0 ? undefined : viewport.top / height
			};
		}

	};




	/*******************************
	 * jQuery.fracs methods
	 *******************************/

	var NAMESPACE = "fracs";

	var methods = {

		bind: function ( callback ) {

			return this.each( function () {
				
				var $this = $( this );
				var data = $this.data( NAMESPACE );
				if ( data === undefined ) {
					data = new FracsData( this );	
					$this.data( NAMESPACE, data );
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
				var data = $this.data( NAMESPACE );
				if ( data !== undefined ) {
					data.unbind( callback );
					if ( data.callbacks.length === 0 ) {
						$this.removeData( NAMESPACE );
						$( window )
							.unbind( "scroll", data.check )
							.unbind( "resize", data.check );
					};
				};
			} );
		},

		check: function () {

			return this.each( function () {
				
				var data = $( this ).data( NAMESPACE );
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
				$( window )
					.bind( "scroll", data.check )
					.bind( "resize", data.check );
				data.check();
				return this;
			} else {
				if ( $.inArray( property, [ "possible", "visible", "viewport" ] ) >= 0 ) {
					var elements = [];
					var maxValue = undefined;
					this.each( function () {
						var fracs = $.fracs.fracs( this );
						if ( maxValue === undefined || fracs[property] > maxValue ) {
							elements = [ this ];
							maxValue = fracs[property];
						} else if ( fracs[property] === maxValue ) {
							elements.push( this );
						};
					} );
					return $( elements );
				};
				if ( $.inArray( property, [ "width", "height", "left", "right", "top", "bottom" ] ) >= 0 ) {
					var elements = [];
					var maxValue = undefined;
					this.each( function () {
						var rect = $.fracs.rect( this );
						if ( maxValue === undefined || rect[property] > maxValue ) {
							elements = [ this ];
							maxValue = rect[property];
						} else if ( rect[property] === maxValue ) {
							elements.push( this );
						};
					} );
					return $( elements );
				};
				return this;
			};
		},

		min: function ( property ) {

			if ( $.inArray( property, [ "possible", "visible", "viewport" ] ) >= 0 ) {
				var elements = [];
				var minValue = undefined;
				this.each( function () {
					var fracs = $.fracs.fracs( this );
					if ( minValue === undefined || fracs[property] < minValue ) {
						elements = [ this ];
						minValue = fracs[property];
					} else if ( fracs[property] === minValue ) {
						elements.push( this );
					};
				} );
				return $( elements );
			};
			if ( $.inArray( property, [ "width", "height", "left", "right", "top", "bottom" ] ) >= 0 ) {
				var elements = [];
				var minValue = undefined;
				this.each( function () {
					var rect = $.fracs.rect( this );
					if ( minValue === undefined || rect[property] < minValue ) {
						elements = [ this ];
						minValue = rect[property];
					} else if ( rect[property] === minValue ) {
						elements.push( this );
					};
				} );
				return $( elements );
			};
			return this;
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
		},

		outline: function ( options ) {

			return this.each( function () {

				if ( options === 'redraw' ) {
					var outline = $( this ).data( "outline" );
					if ( outline !== undefined ) {
						outline.draw();
					};					
				} else {
					var outline = new Outline( this, options );
					if ( outline !== undefined ) {
						$( this ).data( "outline", outline );
					};
				};
			} );
		}

	};


	$.fn.fracs = function( method ) {

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


} )( jQuery );


