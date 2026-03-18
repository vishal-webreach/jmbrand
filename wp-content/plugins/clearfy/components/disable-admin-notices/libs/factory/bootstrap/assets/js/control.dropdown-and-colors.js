(function($) {
	var dropdownAndColors = function(element) {
		var $this = $(element);
		var radioControlsWrap = $this.find('.factory-colors-inner-wrap');

		$this.find('select').change(function() {
			var selected = $this.find('select option:selected'),
				colors = selected.data('colors');

			var radioName = radioControlsWrap.data('radio-name');

			if( !radioName || !colors ) {
				//$this.fadeOut();
				return;
			}

			radioControlsWrap.html('');

			for( var i = 0; i < colors.length; i++ ) {
				var colorItem = colors[i];

				var radioItem = $('<span class="factory-form-radio-item">' +
				'<label class="factory-from-radio-label">' +
				'<input type="radio" name="' + radioName + '" class="factory-radio-color" value="' + colorItem[0] + '" checked="checked">' +
				'<span style="background-color:' + colorItem[1] + '"></span>' +
				'</label></span>');

				radioControlsWrap.append(radioItem);
			}
		});
	};

	$.fn.factoryBootstrap482_dropdownAndColors = function(option) {
		// call an method
		if( typeof option === "string" ) {
			var data = $(this).data('factory.dropdownAndColors.control');
			if( !data ) {
				return null;
			}
			return data[option]();
		}

		// creating an object
		else {
			return this.each(function() {
				var $this = $(this);
				var data = $this.data('factory.dropdownAndColors.control');
				if( !data ) {
					$this.data('factory.dropdownAndColors.control', (data = new dropdownAndColors(this)));
				}
			});
		}
	};

	$.fn.factoryBootstrap482_dropdownAndColors.Constructor = dropdownAndColors;

	$(function() {
		$(".factory-bootstrap-482 .factory-dropdown-and-colors").factoryBootstrap482_dropdownAndColors();
	});

}(jQuery) );