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
						inst.step.call(inst);
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
		
		setEasing: function (val) {
			this.easing = J.easings[val];
			return this;
		},

		setDuration: function (val) {
			this.duration = val;
			return this;
		},

		setOpacity: function ( val ) {
			this.element.each( function ( element ) {
				setOpacity( element, val );
			});
			return this;
		},

		setElement: function ( element ) {
			this.element = isArray( element ) ? element.map( getElement ) : [ getElement( element ) ];
			return this;
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

		stop: function () {
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
			self.stop();
			self.stack = [];

			// Meta properties
			if ( 'element' in obj ) {
				self.setElement( obj.element );
				delete obj.element;
			}
			if ( 'duration' in obj ) {
				self.setDuration( obj.duration );
				delete obj.duration;
			}
			if ( 'easing' in obj ) {
				self.setEasing( obj.easing );
				delete obj.easing;
			}
			
			// Parse the start object to create the effect stack
			enumerate( obj, function ( prop, value ) {
				var key = camelize( prop ), 
					element = self.element[0],
					parsers = Class.parsers,
					parser = prop in parsers && parsers[ prop ].get ? prop : '_default',
					customEasing = null;
				
				// Deal with object format arguments
				if ( isObject( value ) ) {
					customEasing = J.easings[ value.easing ];
					value = 'from' in value ? [ value.from, value.to ] : value.to;
				}
				
				// Parse from/to values from the element 
				var from_to = parsers[ parser ].get( self, key, value, element );
				
                self.stack.push({
					parser: parsers[ parser ], 
                    prop: parsers[ parser ].prop || key,
                    from: from_to[0],
                    to: from_to[1],
					easing: customEasing || self.easing
                });
			});
			log(self.stack)
			self.startTime = +( new Date );
			self.tweenId = ++( Class.uid );
            Class.subscribe( self );
            self.fire( 'start' );
			return self;
		},

		step: function () {
			var self = this,
				currentTime = +(new Date);
            if ( currentTime < self.startTime + self.duration ) {
				self.elapsedTime = currentTime - self.startTime;
			}
            else {
				self.stop();
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


// Parsers 
var	_default = {
		get: function ( self, key, value, element ) {
			if ( !isArray( value ) ) {
				var currentStyle = parseFloat( getStyle( element, key ) );
				return [ currentStyle, value ];
			}
			return value;
		},
		step: function ( self, obj ) {	
			return self.compute( obj, obj.from, obj.to ) + self.unit;
		},
		finish: function ( self, obj ) { 
			return obj.to + self.unit;
		}
	},

	_unitless = {
		get: _default.get,
		step: function ( self, obj ) {
			return self.compute( obj, obj.from, obj.to );
		},
		finish: function ( self, obj ) {
			return obj.to;
		}
	},
	
	_color = {
		get: function ( self, key, value, element ) {
			if ( isArray( value ) ) {
				return [
					parseColor( value[0], 'rgb-array' ),
					parseColor( value[1], 'rgb-array' ) ];
			}
			var currentStyle = getStyle( element, key );
			return [
				parseColor( currentStyle, 'rgb-array' ),
				parseColor( value, 'rgb-array' ) ];
		},
		step: function ( self, obj, element ) {
			var round = Math.round;
			return 'rgb(' +
					round( self.compute( obj, obj.from[0], obj.to[0] ) ) + ',' +
					round( self.compute( obj, obj.from[1], obj.to[1] ) ) + ',' +
					round( self.compute( obj, obj.from[2], obj.to[2] ) ) + ')';
		},
		finish: function ( self, obj ) {
			return 'rgb(' + obj.to.join( ',' ) + ')';
		}
	},
		
	_backgroundPosition = {
		get: function ( self, key, value, element ) {
			if ( isArray( value[0] ) ) {
				return [ value[0][0], value[0][1]], [value[1][0], value[1][1] ];
			}
			var startX = 0,
				startY = 0,
				currentStyle = getStyle( elem, key ),
				m = /(\d+)[\w%]{1,2}\s+(\d+)[\w%]{1,2}/.exec( currentStyle );
			if ( currentStyle && m ) {
				startX = parseInt( m[1], 10 );
				startY = parseInt( m[2], 10 );
			}
			return [ [ startX, value[0] ], [ startY, value[1] ] ];
		},
		step: function ( self, obj ) {
			return 	self.compute( obj, obj.from[0], obj.to[0] ) + self.unit + ' ' + 
					self.compute( obj, obj.from[1], obj.to[1] ) + self.unit;
		},
		finish: function ( self, obj ) {
			return obj.to[0] + self.unit + ' ' + obj.to[1] + self.unit;
		}
	},

	_opacity = function () {
		if ( 'opacity' in docRoot.style ) {
			return _unitless;
		}
		return {
			get: function ( self, key, value, element ) {
				if ( !isArray( value ) ) {
					var elStyle = element.style;
					if ( elStyle.opacity === undefined ) {
						elStyle.opacity = 1;
						elStyle.zoom = 1;
					}
					return [ elStyle.opacity, value ];
				}
				return value;
			},
			step: function ( self, obj, element ) {
				var result = self.compute( obj, obj.from, obj.to )
				element.style.filter = result === 1 ? '' : 'alpha(opacity=' + ( result * 100 ) + ')';
				return result;
			},
			finish: function ( self, obj, element ) {
				element.style.filter = obj.to === 1 ? '' : 'alpha(opacity=' + ( obj.to * 100 ) + ')';
				return obj.to;
			}
		}
	}(),
	
	transformProperty = function () {
		var cases = [ 'transform', 'WebkitTransform', 'MozTransform' ];
		for ( var i = 0; i < cases.length; i++ ) {
			if ( cases[i] in docRoot.style ) {
				return cases[i];
			}
		}
		return cases[0];
	}(),
	
	_rotation = function () {
		var rotationRe = /((?:^|\s)rotate\()([0-9]+\.?[0-9]*)(deg\))/;
		return { 
			prop: transformProperty,
			get: function ( self, key, value, element ) {
				if ( !isArray( value ) ) {
					var elStyle = element.style,
						currentStyle = elStyle[ transformProperty ] || 0, 
						m = rotationRe.exec( currentStyle );
					if ( currentStyle ) {
						currentStyle = m ? m[2] : 0;
					}
					if ( !m ) { 
						self.element.each( function ( el ) {
							el.style[ transformProperty ] += ' rotate(' + currentStyle + 'deg)';
						});
					}
					return [ currentStyle, value ];
				}
				return value;
			},
			step: function ( self, obj, element ) {	
				var result = self.compute( obj, obj.from, obj.to );
				return element.style[ transformProperty ].replace( rotationRe, '$1' + result + '$3' ); 
			},
			finish: function ( self, obj, element ) { 
				return element.style[ transformProperty ].replace( rotationRe, '$1' + obj.to + '$3' ); 
			}
		}
	}();

	
Class.parsers = {
	_default: _default,
	_unitless: _unitless,
	'opacity': _opacity,
	'color': _color,
	'background-color': _color,
	'background-position': _backgroundPosition,
	'rotation': _rotation
};
	
})();

var Tween = J.Tween;
