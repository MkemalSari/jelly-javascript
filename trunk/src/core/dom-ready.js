/**

Cross browser DOMContentLoaded event 

@static
@class JELLY.DomReady

*/
(function () {
  
	var self = J.DomReady = {
	
			ready: false,
			
			handlers: {},
			
			/**
			 Add a DomReady event handler
			 @param {function} callback
			 @return {uid} handle
			 */
			add: function ( callback ) {
				var ref = ++uid;
				self.handlers[ref] = callback;
				return ref;
			},
			
			/**
			 Remove a DomReady event handler
			 @param {uid} handle
			 */
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
	if ( isFunction( docRoot.addEventListener ) ) {
		addEvent( doc, 'DOMContentLoaded', self.fire );
	} 
	else {
		doc.attachEvent( 'onreadystatechange', checkReadyState );
		if ( win === top ) {
			pollTimer = setTimeout( scrollPoller, 0 );
		}
	}

	// Fallback catch all
	addEvent( win, 'load', self.fire );
	
})();

var DomReady = J.DomReady;

