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

import com.mysema.commons.lang.CloseableIterator;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.Expression;
import com.querydsl.jpa.hibernate.HibernateQuery;
import org.dcm4che3.data.Attributes;
import org.dcm4che3.data.Tag;
import org.dcm4che3.data.VR;
import org.dcm4che3.dict.archive.ArchiveTag;
import org.dcm4che3.net.service.QueryRetrieveLevel2;
import org.dcm4che3.util.StringUtils;
import org.dcm4chee.arc.conf.Availability;
import org.dcm4chee.arc.entity.*;
import org.dcm4chee.arc.query.QueryContext;
import org.dcm4chee.arc.query.util.QueryBuilder;
import org.dcm4chee.arc.query.util.QueryParam;
import org.hibernate.StatelessSession;

import java.util.Iterator;


/**
 * @author Gunter Zeilinger <gunterze@gmail.com>
 * @author Vrinda Nayak <vrinda.nayak@j4care.com>
 * @since Aug 2015
 */
class StudyQuery extends AbstractQuery {

    static final Expression<?>[] SELECT = {
            QStudy.study.pk,
            QPatient.patient.numberOfStudies,
            QPatient.patient.createdTime,
            QPatient.patient.updatedTime,
            QPatient.patient.verificationTime,
            QPatient.patient.verificationStatus,
            QPatient.patient.failedVerifications,
            QStudy.study.createdTime,
            QStudy.study.updatedTime,
            QStudy.study.accessTime,
            QStudy.study.expirationDate,
            QStudy.study.rejectionState,
            QStudy.study.completeness,
            QStudy.study.failedRetrieves,
            QStudy.study.accessControlID,
            QStudy.study.storageIDs,
            QStudy.study.externalRetrieveAET,
            QStudy.study.size,
            QStudyQueryAttributes.studyQueryAttributes.numberOfInstances,
            QStudyQueryAttributes.studyQueryAttributes.numberOfSeries,
            QStudyQueryAttributes.studyQueryAttributes.modalitiesInStudy,
            QStudyQueryAttributes.studyQueryAttributes.sopClassesInStudy,
            QStudyQueryAttributes.studyQueryAttributes.retrieveAETs,
            QStudyQueryAttributes.studyQueryAttributes.availability,
            QueryBuilder.studyAttributesBlob.encodedAttributes,
            QueryBuilder.patientAttributesBlob.encodedAttributes
    };

    public StudyQuery(QueryContext context, StatelessSession session) {
        super(context, session);
    }

    @Override
    protected HibernateQuery<Tuple> newHibernateQuery(boolean forCount) {
        HibernateQuery<Tuple> q = new HibernateQuery<Void>(session).select(SELECT).from(QStudy.study);
        return newHibernateQuery(q, forCount, new BooleanBuilder());
    }

    @Override
    public long fetchCount() {
        HibernateQuery<Void> q = new HibernateQuery<Void>(session).from(QStudy.study);
        return newHibernateQuery(q, true, new BooleanBuilder()).fetchCount();
    }

    private <T> HibernateQuery<T> newHibernateQuery(HibernateQuery<T> q, boolean forCount, BooleanBuilder predicates) {
        boolean hasPatientLevelPredicates = !forCount
                || QueryBuilder.hasPatientLevelPredicates(
                        context.getPatientIDs(),
                        context.getQueryKeys(),
                        context.getQueryParam());
        q = QueryBuilder.applyStudyLevelJoins(q,
                context.getQueryKeys(),
                context.getQueryParam(),
                forCount, hasPatientLevelPredicates);
        if (hasPatientLevelPredicates) {
            q = QueryBuilder.applyPatientLevelJoins(q,
                    context.getPatientIDs(),
                    context.getQueryKeys(),
                    context.getQueryParam(),
                    context.isOrderByPatientName(),
                    forCount);
            QueryBuilder.addPatientLevelPredicates(predicates,
                    context.getPatientIDs(),
                    context.getQueryKeys(),
                    context.getQueryParam());
        }
        QueryBuilder.addStudyLevelPredicates(predicates,
                context.getQueryKeys(),
                context.getQueryParam(), QueryRetrieveLevel2.STUDY);
        return q.where(predicates);
    }

    @Override
    public long fetchSize() {
        HibernateQuery<Tuple> q = new HibernateQuery<Void>(session)
                .select(new Expression[]{QStudy.study.size.sum()}).from(QStudy.study);
        Long size = newHibernateQuery(q, true, new BooleanBuilder()).fetchOne().get(0, Long.class);
        return size != null ? size.longValue() : 0L;
    }

    public Iterator<Long> withUnknownSize(int fetchSize) {
        HibernateQuery<Tuple> q = new HibernateQuery<Void>(session)
                .select(new Expression[]{QStudy.study.pk}).from(QStudy.study);
        q = newHibernateQuery(q, true, new BooleanBuilder(QStudy.study.size.eq(-1L)));
        q.setFetchSize(fetchSize);
        final CloseableIterator<Tuple> iterate = q.iterate();
        return new Iterator<Long>() {
            @Override
            public boolean hasNext() {
                return iterate.hasNext();
            }

            @Override
            public Long next() {
                return iterate.next().get(QStudy.study.pk);
            }
        };
    }

    @Override
    protected Attributes toAttributes(Tuple results) {
        Long studyPk = results.get(QStudy.study.pk);
        long studySize = results.get(QStudy.study.size);
        if (studySize < 0)
            studySize = context.getQueryService().calculateStudySize(studyPk);
        Integer numberOfInstancesI = results.get(QStudyQueryAttributes.studyQueryAttributes.numberOfInstances);
        int numberOfStudyRelatedInstances;
        int numberOfStudyRelatedSeries;
        String modalitiesInStudy;
        String sopClassesInStudy;
        String retrieveAETs;
        Availability availability;
        QueryParam queryParam = context.getQueryParam();
        if (numberOfInstancesI != null) {
            numberOfStudyRelatedInstances = numberOfInstancesI;
            if (numberOfStudyRelatedInstances == 0 && !queryParam.isReturnEmpty()) {
                return null;
            }
            numberOfStudyRelatedSeries = results.get(QStudyQueryAttributes.studyQueryAttributes.numberOfSeries);
            modalitiesInStudy = results.get(QStudyQueryAttributes.studyQueryAttributes.modalitiesInStudy);
            sopClassesInStudy = results.get(QStudyQueryAttributes.studyQueryAttributes.sopClassesInStudy);
            retrieveAETs = results.get(QStudyQueryAttributes.studyQueryAttributes.retrieveAETs);
            availability = results.get(QStudyQueryAttributes.studyQueryAttributes.availability);
        } else {
            StudyQueryAttributes studyView = context.getQueryService()
                    .calculateStudyQueryAttributes(studyPk, queryParam.getQueryRetrieveView());
            numberOfStudyRelatedInstances = studyView.getNumberOfInstances();
            if (numberOfStudyRelatedInstances == 0 && !queryParam.isReturnEmpty()) {
                return null;
            }
            numberOfStudyRelatedSeries = studyView.getNumberOfSeries();
            modalitiesInStudy = studyView.getModalitiesInStudy();
            sopClassesInStudy = studyView.getSOPClassesInStudy();
            retrieveAETs = studyView.getRetrieveAETs();
            availability = studyView.getAvailability();
        }
        Attributes studyAttrs = AttributesBlob.decodeAttributes(
                results.get(QueryBuilder.studyAttributesBlob.encodedAttributes), null);
        Attributes patAttrs = AttributesBlob.decodeAttributes(
                results.get(QueryBuilder.patientAttributesBlob.encodedAttributes), null);
        Attributes.unifyCharacterSets(patAttrs, studyAttrs);
        Attributes attrs = new Attributes(patAttrs.size() + studyAttrs.size() + 20);
        attrs.addAll(patAttrs);
        attrs.addAll(studyAttrs);
        PatientQuery.addPatientQRAttrs(context, results, attrs);
        String externalRetrieveAET = results.get(QStudy.study.externalRetrieveAET);
        attrs.setString(Tag.RetrieveAETitle, VR.AE, splitAndAppend(retrieveAETs, externalRetrieveAET));
        attrs.setString(Tag.InstanceAvailability, VR.CS,
                StringUtils.maskNull(availability, Availability.UNAVAILABLE).toString());
        StudyQuery.addStudyQRAddrs(context, results, studySize, numberOfStudyRelatedInstances, numberOfStudyRelatedSeries,
                modalitiesInStudy, sopClassesInStudy, attrs);
        return attrs;
    }

    static void addStudyQRAddrs(QueryContext context, Tuple results, long studySize, int numberOfStudyRelatedInstances,
                                int numberOfStudyRelatedSeries, String modalitiesInStudy,
                                String sopClassesInStudy, Attributes attrs) {
        attrs.setString(Tag.ModalitiesInStudy, VR.CS, StringUtils.split(modalitiesInStudy, '\\'));
        attrs.setString(Tag.SOPClassesInStudy, VR.UI, StringUtils.split(sopClassesInStudy, '\\'));
        attrs.setInt(Tag.NumberOfStudyRelatedSeries, VR.IS, numberOfStudyRelatedSeries);
        attrs.setInt(Tag.NumberOfStudyRelatedInstances, VR.IS, numberOfStudyRelatedInstances);
        if (context.getReturnKeys() != null)
            return;

        attrs.setDate(ArchiveTag.PrivateCreator, ArchiveTag.StudyReceiveDateTime, VR.DT,
                results.get(QStudy.study.createdTime));
        attrs.setDate(ArchiveTag.PrivateCreator, ArchiveTag.StudyUpdateDateTime, VR.DT,
                results.get(QStudy.study.updatedTime));
        attrs.setDate(ArchiveTag.PrivateCreator, ArchiveTag.StudyAccessDateTime, VR.DT,
                results.get(QStudy.study.accessTime));
        if (results.get(QStudy.study.expirationDate) != null)
            attrs.setString(ArchiveTag.PrivateCreator, ArchiveTag.StudyExpirationDate, VR.DA,
                    results.get(QStudy.study.expirationDate));
        attrs.setString(ArchiveTag.PrivateCreator, ArchiveTag.StudyRejectionState, VR.CS,
                results.get(QStudy.study.rejectionState).toString());
        attrs.setString(ArchiveTag.PrivateCreator, ArchiveTag.StudyCompleteness, VR.CS,
                results.get(QStudy.study.completeness).toString());
        if (results.get(QStudy.study.failedRetrieves) != 0)
            attrs.setInt(ArchiveTag.PrivateCreator, ArchiveTag.FailedRetrievesOfStudy, VR.US,
                    results.get(QStudy.study.failedRetrieves));
        if (!results.get(QStudy.study.accessControlID).equals("*"))
            attrs.setString(ArchiveTag.PrivateCreator, ArchiveTag.StudyAccessControlID, VR.LO,
                    results.get(QStudy.study.accessControlID));
        attrs.setString(ArchiveTag.PrivateCreator, ArchiveTag.StorageIDsOfStudy, VR.LO,
                StringUtils.split(results.get(QStudy.study.storageIDs), '\\'));
        attrs.setInt(ArchiveTag.PrivateCreator, ArchiveTag.StudySizeInKB, VR.UL, (int) (studySize / 1000));
        attrs.setInt(ArchiveTag.PrivateCreator, ArchiveTag.StudySizeBytes, VR.US, (int) (studySize % 1000));
    }

    @Override
    public boolean isOptionalKeysNotSupported() {
        //TODO
        return false;
    }
}
