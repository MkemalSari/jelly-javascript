/**

Loop

@location plugins
@description 

*/

(function () {

var Class = defineClass( 'Loop', {
		
		__static: {
			loopCount: 1
		},
		
		__init: function ( node, opts ) {
			this.loopCount = opts.loopCount || Class.loopCount;
			delete opts.loopCount;
			this.tween = isArray( node ) || isNodeList( node ) ? 
				new J.MultiTween( node, opts ) : new J.Tween( node, opts );
        },
        
		setLoopCount: function ( integer ) {
			this.loopCount = integer;
			return this;
		},
		
        start: function () {
            var self = this,
				args = toArray( arguments ),
				tween = self.tween,
				onSequenceComplete = 'onSequenceComplete',
				loopCount = self.loopCount;
				
			if ( args.length < 2 ) {
				logWarn( Class.__name, ' :too few arguments' );
				return;
			}
			
			self.cancel = false;
			
			(function looper () {

				if ( self.cancel ) {
					delete tween[onSequenceComplete];
					return;
				}
				else if ( --loopCount ) {
					tween[onSequenceComplete] = looper;
				}				
				else {
					self.cancel = true;
					tween[onSequenceComplete] = function () {
						self.fireEvent( 'complete' );
					};
				}
				tween.sequence.apply( self.tween, args );
			
			})();
			
        },
        
		stop: function ( stopCurrentLoop ) {
			var self = this;
			self.cancel = true;
			if ( stopCurrentLoop ) {
				self.tween.stop();	
			}
		}
		
    });

})();