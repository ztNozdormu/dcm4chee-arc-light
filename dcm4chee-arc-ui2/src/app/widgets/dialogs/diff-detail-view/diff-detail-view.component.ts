import { Component, OnInit } from '@angular/core';
import {MdDialogRef} from "@angular/material";
import * as _ from 'lodash';
declare var DCM4CHE: any;

@Component({
  selector: 'app-diff-detail-view',
  templateUrl: './diff-detail-view.component.html'
})
export class DiffDetailViewComponent implements OnInit {

    private _studies;
    private _index;
    private _aet1;
    private _aet2;
    currentStudyIndex = [];
    currentStudy = {
        "primary":{},
        "secondary":{}
    };
    Object = Object;
    _ = _;
    DCM4CHE = DCM4CHE;
    activeTr;
    selectedVersion = 'FIRST';
    selectedVersions = {
        "FIRST":"SECOND",
        "SECOND":"FIRST"
    }
    constructor(
        public dialogRef: MdDialogRef<DiffDetailViewComponent>
    ){}

    ngOnInit() {
        this.prepareStudyWithIndex(this._index);
    }
    privateCreator(tag) {
        if ('02468ACE'.indexOf(tag.charAt(3)) < 0) {
            let block = tag.slice(4, 6);
            if (block !== '00') {
                let el = this._studies[tag.slice(0, 4) + '00' + block];
                return el && el.Value && el.Value[0];
            }
        }
        return undefined;
    }
    changeSelectedVersion(version){
        if(this.selectedVersion === version){
            this.selectedVersion = this.selectedVersions[version];
        }else{
            this.selectedVersion = version;
        }
    }
    activateTr(primaryKey){
        this.activeTr = primaryKey;
    }
    clearTr(){
        this.activeTr = "";
    }
    prepareStudyWithIndex(index?:number){
        if(_.hasIn(this._studies,index)){
            this._index = index;
            this.currentStudy = {
                "primary":{},
                "secondary":{}
            };
            let diffIndexes = [];
            let noDiffIndexes = [];
            let modifyed = this._studies[this._index]["04000561"].Value[0]["04000550"].Value[0];
            _.forEach(this._studies[this._index],(m,i)=>{
                if(i != "04000561"){
                    if(_.hasIn(modifyed,i)){
                        this.currentStudy["secondary"][i] = {
                            object:modifyed[i],
                            diff:true
                        };
                        this.currentStudy["primary"][i] = {
                            object:m,
                            diff:true
                        };
                        diffIndexes.push(i);
                    }else{
                        this.currentStudy["secondary"][i] ={
                            object:m,
                            diff:false
                        };
                        this.currentStudy["primary"][i] = {
                            object:m,
                            diff:false
                        };
                        noDiffIndexes.push(i);
                    }
                }
            });
            this.currentStudyIndex = [...diffIndexes,...noDiffIndexes];
        }
    }
    get studies() {
        return this._studies;
    }

    set studies(value) {
        this._studies = value;
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
