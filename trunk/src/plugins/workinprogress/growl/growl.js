/**

Growl

@location plugin
@description 

*/

(function () {

	J.Growl = {
		showtime: 3000,
		setMessage: function (message) {
			this.container.innerHTML = this.message = message;
			return this;
		},
		queue: [],
		filterQueue: function () {
			var uniques = [];
			this.queue.each(function (o) {
				var flag = true;
				uniques.each(function (j) {	if (o === j) { flag = false; } });
				if (flag) {
					uniques.push(o);	
				} 
			}); 
			this.queue = uniques;
		},
		show: function (message) {
			if (this.visible) {
				// Stop multiple repeat messages
				if (message !== this.message) { this.queue.push(message); }
				this.filterQueue();
				return;
			} 
			this.setMessage(message);
			this.tween.setOpacity(0);
			if (!this.available) { 
				J.insertElement( this.container ); 
				this.available = true; 
			};		
			var that = this;
			
			// A micro delay while DOM gets aquainted with new node
			setTimeout( 
				function () { 
					that.tween.onComplete = function () {};
					that.tween.start('opacity', 1); 
				}, 10);
			this.timer = setTimeout( 
				function () { 
					that.tween.onComplete = function () { that.close();	};
					that.tween.start('opacity', 0); 
				}, this.showtime);
			this.visible = true;
		},
		close: function () {
			this.tween.stop().setOpacity(0);
			clearTimeout(this.timer);
			this.visible = false;
			if (this.queue.length > 0) {
				this.show( this.queue.pop() );
			} else {
				J.removeElement( this.container );
				this.available = false;
			}
		},
		init: function () {
			if (this.ready) { return; }
			var c = J.createElement;
			var branch = J.createBranch;
			this.container = c('div', {'id': 'growl-box'});
			J.addEvent( this.container, 'click', this.close.bind(this) );
			var that = this;
			this.ready = true;
			this.tween = new J.Tween(this.container, {duration:500});
			return this;
		}
	};

})(); 