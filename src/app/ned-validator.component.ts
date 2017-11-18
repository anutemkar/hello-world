import { Component, OnInit } from '@angular/core';
import { NedValidatorService } from './../../services/ned/nedvalidator.service';


@Component({
    selector: 'app-ned-validator',
    templateUrl: './ned-validator.component.html',
    styleUrls: ['./ned-validator.component.css']
})
export class NedValidatorComponent implements OnInit {
    Validators;
    SelectedValidator;
    Command;
    CommandResult;
    _infitoken;
    _isreloaded: boolean = false;
    constructor(private nedService: NedValidatorService) {
    }
    ngOnInit() {
        this.login()

        this.CommandResult;
    }

    login() {
        this.nedService.login('admin', 'admin')
            .subscribe(data => {
                this._infitoken = data.infitoken;
                this.getNedValidatorList();
            })
    }

    getNedValidatorList = function () {

        this.nedService.getNedValidators(this._infitoken)
            .subscribe(data => {
                this.Validators = data.response.result.results;
                console.log("NedValidationCompnent.NedList:" + JSON.stringify(this.Validators));
                if (this.Validators && this.Validators.length > 0)
                    this.SelectedValidator = this.Validators[0]
                this._infitoken = data.infitoken;

            })
    }

    onExecute() {
        //let formated = this.Command.replace(/[\r\n]+/g, " ") // replaces all \r - Carriage Return \n - Line Feed 
        console.log("NedValidationCompnent.NedCommand:" + this.Command + " NedValidator: " + JSON.stringify(this.SelectedValidator));
        this.CommandResult = "";
        this.nedService.runNedCommand(this.SelectedValidator, this.Command, this._infitoken)
            .subscribe(data => {
                if (data.success) {
                    console.log("NedValidationCompnent.CommandOutput:" + JSON.stringify(data.response.result));
                    let message = data.response.result.find(i => i.name == "message");
                    if (message) { this.CommandResult = message.value }
                    this._infitoken = data.infitoken;
                }
                else {
                    console.log("NedValidationCompnent.CommandOutput:" + JSON.stringify(data.error.result));
                    if (data.error) { this.CommandResult = data.error }
                    this._infitoken = data.infitoken;
                }

            });
    }

    onExport() {
        this.createCsv("NedExecutionResult");
    }

    private getExportData() {
        let result = "Ned Validator Type" + ','

        if (this.SelectedValidator instanceof Array && this.SelectedValidator.length < 2)
            result += JSON.stringify(this.SelectedValidator[1]);

        result += ',' + '\r\n' + "Command" + ',';

        if (this.Command)
            result += this.replaceAll(JSON.stringify(this.Command), ',', ';');

        result += '\r\n' + "Result" + ',';

        if (this.CommandResult && this.CommandResult != "command output generate here")
            result += this.replaceAll(this.CommandResult, ',', ';');

        result += '\r\n'

        return result;
    }

    private createCsv(exportFileName: string): void {
        var csvData = this.getExportData();

        var blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
        exportFileName += '.csv';
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, exportFileName)
        } else {
            var link = document.createElement("a");
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                var url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", exportFileName);
                //link.style = "visibility:hidden";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }

    replaceAll(str, find, replace): string {
        return str.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
      }
      
    escapeRegExp(str):string {
        return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
      }
}
