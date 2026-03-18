( function($) {

	// DROPDOWN CONTROL CLASS DEFINITION
	// ================================

	var DropdownControl = function(element) {
		var self = this;

		this.$element = $(element);
		this.way = this.$element.data('way');
		this.name = this.$element.data('name') || this.$element.attr('name');

		this.hashCode = function(str) {
			var hash = 0;
			if( !str || str.length === 0 ) {
				return hash;
			}
			for( var i = 0; i < str.length; i++ ) {
				var charCode = str.charCodeAt(i);
				hash = ((hash << 5) - hash) + charCode;
				hash = hash & hash;
			}
			hash = hash.toString(16);
			hash = hash.replace("-", "");
			return hash;
		};

		this.executeEvents = function(element) {
			if( void 0 === window.factory_dropdown_control_events_data ) {
				return;
			}

			element.change(function() {
				self.eventsProcess(element);
			});

			self.eventsProcess(element);
		};

		this.eventsProcess = function(element) {
			var controlName = element.attr('name'),
				controlValue = element.val();
			var controlEventsData = window.factory_dropdown_control_events_data[controlName];

			if( !controlEventsData || !controlEventsData[controlValue] ) {
				return;
			}

			var detachElements;

			if( void 0 === window.__factory_dropdown_control_detach_elements ) {
				window.__factory_dropdown_control_detach_elements = {};
			}

			detachElements = window.__factory_dropdown_control_detach_elements;

			for( var event in controlEventsData[controlValue] ) {
				if( !controlEventsData[controlValue].hasOwnProperty(event) ) {
					continue;
				}

				var selector = controlEventsData[controlValue][event];

				var uqName;
				if( !$.isArray(selector) ) {
					uqName = self.hashCode(controlName + selector);
				}

				switch( event ) {
					case 'hide':
						if( typeof selector === 'string' ) {
							$(selector).hide(0);
						}
						break;
					case 'show':
						if( typeof selector === 'string' ) {
							$(selector).fadeIn(200);
						}
						break;
					case 'detach':
						if( typeof selector === 'string' ) {
							$(selector).each(function(i) {
								if( !detachElements[uqName] ) {
									detachElements[uqName] = {};
								}
								if( !detachElements[uqName][i] ) {
									detachElements[uqName][i] = {};
								}
								detachElements[uqName][i]['recovery_contanier'] = $(this).parent();
								detachElements[uqName][i]['element'] = $(this).clone(true);

								$(this).remove();
							});
						}
						break;
					case 'recovery':
						if( detachElements[uqName] ) {
							for( var key in detachElements[uqName] ) {
								if( !detachElements[uqName].hasOwnProperty(key) ) {
									continue;
								}
								if( detachElements[uqName][key]['recovery_contanier'] && detachElements[uqName][key]['element'] ) {
									detachElements[uqName][key]['recovery_contanier'].append(detachElements[uqName][key]['element']);
								}
							}
							delete detachElements[uqName];
						}
						break;
					case 'removeClasses':
						if( typeof selector === 'object' ) {
							for( var selectorName in selector ) {
								if( !selector.hasOwnProperty(selectorName) ) {
									continue;
								}
								if( selector[selectorName] ) {
									$(selectorName).removeClass(selector[selectorName]);
								}

							}
						}
						break;
					case 'addClasses':
						if( typeof selector === 'object' ) {
							for( var selectorName in selector ) {
								if( !selector.hasOwnProperty(selectorName) ) {
									continue;
								}
								if( selector[selectorName] ) {
									$(selectorName).addClass(selector[selectorName]);
								}

							}
						}
						break;
				}
			}
		};

		if( 'buttons' === this.way ) {

			this.$result = this.$element.find(".factory-result");
			this.$hints = this.$element.find(".factory-hints");
			this.$buttons = this.$element.find(".btn");

			self.executeEvents(this.$result);

			this.$buttons.click(function() {
				var value = $(this).data('value');

				self.$buttons.removeClass('active');
				$(this).addClass('active');

				self.$hints.find(".factory-hint").hide();
				self.$hints.find(".factory-hint-" + value).fadeIn();

				self.$result.val(value);
				self.$result.trigger('change');

				return false;
			});

		} else if( 'ddslick' === this.way ) {
			self.executeEvents(self.$element.find(".factory-result"));

			var data = window['factory_' + this.name + "_data"];
			var $ddslick = this.$element.find(".factory-ddslick");

			var width = this.$element.data("width") || 300;
			var imagePosition = this.$element.data("align") || 'right';

			$(data).each(function() {
				if( !this.imageHoverSrc ) {
					return true;
				}
				$('<img/>')[0].src = this.imageHoverSrc;
			});

			$ddslick.ddslick({
				data: data,
				width: width,
				imagePosition: imagePosition,
				selectText: "- select -",
				onSelected: function(data) {

					if( data.selectedData.imageHoverSrc ) {
						self.$element.find(".dd-selected-image").attr('src', data.selectedData.imageHoverSrc);
					}

					var $result = self.$element.find(".factory-result").val(data.selectedData.value);
					$result.change();
				}
			});

		} else {

			self.executeEvents(this.$element);

			// hints

			this.$hints = this.$element.next();

			if( this.$hints.hasClass('factory-hints') ) {
				this.$element.change(function() {
					self.updateHints();
					return false;
				});

				this.updateHints = function() {
					var value = self.$element.val();
					self.$hints.find(".factory-hint").hide();
					self.$hints.find(".factory-hint-" + value).show();
				};

				self.updateHints();
			}

			// ajax

			this.getAjaxData = function() {
				var ajaxDataID = self.$element.data('ajax-data-id');
				return window[ajaxDataID];
			};

			this.loadData = function() {

				var ajaxData = self.getAjaxData();

				var req = $.ajax({
					url: ajaxData.url,
					data: ajaxData.data,
					dataType: 'json',

					success: function(response) {
						if( response.error ) {
							return self.showError(response.error);
						}
						self.fill(response.items);
					},
					error: function(response) {

						if( console && console.log ) {
							console.log(response.responseText);
						}

						self.showError('Unexpected error occurred during the ajax request.');
					},
					complete: function() {
						self.removeLoader();
					}
				});
			};

			this.fill = function(items) {
				this.clearList();

				var ajaxData = self.getAjaxData();

				if( !items || !items.length ) {

					this.$element.append("<option>" + ajaxData.emptyList + "</li>");

				} else {

					for( var index in items ) {
						var item = items[index];
						self.addListItem(item);
					}
				}

				this.$element.trigger("factory-loaded");
			};

			this.clearList = function() {
				this.$element.html("");
			};

			this.addListItem = function(item) {

				var $option = $('<option />')
					.attr('value', item.value)
					.text(item.title)
					.appendTo(this.$element);

				var ajaxData = self.getAjaxData();

				if( ajaxData.selected && ajaxData.selected == item.value ) {
					$option.attr('selected', 'selected');
				}
			};

			this.showError = function(text) {
				this.clearList();

				var $error = $("<div class='factory-control-error'></div>")
					.append($("<i class='fa fa-exclamation-triangle'></i>"))
					.append(text);

				var ajaxData = self.getAjaxData();

				this.$element.append("<option>" + ajaxData.emptyList + "</li>");
				this.$element.after($error);

				this.$element.addClass('factory-has-error');
			};

			this.removeLoader = function() {
				this.$element.removeClass('factory-hidden');

				var ajaxData = self.getAjaxData();
				$(ajaxData.loader).remove();
			};

			var ajax = this.$element.data('ajax');
			if( ajax ) {
				this.loadData();
			}
		}
	};

	// DROPDOWN CONTROL DEFINITION
	// ================================

	$.fn.factoryBootstrap482_dropdownControl = function(option) {

		// call an method
		if( typeof option === "string" ) {
			var data = $(this).data('factory.dropdown.control');
			if( !data ) {
				return null;
			}
			return data[option]();
		}

		// creating an object
		else {
			return this.each(function() {
				var $this = $(this);
				var data = $this.data('factory.dropdown.control');
				if( !data ) {
					$this.data('factory.dropdown.control', (data = new DropdownControl(this)));
				}
			});
		}
	};

	$.fn.factoryBootstrap482_dropdownControl.Constructor = DropdownControl;

	// AUTO CREATING
	// ================================

	$(function() {
		$(".factory-bootstrap-482 .factory-dropdown").factoryBootstrap482_dropdownControl();
	});

}(jQuery) );