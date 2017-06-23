import { Injectable } from '@angular/core';
import {Http} from "@angular/http";
import {WindowRefService} from "../../helpers/window-ref.service";
import Global = NodeJS.Global;
import {Globalvar} from "../../constants/globalvar";

@Injectable()
export class StatisticsService {

    constructor(private $http:Http) { }

    getStudiesStoredCounts(){
        let params = Globalvar.STUDIESSTOREDCOUNTS_PARAMETERS;
        return this.$http.get(`${Globalvar.ELASTICSEARCHDOMAIN}/_search?source=`+JSON.stringify(params))
            .map(res => {
                let resjson;
                try{
                    let pattern = new RegExp("[^:]*:\/\/[^\/]*\/auth\/");
                    if(pattern.exec(res.url)){
                        WindowRefService.nativeWindow.location = "/dcm4chee-arc/ui2/";
                    }
                    resjson = res.json();
                }catch (e){
                    resjson = [];
                }
                return resjson;
            });
    }
    getRetrievCounts(){
        let params = Globalvar.RETRIEVCOUNTS_PARAMETERS;
        return this.$http.get(`${Globalvar.ELASTICSEARCHDOMAIN}/_search?source=`+JSON.stringify(params))
            .map(res => {
                let resjson;
                try{
                    let pattern = new RegExp("[^:]*:\/\/[^\/]*\/auth\/");
                    if(pattern.exec(res.url)){
                        WindowRefService.nativeWindow.location = "/dcm4chee-arc/ui2/";
                    }
                    resjson = res.json();
                }catch (e){
                    resjson = [];
                }
                return resjson;
            });
    }
    getErrorCounts(){
        let params = Globalvar.ERRORSCOUNTS_PARAMETERS;
        return this.$http.get(`${Globalvar.ELASTICSEARCHDOMAIN}/_search?source=`+JSON.stringify(params))
            .map(res => {
                let resjson;
                try{
                    let pattern = new RegExp("[^:]*:\/\/[^\/]*\/auth\/");
                    if(pattern.exec(res.url)){
                        WindowRefService.nativeWindow.location = "/dcm4chee-arc/ui2/";
                    }
                    resjson = res.json();
                }catch (e){
                    resjson = [];
                }
                return resjson;
            });
    }
    getQueriesCounts(){
        let params = Globalvar.QUERIESCOUNTS_PARAMETERS;
        return this.$http.get(`${Globalvar.ELASTICSEARCHDOMAIN}/_search?source=`+JSON.stringify(params))
            .map(res => {
                let resjson;
                try{
                    let pattern = new RegExp("[^:]*:\/\/[^\/]*\/auth\/");
                    if(pattern.exec(res.url)){
                        WindowRefService.nativeWindow.location = "/dcm4chee-arc/ui2/";
                    }
                    resjson = res.json();
                }catch (e){
                    resjson = [];
                }
                return resjson;
            });
    }
    getAuditEvents(){
        let params = Globalvar.AUDITEVENTS_PARAMETERS;
        return this.$http.get(`${Globalvar.ELASTICSEARCHDOMAIN}/_search?source=`+JSON.stringify(params))
           .map(res => {
               let resjson;
               try{
                   let pattern = new RegExp("[^:]*:\/\/[^\/]*\/auth\/");
                   if(pattern.exec(res.url)){
                       WindowRefService.nativeWindow.location = "/dcm4chee-arc/ui2/";
                   }
                   resjson = res.json();
               }catch (e){
                   resjson = [];
               }
               return resjson;
           });
    }
}
