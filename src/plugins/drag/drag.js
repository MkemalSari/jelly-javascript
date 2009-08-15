/**

Drag

@description 

@api
	var dragger = new Drag( element [, options] );

@examples
	
	var dragger = new Drag( element, {} )
	
	dragger.onDrag = function () { ... }
	
	dragger.onDrop = function () { ... }
	

*/

(function () {

var Class = defineClass( 'Drag', {
		
		__init: function ( el, opts ) {
			opts = opts || {};
			var self = this,
				defaults = {
					el: getElement( el ),
					axis: 'xy',
					offset: { xMin: 0, xMax: 0, yMin: 0, yMax: 0 }
				};
	
			extend( self, extend( defaults, opts ) );
			self.container = getElement( opts.container );
			self.handle = getElement( opts.handle ) || self.el;
			self.bindEvts( self );
		},
		

		bindEvts: function ( self ) {
			
			var el = self.el,
				handle = self.handle,
				containerElement = self.container,
				
				container = {},
				mouseBounds = {},
				pageDelta = {},
				element = {},
						
				mousedown = function ( e ) {
					e.preventDefault();
					
					var pageX = e.pageX,
						pageY = e.pageY,
						coords = getXY( el );
						
					self.handleX = pageX - coords[0]; 
					self.handleY = pageY - coords[1];
					
					switch ( self.axis ) {
						case 'x':
							self.moveX = 1;
							break;
						case 'y':
							self.moveY = 1;
							break;
						default:
							self.moveY = 
							self.moveX = 1;
					}
					
					setViewportBounds( self );
					
					pageDelta = {
						X: pageX,
						Y: pageY
					};
					
					element = {
						T: coords[1],
						R: coords[0] + el.offsetWidth,
						B: coords[1] + el.offsetHeight,
						L: coords[0],
						W: el.offsetWidth,
						H: el.offsetHeight,
						dltX: parseInt( getStyle( el, 'left' ), 10 ) || 0,
						dltY: parseInt( getStyle( el, 'top' ), 10 ) || 0
					};
					
					mouseBounds = viewportBounds;
					
					if ( containerElement ) {
						var isWindow = containerElement === win,
							coords = getXY( containerElement ),
							containerTop = coords[1],
							containerLeft = coords[0],
							containerWidth = containerElement.offsetWidth,
							containerHeight = containerElement.offsetHeight,
							offset = self.offset;
						
						container = {
							T: containerTop,
							R: containerLeft + containerWidth,
							B: containerTop + containerHeight,		
							L: containerLeft,
							W: containerWidth,
							H: containerHeight
						};
						mouseBounds = {
							T: containerTop + offset.yMin,
							R: containerLeft + containerWidth - element.W + offset.xMax,
							B: containerTop + containerHeight - element.H + offset.yMax,
							L: containerLeft + offset.xMin
						};
					} 
					
					self.onDrag = self.onDrag || functionLit;
					if ( !docMouseMove ) { 
						docMouseMove = addEvent( doc, 'mousemove', mousemove );
					}
					if ( !docMouseUp ) { 
						docMouseUp = addEvent( doc, 'mouseup', mouseup );
					}
					self.fireEvent( 'start' );
				},
				
				mousemove = function ( e ) {
					
					stopEvent( e );
					
					var	pageX = e.pageX,
						pageY = e.pageY,
						currentMouseLeft = pageX - self.handleX,
						currentMouseTop = pageY - self.handleY;
	
					if ( containerElement ) {
						if ( self.moveX ) { 
							if ( currentMouseLeft >= mouseBounds.R ) {
								moveX( self, element.dltX + ( container.R - element.R ) );
							}
							else if ( currentMouseLeft <= mouseBounds.L ) {
								moveX( self, element.dltX + ( container.L - element.L ) );
							}
							else {
								moveX( self, element.dltX + ( pageX - pageDelta.X ) );
							}
						}
						if ( self.moveY ) { 
							if ( currentMouseTop >= mouseBounds.B ) {
								moveY( self, element.dltY + ( container.B - element.B ) );
							}
							else if ( currentMouseTop <= mouseBounds.T ) {
								moveY( self, element.dltY + ( container.T - element.T ) );
							}
							else {
								moveY( self, element.dltY + ( pageY - pageDelta.Y ) );
							}
						}
					}
					else {					
						if ( self.moveX ) { 
							moveX( self, element.dltX + ( pageX - pageDelta.X ) );
						}
						if ( self.moveY ) { 
							moveY( self, element.dltY + ( pageY - pageDelta.Y ) );
						}
					}
					self.onDrag.call( self, self );
				},
				
				mouseup = function ( e ) {
					stopEvent( e );
					cancelDrag( self );
					self.fireEvent( 'drop' );
				},
				
				moveX = function ( self, value ) {
					self.el.style.left = value + 'px';
				},
				
				moveY = function ( self, value ) {
					self.el.style.top = value + 'px';
				};
			
			if ( !self.mouseDown ) {
				self.mouseDown = addEvent( handle, 'mousedown', mousedown );
			}
		},
		
		releaseEvts: function ( self ) {
			releaseDocEvts();
			removeEvent( self.mouseDown );
			return self;
		}
	
	}),
	
	releaseDocEvts = function () {
		removeEvent( docMouseMove );
		removeEvent( docMouseUp );
		docMouseMove = 
		docMouseUp = null;	
	},
	
	cancelDrag = function ( self ) {
		releaseDocEvts();
		self.fireEvent( 'cancel' );
	},
	
	// Document event storage 
	docMouseMove,
	docMouseUp,
	
	// Viewport dimension storage
	viewportBounds, 
	setViewportBounds = function ( self ) {
		var tolerance = 0,
			viewport = getViewport();
		viewportBounds = {
			T: tolerance, 
			R: viewport[0] - tolerance, 
			B: viewport[1] - tolerance, 
			L: tolerance
		};
	};
	
})();