class EntryModelHandler
{
    /**
     * This will be executed only once per element when the attribute attached to it is bound with a model.
     */
    init(element, value)
    {
        // element.Init(value);

        if (!element.firstElementChild)
        {
            return;
        }

        element.firstElementChild.dispatchEvent(new CustomEvent('Model', { detail: { value: value, element: element } }))
    }

    /**
     * This will be executed everytime that the model which the attribute is attached to is synchronized.
     */
    update(element, value) 
    {
        if (!element.firstElementChild)
        {
            return;
        }

        element.firstElementChild.dispatchEvent(new CustomEvent('Model-Update', { detail: { value: value, element: element } }));
    }
}

engine.registerBindingAttribute("entry-model", EntryModelHandler);

class ContainerIdHandler
{
    init(element, value)
    {

        element.setAttribute("data-container-id", value);
    }
}

engine.registerBindingAttribute("container-id", ContainerIdHandler);