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
    toggle = "";
    searchlist = "";
    constructor(
        private service:StatisticsService
    ) { }

    ngOnInit() {
        this.search();
    }

    toggleBlock(mode){
        this.toggle = (this.toggle === mode)? '':mode;
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
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            xAxes: [{
                type: 'time',
                time: {
                    displayFormats: {
                        'millisecond': 'YYYY MMM',
                        'second': 'YYYY MMM',
                        'minute': 'YYYY MMM',
                        'hour': 'YYYY MMM',
                        'day': 'YYYY MMM',
                        'week': 'YYYY MMM',
                        'month': 'YYYY MMM',
                        'quarter': 'YYYY MMM',
                        'year': 'YYYY MMM',
                    }
                }
            }],
            yAxes: [{
                ticks: {
                    min: 0
                }
            }]
        }
    };
    newDate(days) {
        return new Date(2017, 3+days, 4+days, 10, 6, 23, 0);
    }
    public barChartLabels = [
        new Date(2012, 3, 4, 10, 6, 23, 0),
        new Date(2014, 3, 4, 10, 6, 23, 0),
        new Date(2016, 3, 28, 10, 6, 23, 0),
        new Date(2016, 3, 28, 10, 7, 23, 0),
        new Date(2016, 5 , 29, 10, 6, 23, 0),
        new Date(2017, 1, 28, 10, 6, 23, 0),
        new Date(2017, 2, 8, 10, 6, 23, 0),
        new Date(2017, 4, 13, 10, 6, 23, 0),
    ];
    public pieChartColor =  [
        {
            backgroundColor: 'rgba(62, 83, 98, 0.84)'
        },
        {
            backgroundColor: 'rgba(0, 32, 57, 0.84)'
        },
        {
            backgroundColor: 'rgba(97, 142, 181, 0.84)'
        },
        {
            backgroundColor: 'rgba(38, 45, 51, 0.84)'
        },
        {
            backgroundColor: 'rgba(0, 123, 90, 0.84)'
        },
        {
            backgroundColor: 'rgba(56, 38, 109, 0.84)'
        },
        {
            backgroundColor: 'rgba(109, 41, 41, 0.84)'
        },
        {
            backgroundColor: 'rgba(20, 55, 16, 0.84)'
        },
        {
            backgroundColor: 'rgba(54, 111, 121, 0.84)'
        }
    ];
    public barChartType:string = 'bar';
    public barChartLegend:boolean = true;

    public barChartData:any[] =  [
        {
            label: "My First dataset",
            data: [null, 223, 324, 21, 1104, 2, 50,null],
        },
        {
            label: "My sec",
            data: [null, 20, null, 225, 312, null,4, null],
        },
        {
            label: "My sec2",
            data: [null, null, 123, null, 323, null,423, null],
        }
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
