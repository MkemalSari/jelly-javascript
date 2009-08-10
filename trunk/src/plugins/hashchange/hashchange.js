/**

HashChange

@description   
	An 'onhashchange' event handler 
	
@dependencies   
	Poll

@api
	** (Mixed) handle **  HashChange.subscribe( (Function) callback [, (String) reference] )
	** void **  HashChange.unsubscribe( (Mixed) handle )
	
@examples
	var handle = HashChange.subscribe( function ( newHash ) { ... } );
	HashChange.unsubscribe( handle );

*/

(function () {

var self = J.HashChange = {

	handlers: {},
	
	href: location.href,
	
	loop: function () {
		var href = location.href;
		if ( href !== self.href ) { 
			var hashIndex = href.indexOf( '#' ), 
				hash = hashIndex > -1 ? href.substr( hashIndex + 1 ) : '';
			for ( var key in self.handlers ) {
				try {
					self.handlers[key].call( {}, hash );
				} catch ( ex ) {
					logError( ex );
				}
			}
			self.href = href;
		}
	},
	
	start: function () {
		if ( !self.poller ) {
			self.poller = Poll.subscribe( 'fast', self.loop );
		}
	},
	
	stop: function () {
		if ( self.poller ) {
			Poll.unsubscribe( 'fast', self.poller );
			self.poller = null;
		}
	},
	
	subscribe: function ( fn, ref ) {
		var self = this, handlerId;
		self.uid = self.uid || 0;
		handlerId = ref || ++self.uid;
		if ( self.handlers[handlerId] ) {
			return false;
		}
		self.handlers[handlerId] = fn;
		if ( !self.poller ) {
			self.start();
		}
		return handlerId;
	},
	
	unSubscribe: function ( handlerId ) {
		var self = this;
		delete self.handlers[handlerId];
		if ( empty( self.handlers ) ) {
			self.stop();
		}
	}	

};
	
})();