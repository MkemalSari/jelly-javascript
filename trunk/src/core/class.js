/** 

Create new classes and bind them to the JELLY namespace.
Special members are prefixed with a double underscore.

@example 
var Class = defineClass( 'Foo', {

	// List class(es) to inherit; pass more than one as an Array
	__extends: Bar,

	// Constructor (optional)
	__init: function ( x, y ) { 
		this.left = x;
		this.top = y;
	},  
     
	// Static members
	__static: {
		counter: 0,
		increment: function () {
			Class.counter++;
		}
	},

	// Setter methods
	__set: {
		prop1: function () { ... } // compiles to 'setProp1' public method
	},

	// Standard prototype methods
	moveTo: function () { ... },
	fireGun: function () { ... }
});
*/
var	defineClass = function ( name, opts ) {

		// Setup constructor, create shortcuts
		var Class = opts.__init || function () {},
			Static = opts.__static || {},
			Extends = opts.__extends,
			Prototype = Class.prototype; 
		
		// Copy over mixins
		extend( Prototype, defineClassMixins );
		
		// Loop through parent class(es) prototypes and copy members
		( isArray( Extends ) ? Extends : 
			( Extends ? [ Extends ] : [] ) ).each( function ( obj ) {
			extend( Prototype, obj.prototype ); 
			Class.__parent = obj;
		});
		
		// Add in static members to the constructor
		extend( Class, Static );
		
		// Add in setter methods
		if ( opts.__set ) {
			enumerate( opts.__set, function ( mem, value ) {
				Prototype[ 'set' + capitalize( mem ) ] = value;
			})
		}
		
		// Delete special members from <opts>
		enumerate( opts, function ( mem, value ) {
			if ( startsWith( mem, '__' ) ) {
				delete opts[ mem ];
			} 
		});
			
		// Explicitly reference the class in the prototype 
		extend( Prototype, opts );
		
		// Explicitly reference the class in the prototype 
		Prototype.constructor = Class;
		
		// Attach the class name to the constructor
		Class.__name = name;
		
		// Parse the class name as a path and map it to the constructor
		var path = J, 
			parts = name.split( '.' ),
			i = 0,
			part; 
		for ( ; i < parts.length; i++ ) {
			var part = parts[i];
			if ( !( part in path ) ) {
				path[ part ] = Class;
				break;
			}
			else {
				path = path[ part ];
			}
		}
		// Return constructor
		return Class;
	},
	
	// Mixin methods implemented by every class created with <defineClass> 
	//
	defineClassMixins = {
		
		/** 
		Generic handler for custom events
		
		@example 
		var foo = new Bar;
		  
		// Internally
		self.fire( 'complete' )
		// In the callback instance is available as 'this' or as a named argument
		foo.onComplete = function ( foo ) { ... }
		
		@example 
		var foo = new Bar;
		  
		// Internally
		self.fire( 'complete', foobar )
		// The callback
		foo.onComplete = function ( foobar ) { ... }
		
		*/
		fire: function () {
			var args = toArray( arguments ),
				event = 'on' + capitalize( args.shift() ),
				func = this[ event ];
			if ( empty( args ) ) {
				args.push( this );
			}
			return func ? func.apply( this, args ) : false;
		},

		
		/** 
		Simple introspection
		*/
		isInstanceOf: function () {
			return this.constuctor.__name;
		},
		

		/** 
		Set instance members dynamically by passing in an object literal.
		If a named method is available for setting a member it is applied 
		
		@example 
		var foo = new Bar;
		foo.set( 'name', 'yoda' );
		foo.set({
		    'ears': 2,
		    'nose': 1,
		    'salutation': 'master'
		});
		*/
		set: function () {
			var self = this, 
				args = arguments,
				feed = {};
			if ( isObject( args[0] ) ) {
				feed = args[0]; 
			} 
			else if ( args.length > 1 ) {
				feed[ args[0] ] = args[1];
			}
			enumerate( feed, function ( key, value ) {
				var methodName = 'set' + capitalize( key );
				if ( methodName in self ) {
					self[ methodName ]( value );
				}
				else {
					self[ key ] = value;
				}
			});
		}

	};

J.defineClass = defineClass;