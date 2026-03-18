/**
 * Start accordion widget script
 * Optimized version - No jQuery dependency
 */

(() => {
  "use strict";

  /**
   * Check if device is mobile
   * @returns {boolean}
   */
  const isMobileDevice = () => window.matchMedia("(max-width: 767px)").matches;

  /**
   * Smooth scroll to element
   * @param {HTMLElement} element - Target element
   * @param {number} offset - Top offset in pixels
   * @param {number} duration - Animation duration in milliseconds
   * @returns {Promise}
   */
  const smoothScrollTo = (element, offset = 0, duration = 1000) => {
    return new Promise((resolve) => {
      const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      let startTime = null;

      const animation = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // Easing function (ease-in-out)
        const ease = progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        window.scrollTo(0, startPosition + distance * ease);

        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animation);
    });
  };

  /**
   * Get element by data-title attribute
   * @param {HTMLElement} accordion - Accordion container
   * @param {string} title - Data title value
   * @returns {HTMLElement|null}
   */
  const getElementByDataTitle = (accordion, title) => {
    return accordion.querySelector(`[data-title="${title}"]`);
  };

  /**
   * Handle hash navigation and accordion toggle
   * @param {HTMLElement} accordion - Accordion element
   * @param {Object} settings - Accordion settings
   * @param {number} scrollTime - Scroll animation time
   */
  const handleHash = async (accordion, settings, scrollTime) => {
    const hash = window.location.hash;
    if (!hash) return;

    const hashValue = hash.substring(1);
    const targetElement = getElementByDataTitle(accordion, hashValue);
    
    if (!targetElement) return;

    const accordionIndex = targetElement.dataset.accordionIndex;
    const accordionContainer = targetElement.closest('.bdt-ep-accordion');
    const accordionId = accordionContainer?.id;

    if (!accordionIndex || !accordionContainer) return;

    const bdtAccordion = window.bdtUIkit?.accordion(accordion);
    if (!bdtAccordion) return;

    // Scroll if scrollspy is enabled
    if (settings.activeScrollspy === "yes" && accordionId) {
      const targetContainer = document.getElementById(accordionId);
      if (targetContainer) {
        await smoothScrollTo(targetContainer, settings.hashTopOffset, scrollTime);
      }
      bdtAccordion.toggle(parseInt(accordionIndex), false);
    } else {
      bdtAccordion.toggle(parseInt(accordionIndex), true);
    }
  };

  /**
   * Initialize accordion widget
   * @param {HTMLElement|jQuery} scope - Widget scope element (can be jQuery object or DOM element)
   */
  const widgetAccordion = (scope) => {
    // Handle both jQuery objects and native DOM elements
    const scopeElement = scope instanceof jQuery ? scope[0] : scope;
    
    const accrContainer = scopeElement.querySelector(".bdt-ep-accordion-container");
    if (!accrContainer) return;

    const accordion = accrContainer.querySelector(".bdt-ep-accordion");
    if (!accordion) return;

    const activeItems = accrContainer.querySelectorAll(".bdt-ep-accordion-item.bdt-open");
    
    // Get settings from data attribute
    const settingsData = accordion.dataset.settings;
    if (!settingsData) return;

    let settings;
    try {
      settings = typeof settingsData === 'string' ? JSON.parse(settingsData) : settingsData;
    } catch (e) {
      console.error('Failed to parse accordion settings:', e);
      return;
    }

    // Destructure settings with defaults
    const {
      activeHash = "no",
      hashTopOffset = 0,
      hashScrollspyTime = 1000,
      activeScrollspy = "no",
      closeAllItemsOnMobile = false
    } = settings;

    // Update settings object with defaults
    settings.activeScrollspy = activeScrollspy;

    // Close all items on mobile if enabled
    if (closeAllItemsOnMobile && isMobileDevice()) {
      activeItems.forEach(item => {
        item.classList.remove("bdt-open");
        const content = item.querySelector(".bdt-ep-accordion-content");
        if (content) {
          content.hidden = true;
        }
      });
    }

    // Hash navigation functionality
    if (activeHash === "yes") {
      const abortController = new AbortController();
      const signal = abortController.signal;

      // Handle initial hash on page load
      const handleLoad = () => {
        const hash = window.location.hash;
        if (!hash) return;

        const hashValue = hash.substring(1);
        const targetElement = getElementByDataTitle(accordion, hashValue);
        
        if (targetElement && targetElement.dataset.accordionIndex) {
          const accordionIndex = parseInt(targetElement.dataset.accordionIndex);
          const bdtAccordion = window.bdtUIkit?.accordion(accordion);
          
          if (bdtAccordion) {
            if (activeScrollspy === "yes") {
              handleHash(accordion, settings, hashScrollspyTime);
            } else {
              bdtAccordion.toggle(accordionIndex, false);
            }
          }
        }
      };

      // Handle accordion title clicks
      const handleTitleClick = (event) => {
        const title = event.currentTarget.dataset.title;
        if (title) {
          window.location.hash = title.trim();
          handleHash(accordion, settings, 1000);
        }
      };

      // Handle hash changes
      const handleHashChange = () => {
        handleHash(accordion, settings, 1000);
      };

      // Check if page has already loaded
      if (document.readyState === 'complete') {
        // Page already loaded, handle hash immediately
        handleLoad();
      } else {
        // Page still loading, wait for load event
        window.addEventListener("load", handleLoad, { signal, once: true });
      }
      
      // Always listen for hash changes
      window.addEventListener("hashchange", handleHashChange, { signal });

      const accordionTitles = accordion.querySelectorAll(".bdt-ep-accordion-title");
      accordionTitles.forEach(title => {
        title.addEventListener("click", handleTitleClick, { signal });
      });

      // Store cleanup function for potential future use
      accordion._cleanupAccordion = () => {
        abortController.abort();
      };
    }
  };

  // Initialize on Elementor frontend ready
  window.addEventListener("elementor/frontend/init", () => {
    if (window.elementorFrontend?.hooks) {
      elementorFrontend.hooks.addAction(
        "frontend/element_ready/bdt-accordion.default",
        widgetAccordion
      );
      elementorFrontend.hooks.addAction(
        "frontend/element_ready/bdt-acf-accordion.default",
        widgetAccordion
      );
    }
  });
})();

/**
 * End accordion widget script
 */

/**
 * Start dual button widget script
 */

(() => {
    'use strict';

    const widgetDualButton = (scope) => {
        const scopeEl = scope instanceof jQuery ? scope[0] : scope;

        const buttons = scopeEl.querySelectorAll('.bdt-dual-button .bdt-ep-button[data-onclick]');
        if (!buttons.length) return;

        buttons.forEach(btn => {
            btn.addEventListener('click', (event) => {
                event.preventDefault();

                const functionName = btn.dataset.onclick?.trim().replace(/[\(\);\s]/g, '');
                if (!functionName) return;

                if (typeof window[functionName] === 'function') {
                    window[functionName]();
                } else {
                    console.warn(`Function "${functionName}" is not defined.`);
                }
            });
        });
    };

    window.addEventListener('elementor/frontend/init', () => {
        if (!window.elementorFrontend?.hooks) return;

        elementorFrontend.hooks.addAction('frontend/element_ready/bdt-dual-button.default', widgetDualButton);
    });

})();

/**
 * End dual button widget script
 */

/**
 * Start business hours widget script
 * Optimized version - Minimal jQuery (required for jclock)
 */

(() => {
  "use strict";

  /**
   * Initialize business hours widget
   * @param {HTMLElement|jQuery} scope - Widget scope element
   */
  const widgetBusinessHours = (scope) => {
    // Handle both jQuery objects and native DOM elements
    const scopeElement = scope instanceof jQuery ? scope[0] : scope;

    const businessHoursContainer = scopeElement.querySelector(".bdt-ep-business-hours");
    if (!businessHoursContainer) return;

    const currentTimeElement = businessHoursContainer.querySelector(
      ".bdt-ep-business-hours-current-time"
    );
    if (!currentTimeElement) return;

    // Get settings from data attribute
    const settingsData = businessHoursContainer.dataset.settings;
    if (!settingsData) return;

    let settings;
    try {
      settings = typeof settingsData === "string" ? JSON.parse(settingsData) : settingsData;
    } catch (e) {
      console.error("Failed to parse business hours settings:", e);
      return;
    }

    const { business_hour_style, timeNotation, dynamic_timezone, dynamic_timezone_default } = settings;

    // Only proceed if style is dynamic
    if (business_hour_style !== "dynamic") return;

    // Validate jclock library (requires jQuery)
    if (typeof jQuery === "undefined" || !jQuery.fn.jclock) {
      console.error("jclock library is not loaded");
      return;
    }

    // Determine timezone offset
    const offsetVal =
      business_hour_style === "static" ? dynamic_timezone_default : dynamic_timezone;

    if (!offsetVal) {
      console.warn("Timezone offset is not set");
      return;
    }

    // Determine time format based on notation
    const timeFormat = timeNotation === "12h" ? "%I:%M:%S %p" : "%H:%M:%S";

    // Configure jclock options
    const options = {
      format: timeFormat,
      timeNotation: timeNotation,
      am_pm: true,
      utc: true,
      utc_offset: offsetVal,
    };

    // Initialize jclock (requires jQuery)
    jQuery(currentTimeElement).jclock(options);
  };

  // Initialize on Elementor frontend ready
  window.addEventListener("elementor/frontend/init", () => {
    if (window.elementorFrontend?.hooks) {
      elementorFrontend.hooks.addAction(
        "frontend/element_ready/bdt-business-hours.default",
        widgetBusinessHours
      );
    }
  });
})();

/**
 * End business hours widget script
 */

/**
 * Start contact form widget script
 */

(() => {
    'use strict';

    /**
     * Submit form data via fetch and handle response notifications
     * @param {HTMLFormElement} formEl
     * @param {string|false}    widgetID
     */
    const sendContactForm = async (formEl, widgetID = false) => {
        const langStr = window.ElementPackConfig.contact_form;

        bdtUIkit.notification({
            message : `<div bdt-spinner></div> ${langStr.sending_msg}`,
            timeout : false,
            status  : 'primary'
        });

        try {
            const response = await fetch(formEl.getAttribute('action'), {
                method  : 'POST',
                headers : { 'Content-Type': 'application/x-www-form-urlencoded' },
                body    : new URLSearchParams(new FormData(formEl)).toString()
            });

            const data = await response.text();

            const doc        = new DOMParser().parseFromString(data, 'text/html');
            const responseEl = doc.body.firstElementChild;

            const redirectURL = responseEl?.dataset.redirect;
            const isExternal  = responseEl?.dataset.external;
            const resetStatus = responseEl?.dataset.resetstatus;

            bdtUIkit.notification.closeAll();

            const notification = bdtUIkit.notification({
                message: `<div class="bdt-contact-form-success-message-${widgetID}">${data}</div>`
            });

            if (redirectURL && redirectURL !== 'no') {
                bdtUIkit.util.on(document, 'close', (evt) => {
                    if (evt.detail[0] === notification) {
                        window.open(redirectURL, isExternal);
                    }
                });
            }

            localStorage.setItem('bdtCouponCode', formEl.id);

            if (resetStatus && resetStatus !== 'no') {
                formEl.reset();
            }

        } catch (e) {
            console.error('Contact form submission error:', e);
        }
    };

    /**
     * Google invisible reCAPTCHA callback
     * @returns {Promise}
     */
    const elementPackGIC = () => {
        const langStr = window.ElementPackConfig.contact_form;

        return new Promise((resolve, reject) => {

            if (typeof grecaptcha === 'undefined') {
                bdtUIkit.notification({
                    message : `<div bdt-spinner></div> ${langStr.captcha_nd}`,
                    timeout : false,
                    status  : 'warning'
                });
                return reject();
            }

            const response = grecaptcha.getResponse();

            if (!response) {
                bdtUIkit.notification({
                    message : `<div bdt-spinner></div> ${langStr.captcha_nr}`,
                    timeout : false,
                    status  : 'warning'
                });
                return reject();
            }

            const recaptchaTextarea = Array.from(
                document.querySelectorAll('textarea.g-recaptcha-response')
            ).find(el => el.value === response);

            const formEl = recaptchaTextarea?.closest('form.bdt-contact-form-form');
            const action = formEl?.getAttribute('action');

            if (action && action !== '') {
                sendContactForm(formEl);
            }

            grecaptcha.reset();
        });
    };

    // Expose reCAPTCHA callback globally
    window.elementPackGICCB = elementPackGIC;

    /**
     * Initialize contact form widget
     * @param {jQuery} scope - Widget scope element
     */
    const widgetSimpleContactForm = (scope) => {
        const scopeElement = scope instanceof jQuery ? scope[0] : scope;

        const widgetID = scopeElement.dataset.id;

        // Tel input validation — applies regardless of form variant
        scopeElement.querySelectorAll('.bdt-contact-form input[type="tel"]').forEach(input => {
            input.addEventListener('input', () => {
                input.value = input.value.replace(/[^0-9+]/g, '');
            });
        });

        const formEl = scopeElement.querySelector('.bdt-contact-form .without-recaptcha');
        if (!formEl) return;

        formEl.addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();
            sendContactForm(formEl, widgetID);
        });
    };

    window.addEventListener('elementor/frontend/init', () => {
        if (window.elementorFrontend?.hooks) {
            elementorFrontend.hooks.addAction('frontend/element_ready/bdt-contact-form.default', widgetSimpleContactForm);
        }
    });

})();

/**
 * End contact form widget script
 */

/**
 * Start cookie consent widget script
 */

(() => {
    'use strict';

    /**
     * Initialize cookie consent widget
     * @param {jQuery} scope - Widget scope element
     */
    const widgetCookieConsent = (scope) => {
        const scopeElement = scope instanceof jQuery ? scope[0] : scope;

        const cookieConsentEl = scopeElement.querySelector('.bdt-cookie-consent');
        if (!cookieConsentEl) return;

        const editMode = Boolean(elementorFrontend.isEditMode());
        if (editMode) return;

        const parseData = (key) => {
            const raw = cookieConsentEl.dataset[key];
            if (!raw) return undefined;
            try {
                return typeof raw === 'string' ? JSON.parse(raw) : raw;
            } catch (e) {
                console.error(`Failed to parse cookie consent data-${key}:`, e);
                return undefined;
            }
        };

        const settings     = parseData('settings');
        const gtagSettings = parseData('gtag');

        window.cookieconsent.initialise(settings);

        // Append deny/close button to the compliance bar
        const compliance = document.querySelector('.cc-compliance');
        const denyBtn    = document.createElement('button');
        denyBtn.className = 'btn-denyCookie bdt-cc-close-btn cc-btn cc-dismiss';
        denyBtn.innerHTML = `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6"/>
        </svg>`;
        compliance?.appendChild(denyBtn);

        denyBtn.addEventListener('click', () => {
            cookieConsentEl.style.display = 'none';
            document.cookie = `element_pack_cookie_widget_gtag=denied; max-age=${60 * 60 * 24 * 7}; path=/`;
        });

        if (document.cookie.includes('element_pack_cookie_widget_gtag=denied')) {
            cookieConsentEl.style.display = 'none';
            return;
        }

        if (!gtagSettings?.gtag_enabled) return;

        const updateGtagConsent = (args) => gtag('consent', 'update', args);

        const gtagConsentObj = {
            ad_user_data       : gtagSettings.ad_user_data,
            ad_personalization : gtagSettings.ad_personalization,
            ad_storage         : gtagSettings.ad_storage,
            analytics_storage  : gtagSettings.analytics_storage,
        };

        document.querySelector('.cc-btn.cc-dismiss')?.addEventListener('click', () => {
            updateGtagConsent(gtagConsentObj);
        });

        denyBtn.addEventListener('click', () => {
            updateGtagConsent({
                ad_storage        : 'denied',
                analytics_storage : 'denied'
            });
        });
    };

    window.addEventListener('elementor/frontend/init', () => {
        if (window.elementorFrontend?.hooks) {
            elementorFrontend.hooks.addAction('frontend/element_ready/bdt-cookie-consent.default', widgetCookieConsent);
        }
    });

})();

/**
 * End cookie consent widget script
 */

/**
 * Start countdown widget script
 */

(() => {
    'use strict';

    /**
     * Set a cookie with an optional expiry in hours
     * @param {string} name
     * @param {string} value
     * @param {number} hours
     */
    const setCookie = (name, value, hours) => {
        let expires = '';
        if (hours) {
            const date = new Date();
            date.setTime(date.getTime() + hours * 60 * 60 * 1000);
            expires = `; expires=${date.toUTCString()}`;
        }
        document.cookie = `${name}=${value ?? ''}${expires}; path=/`;
    };

    /**
     * Read a cookie value by name, returns null if not found
     * @param {string} name
     * @returns {string|null}
     */
    const getCookie = (name) => {
        const match = document.cookie
            .split(';')
            .find(c => c.trimStart().startsWith(name + '='));
        return match ? match.trimStart().slice(name.length + 1) : null;
    };

    /**
     * Random integer between min and max (inclusive)
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    const randomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

    /**
     * Get remaining time components from a target date
     * @param {Date} date
     * @returns {{ total: number, seconds: number }}
     */
    const getTimeSpan = (date) => {
        const total = date - Date.now();
        return {
            total,
            seconds : Math.floor(total / 1000 % 60),
        };
    };

    /**
     * POST to the admin AJAX endpoint and handle all countdown-end actions
     * @param {object} settings
     * @param {string|number} endTime
     */
    const handleCountdownEnd = async (settings, endTime) => {
        try {
            const body = new URLSearchParams({
                action         : 'element_pack_countdown_end',
                endTime,
                couponTrickyId : settings.couponTrickyId
            });

            const response = await fetch(settings.adminAjaxUrl, { method: 'POST', body });
            const data     = await response.text();

            if (data !== 'ended') return;

            if (settings.endActionType === 'message') {
                document.querySelector(settings.msgId)?.style.setProperty('display', 'block');
                document.querySelector(`${settings.id}-timer`)?.style.setProperty('display', 'none');
            }

            if (settings.endActionType === 'url' && settings.redirectUrl?.includes('http')) {
                setTimeout(() => { window.location.href = settings.redirectUrl; }, settings.redirectDelay);
            }

            if (settings.triggerId) {
                setTimeout(() => {
                    document.getElementById(settings.triggerId)?.click();
                }, 1500);
            }

        } catch (e) {
            console.error('Countdown end action failed:', e);
        }
    };

    /**
     * Initialize countdown widget
     * @param {jQuery} scope - Widget scope element
     */
    const widgetCountdown = (scope) => {
        const scopeElement = scope instanceof jQuery ? scope[0] : scope;

        const countdownWrapper = scopeElement.querySelector('.bdt-countdown-wrapper');
        if (!countdownWrapper) return;

        const settingsData = countdownWrapper.dataset.settings;
        if (!settingsData) return;

        let settings;
        try {
            settings = typeof settingsData === 'string' ? JSON.parse(settingsData) : settingsData;
        } catch (e) {
            console.error('Failed to parse countdown settings:', e);
            return;
        }

        const { endTime, loopHours, isLogged } = settings;
        const isEditMode = document.body.classList.contains('elementor-editor-active');

        // ── Fixed countdown ──────────────────────────────────────────────────

        if (!loopHours) {
            const timerEl  = document.querySelector(`${settings.id}-timer`);
            const countdown = bdtUIkit.countdown(timerEl, { date: settings.finalTime });

            const interval = setInterval(() => {
                const { seconds } = getTimeSpan(countdown.date);

                if (seconds < 0) {
                    clearInterval(interval);

                    if (!isEditMode) {
                        document.querySelector(`${settings.id}-msg`)?.style.setProperty('display', 'none');

                        if (settings.endActionType !== 'none' || settings.triggerId) {
                            handleCountdownEnd(settings, endTime);
                        }
                    }
                }
            }, 1000);
        }

        // ── Loop countdown ───────────────────────────────────────────────────

        if (loopHours) {
            const randMinute        = randomInRange(6, 14);
            const hours             = loopHours * 60 * 60 * 1000 - randMinute * 60 * 1000;
            const loopTime          = new Date(Date.now() + hours).toISOString();
            const cookieLoopTime    = getCookie('bdtCountdownLoopTime');
            const cookieIsEmpty     = cookieLoopTime === null || cookieLoopTime === 'undefined';

            if (cookieIsEmpty && isLogged === false) {
                setCookie('bdtCountdownLoopTime', loopTime, loopHours);
            }

            const setLoopTimer = isLogged !== false ? loopTime : getCookie('bdtCountdownLoopTime');

            const timerEl = document.querySelector(`${settings.id}-timer`);
            timerEl?.setAttribute('data-bdt-countdown', `date: ${setLoopTimer}`);

            const countdown     = bdtUIkit.countdown(timerEl, { date: setLoopTimer });
            const countdownDate = countdown.date;

            setInterval(() => {
                const { seconds } = getTimeSpan(countdownDate);

                if (seconds > 0 && cookieIsEmpty && isLogged === false) {
                    setCookie('bdtCountdownLoopTime', loopTime, loopHours);
                    bdtUIkit.countdown(timerEl, { date: setLoopTimer });
                }
            }, 1000);
        }
    };

    window.addEventListener('elementor/frontend/init', () => {
        if (window.elementorFrontend?.hooks) {
            elementorFrontend.hooks.addAction('frontend/element_ready/bdt-countdown.default',          widgetCountdown);
            elementorFrontend.hooks.addAction('frontend/element_ready/bdt-countdown.bdt-tiny-countdown', widgetCountdown);
        }
    });

})();

/**
 * End countdown widget script
 */

/**
 * Start bdt custom gallery widget script
 */

(() => {
    'use strict';

    const widgetCustomGallery = (scope) => {
        const scopeEl = scope instanceof jQuery ? scope[0] : scope;

        const customGalleryEl = scopeEl.querySelector('.bdt-custom-gallery');
        if (!customGalleryEl) return;

        const settings = JSON.parse(customGalleryEl.dataset.settings || '{}');

        if (settings.tiltShow === true) {
            const elements = document.querySelectorAll(settings.id + ' [data-tilt]');
            VanillaTilt.init(elements);
        }
    };

    window.addEventListener('elementor/frontend/init', () => {
        if (!window.elementorFrontend?.hooks) return;

        elementorFrontend.hooks.addAction('frontend/element_ready/bdt-custom-gallery.default',    widgetCustomGallery);
        elementorFrontend.hooks.addAction('frontend/element_ready/bdt-custom-gallery.bdt-abetis', widgetCustomGallery);
        elementorFrontend.hooks.addAction('frontend/element_ready/bdt-custom-gallery.bdt-fedara', widgetCustomGallery);
    });

})();

/**
 * End bdt custom gallery widget script
 */

(() => {
    'use strict';

    window.addEventListener('elementor/frontend/init', () => {
        if (!window.elementorFrontend?.hooks) return;

        const ModuleHandler = elementorModules.frontend.handlers.Base;

        const FloatingEffect = ModuleHandler.extend({

            bindEvents() {
                this.run();
            },

            getDefaultSettings() {
                return {
                    direction: 'alternate',
                    easing: 'easeInOutSine',
                    loop: true,
                };
            },

            settings(key) {
                return this.getElementSettings('ep_floating_effects_' + key);
            },

            onElementChange: debounce(function (prop) {
                if (prop.indexOf('ep_floating') !== -1) {
                    this.anime && this.anime.restart();
                    this.run();
                }
            }, 400),

            run() {
                const options = this.getDefaultSettings();
                const element = this.$element[0];

                if (this.settings('translate_toggle')) {
                    if (this.settings('translate_x.sizes.from').length !== 0 || this.settings('translate_x.sizes.to').length !== 0) {
                        options.translateX = {
                            value: [this.settings('translate_x.sizes.from') || 0, this.settings('translate_x.sizes.to') || 0],
                            duration: this.settings('translate_duration.size'),
                            delay: this.settings('translate_delay.size') || 0,
                        };
                    }

                    if (this.settings('translate_y.sizes.from').length !== 0 || this.settings('translate_y.sizes.to').length !== 0) {
                        options.translateY = {
                            value: [this.settings('translate_y.sizes.from') || 0, this.settings('translate_y.sizes.to') || 0],
                            duration: this.settings('translate_duration.size'),
                            delay: this.settings('translate_delay.size') || 0,
                        };
                    }
                }

                if (this.settings('rotate_toggle')) {
                    if (this.settings('rotate_infinite') !== 'yes') {
                        if (this.settings('rotate_x.sizes.from').length !== 0 || this.settings('rotate_x.sizes.to').length !== 0) {
                            options.rotateX = {
                                value: [this.settings('rotate_x.sizes.from') || 0, this.settings('rotate_x.sizes.to') || 0],
                                duration: this.settings('rotate_duration.size'),
                                delay: this.settings('rotate_delay.size') || 0,
                            };
                        }
                        if (this.settings('rotate_y.sizes.from').length !== 0 || this.settings('rotate_y.sizes.to').length !== 0) {
                            options.rotateY = {
                                value: [this.settings('rotate_y.sizes.from') || 0, this.settings('rotate_y.sizes.to') || 0],
                                duration: this.settings('rotate_duration.size'),
                                delay: this.settings('rotate_delay.size') || 0,
                            };
                        }
                        if (this.settings('rotate_z.sizes.from').length !== 0 || this.settings('rotate_z.sizes.to').length !== 0) {
                            options.rotateZ = {
                                value: [this.settings('rotate_z.sizes.from') || 0, this.settings('rotate_z.sizes.to') || 0],
                                duration: this.settings('rotate_duration.size'),
                                delay: this.settings('rotate_delay.size') || 0,
                            };
                        }
                    }
                }

                if (this.settings('scale_toggle')) {
                    if (this.settings('scale_x.sizes.from').length !== 0 || this.settings('scale_x.sizes.to').length !== 0) {
                        options.scaleX = {
                            value: [this.settings('scale_x.sizes.from') || 0, this.settings('scale_x.sizes.to') || 0],
                            duration: this.settings('scale_duration.size'),
                            delay: this.settings('scale_delay.size') || 0,
                        };
                    }
                    if (this.settings('scale_y.sizes.from').length !== 0 || this.settings('scale_y.sizes.to').length !== 0) {
                        options.scaleY = {
                            value: [this.settings('scale_y.sizes.from') || 0, this.settings('scale_y.sizes.to') || 0],
                            duration: this.settings('scale_duration.size'),
                            delay: this.settings('scale_delay.size') || 0,
                        };
                    }
                }

                if (this.settings('skew_toggle')) {
                    if (this.settings('skew_x.sizes.from').length !== 0 || this.settings('skew_x.sizes.to').length !== 0) {
                        options.skewX = {
                            value: [this.settings('skew_x.sizes.from') || 0, this.settings('skew_x.sizes.to') || 0],
                            duration: this.settings('skew_duration.size'),
                            delay: this.settings('skew_delay.size') || 0,
                        };
                    }
                    if (this.settings('skew_y.sizes.from').length !== 0 || this.settings('skew_y.sizes.to').length !== 0) {
                        options.skewY = {
                            value: [this.settings('skew_y.sizes.from') || 0, this.settings('skew_y.sizes.to') || 0],
                            duration: this.settings('skew_duration.size'),
                            delay: this.settings('skew_delay.size') || 0,
                        };
                    }
                }

                if (this.settings('border_radius_toggle')) {
                    element.style.overflow = 'hidden';
                    if (this.settings('border_radius.sizes.from').length !== 0 || this.settings('border_radius.sizes.to').length !== 0) {
                        options.borderRadius = {
                            value: [this.settings('border_radius.sizes.from') || 0, this.settings('border_radius.sizes.to') || 0],
                            duration: this.settings('border_radius_duration.size'),
                            delay: this.settings('border_radius_delay.size') || 0,
                        };
                    }
                }

                if (this.settings('opacity_toggle')) {
                    if (this.settings('opacity_start.size').length !== 0 || this.settings('opacity_end.size').length !== 0) {
                        options.opacity = {
                            value: [this.settings('opacity_start.size') || 1, this.settings('opacity_end.size') || 0],
                            duration: this.settings('opacity_duration.size'),
                            easing: 'linear',
                        };
                    }
                }

                if (this.settings('easing')) {
                    options.easing = this.settings('easing');
                }

                if (this.settings('show')) {
                    options.targets = element;
                    if (
                        this.settings('translate_toggle') ||
                        this.settings('rotate_toggle') ||
                        this.settings('scale_toggle') ||
                        this.settings('skew_toggle') ||
                        this.settings('border_radius_toggle') ||
                        this.settings('opacity_toggle')
                    ) {
                        this.anime = window.anime && window.anime(options);
                    }
                }
            },
        });

        elementorFrontend.hooks.addAction('frontend/element_ready/widget', ($scope) => {
            elementorFrontend.elementsHandler.addHandler(FloatingEffect, { $element: $scope });
        });
    });

})();

/**
 * Start Flip Box widget script
 */

(() => {
    'use strict';

    const widgetFlipBox = (scope) => {
        const scopeEl = scope instanceof jQuery ? scope[0] : scope;

        const flipBoxes = scopeEl.querySelectorAll('.bdt-flip-box');
        if (!flipBoxes.length) return;

        const firstBox = flipBoxes[0];
        const rawSettings = firstBox.dataset.settings;
        const settings    = rawSettings ? JSON.parse(rawSettings) : {};
        if (!settings) return;

        const trigger = settings.flipTrigger;

        flipBoxes.forEach(boxEl => {
            if (trigger === 'click') {
                boxEl.addEventListener('click', () => boxEl.classList.toggle('bdt-active'));
            } else if (trigger === 'hover') {
                boxEl.addEventListener('mouseenter', () => boxEl.classList.add('bdt-active'));
                boxEl.addEventListener('mouseleave', () => boxEl.classList.remove('bdt-active'));
            }
        });
    };

    window.addEventListener('elementor/frontend/init', () => {
        if (!window.elementorFrontend?.hooks) return;

        elementorFrontend.hooks.addAction('frontend/element_ready/bdt-flip-box.default', widgetFlipBox);
    });

})();

/**
 * End Flip Box widget script
 */

/**
 * Start image accordion widget script
 */

(function () {
    'use strict';

    const setActive = (item, siblings) => {
        siblings.forEach((sib) => sib.classList.remove('active'));
        item.classList.add('active');
    };

    const getSiblings = (el) => {
        const parent = el.parentElement;
        return parent ? [...parent.children].filter((c) => c !== el) : [];
    };

    const widgetImageAccordion = (scope) => {
        const scopeEl = scope instanceof jQuery ? scope[0] : scope;
        const imageAccordion = scopeEl.querySelector('.bdt-ep-image-accordion');
        if (!imageAccordion) return;

        let settings = {};
        try {
            const raw = imageAccordion.dataset.settings;
            settings = raw ? JSON.parse(raw) : {};
        } catch (_) {}

        const accordionItems = imageAccordion.querySelectorAll('.bdt-ep-image-accordion-item');
        const totalItems = accordionItems.length;

        accordionItems.forEach((item) => item.setAttribute('tabindex', '0'));

        if (settings.activeItem === true && settings.activeItemNumber <= totalItems) {
            accordionItems.forEach((item) => item.classList.remove('active'));
            const activeIndex = settings.activeItemNumber - 1;
            if (accordionItems[activeIndex]) accordionItems[activeIndex].classList.add('active');
        }

        const mouseEvent = settings.mouse_event || 'click';
        const siblings = (el) => getSiblings(el);

        accordionItems.forEach((item) => {
            item.addEventListener(mouseEvent, function () {
                setActive(this, siblings(this));
            });

            item.addEventListener('focus', function () {
                setActive(this, siblings(this));
            });

            item.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActive(this, siblings(this));
                }
            });
        });

        if (settings.activeItem !== true) {
            document.body.addEventListener(mouseEvent, function (e) {
                if (imageAccordion.contains(e.target)) return;
                accordionItems.forEach((item) => item.classList.remove('active'));
            });
        }

        if (settings.swiping) {
            let touchstartX = 0;
            let touchendX = 0;

            accordionItems.forEach((item) => {
                item.addEventListener('touchstart', function (e) {
                    touchstartX = e.changedTouches[0]?.screenX ?? 0;
                });

                item.addEventListener('touchend', function (e) {
                    touchendX = e.changedTouches[0]?.screenX ?? 0;
                    const deltaX = touchendX - touchstartX;
                    const prev = item.previousElementSibling;
                    const next = item.nextElementSibling;

                    if (deltaX > 50 && prev) {
                        accordionItems.forEach((i) => i.classList.remove('active'));
                        prev.classList.add('active');
                    } else if (deltaX < -50 && next) {
                        accordionItems.forEach((i) => i.classList.remove('active'));
                        next.classList.add('active');
                    }
                });
            });
        }

        if (settings.inactiveItemOverlay) {
            accordionItems.forEach((item) => {
                item.addEventListener(mouseEvent, function (e) {
                    e.stopPropagation();
                    if (this.classList.contains('active')) {
                        this.classList.remove('bdt-inactive');
                        siblings(this).forEach((s) => s.classList.add('bdt-inactive'));
                    } else {
                        siblings(this).forEach((s) => s.classList.remove('bdt-inactive'));
                    }
                });
            });

            document.addEventListener(mouseEvent, function () {
                accordionItems.forEach((item) => item.classList.remove('bdt-inactive'));
            });
        }
    };

    window.addEventListener('elementor/frontend/init', () => {
        if (!window.elementorFrontend?.hooks) return;
        elementorFrontend.hooks.addAction('frontend/element_ready/bdt-image-accordion.default', widgetImageAccordion);
    });
})();

/**
 * End image accordion widget script
 */

/**
 * Start image compare widget script
 */

(function () {
    'use strict';

    const sanitizeHTML = (str) => {
        if (typeof str !== 'string') return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    const widgetImageCompare = (scope) => {
        const scopeEl = scope instanceof jQuery ? scope[0] : scope;
        const imageCompareEls = scopeEl.querySelectorAll('.image-compare');
        if (!imageCompareEls.length) return;

        const firstEl = imageCompareEls[0];
        let settings = {};
        try {
            const raw = firstEl.dataset.settings;
            settings = raw ? JSON.parse(raw) : {};
        } catch (_) {}

        const options = {
            controlColor: settings.bar_color,
            controlShadow: settings.add_circle_shadow,
            addCircle: settings.add_circle,
            addCircleBlur: settings.add_circle_blur,
            showLabels: settings.no_overlay,
            labelOptions: {
                before: sanitizeHTML(settings.before_label || ''),
                after: sanitizeHTML(settings.after_label || ''),
                onHover: settings.on_hover
            },
            smoothing: settings.smoothing,
            smoothingAmount: settings.smoothing_amount ?? 0,
            hoverStart: settings.move_slider_on_hover,
            verticalMode: settings.orientation,
            startingPoint: settings.default_offset_pct,
            fluidMode: false
        };

        imageCompareEls.forEach((element) => {
            new ImageCompare(element, options).mount();
        });
    };

    window.addEventListener('elementor/frontend/init', () => {
        if (!window.elementorFrontend?.hooks) return;
        elementorFrontend.hooks.addAction('frontend/element_ready/bdt-image-compare.default', widgetImageCompare);
    });
})();

/**
 * End image compare widget script
 */

/**
 * Start image magnifier widget script
 */

(function () {
    'use strict';

    const widgetImageMagnifier = (scope) => {
        const scopeEl = scope instanceof jQuery ? scope[0] : scope;
        const imageMagnifier = scopeEl.querySelector('.bdt-image-magnifier');
        if (!imageMagnifier) return;

        const magnifier = imageMagnifier.querySelector(':scope > .bdt-image-magnifier-image');
        if (!magnifier) return;

        let settings = {};
        try {
            const raw = imageMagnifier.dataset.settings;
            settings = raw ? JSON.parse(raw) : {};
        } catch (_) {}

        // ImageZoom is a jQuery plugin - requires jQuery
        jQuery(magnifier).ImageZoom(settings);
    };

    window.addEventListener('elementor/frontend/init', () => {
        if (!window.elementorFrontend?.hooks) return;
        elementorFrontend.hooks.addAction('frontend/element_ready/bdt-image-magnifier.default', widgetImageMagnifier);
    });
})();

/**
 * End image magnifier widget script
 */

/**
 * Start image stack widget script
 */

(function () {
    'use strict';

    const widgetImageStack = (scope) => {
        const scopeEl = scope instanceof jQuery ? scope[0] : scope;
        const imageStack = scopeEl.querySelector('.bdt-image-stack');
        if (!imageStack) return;

        const tooltips = imageStack.querySelectorAll('.bdt-tippy-tooltip');
        const widgetID = scopeEl.dataset.id || '';

        tooltips.forEach((el) => {
            tippy(el, {
                allowHTML: true,
                theme: 'bdt-tippy-' + widgetID
            });
        });
    };

    window.addEventListener('elementor/frontend/init', () => {
        if (!window.elementorFrontend?.hooks) return;
        elementorFrontend.hooks.addAction('frontend/element_ready/bdt-image-stack.default', widgetImageStack);
    });
})();

/**
 * End image stack widget script
 */

/**
 * Start icon mobile menu widget script
 */

(function () {
    'use strict';

    const widgetIconMobileMenu = (scope) => {
        const scopeEl = scope instanceof jQuery ? scope[0] : scope;
        const marker = scopeEl.querySelector('.bdt-icon-mobile-menu-wrap');
        if (!marker) return;

        const tooltips = marker.querySelectorAll('ul > li > .bdt-tippy-tooltip');
        const widgetID = scopeEl.dataset.id || '';

        tooltips.forEach((el) => {
            tippy(el, {
                allowHTML: true,
                theme: 'bdt-tippy-' + widgetID
            });
        });
    };

    window.addEventListener('elementor/frontend/init', () => {
        if (!window.elementorFrontend?.hooks) return;
        elementorFrontend.hooks.addAction('frontend/element_ready/bdt-icon-mobile-menu.default', widgetIconMobileMenu);
    });
})();

/**
 * End icon mobile menu widget script
 */

/**
 * Start logo grid widget script
 */

(function () {
    'use strict';

    const widgetLogoGrid = (scope) => {
        const scopeEl = scope instanceof jQuery ? scope[0] : scope;
        const logoGrid = scopeEl.querySelector('.bdt-logo-grid-wrapper');
        if (!logoGrid) return;

        const tooltips = logoGrid.querySelectorAll(':scope > .bdt-tippy-tooltip');
        const widgetID = scopeEl.dataset.id || '';

        tooltips.forEach((el) => {
            tippy(el, {
                allowHTML: true,
                theme: 'bdt-tippy-' + widgetID
            });
        });
    };

    window.addEventListener('elementor/frontend/init', () => {
        if (!window.elementorFrontend?.hooks) return;
        elementorFrontend.hooks.addAction('frontend/element_ready/bdt-logo-grid.default', widgetLogoGrid);
    });
})();

/**
 * End logo grid widget script
 */

/**
 * Start open street map widget script
 */

( function( $, elementor ) {

	'use strict';

	var widgetOpenStreetMap = function( $scope, $ ) {

		var $openStreetMap = $scope.find( '.bdt-open-street-map' ),
            settings       = $openStreetMap.data('settings'),
            markers        = $openStreetMap.data('map_markers'),
            tileSource = '';

        if ( ! $openStreetMap.length ) {
            return;
        }

        var avdOSMap = L.map($openStreetMap[0], {
                zoomControl: settings.zoomControl,
                scrollWheelZoom: false
            }).setView([
                    settings.lat,
                    settings.lng
                ], 
                settings.zoom
            );

        if (settings.mapboxToken !== '' && settings.mapboxToken !== false) {
          tileSource = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + settings.mapboxToken;
            L.tileLayer( tileSource, {
                maxZoom: 18,
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>',
                id: 'mapbox/streets-v11',
                tileSize: 512,
                zoomOffset: -1
            }).addTo(avdOSMap);
        } else {
            L.tileLayer( 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(avdOSMap);
        }


        for (var i in markers) { 
            if( (markers[i]['iconUrl']) != '' && typeof (markers[i]['iconUrl']) !== 'undefined'){ 
                var LeafIcon = L.Icon.extend({
                    options: {
                        iconSize   : [25, 41],
                        iconAnchor : [12, 41],
                        popupAnchor: [2, -41]
                    }
                });
                var greenIcon = new LeafIcon({iconUrl: markers[i]['iconUrl'] });
                // Create a safe popup content that allows HTML formatting but prevents XSS
                var popupContent = document.createElement('div');
                popupContent.innerHTML = markers[i]['infoWindow'];
                // Remove any script tags and event handlers for security
                var scripts = popupContent.querySelectorAll('script');
                for (var j = 0; j < scripts.length; j++) {
                    scripts[j].remove();
                }
                // Remove any elements with event handlers
                var elementsWithEvents = popupContent.querySelectorAll('[onclick], [onload], [onerror], [onmouseover], [onmouseout]');
                for (var k = 0; k < elementsWithEvents.length; k++) {
                    elementsWithEvents[k].removeAttribute('onclick');
                    elementsWithEvents[k].removeAttribute('onload');
                    elementsWithEvents[k].removeAttribute('onerror');
                    elementsWithEvents[k].removeAttribute('onmouseover');
                    elementsWithEvents[k].removeAttribute('onmouseout');
                }
                L.marker( [markers[i]['lat'], markers[i]['lng']], {icon: greenIcon} ).bindPopup(popupContent).addTo(avdOSMap);
            } else {
                if( (markers[i]['lat']) != '' && typeof (markers[i]['lat']) !== 'undefined'){ 
                    // Create a safe popup content that allows HTML formatting but prevents XSS
                    var popupContent = document.createElement('div');
                    popupContent.innerHTML = markers[i]['infoWindow'];
                    // Remove any script tags and event handlers for security
                    var scripts = popupContent.querySelectorAll('script');
                    for (var j = 0; j < scripts.length; j++) {
                        scripts[j].remove();
                    }
                    // Remove any elements with event handlers
                    var elementsWithEvents = popupContent.querySelectorAll('[onclick], [onload], [onerror], [onmouseover], [onmouseout]');
                    for (var k = 0; k < elementsWithEvents.length; k++) {
                        elementsWithEvents[k].removeAttribute('onclick');
                        elementsWithEvents[k].removeAttribute('onload');
                        elementsWithEvents[k].removeAttribute('onerror');
                        elementsWithEvents[k].removeAttribute('onmouseover');
                        elementsWithEvents[k].removeAttribute('onmouseout');
                    }
                    L.marker( [markers[i]['lat'], markers[i]['lng']] ).bindPopup(popupContent).addTo(avdOSMap);
                }
            }
        }

	};


	jQuery(window).on('elementor/frontend/init', function() {
		elementorFrontend.hooks.addAction( 'frontend/element_ready/bdt-open-street-map.default', widgetOpenStreetMap );
	});

}( jQuery, window.elementorFrontend ) );

/**
 * End open street map widget script
 */


/**
 * Start panel slider widget script
 */

(function ($, elementor) {

	'use strict';

	var widgetPanelSlider = function ($scope, $) {

		var $slider = $scope.find('.bdt-panel-slider');

		if (!$slider.length) {
			return;
		}

		var $sliderContainer = $slider.find('.swiper-carousel'),
			$settings = $slider.data('settings'),
			$widgetSettings = $slider.data('widget-settings');

		const Swiper = elementorFrontend.utils.swiper;
		initSwiper();
		async function initSwiper() {
			var swiper = await new Swiper($sliderContainer, $settings);

			if ($settings.pauseOnHover) {
				$($sliderContainer).hover(function () {
					(this).swiper.autoplay.stop();
				}, function () {
					(this).swiper.autoplay.start();
				});
			}
		};

		if ($widgetSettings.mouseInteractivity == true) {
			setTimeout(() => {
				var data = $($widgetSettings.id).find('.bdt-panel-slide-item');
				$(data).each((index, element) => {
					var scene = $(element).get(0);
					var parallaxInstance = new Parallax(scene, {
						selector: '.bdt-panel-slide-thumb',
						hoverOnly: true,
						pointerEvents: true
					});
				});
			}, 2000);
		}

	};


	jQuery(window).on('elementor/frontend/init', function () {
		elementorFrontend.hooks.addAction('frontend/element_ready/bdt-panel-slider.default', widgetPanelSlider);
		elementorFrontend.hooks.addAction('frontend/element_ready/bdt-panel-slider.bdt-middle', widgetPanelSlider);
		elementorFrontend.hooks.addAction('frontend/element_ready/bdt-panel-slider.always-visible', widgetPanelSlider);
	});

}(jQuery, window.elementorFrontend));

/**
 * End panel slider widget script
 */
/**
 * Start progress pie widget script
 */

(function ($, elementor) {

    'use strict';

    var widgetProgressPie = function ($scope, $) {

        var $progressPie = $scope.find('.bdt-progress-pie');

        if (!$progressPie.length) {
            return;
        }

        epObserveTarget($scope[0], function () {
            var $this = $($progressPie);

            $this.asPieProgress({
                namespace: 'pieProgress',
                classes: {
                    svg: 'bdt-progress-pie-svg',
                    number: 'bdt-progress-pie-number',
                    content: 'bdt-progress-pie-content'
                }
            });

            $this.asPieProgress('start');

        }, {
            root: null, // Use the viewport as the root
            rootMargin: '0px', // No margin around the root
            threshold: 1 // 80% visibility (1 - 0.8)
        });

    };


    jQuery(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/bdt-progress-pie.default', widgetProgressPie);
    });

}(jQuery, window.elementorFrontend));

/**
 * End progress pie widget script
 */


/**
 * Start reading progress widget script
 */

 (function($, elementor) {

    'use strict';

    var readingProgressWidget = function($scope, $) {

        var $readingProgress = $scope.find('.bdt-reading-progress');

        if (!$readingProgress.length) {
            return;
        }
        var $settings = $readingProgress.data('settings');

        jQuery(document).ready(function(){

            var settings = {
                borderSize: 10,
                mainBgColor: '#E6F4F7',
                lightBorderColor: '#A2ECFB',
                darkBorderColor: '#39B4CC'
            };

            var colorBg = $settings.progress_bg;  //'red'
            var progressColor = $settings.scroll_bg; //'green';
            var innerHeight, offsetHeight, netHeight,
            self = this,
            container = $($readingProgress),
            borderContainer = 'bdt-reading-progress-border',
            circleContainer = 'bdt-reading-progress-circle',
            textContainer = 'bdt-reading-progress-text';

            var getHeight = function () {
                innerHeight = window.innerHeight;
                offsetHeight = document.body.offsetHeight;
                netHeight = offsetHeight - innerHeight;
            };

            var addEvent = function () {
                var e = document.createEvent('Event');
                e.initEvent('scroll', false, false);
                window.dispatchEvent(e);
            };
            var updateProgress = function (percnt) {
                var per = Math.round(100 * percnt);
                if (typeof percnt !== 'number' || !isFinite(percnt) || per < 0 || per > 100) {
                    per = 0;
                }
                var deg = per * 360 / 100;
                if (deg <= 180) {
                    $('.' + borderContainer, container).css('background-image', 'linear-gradient(' + (90 + deg) + 'deg, transparent 50%, ' + colorBg + ' 50%),linear-gradient(90deg, ' + colorBg + ' 50%, transparent 50%)');
                } else {
                    $('.' + borderContainer, container).css('background-image', 'linear-gradient(' + (deg - 90) + 'deg, transparent 50%, ' + progressColor + ' 50%),linear-gradient(90deg, ' + colorBg + ' 50%, transparent 50%)');
                }
                $('.' + textContainer, container).text(per + '%');
            };
            var prepare = function () {
                    $(container).html("<div class='" + borderContainer + "'><div class='" + circleContainer + "'><span class='" + textContainer + "'></span></div></div>");

                    $('.' + borderContainer, container).css({
                        'background-color': progressColor,
                        'background-image': 'linear-gradient(91deg, transparent 50%,' + settings.lightBorderColor + '50%), linear-gradient(90deg,' + settings.lightBorderColor + '50%, transparent 50%'
                    });
                    $('.' + circleContainer, container).css({
                        'width': settings.width - settings.borderSize,
                        'height': settings.height - settings.borderSize
                    });

                };
            var init = function () {
                    getHeight();
                    prepare();
                    $(window).on('scroll', function () {
                        var getOffset = window.pageYOffset || document.documentElement.scrollTop;
                        var percnt = (typeof netHeight === 'number' && isFinite(netHeight) && netHeight > 0)
                            ? Math.max(0, Math.min(1, getOffset / netHeight))
                            : 0;
                        updateProgress(percnt);
                    });
                    $(window).on('resize', function () {
                        getHeight();
                        addEvent();
                    });
                    $(window).on('load', function () {
                        getHeight();
                        addEvent();
                    });
                    addEvent();
                };
                 init();
            });

    };
    //	start progress with cursor
    var readingProgressCursorSkin = function($scope, $) {

        var $readingProgress = $scope.find('.bdt-progress-with-cursor');

        if (!$readingProgress.length) {
            return;
        }

        document.getElementsByTagName('body')[0].addEventListener('mousemove', function(n) {
            t.style.left = n.clientX + 'px';
            t.style.top = n.clientY + 'px';
            e.style.left = n.clientX + 'px';
            e.style.top = n.clientY + 'px';
            i.style.left = n.clientX + 'px';
            i.style.top = n.clientY + 'px';
        });
        var t = document.querySelector('.bdt-cursor'),
        e = document.querySelector('.bdt-cursor2'),
        i = document.querySelector('.bdt-cursor3');

        function n(t) {
            e.classList.add('hover'), i.classList.add('hover');
        }

        function s(t) {
            e.classList.remove('hover'), i.classList.remove('hover');
        }
        s();
        for (var r = document.querySelectorAll('.hover-target'), a = r.length - 1; a >= 0; a--) {
            o(r[a]);
        }

        function o(t) {
            t.addEventListener('mouseover', n);
            t.addEventListener('mouseout', s);
        }

        $(document).ready(function() {
            //Scroll indicator
            var progressPath = document.querySelector('.bdt-progress-wrap path');
            var pathLength = progressPath.getTotalLength();
            progressPath.style.transition = progressPath.style.WebkitTransition = 'none';
            progressPath.style.strokeDasharray = pathLength + ' ' + pathLength;
            progressPath.style.strokeDashoffset = pathLength;
            progressPath.getBoundingClientRect();
            progressPath.style.transition = progressPath.style.WebkitTransition = 'stroke-dashoffset 10ms linear';
            var updateProgress = function() {
                var scroll = $(window).scrollTop();
                var height = $(document).height() - $(window).height();
                var progress = pathLength - (scroll * pathLength / height);
                progressPath.style.strokeDashoffset = progress;
            };
            updateProgress();
            jQuery(window).on('scroll', updateProgress);


        });

    };
    //	end  progress with cursor

    // start progress horizontal 


    var readingProgressHorizontalSkin = function($scope, $) {

        var $readingProgress = $scope.find('.bdt-horizontal-progress');

        if (!$readingProgress.length) {
            return;
        }

        $('#bdt-progress').progress({ size: '3px', wapperBg: '#eee', innerBg: '#DA4453' });

    };

    // end progress horizontal 

    // start  progress back to top 


    var readingProgressBackToTopSkin = function($scope, $) {

        var $readingProgress = $scope.find('.bdt-progress-with-top');

        if (!$readingProgress.length) {
            return;
        }

        var progressPath = document.querySelector('.bdt-progress-wrap path');
        var pathLength = progressPath.getTotalLength();
        progressPath.style.transition = progressPath.style.WebkitTransition = 'none';
        progressPath.style.strokeDasharray = pathLength + ' ' + pathLength;
        progressPath.style.strokeDashoffset = pathLength;
        progressPath.getBoundingClientRect();
        progressPath.style.transition = progressPath.style.WebkitTransition = 'stroke-dashoffset 10ms linear';
        var updateProgress = function() {
            var scroll = jQuery(window).scrollTop();
            var height = jQuery(document).height() - jQuery(window).height();
            var progress = pathLength - (scroll * pathLength / height);
            progressPath.style.strokeDashoffset = progress;
        };
        updateProgress();
        jQuery(window).on('scroll', updateProgress);
        var offset = 50;
        var duration = 550;
        jQuery(window).on('scroll', function() {
            if (jQuery(this).scrollTop() > offset) {
                jQuery('.bdt-progress-wrap').addClass('active-progress');
            } else {
                jQuery('.bdt-progress-wrap').removeClass('active-progress');
            }
        });
        jQuery('.bdt-progress-wrap').on('click', function(event) {
            event.preventDefault();
            jQuery('html, body').animate({ scrollTop: 0 }, duration);
            return false;
        });

    };

    // end progress back to top

    jQuery(window).on('elementor/frontend/init', function() {
        elementorFrontend.hooks.addAction('frontend/element_ready/bdt-reading-progress.default', readingProgressWidget);
        elementorFrontend.hooks.addAction('frontend/element_ready/bdt-reading-progress.bdt-progress-with-cursor', readingProgressCursorSkin);
        elementorFrontend.hooks.addAction('frontend/element_ready/bdt-reading-progress.bdt-horizontal-progress', readingProgressHorizontalSkin);
        elementorFrontend.hooks.addAction('frontend/element_ready/bdt-reading-progress.bdt-back-to-top-with-progress', readingProgressBackToTopSkin);
    });

}(jQuery, window.elementorFrontend));

/**
 * End reading progress widget script
 */


(function ($, elementor) {
  $(window).on("elementor/frontend/init", function () {
    let ModuleHandler = elementorModules.frontend.handlers.Base,
      ReadingTimer;

    ReadingTimer = ModuleHandler.extend({
      bindEvents: function () {
        this.run();
      },
      getDefaultSettings: function () {
        return {
          allowHTML: true,
        };
      },

      settings: function (key) {
        return this.getElementSettings("reading_timer_" + key);
      },

      calculateReadingTime: function (ReadingContent) {
        let wordCount = ReadingContent.split(/\s+/).filter(function (word) {
            return word !== "";
          }).length,
          averageReadingSpeed = this.settings("avg_words_per_minute")
            ? this.settings("avg_words_per_minute").size
            : 200,
          readingTime = Math.floor(wordCount / averageReadingSpeed),
          reading_seconds = Math.floor(
            (wordCount % averageReadingSpeed) / (averageReadingSpeed / 60)
          ),
          minText = this.settings("minute_text")
            ? this.settings("minute_text")
            : "min read",
          secText = this.settings("seconds_text")
            ? this.settings("seconds_text")
            : "sec read";

        if (wordCount >= averageReadingSpeed) {
          return `${readingTime} ${minText}`;
        } else {
          return `${reading_seconds} ${secText}`;
        }
      },

      run: function () {
        const widgetID = this.$element.data("id"),
          widgetContainer = `.elementor-element-${widgetID} .bdt-reading-timer`,
          contentSelector = this.settings("content_id");
        let minText = this.settings("minute_text")
          ? this.settings("minute_text")
          : "min read";

        var editMode = Boolean(elementorFrontend.isEditMode());
        if (editMode) {
          $(widgetContainer).append("2 " + minText + "");
          return;
        }
        if (contentSelector) {
          ReadingContent = $(document).find(`#${contentSelector}`).text();
          var readTime = this.calculateReadingTime(ReadingContent);
          $(widgetContainer).append(readTime);
        } else return;
      },
    });

    elementorFrontend.hooks.addAction(
      "frontend/element_ready/bdt-reading-timer.default",
      function ($scope) {
        elementorFrontend.elementsHandler.addHandler(ReadingTimer, {
          $element: $scope,
        });
      }
    );
  });
})(jQuery, window.elementorFrontend);

/**
 * Start twitter carousel widget script
 */

(function ($, elementor) {

	'use strict';

	var widgetReviewCardCarousel = function ($scope, $) {

		var $reviewCardCarousel = $scope.find('.bdt-review-card-carousel');

		if (!$reviewCardCarousel.length) {
			return;
		}

		var $reviewCardCarouselContainer = $reviewCardCarousel.find('.swiper-carousel'),
			$settings = $reviewCardCarousel.data('settings');

		const Swiper = elementorFrontend.utils.swiper;
		initSwiper();
		async function initSwiper() {
			var swiper = await new Swiper($reviewCardCarouselContainer, $settings); // this is an example

			if ($settings.pauseOnHover) {
				$($reviewCardCarouselContainer).hover(function () {
					(this).swiper.autoplay.stop();
				}, function () {
					(this).swiper.autoplay.start();
				});
			}

		};


	};


	jQuery(window).on('elementor/frontend/init', function () {
		elementorFrontend.hooks.addAction('frontend/element_ready/bdt-review-card-carousel.default', widgetReviewCardCarousel);
	});

}(jQuery, window.elementorFrontend));

/**
 * End twitter carousel widget script
 */


/**
 * Start scroll button widget script
 */

( function( $, elementor ) {

	'use strict';

	var widgetScrollButton = function( $scope, $ ) {
	    
			var $scrollButton = $scope.find('.bdt-scroll-button'),
			$selector         = $scrollButton.data('selector'),
			$settings         =  $scrollButton.data('settings');

	    if ( ! $scrollButton.length ) {
	    	return;
	    }

	    //$($scrollButton).find('.bdt-scroll-button').unbind();
	    
	    if ($settings.HideOnBeforeScrolling == true) {

			$(window).scroll(function() {
			  if ($(window).scrollTop() > 300) {
			    $scrollButton.css("opacity", "1");
			  } else {
			    $scrollButton.css("opacity", "0");
			  }
			});
	    }

	    $($scrollButton).on('click', function(event){
	    	event.preventDefault();
	    	bdtUIkit.scroll($scrollButton, $settings ).scrollTo($($selector));

	    });

	};

	jQuery(window).on('elementor/frontend/init', function() {
		elementorFrontend.hooks.addAction( 'frontend/element_ready/bdt-scroll-button.default', widgetScrollButton );
	});

}( jQuery, window.elementorFrontend ) );

/**
 * End scroll button widget script
 */


/**
 * Start search widget script
 */

(function ($, elementor) {
  'use strict';
  var serachTimer;
  var widgetAjaxSearch = function ($scope, $) {
    var $searchContainer = $scope.find('.bdt-search-container'),
      $searchWidget = $scope.find('.bdt-ajax-search');

    $($scope).find('.bdt-navbar-dropdown-close').on('click', function () {
      bdtUIkit.drop($scope.find('.bdt-navbar-dropdown')).hide();
    });

    let $search;

    if (!$searchWidget.length) {
      return;
    }

    var $resultHolder = $($searchWidget).find('.bdt-search-result'),
      $settings = $($searchWidget).data('settings'),
      $connectSettings = $($searchContainer).data('settings'),
      $target = $($searchWidget).attr('anchor-target');

    if ('yes' === $target) {
      $target = '_blank';
    } else {
      $target = '_self';
    }

    clearTimeout(serachTimer);

    if ($connectSettings && $connectSettings.element_connect) {
      $($connectSettings.element_selector).hide();
    }

    $($searchWidget).on('keyup keypress', function (e) {
      var keyCode = e.keyCode || e.which;
      if (keyCode === 13) {
        e.preventDefault();
        return false;
      }
    });

    $searchWidget.find('.bdt-search-input').keyup(function () {
      $search = $(this).val();
      serachTimer = setTimeout(function () {
        $($searchWidget).addClass('bdt-search-loading');
        jQuery.ajax({
          url: window.ElementPackConfig.ajaxurl,
          type: 'post',
          data: {
            action: 'element_pack_search',
            s: $search,
            settings: $settings,
          },
          success: function (response) {
            var response = $.parseJSON(response);

            if (response.results.length > 0) {
              if ($search.length >= 3) {
                var output = `<div class="bdt-search-result-inner">
                          <h3 class="bdt-search-result-header">${window.ElementPackConfig.search.search_result}<i class="ep-icon-close bdt-search-result-close-btn"></i></h3>
                          <ul class="bdt-list bdt-list-divider">`;
                for (let i = 0; i < response.results.length; i++) {
                  const element = response.results[i];
                  output += `<li class="bdt-search-item" data-url="${element.url}">
                            <a href="${element.url}" target="${$target}">
                            <div class="bdt-search-title">${element.title}</div>
                            <div class="bdt-search-text">${element.text}</div>
                            </a>
                          </li>`;
                }
                output += `</ul><a class="bdt-search-more">${window.ElementPackConfig.search.more_result}</a></div>`;

                $resultHolder.html(output);
                $resultHolder.show();
                $(".bdt-search-result-close-btn").on("click", function (e) {
                  $(".bdt-search-result").hide();
                  $(".bdt-search-input").val("");
                });

                $($searchWidget).removeClass("bdt-search-loading");
                $(".bdt-search-more").on("click", function (event) {
                  event.preventDefault();
                  $($searchWidget).submit();
                });
              } else {
                $resultHolder.hide();
              }
            } else {
              if ($search.length > 3) {
                var not_found = `<div class="bdt-search-result-inner">
                                  <h3 class="bdt-search-result-header">${window.ElementPackConfig.search.search_result}<i class="ep-icon-close bdt-search-result-close-btn"></i></h3>
                                  <div class="bdt-search-text">${$search} ${window.ElementPackConfig.search.not_found}</div>
                                </div>`;
                $resultHolder.html(not_found);
                $resultHolder.show();
                $(".bdt-search-result-close-btn").on("click", function (e) {
                  $(".bdt-search-result").hide();
                  $(".bdt-search-input").val("");
                });
                $($searchWidget).removeClass("bdt-search-loading");

                if ($connectSettings && $connectSettings.element_connect) {
                  $resultHolder.hide();
                  setTimeout(function () {
                    $($connectSettings.element_selector).show();
                  }, 1500);
                }

              } else {
                $resultHolder.hide();
                $($searchWidget).removeClass("bdt-search-loading");
              }

            }
          }
        });
      }, 450);
    });

  };


  jQuery(window).on('elementor/frontend/init', function () {
    elementorFrontend.hooks.addAction('frontend/element_ready/bdt-search.default', widgetAjaxSearch);
  });

  //window.elementPackAjaxSearch = widgetAjaxSearch;

})(jQuery, window.elementorFrontend);

/**
 * End search widget script
 */
/**
 * Start slider widget script
 */

( function( $, elementor ) {

	'use strict';

	var widgetSlider = function( $scope, $ ) {

		var $slider = $scope.find( '.bdt-slider' );
				
        if ( ! $slider.length ) {
            return;
        }

        var $sliderContainer = $slider.find('.swiper-carousel'),
			$settings 		 = $slider.data('settings');

		// Access swiper class
        const Swiper = elementorFrontend.utils.swiper;
        initSwiper();
        
        async function initSwiper() {

			var swiper = await new Swiper($sliderContainer, $settings);

			if ($settings.pauseOnHover) {
				 $($sliderContainer).hover(function() {
					(this).swiper.autoplay.stop();
				}, function() {
					(this).swiper.autoplay.start();
				});
			}
		};

	};


	jQuery(window).on('elementor/frontend/init', function() {
		elementorFrontend.hooks.addAction( 'frontend/element_ready/bdt-slider.default', widgetSlider );
		elementorFrontend.hooks.addAction( 'frontend/element_ready/bdt-acf-slider.default', widgetSlider );
	});

}( jQuery, window.elementorFrontend ) );

/**
 * End slider widget script
 */


/**
 * Start twitter carousel widget script
 */

( function( $, elementor ) {

	'use strict';

	var widgetStaticCarousel = function( $scope, $ ) {

		var $StaticCarousel = $scope.find( '.bdt-static-carousel' );
				
        if ( ! $StaticCarousel.length ) {
            return;
        }

		var $StaticCarouselContainer = $StaticCarousel.find('.swiper-carousel'),
			$settings 		 = $StaticCarousel.data('settings');

		// Access swiper class
        const Swiper = elementorFrontend.utils.swiper;
        initSwiper();
        
        async function initSwiper() {

			var swiper = await new Swiper($StaticCarouselContainer, $settings);

			if ($settings.pauseOnHover) {
				 $($StaticCarouselContainer).hover(function() {
					(this).swiper.autoplay.stop();
				}, function() {
					(this).swiper.autoplay.start();
				});
			}
		};

	};


	jQuery(window).on('elementor/frontend/init', function() {
		elementorFrontend.hooks.addAction( 'frontend/element_ready/bdt-static-carousel.default', widgetStaticCarousel );
	});

}( jQuery, window.elementorFrontend ) );

/**
 * End twitter carousel widget script
 */


/**
 * Start post grid tab widget script
 */

;
(function ($, elementor) {

	'use strict';

	var widgetStaticPostTab = function ($scope, $) {

		var $postGridTab = $scope.find('.bdt-static-grid-tab'),
			gridTab = $postGridTab.find('.gridtab');

		var $settings = $postGridTab.data('settings');

		if (!$postGridTab.length) {
			return;
		}

		$(gridTab).gridtab($settings);

	};


	jQuery(window).on('elementor/frontend/init', function () {
		elementorFrontend.hooks.addAction('frontend/element_ready/bdt-static-grid-tab.default', widgetStaticPostTab);
	});

}(jQuery, window.elementorFrontend));

/**
 * End post grid tab widget script
 */
/**
 * Start step flow widget script
 */

(function ($, elementor) {

    'use strict';

    var widgetStepFlow = function ($scope, $) {

        var $avdDivider = $scope.find('.bdt-step-flow'),
            divider = $($avdDivider).find('.bdt-title-separator-wrapper > img');

        if (!$avdDivider.length) {
            return;
        }

        epObserveTarget($scope[0], function () {
            bdtUIkit.svg(divider, {
                strokeAnimation: true
            });
        }, {
            root: null, // Use the viewport as the root
            rootMargin: '0px', // No margin around the root
            threshold: 0.8 // 80% visibility (1 - 0.8)
        });

    };


    jQuery(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/bdt-step-flow.default', widgetStepFlow);
    });

}(jQuery, window.elementorFrontend));

/**
 * End step flow widget script
 */


/**
 * Start toggle widget script
 */

(function ($, elementor) {
    'use strict';
    var widgetToggle = function ($scope, $) {
        var $toggleContainer = $scope.find('.bdt-show-hide-container');
        var $toggle          = $toggleContainer.find('.bdt-show-hide');

        if ( !$toggleContainer.length ) {
            return;
        } 
        var $settings            = $toggle.data('settings');
        var toggleId             = $settings.id;
        var animTime             = $settings.scrollspy_time;
        var scrollspy_top_offset = $settings.scrollspy_top_offset;

        var by_widget_selector_status = $settings.by_widget_selector_status;
        var toggle_initially_open     = $settings.toggle_initially_open;
        var source_selector           = $settings.source_selector;
        var widget_visibility         = $settings.widget_visibility;
        var widget_visibility_tablet  = $settings.widget_visibility_tablet;
        var widget_visibility_mobile  = $settings.widget_visibility_mobile;
        var viewport_lg               = $settings.viewport_lg;
        var viewport_md               = $settings.viewport_md;

        var widget_visibility_filtered = widget_visibility;

        if ( $settings.widget_visibility == 'undefined' || $settings.widget_visibility == null ) {
            widget_visibility_filtered = widget_visibility = 0;
        }

        if ( $settings.widget_visibility_tablet == 'undefined' || $settings.widget_visibility_tablet == null ) {
            widget_visibility_tablet = widget_visibility;
        }

        if ( $settings.widget_visibility_mobile == 'undefined' || $settings.widget_visibility_mobile == null ) {
            widget_visibility_mobile = widget_visibility;
        }

        function widgetVsibleFiltered() {
            if ( (window.outerWidth) > (viewport_lg) ) {
                widget_visibility_filtered = widget_visibility;
            } else if ( (window.outerWidth) > (viewport_md) ) {
                widget_visibility_filtered = widget_visibility_tablet;
            } else {
                widget_visibility_filtered = widget_visibility_mobile;
            }
        }

        $(window).resize(function () {
            widgetVsibleFiltered();
        });


        function scrollspyHandler($toggle, toggleId, toggleBtn, animTime, scrollspy_top_offset) {
            if ( $settings.status_scrollspy === 'yes' && by_widget_selector_status !== 'yes' ) {
                if ( $($toggle).find('.bdt-show-hide-item') ) {
                    if ( $settings.hash_location === 'yes' ) {
                        window.location.hash = ($.trim(toggleId));
                    }
                    var scrollspyWrapper = $('#bdt-show-hide-' + toggleId).find('.bdt-show-hide-item');
                    $('html, body').animate({
                        easing   : 'slow',
                        scrollTop: $(scrollspyWrapper).offset().top - scrollspy_top_offset
                    }, animTime, function () {
                        //#code
                    }).promise().then(function () {
                        $(toggleBtn).siblings('.bdt-show-hide-content').slideToggle('slow', function () {
                            $(toggleBtn).parent().toggleClass('bdt-open');
                        });
                    });
                }
            } else {
                if ( by_widget_selector_status === 'yes' ) {
                    $(toggleBtn).parent().toggleClass('bdt-open');
                    $(toggleBtn).siblings('.bdt-show-hide-content').slideToggle('slow', function () {
                    });
                }else{
                    $(toggleBtn).siblings('.bdt-show-hide-content').slideToggle('slow', function () {
                        $(toggleBtn).parent().toggleClass('bdt-open');
                    });
                }
                
            }
        }

        $($toggle).find('.bdt-show-hide-title').off('click').on('click', function (event) {
            var toggleBtn = $(this);
            scrollspyHandler($toggle, toggleId, toggleBtn, animTime, scrollspy_top_offset);
        });

        function hashHandler() {
            toggleId             = window.location.hash.substring(1);
            var toggleBtn        = $('#bdt-show-hide-' + toggleId).find('.bdt-show-hide-title');
            var scrollspyWrapper = $('#bdt-show-hide-' + toggleId).find('.bdt-show-hide-item');
            $('html, body').animate({
                easing   : 'slow',
                scrollTop: $(scrollspyWrapper).offset().top - scrollspy_top_offset
            }, animTime, function () {
                //#code
            }).promise().then(function () {
                $(toggleBtn).siblings('.bdt-show-hide-content').slideToggle('slow', function () {
                    $(toggleBtn).parent().toggleClass('bdt-open');
                });
            });
        }

        $(window).on('load', function () {
            if ( $($toggleContainer).find('#bdt-show-hide-' + window.location.hash.substring(1)).length != 0 ) {
                if ( $settings.hash_location === 'yes' ) {
                    hashHandler();
                }
            }
        });

        /* Function to animate height: auto */
        function autoHeightAnimate(element, time){
    var curHeight = element.height(), // Get Default Height
        autoHeight = element.css('height', 'auto').height(); // Get Auto Height
          element.height(curHeight); // Reset to Default Height
          element.stop().animate({ height: autoHeight }, time); // Animate to Auto Height
      }
      function byWidgetHandler() {
        if ( $settings.status_scrollspy === 'yes' ) {
            $('html, body').animate({
                easing   : 'slow',
                scrollTop: $(source_selector).offset().top - scrollspy_top_offset
            }, animTime, function () {
                    //#code
                }).promise().then(function () {
                    if ( $(source_selector).hasClass('bdt-fold-close') ) {
                        // $(source_selector).css({
                        //     'max-height': '100%'
                        // }).removeClass('bdt-fold-close toggle_initially_open').addClass('bdt-fold-open');
                        $(source_selector).removeClass('bdt-fold-close toggle_initially_open').addClass('bdt-fold-open');
                        autoHeightAnimate($(source_selector), 500);
                    } else {
                        $(source_selector).css({
                            'height': widget_visibility_filtered + 'px'
                        }).addClass('bdt-fold-close').removeClass('bdt-fold-open');
                    }
                });
            } else {
                if ( $(source_selector).hasClass('bdt-fold-close') ) {
                    // $(source_selector).css({
                    //     'max-height': '100%'
                    // }).removeClass('bdt-fold-close toggle_initially_open').addClass('bdt-fold-open');
                    $(source_selector).removeClass('bdt-fold-close toggle_initially_open').addClass('bdt-fold-open');
                    autoHeightAnimate($(source_selector), 500);

                } else {
                    $(source_selector).css({
                        'height': widget_visibility_filtered + 'px',
                        'transition' : 'all 1s ease-in-out 0s'
                    }).addClass('bdt-fold-close').removeClass('bdt-fold-open');    
                } 
            }

        }


        if ( by_widget_selector_status === 'yes' ) {
            $($toggle).find('.bdt-show-hide-title').on('click', function () {
                byWidgetHandler();
            });

            if ( toggle_initially_open === 'yes' ) {
                $(source_selector).addClass('bdt-fold-toggle bdt-fold-open toggle_initially_open');
            } else {
                $(source_selector).addClass('bdt-fold-toggle bdt-fold-close toggle_initially_open');
            }

            $(window).resize(function () {
                visibilityCalled();
            });
            visibilityCalled();
        }

        function visibilityCalled() {
            if ( $(source_selector).hasClass('bdt-fold-close') ) {
                $(source_selector).css({
                    'height': widget_visibility_filtered + 'px'
                });
            } else {
                // $(source_selector).css({
                //     'max-height': '100%'
                // });
                autoHeightAnimate($(source_selector), 500);
            }
        }


    };
    jQuery(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/bdt-toggle.default', widgetToggle);
    });
}(jQuery, window.elementorFrontend));

/**
 * End toggle widget script
 */


/**
 * Start tutor lms grid widget script
 */

(function ($, elementor) {

	'use strict';

	var widgetTutorLMSGrid = function ($scope, $) {

		var $tutorLMS = $scope.find('.bdt-tutor-lms-course-grid'),
			$settings = $tutorLMS.data('settings');

		if (!$tutorLMS.length) {
			return;
		}

		if ($settings.tiltShow == true) {
			var elements = document.querySelectorAll($settings.id + " .bdt-tutor-course-item");
			VanillaTilt.init(elements);
		}

	};

	jQuery(window).on('elementor/frontend/init', function () {
		elementorFrontend.hooks.addAction('frontend/element_ready/bdt-tutor-lms-course-grid.default', widgetTutorLMSGrid);
	});

}(jQuery, window.elementorFrontend));

/**
 * End tutor lms grid widget script
 */

/**
 * Start tutor lms widget script
 */

(function ($, elementor) {

	'use strict';

	var widgetTutorCarousel = function ($scope, $) {

		var $tutorCarousel = $scope.find('.bdt-tutor-lms-course-carousel');

		if (!$tutorCarousel.length) {
			return;
		}

		var $tutorCarouselContainer = $tutorCarousel.find('.swiper-carousel'),
			$settings = $tutorCarousel.data('settings');

		// Access swiper class
		const Swiper = elementorFrontend.utils.swiper;
		initSwiper();

		async function initSwiper() {

			var swiper = await new Swiper($tutorCarouselContainer, $settings);

			if ($settings.pauseOnHover) {
				$($tutorCarouselContainer).hover(function () {
					(this).swiper.autoplay.stop();
				}, function () {
					(this).swiper.autoplay.start();
				});
			}
		};
	};


	jQuery(window).on('elementor/frontend/init', function () {
		elementorFrontend.hooks.addAction('frontend/element_ready/bdt-tutor-lms-course-carousel.default', widgetTutorCarousel);
	});

}(jQuery, window.elementorFrontend));

/**
 * End tutor lms widget script
 */
/**
 * Start user register widget script
 */

(function ($, elementor) {

    'use strict';

    var widgetUserRegistrationForm = {

        registraitonFormSubmit: function (_this, $scope) {

            bdtUIkit.notification({
                message: '<div bdt-spinner></div>' + $(_this).find('.bdt_spinner_message').val(),
                timeout: false
            });
            $(_this).find('button.bdt-button').attr("disabled", true);
            var redirect_url = $(_this).find('.redirect_after_register').val();
            $.ajax({
                type: 'POST',
                dataType: 'json',
                url: element_pack_ajax_login_config.ajaxurl,
                data: {
                    'action': 'element_pack_ajax_register', //calls wp_ajax_nopriv_element_pack_ajax_register
                    'first_name': $(_this).find('.first_name').val(),
                    'terms': $(_this).find('.user_terms').is(':checked'),
                    'last_name': $(_this).find('.last_name').val(),
                    'email': $(_this).find('.user_email').val(),
                    'password': $(_this).find('.user_password').val(),
                    'is_password_required': $(_this).find('.is_password_required').val(),
                    'g-recaptcha-response': $(_this).find('#g-recaptcha-response').val(),
                    'widget_id': $scope.data('id'),
                    'page_id': $(_this).find('.page_id').val(),
                    'security': $(_this).find('#bdt-user-register-sc').val(),
                    'lang': element_pack_ajax_login_config.language
                },
                success: function (data) {
                    var recaptcha_field = _this.find('.element-pack-google-recaptcha');
                    if (recaptcha_field.length > 0) {
                        var recaptcha_id = recaptcha_field.attr('data-widgetid');
                        grecaptcha.reset(recaptcha_id);
                        grecaptcha.execute(recaptcha_id);
                    }

                    if (data.registered === true) {
                        bdtUIkit.notification.closeAll();
                        bdtUIkit.notification({
                            message: '<div class="bdt-flex"><span bdt-icon=\'icon: info\'></span><span>' + data.message + '</span></div>',
                            status: 'primary'
                        });
                        if (redirect_url) {
                            document.location.href = redirect_url;
                        }
                    } else {
                        bdtUIkit.notification.closeAll();
                        bdtUIkit.notification({
                            message: '<div class="bdt-flex"><span bdt-icon=\'icon: warning\'></span><span>' + data.message + '</span></div>',
                            status: 'warning'
                        });
                    }
                    $(_this).find('button.bdt-button').attr("disabled", false);

                },
            });
        },
        load_recaptcha: function () {
            var reCaptchaFields = $('.element-pack-google-recaptcha'),
                widgetID;

            if (reCaptchaFields.length > 0) {
                reCaptchaFields.each(function () {
                    var self = $(this),
                        attrWidget = self.attr('data-widgetid');
                    // alert(self.data('sitekey'))
                    // Avoid re-rendering as it's throwing API error
                    if ((typeof attrWidget !== typeof undefined && attrWidget !== false)) {
                        return;
                    } else {
                        widgetID = grecaptcha.render($(this).attr('id'), {
                            sitekey: self.data('sitekey'),
                            callback: function (response) {
                                if (response !== '') {
                                    self.append(jQuery('<input>', {
                                        type: 'hidden',
                                        value: response,
                                        class: 'g-recaptcha-response'
                                    }));
                                }
                            }
                        });
                        self.attr('data-widgetid', widgetID);
                    }
                });
            }
        }

    }


    window.onLoadElementPackRegisterCaptcha = widgetUserRegistrationForm.load_recaptcha;

    var widgetUserRegisterForm = function ($scope, $) {
        var register_form = $scope.find('.bdt-user-register-widget'),
            recaptcha_field = $scope.find('.element-pack-google-recaptcha'),
            $userRegister = $scope.find('.bdt-user-register');

        // Perform AJAX register on form submit
        register_form.on('submit', function (e) {
            e.preventDefault();
            widgetUserRegistrationForm.registraitonFormSubmit(register_form, $scope)
        });

        if (elementorFrontend.isEditMode() && undefined === recaptcha_field.attr('data-widgetid')) {
            onLoadElementPackRegisterCaptcha();
        }

        if (recaptcha_field.length > 0) {
            grecaptcha.ready(function () {
                var recaptcha_id = recaptcha_field.attr('data-widgetid');
                grecaptcha.execute(recaptcha_id);
            });
        }

        var $settings = $userRegister.data('settings');

        if (!$settings || typeof $settings.passStrength === "undefined") {
            return;
        }

        var percentage = 0,
            $selector = $('#' + $settings.id),
            $progressBar = $('#' + $settings.id).find('.bdt-progress-bar');

        var passStrength = {
            progress: function ($value = 0) {
                if ($value <= 100) {
                    $($progressBar).css({
                        'width': $value + '%'
                    });
                }
            },
            formula: function (input, length) {

                if (length < 6) {
                    percentage = 0;
                    $($progressBar).css('background', '#ff4d4d'); //red
                } else if (length < 8) {
                    percentage = 10;
                    $($progressBar).css('background', '#ffff1a'); //yellow
                } else if (input.match(/0|1|2|3|4|5|6|7|8|9/) == null && input.match(/[A-Z]/) == null) {
                    percentage = 40;
                    $($progressBar).css('background', '#ffc14d'); //orange
                }else{
                    if (length < 12){
                        percentage = 50;
                        $($progressBar).css('background', '#1aff1a'); //green
                    }else{
                        percentage = 60;
                        $($progressBar).css('background', '#1aff1a'); //green
                    }
                }


                //Lowercase Words only
                if ((input.match(/[a-z]/) != null)) {
                    percentage += 10;
                }

                //Uppercase Words only
                if ((input.match(/[A-Z]/) != null)) {
                    percentage += 10;
                }

                //Digits only
                if ((input.match(/0|1|2|3|4|5|6|7|8|9/) != null)) {
                    percentage += 10;
                }

                //Special characters
                if ((input.match(/\W/) != null) && (input.match(/\D/) != null)) {
                    percentage += 10;
                }
                return percentage;
            },
            forceStrongPass: function (result) {
                if (result >= 70) {
                    $($selector).find('.elementor-field-type-submit .bdt-button').prop('disabled', false);
                } else {
                    $($selector).find('.elementor-field-type-submit .bdt-button').prop('disabled', true);
                }
            },
            init: function () {
                $scope.find('.user_password').keyup(function () {
                    var input = $(this).val(),
                        length = input.length;
                    let result = passStrength.formula(input, length);
                    passStrength.progress(result);

                    if (typeof $settings.forceStrongPass !== 'undefined') {
                        passStrength.forceStrongPass(result);
                    }
                });
                if (typeof $settings.forceStrongPass !== 'undefined') {
                    $($selector).find('.elementor-field-type-submit .bdt-button').prop('disabled', true);
                }

                $scope.find('.confirm_password').keyup(function () {
                    let input = $(this).val(),
                        length = input.length;
                    let result = passStrength.formula(input, length);
                    passStrength.progress(result);

                    let pass = $scope.find('.user_password').val();
                    
                    if(input !== pass){
                        $scope.find('.bdt-user-register-pass-res').removeClass('bdt-hidden');
                        $($selector).find('.elementor-field-type-submit .bdt-button').prop('disabled', true);
                    }else{
                        $scope.find('.bdt-user-register-pass-res').addClass('bdt-hidden');
                        if (typeof $settings.forceStrongPass !== 'undefined') {
                            passStrength.forceStrongPass(result);
                        }
                    }

                });
            }
        }

        passStrength.init();

    };


    jQuery(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/bdt-user-register.default', widgetUserRegisterForm);
        elementorFrontend.hooks.addAction('frontend/element_ready/bdt-user-register.bdt-dropdown', widgetUserRegisterForm);
        elementorFrontend.hooks.addAction('frontend/element_ready/bdt-user-register.bdt-modal', widgetUserRegisterForm);
    });

}(jQuery, window.elementorFrontend));

/**
 * End user register widget script
 */
jQuery(document).ready(function () {
    jQuery('body').on('click', '.bdt-element-link', function () {
        var $el = jQuery(this)
          , settings = $el.data("ep-wrapper-link");
        if (settings && settings.url && (/^https?:\/\//.test(settings.url) || settings.url.startsWith("#"))) {
            var id = "bdt-element-link-" + $el.data("id");
            0 === jQuery("#" + id).length && jQuery("body").append(jQuery("<a/>").prop({
                target: settings.is_external ? "_blank" : "_self",
                href: settings.url,
                class: "bdt-hidden",
                id: id,
                rel: settings.is_external ? "noopener noreferrer" : ""
            })),
            jQuery("#" + id)[0].click()
        }
    });
});

; (function ($, elementor) {
$(window).on('elementor/frontend/init', function () {
    var ModuleHandler = elementorModules.frontend.handlers.Base,
        ThreedText;

    ThreedText = ModuleHandler.extend({

        bindEvents: function () {
            this.run();
        },

        getDefaultSettings: function () {
            return {
                depth: '30px',
                layers: 8,
            };
        },

        onElementChange: debounce(function (prop) {
            if (prop.indexOf('ep_threed_text_') !== -1) {
                this.run();
            }
        }, 400),

        settings: function (key) {
            return this.getElementSettings('ep_threed_text_' + key);
        },

        run: function () {
            var options = this.getDefaultSettings(),
                $element = this.findElement('.elementor-heading-title, .bdt-main-heading-inner'),
                $widgetId = 'ep-' + this.getID(),
                $widgetIdSelect = '#' + $widgetId;

            jQuery($element).attr('id', $widgetId);

            if (this.settings('depth.size')) {
                options.depth = this.settings('depth.size') + this.settings('depth.unit') || '30px';
            }
            if (this.settings('layers')) {
                options.layers = this.settings('layers') || 8;
            }
            if (this.settings('perspective.size')) {
                options.perspective = this.settings('perspective.size') + 'px' || '500px';
            }
            if (this.settings('fade')) {
                options.fade = !!this.settings('fade');
            }
            // if (this.settings('direction')) {
            //     options.direction = this.settings('direction') || 'forwards';
            // }
            if (this.settings('event')) {
                options.event = this.settings('event') || 'pointer';
            }
            if (this.settings('event_rotation') && this.settings('event') != 'none') {
                options.eventRotation = this.settings('event_rotation.size') + 'deg' || '35deg';
            }
            if (this.settings('event_direction') && this.settings('event') != 'none') {
                options.eventDirection = this.settings('event_direction') || 'default';
            }

            if (this.settings('active') == 'yes') {

                var $text = $($widgetIdSelect).html();
                $($widgetIdSelect).parent().append('<div class="ep-z-text-duplicate" style="display:none;">' + $text + '</div>');

                $text = $($widgetIdSelect).parent().find('.ep-z-text-duplicate:first').html();

                $($widgetIdSelect).find('.z-text').remove();

                var ztxt = new Ztextify($widgetIdSelect, options, $text);
            }

            if (this.settings('depth_color')) {
                var depthColor = this.settings('depth_color') || '#fafafa';
                $($widgetIdSelect).find('.z-layers .z-layer:not(:first-child)').css('color', depthColor);
            }

            // if (this.settings('bg_color')) {
            //     var bgColor = this.settings('bg_color') || 'rgba(96, 125, 139, .5)';
            //     $($widgetIdSelect).find('.z-text > .z-layers').css('background', bgColor);
            // }

        }
    });

    elementorFrontend.hooks.addAction('frontend/element_ready/widget', function ($scope) {
        elementorFrontend.elementsHandler.addHandler(ThreedText, {
            $element: $scope
        });
    });

});
}) (jQuery, window.elementorFrontend);
/**
 * Start twitter carousel widget script
 */

( function( $, elementor ) {

	'use strict';

	var widgetProductCarousel = function( $scope, $ ) {

		var $ProductCarousel = $scope.find( '.bdt-ep-product-carousel' );
				
        if ( ! $ProductCarousel.length ) {
            return;
        }

		var $ProductCarouselContainer = $ProductCarousel.find('.swiper-carousel'),
			$settings 		 = $ProductCarousel.data('settings');

		// Access swiper class
        const Swiper = elementorFrontend.utils.swiper;
        initSwiper();
        
        async function initSwiper() {

			var swiper = await new Swiper($ProductCarouselContainer, $settings);

			if ($settings.pauseOnHover) {
				 $($ProductCarouselContainer).hover(function() {
					(this).swiper.autoplay.stop();
				}, function() {
					(this).swiper.autoplay.start();
				});
			}
		};

	};


	jQuery(window).on('elementor/frontend/init', function() {
		elementorFrontend.hooks.addAction( 'frontend/element_ready/bdt-product-carousel.default', widgetProductCarousel );
	});

}( jQuery, window.elementorFrontend ) );

/**
 * End twitter carousel widget script
 */


/**
 * Start age-gate script
 * Optimized version - No jQuery dependency
 */

(() => {
  "use strict";

  /**
   * Age Gate Modal Handler Class
   */
  class AgeGateModal {
    constructor(element, settings, isEditMode) {
      this.element = element;
      this.settings = settings;
      this.isEditMode = isEditMode;
      this.widgetId = settings.widgetId;
      this.abortController = new AbortController();
      this.signal = this.abortController.signal;
    }

    /**
     * Set localStorage with expiration
     */
    setLocalize() {
      if (this.isEditMode) {
        this.clearLocalize();
        return;
      }

      this.clearLocalize();

      const hours = this.settings.displayTimesExpire;
      const expires = hours * 60 * 60; // Convert to seconds
      const now = Date.now();
      const schedule = now + expires * 1000;

      if (localStorage.getItem(this.widgetId) === null) {
        localStorage.setItem(this.widgetId, "0");
        localStorage.setItem(`${this.widgetId}_expiresIn`, schedule.toString());
      }

      if (localStorage.getItem(this.widgetId) !== null) {
        let count = parseInt(localStorage.getItem(this.widgetId)) || 0;
        count++;
        localStorage.setItem(this.widgetId, count.toString());
      }
    }

    /**
     * Clear expired localStorage
     */
    clearLocalize() {
      const localizeExpiry = parseInt(
        localStorage.getItem(`${this.widgetId}_expiresIn`)
      );
      const now = Date.now();

      if (now >= localizeExpiry) {
        localStorage.removeItem(`${this.widgetId}_expiresIn`);
        localStorage.removeItem(this.widgetId);
      }
    }

    /**
     * Show modal based on display times
     */
    modalFire() {
      const displayTimes = this.settings.displayTimes || 1;
      const firedNotify = parseInt(localStorage.getItem(this.widgetId)) || 0;

      if (displayTimes !== false && firedNotify >= displayTimes) {
        return;
      }

      if (window.bdtUIkit?.modal) {
        window.bdtUIkit.modal(this.element, {
          bgclose: false,
          keyboard: false,
        }).show();
      }
    }

    /**
     * Handle age verification
     */
    setupAgeVerify() {
      let firedNotify = parseInt(localStorage.getItem(this.widgetId)) || 0;
      const modal = this.element;
      const buttons = modal.querySelectorAll(".bdt-button");
      const redirectLink = this.isEditMode ? false : this.settings.redirect_link;
      let requiredAge = this.settings.requiredAge;

      buttons.forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            const ageInput = modal.querySelector(".bdt-age-input");
            let inputAge = parseInt(ageInput?.value) || 0;

            // Handle yes/no buttons
            if (button.classList.contains("data-val-yes")) {
              inputAge = 18;
            }
            if (button.classList.contains("data-val-no")) {
              requiredAge = 18;
              inputAge = 1;
            }

            // Verify age
            if (inputAge >= requiredAge) {
              this.setLocalize();
              firedNotify += 1;
              if (window.bdtUIkit?.modal) {
                window.bdtUIkit.modal(this.element).hide();
              }
            } else {
              // Show error message
              const msgText = document.querySelector(".modal-msg-text");
              if (msgText) {
                msgText.classList.remove("bdt-hidden");
              }

              // Redirect if link is provided
              if (redirectLink !== false) {
                window.location.replace(redirectLink);
              }
            }
          },
          { signal: this.signal }
        );
      });

      // Handle modal hidden event
      if (window.bdtUIkit?.util) {
        window.bdtUIkit.util.on(this.element, "hidden", () => {
          if (this.isEditMode) {
            return;
          }

          if (redirectLink === false && firedNotify <= 0) {
            setTimeout(() => {
              this.modalFire();
            }, 1500);
            return;
          }

          if (redirectLink !== false && firedNotify <= 0) {
            window.location.replace(redirectLink);
          }
        });
      }
    }

    /**
     * Handle close button delay
     */
    setupCloseBtnDelay() {
      const { id: modalID, delayTime } = this.settings;
      const modalElement = document.getElementById(modalID);
      if (!modalElement) return;

      const closeButton = modalElement.querySelector("#bdt-modal-close-button");
      if (!closeButton) return;

      // Hide initially
      closeButton.style.display = "none";

      // Show on modal shown
      if (window.bdtUIkit?.util) {
        window.bdtUIkit.util.on(modalElement, "shown", () => {
          closeButton.style.display = "none";
          setTimeout(() => {
            closeButton.style.display = "";
            closeButton.style.opacity = "0";
            closeButton.style.transition = "opacity 0.3s";
            setTimeout(() => {
              closeButton.style.opacity = "1";
            }, 10);
          }, delayTime);
        });

        window.bdtUIkit.util.on(modalElement, "hide", () => {
          closeButton.style.display = "none";
        });
      }
    }

    /**
     * Initialize modal
     */
    init() {
      this.modalFire();
      this.setupAgeVerify();

      if (this.settings.closeBtnDelayShow) {
        this.setupCloseBtnDelay();
      }
    }

    /**
     * Cleanup
     */
    destroy() {
      this.abortController.abort();
    }
  }

  /**
   * Initialize age gate widget
   * @param {HTMLElement|jQuery} scope - Widget scope element
   */
  const widgetAgeGate = (scope) => {
    // Handle both jQuery objects and native DOM elements
    const scopeElement = scope instanceof jQuery ? scope[0] : scope;

    const modals = scopeElement.querySelectorAll(".bdt-age-gate");
    if (modals.length === 0) return;

    const isEditMode = Boolean(window.elementorFrontend?.isEditMode());

    modals.forEach((modal) => {
      // Get settings from data attribute
      const settingsData = modal.dataset.settings;
      if (!settingsData) return;

      let settings;
      try {
        settings = typeof settingsData === "string" ? JSON.parse(settingsData) : settingsData;
      } catch (e) {
        console.error("Failed to parse age gate settings:", e);
        return;
      }

      // Create and initialize modal instance
      const ageGateModal = new AgeGateModal(modal, settings, isEditMode);
      ageGateModal.init();

      // Store instance for cleanup
      modal._ageGateInstance = ageGateModal;
    });
  };

  // Initialize on Elementor frontend ready
  window.addEventListener("elementor/frontend/init", () => {
    if (window.elementorFrontend?.hooks) {
      elementorFrontend.hooks.addAction(
        "frontend/element_ready/bdt-age-gate.default",
        widgetAgeGate
      );
    }
  });
})();

/**
 * End age-gate script
 */

(() => {
    'use strict';

    window.addEventListener('elementor/frontend/init', () => {
        if (!window.elementorFrontend?.hooks) return;

        const ModuleHandler = elementorModules.frontend.handlers.Base;

        const widgetDarkMode = ModuleHandler.extend({

            bindEvents() {
                this.run();
            },

            getDefaultSettings() {
                return {
                    left             : 'unset',
                    time             : '.5s',
                    mixColor         : '#fff',
                    backgroundColor  : '#fff',
                    saveInCookies    : false,
                    label            : '🌓',
                    autoMatchOsTheme : false,
                };
            },

            onElementChange: debounce(function () {
                this.run();
            }, 400),

            settings(key) {
                return this.getElementSettings(key);
            },

            setCookie(name, value, days) {
                let expires = '';
                if (days) {
                    const date = new Date();
                    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                    expires = '; expires=' + date.toUTCString();
                }
                document.cookie = name + '=' + (value || '') + expires + '; path=/';
            },

            getCookie(name) {
                const nameEQ = name + '=';
                for (let c of document.cookie.split(';')) {
                    c = c.trim();
                    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
                }
                return null;
            },

            eraseCookie(name) {
                document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            },

            run() {
                const options = this.getDefaultSettings();

                options.time             = this.settings('time.size') / 1000 + 's';
                options.mixColor         = this.settings('mix_color');
                options.backgroundColor  = this.settings('default_background');
                options.saveInCookies    = this.settings('saveInCookies') === 'yes';
                options.autoMatchOsTheme = this.settings('autoMatchOsTheme') === 'yes';

                // Remove any previously applied dark-mode position classes
                const toRemove = [...document.body.classList].filter(c => /^bdt-dark-mode-\S+/.test(c));
                document.body.classList.remove(...toRemove);
                document.body.classList.add('bdt-dark-mode-position-' + this.settings('toggle_position'));

                const ignoreSelector = this.settings('ignore_element');
                if (ignoreSelector) {
                    document.querySelectorAll(ignoreSelector).forEach(el => el.classList.add('darkmode-ignore'));
                }

                if (!options.mixColor) return;

                document.querySelectorAll('.darkmode-toggle, .darkmode-layer, .darkmode-background')
                    .forEach(el => el.remove());

                const darkmode = new Darkmode(options);
                darkmode.showWidget();

                if (this.settings('default_mode') === 'dark') {
                    darkmode.toggle();
                    document.body.classList.add('darkmode--activated');
                    document.querySelectorAll('.darkmode-layer').forEach(el => {
                        el.classList.add('darkmode-layer--simple', 'darkmode-layer--expanded');
                    });
                } else {
                    document.body.classList.remove('darkmode--activated');
                    document.querySelectorAll('.darkmode-layer').forEach(el => {
                        el.classList.remove('darkmode-layer--simple', 'darkmode-layer--expanded');
                    });
                }

                const editMode = document.body.classList.contains('elementor-editor-active');

                if (!editMode && options.saveInCookies) {
                    document.querySelectorAll('.darkmode-toggle').forEach(el => {
                        el.addEventListener('click', () => {
                            this.eraseCookie('bdtDarkModeUserAction');
                            this.setCookie('bdtDarkModeUserAction', darkmode.isActivated() ? 'dark' : 'light', 10);
                        });
                    });

                    const userCookie = this.getCookie('bdtDarkModeUserAction');
                    if (userCookie !== null && userCookie !== 'undefined') {
                        if (userCookie === 'dark') {
                            darkmode.toggle();
                            document.body.classList.add('darkmode--activated');
                            document.querySelectorAll('.darkmode-layer').forEach(el => {
                                el.classList.add('darkmode-layer--simple', 'darkmode-layer--expanded');
                            });
                        } else {
                            document.body.classList.remove('darkmode--activated');
                            document.querySelectorAll('.darkmode-layer').forEach(el => {
                                el.classList.remove('darkmode-layer--simple', 'darkmode-layer--expanded');
                            });
                        }
                    }
                }
            },
        });

        elementorFrontend.hooks.addAction('frontend/element_ready/bdt-dark-mode.default', ($scope) => {
            elementorFrontend.elementsHandler.addHandler(widgetDarkMode, { $element: $scope });
        });
    });

})();

/**
 * End Dark Mode widget script
 */

/**
 * Start animated gradient background widget script
 * Optimized version - No jQuery dependency
 */

(() => {
  "use strict";

  window.addEventListener("elementor/frontend/init", () => {
    const ModuleHandler = elementorModules.frontend.handlers.Base;
    let AnimatedGradientBackground;

    AnimatedGradientBackground = ModuleHandler.extend({
      bindEvents: function () {
        this.run();
      },

      getDefaultSettings: function () {
        return {
          allowHTML: true,
        };
      },

      onElementChange: debounce(function (prop) {
        if (prop.indexOf("element_pack_agbg_") !== -1) {
          this.run();
        }
      }, 400),

      settings: function (key) {
        return this.getElementSettings(`element_pack_agbg_${key}`);
      },

      /**
       * Parse and standardize colors to desired formats
       * @param {string} color - Color string to parse
       * @returns {string} Standardized color
       */
      parseColor: function (color) {
        // Convert RGBA to 6-digit HEX if alpha is 1
        if (/^rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]*)\)$/.test(color)) {
          const [, r, g, b, a = "1"] = color.match(
            /^rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]*)\)$/
          );
          const alpha = parseFloat(a);

          if (alpha === 1) {
            // Convert to 6-digit HEX format
            return `#${((1 << 24) + (parseInt(r) << 16) + (parseInt(g) << 8) + parseInt(b))
              .toString(16)
              .slice(1)}`;
          }

          // Format as .decimal if alpha < 1
          const decimalPart = a.toString().split(".")[1] || "0";
          return `rgba(${r}, ${g}, ${b}, .${decimalPart})`;
        }

        // Convert 8-digit HEXA (#RRGGBBAA) to 6-digit HEX if alpha is 1
        if (/^#([A-Fa-f0-9]{8})$/.test(color)) {
          const rgba = color.match(/[A-Fa-f0-9]{2}/g).map((hex) => parseInt(hex, 16));
          const alpha = parseFloat((rgba[3] / 255).toFixed(2));

          if (alpha === 1) {
            return `#${color.slice(1, 7)}`; // Remove alpha part if 100% opaque
          }

          const decimalPart = alpha.toString().split(".")[1] || "0";
          return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, .${decimalPart})`;
        }

        // Convert 6-digit HEX to standard 6-digit HEX (lowercase)
        if (/^#([A-Fa-f0-9]{6})$/.test(color)) {
          return color.toLowerCase();
        }

        // Handle HSLA, standardizing alpha to .decimal format
        if (/^hsla?\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,?\s*([\d.]*)\)$/.test(color)) {
          const [, h, s, l, a = "1"] = color.match(
            /^hsla?\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,?\s*([\d.]*)\)$/
          );
          const alpha = parseFloat(a);

          if (alpha === 1) {
            return `hsl(${h}, ${s}%, ${l}%)`; // No alpha if fully opaque
          }

          const decimalPart = a.toString().split(".")[1] || "0";
          return `hsla(${h}, ${s}%, ${l}%, .${decimalPart})`;
        }

        // Return color as-is for named colors or other formats
        return color;
      },

      run: function () {
        if (this.settings("show") !== "yes") {
          return;
        }

        const sectionID = this.$element.data("id");
        const widgetContainer = document.querySelector(`.elementor-element-${sectionID}`);

        if (!widgetContainer) return;

        // Check if canvas already exists
        let canvasElement = widgetContainer.querySelector(".bdt-animated-gradient-background");

        if (!canvasElement) {
          // Create canvas element
          canvasElement = document.createElement("canvas");
          canvasElement.id = `canvas-basic-${sectionID}`;
          canvasElement.className = "bdt-animated-gradient-background";
          widgetContainer.prepend(canvasElement);
        }

        const gradientID = canvasElement.id;

        // Parse colors
        const colorList = this.settings("color_list");
        const colors = colorList.map((color) => [
          this.parseColor(color.start_color),
          this.parseColor(color.end_color),
        ]);

        // Get settings with defaults
        const direction = this.settings("direction") || "diagonal";
        const transitionSpeed = this.settings("transitionSpeed.size") || 5500;

        // Validate Granim library
        if (typeof Granim === "undefined") {
          console.error("Granim library is not loaded");
          return;
        }

        // Initialize Granim
        const granimInstance = new Granim({
          element: `#${gradientID}`,
          direction: direction,
          isPausedWhenNotInView: true,
          states: {
            "default-state": {
              gradients: colors,
              transitionSpeed: transitionSpeed,
            },
          },
        });
      },
    });

    // Register handlers for sections
    elementorFrontend.hooks.addAction(
      "frontend/element_ready/section",
      (scope) => {
        elementorFrontend.elementsHandler.addHandler(AnimatedGradientBackground, {
          $element: scope,
        });
      }
    );

    // Register handlers for containers
    elementorFrontend.hooks.addAction(
      "frontend/element_ready/container",
      (scope) => {
        elementorFrontend.elementsHandler.addHandler(AnimatedGradientBackground, {
          $element: scope,
        });
      }
    );
  });
})();

/**
 * End animated gradient background widget script
 */

; (function ($, elementor) {
    $(window).on('elementor/frontend/init', function () {
        var ModuleHandler = elementorModules.frontend.handlers.Base,
            Tooltip;

        Tooltip = ModuleHandler.extend({

            bindEvents: function () {
                this.run();
            },

            getDefaultSettings: function () {
                return {
                    allowHTML: true,
                };
            },

            onElementChange: debounce(function (prop) {
                if (prop.indexOf('element_pack_widget_') !== -1) {
                    this.instance.destroy();
                    this.run();
                }
            }, 400),

            settings: function (key) {
                return this.getElementSettings('element_pack_widget_' + key);
            },

            run: function () {
                var options = this.getDefaultSettings();
                var widgetID = this.$element.data('id');
                var widgetContainer = document.querySelector('.elementor-element-' + widgetID);

                if (this.settings('tooltip_text')) {
                    options.content = EP_SAFE_HTML(this.settings('tooltip_text'));
                }

                options.arrow = !!this.settings('tooltip_arrow');
                options.followCursor = !!this.settings('tooltip_follow_cursor');

                if (this.settings('tooltip_placement')) {
                    options.placement = this.settings('tooltip_placement');
                }

                if (this.settings('tooltip_trigger')) {
                    if (this.settings('tooltip_custom_trigger')) {
                        options.triggerTarget = document.querySelector(this.settings('tooltip_custom_trigger'));
                    } else {
                        options.trigger = this.settings('tooltip_trigger');
                    }
                }
                // if (this.settings('tooltip_animation_duration')) {
                //     options.duration = this.settings('tooltip_animation_duration.sizes.from');
                // }
                if (this.settings('tooltip_animation')) {
                    if (this.settings('tooltip_animation') === 'fill') {
                        options.animateFill = true;
                    } else {
                        options.animation = this.settings('tooltip_animation');
                    }
                }
                if (this.settings('tooltip_x_offset.size') || this.settings('tooltip_y_offset.size')) {
                    options.offset = [this.settings('tooltip_x_offset.size') || 0, this.settings('tooltip_y_offset.size') || 0];
                }
                if (this.settings('tooltip')) {
                    options.theme = 'bdt-tippy-' + widgetID;
                    this.instance = tippy(widgetContainer, options);
                }
            }
        });

        elementorFrontend.hooks.addAction('frontend/element_ready/widget', function ($scope) {
            elementorFrontend.elementsHandler.addHandler(Tooltip, {
                $element: $scope
            });
        });
    });
})(jQuery, window.elementorFrontend);

; (function ($, elementor) {
    $(window).on('elementor/frontend/init', function () {
        let ModuleHandler = elementorModules.frontend.handlers.Base,
            CursorEffect;

        CursorEffect = ModuleHandler.extend({
            bindEvents: function () {
                this.run();
            },
            getDefaultSettings: function () {
                return {

                };
            },
            onElementChange: debounce(function (prop) {
                if (prop.indexOf('element_pack_cursor_effects_') !== -1) {
                    this.run();
                }
            }, 400),

            settings: function (key) {
                return this.getElementSettings('element_pack_cursor_effects_' + key);
            },

            run: function () {
                if (this.settings("show") !== "yes") {
                    return;
                }

                // Disable on mobile
                const disableOnMobile = this.settings("disable_on_mobile") === "yes";
                const isMobile = window.innerWidth <= 767;
                if (disableOnMobile && isMobile) {
                    return;
                }

                var options = this.getDefaultSettings(),
                    elementID = this.$element.data("id"),
                    elementContainer = ".elementor-element-" + elementID,
                    $element = this.$element,
                    cursorStyle = this.settings("style");
                const checkClass = $(elementContainer).find(".bdt-cursor-effects");
                var source = this.settings("source");
                var gsapId = "bdt-ep-cursor-gsap-" + elementID;
                var elementEl = $element[0];
                var isGsap = source === "image"
                    && this.settings("image_gsap_animation") === "yes"
                    && $element.hasClass("cursor-effects-smooth-animation-yes");

                // ── GSAP cleanup: runs whenever GSAP mode is toggled off ──────────
                if (!isGsap) {
                    var stale = document.getElementById(gsapId);
                    if (stale) { stale.parentNode.removeChild(stale); }
                    if (elementEl._bdtGsapTicker) {
                        gsap.ticker.remove(elementEl._bdtGsapTicker);
                        elementEl._bdtGsapTicker = null;
                    }
                    if (elementEl._bdtGsapHandlers) {
                        elementEl.removeEventListener("mousemove", elementEl._bdtGsapHandlers.move);
                        elementEl.removeEventListener("mouseleave", elementEl._bdtGsapHandlers.leave);
                        elementEl._bdtGsapHandlers = null;
                    }
                }

                // ── GSAP Image Animation Mode ────────────────────────────────────
                if (isGsap) {
                    var gsapImage = this.settings("image_src.url");
                    var gsapWidth = this.settings("gsap_width.size") || 385;
                    var gsapHeight = this.settings("gsap_height.size") || 280;

                    // Rebuild gallery on each run() so size/image changes apply
                    var existing = document.getElementById(gsapId);
                    if (existing) { existing.parentNode.removeChild(existing); }

                    // position:fixed at 0,0 — movement via transform x/y for GPU compositing
                    $("body").append(
                        '<div id="' + gsapId + '" class="bdt-cursor-gsap-gallery"' +
                        ' style="position:fixed;top:0;left:0;width:' + gsapWidth + 'px;height:' + gsapHeight + 'px;' +
                        'z-index:9999;overflow:hidden;pointer-events:none;will-change:transform;">' +
                        '<img class="bdt-cursor-image" src="' + gsapImage + '"' +
                        ' style="width:100%;height:100%;object-fit:cover;display:block;">' +
                        "</div>"
                    );

                    var galleryEl = document.getElementById(gsapId);

                    gsap.set(galleryEl, { autoAlpha: 0, xPercent: -50, yPercent: -50 });

                    // Remove any stale listeners before re-attaching
                    if (elementEl._bdtGsapHandlers) {
                        elementEl.removeEventListener("mousemove", elementEl._bdtGsapHandlers.move);
                        elementEl.removeEventListener("mouseleave", elementEl._bdtGsapHandlers.leave);
                    }

                    // transform x/y + quickTo: GPU-accelerated, instant response, smooth deceleration
                    var xTo = gsap.quickTo(galleryEl, "x", { duration: 0.5, ease: "power3.out" });
                    var yTo = gsap.quickTo(galleryEl, "y", { duration: 0.5, ease: "power3.out" });

                    // isVisible flag: ensures image only appears when mouse ACTUALLY MOVES
                    // inside the element — not when the element scrolls under a stationary cursor.
                    var isVisible = false;

                    var onMove = function (e) {
                        xTo(e.clientX);
                        yTo(e.clientY);
                        if (!isVisible) {
                            isVisible = true;
                            gsap.to(galleryEl, { autoAlpha: 1, duration: 0.4, ease: "power2.out" });
                        }
                    };
                    var onLeave = function () {
                        isVisible = false;
                        gsap.to(galleryEl, { autoAlpha: 0, duration: 0.3, ease: "power2.in" });
                    };

                    elementEl._bdtGsapHandlers = { move: onMove, leave: onLeave };
                    elementEl.addEventListener("mousemove", onMove);
                    elementEl.addEventListener("mouseleave", onLeave);

                    return; // Skip Cotton.js initialisation
                }
                // ── End GSAP Mode ────────────────────────────────────────────────

                if ($(checkClass).length < 1) {
                    if (source === "image") {
                        var image = this.settings("image_src.url");
                        $(elementContainer).append(
                            '<div class="bdt-cursor-effects"><div id="bdt-ep-cursor-ball-effects-' +
                            elementID +
                            '" class="ep-cursor-ball"><img class="bdt-cursor-image"src="' +
                            image +
                            '"></div></div>'
                        );
                    } else if (source === "icons") {
                        var svg = this.settings("icons.value.url");
                        var icons = this.settings("icons.value");
                        if (svg !== undefined) {
                            $(elementContainer).append(
                                '<div class="bdt-cursor-effects"><div id="bdt-ep-cursor-ball-effects-' +
                                elementID +
                                '" class="ep-cursor-ball"><img class="bdt-cursor-image" src="' +
                                svg +
                                '"></img></div></div>'
                            );
                        } else {
                            $(elementContainer).append(
                                '<div class="bdt-cursor-effects"><div id="bdt-ep-cursor-ball-effects-' +
                                elementID +
                                '" class="ep-cursor-ball"><i class="' +
                                icons +
                                ' bdt-cursor-icons"></i></div></div>'
                            );
                        }
                    } else if (source === "text") {
                        var text = this.settings("text_label");
                        $(elementContainer).append(
                            '<div class="bdt-cursor-effects"><div id="bdt-ep-cursor-ball-effects-' +
                            elementID +
                            '" class="ep-cursor-ball"><span class="bdt-cursor-text">' +
                            text +
                            "</span></div></div>"
                        );
                    } else {
                        $(elementContainer).append(
                            '<div class="bdt-cursor-effects ' +
                            cursorStyle +
                            '"><div id="bdt-ep-cursor-ball-effects-' +
                            elementID +
                            '" class="ep-cursor-ball"></div><div id="bdt-ep-cursor-circle-effects-' +
                            elementID +
                            '"  class="ep-cursor-circle"></div></div>'
                        );
                    }
                }
                const cursorBallID =
                    "#bdt-ep-cursor-ball-effects-" + this.$element.data("id");
                const cursorBall = document.querySelector(cursorBallID);
                options.models = elementContainer;
                options.speed = 1;
                options.centerMouse = true;
                new Cotton(cursorBall, options);

                if (source === "default") {
                    const cursorCircleID =
                        "#bdt-ep-cursor-circle-effects-" + this.$element.data("id");
                    const cursorCircle = document.querySelector(cursorCircleID);
                    options.models = elementContainer;
                    options.speed = this.settings("speed")
                        ? this.settings("speed.size")
                        : 0.725;
                    options.centerMouse = true;
                    new Cotton(cursorCircle, options);
                }
            }
        });

        // Handle widgets
        elementorFrontend.hooks.addAction('frontend/element_ready/widget', function ($scope) {
            elementorFrontend.elementsHandler.addHandler(CursorEffect, {
                $element: $scope
            });
        });

        // Handle sections
        elementorFrontend.hooks.addAction('frontend/element_ready/section', function ($scope) {
            elementorFrontend.elementsHandler.addHandler(CursorEffect, {
                $element: $scope
            });
        });

        // Handle containers
        elementorFrontend.hooks.addAction('frontend/element_ready/container', function ($scope) {
            elementorFrontend.elementsHandler.addHandler(CursorEffect, {
                $element: $scope
            });
        });
    });
})(jQuery, window.elementorFrontend);

/**
 * Start Content Switcher widget script
 */

(() => {
    'use strict';

    /**
     * Initialize content switcher widget
     * @param {jQuery} scope - Widget scope element
     */
    const widgetContentSwitcher = (scope) => {
        const scopeElement = scope instanceof jQuery ? scope[0] : scope;

        const contentSwitcher = scopeElement.querySelector('.bdt-content-switcher');
        if (!contentSwitcher) return;

        const parseData = (key) => {
            const raw = contentSwitcher.dataset[key];
            if (!raw) return undefined;
            try {
                return typeof raw === 'string' ? JSON.parse(raw) : raw;
            } catch (e) {
                console.error(`Failed to parse content switcher data-${key}:`, e);
                return undefined;
            }
        };

        const settings       = parseData('settings');
        const linkedSections = parseData('linkedSections');
        const linkedWidgets  = parseData('linkedWidgets');
        const editMode       = Boolean(elementorFrontend.isEditMode());

        // ── Shared helpers ──────────────────────────────────────────────────

        const sectionContainerId = linkedSections ? `bdt-content-switcher-section-${linkedSections.id}` : null;

        const updateLinkedSectionActive = (index) => {
            if (!linkedSections?.positionUnchanged || !sectionContainerId) return;
            const items = document.querySelectorAll(`#${sectionContainerId} .bdt-switcher-section-content-inner`);
            items.forEach(item => item.classList.remove('bdt-active'));
            items[index]?.classList.add('bdt-active');
        };

        const updateLinkedWidgets = (activeIndex) => {
            if (!linkedWidgets) return;
            Object.entries(linkedWidgets.widgets).forEach(([idx, widgetId]) => {
                const widget = document.getElementById(widgetId);
                if (!widget) return;
                const isActive = +idx === activeIndex;
                widget.style.opacity = isActive ? '1' : '0';
                widget.style.display = isActive ? 'block' : 'none';
            });
        };

        // ── Handle linked sections ───────────────────────────────────────────

        if (linkedSections !== undefined && !editMode) {
            Object.entries(linkedSections.sections).forEach(([index, sectionId]) => {
                const idx              = +index;
                const switcherContainer = contentSwitcher.querySelectorAll('.bdt-switcher-content')[idx];
                const sectionContent   = document.getElementById(sectionId);

                if (!sectionContent) return;

                if (linkedSections.positionUnchanged !== true) {
                    const target = switcherContainer?.querySelector('.bdt-switcher-item-content-section');
                    if (switcherContainer && target) {
                        target.appendChild(sectionContent);
                    }
                } else {
                    const switchers       = contentSwitcher.querySelectorAll('.bdt-switcher-content');
                    const isPrimaryActive = contentSwitcher.querySelector('.bdt-primary')?.classList.contains('bdt-active');
                    const isIndexActive   = switchers[idx]?.classList.contains('bdt-active');
                    const activeClass     = (idx === 0 && isPrimaryActive) || (idx > 0 && isIndexActive) ? 'bdt-active' : '';

                    if (!document.getElementById(sectionContainerId)) {
                        sectionContent.parentElement.insertAdjacentHTML(
                            'beforeend',
                            `<div id="${sectionContainerId}" class="bdt-switcher bdt-switcher-section-content"></div>`
                        );
                    }

                    const container = document.getElementById(sectionContainerId);
                    container.appendChild(sectionContent);

                    const wrapper = document.createElement('div');
                    wrapper.className = `bdt-switcher-section-content-inner ${activeClass}`.trim();
                    sectionContent.parentNode.insertBefore(wrapper, sectionContent);
                    wrapper.appendChild(sectionContent);
                }
            });
        }

        // ── Handle linked widgets initial state ──────────────────────────────

        if (linkedWidgets !== undefined && !editMode) {
            Object.entries(linkedWidgets.widgets).forEach(([index, widgetId]) => {
                const widget = document.getElementById(widgetId);
                if (!widget) return;

                const idx        = +index;
                const switchers  = contentSwitcher.querySelectorAll('.bdt-switcher-content');
                let isActive     = false;

                if (settings?.switcherStyle !== 'button') {
                    if (idx === 0) {
                        isActive = contentSwitcher.querySelector('.bdt-primary')?.classList.contains('bdt-active') ?? false;
                    } else if (idx === 1) {
                        isActive = contentSwitcher.querySelector('.bdt-secondary')?.classList.contains('bdt-active') ?? false;
                    }
                } else {
                    isActive = switchers[idx]?.classList.contains('bdt-active') ?? false;
                }

                Object.assign(widget.style, {
                    opacity         : isActive ? '1' : '0',
                    display         : isActive ? 'block' : 'none',
                    gridRowStart    : '1',
                    gridColumnStart : '1'
                });

                widget.parentElement.style.display = 'grid';
            });
        }

        // ── Toggle switcher (checkbox style) ────────────────────────────────

        if (settings?.switcherStyle !== 'button') {
            const checkbox        = contentSwitcher.querySelector('input[type="checkbox"]');
            const primarySwitcher = contentSwitcher.querySelector('.bdt-primary-switcher');
            const secondarySwitcher = contentSwitcher.querySelector('.bdt-secondary-switcher');
            const primaryIcon     = contentSwitcher.querySelector('.bdt-primary-icon');
            const secondaryIcon   = contentSwitcher.querySelector('.bdt-secondary-icon');
            const primaryText     = contentSwitcher.querySelector('.bdt-primary-text');
            const secondaryText   = contentSwitcher.querySelector('.bdt-secondary-text');
            const primaryContent  = contentSwitcher.querySelector('.bdt-switcher-content.bdt-primary');
            const secondaryContent = contentSwitcher.querySelector('.bdt-switcher-content.bdt-secondary');

            const toggleCheckboxState = (isChecked) => {
                [primarySwitcher, primaryIcon, primaryText, primaryContent].forEach(el => {
                    el?.classList.toggle('bdt-active', !isChecked);
                });
                [secondarySwitcher, secondaryIcon, secondaryText, secondaryContent].forEach(el => {
                    el?.classList.toggle('bdt-active', isChecked);
                });
                updateLinkedSectionActive(isChecked ? 1 : 0);
                updateLinkedWidgets(isChecked ? 1 : 0);
            };

            checkbox?.addEventListener('change', (e) => toggleCheckboxState(e.target.checked));

        } else {

        // ── Button / tab switcher ────────────────────────────────────────────

            const tabs = contentSwitcher.querySelectorAll('.bdt-content-switcher-tab');

            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const id      = tab.id;
                    const content = contentSwitcher.querySelector(`.bdt-switcher-content[data-content-id="${id}"]`);
                    const index   = [...tab.parentElement.children].indexOf(tab);

                    [...tab.parentElement.children].forEach(t => t.classList.remove('bdt-active'));
                    tab.classList.add('bdt-active');

                    [...(tab.parentElement.nextElementSibling?.children ?? [])].forEach(c => c.classList.remove('bdt-active'));
                    content?.classList.add('bdt-active');

                    updateLinkedSectionActive(index);
                    updateLinkedWidgets(index);
                });
            });
        }
    };

    window.addEventListener('elementor/frontend/init', () => {
        if (window.elementorFrontend?.hooks) {
            elementorFrontend.hooks.addAction('frontend/element_ready/bdt-content-switcher.default', widgetContentSwitcher);
        }
    });

})();

/**
 * End Content Switcher widget script
 */

/**
 * Start interactive card widget script
 */

(function () {
    'use strict';

    const widgetInteractiveCard = (scope) => {
        const scopeEl = scope instanceof jQuery ? scope[0] : scope;
        const iCardMain = scopeEl.querySelector('.bdt-interactive-card');
        if (!iCardMain) return;

        let settings = {};
        try {
            const raw = iCardMain.dataset.settings;
            settings = raw ? JSON.parse(raw) : {};
        } catch (_) {}

        if (!settings.id) return;

        const waveEl = document.getElementById(settings.id);
        if (!waveEl || typeof wavify !== 'function') return;

        wavify(waveEl, {
            height: 60,
            bones: settings.wave_bones ?? 3,
            amplitude: settings.wave_amplitude ?? 40,
            speed: settings.wave_speed ?? 0.25
        });

        setTimeout(() => {
            iCardMain.classList.add('bdt-wavify-active');
        }, 1000);
    };

    window.addEventListener('elementor/frontend/init', () => {
        if (!window.elementorFrontend?.hooks) return;
        elementorFrontend.hooks.addAction('frontend/element_ready/bdt-interactive-card.default', widgetInteractiveCard);
    });
})();

/**
 * End interactive card widget script
 */

/**
 * Start scrollnav widget script
 */

( function( $, elementor ) {

	'use strict';

	var widgetScrollNav = function( $scope, $ ) {

		var $scrollnav = $scope.find( '.bdt-dotnav > li' );

        if ( ! $scrollnav.length ) {
            return;
        }

		var $tooltip = $scrollnav.find('> .bdt-tippy-tooltip'),
			widgetID = $scope.data('id');
		
		$tooltip.each( function( index ) {
			tippy( this, {
				allowHTML: true,
				theme: 'bdt-tippy-' + widgetID
			});				
		});

	};


	jQuery(window).on('elementor/frontend/init', function() {
		elementorFrontend.hooks.addAction( 'frontend/element_ready/bdt-scrollnav.default', widgetScrollNav );
	});

}( jQuery, window.elementorFrontend ) );

/**
 * End scrollnav widget script
 */


// Common js for review card, review card carousel, review card grid, testimonial carousel, testimonial grid
(function ($, elementor) {
    "use strict";
    $(window).on("elementor/frontend/init", function () {
        /** Read more */
        const readMoreWidgetHandler = function readMoreWidgetHandler($scope) {
            if (jQuery($scope).find(".bdt-ep-read-more-text").length) {
                jQuery($scope)
                    .find(".bdt-ep-read-more-text")
                    .each(function () {
                        var words_limit_settings = $(this).data("read-more");
                        var max_words = words_limit_settings.words_length || 20; // Set the maximum number of words to show
                        var content = $(this).html(); // Get the full content
                        var cleanContent = content.replace(/<\/?[^>]+(>|$)/g, ""); // Removes all HTML tags
                        var words = cleanContent.split(/\s+/);

                        if (words.length > max_words) {
                            var short_content = words.slice(0, max_words).join(" "); // Get the first part of the content
                            var long_content = words.slice(max_words).join(" "); // Get the remaining part of the content

                            $(this).html(`
                          ${short_content}
                          <a href="#" class="bdt_read_more">...${ElementPackConfig.words_limit.read_more}</a>
                          <span class="bdt_more_text" style="display:none;">${long_content}</span>
                          <a href="#" class="bdt_read_less" style="display:none;">${ElementPackConfig.words_limit.read_less}</a>
                      `);

                            $(this)
                                .find("a.bdt_read_more")
                                .on('click', function (event) {
                                    event.preventDefault();
                                    $(this).hide(); // Hide the read more link
                                    $(this).siblings(".bdt_more_text").show(); // Show the more text
                                    $(this).siblings("a.bdt_read_less").show(); // Show the read less link
                                });

                            $(this)
                                .find("a.bdt_read_less")
                                .click(function (event) {
                                    event.preventDefault();
                                    $(this).hide(); // Hide the read less link
                                    $(this).siblings(".bdt_more_text").hide(); // Hide the more text
                                    $(this).siblings("a.bdt_read_more").show(); // Show the read more link
                                });
                        }
                    });
            }
        };

        const readMoreWidgetsHanlders = {
            "bdt-review-card.default": readMoreWidgetHandler,
            "bdt-review-card-carousel.default": readMoreWidgetHandler,
            "bdt-review-card-grid.default": readMoreWidgetHandler,
            "bdt-testimonial-carousel.default": readMoreWidgetHandler,
            "bdt-testimonial-carousel.bdt-twyla": readMoreWidgetHandler,
            "bdt-testimonial-carousel.bdt-vyxo": readMoreWidgetHandler,
            "bdt-testimonial-grid.default": readMoreWidgetHandler,
            "bdt-testimonial-slider.default": readMoreWidgetHandler,
            "bdt-testimonial-slider.bdt-single": readMoreWidgetHandler,
            "bdt-testimonial-slider.bdt-thumb": readMoreWidgetHandler,
        };

        $.each(readMoreWidgetsHanlders, function (widgetName, handlerFn) {
            elementorFrontend.hooks.addAction(
                "frontend/element_ready/" + widgetName,
                handlerFn
            );
        });
        /** /Read more */
    });
})(jQuery, window.elementorFrontend);

// end
