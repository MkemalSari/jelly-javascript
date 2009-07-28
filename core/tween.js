/**

Tween

@description   
	Class for creating element tweens

*/

(function () {

var Class = defineClass( 'Tween', {
		
		__init: function ( el, opts ) {
			this.el = getElement(el);
			extend( this, opts || {} ); 
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
							Class.tweens[key]();
						} 
					};
				//log('Timer started')
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
        
		setOpacity: function (val) {
			setOpacity( this.el, val );
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
				self.fireEvent( 'sequenceComplete' );
			}
		},
		
		stop: function () {
			Class.unSubscribe( this );
			return this;
		},
		
		start: function ( obj ) {
			var self = this,
				args = toArray( arguments ),
				elem = self.el;
				
			if ( isDefined( args[1] ) ) {
				obj = {};
				obj[args[0]] = args[1];
			} 
			self.stop();
			self.stack = [];
			
			if ( isArray( elem ) || isNodeList( elem ) ) {
				elem = elem[0];
			}
			
			if ( 'duration' in obj ) {
				self.setDuration( obj.duration );	
				delete obj.duration;
			}
			if ( 'easing' in obj ) {
				self.setEasing( obj.easing);	
				delete obj.easing;
			}
			
			var prop, key, value;
			
			for ( prop in obj ) {
				key = camelize( prop ),
				value = obj[prop];
				if ( prop.indexOf('color') !== -1 ) {
					if ( isArray( value ) ) {
						value = [	
                            parseColour( value[0], 'rgb-array' ), 
                            parseColour( value[1], 'rgb-array' )];
					}
					else {
						var style = getStyle( elem, key );
						if ( isNaN( style ) && !isString( style ) ) { 
							return logWarn( 'getStyle for "%s" returns NaN', key );
						} 
						value = [ 
							parseColour( style, 'rgb-array' ), 
							parseColour( value, 'rgb-array' )];
					}
					value.color = true;
				}
				else if ( prop === 'background-position' ) {
					if ( isArray( value[0] ) ) {
						value = [value[0][0], value[0][1]], [value[1][0], value[1][1]];
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
						value = [[startX, value[0]], [startY, value[1]]];
					}
                    value.bgp = true;
				}
				else {
					if ( !isArray( value ) ) {
						var style = parseInt( getStyle( elem, key ), 10 );
						if ( isNaN( style ) && !isString( style ) ) { 
							return logWarn( 'getStyle for "%s" returns NaN', key );
						} 
						value = [style, value]; 
                        if ( prop === 'opacity' ) {
                            value.opac = true;
                        }
					}
					else {
						value = value;
					}
				}
                self.stack.push({
                    prop: key, 
                    from: value[0], 
                    to: value[1], 
                    color: value.color, 
                    bgp: value.bgp,
                    opac: value.opac
                });
			}
            
			self.startTime = +(new Date);
			self.tweenId = ++Class.uid;
            Class.subscribe( self );
            self.fireEvent( 'start' );
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
                    self.fireEvent( 'complete' );
					self.callSequence(); 
				}, 0 );
                return;
			}
            self.increase();
		},
		
		tidyUp: function () {
			var self = this,
                item,
				style = self.el.style,
                stackCounter = self.stack.length - 1;
            do {
            	item = self.stack[stackCounter];
                if ( item.opac ) { 
                    self.setOpacity( item.to );                 
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
            } while ( stackCounter-- )
		},
		
		increase: function () {
			var self = this, 
                item,
                round = Math.round,
				style = self.el.style,
                stackCounter = self.stack.length - 1,
				roundPx = ( browser.ie || browser.opera || browser.webkit ) && self.unit === 'px';
            do {
                item = self.stack[stackCounter];
                if ( item.opac ) {
                    self.setOpacity( self.compute( item.from, item.to ) );     
                } 
                else if ( item.color ) {
					style[item.prop] = 'rgb(' + 
						round( self.compute( item.from[0], item.to[0] ) ) + ',' +
						round( self.compute( item.from[1], item.to[1] ) ) + ',' +
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
            } while ( stackCounter-- )

		},
		
		compute: function ( from, to ) {
			return this.easing( this.elapsedTime, from, ( to - from ), this.duration );
		}

	});

})(); 