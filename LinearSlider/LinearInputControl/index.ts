import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class LinearInputControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private _value: number;
    private _notifyOutputChanged: () => void;
    private labelElement: HTMLLabelElement;
    private inputElement: HTMLInputElement;
    private _container: HTMLDivElement;
    private _context: ComponentFramework.Context<IInputs>;
    private _refreshData: EventListenerOrEventListenerObject;
    constructor()
    {

    }
    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
        ): void {
           // Add control initialization code
        this._context = context;
        this._container = document.createElement("div");
        this._notifyOutputChanged = notifyOutputChanged;
        this._refreshData = this.refreshData.bind(this);
     
        // creating HTML elements for the input type range and binding it to the function which 
        // refreshes the control data
        this.inputElement = document.createElement("input");
        this.inputElement.setAttribute("type", "range");
        this.inputElement.addEventListener("input", this._refreshData);
        
        // creating a HTML label element that shows the value that is set on the linear range control
        this.labelElement = document.createElement("label");
        this.labelElement.setAttribute("class", "LinearRangeLabel");
        this.labelElement.setAttribute("id", "lrclabel");

        this.getColumnMetadata(
         context.parameters.controlValue.attributes?.EntityLogicalName || '', 
         context.parameters.controlValue.attributes?.LogicalName || '', 
         (minValue, maxValue) => {
           this.inputElement.setAttribute("min", minValue ? minValue.toString() : "1");
           this.inputElement.setAttribute("max", maxValue ? maxValue.toString() : "1000");
         }
       );

        // Retrieving the latest value from the control and setting it to the HTML elements.
        this._value = context.parameters.controlValue.raw!;
        this.inputElement.setAttribute("value", context.parameters.controlValue.formatted ? context.parameters.controlValue.formatted : "0");
        this.labelElement.innerHTML = context.parameters.controlValue.formatted ? context.parameters.controlValue.formatted : "0";
     
        // appending the HTML elements to the control's HTML container element.
        this._container.appendChild(this.inputElement);
        this._container.appendChild(this.labelElement);
        container.appendChild(this._container);
     }

    public refreshData(evt: Event): void {
        this._value = this.inputElement.value as unknown as number;
        this.labelElement.innerHTML = this.inputElement.value;
        this._notifyOutputChanged();
     }
    public updateView(context: ComponentFramework.Context<IInputs>): void
    {
        // Add code to update control view
   // storing the latest context from the control.
   this._value = context.parameters.controlValue.raw!;
   this._context = context;
   this.inputElement.setAttribute(
      "value",
      context.parameters.controlValue.formatted
      ? context.parameters.controlValue.formatted
      : ""
   );
   this.labelElement.innerHTML = context.parameters.controlValue.formatted
      ? context.parameters.controlValue.formatted
      : "";
    }

    public getOutputs(): IOutputs
    {
        return {
            controlValue: this._value,
         };
    }

    public destroy(): void
    {
        // Add code to cleanup control if necessary
   this.inputElement.removeEventListener("input", this._refreshData);
    }
    private getColumnMetadata(entityName: string, attributeName: string, callback: (minValue: number | null, maxValue: number | null) => void): void {
      const url = `${Xrm.Utility.getGlobalContext().getClientUrl()}/api/data/v9.2/EntityDefinitions(LogicalName='${entityName}')/Attributes(LogicalName='${attributeName}')`;

      const req = new XMLHttpRequest();
      req.open("GET", url, true);
      req.setRequestHeader("OData-MaxVersion", "4.0");
      req.setRequestHeader("OData-Version", "4.0");
      req.setRequestHeader("Accept", "application/json");
      req.setRequestHeader("Content-Type", "application/json; charset=utf-8");

      req.onreadystatechange = function () {
          if (this.readyState === 4) {
              req.onreadystatechange = null;
              if (this.status === 200) {
                  const response = JSON.parse(this.response);
                  const attributeType = response["@odata.type"].split('#')[1];

                  let minValue = null;
                  let maxValue = null;

                  if (attributeType === "Microsoft.Dynamics.CRM.IntegerAttributeMetadata" || attributeType === "Microsoft.Dynamics.CRM.MoneyAttributeMetadata") {
                      minValue = response.MinValue;
                      maxValue = response.MaxValue;
                  }

                  callback(minValue, maxValue);
              } else {
                  console.error("Error retrieving metadata: " + this.statusText);
              }
          }
      };

      req.send();
  }
}
