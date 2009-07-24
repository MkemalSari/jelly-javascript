/**

Dialog

@location plugins
@description 

*/

J.Dialog = {
	
	// Default values
	top: 40,
	width: 600,
	draggable: false,
	
	// For speeding up initial rendering
	cacheAssets: function (args) {
		args = isArray(args) ? args : toArray(arguments);
		this._cache = this._cache || [];
		for (var i = 0; i < args.length; i++) {
			var img = new Image();
			img.src = args[i];
			this._cache.push(img);
		}
	},
	
	// Hack for IE6 only: prevents select boxes from punching through the display
	iFrameShim: J.createElement('iframe#iframe-dialog-shim frameBorder:0, scrolling:no'),
	
	setTop: function (y, unit) {
		y = this.top = y || this.top;
		this.container.style.top = y + (unit || 'px'); 
		return this;
	},
	setWidth: function (w) {
		w = this._width = w || this.width;
		this.body.style.width = w + 'px'; 
		this.handle.style.width = (w - 54) + 'px';
		return this;
	},
	setContent: function (title, content) {
		if (content) { content = '<h2>' + title + '</h2>' + content; } 
		this.content.innerHTML = content || title || 'No content supplied';
		return this;
	},
	open: function (w) {
		if ( this.visible ) { return; } 
		this.setWidth(w);
		J.insertElement( this.overlay );
		if ( browser.ie6 ) { 
			J.insertElement( this.iFrameShim ); 
		}
		J.insertElement( this.container );
		this.container.style.top = this.top + J.getWindowScroll()[1] + 'px';
		this.visible = true;
	},

	close: function () {
		if (! this.visible ) { return; } 
		J.removeElement( this.overlay );
		if ( browser.ie6 ) { 
			J.removeElement( this.iFrameShim ); 
		}		
		J.removeElement( this.container ); 
		this.container.style.position = '';
		this.body.style.position = '';
		this.visible = false;
	},
	
	// Initializer
	init: function () {
		if (this.ready) { return; }
		var c = J.createElement,
			branch = J.createBranch,
			self = this,
			top = branch(
				'span.dialog-top',
					['span.dialog-top-1', 
					 'span.dialog-top-2']
				),
			btm = branch(
				'span.dialog-btm',
					['span.dialog-btm-1', 
					 'span.dialog-btm-2']
				),
			centre = branch(
				'.dialog-trim-1',
					['span.dialog-left', 
					 'div.dialog-trim-2']
				),
			wrap = branch(
				'.dialog-container',
					'.dialog-body'
				),
			centreDiv = self.centreDiv = centre.div[1]; 
			
		self.content = centreDiv.appendChild(c('div', {'class':'dialog-content', setText:'#'}));
		self.handle = centreDiv.appendChild(c('span', {'class':'dialog-handle'}));
		self.btn_close = centreDiv.appendChild(c('a', {
			'class':'dialog-close', 
			'href':'javascript:;', 
			setText: 'Close', 
			'title':'You can also press escape key to close' }));		
		
		wrap.div[1].appendChild(top.root);
		wrap.div[1].appendChild(centre.root);
		wrap.div[1].appendChild(btm.root);
		
		self.overlay = c('div', {'class': 'dialog-screen'});
		self.container = wrap.root;
		self.body = wrap.div[1];
	
		J.addEvent( self.btn_close, 'click', self.close.bind(self) );
		J.addEvent( doc, 'keypress', function (e) {
			if (e.keyCode && e.keyCode === 27 && self.visible) { self.close(); } 
		});
		
		if (arguments.length) { self.cacheAssets( toArray(arguments) ); } 
		self.tween = new J.Tween(self.container, {duration:100});
		
		var trace = function (msg) { if (0) { J.trace(msg); } },
			cancelDrag = function () {
				trace('cancel');
				trace('-------------------------');
				[self.onMouseMove, self.onMouseOut].each( J.removeEvent );
				self.container.style.cursor = '';
				dragStarted = false;
			},
			dragStarted = false;
		
		self.onMouseDown = J.addEvent( self.handle, 'mousedown', function (e) {
				trace('mousedown');
				if ( dragStarted ) { 
					cancelDrag(); 
					return;
				}
				e = J.stopEvent(e);
				var viewport = J.getViewport(),
					boundTolerence = [10, 25, 10, 10],
					dims,
					offsetX,
					offsetY,
					startX,
					startY,
					positionDialog = function (e) {
						J.setXY( self.body, e.pageX - offsetX, e.pageY - offsetY);
					};
								
				self.onMouseMove = J.addEvent( document, 'mousemove', function (e) {
					e = J.stopEvent(e);
					var bounds = {
						yMin: !(e.clientY < boundTolerence[0]),
						xMax: !(e.clientX > (viewport[0] - boundTolerence[1])),
						yMax: !(e.clientY > (viewport[1] - boundTolerence[2])),
						xMin: !(e.clientX < boundTolerence[3])
					};
					inbounds = bounds.xMin && bounds.xMax && bounds.yMin && bounds.yMax;
					if ( !inbounds ) {
						cancelDrag();
						var left = parseInt(self.body.style.left, 10);
						var top = parseInt(self.body.style.top, 10);
						if (!bounds.xMin) { self.body.style.left = (left+20) + 'px'; }
						if (!bounds.xMax) { self.body.style.left = (left-20) + 'px'; }
						if (!bounds.yMin) { self.body.style.top = (top+20) + 'px'; }
						if (!bounds.yMax) { self.body.style.top = (top-20) + 'px'; }
					} else if ( dragStarted ) {
						positionDialog(e);
					} else {
						trace('drag start');
						dragStarted = true;
						dims = J.getXY( self.body );
						containerDims = J.getXY( self.container );
						self.container.style.position = 'static';
						self.container.style.cursor = 'move';
						self.body.style.position = 'absolute';
						offsetX = e.pageX - dims[0];
						offsetY = e.pageY - dims[1];
						positionDialog(e);
					} 
				});
			});
		self.onMouseUp = J.addEvent( self.handle, 'mouseup', function () {
			trace('mouseup');
			cancelDrag();
		});
		
		self.ready = true;
		return this;
	}
};