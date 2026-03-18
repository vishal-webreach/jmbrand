(function($) {
    'use strict';

    const ElementPackEditor = {
        init() {
            elementor.channels.editor.on('section:activated', this.onAnimatedBoxSectionActivated);
            window.elementor.on('preview:loaded', this.onPreviewLoaded);
        },

        onPreviewLoaded() {
            const elementorFrontend = $('#elementor-preview-iframe')[0].contentWindow.elementorFrontend;
            elementorFrontend.hooks.addAction('frontend/element_ready/widget', () => {
                // Template edit link functionality can be added here if needed
            });
        }
    };

    $(window).on('elementor:init', ElementPackEditor.init.bind(ElementPackEditor));
    window.ElementPackEditor = ElementPackEditor;





    elementor.hooks.addFilter("panel/elements/regionViews", function(panel) {
        // Add pro icon styles
        $('body').append('<style>.bdt-pro-unlock-icon:after{right: auto !important; left: 5px !important;}</style>');

        if (ElementPackConfig.pro_installed || ElementPackConfig.promotional_widgets <= 0) {
            return panel;
        }

        const { promotional_widgets: promotionalWidgets } = ElementPackConfig;
        const { collection: elementsCollection } = panel.elements.options;
        const { collection: categories } = panel.categories.options;
        const { view: categoriesView } = panel.categories;
        const { view: elementsView } = panel.elements;
        
        let freeCategoryIndex;
        const proWidgets = [];

        // Add promotional widgets to collection
        promotionalWidgets.forEach(widget => {
            elementsCollection.add({
                name: widget.name,
                title: widget.title,
                icon: widget.icon,
                categories: widget.categories,
                editable: false
            });
        });

        // Filter pro widgets
        elementsCollection.each(widget => {
            if (widget.get("categories")[0] === "element-pack-pro") {
                proWidgets.push(widget);
            }
        });

        // Add pro category
        freeCategoryIndex = categories.findIndex({ name: "element-pack" });
        if (freeCategoryIndex) {
            categories.add({
                name: "element-pack-pro",
                title: "Element Pack Pro",
                defaultActive: false,
                items: proWidgets
            }, { at: freeCategoryIndex + 1 });
        }

        const promotionalWidgetHandler = {
            getWedgetOption(name) {
                return promotionalWidgets.find(item => item.name === name);
            },

            className() {
                let className = 'elementor-element-wrapper';
                if (!this.isEditable()) {
                    className += ' elementor-element--promotion';
                }
                return className;
            },

            onMouseDown() {
                this.constructor.__super__.onMouseDown.call(this);
                const promotion = this.getWedgetOption(this.model.get("name"));
                elementor.promotion.showDialog({
                    title: sprintf(wp.i18n.__('%s', 'elementor'), this.model.get("title")),
                    content: sprintf(wp.i18n.__('Use %s widget and dozens more pro features to extend your toolbox and build sites faster and better.', 'elementor'), this.model.get("title")),
                    targetElement: this.el,
                    position: { blockStart: '-7' },
                    actionButton: {
                        url: promotion.action_button.url,
                        text: promotion.action_button.text,
                        classes: promotion.action_button.classes || ['elementor-button', 'elementor-button-success']
                    }
                });
            }
        };

        panel.elements.view = elementsView.extend({
            childView: elementsView.prototype.childView.extend(promotionalWidgetHandler)
        });

        panel.categories.view = categoriesView.extend({
            childView: categoriesView.prototype.childView.extend({
                childView: categoriesView.prototype.childView.prototype.childView.extend(promotionalWidgetHandler)
            })
        });

        return panel;
    });

    // Element Pack Dynamic Tags Override (when Pro is not active)
    if (ElementPackConfig.elementPackDynamicTags?.enabled && !ElementPackConfig.elementPackDynamicTags.isProActive) {
        
        const EPDynamicTagsOverride = {
            debounceTimer: null,

            init() {
                this.bindEvents();
            },

            bindEvents() {
                elementor.hooks.addAction('panel/open_editor/widget', () => {
                    setTimeout(() => this.overrideNativeDynamicTags(), 500);
                });
                this.observePanelChanges();
            },

            observePanelChanges() {
                if (!window.MutationObserver) return;
                
                const targetNode = document.getElementById('elementor-panel-content-wrapper');
                if (!targetNode) return;

                const observer = new MutationObserver(() => {
                    clearTimeout(this.debounceTimer);
                    this.debounceTimer = setTimeout(() => this.overrideNativeDynamicTags(), 300);
                });
                
                observer.observe(targetNode, { childList: true, subtree: true });
            },

            overrideNativeDynamicTags() {
                $('.elementor-control-dynamic-switcher').each((index, element) => {
                    const $button = $(element);
                    
                    if ($button.hasClass('ep-enhanced')) return;
                    
                    $button.addClass('ep-enhanced')
                           .on('click.ep-combined-dialog', () => {
                               this.showCombinedUpgradeDialog(element);
                           });
                });
            },

            showCombinedUpgradeDialog(targetElement) {
                const { proFeatures: config, upgradeUrl } = ElementPackConfig.elementPackDynamicTags;
                
                const combinedContent = `
                    <div class="ep-combined-promotion">
                        <div class="bdt-promotion-section">
                            <h4 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">🚀 ${config.title}</h4>
                            <p style="margin: 0 0 15px 0; color: #666; line-height: 1.5;">${config.content}</p>
                            <a href="${upgradeUrl}" target="_blank" style="display: inline-block; background: #007cba; color: white; padding: 8px 16px; text-decoration: none; border-radius: 3px; margin-right: 10px;">${config.upgradeText}</a>
                        </div>
                        <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ddd;">
                        <div class="elementor-promotion-section">
                            <h4 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">⚡ Dynamic Content (Elementor Pro)</h4>
                            <p style="margin: 0 0 15px 0; color: #666; line-height: 1.5;">Create more personalized and dynamic sites by populating data from various sources with dozens of dynamic tags to choose from.</p>
                            <a href="https://elementor.com/pro/" target="_blank" style="display: inline-block; background: #E2498A; color: white; padding: 8px 16px; text-decoration: none; border-radius: 3px;">Upgrade Elementor</a>
                        </div>
                    </div>
                `;

                elementor.promotion.showDialog({
                    title: 'Dynamic Content - Pro',
                    content: combinedContent,
                    targetElement,
                    position: { blockStart: '-10' }
                });
                
                // Remove empty button wrapper
                setTimeout(() => {
                    $('.dialog-buttons-wrapper.dialog-buttons-buttons-wrapper').remove();
                }, 10);
            }
        };

        // Initialize the Dynamic Tags Override system
        $(() => EPDynamicTagsOverride.init());
    }

    // Elementor Control Lock (when Pro is not active)
    if (!ElementPackConfig.pro_installed) {
        
        const ElementPackControlLock = {
            // Configuration for locked widgets and extensions
            config: {
                widgets: {
                    'bdt-creative-button': { 'aura': 'anthe' },
                    'bdt-content-switcher': { 'button': '1', 'template': 'content', 'link_section': 'content', 'link_widget': 'content', 'price_card': 'content' },
                    'bdt-social-share': { 'icon': 'icon-text', 'text': 'icon-text' },
                    'bdt-scrollnav': { 'dot': 'default' }
                },
                // Default configuration for all extensions
                extensionDefaults: {
                    selectors: ['.bdt-ep-lock-control select'],
                    contexts: ['section', 'column', 'container']
                },
                extensions: {
                    'bdt-backdrop-filter': {
                        options: { 'liquid_glass': 'backdrop' }
                    }
                }
            },
            
            // State management
            state: {
                currentContext: null,
                currentType: null,
                debounceTimer: null
            },
            
            // Constants
            TOOLTIP_TEXT: 'This option is only available in Element Pack Pro',
            DEBOUNCE_DELAY: 200,
            LOCK_DELAY: 300,

            init() {
                this.bindEvents();
            },

            bindEvents() {
                // Unified panel opening handler
                this.bindPanelEvents();
                
                // Section activation handler
                elementor.channels.editor.on('section:activated', () => {
                    this.handleSectionActivation();
                });

                // Panel changes observer
                this.observePanelChanges();
            },

            bindPanelEvents() {
                // Widget panel opening
                elementor.hooks.addAction('panel/open_editor/widget', (panel, model) => {
                    const widgetType = model.get('widgetType');
                    this.updateContext('widget', widgetType);
                    this.scheduleLock();
                });

                // Extension contexts (using common defaults)
                this.config.extensionDefaults.contexts.forEach(context => {
                    elementor.hooks.addAction(`panel/open_editor/${context}`, () => {
                        // Check all extensions for this context
                        Object.keys(this.config.extensions).forEach(extensionKey => {
                            this.updateContext('extension', extensionKey);
                        });
                        this.scheduleLock();
                    });
                });
            },

            updateContext(type, identifier) {
                this.state.currentType = type;
                this.state.currentContext = identifier;
            },

            handleSectionActivation() {
                if (this.shouldLockCurrentContext()) {
                    this.scheduleLock();
                }
                // Always check extensions on section activation
                this.lockAllExtensions();
            },

            shouldLockCurrentContext() {
                const { currentType, currentContext } = this.state;
                
                if (currentType === 'widget') {
                    return Object.keys(this.config.widgets).includes(currentContext);
                }
                
                if (currentType === 'extension') {
                    return Object.keys(this.config.extensions).includes(currentContext);
                }
                
                return false;
            },

            scheduleLock(delay = this.LOCK_DELAY) {
                setTimeout(() => {
                    if (this.state.currentType === 'widget') {
                        this.lockWidget(this.state.currentContext);
                    } else if (this.state.currentType === 'extension') {
                        this.lockExtension(this.state.currentContext);
                    }
                }, delay);
            },

            observePanelChanges() {
                if (!window.MutationObserver) return;
                
                const targetNode = document.getElementById('elementor-panel-content-wrapper');
                if (!targetNode) return;

                const observer = new MutationObserver(() => {
                    clearTimeout(this.state.debounceTimer);
                    this.state.debounceTimer = setTimeout(() => {
                        this.handlePanelMutation();
                    }, this.DEBOUNCE_DELAY);
                });
                
                observer.observe(targetNode, { childList: true, subtree: true });
            },

            handlePanelMutation() {
                if (this.shouldLockCurrentContext()) {
                    if (this.state.currentType === 'widget') {
                        this.lockWidget(this.state.currentContext);
                    } else if (this.state.currentType === 'extension') {
                        this.lockExtension(this.state.currentContext);
                    }
                }
                // Always check all extensions
                this.lockAllExtensions();
            },

            lockWidget(widgetType) {
                const lockedOptions = this.config.widgets[widgetType];
                if (!lockedOptions) return;

                this.lockSelectOptions('.bdt-ep-lock-control select', lockedOptions);
            },

            lockExtension(extensionKey) {
                const extension = this.config.extensions[extensionKey];
                if (!extension) return;

                // Use common selectors for all extensions
                this.config.extensionDefaults.selectors.forEach(selector => {
                    this.lockSelectOptions(selector, extension.options);
                });
            },

            lockAllExtensions() {
                Object.keys(this.config.extensions).forEach(extensionKey => {
                    this.lockExtension(extensionKey);
                });
            },

            lockSelectOptions(selector, lockedOptions) {
                const $selectControls = $(selector);
                if (!$selectControls.length) return;

                $selectControls.each((index, select) => {
                    const $select = $(select);
                    Object.keys(lockedOptions).forEach(optionValue => {
                        const $option = $select.find(`option[value="${optionValue}"]`);
                        if ($option.length && !$option.prop('disabled')) {
                            $option.prop('disabled', true)
                                   .attr('title', this.TOOLTIP_TEXT);
                        }
                    });
                });
            }
        };

        // Initialize the Element Pack Control Lock system
        $(() => ElementPackControlLock.init());
    }

})(jQuery);