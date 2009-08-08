/**

Poller

@description   
	Class for creating polling objects that can manage multiple subscribed callbacks

@api
	>> Instance mode
	var obj = new Poller( (Integer) milliseconds )
	** (Mixed) handle **  obj.subscribe( (Function) callback [, (String) handle] )
	** void **  obj.unSubscribe( (Mixed) handle )
	
	>> Static mode
	** (Mixed) handle **  Poller.subscribe( (Integer|String) time/term , (Function) callback [, (String) handle] )
	** void **  Poller.unSubscribe( (Integer|String) time/term , (Mixed) handle )
	
@examples
	// Create a new polling object
	var poller = new Poller( 200 );
	
	var handle = poller.subscribe( function () { ... } );
	poller.unSubscribe( handle );
	
	poller.subscribe( function () { ... }, 'myref' );
	poller.unSubscribe( 'myref' );
	
	
	// Subscribe to a global polling object
	var handle = Poller.subscribe( 100, function () { ... } );
	Poller.unSubscribe( 100, handle );
	
	var handle = Poller.subscribe( 'fast', function () { ... } );
	Poller.unSubscribe( 'fast', handle );

*/

(function () {

var Class = defineClass( 'Poller', {
		
		__static: {
			
			pollTime: 300,
			cache: {},
			
			subscribe: function ( key, fn, ref ) {
				var keyStr = key+'', speed;
				if ( !( keyStr in Class.cache ) ) {
					speed = isString( key ) ? Class.keyterms[key] : key;
					Class.cache[keyStr] = new Poller( speed );
				}
				return Class.cache[keyStr].subscribe( fn, ref || null );
			},
			
			unSubscribe: function ( key, handlerId ) {
				Class.cache[key].unsubscribe( handlerId );
			},

			keyterms: {
				'vslow': 1000,
				'slow': 500,
				'fast': 100,
				'vfast': 50
			}
		},
		
		__init: function ( pollTime ) {
			extend( this, {
				uid: 0,
				handlers: {},
				pollTime: pollTime || Class.pollTime
			});
		},
		
		setPollTime: function ( ms ) {
			this.pollTime = ms;
			return this;
		},
		
		start: function () {
			var self = this;
			clearTimeout( self.timerHandle );
			clearTimeout( self.firstPoll );
			self.firstPoll = setTimeout( function () { 
				(function poll () {
					for ( var key in self.handlers ) {
						self.handlers[key]();
					} 
					self.timerHandle = setTimeout( poll, self.pollTime );
				})()
			}, self.pollTime );
		}, 
		
		stop: function () {
			var self = this;
			clearTimeout( self.timerHandle );
			self.timerHandle = null;
			return self;
		},
		
		clear: function () {
			var self = this;
			self.stop();
			self.handlers = null;
			return self;
		},
		
		subscribe: function ( fn, ref ) {
			var self = this,
				handlerId = ref || ++self.uid;
			if ( self.handlers[handlerId] ) {
				return false;
			}
			self.handlers[handlerId] = fn;
			if ( !self.timerHandle ) {
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
	});
	
})();