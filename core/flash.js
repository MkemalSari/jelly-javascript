/**

Flash

@location core
@description helper functions for working with flash objects

*/

extend( J, {
	
	getFlashVersion: function () {
		var ver = { major: 0, build: 0 },
			plugins = navigator.plugins,
			desc,
			versionString;
		if ( plugins && isObject( plugins['Shockwave Flash'] ) ) {
			desc = plugins['Shockwave Flash'].description;
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
	
	createFlashObject: function ( path, width, height, fallback, params, vars, attributes ) {
		var params = params || {};
			vars = vars || {},
			attrs = attributes || {},
			fallback = fallback || 'You need <a href="http://www.adobe.com/go/getflashplayer">Adobe Flash Player</a> installed to view this content</a>',
			data = [],
			key,
			output = '<object';
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
			output += ' ' + i + '="' + attr[i] + '"'; 
		}
		output += '>\n';
		for ( key in vars ) { 
			data.push( key + '=' + encodeURIComponent( vars[key] ) ); 
		}
		if ( data.length > 0 ) { 
			params.flashvars = data.join('&'); 
		} 
		for ( key in params ) { 
			output += '\t<param name="' + key + '" value="' + params[key] + '" />\n'; 
		}
		return output + fallback + '\n</object>';
	},
	
	embedFlashObject: function ( el, path, width, height, params, vars, attributes ) {
		el = getElement(el);
		el.innerHTML = J.createFlashObject( 
			path, width, height, el.innerHTML, params || {}, vars || {}, attributes || {} );
	}
	
});