import { Component, OnInit } from '@angular/core';
import {MdDialogRef} from "@angular/material";
import * as _ from 'lodash';

@Component({
  selector: 'app-dicom-operations',
  templateUrl: './dicom-operations.component.html'
})
export class DicomOperationsComponent implements OnInit {

    private _aes;
    private _aet1;
    private _aet2;
    private _copyScp1;
    private _cMoveScp1;
    private _copyScp2;
    private _cMoveScp2;
    constructor(public dialogRef: MdDialogRef<DicomOperationsComponent>) { }

    ngOnInit() {
    }


    get aes() {
        return this._aes;
    }

    set aes(value) {
        this._aes = value;
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

    get cMoveScp1() {
        return this._cMoveScp1;
    }

    set cMoveScp1(value) {
        this._cMoveScp1 = value;
    }

    get copyScp2() {
        return this._copyScp2;
    }

    set copyScp2(value) {
        this._copyScp2 = value;
    }

    get cMoveScp2() {
        return this._cMoveScp2;
    }

    set cMoveScp2(value) {
        this._cMoveScp2 = value;
    }

    get copyScp1() {
        return this._copyScp1;
    }

    set copyScp1(value) {
        this._copyScp1 = value;
    }
}
