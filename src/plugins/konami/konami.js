/**

Konami

@description 
	up, up, down, down, left, right, left, right, a, b  
	
@examples
	Konami.enable( function ( konami ) { 
		// Geeky indulgences here
	});
	
	// Alternative sequence
	Konami.enable( function ( konami ) { ... }, [ 37, 39, 37, 39 ] );
	
	Konami.disable();

*/

(function () {
	
if ( typeof __JELLY__ === 'undefined' ) { window['eval']( JELLY.unpack() ); }
	
var self = J.Konami = {
	
	enable: function ( handler, altSequence ) {
		var seq = altSequence || [38, 38, 40, 40, 37, 39, 37, 39, 66, 65], 
			score = 0;
		self.handler = handler || functionLit;
		
		if ( !self.evt ) { 
			self.evt = addEvent( doc, 'keydown', function (e) {
				if ( e.keyCode && e.keyCode === seq[score] ) {
					log(score)
					score++;
					if ( !seq[score] ) {
						self.handler.call( self, self );
						score = 0;
					}
				} 
				else { 
					score = 0;
				}
			});
		}
	},
	
	disable: function () {
		removeEvent( self.evt );
	}
	
};

})();

var Konami = J.Konami;