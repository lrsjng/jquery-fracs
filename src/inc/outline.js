/*
 * jQuery.fracs - outline
 */

( function( $ ) {


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
					event.preventDefault();
					this.drag = true;
					this.scroll( event );
					this.$canvas.css( "cursor", "crosshair" ).addClass( "dragOn" );
					this.$htmlBody.css( "cursor", "crosshair" );
					this.$window
						.bind( "mousemove", scrollProxy )
						.one( "mouseup", $.proxy( function ( event ) {
							event.preventDefault();
							this.$canvas.css( "cursor", "pointer" ).removeClass( "dragOn" );
							this.$htmlBody.css( "cursor", "auto" );
							this.$window.unbind( "mousemove", scrollProxy );
							this.drag = false;
							this.draw();
						}, this ) );
				}, this ) );
			canvas.onselectstart = function () {
				return false;
			};
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
	 * static methods
	 *******************************/

	$.extend( $.fracs, {
		
	} );



	/*******************************
	 * methods
	 *******************************/

	$.extend( $.fracs.internal.methods, {

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
	} );
	
	
	
	/*******************************
	 * objects
	 *******************************/

	$.extend( $.fracs.internal.objects, {
		
		Outline: Outline
	} );


} )( jQuery );


