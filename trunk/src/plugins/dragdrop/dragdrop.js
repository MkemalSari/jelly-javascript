/**

DragDrop

@description 

@api
	var dragger = new DragDrop( element [, options] );

@examples
	
	var dragger = new DragDrop( element, {} )
	
	dragger.onDrag = function () { ... }
	
	dragger.onDrop = function () { ... }
	

*/

(function () {

var Class = defineClass( 'DragDrop', {
		
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
				
				data = {},
						
				mousedown = function ( e ) {
					
					e.preventDefault();
					
					var pageX = e.pageX,
						pageY = e.pageY,
						coords = getXY( el );
						
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
					
					var	handle = {
							X: pageX - coords[0],
							Y: pageY - coords[1]
						},
						element = {
							T: coords[1],
							R: coords[0] + el.offsetWidth,
							B: coords[1] + el.offsetHeight,
							L: coords[0],
							W: el.offsetWidth,
							H: el.offsetHeight,
							startX: parseInt( getStyle( el, 'left' ), 10 ) || 0,
							startY: parseInt( getStyle( el, 'top' ), 10 ) || 0
						},
						mouse = {
							startX: pageX,
							startY: pageY,
							bounds: viewportBounds 
						};
						
					data = {
						handle: handle,
						element: element,
						mouse: mouse
					};
			
					if ( containerElement ) {
						var isWindow = containerElement === win,
							coords = getXY( containerElement ),
							containerTop = coords[1],
							containerLeft = coords[0],
							containerWidth = containerElement.offsetWidth,
							containerHeight = containerElement.offsetHeight,
							offset = self.offset,
						
							container = {
								T: containerTop,
								R: containerLeft + containerWidth,
								B: containerTop + containerHeight,		
								L: containerLeft,
								W: containerWidth,
								H: containerHeight
							},
							mouseBounds = {
								T: containerTop + offset.yMin,
								R: containerLeft + containerWidth - element.W + offset.xMax,
								B: containerTop + containerHeight - element.H + offset.yMax,
								L: containerLeft + offset.xMin
							},
							elementBounds = {
								T: element.startY + ( container.T - element.T ),
								R: element.startX + ( container.R - element.R ),
								B: element.startY + ( container.B - element.B ),
								L: element.startX + ( container.L - element.L )
							};
							data.container = container;
							data.mouse.bounds = mouseBounds;
							data.element.bounds = elementBounds;
					} 
					
					self.onDrag = self.onDrag || functionLit;
					
					if ( !docMouseMove ) { 
						docMouseMove = addEvent( doc, 'mousemove', mousemove );
					}
					if ( !docMouseUp ) { 
						docMouseUp = addEvent( doc, 'mouseup', mouseup );
					}
					self.fireEvent( 'start', e, data );
				},
				
				mousemove = function ( e ) {
					
					e.preventDefault();
					
					var	mouse = data.mouse,
						handle = data.handle,
						element = data.element,
						container = data.container,
						pageX = e.pageX,
						pageY = e.pageY,
						currentMouseLeft = pageX - handle.X,
						currentMouseTop = pageY - handle.Y;
	
					if ( containerElement ) {
						if ( self.moveX ) { 
							if ( currentMouseLeft >= mouse.bounds.R ) {
								moveX( self, element.bounds.R );
							}
							else if ( currentMouseLeft <= mouse.bounds.L ) {
								moveX( self, element.bounds.L );
							}
							else {
								moveX( self, element.startX + ( pageX - mouse.startX ) );
							}
						}
						if ( self.moveY ) { 
							if ( currentMouseTop >= mouse.bounds.B ) {
								moveY( self, element.bounds.B );
							}
							else if ( currentMouseTop <= mouse.bounds.T ) {
								moveY( self, element.bounds.T );
							}
							else {
								moveY( self, element.startY + ( pageY - mouse.startY ) );
							}
						}
					}
					else {					
						if ( self.moveX ) { 
							moveX( self, element.startX + ( pageX - mouse.startX ) );
						}
						if ( self.moveY ) { 
							moveY( self, element.startY + ( pageY - mouse.startY ) );
						}
					}
					self.onDrag.call( self, e, data );
				},
				
				mouseup = function ( e ) {
					stopEvent( e );
					cancelDrag( self );
					self.fireEvent( 'drop', e, data );
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