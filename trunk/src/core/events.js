/**

Events

@description 
	Event utilities

*/

var addEvent = function ( obj, type, fn ) {
		obj = getElement(obj);
		var mouseEnter = type === 'mouseenter',
			mouseLeave = type === 'mouseleave',
			wrapper, 
			handle;
			
		if ( obj === doc && type === 'domready' ) {
			return addDomReady( fn );
		} 
		if ( !standardEventModel ) {
			wrapper = function ( e ) {
				fn.call( obj, fixEvent( e ) );
			};
		}
		if ( mouseEnter || mouseLeave ) {
			wrapper = function ( e ) {
				e = fixEvent( e );
				if ( !mouseEnterLeave.call( obj, e ) ) { return; }
				fn.call( obj, e );
			};
			type = mouseEnter ? 'mouseover' : 'mouseout';
		}
		handle = [ obj, type, wrapper || fn ];
		eventLog.push( handle );
		if ( standardEventModel ) { 
			obj.addEventListener( type, wrapper || fn, false ); 
		} 
		else { 
			obj.attachEvent( 'on' + type, wrapper ); 
		}
		return handle;
	},
	
	removeEvent = function ( handle ) {
		if ( handle ) { 
			if ( !isArray( handle ) ) {
				return removeDomReady( handle );
			} 
			if ( standardEventModel ) {
				handle[0].removeEventListener( handle[1], handle[2], false ); 
			} 
			else {
				handle[0].detachEvent( 'on' + handle[1], handle[2] ); 
			}
		}
	},
	
	eventLog = [], 
	
	purgeEventLog = function () {
		for ( var i = 0, handle; eventLog[i]; i++ ) {
			handle = eventLog[i];					
			if ( handle[0] !== win && handle[1] !== 'unload' ) {
				removeEvent( handle );
			}
		}
	}, 
	
	fixEvent = function () {
		if ( standardEventModel ) {
			return function (e) { return e; };
		}
		return function (e) {
			e = win.event;
			e.target = e.srcElement;
			e.relatedTarget = function () {
					switch ( e.type ) {
						case 'mouseover': return e.fromElement;
						case 'mouseout': return e.toElement;
					}
				}();
			e.stopPropagation = function () { e.cancelBubble = true; };
			e.preventDefault = function () { e.returnValue = false; };
			e.pageX = e.clientX + docRoot.scrollLeft;
			e.pageY = e.clientY + docRoot.scrollTop;
			return e;
		};		
	}(),
	
	mouseEnterLeave = function (e) { 
		var related, i;
		if ( e.relatedTarget ) {
			try {
				related = e.relatedTarget;
				if ( related.nodeType !== 1 || related === this ) { 
					return false; 
				}
				var children = this.getElementsByTagName('*'), n = children.length, i = 0;
				for ( i; n > i; i++ ) {
					if ( related === children[i] ) { 
						return false; 
					}
				}
			}
			catch ( ex ) {}
		}
		return true;
	},
	
	stopEvent = function (e) {
		e = fixEvent(e);
		e.stopPropagation();
		e.preventDefault();
		return e;
	};
	
extend( J, { 
	addEvent: addEvent,
	removeEvent: removeEvent,
	stopEvent: stopEvent,
	fixEvent: fixEvent
});

// Need to do our own garbage collection to prevent memory leaks
//
addEvent( win, 'unload', purgeEventLog );

