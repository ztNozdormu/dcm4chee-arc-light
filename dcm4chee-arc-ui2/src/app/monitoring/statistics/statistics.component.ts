import { Component, OnInit, HostListener} from '@angular/core';
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
    };
    retriev = {
        label:"Retrieves Count",
        count:undefined
    };
    queries = {
        label:"Queries Count",
        count:undefined
    };
    errors = {
        label:"Errors",
        count:undefined
    };
    auditEvents;
    moreAudit = {
        limit: 30,
        start: 0,
        loaderActive: false
    };
    searchlist = "";
    constructor(
        private service:StatisticsService
    ) { }

    ngOnInit() {
        this.search();
    }

    @HostListener('window:scroll', ['$event'])
    loadMoreAuditOnScroll(event) {
        let hT = ($('.load_more').offset()) ? $('.load_more').offset().top : 0,
            hH = $('.load_more').outerHeight(),
            wH = $(window).height(),
            wS = window.pageYOffset;
        if (wS > (hT + hH - wH)){
            this.loadMoreAudit();
        }
    }
    loadMoreAudit(){
        this.moreAudit.loaderActive = true;
        this.moreAudit.limit += 20;
        this.moreAudit.loaderActive = false;
    }
    search(){
        this.getAuditEvents();
        this.getStudiesStoredCounts();
        this.getRetrievCounts();
        this.getQueriesCounts();
        this.getErrorCounts();
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
            $this.auditEvents = res.hits.hits.map((audit)=>{
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
                    Time:(_.hasIn(audit,"_source.Event.EventDateTime"))?audit._source.Event.EventDateTime:undefined
                }
            });
        });
    }
    getStudiesStoredCounts(){
        let $this = this;
        this.service.getStudiesStoredCounts().subscribe(
            (res)=>{
                try {
                    $this.studieStored.count = res.hits.total;
                }catch (e){
                    $this.studieStored.count = "-";
                }
            },
            (err)=>{
                $this.studieStored.count = "-";
                console.log("error",err);
            });
    }
    getRetrievCounts(){
        let $this = this;
        this.service.getRetrievCounts().subscribe(
            (res)=>{
                try {
                    $this.retriev.count = res.hits.total;
                }catch (e){
                    $this.retriev.count = "-";
                }
            },
            (err)=>{
                $this.retriev.count = "-";
                console.log("error",err);
            });
    }
    getQueriesCounts(){
        let $this = this;
        this.service.getQueriesCounts().subscribe(
            (res)=>{
                try {
                    $this.queries.count = res.hits.total;
                }catch (e){
                    $this.queries.count = "-";
                }
            },
            (err)=>{
                console.log("error",err);
                $this.queries.count = "-";
            });
    }
    getErrorCounts(){
        let $this = this;
        this.service.getErrorCounts().subscribe(
            (res)=>{
                try {
                    $this.errors.count = res.hits.total;
                }catch (e){
                    $this.errors.count = "-";
                }
            },
            (err)=>{
                console.log("error",err);
                $this.errors.count = "-";
            });
    }

}
