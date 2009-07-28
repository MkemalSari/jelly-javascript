/**

IELogger

@description 
	A means to finding bugs in internet explorer

*/

(function () {

var self = J['IELogger'] = {

	enabled: false,

	enable: function () {
		self.enabled = true;
		return self;
	},
	
	disable: function () {
		self.enabled = false;
		return self;
	},
	
	container: function () {
		if ( !msie ) { return; }
		var elem = createElement( 'div' );
		elem.style.cssText = [
				'position:' + ( browser.ie6 ? 'absolute' : 'fixed' ),
				'overflow: auto',
				'width: 100%',
				'height: 150px',
				'background: #000',
				'filter: alpha(opacity=90)',
				'border-top: 1px solid #fff',
				'bottom: 0',
				'left: 0',
				'color: #fff' 
			].join(';');
		return elem;
	}(),
	
	log: function () {
		if ( !msie ) { 
			log.apply( {}, toArray( arguments ) );
			return; 
		}
		var SOL = '<span style="' + [
				'display: block',
				'border-bottom: 1px solid #333',
				'padding: 5px 8px 2px',
				'font:  11px consolas, "courier new", monospace',
				].join(';') + 
				'">',
			EOL = '</span>',
			args = toArray( arguments ).map( function ( arg ) {
					var tmpl = '<%{tag} style="color:%{color};">%{value}</%{tag}>',
						obj = { tag: 'span', color: '#fff', value: arg };
					if ( isArray( arg ) ) {
						obj.value = '[' + arg.join(', ') + ']';
					}
					else if ( isNumber( arg ) ) {
						obj.color = 'orange';
					}
					else if ( isObject( arg ) ) {
						obj = { value: 'Object', color: 'green', tag: 'b' };
					} 
					return bindData( tmpl, obj );
				});

		self.container.innerHTML += SOL + ( args.length < 2 ? args[0] : args.join(' ') ) + EOL;
	},
	
	show: function () {
		if ( !msie ) { return; }
		if ( self.enabled && !doc.body.contains( self.container ) ) {
			insertElement( self.container );
		}	
	},
	
	init: function () {
		if ( !msie ) { return; }
		addEvent( window, 'load', self.show );	
	}

};

self.init();

})();