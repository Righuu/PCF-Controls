import { IInputs, IOutputs } from "./generated/ManifestTypes";
import "./YearPCFControl.css";

export class YearPCF implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _value: string;
    private _notifyOutputChanged: () => void;
    private container: HTMLDivElement;
    private labelElement: HTMLLabelElement;
    private _context: ComponentFramework.Context<IInputs>;
    private _refreshData: EventListenerOrEventListenerObject;
    private dropdown: HTMLSelectElement;
    constructor()
    {

    }
    public async init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement): Promise<void>
    {
        this.dropdown = document.createElement("select");
        this._notifyOutputChanged = notifyOutputChanged;
        this._refreshData = this.refreshData.bind(this);
        const defaultOption = document.createElement("option");
        this._context = context;
       
    defaultOption.value = "";
    defaultOption.text = "Select a Year";
    defaultOption.disabled = false;
    defaultOption.selected = false;
    this.dropdown.appendChild(defaultOption);
     // Add some options to the dropdown (for example, a range of years)
      const currentYear = new Date().getFullYear();
   
      try {
        const response = await this._context.webAPI.retrieveMultipleRecords("bcb_appconfig", `?$filter=bcb_name eq 'Year Configuration'&$top=1`);
        if (response.entities && response.entities.length > 0) {
            const data = response.entities[0];
            const jsonObject = JSON.parse(data.bcb_attribute1);
            const startYearData = jsonObject.startYear;
            const endYearData = jsonObject.endYear;
            const differenceYear = endYearData - startYearData;
            for (let year = endYearData - differenceYear; year <= endYearData; year++) {
                const option = document.createElement("option");
                option.value = year.toString();
                option.text = year.toString();
                this.dropdown.appendChild(option);
            }
            const selectedValue = context.parameters.controlValue.formatted ? context.parameters.controlValue.formatted : new Date().getFullYear().toString();
            this.dropdown.value = selectedValue;
        } else {
            for (let year = new Date().getFullYear() - 10; year <= new Date().getFullYear(); year++) {
                const option = document.createElement("option");
                option.value = year.toString();
                option.text = year.toString();
                this.dropdown.appendChild(option);
            }
            const selectedValue = context.parameters.controlValue.formatted ? context.parameters.controlValue.formatted : new Date().getFullYear().toString();
            this.dropdown.value = selectedValue;
        }
    } catch (error) {
        for (let year = new Date().getFullYear() - 10; year <= new Date().getFullYear(); year++) {
            const option = document.createElement("option");
            option.value = year.toString();
            option.text = year.toString();
            this.dropdown.appendChild(option);
        }
        const selectedValue = context.parameters.controlValue.formatted ? context.parameters.controlValue.formatted : new Date().getFullYear().toString();
        this.dropdown.value = selectedValue;
    }
// Append the elements to the control's container
this.container = container;
this.container.appendChild(this.dropdown);

// Add event listener to handle dropdown changes
this.dropdown.addEventListener("change", this._refreshData);
    }
    public refreshData(evt: Event): void {
        this._value = this.dropdown.value;
        this._notifyOutputChanged();
     }
    public updateView(context: ComponentFramework.Context<IInputs>): void
    {
        // Add code to update control view
        const newValue = context.parameters.controlValue.formatted ? context.parameters.controlValue.formatted : new Date().getFullYear().toString();
        this.dropdown.value = newValue;
    }
    public getOutputs(): IOutputs
    {
         // Return the selected value from the dropdown
         return {
            selectedYear: this.dropdown.value
        };
    }
    public destroy(): void
    {
        this.dropdown.removeEventListener("change", () => {});
    }
}
