/**

2D Transformation parsers 

*/
(function () {

var Class = Tween,
	
	transformProperty = getVendorStyleProperty( 'transform' ),
	
	transformParser = function ( prop, obj ) {
		var unit = obj.unit || '',
			defaultValue = obj.def || 0,
			multiValue = isArray( defaultValue ),
			re = new RegExp( '((?:^|\\s)' + prop + '\\()([^\\)]+)(\\))' ),
			parseValue = function ( val ) {
				return val.split( ',' ).map( parseFloat );
			},
			joinValue = function ( val ) {
				return val.join( unit + ',' ) + unit;
			};
		return { 
			prop: transformProperty,

			// Return multi-dimensional array 
			// [ [ 1, 2.. ], [ 50, 100.. ] ]
			get: function ( self, key, feed, referenceElement ) {
				var elStyle = referenceElement.style,
					startValue = elStyle[ transformProperty ], 
					// Is the property already on the style attribute?
					m = re.exec( startValue );				
				
				// Pick a start value
				if ( isUndefined( feed.from ) ) {
					feed.from = m ? 
						parseValue( m[2] ) : 
						( isArray( feed.to ) ? 
							feed.to.map( function () {return defaultValue;} ) : 
							[ defaultValue ] );
				} 
				// Need to initialize the style attribute if it's not already
				if ( !m ) { 
					self.element.each( function ( el ) {
						el.style[ transformProperty ] += ' ' + prop + '(' + joinValue( feed.from ) + ')';
					});
				}
				if ( !isArray( feed.to ) ) {
					feed.to = [ feed.to ];
				}
				return feed;
			},
			
			step: function ( self, feed, element ) {	
				var result = [], i = 0;
				for ( ; i < feed.from.length; i++ ) {
					result.push( self.compute( feed, feed.from[i], feed.to[i] ) );
				} 
				return element.style[ transformProperty ].replace( re, '$1' + joinValue( result ) + '$3' ); 
			},
			
			finish: function ( self, feed, element ) { 
				return element.style[ transformProperty ].replace( re, '$1' + joinValue( feed.to ) + '$3' ); 
			}
		}
	};

each({
	'matrix': { },
	'translate': { unit: 'px' },
	'translateX': { unit: 'px' },
	'translateY': { unit: 'px' },
	'scale': { def: 1 },
	'scaleX': { def: 1 },
	'scaleY': { def: 1 },
	'rotate': { unit: 'deg', parserName: 'rotation' },
	'skew': { unit: 'deg' },
	'skewX': { unit: 'deg' },
	'skewY': { unit: 'deg' }
}, function ( prop, obj ) {
	Class.parsers[ obj.parserName || prop ] = transformParser( prop, obj );
})
	
})();