/**
 @! Core library functions

 The library namespace.
 Can also be used as a function for unpacking the library namespace.

 @namespace JELLY
 @example
     (function () {
         eval( JELLY() );
         // Library utilities can now be accessed directly in this closure
     })();
 */
var J = window.JELLY = function () {
		if ( typeof __JELLY !== 'undefined' ) { 
			return null; 
		}
		J.__JELLY = 1.14; // Version
		var stack = [ 'var J=JELLY' ], mem, i = 1;
		for ( mem in J ) { 
			stack[ i++ ] = mem + '=J.' + mem;
		}
		return stack.join( ',' ) + ';';
	},
	
	// Shortcuts
	win = window,
	doc = win.document,
	nav = win.navigator,
	docRoot = doc.documentElement,
	docHead = doc.getElementsByTagName( 'head' )[0],
	functionLit = function () {},
	
	/**
	 Extend objects, overwriting existing members
	 
	 @param {object} original
	 @param {object} extender
	 @return {object} The extended object.
	 */
	extend = function ( a, b ) {
		for ( var mem in b ) {
			a[ mem ] = b[ mem ];
		}
		return a;
	},
	
	/**
	 Extend objects, not overwriting existing members
	  
	 @param {object} original
	 @param {object} extender
	 @return {object} The merged object.
	 */
	merge = function ( a, b ) {
		for ( var mem in b ) {
			if ( isUndefined( a[ mem ] ) ) {
				a[ mem ] = b[ mem ];
			}
		}
		return a;
	},
	
	/**
	 Object containing boolean flags for detecting common desktop and mobile browsers
	 
	 @namespace JELLY.browser 
	 @example
	     if ( JELLY.browser.ie > 6 ) {
	         // This is Internet Explorer and version > 6  
	     }
	 @prop {bool} ie
	 @prop {bool} firefox
	 @prop {bool} opera
	 @prop {bool} webkit
	 @prop {bool} safariMobile
	 @prop {bool} chrome
	*/	
	browser = function () {
		var result = {},
			ua = nav.userAgent, 
			webkit = /webkit/i.test( ua ),
			ie = ( !!win.ActiveXObject && +( /msie\s(\d+)/i.exec( ua )[1] ) ) || NaN;
		if ( ie ) {
			result[ 'ie' + ie ] = true;
		} 
		return extend( result, {
			ie: ie,
			firefox: /firefox/i.test( ua ),
			opera: !!win.opera && /opera/i.test( ua ),
			webkit: webkit,
			safariMobile: /Apple.*Mobile/.test( ua ),
			chrome: webkit && /chrome/i.test( ua )
		});
	}(),
	
	msie = browser.ie,
	
	goodTypeDetection = !msie,
	
	
	objToString = {}.toString,
	objTestString = '[object Object]',
	
	/**
	 Check if passed object is defined
	 @param {object} object
	 */
	isDefined = function ( obj ) { 
		return typeof obj != 'undefined'; 
	},

	/**
	 Check if passed object is undefined
	 @param {object} object
	 */
	isUndefined = function ( obj ) { 
		return typeof obj == 'undefined'; 
	},

	/**
	 Check if passed object is null
	 @param {object} object
	 */
	isNull = function ( obj ) { 
		return obj === null; 
	},

	/**
	 Check if passed object is a boolean value
	 @param {object} object
	 */
	isBoolean = function ( obj ) { 
		return typeof obj == 'boolean'; 
	},
	
	/**
	 Check if passed object is a string
	 @param {object} object
	 */
	isString = function ( obj ) { 
		return typeof obj == 'string'; 
	},
	
	/**
	 Check if passed object is a number
	 @param {object} object
	 */	
	isNumber = function ( obj ) { 
		return typeof obj == 'number'; 
	},
	
	/**
	 Check if passed object is an integer
	 @param {object} object
	 */	
	isInteger = function ( obj ) { 
		return isNumber( obj ) ? !( obj % 1 ) : false; 
	}, 
	
	/**
	 Check if passed object is a floating point number
	 @param {object} object
	 */	
	isFloat = function ( obj ) { 
		return isNumber( obj ) ? !!( obj % 1 ) : false; 
	}, 
	
	/**
	 Check if passed object is numeric string, float or integer
	 @param {object} object
	 */
	isNumeric = function ( obj ) { 
		return isString( obj ) || isNumber( obj ) ? 
			/^\s*\d+\.?\d*?\s*$/.test( ( obj+'' ) ) : false; 
	},
	
	/**
	 Check if passed object is of type 'object' and not null
	 @param {object} object
	 */
	isObjectLike = function ( obj ) {
		return !!obj && typeof obj == 'object';
	},
	
	/**
	 Check if passed object is an object literal
	 @param {object} object
	 */
	isObjLiteral = function () { 
		if ( goodTypeDetection ) {
			return function ( obj ) {
				return objToString.call( obj ) == objTestString && obj.constructor === Object;
			};
		}
		return function ( obj ) {
			return !!obj && objToString.call( obj ) == objTestString && 
				!obj.nodeType && !obj.item;
		};
	}(),
	
	/**
	 Check if passed object is a function
	 @param {object} object
	 */
	isFunction = function ( obj ) { 
		// Opera can't handle a wrapped 'return typeof === "function"'
		return objToString.call( obj ) == '[object Function]'; 
	},
	
	/**
	 Check if passed object is an HTML element
	 @param {object} object
	 */
	isElement = function () {
		if ( goodTypeDetection ) {
			return function ( obj ) {
				return !!isObjectLike( obj ) && 
					objToString.call( obj ).indexOf( '[object HTML' ) == 0 &&
					obj.nodeType == 1;
			};
		} 
		return function ( obj ) {
			return !!isObjectLike( obj ) && obj.nodeType == 1; 
		};
	}(),
	
	/**
	 Check if passed object is an HTML NodeList or HTML Collection
	 @param {object} object
	 */
	isNodeList = function () { 
		if ( goodTypeDetection ) {
			return function ( obj ) {
				return !!isObjectLike( obj ) &&
					/^\[object (HTMLCollection|NodeList)\]$/.test( objToString.call( obj ) );
			};
		} 
		return function ( obj ) {
			return !!isObjectLike( obj ) && isDefined( obj.length ) && 
				!isArray( obj ) && !!obj.item; 
		};
	}(),
	
	/**
	 Check if passed object is an Array
	 @param {object} object
	 */	
	isArray = function ( obj ) { 
		return Array.isArray( obj ); 
	},

	/**
	 Check an array for a specific value
	 @param {object} object
	 @param {array} array
	 */
	inArray = function ( obj, arr ) { 
		return arr.indexOf( obj ) != -1; 
	},

	/**
	 Convert enumerable object to an array
	 @param {object} object
	 */
	toArray = function ( obj ) {
		var result = [], n = obj.length, i = 0;
		for ( i; i < n; i++ ) { 
			result[i] = obj[i]; 
		}
		return result;
	},
	
	/**
	 Check to see if object is empty; works for instances of Object, Array and String
	 @param {object} object
	 */
	empty = function ( obj ) {
		if ( isString( obj ) ) {
			return /^\s*$/.test( obj );
		}
		else if ( isArray( obj ) ) {
			return !obj.length;
		}
		else if ( isObjLiteral( obj ) ) {
			return !Object.keys( obj ).length;
		}
		return !obj;
	},
	
	/**
	 Returns a function wrapper with negated return values, useful for <Array> filter 
	
	 @param {function} function
	 @example 
	 ' foo, 12.1 bar 101 '.split( ' ' ).map( parseFloat ).filter( negate( isNaN ) )
	 >>> [ 12.1, 101 ]
	 */
	negate = function ( fn ) {
		return function () {
			return !fn.apply( this, arguments );
		}
	},	
	
	// /*
	// Returns function wrapper with optional preset arguments, useful for <Array> map 
	// 
	// @example 
	// ' foo, bar '.split( ',' ).map( String.trim ).map( preset( String.split, '' ) )
	// >>> [ ['f','o','o'], ['b','a','r'] ]
	// */
	// preset = function () {
	// 	var args = toArray( arguments ),
	// 		fn = args.shift();
	// 	return function ( item ) {
	// 		return fn.apply( this, [ item ].concat( args ) );
	// 	};
	// },
	
	/**
	 Generic iterator function; works for objects, arrays and nodelists
	
	 @param {object} object
	 @param {function} callback
	*/
	each = function ( obj, callback ) {
		if ( isObjLiteral( obj ) ) {
			for ( var key in obj ) { 
				callback.call( obj, key, obj[ key ] ); 
			}
		}
		else if ( obj.length ) {
			for ( var i = 0; i < obj.length; i++ ) { 
				callback.call( obj, obj[ i ], i ); 
			}
		}		
	},
	
	/**
	 Defer function calls; equivilant to setTimeout( myfunc, 0 )
	
	 @param {function} function
	 @param {object} [scope] Defaults to window
	 @param {object} [...] Arguments
	*/
	defer = function () {
		var args = toArray( arguments ),
			func = args.shift(),
			scope = args.shift() || {};
		return setTimeout( function () { func.apply( scope, args ); }, 0 );
	},
	
	createLogger = function ( method ) {
		var console = win.console;
		if ( console && console[ method ] && console[ method ].apply ) {  	
			return function () {
				console[ method ].apply( console, toArray( arguments ) ); 
			};
		}
		return functionLit;
	},
	log = createLogger( 'log' ),
	logWarn = createLogger( 'warn' ),
	logError = createLogger( 'error' );
		
extend( J, {
	win: win,
	doc: doc,
	docRoot: docRoot, 
	docHead: docHead,
	functionLit: functionLit,
	browser: browser,
	isDefined: isDefined,
	isUndefined: isUndefined,
	isNull: isNull,
	isBoolean: isBoolean,
	isString: isString,
	isNumber: isNumber,
	isInteger: isInteger,
	isFloat: isFloat,
	isNumeric: isNumeric,
	isObjLiteral: isObjLiteral,
	isObjectLike: isObjectLike,
	isFunction: isFunction,
	isElement: isElement,
	isNodeList: isNodeList,
	isArray: isArray,
   	inArray: inArray,
	toArray: toArray,
	empty: empty,
	negate: negate,	
	//preset: preset,
	extend: extend,
	merge: merge,	
	each: each,
	defer: defer,
	log: log,
	logWarn: logWarn,
	logError: logError	
});
