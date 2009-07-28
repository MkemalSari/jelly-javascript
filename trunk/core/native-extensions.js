/**

Native extensions

@description 
	Patching native support for standard object methods
	Implementing ecmascript 5 features where possible	

*/

// Array methods

extend( Array.prototype, {
	
	forEach: function ( fn, obj ) {
		for ( var i = 0, n = this.length; i < n; i++ ) { 
			fn.call( obj, this[i], i, this ); 
		}
	},
	
	indexOf: function (obj, from) {
		from = isDefined(from) ? 
			( from < 0 ? Math.max( 0, this.length + from ) : from ) : 0;
		for ( var i = from, n = this.length; i < n; i++ ) { 
			if ( this[i] === obj ) { 
				return i; 
			} 
		}
		return -1;
	},
	
	filter: function (fn, obj) {
		for ( var i = 0, n = this.length, arr = []; i < n; i++ ) { 
			if ( fn.call( obj, this[i], i, this ) ) { 
				arr.push( this[i] ); 
			} 
		}
		return arr;
	},
	
	map: function (fn, obj) {
		for ( var i = 0, n = this.length, arr = []; i < n; i++ ) { 
			arr.push( fn.call( obj, this[i], i, this ) ); 
		}
		return arr;
	},
	
	some: function (fn, obj) {
		for ( var i = 0, n = this.length; i < n; i++ ) { 
			if ( fn.call( obj, this[i], i, this ) ) { 
				return true; 
			} 
		}
		return false;
	},
	
	every: function (fn, obj) {
		for ( var i = 0, n = this.length; i < n; i++ ) { 
			if ( !fn.call( obj, this[i], i, this ) ) { 
				return false; 
			} 
		}
		return true;
	}
	
}, false);

// common alias for convenience
Array.prototype.each = Array.prototype.forEach;



// String methods

extend( String.prototype, {
	
	trim: function () {
		return this.replace( /^\s\s*/, '' ).replace( /\s\s*$/, '' );
	}
	
}, false);



// Function methods

extend( Function.prototype, {
	
	bind: function () {
		if ( arguments.length < 2 && !isDefined( arguments[0] ) ) { 
			return this; 
		}
		var args = toArray( arguments ),
			scope = args.shift(),
			fn = this; 
		return function () {
			var arr = toArray( args );
			for ( var i = 0; arguments.length > i; i++ ) { 
				arr.push( arguments[i] ); 
			}
			return fn.apply( scope, arr );
		};
	}
	
}, false);



// HTMLElement methods

if ( win.HTMLElement && HTMLElement.prototype ) {
	
	extend( HTMLElement.prototype, {
	
		contains: function ( el ) {
			return !!( this.compareDocumentPosition( el ) & 16 );
		}
	
	}, false);
	
}


// ecmascript 5

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
	