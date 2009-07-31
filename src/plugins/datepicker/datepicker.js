/**

Datepicker

@description 
	Simple datepicker

*/

(function () {

var Class = defineClass( 'DatePicker', {
		
		__init: function ( inputId, opts ) {
			var self = this,
				cssPrefix =  '.' + ( opts.cssPrefix || Class.cssPrefix ),
				branch = createBranch(
					cssPrefix,
						cssPrefix + '-trim',
						[cssPrefix + '-title',
						 cssPrefix + '-back title:"Previous Month", setHTML:&laquo;', 
						 cssPrefix + '-next title:"Next Month", setHTML:&raquo;', 
						 cssPrefix + '.j-cal-table']
				);
			self.root = branch.root;
			self.table = branch.div[5];
			self.next = branch.div[4];
			self.back = branch.div[3];
			self.title = branch.div[2];
			self.calendar = branch.div[0];
			self.btn_close = self.calendar.appendChild( 
				createElement( cssPrefix + '-close setHTML:"x Close"' ) );
			self.visible = false;
			self.input = getElement( inputId );
			
			self.DATE_SEP = '-';
			self.DATE_FORMAT = 'uk';
			var m, dateValue = self.input.value.trim();
			if ( m = /\d{2,}([^\d])\d{2,}([^\d])\d{2,}/.exec( dateValue ) ) {
				self.DATE_SEP = m[1];
			}
			if ( m = /\d{4}[^\d]\d{2}[^\d]\d{2}/.exec( dateValue ) ) {
				self.DATE_FORMAT = 'int';
			}
			else if ( m = /\d{2}[^\d](\d{2})[^\d]\d{4}/.exec( dateValue ) ) {
				if ( m[1] > 12 ) {
					self.DATE_FORMAT = 'usa';
				}
			}
			
			extend( self, opts );
			self.offset = opts.offset || [0,0];
			
			self.btn_open = createElement('img' + cssPrefix + '-open src:assets/images/calendar.png,' + 					'alt:"Select start week", title:"Select start week"')
					
			insertAfter( self.btn_open, self.input );

			self.btn_open.onmousedown = function (e) {
				var xy = getXY( this );
				self.calendar.style.position = "absolute";
				setXY( self.calendar, xy[0]+self.offset[0], xy[1]+self.offset[1] );
				self.setDate();
				self.prepareTable();
				Class.closeAll();
				self.open();
			};
			
			self.btn_close.onmousedown = self.close.bind( self );
			
			self.btn_open.onclick =
			self.calendar.onclick = J.stopEvent;
			
			self.idPrefix = Class.cssPrefix + '-' + (++Class.uid);
			self.setDate();
			self.prepareTable();
			self.tween = new J.Tween( self.calendar, {duration: 100} ); 
			
			self.next.onmousedown = function (e) {
				e = e || window.event;
				var moveAmount = 1, 
					shift = e.shiftKey,
					ctrl = e.ctrlKey;
				if ( ctrl ) { moveAmount = shift ? 12 : 3; }
				self.date.setMonth( self.date.getMonth() + moveAmount );
				self.prepareTable();
			};
			
			self.back.onmousedown = function (e) {
				e = e || window.event;
				var moveAmount = 1, 
					shift = e.shiftKey,
					ctrl = e.ctrlKey;
				if ( ctrl ) { moveAmount = shift ? 12 : 3; }
				self.date.setMonth( self.date.getMonth() - moveAmount );
				self.prepareTable();
			};
			
			Class.log.push( self );
		},
		
		__static: {
			uid: 0,
			log: [],
			closeAll: function () {
				this.log.each(function (o) { o.close(); });
			}
		},
		
		setDate: function () {
			this.values = this.getValue().split( this.DATE_SEP );
			this.year = parseInt(this.values[0], 10);
			this.month = parseInt(this.values[1], 10);
			this.day_number = parseInt(this.values[2], 10);
			this.date = new Date;
			this.date.setFullYear(this.year, this.month-1, this.day_number);
			if ( isNaN(this.date) || this.date.toString() === 'Invalid Date' ) {
				this.date = new Date;
			}
		},

		close: function () {
			if ( !this.visible ) { return; }
			removeElement( this.root );
			this.visible = false;
		},
		
		open: function () {
			insertElement( this.root );
			this.tween.setOpacity( 0 );
			this.tween.start( {'opacity': 1 } );
			this.visible = true;
		},
		
		getValue: function () {
			return this.input.value.split( this.DATE_SEP ).reverse().join( this.DATE_SEP );
		},
		
		setValue: function (val) {
			this.input.value = val.split( this.DATE_SEP ).reverse().join( this.DATE_SEP );
		},
		
		renderDate: function (date) {
			var daysInMonth = function (date) {
					return 32 - new Date(date.getFullYear(), date.getMonth(), 32).getDate();
				},
				firstDayInMonth = function (date) {
					var date = new Date(date.getFullYear(), date.getMonth());
					date.setDate(0);
					return date.getDay();
				},
				ifCurrent = function (str, className) {
					if (str.join( this.DATE_SEP ) === this.input.value) {
						className.push("selected");
						selected_week = true;
					} 
				},
				addLeadingZero = function (n) { return n < 10 ? '0' + n : n; };
		
			var startDay = firstDayInMonth(date), 
				_daysInMonth = daysInMonth(date),
				_daysInPrevousMonth = daysInMonth(new Date(date.getFullYear(), date.getMonth() - 1)),
				counter_2 = 1,
				counter = 1, 
				str = '<table><tbody><tr>' +
					  '<th>M</th><th>T</th><th>W</th><th>T</th><th>F</th><th>S</th><th>S</th></tr>',
				selected_week = false;
					  
			for (var i = 0, j, k; i < 6; i++) {
				var tmp = '';
				if (i === 0) {
					for (j = 0, k = 1; j < 7; j++, k++) {
						var className = j === 5 || j === 6 ? ['weekend'] : [],
							date_string, 
							day, 
							month, 
							year, 
							content = '?';
						
						if ( k > startDay ) {
							year = date.getFullYear();
							month = addLeadingZero( date.getMonth() + 1 );
							day = addLeadingZero( counter );
							ifCurrent.call(this, [day, month, year], className);
							content = counter++;
						} 
						else {
							className.push('otherMonth');
							content = (_daysInPrevousMonth++ - startDay + 1);
							year = date.getFullYear();
							month = addLeadingZero(date.getMonth());
							day = addLeadingZero(content);
							if ( month < 1 ) {
								month = '12';
								year--;
							} 
						}
						tmp += '<td id="' + [this.idPrefix, year, month, day].join( this.DATE_SEP ) + '"';
						tmp += ' class="' + className.join(' ');
						tmp += '">';
						tmp += content;
						tmp += '</td>\n';
					}		
				} 
				else {
					for (j = 0, k = counter; j < 7; j++, k++) {
						var className = j === 5 || j === 6 ? ['weekend'] : [],
							date_string, 
							day, 
							month, 
							year, 
							content = '?';
						
						if (k < _daysInMonth + 1) {
							year = date.getFullYear();
							month =  addLeadingZero(date.getMonth() + 1);
							day = addLeadingZero(counter);
							ifCurrent.call(this, [day, month, year], className);
							content = counter++;
						} 
						else {
							content = counter_2++;						
							month = addLeadingZero(date.getMonth() + 2),
							year = date.getFullYear(),
							day = addLeadingZero(content);
							if ( month > 12 ) {
								month = '01';
								year++;
							} 
							className.push('otherMonth');
						}
						tmp += '<td id="' + [this.idPrefix, year, month, day].join( this.DATE_SEP ) + '"';
						tmp += ' class="' + className.join(' ');
						tmp += '">';
						tmp += content;
						tmp += '</td>\n';
					}		
				}
				str += (selected_week ? '<tr class="selected-week">' : '<tr>') + tmp + '</tr>\n';
				selected_week = false;
			}
			return str + '</tbody></table>';
		},

		setTitle: function ( date ) {
			/*
			var word = function () {
				switch (date.getMonth()) {
					case 0: return 'January';
					case 1: return 'February';
					case 2: return 'March';
					case 3: return 'April';
					case 4: return 'May';
					case 5: return 'June';
					case 6: return 'July';
					case 7: return 'August';
					case 8: return 'September';
					case 9: return 'October';
					case 10: return 'November';
					case 11: return 'December';
				}
			}();*/
			var months = [ 'January', 'February', 'March', 'April', 'May', 
				'June', 'July', 'August', 'September', 'October', 'November', 'December' ],
				monthLabel = months[ date.getMonth() ],
				yearLabel = date.getFullYear();
				
			this.title.innerHTML = monthLabel + ' ' + yearLabel; 
		}, 

		prepareTable: function () {
			var self = this;
			self.table.innerHTML = self.renderDate( self.date );
			self.setTitle( self.date );
			var tds = getElements( self.table, 'td' ),
				trs = getElements( self.table, 'tr' ),
				clearClassNames = function (tds) {
					for ( var i = 0; i < tds.length; i++ ) { 
						removeClass(tds[i], 'selected'); 
					}
				};
			var i = tds.length-1;
			do {
				if (tds[i].id) {
					tds[i].onclick = function () {
						var selectedCell = this;
						switch ( self.selectMode ) {
							case 'first':
								selectedCell = getFirst( this.parentNode );
								break;
							case 'last':
								selectedCell = getLast( this.parentNode );
								break;
						}
						self.setValue( selectedCell.id.replace( self.idPrefix + self.DATE_SEP, '' ) );
						self.setDate();
						addClass( this.parentNode, 'selected' ); 
						self.close();
					};
				}
			} while(i--);
		}
	});

})(); 