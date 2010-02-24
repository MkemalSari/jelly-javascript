/**

Patching native support for standard object methods
Implementing ecmascript 5 features where possible	

*/
var makeGenerics = function ( constructor, methodNames ) {
	methodNames.each( function ( name ) {
		if ( !constructor[ name ] ) {
			constructor[ name ] = function () {
				var args = toArray( arguments ),
					subject = args.shift();
				return constructor.prototype[ name ].apply( subject, args );
			};
		} 
	});
};

/* ECMA script 5 */
extend( Object, {
	keys: function ( obj ) {
		var res = [], key;
		for ( key in obj ) {
			if ( obj.hasOwnProperty( key ) ) {
				res.push( key );
			}
		}
		return res;
	}
}, false);


/* Array methods */
var arrayMethods = {
	forEach: function ( fn, obj ) {
		for ( var i = 0, n = this.length; i < n; i++ ) { 
			fn.call( obj, this[i], i, this ); 
		}
	},
	indexOf: function ( obj, from ) {
		from = isDefined(from) ? 
			( from < 0 ? Math.max( 0, this.length + from ) : from ) : 0;
		for ( var i = from, n = this.length; i < n; i++ ) { 
			if ( this[i] === obj ) { 
				return i; 
			} 
		}
		return -1;
	},
	filter: function ( fn, obj ) {
		for ( var i = 0, n = this.length, arr = []; i < n; i++ ) { 
			if ( fn.call( obj, this[i], i, this ) ) { 
				arr.push( this[i] ); 
			} 
		}
		return arr;
	},
	map: function ( fn, obj ) {
		for ( var i = 0, n = this.length, arr = []; i < n; i++ ) { 
			arr.push( fn.call( obj, this[i], i, this ) ); 
		}
		return arr;
	},
	some: function ( fn, obj ) {
		for ( var i = 0, n = this.length; i < n; i++ ) { 
			if ( fn.call( obj, this[i], i, this ) ) { 
				return true; 
			} 
		}
		return false;
	},
	every: function ( fn, obj ) {
		for ( var i = 0, n = this.length; i < n; i++ ) { 
			if ( !fn.call( obj, this[i], i, this ) ) { 
				return false; 
			} 
		}
		return true;
	}
};
extend( Array.prototype, arrayMethods, false );

// Common alias for convenience
Array.prototype.each = Array.prototype.forEach;

// Add Array methods as generics
makeGenerics( Array, Object.keys( arrayMethods ).concat( 'each concat join pop push reverse shift splice sort splice toString unshift valueOf'.split( '' ) ) );


/* String methods */
var stringMethods = {
	trim: function () {
		return this.replace( /^\s\s*/, '' ).replace( /\s\s*$/, '' );
	}
}
extend( String.prototype, stringMethods, false );

// Add String methods as generics
makeGenerics( String, Object.keys( stringMethods ).concat( 'charAt charCodeAt concat fromCharCode indexOf lastIndexOf match replace search slice split substr substring toLowerCase toUpperCase valueOf'.split( ' ' ) ) );


/* Function methods */
extend( Function.prototype, {
	bind: function () {
		if ( arguments.length < 2 && !isDefined( arguments[0] ) ) { 
			return this; 
		}
		var args = toArray( arguments ),
			scope = args.shift(),
			fn = this; 
		return function () {
			for ( var i = 0, arr = toArray( args ); arguments.length > i; i++ ) { 
				arr.push( arguments[i] ); 
			}
			return fn.apply( scope, arr );
		};
	}
}, false);


/* HTMLElement methods */
if ( win.HTMLElement && HTMLElement.prototype ) {
	extend( HTMLElement.prototype, {
		contains: function ( el ) {
			return !!( this.compareDocumentPosition( el ) & 16 );
		}
	}, false );
}	