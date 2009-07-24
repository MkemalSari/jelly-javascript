/**

MultiTween

@location plugins
@description   

*/

(function () {

var Class = defineClass( 'MultiTween', {
		
		__extends: J.Tween,
		
		__init: function ( collection, opts ) {
			this.collection = collection;
			extend( this, opts || {} ); 
		},
				
		setOpacity: function ( val ) {
			this.collection.each( function ( el ) {
				J.setOpacity( el, val );
			});
			return this;
		},
        
		tidyUp: function () {
			
			var self = this,
				collection = self.collection,
				stackCounter = self.stack.length - 1;
			do {
				var item = self.stack[ stackCounter ], 
					collectionCounter = collection.length - 1;
				do {
					var elem = collection[ collectionCounter ], style = elem.style;
					if ( item.opac ) { 
						J.setOpacity( elem, item.to );                 
					}
					else if ( item.color ) { 
						style[item.prop] = 'rgb(' + item.to.join(',') + ')'; 
					} 
					else if ( item.bgp ) {
						style.backgroundPosition = item.to[0] + self.unit + ' ' + item.to[1] + self.unit;
					} 
					else {
						style[item.prop] = item.to + self.unit; 
					}
				} while ( collectionCounter-- );
			} while ( stackCounter-- );
			
		},
		
		increase: function () {
			
			var self = this,
				round = Math.round,
				setOpacity = J.setOpacity,
				roundPx = browser.ie && self.unit === 'px',
				collection = self.collection,
				stackCounter = self.stack.length - 1;
			do {
				var item = self.stack[ stackCounter ], 
					collectionCounter = collection.length - 1;
				do {
					var elem = collection[ collectionCounter ], style = elem.style;
					if ( item.opac ) { 
						setOpacity( elem, self.compute( item.from, item.to ) );         
					}
					else if ( item.color ) { 
						style[item.prop] = 'rgb(' + 
							round( self.compute( item.from[0], item.to[0] ) ) + ',' +
							round( self.compute( item.from[2], item.to[2] ) ) + ')';
					} 
					else if ( item.bgp ) {
						style.backgroundPosition = 
							self.compute( item.from[0], item.to[0] ) + self.unit + ' ' + 
							self.compute( item.from[1], item.to[1] ) + self.unit;
					} 
					else {
						var computed = self.compute( item.from, item.to );
						style[item.prop] = ( roundPx ? round( computed ) : computed ) + self.unit;
					}
				} while ( collectionCounter-- );
			} while ( stackCounter-- );
		
		}
	
	});

})(); 