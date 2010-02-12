/**

Tween.js

*/
(function () {

var Class = defineClass( 'Tween', {

		__init: function ( element, opts ) {
			this.setElement( element );
			this.set( opts || {} );
		},

		__static: {
			uid: 0,
			tweens: {},
			timerSpeed: 20,

			subscribe: function ( inst ) {
				Class.tweens[ inst.tweenId ] = function () {
						inst.step.call( inst );
					};
				if ( !Class.timerHandle ) {
					Class.startTimer();
				}
			},

			unSubscribe: function ( inst ) {
				delete Class.tweens[ inst.tweenId ];
				clearTimeout( Class.timeoutHandle );
				Class.timeoutHandle = setTimeout( function () {
						if ( empty( Class.tweens ) ) {
							Class.stopTimer();
						}
					}, 250);
			},

			startTimer: function () {
                var handler = function () {
						for ( var key in Class.tweens ) {
							Class.tweens[ key ]();
						}
					};
				Class.timerHandle = setInterval( handler, Class.timerSpeed );
			},

			stopTimer: function () {
				if ( Class.timerHandle ) {
					clearInterval( Class.timerHandle );
				}
				Class.timerHandle = null;
			}			
		},

		easing: J.easings.sineInOut,
		duration: 500,
		unit: 'px',
		
		__set: {
		
			easing: function (val) {
				this.easing = J.easings[val];
				return this;
			},
			
			duration: function (val) {
				this.duration = val;
				return this;
			},

			opacity: function ( val ) {
				this.element.each( function ( element ) {
					setOpacity( element, val );
				});
				return this;
			},

			origin: function ( val ) {
				this.element.each( function ( element ) {
					element.style[ transformProperty + 'Origin' ] = val;
				});
				return this;
			},
			
			element: function ( element ) {
				this.element = isArray( element ) ? element.map( getElement ) : [ getElement( element ) ];
				return this;
			}
		},

		sequence: function () {
			this.sequenceStack = toArray( arguments );
			this.callSequence();
			return this;
		},

		callSequence: function () {
			var self = this,
				next = isArray( self.sequenceStack ) ? self.sequenceStack.shift() : null;
			if ( next ) {
				if ( isFunction(next) ) {
					next.call( self, self );
				}
				else {
					self.start( next );
				}
			}
			else {
				self.fire( 'sequenceComplete' );
			}
		},

		cancel: function () {
			clearTimeout( self.delayTimer );
			Class.unSubscribe( this );
			return this;
		},

		start: function ( obj ) {
			var self = this,
				args = toArray( arguments );				

			if ( args.length > 1 ) {
				obj = {};
				obj[ args[0] ] = args[1];
			}
			self.cancel();
			self.stack = [];

			// Meta properties
			[ 'element', 
			  'duration', 
			  'easing',
			  'origin'
			].each( function ( prop ) {
				if ( prop in obj ) { 
					self.set( prop, obj[ prop ] )
					delete obj[ prop ];
				}
			});
			
			// Delay value for the current tween
			var delay = obj[ 'delay' ] || 0;
			delete obj[ 'delay' ];
			
			// Parse the start object to create the effect stack
			enumerate( obj, function ( prop, value ) {
				var key = camelize( prop ), 
					// We pass in the first element as a basis for all unspecified start value calculations
					referenceElement = self.element[0],
					parsers = Class.parsers,
					parser = prop in parsers && parsers[ prop ].get ? prop : '_default',
					feed = {};
				
				// Deal with object format arguments
				if ( isObject( value ) ) {
					feed = value;
				}
				else if ( isArray( value ) ) {
					feed.from = value[0]; 
					feed.to = value[1]; 
				}
				else {
					feed.to = value; 
				}
				var parser = feed.parser = parsers[ parser ];
				feed.prop = parser.prop || key;
				feed.easing = feed.easing ? J.easings[ feed.easing ] : self.easing;
				feed.unit = isDefined( feed.unit ) ? feed.unit : self.unit;
				
				// Parse from/to values from the referenceElement 
				feed = parser.get( self, key, feed, referenceElement );
				
                self.stack.push( feed );
			});
						
			self.tweenId = ++( Class.uid );
			
			self.delayTimer = setTimeout( function () {
				self.startTime = +( new Date );
				Class.subscribe( self );
				self.fire( 'start' );
			}, delay );
			
			return self;
		},

		step: function () {
			var self = this,
				currentTime = +( new Date );
            if ( currentTime < self.startTime + self.duration ) {
				self.elapsedTime = currentTime - self.startTime;
			}
            else {
				self.cancel();
                self.tidyUp();
				setTimeout(	function () {
                    self.fire( 'complete' );
					self.callSequence();
				}, 0 );
                return;
			}
            self.increase();
		},
		
		increase: function () {
			var self = this,
				collection = self.element,
				stackCounter = self.stack.length - 1,
				collectionCounter,
				item, 
				element;
			do {
				item = self.stack[ stackCounter ];
				collectionCounter = collection.length - 1;
				do {
					element = collection[ collectionCounter ]; 
					element.style[ item.prop ] = item.parser.step( self, item, element );
				} while ( collectionCounter-- );
			} while ( stackCounter-- );
		},
		
		tidyUp: function () {
			var self = this,
				collection = self.element,
				stackCounter = self.stack.length - 1,
				collectionCounter,
				item, 
				element;
			do {
				item = self.stack[ stackCounter ];
				collectionCounter = collection.length - 1;
				do {
					element = collection[ collectionCounter ]; 
					element.style[ item.prop ] = item.parser.finish( self, item, element );
				} while ( collectionCounter-- );
			} while ( stackCounter-- );
		},
		
		compute: function ( obj, from, to ) {
			return obj.easing( this.elapsedTime, from, ( to - from ), this.duration );
		}

	});


/* Parsers */

var	_default = {
		get: function ( self, key, feed, referenceElement ) {
			if ( isUndefined( feed.from ) ) {
				feed.from = parseFloat( getStyle( referenceElement, key ) ) || 0;
			}
			return feed;
		},
		step: function ( self, feed ) {	
			return self.compute( feed, feed.from, feed.to ) + feed.unit;
		},
		finish: function ( self, feed ) { 
			return feed.to + feed.unit;
		}
	},

	_unitless = {
		get: _default.get,
		step: function ( self, feed ) {
			return self.compute( feed, feed.from, feed.to );
		},
		finish: function ( self, feed ) {
			return feed.to;
		}
	},
	
	_color = {
		get: function ( self, key, feed, referenceElement ) {
			if ( isUndefined( feed.from ) ) {
				feed.from = parseColor( getStyle( referenceElement, key ), 'rgb-array' );
			} 
			feed.to = parseColor( feed.to, 'rgb-array' );
			return feed;
		},
		step: function ( self, feed, element ) {
			var round = Math.round;
			return 'rgb(' +
					round( self.compute( feed, feed.from[0], feed.to[0] ) ) + ',' +
					round( self.compute( feed, feed.from[1], feed.to[1] ) ) + ',' +
					round( self.compute( feed, feed.from[2], feed.to[2] ) ) + ')';
		},
		finish: function ( self, feed ) {
			return 'rgb(' + feed.to.join( ',' ) + ')';
		}
	},
		
	_backgroundPosition = {
		get: function ( self, key, feed, referenceElement ) {
			// from: [0, 0]
			// to: [100, 200]
			// [[0,0], [100,200]]
			if ( isUndefined( feed.from ) ) {
				var startX = 0,
					startY = 0,
					currentStyle = getStyle( referenceElement, key );
				if ( currentStyle ) {
					currentStyle = currentStyle.
						split( ' ' ).
						filter( negate( empty ) ).
						map( parseFloat );
					startX = currentStyle[0] || startX; 
					startY = currentStyle[1] || startY;
				}
				feed.from = [ startX, startY ]; 
			}
			return feed;
		},
		step: function ( self, feed ) {
			return 	self.compute( feed, feed.from[0], feed.to[0] ) + feed.unit + ' ' + 
					self.compute( feed, feed.from[1], feed.to[1] ) + feed.unit;
		},
		finish: function ( self, feed ) {
			return feed.to.join( feed.unit + ' ' ) + feed.unit;
		}
	},

	_opacity = function () {
		if ( 'opacity' in docRoot.style ) {
			return _unitless;
		}
		return {
			get: function ( self, key, feed, referenceElement ) {
				if ( isUndefined( feed.from ) ) {
					var elStyle = referenceElement.style;
					if ( elStyle.opacity === undefined ) {
						elStyle.opacity = 1;
						elStyle.zoom = 1;
					}
					feed.from = elStyle.opacity;
				}
				return feed;
			},
			step: function ( self, feed, element ) {
				var result = self.compute( feed, feed.from, feed.to )
				element.style.filter = result === 1 ? '' : 'alpha(opacity=' + ( result * 100 ) + ')';
				return result;
			},
			finish: function ( self, feed, element ) {
				element.style.filter = feed.to === 1 ? '' : 'alpha(opacity=' + ( feed.to * 100 ) + ')';
				return feed.to;
			}
		}
	}();
	
Class.parsers = {
	_default: _default,
	_unitless: _unitless,
	'opacity': _opacity,
	'color': _color,
	'background-color': _color,
	'background-position': _backgroundPosition
};
	

/* 2D Transformation parsers */

var	transformProperty = function () {
		var cases = [ 'transform', 'WebkitTransform', 'MozTransform' ];
		for ( var i = 0; i < cases.length; i++ ) {
			if ( cases[i] in docRoot.style ) {
				return cases[i];
			}
		}
		return cases[0];
	}(),
	
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
				log(feed)
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


enumerate({
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


	
/*	
	rotate(10deg)
	
	scale(2)
	scale(2.1,4)
	scaleX(2.1)
	scaleY(21.4)
	
	skew(30deg)
	skew(30.1deg,-10deg)
	skewX(30.1deg)
	skewY(-10deg)
	
	translate(10px,100px)
	translateX(tx[, ty])
	translateY(tx[, ty])
	
	matrix(1, -0.2, 0, 1, 0, 0)
	
*/
	

	
})();

var Tween = J.Tween;
