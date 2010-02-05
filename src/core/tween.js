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
				//log('Timer started')
                var handler = function () {
						for ( var key in Class.tweens ) {
							Class.tweens[ key ]();
						}
					};
				Class.timerHandle = setInterval( handler, Class.timerSpeed );
			},

			stopTimer: function () {
				if ( Class.timerHandle ) {
					//log( 'Timer stopped ')
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
				args = toArray( arguments ),
				elem = self.element;

			if ( args.length > 1 ) {
				obj = {};
				obj[args[0]] = args[1];
			}
			self.stop();
			self.stack = [];

			// Group changes are base on the first element
			if ( isArray( elem ) || isNodeList( elem ) ) {
				elem = elem[0];
			}

			// Special treatment for
			if ( 'duration' in obj ) {
				self.setDuration( obj.duration );
				delete obj.duration;
			}
			if ( 'easing' in obj ) {
				self.setEasing( obj.easing );
				delete obj.easing;
			}

			// Enumerate the start object to create a stack
			enumerate( obj, function ( prop, value ) {
				var key = camelize( prop ), extra = null;
				
				// Parsing colour values
				if ( contains( prop, 'color' ) ) {
					if ( isArray( value ) ) {
						value = [
                            parseColour( value[0], 'rgb-array' ),
                            parseColour( value[1], 'rgb-array' ) ];
					}
					else {
						var style = getStyle( elem, key );
						if ( isNaN( style ) && !isString( style ) ) {
							return logWarn( 'getStyle for "%s" returns NaN', key );
						}
						value = [
							parseColour( style, 'rgb-array' ),
							parseColour( value, 'rgb-array' ) ];
					}
					extra = 'color';
				}
				
				// Parsing background-position values
				else if ( prop === 'background-position' ) {
					if ( isArray( value[0] ) ) {
						value = [ value[0][0], value[0][1]], [value[1][0], value[1][1] ];
					}
					else {
                        var startX = 0,
							startY = 0,
							current = getStyle( elem, key ),
							m = /(\d+)[\w%]{1,2}\s+(\d+)[\w%]{1,2}/.exec( current );
						if ( current && m ) {
							startX = parseInt( m[1], 10 );
							startY = parseInt( m[2], 10 );
						}
						value = [ [ startX, value[0] ], [ startY, value[1] ] ];
					}
					extra = 'bgp';
				}
				
				// Parsing default 
				else {
					if ( !isArray( value ) ) {
						var style = parseFloat( getStyle( elem, key ) );
						if ( isNaN( style ) && !isString( style ) ) {
							return logWarn( 'getStyle for "%s" returns NaN', key );
						}
						value = [ style, value ];
                    }
					else {
						value = value;
					}
					if ( prop === 'opacity' ) {
						extra = 'opac';
					}
				}
				
				// Add to effect stack
                self.stack.push({
                    prop: key,
                    from: value[0],
                    to: value[1],
                    extra: extra
                });
			});
			
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
		
		tidyUp: function () {
			var self = this,
				collection = self.element,
				stackCounter = self.stack.length - 1;
			do {
				var item = self.stack[ stackCounter ], 
					extra = item.extra,
					unit = self.unit,
					collectionCounter = collection.length - 1;
				do {
					var elem = collection[ collectionCounter ], 
						style = elem.style;
					switch ( extra ) {
						case 'opac':
							setOpacity( elem, item.to );                 
							break;
						case 'color':
							style[ item.prop ] = 'rgb(' + item.to.join(',') + ')';
						case 'bgp':
							style.backgroundPosition = item.to[0] + unit + ' ' + item.to[1] + unit;
							break;
						default:
							style[ item.prop ] = item.to + unit; 
					}
				} while ( collectionCounter-- );
			} while ( stackCounter-- );
		},
		
		increase: function () {
			var self = this,
				round = Math.round,
				roundPx = !browser.firefox && self.unit === 'px',
				collection = self.element,
				stackCounter = self.stack.length - 1;
			do {
				var item = self.stack[ stackCounter ],
					extra = item.extra,
					unit = self.unit,
					collectionCounter = collection.length - 1;
				do {
					var elem = collection[ collectionCounter ], 
						style = elem.style;
					switch ( extra ) {
						case 'opac':
							setOpacity( elem, self.compute( item.from, item.to ) );         
							break;
						case 'color':
							style[ item.prop ] = 'rgb(' + 
								round( self.compute( item.from[0], item.to[0] ) ) + ',' +
								round( self.compute( item.from[1], item.to[1] ) ) + ',' +
								round( self.compute( item.from[2], item.to[2] ) ) + ')';
							break;
						case 'bgp':
							style.backgroundPosition = 
								self.compute( item.from[0], item.to[0] ) + unit + ' ' + 
								self.compute( item.from[1], item.to[1] ) + unit;
							break;
						default:
							var computed = self.compute( item.from, item.to );
							style[ item.prop ] = ( roundPx ? round( computed ) : computed ) + unit;
					}
				} while ( collectionCounter-- );
			} while ( stackCounter-- );
		},

		compute: function ( from, to ) {
			return this.easing( this.elapsedTime, from, ( to - from ), this.duration );
		}

	});

})();

var Tween = J.Tween;
