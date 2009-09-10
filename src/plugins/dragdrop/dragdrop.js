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

if ( typeof __JELLY__ === 'undefined' ) { window['eval']( JELLY.unpack() ); }

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
			
			if ( opts.droppables ) {
				self.droppables = isString( opts.droppables ) ? Q( opts.droppables ) : opts.droppables;
			}
			self.container = getElement( opts.container );
			
			self.handle = getElement( opts.handle ) || self.el;
			self.bindEvts( self );
		},
		

		bindEvts: function ( self ) {
			
			var el = self.el,
				handle = self.handle,
				
				containerElement = self.container,
				droppableElements = self.droppables,
				
				data = {},
										
				mousedown = function ( e ) {
					
					e.preventDefault();
					setWindowBounds( self );
					
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
					
					var	element = {
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
							bounds: windowBounds 
						};
						
					data = {
						handleX: pageX - coords[0],
						handleY: pageY - coords[1],
						element: element,
						mouse: mouse
					};
			
					if ( containerElement ) {
						var isWindow = containerElement === win,
							coords = isWindow ? windowBounds : getXY( containerElement ),
							containerTop = isWindow ? coords.T : coords[1],
							containerLeft = isWindow ? coords.L : coords[0],
							containerWidth = isWindow ? coords.R : containerElement.offsetWidth,
							containerHeight = isWindow ? coords.B : containerElement.offsetHeight,
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
								T: element.startY + ( container.T - element.T ) + offset.yMin,
								R: element.startX + ( container.R - element.R ) + offset.xMax,
								B: element.startY + ( container.B - element.B ) + offset.yMax,
								L: element.startX + ( container.L - element.L ) + offset.xMin
							};
							data.container = container;
							data.mouse.bounds = mouseBounds;
							data.element.bounds = elementBounds;
					} 
					
					if ( droppableElements ) {
						data.dropZones = droppableElements.map( function ( el ) {
							var coords = getXY( el );
							return {
									el: el,
									T: coords[1],
									R: coords[0] + el.offsetWidth,
									B: coords[1] + el.offsetHeight,
									L: coords[0]
								};
						});
					}
					
					self.onDrag = self.onDrag || functionLit;
					
					if ( !docMouseMove ) { 
						docMouseMove = addEvent( doc, 'mousemove', mousemove );
					}
					if ( !docMouseUp ) { 
						docMouseUp = addEvent( doc, 'mouseup', mouseup );
					}
					self.fire( 'start', e, data );
				},
				
				mousemove = function ( e ) {
					
					e.preventDefault();
					
					if ( self.onDrag.call( self, e, data ) === false ) {
						return;
					}
					
					var	mouse = data.mouse,
						handle = data.handle,
						element = data.element,
						container = data.container,
						pageX = e.pageX,
						pageY = e.pageY,
						currentMouseLeft = pageX - data.handleX,
						currentMouseTop = pageY - data.handleY;

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
					
					if ( droppableElements ) {
						var currentDropZoneEntered = null,
							dropZones = data.dropZones,
							n = dropZones.length,
							i = 0;
							
						for ( i; i < n; i++ ) {
							var droppable = dropZones[i],
								inZone = 
									pageX > droppable.L && 
									pageX < droppable.R && 
									pageY > droppable.T && 
									pageY < droppable.B;
							
							if ( inZone ) {
								currentDropZoneEntered = true;
								if ( droppable !== self.dropZone ) {
									self.fire( 'enter', e, droppable.el );
									if ( self.dropZone ) {
										self.fire( 'leave', e, self.dropZone.el );
									} 
									self.dropZone = droppable;
								}
								break;
							} 
						}
						if ( self.dropZone && !currentDropZoneEntered ) {
							self.fire( 'leave', e, self.dropZone.el );
							self.dropZone = null;
						}
					}

				},
				
				mouseup = function ( e ) {
					stopEvent( e );
					cancelDrag( self );
					self.fire( 'drop', e, data );
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
		self.fire( 'cancel' );
	},
	
	// Document event storage 
	docMouseMove,
	docMouseUp,
	
	windowBounds, 
	setWindowBounds = function ( self ) {
		var viewport = getViewport(),
			winScroll = getWindowScroll();
		windowBounds = {
			T: 0, 
			R: viewport[0], 
			B: viewport[1] + winScroll[1], 
			L: 0
		};
	};
	
})();