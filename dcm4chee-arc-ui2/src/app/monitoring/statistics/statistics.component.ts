import { Component, OnInit } from '@angular/core';
import {StatisticsService} from "./statistics.service";
import * as _ from 'lodash';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html'
})
export class StatisticsComponent implements OnInit {

    range = {
        from: undefined,
        to: undefined
    };
    studieStored = {
        label:"Studies Stored Count",
        count:undefined
    }
    auditEvents;
    constructor(
        private service:StatisticsService
    ) { }

    ngOnInit() {
        this.getAuditEvents();
        this.getStudiesStoredCounts();
    }
    public barChartOptions:any = {
        scaleShowVerticalLines: false,
        responsive: true
    };
    public barChartLabels:string[] = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
    public barChartType:string = 'bar';
    public barChartLegend:boolean = true;

    public barChartData:any[] = [
        {data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A'},
        {data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B'},
        {data: [18, 28, 50, 9, 26, 7, 80], label: 'Series B'}
    ];

    // events
    public chartClicked(e:any):void {
        console.log(e);
    }

    public chartHovered(e:any):void {
        console.log(e);
    }
    getAuditEvents(){
        let $this = this;
        this.service.getAuditEvents().subscribe((res)=>{
            console.log("res",res);
            $this.auditEvents = res.hits.hits.map((audit)=>{
                console.log("audit",audit);
                return {
                    AuditSourceID:(_.hasIn(audit,"_source.AuditSource.AuditSourceID"))?audit._source.AuditSource.AuditSourceID:'-',
                    EventID:(_.hasIn(audit,"_source.EventID.originalText"))?audit._source.EventID.originalText:'-',
                    ActionCode:(_.hasIn(audit,"_source.Event.EventActionCode"))?audit._source.Event.EventActionCode:'-',
                    Patient:(_.hasIn(audit,"_source.Patient.ParticipantObjectName"))?audit._source.Patient.ParticipantObjectName:'-',
                    Study:(_.hasIn(audit,"_source.Study.ParticipantObjectID"))?audit._source.Study.ParticipantObjectID:'-',
                    AccessionNumber:(_.hasIn(audit,"_source.AccessionNumber"))?audit._source.AccessionNumber:'-',
                    userId:(_.hasIn(audit,"_source.Source.UserID"))?audit._source.Source.UserID:'-',
                    requestorId:(_.hasIn(audit,"_source.Requestor.UserID"))?audit._source.Requestor.UserID:'-',
                    EventOutcomeIndicator:(_.hasIn(audit,"_source.Event.EventOutcomeIndicator"))?audit._source.Event.EventOutcomeIndicator:'-',
                    Time:(_.hasIn(audit,"_source.Event.EventDateTime"))?audit._source.Event.EventDateTim:'-'
                }
            });
            console.log("auditEvnets",$this.auditEvents);
        });
    }
    getStudiesStoredCounts(){
        let $this = this;
        this.service.getStudiesStoredCounts().subscribe(
            (res)=>{
                $this.studieStored.count = res.hits.total;
            },
            (err)=>{
                console.log("error",err);
            });
    }

}
