/**

Utility functions for working with cookies

*/
extend( J, { 
	
	getCookie: function ( name ) {
		var result = new RegExp( name + '=([^; ]+)' ).exec( doc.cookie );
		return result ? unescape( result[1] ) : null;
	},
	
	setCookie: function ( name, value, expires, path, domain, secure ) {
		if ( expires ) {
			var expireTime = ( +new Date ) + ( ( 1000*60*60*24 ) * expires );
			expires = new Date( expireTime ).toUTCString();
		}
		doc.cookie = name + '=' + escape( value ) +
			( expires ? ';expires=' + expires : '' ) + 
			( path ? ';path=' + path : '' ) +
			( domain ? ';domain=' + domain : '' ) +	
			( secure ? ';secure' : '' );
	},
	
	removeCookie: function ( name, path, domain ) {
		if ( J.getCookie( name ) ) {
			doc.cookie = name + '=' +
				( path ? ';path=' + path : '' ) +
				( domain ? ';domain=' + domain : '' ) +	
				( ';expires=' + new Date(0) );
		}
	}
	
});