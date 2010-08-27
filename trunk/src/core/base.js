/**

Initialization of JELLY namespace. 
Base set of shortcuts and utility functions.

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
	standardEventModel = 'addEventListener' in docRoot,
	querySelectorAll = 'querySelectorAll' in docRoot,
	functionLit = function () {},
	
	/**
	Browser detection
	*/	
	browser = function () {
		var ua = nav.userAgent, 
			activex = 'ActiveXObject' in win,
			xhr = 'XMLHttpRequest' in win,
			securityPolicy = 'securityPolicy' in nav,
			taintEnabled = 'taintEnabled' in nav,
			opera = /opera/i.test(ua),
			firefox = /firefox/i.test(ua),
			webkit = /webkit/i.test(ua),
			ie = activex ? ( querySelectorAll ? 8 : ( xhr ? 7 : 6 ) ) : NaN;
		 return {
			ie: ie,
			ie6: ie === 6,
			ie7: ie === 7,
			ie8: ie === 8,
			opera: opera,
			firefox: firefox || ( securityPolicy && !activex && !opera ),
			webkit: webkit || ( !taintEnabled && !activex && !opera ),
			safariMobile: /safari/i.test( ua ) && /mobile/i.test( ua ),
			chrome: webkit && /chrome/i.test( ua )
		 };
	}(),
	
	msie = browser.ie,
	
	/**
	Platform detection
	*/	
	platform = function () {
		var obj = {};
		obj[ ( /mac|win|linux/i.exec( nav.platform ) || [ 'unknown' ] )[0].toLowerCase() ] = true;
		return obj;
	}(),
	
	goodTypeDetection = !msie;
	
	
	
var	objToString = {}.toString,
	objTestString = '[object Object]',
	
	
	isDefined = function ( obj ) { 
		return typeof obj != 'undefined'; 
	},
	
	isUndefined = function ( obj ) { 
		return typeof obj == 'undefined'; 
	},
	
	isBoolean = function ( obj ) { 
		return typeof obj == 'boolean'; 
	},
	
	isString = function ( obj ) { 
		return typeof obj == 'string'; 
	},
	
	isNumber = function ( obj ) { 
		return typeof obj == 'number'; 
	},
	
	isInteger = function ( obj ) { 
		return isNumber( obj ) ? !( obj % 1 ) : false; 
	}, 
	
	isFloat = function ( obj ) { 
		return isNumber( obj ) ? !!( obj % 1 ) : false; 
	}, 
	
	/**
	Check if object is numeric; strings or numbers accepted
	*/
	isNumeric = function ( obj ) { 
		return isString( obj ) || isNumber( obj ) ? 
			/^\s*\d+\.?\d*?\s*$/.test( ( obj+'' ) ) : false; 
	},
	
	isObjectLike = function ( obj ) {
		return !!obj && typeof obj == 'object';
	},
	
	/**
	Check if object is an object literal
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
	
	isFunction = function ( obj ) { 
		// Opera can't handle a wrapped 'return typeof === "function"'
		return objToString.call( obj ) == '[object Function]'; 
	},
	
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
	
	isArray = function ( obj ) { 
		return Array.isArray( obj ); 
	},	
	
	/**
	Check for the existance of an object in an array
	*/
	inArray = function ( obj, arr ) { 
		return arr.indexOf( obj ) != -1; 
	},

	/**
	Convert enumerable object to an array
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
	*/
	empty = function ( arg ) {
		if ( isString( arg ) ) {
			return /^\s*$/.test( arg );
		}
		else if ( isArray( arg ) ) {
			return !arg.length;
		}
		else if ( isObjLiteral( arg ) ) {
			return !Object.keys( arg ).length;
		}
		return !arg;
	},
	
	/**
	Returns a function wrapper with negated return values, useful for <Array> filter 
	
	@example 
	' foo, 12.1 bar 101 '.split( ' ' ).map( parseFloat ).filter( negate( isNaN ) )
	>>> [ 12.1, 101 ]
	*/
	negate = function ( fn ) {
		return function () {
			return !fn.apply( this, arguments );
		}
	},	
	
	/**
	Returns function wrapper with optional preset arguments, useful for <Array> map 
	
	@example 
	' foo, bar '.split( ',' ).map( String.trim ).map( preset( String.split, '' ) )
	>>> [ ['f','o','o'], ['b','a','r'] ]
	*/
	preset = function () {
		var args = toArray( arguments ),
			fn = args.shift();
		return function ( item ) {
			return fn.apply( this, [ item ].concat( args ) );
		};
	},
		
	/**
	Extend objects with the option to not overwrite defined members
	*/
	extend = function ( a, b, overwrite ) {
		for ( var mem in b ) {
			if ( isUndefined( a[ mem ] ) || isDefined( a[ mem ] ) && overwrite !== false ) {
				a[ mem ] = b[ mem ];
			}
		}
		return a;
	},
	
	/**
	Generic iterator function; works for objects, arrays and nodelists
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
	/**
	console.log wrapper
	*/
	log = createLogger( 'log' ),
	/**
	console.warn wrapper
	*/
	logWarn = createLogger( 'warn' ),
	/**
	console.error wrapper
	*/
	logError = createLogger( 'error' );
		
extend( J, {
	win: win,
	doc: doc,
	docRoot: docRoot, 
	docHead: docHead,
	functionLit: functionLit,
	browser: browser,
	platform: platform,
	isDefined: isDefined,
	isUndefined: isUndefined,
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
	preset: preset,
	extend: extend,	
	each: each,
	defer: defer,
	log: log,
	logWarn: logWarn,
	logError: logError	
});
