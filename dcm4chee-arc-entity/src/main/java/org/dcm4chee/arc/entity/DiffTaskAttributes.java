/*
 * **** BEGIN LICENSE BLOCK *****
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
 * **** END LICENSE BLOCK *****
 *
 */

package org.dcm4chee.arc.entity;

import org.dcm4che3.data.Attributes;

import javax.persistence.*;

/**
 * @author Gunter Zeilinger <gunterze@gmail.com>
 * @since Mar 2018
 */
@Entity
@Table(name = "diff_task_attrs")
@NamedQueries({
        @NamedQuery(name = DiffTaskAttributes.FIND_BY_DIFF_TASK,
                query = "select o.attributesBlob from DiffTaskAttributes o " +
                        "where o.diffTask=?1")
})
public class DiffTaskAttributes {

    public static final String FIND_BY_DIFF_TASK = "DiffTaskAttributes.findByDiffTask";

    @Id
    @Column(name="dicomattrs_fk")
    private Long pk;

    @MapsId
    @OneToOne(cascade=CascadeType.ALL, orphanRemoval = true, optional = false)
    @JoinColumn(name = "dicomattrs_fk")
    private AttributesBlob attributesBlob;

    @ManyToOne(optional = false)
    @JoinColumn(name = "diff_task_fk")
    private DiffTask diffTask;

    public Attributes getAttributes() throws BlobCorruptedException {
        return attributesBlob.getAttributes();
    }

    public void setAttributes(Attributes attrs) {
        attributesBlob = new AttributesBlob(attrs);
    }

    public DiffTask getDiffTask() {
        return diffTask;
    }

    public void setDiffTask(DiffTask diffTask) {
        this.diffTask = diffTask;
    }
}
