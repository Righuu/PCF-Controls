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
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement): void
    {
        this.dropdown = document.createElement("select");
        this._notifyOutputChanged = notifyOutputChanged;
        this._refreshData = this.refreshData.bind(this);
        const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.text = "Select a Year";
    defaultOption.disabled = false;
    defaultOption.selected = false;
    this.dropdown.appendChild(defaultOption);
        // Add some options to the dropdown (for example, a range of years)
        const currentYear = new Date().getFullYear();
        for (let year = currentYear - 10; year <= currentYear; year++) {
            const option = document.createElement("option");
            option.value = year.toString();
            option.text = year.toString();
            this.dropdown.appendChild(option);
        }
        const selectedValue = context.parameters.controlValue.formatted ? context.parameters.controlValue.formatted : currentYear.toString();
        this.dropdown.value = selectedValue;

        this.labelElement = document.createElement("label");
this.labelElement.setAttribute("class", "YearDropdownLabel");
this.labelElement.setAttribute("id", "yearLabel");
if(this.dropdown.value != null)
    this.labelElement.innerHTML = "Selected Year: ".concat(this.dropdown.value);
else
this.labelElement.textContent = "Select Year:";
// Append the elements to the control's container
this.container = container;
this.container.appendChild(this.labelElement);
this.container.appendChild(this.dropdown);

// Add event listener to handle dropdown changes
this.dropdown.addEventListener("change", this._refreshData);
    }
    public refreshData(evt: Event): void {
        this._value = this.dropdown.value;
        this.labelElement.innerHTML = `Selected Year: ${this.dropdown.value}`;
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
