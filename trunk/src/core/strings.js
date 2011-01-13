/**
 Check for a substring within a string
 
 @param {string} haystack
 @param {string} needle
 @param {bool} [caseInsensitive|false]
 @return {bool}
 */
var contains = function ( haystack, needle, caseInsensitive ) {
		if ( caseInsensitive ) {
			haystack = haystack.toLowerCase();
			needle = needle.toLowerCase();
		}
		return haystack.indexOf( needle ) !== -1;
	},
	
	/**
	 Check a string for a prefix
	 @param {string} string
	 @param {string} prefix
	 @return {bool}
	 */
	startsWith = function ( str, prefix ) {
		return str.indexOf( prefix ) === 0;
	},

	/**
	 Check a string for a suffix
	 @param {string} string
	 @param {string} suffix
	 @return {bool}
	 */	
	endsWith = function ( str, suffix ) {
		return str.indexOf( suffix ) === str.length - suffix.length;
	},
	
	/**
	 Remove double spaces and trim
	 @param {string} string
	 @return {string}
	 */	
	normalize = function ( str ) {
		return str.replace( /\s{2,}/g, ' ' ).trim();
	},
	
	/**
	 Make string title case
	 @param {string} string
	 @param {string} [first|false] Optionally capitalize only the first word
	 @return {string}
	 */
	capitalize = function ( str, first ) {
		return str.replace( first ? /^\s*[a-z]/ : /(^|\s+)[a-z]/g, function ( m ) {
			return m.toUpperCase();
		});
	},
	
	/**
	 Make string camelCase
	 @param {string} string
	 @return {string}
	 */
	camelize = function ( str ) {
		return str.replace( /-([a-z])/g, function ( m, m1 ) {
			return m1.toUpperCase();
		});
	}, 

	/**
	 Convert CSS rgb to CSS hex
	 @param {string} string
	 @return {string} Color in hex notation
	 */
	rgbToHex = function ( str ) {
		var rgb = str.match( /[\d]{1,3}/g ), 
			hex = [], 
			i = 0;
		for ( i; i < 3; i++ ) {
			var bit = ( rgb[i]-0 ).toString( 16 );
			hex.push( bit.length === 1 ? '0' + bit : bit );
		}
		return '#' + hex.join('');
	},
	
	/**
	 Convert CSS hex to CSS rgb
	 @param {string} string
	 @param {bool|false} returnRgbArray 
	 @return {mixed} Hex notation or RGB array 
	 */
	hexToRgb = function ( str, array ) {
		var hex = str.match( /^#([\w]{1,2})([\w]{1,2})([\w]{1,2})$/ ), 
			rgb = [], 
			i = 1;
		for ( i; i < hex.length; i++ ) {
			if ( hex[i].length === 1 ) { 
				hex[i] += hex[i]; 
			}
			rgb.push( parseInt( hex[i], 16 ) );
		}
		return array ? rgb : 'rgb(' + rgb.join(',') + ')';
	},
	
	/**
	 Convert any keyword color value to hex in Internet Explorer
	
	 @reference http://dean.edwards.name/weblog/2009/10/convert-any-colour-value-to-hex-in-msie/
	 @param {string} colorValue Keyword color value
	 @return {string} Color in hex notation
	 */
	msieToHex = function ( color ) {
		var body  = msieToHex.popup = msieToHex.popup || win.createPopup().document.body
			range = body.createTextRange();
		body.style.color = color;
		var value = range.queryCommandValue( 'ForeColor' );
		value = ( ( value & 0x0000ff ) << 16 ) | ( value & 0x00ff00 ) | ( ( value & 0xff0000 ) >>> 16 );
		value = value.toString( 16);
		return "#000000".slice( 0, 7 - value.length ) + value;
	},
	
	/**
	 Parse a color value or keyword into different color value format
	
	 @param {string} string
	 @param {string} [mode](hex,rgb*,rgb-array) The format of returned color value
	 @return {mixed}
	 */
	parseColor = function ( str, mode ) {
		mode = mode || 'rgb';
		var hex = startsWith( str, '#' ); 
		if ( !hex ) {
			if ( msie ) {
				str = msieToHex( str );
				hex = true;
			}
			else if ( !startsWith( str, 'rgb' ) ) {
				var test = createElement( 't style:"display:none;color:' + str );
				insertElement( test );
				str = getStyle( test, 'color' );
				removeElement( test );
				hex = startsWith( str, '#' );
			}
		} 
		switch ( mode ) {
			case 'hex':	
				return hex ? str : rgbToHex( str );
			case 'rgb': 
				return hex ? hexToRgb( str ) : str;
			case 'rgb-array': 
				if ( hex ) { 
					return hexToRgb( str, true ); 
				} 
				else {
					return str.replace( /rgb| |\(|\)/g, '' ).split( ',' ).map( parseFloat );
				}
		}
	},
	
	// stripTags = function ( str, allow ) {
	// 	if ( !allow ) { 
	// 		return str.replace( /<[^>]*>/g, '' ); 
	// 	} 
	// 	allow = allow.replace( /\s+/g, '' ).split( ',' ).map( function ( s ) {
	// 		return s +' |'+ s +'>|/'+ s +'>';   
	// 	}).join( '|' );
	// 	return str.replace( new RegExp( '<(?!'+ allow +')[^>]+>', 'g' ), '' );
	// },
	
	/**
	 String formatting
	
	 @param {string} string
	 @param {object} data Replacements object
	 @return {string} The formatted string
	 */
	formatString = function ( str, data ) {
		var m;
		while ( m = /%\{\s*([^\}\s]+)\s*\}/.exec( str ) ) {
			str = str.replace( m[0], data[ m[1] ] || '??' );
		}
		return str;
	},
	
	/**
	 Parse a string for quoted string literals
	
	 @param {string} string
	 @param {string} [prefix] Prefix for literal placeholders
	 @return {object} See example
	 @example
	     var extract = extractLiterals( 'Hello World, "quoted string" foobar "another quoted string"' )
		 // {
		 // 	literals: { 
		 // 		_LIT1_: 'quoted string',
		 // 		_LIT2_: 'another quoted string'
		 // 	}
		 //     string: 'Hello World, _LIT1_, foobar _LIT2_',
		 //     prefix: 'LIT'
		 // }
	*/
	extractLiterals = function ( str, prefix ) {
		var literals = {}, 
			prefix = prefix || 'LIT',
			counter = 0,
			label,
			m; 
		while ( m = /('|")(?:\\1|[^\1])*?\1/.exec( str ) ) {	
			label = '_' + prefix + ( ++counter ) + '_';
			literals[ label ] = m[0].substring( 1, m[0].length-1 );
			str = str.substring( 0, m.index ) + label + str.substring( m.index + m[0].length );
		}
		return {
			string: str,
			literals: literals,
			prefix: prefix,
			match: function ( test ) {
				return ( test in literals ) ? literals[ test ] : test;
			}
		};
	},
	
	/**
	 Evalute script tags within HTML strings
	
	 @param {string} The HTML string 
	 @return {mixed}
	 */
	evalScripts = function ( str ) {
		var wrapper = createElement( 'div', { html: str } ), 
			res = [];
		toArray( getElements( 'script', wrapper ) ).each( function ( el ) {
			res.push( win[ 'eval' ]( el.innerHTML ) );
		});
		return res;
	};
	
extend( J, { 
	contains: contains,
	startsWith: startsWith,
	endsWith: endsWith,
	normalize: normalize,
	capitalize: capitalize,
	camelize: camelize,
	parseColor: parseColor,
	//stripTags: stripTags,
	formatString: formatString,
	extractLiterals: extractLiterals,
	evalScripts: evalScripts
});
