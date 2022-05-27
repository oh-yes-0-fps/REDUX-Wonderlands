"use strict";

class GbxBackpack extends GbxElementBase
{
    constructor()
    {
        super();
        this.container = undefined;
        this.leftArrow = undefined;
        this.rightArrow = undefined;
        this.backpackWeaponsContainer = undefined;
        this.IsActivated = false;
        this.DOMLoaded = false;
        // Ids or classes used on component
        this.Identifiers = {
            weaponsContainer: "backpack_weapons",
            weaponElement: "backpack_weapons_item",
            scrollbarContainer: "scrollbar",
            scrollbarScroller: "scrollbar_scroller",
            scrollbarScrollerCenter: "scrollbar_scroller_center",
            scrollbarScrollerUp: "scrollbar_scroller_up",
            scrollbarScrollerDown: "scrollbar_scroller_down"

        }

    }

    Init()
    {
        super.Init();

        this.BuildScrollbar = this.BuildScrollbar.bind(this);
        this.BindInternalEvents = this.BindInternalEvents.bind(this);
        this.OnSetDataModel = this.OnSetDataModel.bind(this);
        this.Activate = this.Activate.bind(this);
        this.Deactivate = this.Deactivate.bind(this);
        this.SetUpObservers = this.SetUpObservers.bind(this);
        this.CantSellAnim = this.CantSellAnim.bind(this);
        this.Reset = this.Reset.bind(this);
        this.OnItemFocus = this.OnItemFocus.bind(this);
        this.scrollbar = new GBX_Scrollbar()
        this.EventOnModel = this.EventOnModel.bind(this);
        this.SetUpObservers();
    }

    // Web component callback when HtmlElement is connected
    connectedCallback()
    {

        // Call parent init
        this.Init();

        this.SetParent(this);

        this.container = this.firstElementChild;



        // Backpack elements container
        this.backpackWeaponsContainer = this.container.getElementsByClassName(this.Identifiers.weaponsContainer)[0];

        // Input movement listener
        this.backpackWeaponsContainer.addEventListener('Event_InputFocusChanged', this.OnItemFocus, true)

        // Set up internal DOM events 
        this.BindInternalEvents();

        // Set Element Models
        this.DataModel = {};

        // Scrollbar timer
        // this.ScrollbarTimer = this.ScrollbarTimer.bind(this);

        // Backpack cihld elements
        this.BackPackElements = [];

        // Flag to indicate if the container backpack is focused
        this.IsContainerFocused = false;

        // Listener when model is attached
        this.container.addEventListener('Model', this.EventOnModel, false);

    }

    EventOnModel(data)
    {
        if (data.detail.element.classIdentifier == this.classIdentifier)
        {
            this.DataModel = data.detail.value;
            if (this.GetParentObj() && this.GetParentObj().OnLoadBackpack)
            {
                this.GetParentObj().OnLoadBackpack(this);
            }
            this.OnSetDataModel();
        }
    }
    OnItemFocus(data)
    {
        if (data.detail.focused == true)
        {
            this.SelectBackpackItemByIndex(data.detail.idx);
        }
    }

    // Callback when the model is attached
    OnSetDataModel()
    {

        // Listener when the backpack comtainer receives focus
        this.DataModel.OnEquipmentSetFocus = function (element, focus)
        {
            this.OnEquipmentSetFocus(element, focus)
        }.bind(this);

        //Listener when Previous Sort button is clicked
        this.DataModel.OnClickPrevSort = function ()
        {
            this.OnClickPrevSort()
        }.bind(this);

        //Listener when Next Sort button is clicked
        this.DataModel.OnClickNextSort = function ()
        {
            this.OnClickNextSort()
        }.bind(this);

        //Listener when Next Sort button is clicked
        this.DataModel.RunDroppedAnimation = function ()
        {
            this.RunDroppedAnimation()
        }.bind(this);

        //Listener when Next Sort button is clicked
        this.DataModel.RunRoomDecorationAnimation = function ()
        {
            this.RunRoomDecorationAnimation()
        }.bind(this);

        //Listener when Next Sort button is clicked
        this.DataModel.SetBackpackFocus = function (focus)
        {
            this.SetBackpackFocus(focus)
        }.bind(this);

    }

    // Bind listeners
    BindInternalEvents() { }

    // Callback when backpack is deactivated
    Deactivate()
    {
        this.IsContainerFocused = false;
        this.IsActivated = false;
        // clearInterval(this.ScrollbarInterval);
        if (this.scrollbar)
            this.scrollbar.resetScroll();
        if (this.backpackObserver)
        {
            this.backpackObserver.disconnect();
        }
        this.scrollbar = undefined;
    }

    // Callback when backpack is activated
    Activate()
    {
        this.IsActivated = true;
        this.scrollbar = new GBX_Scrollbar()
        this.SetUpObservers();

        if (this.scrollbar)
        {
            this.BuildScrollbar();
        }
    }

    Reset()
    {
        this.SetUpObservers();
        this.scrollbar = undefined;
        this.scrollbar = new GBX_Scrollbar()
        this.BuildScrollbar();
    }

    // Register events for backpack component
    RegisterEvents()
    {
        if (this.Archtype) return;

        super.RegisterEvents();
        this.RegisterWidgetEvent("Sort_By", function ()
        {
            this.Event_Sorty_By();
        }.bind(this));

    }


    // Scroll to an specific backpack item by index
    SelectBackpackItemByIndex(index)
    {
        if (index == -1) return;

        if (this.CurrentIndex == index && this.IsContainerFocused == true)
            return;

        if (this.GetParentObj().SelectBackpackItemByIndex)
        {
            this.GetParentObj().SelectBackpackItemByIndex(index);
        }

        this.CurrentIndex = index;

        if (window[this.DataParent].OnBackpackSetFocus)
        {
            window[this.DataParent].OnBackpackSetFocus(true);
        }
        // this.backpackWeaponsContainer.classList.add("selected");

        if (!this.scrollbar || !this.scrollbar.listWrapper)
        {
            // console.log("Backpack: Scrollbar is undefined");
            return;
        }

        this.scrollbar.ScrollToIndex(index);
    }
    CantSellAnim(index)
    {
        if (index == -1) return;

        var focusedItem = this.getElementsByClassName("backpack_weapons_item")[index];
        focusedItem.classList.remove("cant-sell");
        focusedItem.classList.add("cant-sell");

        clearTimeout(this.cantsellAnimationT);
        this.cantsellAnimationT = setTimeout(() =>
        {
            focusedItem.classList.remove("cant-sell");
        }, 600);
    }

    refreshAnim()
    {
        var backpackDiv = this.getElementsByClassName("backpack")[0];
        backpackDiv.classList.remove("refresh");
        backpackDiv.classList.add("refresh");

        clearTimeout(this.refreshAnimT);
        this.refreshAnimT = setTimeout(() =>
        {
            backpackDiv.classList.remove("refresh");
        }, 600);
    }

    SetBackpackFocus(focus)
    {
        if (window[this.DataParent].OnBackpackSetFocus)
        {
            window[this.DataParent].OnBackpackSetFocus(focus);
        }
    }

    // Create Scrollbar depending on backpack size
    BuildScrollbar()
    {

        var config = {

            // Scrollbar container (parent)
            scrollContainerWrapper: this.getElementsByClassName(this.Identifiers.scrollbarContainer)[0],

            // List items container
            listWrapper: this.getElementsByClassName(this.Identifiers.weaponsContainer)[0],

            // ScrollBar element CSS Class
            scrollBar: this.getElementsByClassName(this.Identifiers.scrollbarScroller)[0],

            // ScrollBar center element CSS Class
            scrollBarCenter: this.getElementsByClassName(this.Identifiers.scrollbarScrollerCenter)[0],

            calcHeight: true,
            isTextContent: true,
            // Element iterator CSS Class
            itemElement: this.Identifiers.weaponElement,

            elementClassNamePrefix: "backpack-item-",

            speed: 250,

            // List length
            // elementsSize: this.DataModel.itemcount,

            // Arrow down CSS Class
            scrollBarDownButton: this.getElementsByClassName(this.Identifiers.scrollbarScrollerDown)[0],

            // Arrow Up CSS Class
            scrollBarUpButton: this.getElementsByClassName(this.Identifiers.scrollbarScrollerUp)[0]
        }

        Delay.byFrame(() =>
        {
            // Scrollbar listeners hooks        
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
            if (this.scrollbar)
            {
                this.scrollbar.Init(config, listeners, this.container, "backpack")
                this.scrollbar.IsActive = !(this.DataModel.pagesize > 0) && this.scrollbar.isScrollbarVisible();

                if (!this.scrollbar.IsActive)
                {
                    config.scrollContainerWrapper.classList.add("d-opacity");
                } else
                {
                    config.scrollContainerWrapper.classList.remove("d-opacity");
                }
            }
        }, 3);
    }

    // Event when Sort is executed
    Event_Sorty_By()
    {
        let type = this.DataModel.sortType;
        let weaponList = this.DataModel.weaponList;

    }

    // Event when thick is executed
    Event_DataUpdated()
    {
        if (this.DataModel === undefined) return;
    }

    OnEquipmentSetFocus(button, focus)
    {
        if (focus == true && this.IsContainerFocused != true)
        {
            this.IsContainerFocused = true
            if (focus == true) { }
            // reroute the Equipment call to the backpack
            if (window[this.DataParent].OnBackpackSetFocus)
            {
                window[this.DataParent].OnBackpackSetFocus(focus);
            }
            let idx = InputMgr.CurrElementIdx;
            this.SelectBackpackItemByIndex(idx);
        } else
        {
            // if (window[this.DataParent].OnBackpackSetFocus) {
            //     window[this.DataParent].OnBackpackSetFocus(focus);
            // }
        }
    }

    // Previous Sort button click handler
    OnClickPrevSort()
    {
        if (window[this.DataParent].OnClickPrevBackpackSort)
        {
            window[this.DataParent].OnClickPrevBackpackSort();
        }

        this.refreshAnim();
    }

    // Next Sort button click handler
    OnClickNextSort()
    {
        if (window[this.DataParent].OnClickNextBackpackSort)
        {
            window[this.DataParent].OnClickNextBackpackSort();
        }

        this.refreshAnim();
    }

    // Interval to know when backpack elements are rendered on the DOM
    ScrollbarTimer()
    {
        const items = document.getElementsByClassName(this.Identifiers.weaponElement)
        if (items && items.length > 0 && items[0].offsetWidth > 0)
        {
            this.DOMLoaded = true;
            clearInterval(this.ScrollbarInterval);
            this.BuildScrollbar();
            if (this.GetParentObj().OnBackpackVisible)
            {
                this.GetParentObj().OnBackpackVisible();
            }
        }
    }
    SetUpObservers()
    {

        if (this.backpackObserver)
        {
            this.backpackObserver.disconnect();
            this.backpackObserver = null;
        }

        // Color Grid
        var target = this.getElementsByClassName("backpack_weapons")[0];
        if (!target) return;
        this.backpackObserver = new MutationObserver(function (mutations)
        {
            this.scrollbar.IsActive = true;
            Delay.byFrame(() =>
            {
                this.BuildScrollbar()
            }, 3);

        }.bind(this));
        this.backpackObserver.observe(target, {
            childList: true,
            subtree: true
        });
    }
}
window.customElements.define('gbx-backpack', GbxBackpack);