/**

Class

@description 
	Utilities for defining classes on the Jelly namespace

*/

var	defineClass = function ( name, opts ) {
		var Class = opts.__init || function () {},
			Static = opts.__static || {},
			Extends = opts.__extends,
			Prototype = Class.prototype; 
		
		extend( Prototype, defineClassAbstract );
		
		( isArray( Extends ) ? Extends : 
			( Extends ? [ Extends ] : [] ) ).each( function ( obj ) {
			extend( Prototype, obj.prototype ); 
			Class.__parent = obj;
		});
		
		extend( Class, Static );
		
		['__init', '__static', '__extends'].each( function ( mem ) {
			delete opts[mem];
		});
					
		extend( Prototype, opts );
		
		Prototype.constructor = Class;
		
		Class.__name = name;
		
		J[name] = Class;
		
		return Class;
	},
	
	// base methods which are automatically implemented
	//
	defineClassAbstract = {
		
		fireEvent: function () {
			var args = toArray( arguments ),
				event = 'on' + capitalize( args.shift() ),
				func = this[event];
			
			// If no argument is specified we just pass in the object as default
			if ( empty( args ) ) {
				args.push( this );
			}
			return func ? func.apply( this, args ) : false;
		},
		
		isInstanceOf: function () {
			return this.constuctor.__name;
		},
		
		set: function ( a, b ) {
			var self = this;
			if ( isObject( a ) ) {
				return extend( self, a );;
			} 
			self[a] = b;
			return self;
		}
	};

J.defineClass = defineClass;