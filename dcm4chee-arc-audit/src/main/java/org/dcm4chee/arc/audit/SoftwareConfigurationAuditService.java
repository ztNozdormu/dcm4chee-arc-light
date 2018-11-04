/*
 * *** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is part of dcm4che, an implementation of DICOM(TM) in
 * Java(TM), hosted at https://github.com/dcm4che.
 *
 * The Initial Developer of the Original Code is
 * J4Care.
 * Portions created by the Initial Developer are Copyright (C) 2015-2018
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 * See @authors listed below
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * *** END LICENSE BLOCK *****
 */
package org.dcm4chee.arc.audit;

import org.dcm4che3.audit.*;
import org.dcm4che3.net.audit.AuditLogger;
import org.dcm4chee.arc.event.SoftwareConfiguration;
import org.dcm4chee.arc.keycloak.KeycloakContext;

import javax.servlet.http.HttpServletRequest;
import java.util.Calendar;
import java.util.stream.Collectors;

/**
 * @author Vrinda Nayak <vrinda.nayak@j4care.com>
 * @since Oct 2018
 */
class SoftwareConfigurationAuditService {

    static AuditInfoBuilder auditInfo(SoftwareConfiguration softwareConfiguration) {
        HttpServletRequest request = softwareConfiguration.getRequest();
        return request != null
                ? buildSoftwareConfAuditForWeb(request)
                : new AuditInfoBuilder.Builder().calledUserID(softwareConfiguration.getDeviceName()).build();
    }

    private static AuditInfoBuilder buildSoftwareConfAuditForWeb(HttpServletRequest request) {
        return new AuditInfoBuilder.Builder()
                .callingUserID(KeycloakContext.valueOf(request).getUserName())
                .callingHost(request.getRemoteAddr())
                .calledUserID(request.getRequestURI())
                .build();
    }

    static AuditMessage auditMsg(AuditLogger auditLogger, SpoolFileReader reader,
                                 AuditUtils.EventType eventType, Calendar eventTime) {
        AuditInfo auditInfo = new AuditInfo(reader.getMainInfo());

        return AuditMessages.createMessage(
                eventIdentification(eventType, eventTime),
                activeParticipants(auditLogger, auditInfo),
                poiLDAPDiff(reader, auditInfo));
    }

    private static EventIdentificationBuilder eventIdentification(
            AuditUtils.EventType eventType, Calendar eventTime) {
        return new EventIdentificationBuilder.Builder(eventType.eventID, eventType.eventActionCode, eventTime,
                AuditMessages.EventOutcomeIndicator.Success)
                .eventTypeCode(eventType.eventTypeCode).build();
    }

    private static ActiveParticipantBuilder[] activeParticipants(AuditLogger auditLogger, AuditInfo auditInfo) {
        ActiveParticipantBuilder[] activeParticipantBuilders = new ActiveParticipantBuilder[2];
        String callingUserID = auditInfo.getField(AuditInfo.CALLING_USERID);
        String calledUserID = auditInfo.getField(AuditInfo.CALLED_USERID);
        if (callingUserID != null) {
            activeParticipantBuilders[0] = new ActiveParticipantBuilder.Builder(calledUserID, getLocalHostName(auditLogger))
                    .userIDTypeCode(AuditMessages.UserIDTypeCode.URI).build();
            activeParticipantBuilders[1]
                    = new ActiveParticipantBuilder.Builder(callingUserID, auditInfo.getField(AuditInfo.CALLING_HOST))
                    .userIDTypeCode(AuditMessages.userIDTypeCode(callingUserID))
                    .isRequester().build();
        } else
            activeParticipantBuilders[0] = new ActiveParticipantBuilder.Builder(calledUserID, getLocalHostName(auditLogger))
                    .userIDTypeCode(AuditMessages.UserIDTypeCode.DeviceName)
                    .isRequester().build();
        return activeParticipantBuilders;
    }

    private static ParticipantObjectIdentificationBuilder poiLDAPDiff(SpoolFileReader reader, AuditInfo auditInfo) {
        return new ParticipantObjectIdentificationBuilder.Builder(
                    auditInfo.getField(AuditInfo.CALLED_USERID),
                    AuditMessages.ParticipantObjectIDTypeCode.DeviceName,
                    AuditMessages.ParticipantObjectTypeCode.SystemObject,
                    null)
                    .detail(AuditMessages.createParticipantObjectDetail("Alert Description",
                            !reader.getInstanceLines().isEmpty()
                                    ? reader.getInstanceLines().stream().collect(Collectors.joining("\n"))
                                    : null))
                    .build();
    }

    private static String getLocalHostName(AuditLogger auditLogger) {
        return auditLogger.getConnections().get(0).getHostname();
    }

}
