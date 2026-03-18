(function ($) {
	'use strict';
	$(document).ready(function () {
		$('.activate-ad-import').on('click', function (e) {
			e.preventDefault();

			var element = $(this);
			if(element.hasClass('ad-import-installed')){
				element.text( window.CREATIV_DEMO.buttton_status.activate );
			}else{
				element.text( window.CREATIV_DEMO.buttton_status.install );
			}
			$.post(
				window.CREATIV_DEMO.ajax_url,
				{
					action     : 'creativ_demo_importer_plugin_install',
					nonce: window.CREATIV_DEMO.nonce,
				},
	            function (response) {
					if (response.success == true) {
						setTimeout( function(){
							element.text( window.CREATIV_DEMO.buttton_status.redirect );
							setTimeout( function(){
								window.location =  window.CREATIV_DEMO.redirect_url;
							}, 900 );
						}, 900 );
					}else{
						$('.starter-sites-install-content').text( window.CREATIV_DEMO.warning );
						$('.activate-ad-import').remove();
					}
				}
			).fail(function(){
				$('.starter-sites-install-content').text( window.CREATIV_DEMO.warning );
				$('.activate-ad-import').remove();
			});
		} );
	});
})(jQuery);
