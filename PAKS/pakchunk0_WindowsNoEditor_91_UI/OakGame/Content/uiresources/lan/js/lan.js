"use strict";

class Widget_LAN extends Widget_AuraMenuOffline
{
    SetupDataModel(instId)
    {
        super.SetupDataModel(instId);
        this.SetUpObservers = this.SetUpObservers.bind(this);
        this.getScrollbarConfig = this.getScrollbarConfig.bind(this);
        this.BuildScrollbar = this.BuildScrollbar.bind(this);
        this.OnEventInputFocuseChangedListItem = this.OnEventInputFocuseChangedListItem.bind(this);
        this.BindListData = this.BindListData.bind(this);
        this.RemoveInteraction = this.RemoveInteraction.bind(this);
        this.ResetInteraction = this.ResetInteraction.bind(this);
        this.DataModel.SetDataModel = function (element, dataModel)
        {
            this.SetDataModel(element, dataModel)
        }.bind(this);

    }
    RegisterEvents()
    {
        if (this.Archtype) return;
        super.RegisterEvents();
    }
    Init()
    {
        super.Init();
        this.scrollbar = new GBX_Scrollbar()
        this.scrollbar.IsActive = true;
        this.BindInternalEvents = this.BindInternalEvents.bind(this);
        this.IsOfflineDisplayed = false;
        this.OfflineListener = this.SetOfflineFromSocial;
        this.OnlineListener = this.SetOnlineFromSocial;
        this.socialOffline = document.getElementById("social_offline");
        this.getScrollbarConfigOffline = this.getScrollbarConfigOffline.bind(this);
        this.scrollbarOffline = new GBX_Scrollbar()
        this.scrollbarOffline.IsActive = true;

        this.RegisterWidgetEvent("ScrollPageView", function ()
        {
            this.ScrollOfflinePanel.apply(this, arguments);
        }.bind(this))
    }

    RegisterEvents()
    {
        if (this.Archtype) return;
        super.RegisterEvents();
    }
    Create(widgetIdent)
    {
        let inst = new Widget_LAN(this.ClassIdent, widgetIdent);
        return inst;
    }

    Activate()
    {
        super.Activate();
        this.SetUpObservers();
        this.BindListData();
        Delay.byFrame(() =>
        {
            this.BuildScrollbar(this.scrollbar, this.getScrollbarConfig(), "lan_connection")
        }, 3);
    }

    Deactivate()
    {
        super.Deactivate();
        if (this.listObserver)
        {
            this.listObserver.disconnect();
        }
    }

    SetOfflineFromSocial()
    {
        this.IsOfflineDisplayed = true;
        document.getElementsByClassName("lan_connection")[0].classList.add("d-none")
        this.ShowOffline();
        this.RemoveInteraction();
        Delay.byFrame(() =>
        {
            this.BuildScrollbar(this.scrollbarOffline, this.getScrollbarConfigOffline(), true, "offline_screen_desc");
            InputMgr.FocusWidgetElement("so-go-online")
        }, 3)
    }


    SetOnlineFromSocial()
    {
        this.IsOfflineDisplayed = false;
        document.getElementsByClassName("lan_connection")[0].classList.remove("d-none")
        this.HideOffline();
        this.ResetInteraction();
        this.BindListData();
    }
    RemoveInteraction()
    {
        document.getElementById("lan-entries-list").dataset.inputDisabled = true;
        var elems = this.WidgetDiv.getElementsByClassName("button_item_list");
        for (let index = 0; index < elems.length; index++)
        {
            const element = elems[index];
            delete element.dataset.inputElem;
        }
        Delay.byFrame(() =>
        {
            InputMgr.ExplicitRemoveFocus();
            InputMgr.ResetCache();
            InputMgr.Event_Input_FocusWidgetElement(this.WidgetIdent, document.getElementById("so-go-online"))
        }, 3)
    }

    ResetInteraction()
    {
        document.getElementById("lan-entries-list").dataset.inputDisabled = false;
        var elems = this.WidgetDiv.getElementsByClassName("button_item_list");
        for (let index = 0; index < elems.length; index++)
        {
            const element = elems[index];
            element.dataset.inputElem = "true";
        }
        Delay.byFrame(() =>
        {
            InputMgr.ExplicitRemoveFocus();
            InputMgr.ResetCache();
            InputMgr.Event_Input_Reset_FocusWidget(this.WidgetIdent)
        }, 3)
    }

    BindInternalEvents()
    {

    }


    SetUpObservers()
    {
        // Customization List
        var listTarget = document.getElementById('lan-entries-list');
        if (!listTarget) return;
        this.listObserver = new MutationObserver(function (mutations)
        {
            Delay.byFrame(() =>
            {
                this.BuildScrollbar(this.scrollbar, this.getScrollbarConfig(), "lan_connection")
            }, 3);
        }.bind(this));
        this.listObserver.observe(listTarget, {
            // attributes: true,
            childList: true,
            subtree: true
        });
    }

    getScrollbarConfig()
    {
        return {

            // Scrollbar container (parent)
            scrollContainerWrapper: document.getElementById("lan-scrollbar"),

            // List items container
            listWrapper: document.getElementById("lan-entries-list"),

            // ScrollBar element CSS Class
            scrollBar: document.getElementById("lan-scrollbar").getElementsByClassName("scrollbar_scroller")[0],

            scrollBarCenter: document.getElementById("lan-scrollbar").getElementsByClassName("scrollbar_scroller_center")[0],

            calcHeight: true,
            isTextContent: true,
            // Element iterator CSS Class
            itemElement: "button_item_list",

            elementClassNamePrefix: "lan-item-",

            // itemsDynamic: true,

            // Arrow down CSS Class
            scrollBarDownButton: document.getElementById("lan-scrollbar").getElementsByClassName("scrollbar_scroller_down")[0],

            // Arrow Up CSS Class
            scrollBarUpButton: document.getElementById("lan-scrollbar").getElementsByClassName("scrollbar_scroller_up")[0]
        }

    }

    BuildScrollbar(scrollbar, config, reset, wrapper)
    {
        var listeners = {
            onClickDown: function () { },
            onClickUp: function () { },
            onScrollDown: function () { },
            onScrollUp: function () { },
            onScrollSelected: function () { },
            onScrollUnselected: function () { },
            onScrollMove: function () { },
            onScrollWheelUp: function () { },
            onScrollWheelDown: function () { }
        }
        scrollbar.Init(config, listeners, this.WidgetDiv, wrapper);

        if (!scrollbar.isScrollbarVisible())
        {
            config.scrollContainerWrapper.classList.add("d-opacity");
        }
        else
        {
            if (reset)
            {
                scrollbar.resetScroll();
            }
        }
    }

    BindListData()
    {
        const elements = this.WidgetDiv.querySelectorAll("#lan-entries-list .button_item_list");
        for (let index = 0; index < elements.length; index++)
        {
            const element = elements[index];
            element.dataset.index = index;
            element.classList.add("lan-item-" + index);
            element.removeEventListener("Event_InputFocusChanged", this.OnEventInputFocuseChangedListItem);
            element.addEventListener("Event_InputFocusChanged", this.OnEventInputFocuseChangedListItem);
        }
    }

    OnEventInputFocuseChangedListItem(data)
    {
        if (data.detail.focused == true)
        {
            this.ScrollIfNeeded(data.detail.node);
        }
    }
    ScrollIfNeeded(node)
    {
        this.scrollbar.ScrollToIndex(node.dataset.index);
    }
    ScrollOfflinePanel(deltaAmount)
    {
        if (document.getElementsByClassName("lan_connection")[0].classList.contains("d-none"))
        {
            if (this.scrollbarOffline)
                this.scrollbarOffline.deltaScroll(-deltaAmount * 100);
        }
    }
    getScrollbarConfigOffline()
    {
        return {

            // Scrollbar container (parent)
            scrollContainerWrapper: document.getElementById("so-scrollbar"),

            // List items container
            listWrapper: document.getElementById("offline_screen_desc"),

            // ScrollBar element CSS Class
            scrollBar: document.getElementById("so-scrollbar").getElementsByClassName("scrollbar_scroller")[0],

            scrollBarCenter: document.getElementById("so-scrollbar").getElementsByClassName("scrollbar_scroller_center")[0],
            // Element iterator CSS Class

            calcHeight: false,
            itemElement: "transparency_panel_content",
            // Arrow down CSS Class
            scrollBarDownButton: document.getElementById("so-scrollbar").getElementsByClassName("scrollbar_scroller_down")[0],

            // Arrow Up CSS Class
            scrollBarUpButton: document.getElementById("so-scrollbar").getElementsByClassName("scrollbar_scroller_up")[0]
        }

    }
}

let LANArchetype = new Widget_LAN("lan", "-archetype-", true);
WidgetMgr.RegisterWidgetClass(LANArchetype);