
/**

Utility functions for working with strings

*/
var	contains = function ( haystack, needle, caseInsensitive ) {
		if ( caseInsensitive ) {
			haystack = haystack.toLowerCase();
			needle = needle.toLowerCase();			
		}
		return haystack.indexOf( needle ) !== -1;
	},
	
	startsWith = function ( str, find ) {
		return str.indexOf( find ) === 0;
	},
	
	endsWith = function ( str, find ) {
		return str.indexOf( find ) === str.length - find.length;
	},
		
	normalize = function ( str ) {
		return str.replace( /\s{2,}/g, ' ' ).trim();
	},
	
	capitalize = function ( str, firstWord ) {
		return str.replace( firstWord ? /^\s*[a-z]/ : /(^|\s+)[a-z]/g, function ( m ) {
			return m.toUpperCase();
		});
	},
	
	camelize = function ( str ) {
		return str.replace( /-([a-z])/g, function ( m, m1 ) {
			return m1.toUpperCase();
		});
	}, 

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
	
	// http://dean.edwards.name/weblog/2009/10/convert-any-colour-value-to-hex-in-msie/
	msieToHex = function ( color ) {
		var body  = msieToHex.popup = msieToHex.popup || win.createPopup().document.body
			range = body.createTextRange();
		body.style.color = color;
		var value = range.queryCommandValue( 'ForeColor' );
		value = ( ( value & 0x0000ff ) << 16 ) | ( value & 0x00ff00 ) | ( ( value & 0xff0000 ) >>> 16 );
		value = value.toString( 16);
		return "#000000".slice( 0, 7 - value.length ) + value;
	},
	
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
	
	stripTags = function ( str, allow ) {
		if ( !allow ) { 
			return str.replace( /<[^>]*>/g, '' ); 
		} 
		allow = allow.replace( /\s+/g, '' ).split( ',' ).map( function ( s ) {
			return s +' |'+ s +'>|/'+ s +'>';   
		}).join( '|' );
		return str.replace( new RegExp( '<(?!'+ allow +')[^>]+>', 'g' ), '' );
	},
	
	bindData = function ( str, data ) {
		var m;
		while ( m = /%\{\s*([^\}\s]+)\s*\}/.exec( str ) ) {
			str = str.replace( m[0], data[ m[1] ] || '??' );
		}
		return str;
	},
	
	evalScripts = function ( str ) {
		var wrapper = createElement( 'div', { html: str } ), 
			res = [];
		toArray( getElements( wrapper, 'script' ) ).each( function ( el ) {
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
	stripTags: stripTags,
	bindData: bindData,
	evalScripts: evalScripts
});
