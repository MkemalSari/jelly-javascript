/**

Overlay

@description   
	Interface for managing screen overlays
	
@api
	new Overlay([ options ])
	
@examples
	new Overlay({ 
			style: {
				opacity: .2,
				background: '#fff'
			},
			
			// Enable tweening
			tween: true,
			
			// Optional show/hide event handlers
			onShow: function ( self ) {
				self.tween.start({
						opacity: .2,
						duration: 140
					});	
			},
			onHide: function ( self ) {
				self.tween.setOpacity( 0 );
			}
		});
		
*/

(function () {

this['eval']( JELLY.unpack() );

var Class = defineClass( 'Overlay', {

		__init: function ( opts ) {
			opts = opts || {};
			var self = this,
				screen = self.screen = Class.screen.cloneNode( false );
			extend( self, opts );
			if ( opts.style ) {
				setStyle( screen, opts.style );
				delete self.style;
			} 
			if ( opts.tween ) {
				self.tween = new Tween( screen, ( isObject( opts.tween ) ? opts.tween : {} ) );
			} 
		},
		
		show: function () {
			var self = this;
			if ( !self.inserted ) {
				insert( self );
				defer( self.fire, self, 'show' );
			}
		},
		
		hide: function () {
			var self = this;
			if ( self.inserted ) {
				remove( self );
				defer( self.fire, self, 'hide' );
			}
		}
	}),
	
	// Hidden methods 
	
	insert = function ( self ) {
		if ( browser.ie6 ) {
			Class.shim.style.height =
			self.screen.style.height = 
				Math.max( docRoot.scrollHeight, getViewport()[1] ) + 'px';
			// Only insert shim if actually necessary
			if ( getElements( 'select' ).length ) {
				insertElement( Class.shim );
				self.shimmed = true;
			}
		}
		insertElement( self.screen );
		self.inserted = true;
	},
	
	remove = function ( self ) {
		if ( self.shimmed ) {
			removeElement( Class.shim );
			self.shimmed = false;
		}
		removeElement( self.screen );
		self.inserted = false;
	},

	// Automatically create and bind the default elements to the constructor
	
	shim = Class.shim = createElement( 'iframe#jy-overlay-shim frameBorder:0,scrolling:no' ),
	screen = Class.screen = createElement( '#jy-overlay' ),
	css = {
			position: browser.ie6 ? 'absolute' : 'fixed',
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
			background: '#fff',
			opacity: .5 
		};

// Set up default overlay styles

setStyle( screen, css );

css.opacity = 
css.background = 0;
setStyle( shim, css );
	
})();