/**
 * Control multiple textbox
 * @author Webcraftic <wordpress.webraftic@gmail.com>
 * @copyright (c) 22.11.2017, Webcraftic
 * @version 1.0
 */


(function($) {
	'use strict';

	var multipleControl = function(element) {
		var self = this;
		this.$element = $(element);

		var prototype = $('.factory-mtextbox-item', this.$element).eq(0).clone(true);

		$('.factory-mtextbox-add-item', this.$element).on('click', function() {
			var contanier = $(this).closest('.factory-multiple-textbox-group').find('.factory-mtextbox-items');
			var element = prototype.clone(true);
			var removeButton = $('<button class="btn btn-default btn-small factory-mtextbox-remove-item"><i class="fa fa-times" aria-hidden="true"></i></button>');
			contanier.append(element.append(removeButton));
			element.find('input[type="text"]').val('').focus();
			return false;
		});

		$(document).on('click', '.factory-mtextbox-remove-item', function() {
			$(this).closest('.factory-mtextbox-item').remove();
			return false;
		});
	};

	$.fn.factoryBootstrap482_MultipleTextboxControl = function() {
		return this.each(function() {
			new multipleControl(this);
		});
	};

	$(function() {
		$(".factory-bootstrap-482 .factory-multiple-textbox-group").factoryBootstrap482_MultipleTextboxControl();
	});

})(jQuery);
