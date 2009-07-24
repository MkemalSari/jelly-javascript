/**

Poller

@location core
@description   

*/

(function () {

var Class = defineClass( 'Poller', {
		
		__static: {
			pollTime: 300
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
			if ( !Object.keys( self.handlers ).length ) {
				self.stop();
			}
		}
	});
	
})();