import { Component, OnInit } from '@angular/core';
import {DiffProService} from "./diff-pro.service";
import {SlimLoadingBarService} from "ng2-slim-loading-bar";
import {AppService} from "../../app.service";
import {Globalvar} from "../../constants/globalvar";
import {DatePipe} from "@angular/common";
import * as _ from 'lodash';

@Component({
  selector: 'app-diff-pro',
  templateUrl: './diff-pro.component.html'
})
export class DiffProComponent implements OnInit {
    filters = {
        ExporterID: undefined,
        offset: undefined,
        limit: 3000,
        StudyUID: undefined,
        updatedBefore: undefined,
        dicomDeviceName: undefined,
        AccessionNumber:undefined,
        PatientName:undefined,
        fuzzymatching:undefined,
        PatientID:undefined,
        IssuerOfPatientID:undefined,
        StudyDescription:undefined,
        StudyInstanceUID:undefined,
        LocalNamespaceEntityID:undefined,
        'ScheduledProcedureStepSequence.ScheduledStationAETitle':undefined,
        ReferringPhysicianName:undefined,
        ModalitiesInStudy:undefined,
        StudyDate:undefined,
        StudyTime:undefined,
        SeriesDescription:undefined,
        StudyID:undefined,
        BodyPartExamined:undefined,
        SOPClassesInStudy:undefined,
        SendingApplicationEntityTitleOfSeries:undefined,
        InstitutionalDepartmentName:undefined,
        StationName:undefined,
        InstitutionName:undefined,
    };
    aes;
    aets;
    aet1;
    aet2;
    homeAet;
    advancedConfig = false;
    diff;
    count;
    disabled = {
        IssuerOfPatientID:false,
        LocalNamespaceEntityID:false
    };
    modalities;
    showModalitySelector;
    StudyReceiveDateTime = {
        from: undefined,
        to: undefined
    };
    StudyDateTime = {
        from: undefined,
        to: undefined
    };
    selectModality(key){
        this.filters.ModalitiesInStudy = key;
        this.filters['ScheduledProcedureStepSequence.Modality'] = key;
        $('.Modality').show();
        this.showModalitySelector = false;
    };
    constructor(
        private service:DiffProService,
        private cfpLoadingBar: SlimLoadingBarService,
        private mainservice:AppService
    ) { }

    ngOnInit() {
        this.getAes(2);
        this.getAets(2);
        this.modalities = Globalvar.MODALITIES;
    }
    clearForm(){
        _.forEach(this.filters, (m, i) => {
            if(i != "limit"){
                this.filters[i] = '';
            }
        });
        this.StudyReceiveDateTime = {
            from: undefined,
            to: undefined
        };
        this.StudyDateTime = {
            from: undefined,
            to: undefined
        };
    };
    studyReceiveDateTimeChanged(e, mode){
        this.filters['StudyReceiveDateTime'] = this.filters['StudyReceiveDateTime'] || {};
        this['StudyReceiveDateTime'][mode] = e;
        if (this.StudyReceiveDateTime.from && this.StudyReceiveDateTime.to){
            let datePipeEn = new DatePipe('us-US');
            this.filters['StudyReceiveDateTime'] = datePipeEn.transform(this.StudyReceiveDateTime.from, 'yyyyMMddHHmmss') + '-' + datePipeEn.transform(this.StudyReceiveDateTime.to, 'yyyyMMddHHmmss');
        }
    }
    studyDateTimeChanged(e, mode){
        this.filters['StudyDate'] = this.filters['StudyDate'] || {};
        this['StudyDateTime'][mode] = e;
        if (this.StudyDateTime.from && this.StudyDateTime.to){
            let datePipeEn = new DatePipe('us-US');
            let fromDate = datePipeEn.transform(this.StudyDateTime.from, 'yyyyMMdd');
            let toDate = datePipeEn.transform(this.StudyDateTime.to, 'yyyyMMdd');
            let fromTime = datePipeEn.transform(this.StudyDateTime.from, 'HHmmss');
            let toTime = datePipeEn.transform(this.StudyDateTime.to, 'HHmmss');
            if(fromDate === toDate){
                this.filters['StudyDate'] = fromDate;
            }else{
                this.filters['StudyDate'] = fromDate + '-' + toDate;
            }
            if(fromTime === toTime){
                this.filters['StudyTime'] = fromTime;
            }else{
                this.filters['StudyTime'] = fromTime + '-' + toTime;
            }
        }
    }
    conditionWarning($event, condition, msg){
        let id = $event.currentTarget.id;
        let $this = this;
        if (condition){
            this.disabled[id] = true;
            this.mainservice.setMessage({
                'title': 'Warning',
                'text': msg,
                'status': 'warning'
            });
            setTimeout(function() {
                $this.disabled[id] = false;
            }, 100);
        }
    };

    appendFilter(filter, key, range, regex) {
        let value = range.from.replace(regex, '');
        if (range.to !== range.from)
            value += '-' + range.to.replace(regex, '');
        if (value.length)
            filter[key] = value;
    }
    createStudyFilterParams() {
        let filter = Object.assign({}, this.filters);
        return filter;
    }
    createQueryParams(limit, filter) {
        let params = {
            includefield: 'all',
            limit: limit
        };
        for (let key in filter){
            if (filter[key] || filter === false){
                params[key] = filter[key];
            }
        }
        return params;
    }
    search(){
        let $this = this;
        this.cfpLoadingBar.start();
        let queryParameters = this.createQueryParams(this.filters.limit + 1, this.createStudyFilterParams());
        if(this.service.getDiffs($this.homeAet,$this.aet1,$this.aet2, queryParameters)){
            this.service.getDiffs($this.homeAet,$this.aet1,$this.aet2, queryParameters).subscribe(
                (res)=>{
                    if(res[0] && res[1]){
                        $this.diff = [...res[0],...res[1]];
                    }else{
                        if(!res[0] && !res[1]){
                            $this.diff = [];
                            $this.mainservice.setMessage({
                                'title': 'Info',
                                'text': "No diffs ware found",
                                'status': 'info'
                            });
                        }else{
                            if(res[0]){
                                $this.diff = res[0];
                            }else{
                                $this.diff = res[1];
                            }
                        }
                    }
                    $this.count = $this.diff.length;
                    this.cfpLoadingBar.complete();
                },(err)=>{
                    this.cfpLoadingBar.complete();
                    console.log("error",err);
                });
        }
    }
    getAes(retries){
        let $this = this;
        this.service.getAes().subscribe(
            (aes)=>{
                $this.aes = aes;
            },
            (err)=>{
                if (retries){
                    $this.getAes(retries - 1);
                }
            }
        );
    }
    getAets(retries){
        let $this = this;
        this.service.getAets().subscribe(
            (aets)=>{
                $this.aets = aets;
                $this.homeAet = aets[0].title;
            },
            (err)=>{
                if (retries){
                    $this.getAets(retries - 1);
                }
            }
        );
    }
}
