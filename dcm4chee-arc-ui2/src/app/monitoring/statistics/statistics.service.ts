import { Injectable } from '@angular/core';
import {Http, RequestOptions, RequestMethod, Request} from "@angular/http";
import {WindowRefService} from "../../helpers/window-ref.service";

@Injectable()
export class StatisticsService {

    constructor(private $http:Http) { }

    getStudiesStoredCounts(){
        let params = {
            "size": 0,
            "aggs": {
                "1": {
                    "cardinality": {
                        "field": "Study.ParticipantObjectID"
                    }
                }
            },
            "highlight": {
                "fields": {
                    "*": {}
                },
                "require_field_match": false,
                "fragment_size": 2147483647
            },
            "query": {
                "bool": {
                    "must": [
                        {
                            "query_string": {
                                "query": "EventID.csd-code:110104 AND Event.EventActionCode:C",
                                "analyze_wildcard": true
                            }
                        },
                        {
                            "query_string": {
                                "analyze_wildcard": true,
                                "query": "*"
                            }
                        }
/*                        ,
                        {
                            "range": {
                                "Event.EventDateTime": {
                                    "gte": 1466496969111,
                                    "lte": 1498032969111,
                                    "format": "epoch_millis"
                                }
                            }
                        }*/
                    ],
                    "must_not": []
                }
            },
            "_source": {
                "excludes": []
            }
        };
        return this.$http.get("http://localhost:9200/_search?source="+JSON.stringify(params))
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
                                    "lte": 1498133118583,
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
       return this.$http.get("http://localhost:9200/_search?source="+JSON.stringify(params))
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
