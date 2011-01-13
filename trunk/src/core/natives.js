/**

Patching native support for standard object methods
Implementing ECMAScript 5 features where possible	

@links
	Object.keys      : https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys
	Array.isArray    : https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
	Array.forEach    : https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach
	Array.indexOf    : https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
	Array.filter     : https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/filter
	Array.map        : https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/map
	Array.some       : https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some
	Array.every      : https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every
	String.trim      : https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String/Trim
	Function.bind    : https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
	
	// Non-standard but widely supported
	Element.contains : http://msdn.microsoft.com/en-us/library/ms536377%28VS.85%29.aspx
	Element.innerText : http://msdn.microsoft.com/en-us/library/ms533899%28v=vs.85%29.aspx
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

/* ECMAScript 5 */
merge( Object, {
	keys: function ( obj ) {
		var res = [], key;
		for ( key in obj ) {
			if ( obj.hasOwnProperty( key ) ) {
				res.push( key );
			}
		}
		return res;
	}
});

merge( Array, {
	isArray: function ( obj ) {
		return objToString.call( obj ) == '[object Array]';
	}
});


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
merge( Array.prototype, arrayMethods );

// Common alias for convenience
Array.prototype.each = Array.prototype.forEach;

// Add Array methods as generics
makeGenerics( Array, Object.keys( arrayMethods ).concat( 'each,concat,join,pop,push,reverse,shift,splice,sort,splice,toString,unshift,valueOf'.split( ',' ) ) );


/* String methods */
var stringMethods = {
	trim: function () {
		return this.replace( /^\s\s*/, '' ).replace( /\s\s*$/, '' );
	}
}
merge( String.prototype, stringMethods );

// Add String methods as generics
makeGenerics( String, Object.keys( stringMethods ).concat( 'charAt,charCodeAt,concat,fromCharCode,indexOf,lastIndexOf,match,replace,search,slice,split,substr,substring,toLowerCase,toUpperCase,valueOf'.split( ',' ) ) );


/* Function methods */
merge( Function.prototype, {
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
});


// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/defineProperty
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Guide/Working_with_Objects#Defining_Getters_and_Setters
// http://ejohn.org/blog/javascript-getters-and-setters/
var defineProperty = Object.defineProperty,
	defineGetter = function ( obj, prop, fn ) {
		if ( !!obj.__defineGetter__ ) {
			obj.__defineGetter__( prop, fn );  
		} 
	},
	defineSetter = function ( obj, prop, fn ) {
		if ( !!obj.__defineSetter__ ) {
			obj.__defineSetter__( prop, fn );  
		} 
	};



/* HTMLElement methods and properties */


if ( win.HTMLElement && HTMLElement.prototype ) {
	
	var elementPrototype = HTMLElement.prototype;
	merge( elementPrototype, {
		contains: function ( el ) {
			return !!( this.compareDocumentPosition( el ) & 16 );
		}
	});
	
	// http://www.quirksmode.org/dom/w3c_html.html
	if ( !elementPrototype.innerText ) {
		defineGetter( elementPrototype, 'innerText', function () {
			return this.textContent || this.innerHTML.replace( /<[^>]*>/g, '' );
		});
		defineSetter( elementPrototype, 'innerText', function ( value ) {
			this.innerHTML = value; 
		});
	}
}







