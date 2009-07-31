/**

Dom ready

@description 
	Cross browser interface for the DOMContentLoaded event 

*/

(function () {
  
	var self = J.DomReady = {
	
			ready: false,
			
			handlers: {},
			
			add: function ( callback, ref ) {
				var ref = ref || ++uid;
				self.handlers[ref] = callback;
				return ref;
			},
			
			remove: function ( ref ) {
				delete self.handlers[ ref ];
			},
			
			fire: function () {
				if ( self.ready ) { return; }
				self.ready = true;
				clearTimeout( pollTimer );
				for ( var handler in self.handlers ) {
					try { 
						self.handlers[ handler ](); 
					}
					catch (ex) { 
						logError(ex); 
					}
				} 
			}
		},
		
		uid = 0,
		pollTimer,
	
		checkReadyState = function () {
			if ( doc.readyState === 'complete' ) {
				doc.detachEvent( 'onreadystatechange', checkReadyState );
				self.fire();
			}
		}, 
		
		scrollPoller = function () {
			try { 
				docRoot.doScroll( 'left' ); 
			}
			catch (e) {
				pollTimer = setTimeout( scrollPoller, 10 );
				return;
			}
			self.fire();
		};
	
	//	The easy way and the convoluted way 
	//
	if ( standardEventModel ) {
		addEvent( doc, 'DOMContentLoaded', self.fire );
	} 
	else {
		doc.attachEvent( 'onreadystatechange', checkReadyState );
		if ( win === top ) {
			pollTimer = setTimeout( scrollPoller, 0 );
		}
	}

	// Fallback catch all
	//
	addEvent( win, 'load', self.fire );
	
})();

var DomReady = J.DomReady,
	addDomReady = function ( callback, ref ) {
		return DomReady.add( callback, ref || null );
	},
	removeDomReady = function ( ref ) {
		DomReady.remove( ref );
	};

extend( J, {
	addDomReady: addDomReady,
	removeDomReady: removeDomReady
});
