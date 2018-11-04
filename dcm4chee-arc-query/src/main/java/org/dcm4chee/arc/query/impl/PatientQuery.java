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
 * Portions created by the Initial Developer are Copyright (C) 2015
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

package org.dcm4chee.arc.query.impl;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.Expression;
import com.querydsl.jpa.hibernate.HibernateQuery;
import org.dcm4che3.data.Attributes;
import org.dcm4che3.data.Tag;
import org.dcm4che3.data.VR;
import org.dcm4che3.dict.archive.ArchiveTag;
import org.dcm4chee.arc.entity.AttributesBlob;
import org.dcm4chee.arc.entity.Patient;
import org.dcm4chee.arc.entity.QPatient;
import org.dcm4chee.arc.query.QueryContext;
import org.dcm4chee.arc.query.util.QueryBuilder;
import org.hibernate.StatelessSession;

import java.util.Date;

/**
 * @author Gunter Zeilinger <gunterze@gmail.com>
 * @since Aug 2015
 */
class PatientQuery extends AbstractQuery {

    private static final Expression<?>[] SELECT = {
            QPatient.patient.pk,
            QPatient.patient.numberOfStudies,
            QPatient.patient.createdTime,
            QPatient.patient.updatedTime,
            QPatient.patient.verificationTime,
            QPatient.patient.verificationStatus,
            QPatient.patient.failedVerifications,
            QueryBuilder.patientAttributesBlob.encodedAttributes
    };

    public PatientQuery(QueryContext context, StatelessSession session) {
        super(context, session);
    }

    @Override
    protected HibernateQuery<Tuple> newHibernateQuery(boolean forCount) {
        HibernateQuery<Tuple> q = new HibernateQuery<Void>(session).select(SELECT).from(QPatient.patient);
        return newHibernateQuery(q, forCount);
    }

    @Override
    public long fetchCount() {
        HibernateQuery<Void> q = new HibernateQuery<Void>(session).from(QPatient.patient);
        return newHibernateQuery(q, true).fetchCount();
    }

    private <T> HibernateQuery<T> newHibernateQuery(HibernateQuery<T> q, boolean forCount) {
        q = QueryBuilder.applyPatientLevelJoins(q,
                context.getPatientIDs(),
                context.getQueryKeys(),
                context.getQueryParam(),
                context.isOrderByPatientName(),
                forCount);
        BooleanBuilder predicates = new BooleanBuilder(QPatient.patient.mergedWith.isNull());
        if (!context.getQueryParam().isWithoutStudies())
            predicates.and(QPatient.patient.numberOfStudies.gt(0));
        QueryBuilder.addPatientLevelPredicates(predicates,
                context.getPatientIDs(),
                context.getQueryKeys(),
                context.getQueryParam());

        return q.where(predicates);
    }

    @Override
    protected Attributes toAttributes(Tuple results) {
        Attributes patAttrs = AttributesBlob.decodeAttributes(
                results.get(QueryBuilder.patientAttributesBlob.encodedAttributes), null);
        addPatientQRAttrs(context, results, patAttrs);
        return patAttrs;
    }

    static void addPatientQRAttrs(QueryContext context, Tuple results, Attributes attrs) {
        attrs.setInt(Tag.NumberOfPatientRelatedStudies, VR.IS,
                results.get(QPatient.patient.numberOfStudies));
        if (context.getReturnKeys() != null)
            return;

        attrs.setDate(ArchiveTag.PrivateCreator, ArchiveTag.PatientCreateDateTime, VR.DT,
                results.get(QPatient.patient.createdTime));
        attrs.setDate(ArchiveTag.PrivateCreator, ArchiveTag.PatientUpdateDateTime, VR.DT,
                results.get(QPatient.patient.updatedTime));
        Date verificationTime = results.get(QPatient.patient.verificationTime);
        if (verificationTime != null) {
            attrs.setDate(ArchiveTag.PrivateCreator, ArchiveTag.PatientVerificationDateTime, VR.DT,
                    verificationTime);
        }
        Patient.VerificationStatus verificationStatus = results.get(QPatient.patient.verificationStatus);
        if (verificationStatus != Patient.VerificationStatus.UNVERIFIED || verificationTime != null) {
            attrs.setString(ArchiveTag.PrivateCreator, ArchiveTag.PatientVerificationStatus, VR.CS,
                    verificationStatus.name());
        }
        int failures = results.get(QPatient.patient.failedVerifications);
        if (failures > 0) {
            attrs.setInt(ArchiveTag.PrivateCreator, ArchiveTag.FailedVerificationsOfPatient, VR.US, failures);
        }
    }

    @Override
    public boolean isOptionalKeysNotSupported() {
        //TODO
        return false;
    }
}
