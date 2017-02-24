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
		precision: 4
	},

	initialize: function(options)
	{
		L.Control.prototype.initialize.call(this, options);
	},

	onAdd: function(map)
	{
		var className = 'leaflet-control-coordinates',
			that = this,
			container = this._container = L.DomUtil.create('div', className);
		this.visible = false;

			L.DomUtil.addClass(container, 'hidden');


		L.DomEvent.disableClickPropagation(container);

		this._addText(container, map);

		return container;
	},

	_addText: function(container, context)
	{
		this._copyBtn = L.DomUtil.create('button', 'copy-button' , container);
		this._input = L.DomUtil.create('input', 'coord-input' , container);
		var self = this;
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
		if (!this.visible) {
			L.DomUtil.removeClass(this._container, 'hidden');
		}

		if (obj.latlng) {
			L.DomUtil.get(this._input).value = obj.latlng.lat.toFixed(this.options.precision).toString() + '|' + obj.latlng.lng.toFixed(this.options.precision).toString();
			L.DomUtil.addClass(this._copyBtn, 'active');
			//L.circle([obj.latlng.lat, 30.455], {radius: 1000}).addTo(map); 
			
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
				//console.log(obj.latlng.lat, obj.latlng.lng);
				//this.cursorProjection = L.circle([obj.latlng.lat, 30.4], {radius: 1000}).addTo(map); 
			}
			else { 
				//this.cursorProjection.setLatLng([obj.latlng.lat, obj.latlng.lng])
			}	
		}
	}
});