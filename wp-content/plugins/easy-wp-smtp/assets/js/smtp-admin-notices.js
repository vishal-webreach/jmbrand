/* global easy_wp_smtp_admin_notices, ajaxurl */

/**
 * Easy WP SMTP Admin Notices.
 *
 * @since 2.10.0
 */

'use strict';

var EasyWPSMTPAdminNotices = window.EasyWPSMTPAdminNotices || ( function( document, window, $ ) {

	/**
	 * Public functions and properties.
	 *
	 * @since 2.10.0
	 *
	 * @type {object}
	 */
	var app = {

		/**
		 * Start the engine.
		 *
		 * @since 2.10.0
		 */
		init: function() {

			$( app.ready );
		},

		/**
		 * Document ready.
		 *
		 * @since 2.10.0
		 */
		ready: function() {

			app.events();
		},

		/**
		 * Register JS events.
		 *
		 * @since 2.10.0
		 */
		events: function() {

			$( '.easy-wp-smtp-notice.is-dismissible' )
				.on( 'click', '.notice-dismiss', app.dismiss );
		},

		/**
		 * Click on the dismiss notice button.
		 *
		 * @since 2.10.0
		 *
		 * @param {object} event Event object.
		 */
		dismiss: function( event ) {

			var $notice = $( this ).closest( '.easy-wp-smtp-notice' );

			// If notice key is not defined, we can't dismiss it permanently.
			if ( $notice.data( 'notice' ) === undefined ) {
				return;
			}

			var $button = $( this );

			$.ajax( {
				url: ajaxurl,
				dataType: 'json',
				type: 'POST',
				data: {
					action: 'easy_wp_smtp_ajax',
					nonce: easy_wp_smtp_admin_notices.nonce,
					task: 'notice_dismiss',
					notice: $notice.data( 'notice' ),
				},
				beforeSend: function() {
					$button.prop( 'disabled', true );
				},
			} );
		},
	};

	return app;

}( document, window, jQuery ) );

// Initialize.
EasyWPSMTPAdminNotices.init();
