/**

Profiler

@description 
	A simple profiling utility

*/

(function () {

var self = J.Profiler = {
	
	container: function () {
		var elem = doc.createElement( 'div' );
		elem.style.cssText = [
				'position: ' + ( !browser.ie ? 'fixed' : 'absolute' ),
				'font: bold 17px arial, sans-serif',
				'max-height: 200px',
				'text-align: center',
				'overflow: auto',
				'background: #000',
				'border: 1px solid #fff',
				'border-width: 0 0 1px 1px',
				'top: 0',
				'left: 0',
				'color: #fff' 
			].join(';');
		return elem;
	}(),
	
	startTime: 0,
	
	start: function ( label ) {
		self.label = label ? '<span style="font-size:12px;font-weight:normal;\
			color:#ccc;display:block;padding:0 0 3px;">' + 
			label + '</span>' : '';
		self.active = true;
		self.startTime = (+new Date);
	},
	
	stop: function () {
		var result = (+new Date) - self.startTime; 
		if ( !self.active ) {
			result = 'n/a';
		}
		self.active = false;
		return self.reveal( result );
	},
	
	reveal: function ( result ) {
		if ( !self.container.parentNode ) {
			try {
				doc.body.appendChild( self.container );
			} 
			catch ( ex ) {
				if ( !self.loadHandler ) {
					self.loadHandler = addDomReady( function () {
						insertElement( self.container );
					});
				}
			}
		}
		self.container.innerHTML += 
			'<span style="padding:10px 20px;display:block;border-bottom:1px solid #333;">' + 
			self.label + 
			result + 
			'</span>';
		return self;
	},
	
	clear: function () {
		if ( self.container.parentNode ) {
			self.container.innerHTML = '';
		}
		return self;
	}
	
};

})();