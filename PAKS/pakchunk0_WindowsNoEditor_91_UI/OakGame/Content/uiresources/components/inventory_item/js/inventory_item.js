class GbxInventoryItem extends GbxButton
{
    connectedCallback()
    {
        // Call parent init
        this.Init();

        this.container = this.firstElementChild;
        this.onclick = this.OnClick;
        this.onmouseenter = this.OnEnter;
        this.onmouseleave = this.OnLeave;
    }

    constructor()
    {
        super();
    }

    OnEnter(e)
    {
        if (InteractorManager.currentInteractionType != InteractorManager.types.mouse || InteractorManager.isScrolling) return;
        super.OnEnter(e);
    }

    OnLeave(e)
    {
        if (InteractorManager.currentInteractionType != InteractorManager.types.mouse) return;
        super.OnLeave(e);
    }

    OnClick(e)
    {
        super.OnClick(e);
    }

};

window.customElements.define('gbx-inventory-item', GbxInventoryItem);