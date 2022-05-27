class GbxItemCardAbbreviated extends GbxElementBase
{
    connectedCallback()
    {
        // Call parent init
        this.Init();

        this.container = this.firstElementChild;

        // Set up internal DOM events 
        this.BindInternalEvents();

        // Set Element Models
        this.DataModel = {};
    }

    constructor()
    {
        super();
    }

    Init()
    {
        super.Init();

        this.BindInternalEvents = this.BindInternalEvents.bind(this);
    }
    OnSetDataModel() { }

    // Bind DOM internal Events
    BindInternalEvents() { }

};

window.customElements.define('gbx-item-card-abbreviated', GbxItemCardAbbreviated);