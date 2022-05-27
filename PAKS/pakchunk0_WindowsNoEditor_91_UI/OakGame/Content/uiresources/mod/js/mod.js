"use strict";

class Widget_Mail extends Widget_AuraMenuOffline
{
    SetupDataModel(instId)
    {
        super.SetupDataModel(instId);
        this.SetUpObservers = this.SetUpObservers.bind(this);
        this.getScrollbarConfig = this.getScrollbarConfig.bind(this);
        this.getScrollbarDetailsConfig = this.getScrollbarDetailsConfig.bind(this);
        this.BuildScrollbar = this.BuildScrollbar.bind(this);
        this.OnEventInputFocuseChangedListItem = this.OnEventInputFocuseChangedListItem.bind(this);
        this.BindListListeners = this.BindListListeners.bind(this);
        this.ScrollIfNeeded = this.ScrollIfNeeded.bind(this);
        this.RemoveInteraction = this.RemoveInteraction.bind(this);
        this.ResetInteraction = this.ResetInteraction.bind(this);
        this.Event_ShowNewItemIndicator = this.Event_ShowNewItemIndicator.bind(this);
        this.Event_SetCurrentListItemIndex = this.Event_SetCurrentListItemIndex.bind(this);
        this.ShowNewItemReceived = this.ShowNewItemReceived.bind(this);
        this.HideNewItemReceived = this.HideNewItemReceived.bind(this);
        this.DataModel.SetDataModel = function (element, dataModel)
        {
            this.SetDataModel(element, dataModel)
        }.bind(this);

    }

    Init()
    {
        super.Init();
        this.scrollbar = new GBX_Scrollbar()
        this.scrollbar.IsActive = true;

        this.scrollbarDetails = new GBX_Scrollbar()
        this.scrollbarDetails.IsActive = true;
        this.IsOfflineDisplayed = false;
        this.OfflineListener = this.SetOfflineFromSocial;
        this.OnlineListener = this.SetOnlineFromSocial;
    }

    RegisterEvents()
    {
        if (this.Archtype) return;

        super.RegisterEvents();

        this.RegisterWidgetEvent("ShowNewItemIndicator", function () { this.Event_ShowNewItemIndicator(); }.bind(this));
        this.RegisterWidgetEvent("SetCurrentListItemIndex", function (index)
        {
            this.Event_SetCurrentListItemIndex.apply(this, arguments);
        }.bind(this));
    }

    Event_ShowNewItemIndicator()
    {
        this.ShowNewItemReceived();
    }

    Event_SetCurrentListItemIndex(index)
    {
        Delay.byFrame(() =>
        {
            InputMgr.ExplicitRemoveFocus();
            InputMgr.ResetCache();
            InputMgr.FocusGridItemByIndex(this.WidgetIdent, "mail-list-wrapper", index);
        }, 3)
    }

    ShowNewItemReceived()
    {
        let itemReceived = this.WidgetDiv.getElementsByClassName("celebration_message_hud")[0];

        itemReceived.classList.remove("fade-out");
        itemReceived.classList.add("animation-enter");

        this.newReceivedTO = setTimeout(() => { this.HideNewItemReceived(); }, 2000);
    }

    HideNewItemReceived()
    {
        let itemReceived = this.WidgetDiv.getElementsByClassName("celebration_message_hud")[0];
        
        itemReceived.classList.remove("animation-enter");
        itemReceived.classList.add("fade-out");

        clearTimeout(this.newReceivedTO);
    }

    Create(widgetIdent)
    {
        let inst = new Widget_Mail(this.ClassIdent, widgetIdent);
        return inst;
    }

    Activate()
    {
        super.Activate();
        this.SetUpObservers();
        this.BindListListeners();
        Delay.byFrame(() =>
        {
            this.BuildScrollbar(this.scrollbar, this.getScrollbarConfig())
            this.BuildScrollbar(this.scrollbarDetails, this.getScrollbarDetailsConfig())
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
        document.getElementsByClassName("mail_menu_wrapper")[0].classList.add("d-none")
        this.ShowOffline();
        this.RemoveInteraction();
    }

    SetOnlineFromSocial()
    {
        this.IsOfflineDisplayed = false;
        document.getElementsByClassName("mail_menu_wrapper")[0].classList.remove("d-none")
        this.HideOffline();
        this.ResetInteraction();
        this.BindListListeners();
    }

    RemoveInteraction()
    {
        document.getElementById("mail-list-wrapper").dataset.inputDisabled = true;
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
        document.getElementById("mail-list-wrapper").dataset.inputDisabled = false;
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

    SetUpObservers()
    {
        if (this.listObserver)
        {
            this.listObserver.disconnect();
            this.listObserver = null;
        }
        // Customization List
        var listTarget = document.getElementById('mail-list-wrapper');
        if (!listTarget) return;
        this.listObserver = new MutationObserver(function (mutations)
        {
            Delay.byFrame(() =>
            {
                // focuses the next last entry after the last entry is deleted
                if (!this.DataModel.entries[this.DataModel.selectedentryindex] && this.DataModel.selectedentryindex == this.DataModel.entries.length)
                {
                    InputMgr.ExplicitRemoveFocus();
                    InputMgr.ResetCache();
                    InputMgr.FocusGridItemByIndex(this.WidgetIdent, "mail-list-wrapper", this.DataModel.entries.length - 1);
                }
                this.BindListListeners();
                this.BuildScrollbar(this.scrollbar, this.getScrollbarConfig());
                this.BuildScrollbar(this.scrollbarDetails, this.getScrollbarDetailsConfig());
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
        const el = document.getElementById("mail-list-scrollbar");
        return {

            // Scrollbar container (parent)
            scrollContainerWrapper: el,

            // List items container
            listWrapper: document.getElementById("mail-list-wrapper"),

            calcHeight: true,
            isTextContent: true,
            // Element iterator CSS Class
            itemElement: "button_item_list",

            elementClassNamePrefix: "mail-item-",

            // itemsDynamic: true,

            scrollBar: el.getElementsByClassName("scrollbar_scroller")[0],
            // Arrow down CSS Class
            scrollBarDownButton: el.getElementsByClassName("scrollbar_scroller_down")[0],
            scrollBarCenter: el.getElementsByClassName("scrollbar_scroller_center")[0],
            scrollBarUpButton: el.getElementsByClassName("scrollbar_scroller_up")[0]
        }

    }

    getScrollbarDetailsConfig()
    {
        const el = document.getElementById("mail-details-scrollbar");
        return {

            // Scrollbar container (parent)
            scrollContainerWrapper: el,

            // List items container
            listWrapper: document.getElementById("mail-details-wrapper"),

            calcHeight: true,
            isTextContent: true,

            // ScrollBar element CSS Class
            scrollBar: el.getElementsByClassName("scrollbar_scroller")[0],
            scrollBarUpButton: el.getElementsByClassName("scrollbar_scroller_up")[0],
            scrollBarCenter: el.getElementsByClassName("scrollbar_scroller_center")[0],
            scrollBarDownButton: el.getElementsByClassName("scrollbar_scroller_down")[0]
        }
    }

    BuildScrollbar(scrollbar, config, reset)
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
        scrollbar.Init(config, listeners, this.WidgetDiv, "mail_menu_wrapper");

        if (!scrollbar.isScrollbarVisible())
        {
            config.scrollContainerWrapper.classList.add("d-opacity");
        }
        else if (reset)
        {
            scrollbar.resetScroll();
        }
    }

    BindListListeners()
    {   
        const elements = this.WidgetDiv.querySelectorAll("#mail-list-wrapper .big_button_item_list");
        for (let index = 0; index < elements.length; index++)
        {
            const element = elements[index];
            element.dataset.index = index;
            element.classList.add('mail-item-' + index);
            element.removeEventListener("Event_InputFocusChanged", this.OnEventInputFocuseChangedListItem);
            element.addEventListener("Event_InputFocusChanged", this.OnEventInputFocuseChangedListItem);
        }
    }

    OnEventInputFocuseChangedListItem(data)
    {
        if (data.detail.focused == true)
        {
            this.ScrollIfNeeded(this.scrollbar, data.detail.node);
        }
    }

    ScrollIfNeeded(scrollbar, node)
    {
        scrollbar.ScrollToIndex(node.dataset.index);
    }
}

let MailArchetype = new Widget_Mail("mail", "-archetype-", true);
WidgetMgr.RegisterWidgetClass(MailArchetype);