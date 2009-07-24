/**

Strings

@location core
@description 

*/

extend( J, { 
	
	normalize: function ( str ) {
		return str.replace( /\s{2,}/g, ' ' ).trim();
	},
	
	toCamelCase: function ( str ) {
		return str.replace( /-\D/gi, function (m) {
			return m.charAt( m.length - 1 ).toUpperCase();
		});
	}, 
	
	toCssCase: function ( str ) {
		return str.replace( /([A-Z])/g, '-$1' ).toLowerCase();
	}, 
	
	rgbToHex: function ( str ) {
		var rgb = str.match( /[\d]{1,3}/g ), hex = [], i;
		for ( i = 0; i < 3; i++ ) {
			var bit = ( rgb[i]-0 ).toString( 16 );
			hex.push( bit.length === 1 ? '0'+bit : bit );
		}
		return '#' + hex.join('');
	},
	
	hexToRgb: function ( str, array ) {
		var hex = str.match( /^#([\w]{1,2})([\w]{1,2})([\w]{1,2})$/ ), rgb = [], i;
		for ( i = 1; i < hex.length; i++ ) {
			if ( hex[i].length === 1 ) { 
				hex[i] += hex[i]; 
			}
			rgb.push( parseInt( hex[i], 16 ) );
		}
		return array ? rgb : 'rgb(' + rgb.join(',') + ')';
	},
	
	parseColour: function ( str, mode ) {
		var rgbToHex = J.rgbToHex,
			hexToRgb = J.hexToRgb,
			hex = /^#/.test(str), 
			tempArray = [], temp;
		switch (mode) {
			case 'hex':	return hex ? str : rgbToHex(str);
			case 'rgb': return hex ? hexToRgb(str) : str;
			case 'rgb-array': 
				if ( hex ) { 
					return hexToRgb( str, true ); 
				} 
				else {
					temp = str.replace( /rgb| |\(|\)/g, '' ).split(',');
					temp.each( function ( item ) { 
						tempArray.push( parseInt(item, 10) ); 
					});
					return tempArray;
				}
		}
	},
	
	stripTags: function ( str, allow ) {
		if ( !allow ) { 
			return str.replace( /<[^>]*>/g, '' ); 
		} 
		allow = allow.replace( /\s+/g, '' ).split(',').map( function (s) {
			return s +' |'+ s +'>|/'+ s +'>';   
		}).join('|');
		return str.replace( new RegExp( '<(?!'+ allow +')[^>]+>', 'g' ), '' );
	},
	
	bindData: function ( str, data ) {
		var m;
		while ( m = /%\{\s*([^\}\s]+)\s*\}/.exec(str) ) {
			str = str.replace( m[0], data[m[1]] || '??' );
		}
		return str;
	},
	
	evalScripts: function ( str ) {
		var c = createElement( 'div', {setHTML: str} ), 
			res = [];
		toArray( c.getElementsByTagName('script') ).each( function (el) {
			res.push( win['eval'](el.innerHTML) );
		});
		return res;
	}
	
});