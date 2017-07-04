import { Component, OnInit } from '@angular/core';
import {MdDialogRef} from "@angular/material";

@Component({
  selector: 'app-diff-detail-view',
  templateUrl: './diff-detail-view.component.html'
})
export class DiffDetailViewComponent implements OnInit {

    private _study;
    private _index;
    private _aet1;
    private _aet2;
    constructor(
        public dialogRef: MdDialogRef<DiffDetailViewComponent>
    ){}

    ngOnInit() {
    }

    get study() {
        return this._study;
    }

    set study(value) {
        this._study = value;
    }

    get index() {
        return this._index;
    }

    set index(value) {
        this._index = value;
    }

    get aet1() {
        return this._aet1;
    }

    set aet1(value) {
        this._aet1 = value;
    }

    get aet2() {
        return this._aet2;
    }

    set aet2(value) {
        this._aet2 = value;
    }
}
