(function($) {

	// CHECKBOX CONTROL CLASS DEFINITION
	// ================================

	var CheckboxControl = function(element) {
		var self = this;
		this.$element = $(element);

		this.$result = this.$element.find(".factory-result");
		this.$on = this.$element.find(".factory-on");
		this.$off = this.$element.find(".factory-off");

		var isTumbler = this.$element.is(".factory-tumbler");
		var hasTumblerHint = this.$element.is(".factory-has-tumbler-hint");
		var tumblerFunction = this.$element.data('tumbler-function');

		var tumblerDelay = this.$element.data('tumbler-delay');
		if( !tumblerDelay ) {
			tumblerDelay = 3000;
		}

		this.callByPath = function(functionName, args) {
			var parts = functionName.split(".");
			var obj = window;

			for( var i = 0; i < parts.length; i++ ) {
				obj = obj[parts[i]];
			}

			obj.apply(obj, args);
		}

		this.$on.click(function() {
			self.$off.removeClass('active');
			self.$on.addClass('active');

			if( !isTumbler ) {
				self.$result.prop('checked', true);
				self.$result.val(1);
				self.$result.trigger('change');
			} else {

				setTimeout(function() {
					self.$on.removeClass('active');
					self.$off.addClass('active');

					var $hint = hasTumblerHint ? self.$element.next() : null;

					if( tumblerFunction ) {
						self.callByPath(tumblerFunction, [self.$element, $hint]);
					} else {
						if( hasTumblerHint ) {
							self.$element.next().fadeIn(300);
							setTimeout(function() {
								self.$element.next().fadeOut(500);
							}, tumblerDelay);
						}
					}

				}, 300);
			}

			return false;
		});

		this.$off.click(function() {
			self.$on.removeClass('active');
			self.$off.addClass('active');

			if( !isTumbler ) {
				self.$result.prop('checked', false);
				self.$result.val(0);
				self.$result.trigger('change');
			} else {

				setTimeout(function() {
					self.$off.removeClass('active');
					self.$on.addClass('active');

					var $hint = hasTumblerHint ? self.$element.next() : null;

					if( tumblerFunction ) {
						self.callByPath(tumblerFunction, [self.$element, $hint]);
					} else {
						if( hasTumblerHint ) {
							self.$element.next().fadeIn(300);
							setTimeout(function() {
								self.$element.next().fadeOut(500);
							}, tumblerDelay);
						}
					}

				}, 300);
			}

			return false;
		});

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
			if( void 0 === window.__factory_checkbox_control_events_off_data && void 0 === window.__factory_checkbox_control_events_on_data ) {
				return;
			}
			element.change(function() {
				self.eventsProcess(element);
			});

			self.eventsProcess(element);
		};

		this.eventsProcess = function(element) {
			var controlName = element.attr('name'),
				controlIsChecked = element.prop('checked');

			var controlEventsOnData = window.__factory_checkbox_control_events_on_data[controlName];
			var controlEventsOffData = window.__factory_checkbox_control_events_off_data[controlName];

			if( !controlEventsOnData && !controlEventsOffData ) {
				return;
			}

			var detachElements, currentEventsData;

			if( void 0 === window.__factory_checkbox_control_detach_elements ) {
				window.__factory_checkbox_control_detach_elements = {};
			}

			detachElements = window.__factory_checkbox_control_detach_elements;

			if( controlIsChecked ) {
				currentEventsData = controlEventsOnData;
			} else {
				currentEventsData = controlEventsOffData;
			}

			for( var event in currentEventsData ) {
				if( !currentEventsData.hasOwnProperty(event) ) {
					continue;
				}

				var selector = currentEventsData[event];

				var uqName;
				if( !$.isArray(selector) ) {
					uqName = self.hashCode(controlName + selector);
				}

				var selectorName;

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
							for( selectorName in selector ) {
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
							for( selectorName in selector ) {
								if( !selector.hasOwnProperty(selectorName) ) {
									continue;
								}
								if( selector[selectorName] ) {
									$(selectorName).addClass(selector[selectorName]);
								}

							}
						}
						break;
					case 'setValue':
						if( typeof selector === 'object' ) {
							for( selectorName in selector ) {
								if( !selector.hasOwnProperty(selectorName) ) {
									continue;
								}

								if( selector[selectorName] !== void 0 && selector[selectorName] !== null ) {
									$(selectorName).val(selector[selectorName]);
								}
							}
						}
						break;
				}
			}
		};

		this.executeEvents(this.$result);

	};

	// CHECKBOX CONTROL DEFINITION
	// ================================

	$.fn.factoryBootstrap482_checkboxControl = function(option) {

		// call an method
		if( typeof option === "string" ) {
			var data = $(this).data('factory.checkbox.control');
			if( !data ) {
				return null;
			}
			return data[option]();
		}

		// creating an object
		else {
			return this.each(function() {
				var $this = $(this);
				var data = $this.data('factory.checkbox.control');
				if( !data ) {
					$this.data('factory.checkbox.control', (data = new CheckboxControl(this)));
				}
			});
		}
	};

	$.fn.factoryBootstrap482_checkboxControl.Constructor = CheckboxControl;

	// AUTO CREATING
	// ================================

	$(function() {
		$(".factory-bootstrap-482 .factory-checkbox.factory-buttons-way").factoryBootstrap482_checkboxControl();
		$(".factory-bootstrap-482 .factory-checkbox").not('.factory-buttons-way').click(function() {
			if( $(this).prop('checked') ) {
				$(this).val(1);
			} else {
				$(this).val(0);
			}
		});
	});

}(jQuery));