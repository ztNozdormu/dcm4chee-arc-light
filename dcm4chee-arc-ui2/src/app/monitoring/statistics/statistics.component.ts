import { Component, OnInit, HostListener} from '@angular/core';
import {StatisticsService} from "./statistics.service";
import * as _ from 'lodash';
import {Globalvar} from "../../constants/globalvar";

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

    studyDateTimeChanged(e, mode){
        this.range[mode] = e;
    }
    clearForm(){
        this.range = {
            from: undefined,
            to: undefined
        };
    }
    ngOnInit() {
        var d = new Date();
        d.setDate(d.getDate() - 1);
        this.range.from = d;
        this.range.to = new Date();
        this.search();
    }

    toggleBlock(mode,e){
        console.log("e",e.target.nodeName);
        if(e.target.nodeName != "INPUT"){
            this.toggle = (this.toggle === mode)? '':mode;
        }
    }

    @HostListener('window:scroll', ['$event'])
    loadMoreAuditOnScroll(event) {
        let hT = ($('.load_more').offset()) ? $('.load_more').offset().top : 0,
            hH = $('.load_more').outerHeight(),
            wH = $(window).height(),
            wS = window.pageYOffset;
        console.log("ws",wS);
        console.log("hT + hH - wH",(hT + hH - wH));
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
        this.getRetrieveCounts();
        this.getQueriesCounts();
        this.getErrorCounts();
        this.getQueriesUserID();
    }
    //barChartOptions.legend.position
    public barChartOptions:any = {
        scaleShowVerticalLines: false,
        responsive: true,
        maintainAspectRatio: false,
        legend:{
            position:'right'
        },
        scales: {
            xAxes: [{
                type: 'time',
                time: {
                    displayFormats: {
                        'millisecond': 'DD.MM.YYYY',
                        'second': 'DD.MM.YYYY',
                        'minute': 'DD.MM.YYYY',
                        'hour': 'DD.MM.YYYY',
                        'day': 'DD.MM.YYYY',
                        'week': 'DD.MM.YYYY',
                        'month': 'DD.MM.YYYY',
                        'quarter': 'DD.MM.YYYY',
                        'year': 'DD.MM.YYYY',
                    }
                }
            }],
            yAxes: [{
                ticks: {
                    min: 0
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Queries'
                }
            }]
        }
    };
    public barChartLabels = [];
    public pieChartColor =  Globalvar.HISTOGRAMCOLORS;
    public barChartType:string = 'bar';
    public barChartLegend:boolean = true;
    public barChartData:any[] = [];
    histogramData = {
        querieUserID:{
            labels:[],
            data:{},
            ready:{
                labels:[],
                data:[]
            },
            show:true
        }
    }
    // events
    public chartClicked(e:any):void {
        console.log(e);
    }

    public chartHovered(e:any):void {
        console.log(e);
    }
    isRangeSmallerThan24H(){
        if((new Date(this.range.to).getTime()) - (new Date(this.range.from).getTime()) < 86400005)
            return true;
        else
            return false;
    }
    refreshChart(histogram){
        this.histogramData[histogram].show = false;
        setTimeout(()=>{
            this.histogramData[histogram].show = true;
        },1);
    }
    prepareHistogramData(response, histogram){
        let $this = this;
        if(this.isRangeSmallerThan24H()){
            this.barChartOptions.scales.xAxes[0].time.displayFormats = {
                'millisecond': 'HH:mm:ss',
                'second': 'HH:mm:ss',
                'minute': 'HH:mm:ss',
                'hour': 'HH:mm:ss',
                'day': 'HH:mm:ss',
                'week': 'HH:mm:ss',
                'month': 'HH:mm:ss',
                'quarter': 'HH:mm:ss',
                'year': 'HH:mm:ss',
            }
        }else{
            this.barChartOptions.scales.xAxes[0].time.displayFormats = {
                'millisecond': 'DD.MM.YYYY',
                'second': 'DD.MM.YYYY',
                'minute': 'DD.MM.YYYY',
                'hour': 'DD.MM.YYYY',
                'day': 'DD.MM.YYYY',
                'week': 'DD.MM.YYYY',
                'month': 'DD.MM.YYYY',
                'quarter': 'DD.MM.YYYY',
                'year': 'DD.MM.YYYY',
            }
        }
        $this.histogramData[histogram] = {
            labels:[],
            data:{},
            ready:{
                labels:[],
                    data:[]
            }
        }
        if(_.hasIn(response,"aggregations.2.buckets") && _.size(response.aggregations[2].buckets) > 0){
            _.forEach(response.aggregations["2"].buckets,(m,i)=>{
                $this.histogramData[histogram].labels.push(m.key);
                _.forEach(m[3].buckets,(bucket,bIndex)=>{
                    $this.histogramData[histogram].data[bucket.key] = $this.histogramData[histogram].data[bucket.key] ? $this.histogramData[histogram].data[bucket.key] : {};
                    $this.histogramData[histogram].data[bucket.key].data = $this.histogramData[histogram].data[bucket.key].data || [];
                    if($this.histogramData[histogram].data[bucket.key].data.length < $this.histogramData[histogram].labels.length){
                        for (let arr = 0; arr < $this.histogramData[histogram].labels.length;arr++){
                            if(!$this.histogramData[histogram].data[bucket.key].data[arr]){
                                $this.histogramData[histogram].data[bucket.key].data.push(null);
                            }
                        }
                    }
                    $this.histogramData[histogram].data[bucket.key].data[$this.histogramData[histogram].labels.length-1] = bucket.doc_count;
                });
            });
            $this.histogramData[histogram].ready.labels = [this.range.from, ...$this.histogramData[histogram].labels.map(time => { return new Date(time);}), this.range.to];
            _.forEach($this.histogramData[histogram].data,(d,j)=>{
                $this.histogramData[histogram].ready.data.push({
                    label:j,
                    data:[null,...d.data,null]
                });
            });
            if(Object.keys($this.histogramData[histogram].data).length < 11){
                $this.barChartOptions.legend.position = 'top';
            }else{
                if(Object.keys($this.histogramData[histogram].data).length < 30){
                    $this.barChartOptions.legend.position = 'right';
                }else{
                    //TODO don't Show histogram
                    $this.histogramData[histogram] = {
                        labels:[],
                        data:{},
                        ready:{
                            labels:[],
                            data:[]
                        }
                    }
                }
            }
            this.refreshChart(histogram);
        }else{
            console.log("in empty data",response);
            $this.histogramData[histogram] = {
                labels:[],
                data:{},
                ready:{
                    labels:[],
                    data:[]
                },
                noDataText:"No data found!",
            }
        }
        console.log("$this.histogramData",$this.histogramData);
    }
    getQueriesUserID(){
        let $this = this;
        this.service.getQueriesUserID(this.range).subscribe(
            (res)=>{
                console.log("userid queries =",res);
                let dummy = {"responses":[{"took":59,"timed_out":false,"_shards":{"total":105,"successful":105,"failed":0},"hits":{"total":2801,"max_score":0.0,"hits":[]},"aggregations":{"2":{"buckets":[{"key_as_string":"2017-04-01T00:00:00.000+02:00","key":1490997600000,"doc_count":2165,"3":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"STORESCU","doc_count":1499},{"key":"J4C_VIEWER_14","doc_count":41}]}},{"key_as_string":"2017-05-01T00:00:00.000+02:00","key":1493589600000,"doc_count":636,"3":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"J4CARE_VIEWER","doc_count":465},{"key":"J4C_VIEWER_14","doc_count":171}]}}]}},"status":200}]};
                console.log("dummy",dummy);
                $this.prepareHistogramData(res,'querieUserID');
            },
            (err)=>{
                $this.studieStored.count = "-";
                console.log("error",err);
            });
    }
    getAuditEvents(){
        let $this = this;
        this.service.getAuditEvents(this.range).subscribe((res)=>{
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
        this.service.getStudiesStoredCounts(this.range).subscribe(
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
    getRetrieveCounts(){
        let $this = this;
        this.service.getRetrieveCounts(this.range).subscribe(
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
        this.service.getQueriesCounts(this.range).subscribe(
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
        this.service.getErrorCounts(this.range).subscribe(
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
