/**

Flash

@description 
	Utility functions for working with flash objects

*/

extend( J, {
	
	getFlashVersion: function () {
		var version = { major: 0, build: 0 },
			plugins = navigator.plugins,
			desc,
			versionString,
			testString = 'Shockwave Flash';
		if ( plugins && isObject( plugins[ testString ] ) ) {
			desc = plugins[ testString ].description;
			if ( desc !== null ) {
				versionString = desc.replace( /^[^\d]+/, '' );
				version.major = parseInt( versionString.replace( /^(.*)\..*$/, '$1' ), 10 );
				version.build = parseInt( versionString.replace( /^.*r(.*)$/, '$1' ), 10 );
			}
		} 
		else if ( msie ) {
			try {
				var axflash = new ActiveXObject( 'ShockwaveFlash.ShockwaveFlash' );
				desc = axflash.GetVariable( '$version' );
				if ( desc !== null ) {
					versionString = desc.replace( /^\S+\s+(.*)$/, '$1' ).split(',');
					version.major = parseInt( versionString[0], 10 );
					version.build = parseInt( versionString[2], 10 );
				}
			} catch (ex) {}
		}
		return version;
	},
	
	createFlashObject: function ( obj ) {
		var path = obj.path || '',
			width = obj.width || 1,
			height = obj.height || 1,
			params = obj.params || {},
			vars = obj.flashvars || {},
			attrs = obj.attributes || {},
			fallback = obj.fallback || 
				'You need <a href="http://www.adobe.com/go/getflashplayer">Adobe Flash Player</a> installed to view this content</a>',
			data = [],
			key,
			out = '<object';
		if ( msie ) {
			attrs.classid = 'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000';
			params.movie = path;
		} 
		else {
			attrs.data = path;
			attrs.type = 'application/x-shockwave-flash';
		}
		attrs.width = width;
		attrs.height = height;
		for ( key in attrs ) { 
			out += ' ' + key + '="' + attrs[ key ] + '"'; 
		}
		out += '>\n';
		for ( key in vars ) { 
			data.push( key + '=' + encodeURIComponent( vars[ key ] ) ); 
		}
		if ( data.length > 0 ) { 
			params.flashvars = data.join('&'); 
		} 
		for ( key in params ) { 
			out += '\t<param name="' + key + '" value="' + params[ key ] + '" />\n'; 
		}
		return out + fallback + '\n</object>';
	},
	
	embedFlashObject: function ( el, obj ) {
		el = getElement( el );
		el.innerHTML = J.createFlashObject( obj );
		return el;
	}
	
});