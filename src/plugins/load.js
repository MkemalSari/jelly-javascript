/**

Singleton for managing the loading of assets: scripts, stylesheets and images
	
*/
(function () {

var self = J.Load = {

	cache: {},
	
	js: function ( path, callback, opts ) {
		if ( self.cache[path] ) {
			return self.cache[path];
		}
		var attrs = extend( { type: 'text/javascript' }, opts || {} ),
			el = createElement( 'script', attrs ),
			onload = function () {
				self.cache[path] = el;
				if ( callback ) {
					defer( callback, el, el );
				}
			}, 
			onerror = function ( ex ) {
				logError( ex, ': "' + path + '"');
			};
		try {			
			if ( el.readyState ) {  
				el.onreadystatechange = function () {
					if ( /^(loaded|complete)$/.test( el.readyState ) ) {
						el.onreadystatechange = null;
						onload();
					}
				};
			} 
			else {  
				el.onload = onload;
				el.onerror = onerror;
			}
			el.src = path;
			insertElement( el, docHead );
			return el;
		} 
		catch ( ex ) {
			logError( ex );
		}
	},
	
	// No callbacks or error reporting is possible when loading css
	css: function ( path, opts ) {
		if ( self.cache[path] ) {
			return self.cache[path];
		}
		var attrs = extend( { type: 'text/css', media: 'screen', rel: 'stylesheet' }, opts || {} ),
			link = createElement( 'link', attrs );
		link.href = path;
		self.cache[path] = link;
		insertElement( link, docHead );
		return link;
	},
	
	img: function ( path, callback, opts ) {
		callback = callback || functionLit;
		var cached = self.cache[path];
		if ( cached ) {
			callback.call( cached, cached );
			return cached;
		}
		var img = createElement( 'img', opts || {} ),
			onload = function () {
				self.cache[path] = img;
				callback.call( img, img );
			},
			onerror = function (e) {
				logWarn( capitalize( e.type ) + ' loading image: "' + path + '"' );
			};
		img.onload = onload;
		img.onerror = img.onabort = onerror;
		img.src = path;
		return img;
	},
	
	purge: function ( path ) {
		var obj = self.cache[path];
		if ( !obj ) {
			return;
		}
		if ( docRoot.contains( obj ) ) {
			removeElement( obj );
		}
		obj.onload = obj.onerror = obj.onabort = null;
		delete self.cache[path];
	}
	
};
	
})();

var Load = J.Load;
