import { Component, OnInit } from '@angular/core';
import {DiffProService} from "./diff-pro.service";
import {SlimLoadingBarService} from "ng2-slim-loading-bar";
import {AppService} from "../../app.service";

@Component({
  selector: 'app-diff-pro',
  templateUrl: './diff-pro.component.html'
})
export class DiffProComponent implements OnInit {
    filters = {
        ExporterID: undefined,
        offset: undefined,
        limit: 3000,
        status: '*',
        StudyUID: undefined,
        updatedBefore: undefined,
        dicomDeviceName: undefined
    };
    aes;
    aets;
    aet1;
    aet2;
    homeAet;
    diff;
    startDate;
    endDate;
    count;
    constructor(
        private service:DiffProService,
        private cfpLoadingBar: SlimLoadingBarService,
        private mainservice:AppService
    ) { }

    ngOnInit() {
        this.getAes(2);
        this.getAets(2);
    }

    search(){
        let $this = this;
        this.cfpLoadingBar.start();
        if(this.service.getDiffs($this.homeAet,$this.aet1,$this.aet2)){
            this.service.getDiffs($this.homeAet,$this.aet1,$this.aet2).subscribe(
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
