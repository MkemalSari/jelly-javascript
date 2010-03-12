/**

XMLHttpRequest wrapper

*/
(function () {

var Class = defineClass( 'Request', {
		
		__init: function ( obj ) {
			extend( this, obj );
		},
		
		__static: {
			timeout: 15000	
		},
		
		noCache: true,
		async: true,
		cleanUp: true,
		requestHeaders: {},
		
		send: function ( method, request, callback ) {
			var self = this,
			file = request,
			data = null,
			method = method.toUpperCase(),
			xhr = self.xhr ? self.xhr : self.getXHR();
			if ( self.inProgress || !xhr ) {
				return false;
			}
			if ( method === 'POST' ) {
				var tmp = request.split('?');
				file = tmp[0];
				data = tmp[1];
				self.requestHeaders['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
				self.requestHeaders['Content-length'] = data.length;
			}
			if ( method === 'GET' && self.noCache ) {
				self.requestHeaders['If-Modifed-Since'] = 'Sat, 1 Jan 2000 00:00:00 GMT';
			}
			
			xhr.open( method, file, self.async );
			
			xhr.onreadystatechange = function () {
				if ( xhr.readyState === 4 ) {
					self.fire( 'complete', xhr );
					self.fire( 'stop', xhr );
					clearTimeout(self.timer);
					var status = xhr.status,
						// credit jQuery
						statusOk = !xhr.status && location.protocol == "file:" ||
							( xhr.status >= 200 && xhr.status < 300 ) || xhr.status == 304 || xhr.status == 1223;
					if ( statusOk ) {
						self.fire( 'success', xhr );
						if ( callback ) {
							callback.call( self, xhr );
						}
					}
					else {
						self.fire( 'fail', xhr );
					}
					if ( self.cleanUp ) {
						self.xhr = null;
					}
					self.inProgress = false;
				}
			};
						
			for ( var key in self.requestHeaders ) {
				xhr.setRequestHeader( key, self.requestHeaders[ key ] );
			}
			xhr.setRequestHeader( 'X-Requested-With', 'XMLHttpRequest' );
			
			self.fire( 'start', xhr );
			self.timer = setTimeout( function () {
				xhr.abort();
				self.fire( 'timeout', xhr );               
				self.fire( 'stop', xhr );
				self.inProgress = false;
			}, self.timeout || Class.timeout );
			
			self.inProgress = true;
			xhr.send( data );
			self.fire( 'request', xhr );
			return true;
		},
		
		post: function ( file, data, callback ) {
			return this.send( 'post', file + '?' + ( data || 'empty' ), callback );
		},
		
		get: function ( request, callback ) {
			return this.send( 'get', request, callback );
		},
		
		getXHR: function () {
			if ( 'XMLHttpRequest' in win ) {
				return function () {
					return new XMLHttpRequest();
				};
			}
			return function () {
				var xhr = false;
				try { xhr = new ActiveXObject('Msxml2.XMLHTTP'); } catch (ex) {
					try { xhr = new ActiveXObject('Microsoft.XMLHTTP'); } catch (ex) {} 
				}
				return xhr;
			};
		}()
		
	});
	
})();