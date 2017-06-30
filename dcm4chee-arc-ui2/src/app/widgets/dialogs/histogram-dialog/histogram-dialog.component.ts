import { Component, OnInit } from '@angular/core';
import {MdDialogRef} from "@angular/material";
import {Globalvar} from "../../../constants/globalvar";

@Component({
  selector: 'app-histogram-dialog',
  templateUrl: './histogram-dialog.component.html'
})
export class HistogramDialogComponent implements OnInit {

    private _histogramData;
    private _barChartOptions;
    private _pieChartColor;
    private _barChartLegend;
    private _barChartType;
    private _title;
    constructor(
      public dialogRef: MdDialogRef<HistogramDialogComponent>
    ) {}

    ngOnInit() {
        this._pieChartColor = Globalvar.HISTOGRAMCOLORS;
    }

    get title() {
        return this._title;
    }

    set title(value) {
        this._title = value;
    }

    get histogramData() {
        return this._histogramData;
    }

    set histogramData(value) {
        this._histogramData = value;
    }

    get barChartOptions() {
        return this._barChartOptions;
    }

    set barChartOptions(value) {
        this._barChartOptions = value;
    }

    get pieChartColor() {
        return this._pieChartColor;
    }

    set pieChartColor(value) {
        this._pieChartColor = value;
    }

    get barChartLegend() {
        return this._barChartLegend;
    }

    set barChartLegend(value) {
        this._barChartLegend = value;
    }

    get barChartType() {
        return this._barChartType;
    }

    set barChartType(value) {
        this._barChartType = value;
    }
}
