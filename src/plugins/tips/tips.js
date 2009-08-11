/**

Tips

@description 
	Enhanced tooltip effect -- by default behaves like a normal tooltip, 
	but with many options for customisation

@api
	** obj ** new Tips( (String) css-selector [, options] );
	
@examples
	var tips = new Tips( '[title]', {

			pause: 200,
			linebreak: false,
			
			// Flag with truthy value to enable fading, pass in object to customize fade tween
			fade: { duration: 200 },
	
			// Load in css if needed
			css: 'tips.css',
						
			// Customize the positioning behaviour
			position: function ( el, tip, evtObj, viewport ) { ... },
			
			// More complex, or custom, tip element
			tip: createBranch( '.jy-tip' ),
			
			// Customize the update text behaviour
			onUpdate: function ( self, title ) { ... },
			
			onShow: function () { ... },
			onHide: function () { ... }
		});

	// Update post ajax, or other reflow
	tips.refresh();
	tips.refresh( '[title]' );
	
*/

(function () {

var Class = defineClass( 'Tips', {
		
	__init: function ( selector, opts ) {
		
		opts = extend( opts || {} );
		
		var self = this;
		extend( self, opts || {} );
		extend( self, {
				selector: selector,
				els: Q( selector ),
				tip: self.tip || Class.tip
			});
			
		// load css if required
		if ( opts.css ) {
			Class.assets[opts.css] = Load.css( opts.css );
		}
		// load imgs if required
		if ( opts.img ) {
			( isArray( opts.img ) ? opts.img : [opts.img] ).each( function ( img ) {
				Class.assets[img] = Load.img( img );
			});
		}
		
		if ( opts.fade ) {
			var fadeOpts = extend( { duration: 200 }, ( isObject( opts.fade ) ? opts.fade : {} ) );
			self.tween = new Tween( self.tip, fadeOpts );
		}
		if ( opts.linebreak === false ) {
			self.tip.style.whiteSpace = 'pre';
		}
		self.bindEvts();
	},
	
	__static: {
		assets: {},	
		tip: createElement( '.jy-tip' ),
		pause: 300
	},
	
	show: function ( e, el, clientXY ) {
		
		var self = this,
			currentElement = el,
			tip = self.tip;

		// If we're on the same element as last time take an early exit
		if ( self.el && self.el === currentElement ) {
			return;
		}
		self.el = currentElement;
		
		if ( self.fade ) {
			self.tween.stop().setOpacity(1);
		}
		self.insert();
		self.fireEvent( 'update', self, retrieveData( el, 'titleHTML' ) );
		self.fireEvent( 'show' );

		if ( self.maxWidth && tip.offsetWidth > self.maxWidth ) {
			self.setWidth( self.maxWidth );
		}
		self.position( el, self.tip, e, getViewport() );
	},

	position: function ( el, tip, e, viewport ) {
		var tipWidth = tip.offsetWidth,
			x = e.pageX,
			y = e.pageY + 24;
		if ( ( e.clientX + tipWidth ) > ( viewport[0] - 15 ) ) {
			x = e.pageX - tipWidth;
		}
		setXY( tip, x, y );	
	},
	
	hide: function ( el ) {
		var self = this;
		if ( !self.inserted ) { 
			return; 
		}
		if ( self.fade ) {
			self.tween.start( 'opacity', 0 ).onComplete = function ( tween ) {
				tween.setOpacity(1);
				self.remove();
			};
		}
		else {
			self.remove();
		}
		self.fireEvent( 'hide' );		
	},
	
	insert: function () {
		var self = this, 
			style = self.tip.style;
		if ( self.inserted ) { 
			return; 
		}
		style.left = style.top = '';
		insertElement( self.tip );
		self.inserted = true;
	},
	
	remove: function () {
		var self = this;
		if ( !self.inserted ) { 
			return; 
		}
		removeElement( self.tip );
		self.setWidth( '' );
		self.inserted = false;
		self.el = null;
	},
	
	setWidth: function ( value ) {
		var style = this.tip.style;
		if ( browser.ie ) {
			style.width = value;
		}
		else {
			style.maxWidth = value;
		}
	},
	
	refresh: function ( selector ) {
		var self = this;
		self.els = Q( selector || self.selector ); 
		self.evts.each( removeEvent );
		self.bindEvts();
	},
	
	onUpdate: function ( self, title ) {
		self.tip.innerHTML = title;
	},
	
	// current element
	el: null,
	
	inserted: false,
	evts: [],
	
	bindEvts: function () {
		var self = this,
			mousemove = function ( e ) {
				clearTimeout( self.timer );
				var el = this;
				// IE workaround: 
				//    In IE the event object goes stale, so we store 
				//    the most useful positional properties on to a new event(ish) object
				e = {
					clientX: e.clientX,
					clientY: e.clientY,
					pageX: e.pageX,
					pageY: e.pageY
					};
				self.timer = setTimeout( function () {
						self.show( e, el );
					}, self.pause || Class.pause );
			},
			mouseenter = function () {
				this.setAttribute( 'title', '' );
			},
			mouseleave = function () {
				this.setAttribute( 'title', retrieveData( this, 'title' ) );
				clearTimeout( self.timer );
				self.hide( this );
			}, 
			evts = self.evts;
			
		self.els.each( function ( el ) {
			storeData( el, 'title', el.title );
			storeData( el, 'titleHTML', el.title.
					replace(/_([^_]+)_/g, '<em>$1</em>').
					replace(/\*([^\*]+)\*/g, '<strong>$1</strong>')				
				);
			evts.push( addEvent( el, 'mousemove', mousemove ) );
			evts.push( addEvent( el, 'mouseenter', mouseenter ) );
			evts.push( addEvent( el, 'mouseleave', mouseleave ) );
		});
		
	}
	
});

})();



