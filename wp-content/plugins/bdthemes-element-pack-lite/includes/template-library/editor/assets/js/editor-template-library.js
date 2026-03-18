!function (e) {
    'use strict';
    var EpModel, EpControler, EpConfig = window.ElementPackLibreryData || {};
    EpControler = {
        EpTemplateHeaderView            : null,
        EpTemplateLoadingView           : null,
        EpTemplateLayoutView            : null,
        EpTemplateErrorView             : null,
        EpTemplateBodyView              : null,
        EpTemplateCollectionView        : null,
        EpTemplateTabsCollectionView    : null,
        EpTemplateTabsItemView          : null,
        EpTemplateTemplateItemView      : null,
        EpTemplatePreviewView           : null,
        EpTemplateHeaderBack            : null,
        EpTemplateHeaderInsertButton    : null,
        EpTemplateInsertTemplateBehavior: null,
        EpTemplateProButton             : null,
        EpTemplateTabsCollection        : null,
        EpTemplateCollection            : null,
        EpTemplateLibraryTemplateModel  : null,
        EpFiltersCollectionView         : null,
        EpFiltersItemView               : null,
        EpCategoriesCollection          : null,
        EpCategoryModel                 : null,
        EpTabModel                      : null,
        init                            : function () {
            var e = this;
            e.EpTemplateLibraryTemplateModel = Backbone.Model.extend({
                defaults: {
                    id         : 0,
                    template_id: 0,
                    title      : '',
                    thumbnail  : '',
                    demo_url   : '',
                    is_pro     : '',
                    preview    : '',
                    source     : '',
                    package    : '',
                    date       : '',
                    categories : ''
                }
            }), e.EpCategoryModel = Backbone.Model.extend({
                defaults: {
                    term_slug: '',
                    term_name: '',
                    count    : 0
                }
            }), e.EpTabModel = Backbone.Model.extend({
                defaults: {
                    term_slug: '',
                    term_name: '',
                    count    : 0
                }
            }), e.EpTemplateCollection = Backbone.Collection.extend({model: e.EpTemplateLibraryTemplateModel}),
                e.EpCategoriesCollection = Backbone.Collection.extend({model: e.EpCategoryModel}),
                e.EpTemplateTabsCollection = Backbone.Collection.extend({model: e.EpTabModel}),
                e.EpTemplateLoadingView = Marionette.ItemView.extend({
                    id      : 'bdt-elementpack-template-library-loading',
                    template: '#view-bdt-elementpack-template-library-loading'
                }), e.EpTemplateErrorView = Marionette.ItemView.extend({
                id      : 'bdt-elementpack-template-library-error',
                template: '#view-bdt-elementpack-template-library-error'
            }), e.EpTemplateHeaderView = Marionette.LayoutView.extend({
                id               : 'bdt-elementpack-template-library-header',
                template         : '#view-bdt-elementpack-template-library-header',
                ui               : {
                    closeModal: '#bdt-elementpack-template-library-header-close-modal',
                    syncBtn   : '#bdt-elementpack-template-library-header-sync.elementor-templates-modal__header__item>i'
                },
                events           : {
                    'click @ui.closeModal': 'onCloseModalClick',
                    'click @ui.syncBtn'   : 'onSyncBtnClick'
                },
                regions          : {
                    headerTabs   : '#bdt-elementpack-template-library-header-tabs',
                    headerActions: '#bdt-elementpack-template-library-header-actions'
                },
                onCloseModalClick: function () {
                    EpModel.closeModal();
                },
                onSyncBtnClick   : function () {
                    EpModel.syncDataNow();
                }
            }), e.EpTemplatePreviewView = Marionette.ItemView.extend({
                template: '#view-bdt-elementpack-template-library-preview',
                id      : 'elementor-template-library-preview',
                ui      : {
                    iframe: 'iframe',
                    fallbackButton: '.ep-preview-fallback-button'
                },
                events  : {
                    'click @ui.fallbackButton': 'onFallbackButtonClick'
                },
                onRender: function () {
                    EpModel.hideHeaderLogo();
                    
                    let url = this.getOption('preview');
                    if (url.includes('http://')) {
                        url = url.replace('http://', 'https://');
                    }
                    
                    // Store URL for fallback button
                    this.previewUrl = url;
                    
                    // Add fallback button HTML
                    this.$el.append('<div class="ep-template-library-preview-fallback" style="display:none; text-align:center; padding:20px;"><p>Preview failed to load. Click below to open in new tab:</p><button class="ep-preview-fallback-button" border-radius:3px; cursor:pointer;">Open Preview</button></div>');
                    
                    // Set iframe source and handle load errors
                    this.ui.iframe.attr('src', url);
                    
                    // Show fallback button if iframe fails to load
                    var self = this;
                    var fallbackShown = false;
                    var loadSuccess = false;
                    
                    // Check if iframe loads successfully
                    this.ui.iframe.on('load', function() {
                        loadSuccess = true;
                        
                        // Check if iframe is actually visible and has content
                        setTimeout(function() {
                            if (!fallbackShown) {
                                var iframeElement = self.ui.iframe[0];
                                
                                // Check for sites known to refuse iframe embedding
                                if (url.includes('predesignkit.com')) {
                                    fallbackShown = true;
                                    self.$('.ep-template-library-preview-fallback').show();
                                    self.ui.iframe.hide();
                                    return;
                                }
                                
                                // Try to check iframe content for "refused to connect"
                                try {
                                    var iframeDoc = iframeElement.contentDocument || iframeElement.contentWindow.document;
                                    if (iframeDoc && iframeDoc.body) {
                                        var content = iframeDoc.body.innerText || iframeDoc.body.textContent || '';
                                        if (content.includes('refused to connect')) {
                                            fallbackShown = true;
                                            self.$('.ep-template-library-preview-fallback').show();
                                            self.ui.iframe.hide();
                                            return;
                                        }
                                    }
                                } catch (e) {
                                    // Cross-origin access blocked - iframe is probably working fine
                                }
                            }
                        }, 2000); // Wait 2 seconds for content to load
                    });
                },
                onFallbackButtonClick: function() {
                    window.open(this.previewUrl, '_blank');
                }
            }), e.EpTemplateHeaderBack = Marionette.ItemView.extend({
                template   : '#view-bdt-elementpack-template-library-header-back',
                id         : 'bdt-elementpack-template-library-header-back',
                ui         : {button: 'button'},
                events     : {'click @ui.button': 'onBackClick'},
                onBackClick: function () {
                    EpModel.setPreview('back');
                    EpModel.showHeaderLogo();
                }
            }), e.EpTemplateInsertTemplateBehavior = Marionette.Behavior.extend({
                ui                 : {insertButton: '.bdt-elementpack-template-library-template-insert'},
                events             : {'click @ui.insertButton': 'onInsertButtonClick'},
                onInsertButtonClick: function () {
                    var viewModel = this.view.model, template_id, requestFn, params;
                    EpModel.layout.showLoadingView();
                    template_id = viewModel.get('template_id'), params = {
                        unique_id: template_id,
                        data     : {edit_mode: !0, display: !0, template_id: template_id}
                    }, (requestFn = {
                        success: function (e) {
                            $e.run('document/elements/import', {
                                model  : window.elementor.elementsModel,
                                data   : e,
                                options: {}
                            }), EpModel.closeModal();
                        },
                        error  : function error(data) {
                            if (data == 'required_activated_license') {
                                EpModel.layout.showLicenseError();
                            } else {
                                alert(data);
                            }
                        }
                    }) && jQuery.extend(!0, params, requestFn), elementorCommon.ajax.addRequest("get_bdt_elementpack_template_data", params)
                }
            }), e.EpTemplateHeaderInsertButton = Marionette.ItemView.extend({
                template : "#view-bdt-elementpack-template-library-insert-button",
                id       : "bdt-elementpack-template-library-insert-button",
                behaviors: {insertTemplate: {behaviorClass: e.EpTemplateInsertTemplateBehavior}}
            }), e.EpTemplateProButton = Marionette.ItemView.extend({
                template: "#view-bdt-elementpack-template-library-pro-button",
                id      : "bdt-elementpack-template-library-pro-button"
            }), e.EpTemplateTemplateItemView = Marionette.ItemView.extend({
                template            : "#view-bdt-elementpack-template-library-item",
                className           : function () {
                    var e = " bdt-elementpack-template-has-url", t = " elementor-template-library-template-";
                    return "" === this.model.get("demo_url") && (e = " bdt-elementpacks-template-no-url"), 'bdt-elementpack-local' == this.model.get("is_pro") ? t += "local" : t += "remote", "elementor-template-library-template" + t + e
                },
                ui                  : function () {
                    return {previewButton: ".elementor-template-library-template-preview"};
                },
                events              : function () {
                    return {"click @ui.previewButton": "onPreviewButtonClick"};
                },
                onPreviewButtonClick: function () {
                    "" !== this.model.get("demo_url") && EpModel.setPreview(this.model);
                },
                behaviors           : {insertTemplate: {behaviorClass: e.EpTemplateInsertTemplateBehavior}}
            }), e.EpFiltersItemView = Marionette.ItemView.extend({
                template     : '#view-bdt-elementpack-template-library-filters-item',
                className    : function () {
                    return "bdt-elementpack-filter-item";
                },
                ui           : function () {
                    return {filterLabels: ".bdt-elementpack-template-library-filter-label"};
                },
                events       : function () {
                    return {"click @ui.filterLabels": "onFilterClick"};
                },
                onFilterClick: function (e) {
                    var i = jQuery(e.target);
                    EpModel.setFilter("searchkeyword", ''), EpModel.setFilter('category', i.val()), jQuery('#elementor-template-library-filter-text').val('');

                }
            }), e.EpTemplateTabsItemView = Marionette.ItemView.extend({
                template  : '#view-bdt-elementpack-template-library-tabs-item',
                className : function () {
                    return 'elementor-template-library-menu-item';
                },
                ui        : function () {
                    return {tabsLabels: 'label', tabsInput: 'input'};
                },
                events    : function () {
                    return {'click @ui.tabsLabels': 'onTabClick'};
                },
                onRender  : function () {
                    this.model.get('term_slug') === EpModel.getTab() && this.ui.tabsInput.attr('checked', 'checked');
                },
                onTabClick: function (e) {
                    var i = jQuery(e.target);
                    EpModel.setTab(i.val()), EpModel.setFilter("searchkeyword", "");
                }
            }), e.EpTemplateCollectionView = Marionette.CompositeView.extend({
                template          : '#view-bdt-elementpack-template-library-templates',
                id                : 'bdt-elementpack-template-library-templates',
                childViewContainer: '#bdt-elementpack-template-library-templates-container',
                initialize        : function () {
                    this.listenTo(EpModel.channels.templates, "filter:change", this._renderChildren)
                },
                filter            : function (e) {
                    // search keyword
                    var searchkeyword = EpModel.getFilter("searchkeyword");
                    if (searchkeyword) {
                        searchkeyword = searchkeyword.toLowerCase();
                        if (-1 !== e.get('title').toLowerCase().indexOf(searchkeyword.toLowerCase())) {
                            EpModel.countResult = EpModel.countResult + 1;
                            return true;
                        } else {
                            return false;
                        }
                    }
                    // category filter
                    var i = EpModel.getFilter("category");
                    return i ? (e.get("categories") == i) : (e.get("categories") == i) ? (e.get("categories") == i) : true;
                },
                getChildView      : function (t) {
                    return e.EpTemplateTemplateItemView;
                },
                onRenderCollection: function () {
                    EpModel.showSearchCounter();
                }
            }), e.EpTemplateTabsCollectionView = Marionette.CompositeView.extend({
                template          : "#view-bdt-elementpack-template-library-tabs",
                childViewContainer: "#bdt-elementpack-template-library-tabs-items",
                initialize        : function () {
                },
                getChildView      : function (t) {
                    return e.EpTemplateTabsItemView;
                }
            }), e.EpFiltersCollectionView = Marionette.CompositeView.extend({
                id                : "bdt-elementpack-template-library-filters",
                template          : "#view-bdt-elementpack-template-library-filters",
                childViewContainer: "#bdt-elementpack-template-library-filters-container",
                getChildView      : function (t) {
                    return e.EpFiltersItemView
                }
            }), e.EpTemplateBodyView = Marionette.LayoutView.extend({
                id               : "bdt-elementpack-template-library-content",
                className        : function () {
                    return "library-tab-" + EpModel.getTab();
                },
                ui               : function () {
                    return {
                        SearchInput: "input#elementor-template-library-filter-text",
                    }
                },
                events           : function () {
                    return {
                        'keyup @ui.SearchInput': 'onTextFilterInput',
                    }
                },
                onTextFilterInput: function onTextFilterInput() {
                    var searchKeyword = this.ui.SearchInput.val()
                    EpModel.countResult = 0;
                    EpModel.setFilter('searchkeyword', searchKeyword);
                },
                template         : '#view-bdt-elementpack-template-library-content',
                regions          : {
                    contentTemplates: ".bdt-elementpack-templates-list",
                    contentFilters  : ".bdt-elementpack-filters-list"
                }
            }), e.EpTemplateLayoutView = Marionette.LayoutView.extend({
                el                  : "#bdt-elementpack-template-library-modal",
                regions             : EpConfig.modalRegions,
                initialize          : function () {
                    this.getRegion("modalHeader").show(new e.EpTemplateHeaderView), this.listenTo(EpModel.channels.tabs, "filter:change", this.switchTabs), this.listenTo(EpModel.channels.layout, "preview:change", this.switchPreview)
                }, switchTabs       : function () {
                    this.showLoadingView(), EpModel.getTemplatedata(EpModel.getTab())
                }, switchPreview    : function () {
                    var i = this.getHeaderView(), n = EpModel.getPreview();
                    if ("back" === n) return i.headerTabs.show(new e.EpTemplateTabsCollectionView({collection: EpModel.collections.tabs})), i.headerActions.empty(), void EpModel.setTab(EpModel.getTab());
                    "initial" !== n ? (this.getRegion("modalContent").show(new e.EpTemplatePreviewView({preview: n.get("demo_url")})), i.headerTabs.show(new e.EpTemplateHeaderBack), (1 != n.get("is_pro") || EpConfig.license.activated) ? i.headerActions.show(new e.EpTemplateHeaderInsertButton({model: n})) : i.headerActions.show(new e.EpTemplateProButton({model: n}))) : i.headerActions.empty()
                }, getHeaderView    : function () {
                    return this.getRegion("modalHeader").currentView
                }, getContentView   : function () {
                    return this.getRegion("modalContent").currentView
                }, showLoadingView  : function () {
                    this.modalContent.show(new e.EpTemplateLoadingView)
                }, showLicenseError : function () {
                    this.modalContent.show(new e.EpTemplateErrorView)
                }, showPreviewError : function (errorMessage) {
                    console.log('Preview error:', errorMessage);
                    // Could show a specific preview error view or fallback
                    // For now, we handle this in the preview view itself
                }, showTemplatesView: function (i, n) {
                    this.getRegion("modalContent").show(new e.EpTemplateBodyView);
                    var l = this.getContentView(), r = this.getHeaderView();

                    EpModel.collections.tabs = new e.EpTemplateTabsCollection(EpModel.getTabs());
                    r.headerTabs.show(new e.EpTemplateTabsCollectionView({collection: EpModel.collections.tabs}));
                    l.contentTemplates.show(new e.EpTemplateCollectionView({collection: i}));
                    l.contentFilters.show(new e.EpFiltersCollectionView({collection: n}));
                }
            })
        },
    }, EpModel = {
        modal             : !1,
        layout            : !1,
        collections       : {},
        tabs              : {},
        defaultTab        : "",
        countResult       : 0,
        channels          : {},
        atIndex           : null,
        init              : function () {
            window.elementor.on("preview:loaded", window._.bind(EpModel.onPreviewLoaded, EpModel)), EpControler.init();
        },
        onPreviewLoaded   : function () {
            let e = setInterval(() => {
                window.elementor.$previewContents.find(".elementor-add-new-section").length && (this.initLibraryButton(), clearInterval(e))
            }, 100);
            window.elementor.$previewContents.on("click", ".elementor-editor-element-setting.elementor-editor-element-add", this.initLibraryButton), window.elementor.$previewContents.on("click.addBdtElementPackTemplate", ".elementor-add-ep-button", _.bind(this.showTemplatesModal, this)), this.channels = {
                templates: Backbone.Radio.channel("EP_THEME_EDITOR:templates"),
                tabs     : Backbone.Radio.channel("EP_THEME_EDITOR:tabs"),
                layout   : Backbone.Radio.channel("EP_THEME_EDITOR:layout")
            }, this.tabs = EpConfig.tabs, this.defaultTab = EpConfig.defaultTab
        },
        initLibraryButton : function () {
            var sectionBtnArea = window.elementor.$previewContents.find(".elementor-add-new-section"),
                btnHtml        = '<div class="elementor-add-section-area-button elementor-add-ep-button"><i class="ep-icon-element-pack"></i></div>';
            sectionBtnArea.find(".elementor-add-ep-button").length || (sectionBtnArea.length && EpConfig.libraryButton && e(btnHtml).prependTo(sectionBtnArea), window.elementor.$previewContents.on("click.addBdtElementPackTemplate", ".elementor-editor-section-settings .elementor-editor-element-add", function () {
                var topSection = e(this).closest(".elementor-top-section"), l = topSection.data("model-cid");
                (window.elementor.sections && window.elementor.sections.currentView.collection.length && e.each(window.elementor.sections.currentView.collection.models, function (e, topSection) {
                    l === topSection.cid && (EpModel.atIndex = e)
                }), EpConfig.libraryButton) && topSection.prev(".elementor-add-section").find(".elementor-add-new-section").prepend(btnHtml)
            }))
        },
        getFilter         : function (e) {
            return this.channels.templates.request("filter:" + e)
        },
        setFilter         : function (e, t) {
            this.channels.templates.reply("filter:" + e, t), this.channels.templates.trigger("filter:change")
        },
        getTab            : function () {
            return this.channels.tabs.request("filter:tabs")
        },
        setTab            : function (e, t) {
            this.channels.tabs.reply("filter:tabs", e), t || this.channels.tabs.trigger("filter:change")
        },
        getTabs           : function () {
            var e = [];
            return _.each(this.tabs, function (t, i) {
                e.push({term_slug: i, title: t.title})
            }), e
        },
        getPreview        : function (e) {
            return this.channels.layout.request("preview")
        },
        setPreview        : function (e, t) {
            this.channels.layout.reply("preview", e), t || this.channels.layout.trigger("preview:change")
        },
        showTemplatesModal: function () {
            this.getModal().show(), this.layout || (this.layout = new EpControler.EpTemplateLayoutView, this.layout.showLoadingView()), this.setTab(this.defaultTab, !0), this.getTemplatedata(this.defaultTab), this.setPreview("initial")
        },
        getTemplatedata   : function (currentTab) {
            var _this = this, tabData = _this.tabs[currentTab];
            _this.setFilter("category", !1), tabData.data.templates && tabData.data.categories ? _this.layout.showTemplatesView(tabData.data.templates, tabData.data.categories) : e.ajax({
                url     : ajaxurl,
                type    : "post",
                dataType: "json",
                data    : {action: "bdt_element_pack_template_library_get_layouts", tab: currentTab},
                success : function (e) {
                    var templates  = new EpControler.EpTemplateCollection(e.data.templates),
                        categories = new EpControler.EpCategoriesCollection(e.data.categories);
                    _this.tabs[currentTab].data = {
                        templates : templates,
                        categories: categories
                    }, _this.layout.showTemplatesView(templates, categories)

                    if (e.data.templates.length <= 0){
                        let url = document.location.origin;
                        let msg = `System issues, please try again later. Don't forget to click over Sync Library. Or contact our support team (support@bdthemes.com). Don't forget to send your domain ${url}`;

                        alert(msg);
                    }
                    
                }
            })
        },
        syncDataNow       : function () {
            this.layout.showLoadingView();
            var _this = this;
            e.ajax({
                url     : ajaxurl,
                type    : "post",
                dataType: "json",
                data    : {action: "bdt_element_pack_template_library_making_syncing"},
                success : function (e) {
                    var currentTab = _this.getTab(), tabData = _this.tabs[currentTab];
                    tabData.data.templates = '';
                    tabData.data.categories = '';
                    _this.getTemplatedata(currentTab);

                    if ( e.data.length <= 0 ){
                        let url = document.location.origin;
                        let msg = `System issues, please try again later. Don't forget to click over Sync Library. Or contact our support team (support@bdthemes.com). Don't forget to send your domain ${url}`;

                        // alert(msg);
                    }
                    
                }
            })
        },
        showHeaderLogo    : function () {
            e('#bdt-elementpack-template-library-header-logo-area').show()
        },
        hideHeaderLogo    : function () {
            e('#bdt-elementpack-template-library-header-logo-area').hide()
        },
        showSearchCounter : function () {
            if (EpModel.getFilter("searchkeyword")) {
                e('#bdt-elementpack-template-library-content .search-result-counter span').html(this.countResult);
                e('#bdt-elementpack-template-library-content .search-result-counter').show();
            } else {
                this.hideSearchCounter();
            }
        },
        hideSearchCounter : function () {
            e('#bdt-elementpack-template-library-content .search-result-counter').hide();
            e('#bdt-elementpack-template-library-content .search-result-counter span').html(0);
        },
        closeModal        : function () {
            this.getModal().hide()
            this.showHeaderLogo();
        },
        getModal          : function () {
            return this.modal || (this.modal = elementor.dialogsManager.createWidget("lightbox", {
                id         : "bdt-elementpack-template-library-modal",
                closeButton: !1
            })), this.modal
        }
    }, e(window).on("elementor:init", EpModel.init)
}(jQuery);