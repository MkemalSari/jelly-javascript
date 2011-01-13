/**

Loop a <Tween> instance

*/
(function () {

var Class = defineClass( 'Tween.Loop', {
		
		__static: {
			loopCount: 2
		},
		
		__init: function ( element, opts ) {
			opts = opts || {};
			this.loopCount = opts.loopCount || Class.loopCount;
			delete opts.loopCount;
			this.tween = new J.Tween( element, opts );
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
					delete tween[ onSequenceComplete ];
					return;
				}
				else if ( --loopCount ) {
					tween[ onSequenceComplete ] = looper;
				}				
				else {
					self.cancel = true;
					tween[ onSequenceComplete ] = function () {
						self.fire( 'complete' );
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