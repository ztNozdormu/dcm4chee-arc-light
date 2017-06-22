import { Injectable } from '@angular/core';
import {Http, RequestOptions} from "@angular/http";
import {WindowRefService} from "../../helpers/window-ref.service";

@Injectable()
export class StatisticsService {

  constructor(private $http:Http) { }
    getAuditEvents(){
        let params = {
            "query": {
                "bool": {
                    "must": [
                        {
                            "query_string": {
                                "query": "*",
                                "analyze_wildcard": true
                            }
                        },
                        {
                            "query_string": {
                                "analyze_wildcard": true,
                                "query": "*"
                            }
                        },
                        {
                            "range": {
                                "Event.EventDateTime": {
                                    "gte": 1466496969107,
                                    "lte": 1498032969107,
                                    "format": "epoch_millis"
                                }
                            }
                        }
                    ],
                    "must_not": []
                }
            },
            "size": 5,
            "sort": [
                {
                    "Event.EventDateTime": {
                        "order": "desc",
                        "unmapped_type": "boolean"
                    }
                }
            ],
            "_source": {
                "excludes": []
            },
            "stored_fields": [
                "*"
            ],
            "script_fields": {},
            "docvalue_fields": [
                "audit.EventIdentification.EventDateTime",
                "Event.EventDateTime",
                "StudyDate",
                "@timestamp",
                "syslog_timestamp"
            ]
        };
        let requestOptions = new RequestOptions();
        requestOptions.body = params;
       return this.$http.get("http://sepp.j4care.com:9200/_search",params)
           .map(res => {let resjson; try{ let pattern = new RegExp("[^:]*:\/\/[^\/]*\/auth\/"); if(pattern.exec(res.url)){ WindowRefService.nativeWindow.location = "/dcm4chee-arc/ui2/";} resjson = res.json(); }catch (e){ resjson = [];} return resjson;});
    }
}
