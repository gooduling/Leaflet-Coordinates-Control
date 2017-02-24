"use strict";

/**
 * author Michal Zimmermann <zimmicz@gmail.com>
 * Displays coordinates of mouseclick.
 * @param object options:
 *        position: bottomleft, bottomright etc. (just as you are used to it with Leaflet)
 *        latitudeText: description of latitude value (defaults to lat.)
 *        longitudeText: description of latitude value (defaults to lon.)
 *        promptText: text displayed when user clicks the control
 *        precision: number of decimals to be displayed
 */
L.Control.Coordinates = L.Control.extend({
	options: {
		position: 'topright',
		precision: 4,
		cityCoord: {
			kharkiv:[[49.984353, 36.232946], 'Харків'],
			lviv: [[49.843075, 24.029400], 'Львів'],
			odesa: [[46.471713, 30.704227], 'Одеса'],			
			dnipro: [[48.470131, 35.017922], 'Дніпро'],
			kyiv: [[50.442508, 30.522791], 'Київ'],
		},
		},
		

	initialize: function(options)
	{
		L.Control.prototype.initialize.call(this, options);
	},

	onAdd: function(map)
	{
		var className = 'leaflet-control-coordinates',
			that = this,
			wrapContainer = L.DomUtil.create('div', 'contol-wrapper'),
			cityContainer = L.DomUtil.create('div', 'city-container', wrapContainer),
			container = L.DomUtil.create('div', className, wrapContainer);
			this._conwtainer = container;
			
		//this.visible = false;
	//	L.DomUtil.addClass(container, 'hidden');
		L.DomEvent.disableClickPropagation(wrapContainer);

		this._addText(container, cityContainer, map);

		return wrapContainer;
	},

	_addText: function(container, cityContainer, context) {
		var self = this;
		function makeCityBtn(btn, label, coord) {
			
			L.DomUtil.get(btn).innerHTML = label;
			L.DomUtil.get(btn).addEventListener('click', function(event) { 
			context.flyTo(coord, 11)
			})
			
		}
		console.log(this.options.cityCoord)
		Object.keys(this.options.cityCoord).forEach(function(key, i) {
			var btn = self['_btn' + key];
			btn = L.DomUtil.create('button', key + ' cityBtn' , cityContainer);
			makeCityBtn(btn, self.options.cityCoord[key][1], self.options.cityCoord[key][0])
		})
		this._copyBtn = L.DomUtil.create('button', 'copy-button' , container);
		this._input = L.DomUtil.create('input', 'coord-input' , container);
		
		
		
		
		L.DomUtil.get(this._copyBtn).innerHTML = 'Copy';
		L.DomUtil.get(this._copyBtn).addEventListener('click', function(event) {
			var copyTextarea = document.querySelector('.coord-input');
			  copyTextarea.select();

			  try {
			    var successful = document.execCommand('copy');
			    var msg = successful ? 'successful' : 'unsuccessful';
			    console.log('Copying text command was ' + msg);
				L.DomUtil.removeClass(this, 'active');
				copyTextarea.blur();
				self.marker.setLatLng([-50, -30])
			  } catch (err) {
			    console.log('Oops, unable to copy');
			  }
		});

		return container;
	},

	/**
	 * This method should be called when user clicks the map.
	 * @param event object
	 */
	setCoordinates: function(obj) {
		// if (!this.visible) {
// 			console.log(this._conwtainer);
// 			L.DomUtil.removeClass(this._conwtainer, 'hidden');
// 			this.visible = true;
// 		}

		if (obj.latlng) {
			L.DomUtil.get(this._input).value = obj.latlng.lat.toFixed(this.options.precision).toString() + '|' + obj.latlng.lng.toFixed(this.options.precision).toString();
			L.DomUtil.addClass(this._copyBtn, 'active');
		
			if (!this.marker) { 
				this.marker = L.marker([obj.latlng.lat, obj.latlng.lng]).addTo(map); 
			}
			else { 
				this.marker.setLatLng([obj.latlng.lat, obj.latlng.lng])
			}			
			
		}
		
	},
	/**
	 * This method should be called when user move cursor over the map.
	 * It draws circle ander cursor
	 * @param event object
	 */
	bindCircle: function(obj) {
		if (obj.latlng) {
			
			if (!this.cursorProjection) { 
				this.cursorProjection = L.circle([obj.latlng.lat, obj.latlng.lng], {radius: 1000, weight: 0}).addTo(map); 
			}
			else { 
				this.cursorProjection.setLatLng([obj.latlng.lat, obj.latlng.lng])
			}	
		}
	}
});