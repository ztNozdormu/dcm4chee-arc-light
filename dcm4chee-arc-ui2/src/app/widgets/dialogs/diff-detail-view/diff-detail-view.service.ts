import { Injectable } from '@angular/core';
import {Http} from "@angular/http";
import {Globalvar} from "../../../constants/globalvar";
import {WindowRefService} from "../../../helpers/window-ref.service";

@Injectable()
export class DiffDetailViewService {

  constructor(
     private $http:Http
  ) { }

  exportStudyExternal(aet,externalAET,StudyInstanceUID,destinationAET){
    return this.$http
        .post(
            Globalvar.EXPORT_STUDY_EXTERNAL_URL(aet,externalAET,StudyInstanceUID,destinationAET),
            {}
        )
        .map(res => {
            let resjson;
            try {
                let pattern = new RegExp("[^:]*:\/\/[^\/]*\/auth\/");
                if(pattern.exec(res.url)){
                    WindowRefService.nativeWindow.location = "/dcm4chee-arc/ui2/";
                }
                resjson = res.json();
            } catch (e) {
                resjson = {};
            }
            return resjson;
        });
  }
}
