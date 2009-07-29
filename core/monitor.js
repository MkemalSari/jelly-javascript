/**

Monitor

@description 
	A means to finding bugs when no decent console API is available

*/

(function () {

var self = J.Monitor = {

	lines: 0,
	logLimit: 150,
	
	container: function () {
		var elem = doc.createElement( 'div' );
		elem.style.cssText = [
				'font: 11px consolas, "courier new", monospace',
				'position: ' + ( !browser.ie ? 'fixed' : 'absolute' ),
				'overflow: auto',
				'width: 300px',
				'height: 150px',
				'background: #000',
				'border: 1px solid #fff',
				'border-width: 0 0 1px 1px',
				'top: 0',
				'right: 0',
				'color: #fff' 
			].join(';');
		return elem;
	}(),
	
	enable: function () {
		if ( !self.loadHandler ) {
			self.loadHandler = addDomReady ( function () {
				insertElement( self.container );
			});
		} 
		return self;
	},
	
	log: function () {
		if ( self.cancel ) { return; }
		var printLine = function ( msg ) {
				self.container.innerHTML += 
					'<span style="' + [
					'display: block',
					'border-bottom: 1px solid #333',
					'padding: 5px 8px 2px',
					].join(';') + 
					'">' + 
					msg + 
					'</span>';
			},
			styler = function ( obj ) {
				var format = { tag: 'b', color: '#fff', value: obj+'' },
					tmpl = '<%{tag} style="color:%{color};">%{value}</%{tag}>';
				if ( isNumber( obj ) ) {
					format.color = 'orange';
				}
				else if ( isObject( obj ) ) {
					format = { color: 'lime', value: 'Object' };
				}
				else if ( isElement( obj ) ) {
					format.color = 'hotpink';
					format.value = obj.nodeName + ' ' + obj;
				} 
				else if ( isNodeList( obj ) ) {
					format.color = 'tomato';
					format.value = 'NodeList ' + obj;
				}
				else if ( isFunction( obj ) ) {
					format.color = 'yellow';
				}
				return bindData( tmpl, format );	
			},
			args = toArray( arguments ).map( function ( arg ) {
				if ( isArray( arg ) ) {
					return '[' + arg.map( styler ).join(', ') + ']';
				}
				return styler( arg );
			});
				
		if ( self.lines++ < self.logLimit ) {
			printLine( args.length < 2 ? args[0] : args.join(' ') ); 
		}
		else {
			self.cancel = true;
			printLine( 'Log limit reached' );
		}
	}
};

})();