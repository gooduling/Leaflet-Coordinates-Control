"use strict";
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

	onAdd: function(map)	{
		var wrapContainer = L.DomUtil.create('div', 'control-wrapper');
		var cityContainer = L.DomUtil.create('div', 'cityBondaries-container', wrapContainer);
		L.DomEvent.disableClickPropagation(wrapContainer);
		this._addText(cityContainer, map);
		return wrapContainer;
	},

	_addText: function(cityContainer, context) {
		var self = this;
		for (var key in this.options.cityCoord) {
			//var btn = self['_btn' + key];
			var btn = L.DomUtil.create('button', key + ' cityBtn' , cityContainer);
			makeCityBtn(btn, self.options.cityCoord[key][1], self.options.cityCoord[key][0])
		};

		function makeCityBtn(btn, label, coord) {
			L.DomUtil.get(btn).innerHTML = label;
			L.DomUtil.get(btn).addEventListener('click', function(event) {
				context.flyTo(coord, 11)
			})

		}
	}

});