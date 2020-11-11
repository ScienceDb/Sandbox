import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import Snackbar from '../../../../../../snackbar/Snackbar';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import StudyAttributesPage from './components/study-attributes-page/StudyAttributesPage'
import StudyAssociationsPage from './components/study-associations-page/StudyAssociationsPage'
import StudyTabsA from './components/StudyTabsA'
import StudyConfirmationDialog from './components/StudyConfirmationDialog'
import AssayDetailPanel from '../../../assay-table/components/assay-detail-panel/AssayDetailPanel'
import ContactDetailPanel from '../../../contact-table/components/contact-detail-panel/ContactDetailPanel'
import FactorDetailPanel from '../../../factor-table/components/factor-detail-panel/FactorDetailPanel'
import FileAttachmentDetailPanel from '../../../fileAttachment-table/components/fileAttachment-detail-panel/FileAttachmentDetailPanel'
import InvestigationDetailPanel from '../../../investigation-table/components/investigation-detail-panel/InvestigationDetailPanel'
import MaterialDetailPanel from '../../../material-table/components/material-detail-panel/MaterialDetailPanel'
import OntologyAnnotationDetailPanel from '../../../ontologyAnnotation-table/components/ontologyAnnotation-detail-panel/OntologyAnnotationDetailPanel'
import ProtocolDetailPanel from '../../../protocol-table/components/protocol-detail-panel/ProtocolDetailPanel'
import api from '../../../../../../../requests/requests.index.js'
import { makeCancelable } from '../../../../../../../utils'
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import Collapse from '@material-ui/core/Collapse';
import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import SaveIcon from '@material-ui/icons/Save';
import DeletedWarning from '@material-ui/icons/DeleteForeverOutlined';
import UpdateWarning from '@material-ui/icons/ErrorOutline';
import { amber, red } from '@material-ui/core/colors';

const debounceTimeout = 700;
const appBarHeight = 64;

const useStyles = makeStyles(theme => ({
  root: {
    minWidth: 450,
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  warningCard: {
    width: '100%',
    minHeight: 130,
  },
  tabsA: {
    backgroundColor: "#ffffff",
  },
  fabButton: {
    position: 'absolute',
    zIndex: 1,
    bottom: -26+3,
    right: 10,
    margin: '0 auto',
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function StudyUpdatePanel(props) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const {
    permissions,
 
    item,
    handleClose,
  } = props;
  
  const [open, setOpen] = useState(true);
  const [tabsValue, setTabsValue] = useState(0);
  const [valueOkStates, setValueOkStates] = useState(getInitialValueOkStates());
  const [valueAjvStates, setValueAjvStates] = useState(getInitialValueAjvStates());
  const lastFetchTime = useRef(Date.now());
  const [foreignKeys, setForeignKeys] = useState(getInitialForeignKeys());

  const [updated, setUpdated] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationTitle, setConfirmationTitle] = useState('');
  const [confirmationText, setConfirmationText] = useState('');
  const [confirmationAcceptText, setConfirmationAcceptText] = useState('');
  const [confirmationRejectText, setConfirmationRejectText] = useState('');

  const handleAccept = useRef(undefined);
  const handleReject = useRef(undefined);

  const values = useRef(getInitialValues());
  const valuesOkRefs = useRef(getInitialValueOkStates());
  const valuesAjvRefs = useRef(getInitialValueAjvStates());
  const changedAssociations = useRef({});
  
  const [assaysIdsToAddState, setAssaysIdsToAddState] = useState([]);
  const assaysIdsToAdd = useRef([]);
  const [assaysIdsToRemoveState, setAssaysIdsToRemoveState] = useState([]);
  const assaysIdsToRemove = useRef([]);
  const [contactsIdsToAddState, setContactsIdsToAddState] = useState([]);
  const contactsIdsToAdd = useRef([]);
  const [contactsIdsToRemoveState, setContactsIdsToRemoveState] = useState([]);
  const contactsIdsToRemove = useRef([]);
  const [factorsIdsToAddState, setFactorsIdsToAddState] = useState([]);
  const factorsIdsToAdd = useRef([]);
  const [factorsIdsToRemoveState, setFactorsIdsToRemoveState] = useState([]);
  const factorsIdsToRemove = useRef([]);
  const [fileAttachmentsIdsToAddState, setFileAttachmentsIdsToAddState] = useState([]);
  const fileAttachmentsIdsToAdd = useRef([]);
  const [fileAttachmentsIdsToRemoveState, setFileAttachmentsIdsToRemoveState] = useState([]);
  const fileAttachmentsIdsToRemove = useRef([]);
  const [investigationIdsToAddState, setInvestigationIdsToAddState] = useState([]);
  const investigationIdsToAdd = useRef([]);
  const [investigationIdsToRemoveState, setInvestigationIdsToRemoveState] = useState([]);
  const investigationIdsToRemove = useRef([]);
  const [materialsIdsToAddState, setMaterialsIdsToAddState] = useState([]);
  const materialsIdsToAdd = useRef([]);
  const [materialsIdsToRemoveState, setMaterialsIdsToRemoveState] = useState([]);
  const materialsIdsToRemove = useRef([]);
  const [ontologyAnnotationsIdsToAddState, setOntologyAnnotationsIdsToAddState] = useState([]);
  const ontologyAnnotationsIdsToAdd = useRef([]);
  const [ontologyAnnotationsIdsToRemoveState, setOntologyAnnotationsIdsToRemoveState] = useState([]);
  const ontologyAnnotationsIdsToRemove = useRef([]);
  const [protocolsIdsToAddState, setProtocolsIdsToAddState] = useState([]);
  const protocolsIdsToAdd = useRef([]);
  const [protocolsIdsToRemoveState, setProtocolsIdsToRemoveState] = useState([]);
  const protocolsIdsToRemove = useRef([]);

  const [assayDetailDialogOpen, setAssayDetailDialogOpen] = useState(false);
  const [assayDetailItem, setAssayDetailItem] = useState(undefined);
  const [contactDetailDialogOpen, setContactDetailDialogOpen] = useState(false);
  const [contactDetailItem, setContactDetailItem] = useState(undefined);
  const [factorDetailDialogOpen, setFactorDetailDialogOpen] = useState(false);
  const [factorDetailItem, setFactorDetailItem] = useState(undefined);
  const [fileAttachmentDetailDialogOpen, setFileAttachmentDetailDialogOpen] = useState(false);
  const [fileAttachmentDetailItem, setFileAttachmentDetailItem] = useState(undefined);
  const [investigationDetailDialogOpen, setInvestigationDetailDialogOpen] = useState(false);
  const [investigationDetailItem, setInvestigationDetailItem] = useState(undefined);
  const [materialDetailDialogOpen, setMaterialDetailDialogOpen] = useState(false);
  const [materialDetailItem, setMaterialDetailItem] = useState(undefined);
  const [ontologyAnnotationDetailDialogOpen, setOntologyAnnotationDetailDialogOpen] = useState(false);
  const [ontologyAnnotationDetailItem, setOntologyAnnotationDetailItem] = useState(undefined);
  const [protocolDetailDialogOpen, setProtocolDetailDialogOpen] = useState(false);
  const [protocolDetailItem, setProtocolDetailItem] = useState(undefined);

  //debouncing & event contention
  const cancelablePromises = useRef([]);
  const isSaving = useRef(false);
  const isCanceling = useRef(false);
  const isClosing = useRef(false);
  const isDebouncingTabsChange = useRef(false);
  const currentTabValue = useRef(tabsValue);
  const lastTabValue = useRef(tabsValue);

  const graphqlServerUrl = useSelector(state => state.urls.graphqlServerUrl)
  const lastModelChanged = useSelector(state => state.changes.lastModelChanged);
  const lastChangeTimestamp = useSelector(state => state.changes.lastChangeTimestamp);

  //snackbar
  const variant = useRef('info');
  const errors = useRef([]);
  const content = useRef((key, message) => (
    <Snackbar id={key} message={message} errors={errors.current}
    variant={variant.current} />
  ));
  const actionText = useRef(t('modelPanels.gotIt', "Got it"));
  const action = useRef((key) => (
    <>
      <Button color='inherit' variant='text' size='small' 
      onClick={() => { closeSnackbar(key) }}>
        {actionText.current}
      </Button>
    </> 
  ));

   /**
    * Callbacks:
    *  showMessage
    */

   /**
    * showMessage
    * 
    * Show the given message in a notistack snackbar.
    * 
    */
   const showMessage = useCallback((message, withDetail) => {
    enqueueSnackbar( message, {
      variant: variant.current,
      preventDuplicate: false,
      persist: true,
      action: !withDetail ? action.current : undefined,
      content: withDetail ? content.current : undefined,
    });
  },[enqueueSnackbar]);

  /**
   * Effects
   */

  useEffect(() => {

    //cleanup on unmounted.
    return function cleanup() {
      cancelablePromises.current.forEach(p => p.cancel());
      cancelablePromises.current = [];
    };
  }, []);

  useEffect(() => {
    /*
     * Handle changes 
     */
    
    /*
     * Checks
     */
    if(!lastModelChanged) {
      return;
    }
    if(!lastChangeTimestamp || !lastFetchTime.current) {
      return;
    }
    let isNewChange = (lastFetchTime.current<lastChangeTimestamp);
    if(!isNewChange) {
      return;
    }

    /*
     * Update timestamps
     */
    lastFetchTime.current = Date.now();
    
    /*
     * Case 1: 
     * This item was updated, either in his attributes or in his associations, or was deleted.
     * 
     * Conditions:
     * A: the item was modified.
     * B: the item was deleted.
     * 
     * Actions:
     * if A:
     * - set 'updated' alert
     * - return
     * 
     * if B:
     * - set 'deleted' alert
     * - return
     */

    //check if this.item changed
    if(lastModelChanged&&
      lastModelChanged.study&&
      lastModelChanged.study[String(item.study_id)]) {

        //updated item
        if(lastModelChanged.study[String(item.study_id)].op === "update"&&
            lastModelChanged.study[String(item.study_id)].newItem) {
              //show alert
              setUpdated(true);
        } else {
          //deleted item
          if(lastModelChanged.study[String(item.study_id)].op === "delete") {
              //show alert
              setDeleted(true);
          }
        }
    }//end: Case 1
  }, [lastModelChanged, lastChangeTimestamp, item.study_id]);

  useEffect(() => {
    if(deleted&&updated) {
      setUpdated(false);
    }
  }, [deleted, updated]);

  useEffect(() => {
    if (assayDetailItem !== undefined) {
      setAssayDetailDialogOpen(true);
    }
  }, [assayDetailItem]);
  useEffect(() => {
    if (contactDetailItem !== undefined) {
      setContactDetailDialogOpen(true);
    }
  }, [contactDetailItem]);
  useEffect(() => {
    if (factorDetailItem !== undefined) {
      setFactorDetailDialogOpen(true);
    }
  }, [factorDetailItem]);
  useEffect(() => {
    if (fileAttachmentDetailItem !== undefined) {
      setFileAttachmentDetailDialogOpen(true);
    }
  }, [fileAttachmentDetailItem]);
  useEffect(() => {
    if (investigationDetailItem !== undefined) {
      setInvestigationDetailDialogOpen(true);
    }
  }, [investigationDetailItem]);
  useEffect(() => {
    if (materialDetailItem !== undefined) {
      setMaterialDetailDialogOpen(true);
    }
  }, [materialDetailItem]);
  useEffect(() => {
    if (ontologyAnnotationDetailItem !== undefined) {
      setOntologyAnnotationDetailDialogOpen(true);
    }
  }, [ontologyAnnotationDetailItem]);
  useEffect(() => {
    if (protocolDetailItem !== undefined) {
      setProtocolDetailDialogOpen(true);
    }
  }, [protocolDetailItem]);

  /**
   * Utils
   */

  function clearRequestDoSave() {
    //reset contention flags
    isSaving.current = false;
    isClosing.current = false;
  }

  function getInitialValues() {
    let initialValues = {};

    initialValues.study_id = item.study_id;
    initialValues.name = item.name;
    initialValues.description = item.description;
    initialValues.startDate = item.startDate;
    initialValues.endDate = item.endDate;
    initialValues.investigation_id = item.investigation_id;
    initialValues.factor_ids = item.factor_ids;
    initialValues.protocol_ids = item.protocol_ids;
    initialValues.contact_ids = item.contact_ids;
    initialValues.material_ids = item.material_ids;
    initialValues.ontologyAnnotation_ids = item.ontologyAnnotation_ids;
    initialValues.fileAttachment_ids = item.fileAttachment_ids;

    return initialValues;
  }

  function getInitialForeignKeys() {
    let initialForeignKeys = {};
    
    initialForeignKeys.investigation_id = item.investigation_id;
    initialForeignKeys.factor_ids = item.factor_ids;
    initialForeignKeys.protocol_ids = item.protocol_ids;
    initialForeignKeys.contact_ids = item.contact_ids;
    initialForeignKeys.material_ids = item.material_ids;
    initialForeignKeys.ontologyAnnotation_ids = item.ontologyAnnotation_ids;
    initialForeignKeys.fileAttachment_ids = item.fileAttachment_ids;

    return initialForeignKeys;
  }

  function getInitialValueOkStates() {
    /*
      status codes:
        1: acceptable
        0: unknown/not tested yet (this is set on initial render)/empty
       -1: not acceptable
       -2: foreing key
       -3: readOnly
    */
    let initialValueOkStates = {};

  initialValueOkStates.study_id = (item.study_id!==null ? 1 : 0);
  initialValueOkStates.name = (item.name!==null ? 1 : 0);
  initialValueOkStates.description = (item.description!==null ? 1 : 0);
  initialValueOkStates.startDate = (item.startDate!==null ? 1 : 0);
  initialValueOkStates.endDate = (item.endDate!==null ? 1 : 0);
    initialValueOkStates.investigation_id = -2; //FK
    initialValueOkStates.factor_ids = -2; //FK
    initialValueOkStates.protocol_ids = -2; //FK
    initialValueOkStates.contact_ids = -2; //FK
    initialValueOkStates.material_ids = -2; //FK
    initialValueOkStates.ontologyAnnotation_ids = -2; //FK
    initialValueOkStates.fileAttachment_ids = -2; //FK

    return initialValueOkStates;
  }

  function getInitialValueAjvStates() {
    let _initialValueAjvStates = {};

    _initialValueAjvStates.study_id = {errors: []};
    _initialValueAjvStates.name = {errors: []};
    _initialValueAjvStates.description = {errors: []};
    _initialValueAjvStates.startDate = {errors: []};
    _initialValueAjvStates.endDate = {errors: []};
    _initialValueAjvStates.investigation_id = {errors: []}; //FK
    _initialValueAjvStates.factor_ids = {errors: []}; //FK
    _initialValueAjvStates.protocol_ids = {errors: []}; //FK
    _initialValueAjvStates.contact_ids = {errors: []}; //FK
    _initialValueAjvStates.material_ids = {errors: []}; //FK
    _initialValueAjvStates.ontologyAnnotation_ids = {errors: []}; //FK
    _initialValueAjvStates.fileAttachment_ids = {errors: []}; //FK

    return _initialValueAjvStates;
  }

  function areThereNotAcceptableFields() {
    let a = Object.entries(valueOkStates);
    for(let i=0; i<a.length; ++i) {
      if(a[i][1] === -1) {
        return true;
      }
    }
    return false;
  }

  function areThereIncompleteFields() {
    let a = Object.entries(valueOkStates);
    for(let i=0; i<a.length; ++i) {
      if(a[i][1] === 0) {
        return true;
      }
    }
    return false;
  }

  function areThereChangedFields() {
    if(values.current.study_id !== item.study_id) { return true;}
    if(values.current.name !== item.name) { return true;}
    if(values.current.description !== item.description) { return true;}
    if(values.current.startDate !== item.startDate) { return true;}
    if(values.current.endDate !== item.endDate) { return true;}
    if(values.current.investigation_id !== item.investigation_id) { return true;}
    if(values.current.factor_ids !== item.factor_ids) { return true;}
    if(values.current.protocol_ids !== item.protocol_ids) { return true;}
    if(values.current.contact_ids !== item.contact_ids) { return true;}
    if(values.current.material_ids !== item.material_ids) { return true;}
    if(values.current.ontologyAnnotation_ids !== item.ontologyAnnotation_ids) { return true;}
    if(values.current.fileAttachment_ids !== item.fileAttachment_ids) { return true;}
    return false;
  }

  function setAddRemoveOneInvestigation(variables) {
    //data to notify changes
    if(!changedAssociations.current.study_investigation_id) changedAssociations.current.study_investigation_id = {};
    
    /**
     * Case: The toAdd list isn't empty.
     */
    if(investigationIdsToAdd.current.length>0) {
      //set id to add
      variables.addInvestigation = investigationIdsToAdd.current[0];      
      //changes to nofity
      changedAssociations.current.study_investigation_id.added = true;
      changedAssociations.current.study_investigation_id.idsAdded = [investigationIdsToAdd.current[0]];
    }
    /**
     * Case: The toRemove list isn't empty.
     */
    if(investigationIdsToRemove.current.length>0) {
      //set id to remove
      variables.removeInvestigation = investigationIdsToRemove.current[0];
      //changes to nofity
      changedAssociations.current.study_investigation_id.removed = true;
      changedAssociations.current.study_investigation_id.idsRemoved = [investigationIdsToRemove.current[0]];
    }

    return;
  }

  function setAddRemoveManyAssays(variables) {
    //data to notify changes
    if(!changedAssociations.current.assay_study_id) changedAssociations.current.assay_study_id = {};

    /**
     * Case: The toAdd list isn't empty.
     */
    if(assaysIdsToAdd.current.length>0) {
      //set ids to add
      variables.addAssays = [ ...assaysIdsToAdd.current];
      //changes to nofity
      changedAssociations.current.assay_study_id.added = true;
      if(changedAssociations.current.assay_study_id.idsAdded){
        assaysIdsToAdd.current.forEach((it) => {if(!changedAssociations.current.assay_study_id.idsAdded.includes(it)) changedAssociations.current.assay_study_id.idsAdded.push(it);});
      } else {
        changedAssociations.current.assay_study_id.idsAdded = [...assaysIdsToAdd.current];
      }
    }
    /**
     * Case: The toRemove list isn't empty.
     */
    if(assaysIdsToRemove.current.length>0) {
      //set ids to remove
      variables.removeAssays = [ ...assaysIdsToRemove.current];
      //changes to nofity
      changedAssociations.current.assay_study_id.removed = true;
      if(changedAssociations.current.assay_study_id.idsRemoved){
        assaysIdsToRemove.current.forEach((it) => {if(!changedAssociations.current.assay_study_id.idsRemoved.includes(it)) changedAssociations.current.assay_study_id.idsRemoved.push(it);});
      } else {
        changedAssociations.current.assay_study_id.idsRemoved = [...assaysIdsToRemove.current];
      }
    }
    
    return;
  }
  function setAddRemoveManyContacts(variables) {
    //data to notify changes
    if(!changedAssociations.current.study_contact_ids) changedAssociations.current.study_contact_ids = {};

    /**
     * Case: The toAdd list isn't empty.
     */
    if(contactsIdsToAdd.current.length>0) {
      //set ids to add
      variables.addContacts = [ ...contactsIdsToAdd.current];
      //changes to nofity
      changedAssociations.current.study_contact_ids.added = true;
      if(changedAssociations.current.study_contact_ids.idsAdded){
        contactsIdsToAdd.current.forEach((it) => {if(!changedAssociations.current.study_contact_ids.idsAdded.includes(it)) changedAssociations.current.study_contact_ids.idsAdded.push(it);});
      } else {
        changedAssociations.current.study_contact_ids.idsAdded = [...contactsIdsToAdd.current];
      }
    }
    /**
     * Case: The toRemove list isn't empty.
     */
    if(contactsIdsToRemove.current.length>0) {
      //set ids to remove
      variables.removeContacts = [ ...contactsIdsToRemove.current];
      //changes to nofity
      changedAssociations.current.study_contact_ids.removed = true;
      if(changedAssociations.current.study_contact_ids.idsRemoved){
        contactsIdsToRemove.current.forEach((it) => {if(!changedAssociations.current.study_contact_ids.idsRemoved.includes(it)) changedAssociations.current.study_contact_ids.idsRemoved.push(it);});
      } else {
        changedAssociations.current.study_contact_ids.idsRemoved = [...contactsIdsToRemove.current];
      }
    }
    
    return;
  }
  function setAddRemoveManyFactors(variables) {
    //data to notify changes
    if(!changedAssociations.current.study_factor_ids) changedAssociations.current.study_factor_ids = {};

    /**
     * Case: The toAdd list isn't empty.
     */
    if(factorsIdsToAdd.current.length>0) {
      //set ids to add
      variables.addFactors = [ ...factorsIdsToAdd.current];
      //changes to nofity
      changedAssociations.current.study_factor_ids.added = true;
      if(changedAssociations.current.study_factor_ids.idsAdded){
        factorsIdsToAdd.current.forEach((it) => {if(!changedAssociations.current.study_factor_ids.idsAdded.includes(it)) changedAssociations.current.study_factor_ids.idsAdded.push(it);});
      } else {
        changedAssociations.current.study_factor_ids.idsAdded = [...factorsIdsToAdd.current];
      }
    }
    /**
     * Case: The toRemove list isn't empty.
     */
    if(factorsIdsToRemove.current.length>0) {
      //set ids to remove
      variables.removeFactors = [ ...factorsIdsToRemove.current];
      //changes to nofity
      changedAssociations.current.study_factor_ids.removed = true;
      if(changedAssociations.current.study_factor_ids.idsRemoved){
        factorsIdsToRemove.current.forEach((it) => {if(!changedAssociations.current.study_factor_ids.idsRemoved.includes(it)) changedAssociations.current.study_factor_ids.idsRemoved.push(it);});
      } else {
        changedAssociations.current.study_factor_ids.idsRemoved = [...factorsIdsToRemove.current];
      }
    }
    
    return;
  }
  function setAddRemoveManyFileAttachments(variables) {
    //data to notify changes
    if(!changedAssociations.current.study_fileAttachment_ids) changedAssociations.current.study_fileAttachment_ids = {};

    /**
     * Case: The toAdd list isn't empty.
     */
    if(fileAttachmentsIdsToAdd.current.length>0) {
      //set ids to add
      variables.addFileAttachments = [ ...fileAttachmentsIdsToAdd.current];
      //changes to nofity
      changedAssociations.current.study_fileAttachment_ids.added = true;
      if(changedAssociations.current.study_fileAttachment_ids.idsAdded){
        fileAttachmentsIdsToAdd.current.forEach((it) => {if(!changedAssociations.current.study_fileAttachment_ids.idsAdded.includes(it)) changedAssociations.current.study_fileAttachment_ids.idsAdded.push(it);});
      } else {
        changedAssociations.current.study_fileAttachment_ids.idsAdded = [...fileAttachmentsIdsToAdd.current];
      }
    }
    /**
     * Case: The toRemove list isn't empty.
     */
    if(fileAttachmentsIdsToRemove.current.length>0) {
      //set ids to remove
      variables.removeFileAttachments = [ ...fileAttachmentsIdsToRemove.current];
      //changes to nofity
      changedAssociations.current.study_fileAttachment_ids.removed = true;
      if(changedAssociations.current.study_fileAttachment_ids.idsRemoved){
        fileAttachmentsIdsToRemove.current.forEach((it) => {if(!changedAssociations.current.study_fileAttachment_ids.idsRemoved.includes(it)) changedAssociations.current.study_fileAttachment_ids.idsRemoved.push(it);});
      } else {
        changedAssociations.current.study_fileAttachment_ids.idsRemoved = [...fileAttachmentsIdsToRemove.current];
      }
    }
    
    return;
  }
  function setAddRemoveManyMaterials(variables) {
    //data to notify changes
    if(!changedAssociations.current.study_material_ids) changedAssociations.current.study_material_ids = {};

    /**
     * Case: The toAdd list isn't empty.
     */
    if(materialsIdsToAdd.current.length>0) {
      //set ids to add
      variables.addMaterials = [ ...materialsIdsToAdd.current];
      //changes to nofity
      changedAssociations.current.study_material_ids.added = true;
      if(changedAssociations.current.study_material_ids.idsAdded){
        materialsIdsToAdd.current.forEach((it) => {if(!changedAssociations.current.study_material_ids.idsAdded.includes(it)) changedAssociations.current.study_material_ids.idsAdded.push(it);});
      } else {
        changedAssociations.current.study_material_ids.idsAdded = [...materialsIdsToAdd.current];
      }
    }
    /**
     * Case: The toRemove list isn't empty.
     */
    if(materialsIdsToRemove.current.length>0) {
      //set ids to remove
      variables.removeMaterials = [ ...materialsIdsToRemove.current];
      //changes to nofity
      changedAssociations.current.study_material_ids.removed = true;
      if(changedAssociations.current.study_material_ids.idsRemoved){
        materialsIdsToRemove.current.forEach((it) => {if(!changedAssociations.current.study_material_ids.idsRemoved.includes(it)) changedAssociations.current.study_material_ids.idsRemoved.push(it);});
      } else {
        changedAssociations.current.study_material_ids.idsRemoved = [...materialsIdsToRemove.current];
      }
    }
    
    return;
  }
  function setAddRemoveManyOntologyAnnotations(variables) {
    //data to notify changes
    if(!changedAssociations.current.study_ontologyAnnotation_ids) changedAssociations.current.study_ontologyAnnotation_ids = {};

    /**
     * Case: The toAdd list isn't empty.
     */
    if(ontologyAnnotationsIdsToAdd.current.length>0) {
      //set ids to add
      variables.addOntologyAnnotations = [ ...ontologyAnnotationsIdsToAdd.current];
      //changes to nofity
      changedAssociations.current.study_ontologyAnnotation_ids.added = true;
      if(changedAssociations.current.study_ontologyAnnotation_ids.idsAdded){
        ontologyAnnotationsIdsToAdd.current.forEach((it) => {if(!changedAssociations.current.study_ontologyAnnotation_ids.idsAdded.includes(it)) changedAssociations.current.study_ontologyAnnotation_ids.idsAdded.push(it);});
      } else {
        changedAssociations.current.study_ontologyAnnotation_ids.idsAdded = [...ontologyAnnotationsIdsToAdd.current];
      }
    }
    /**
     * Case: The toRemove list isn't empty.
     */
    if(ontologyAnnotationsIdsToRemove.current.length>0) {
      //set ids to remove
      variables.removeOntologyAnnotations = [ ...ontologyAnnotationsIdsToRemove.current];
      //changes to nofity
      changedAssociations.current.study_ontologyAnnotation_ids.removed = true;
      if(changedAssociations.current.study_ontologyAnnotation_ids.idsRemoved){
        ontologyAnnotationsIdsToRemove.current.forEach((it) => {if(!changedAssociations.current.study_ontologyAnnotation_ids.idsRemoved.includes(it)) changedAssociations.current.study_ontologyAnnotation_ids.idsRemoved.push(it);});
      } else {
        changedAssociations.current.study_ontologyAnnotation_ids.idsRemoved = [...ontologyAnnotationsIdsToRemove.current];
      }
    }
    
    return;
  }
  function setAddRemoveManyProtocols(variables) {
    //data to notify changes
    if(!changedAssociations.current.study_protocol_ids) changedAssociations.current.study_protocol_ids = {};

    /**
     * Case: The toAdd list isn't empty.
     */
    if(protocolsIdsToAdd.current.length>0) {
      //set ids to add
      variables.addProtocols = [ ...protocolsIdsToAdd.current];
      //changes to nofity
      changedAssociations.current.study_protocol_ids.added = true;
      if(changedAssociations.current.study_protocol_ids.idsAdded){
        protocolsIdsToAdd.current.forEach((it) => {if(!changedAssociations.current.study_protocol_ids.idsAdded.includes(it)) changedAssociations.current.study_protocol_ids.idsAdded.push(it);});
      } else {
        changedAssociations.current.study_protocol_ids.idsAdded = [...protocolsIdsToAdd.current];
      }
    }
    /**
     * Case: The toRemove list isn't empty.
     */
    if(protocolsIdsToRemove.current.length>0) {
      //set ids to remove
      variables.removeProtocols = [ ...protocolsIdsToRemove.current];
      //changes to nofity
      changedAssociations.current.study_protocol_ids.removed = true;
      if(changedAssociations.current.study_protocol_ids.idsRemoved){
        protocolsIdsToRemove.current.forEach((it) => {if(!changedAssociations.current.study_protocol_ids.idsRemoved.includes(it)) changedAssociations.current.study_protocol_ids.idsRemoved.push(it);});
      } else {
        changedAssociations.current.study_protocol_ids.idsRemoved = [...protocolsIdsToRemove.current];
      }
    }
    
    return;
  }

function setAjvErrors(err) {
    //check
    if(err&&err.response&&err.response.data&&Array.isArray(err.response.data.errors)) {
      let errors = err.response.data.errors;
 
      //for each error
      for(let i=0; i<errors.length; ++i) {
        let e=errors[i];
        //check
        if(e && typeof e === 'object'
        && e.extensions && typeof e.extensions === 'object' 
        && Array.isArray(e.extensions.validationErrors)){
          let validationErrors = e.extensions.validationErrors;
          
          for(let j=0; j<validationErrors.length; ++j) {
            let validationError = validationErrors[j];

            //check
            if(validationError && typeof validationError === 'object' 
            && validationError.dataPath && validationError.message) {
              /**
               * In this point, the error is considered as an AJV error.
               * 
               * It will be set in a ajvStatus reference and at the end of this function 
               * the ajvStatus state will be updated.
               */
              //set reference
              addAjvErrorToField(validationError);
            }
          }
        }
      }
      //update state
      setValueAjvStates({...valuesAjvRefs.current});
    }
  }

  function addAjvErrorToField(error) {
    let dataPath = error.dataPath.slice(1);
    
    if(valuesAjvRefs.current[dataPath] !== undefined){
      valuesAjvRefs.current[dataPath].errors.push(error.message);
    }
  }
  
  /**
    * doSave
    * 
    * Update new @item using GrahpQL Server mutation.
    * Uses current state properties to fill query request.
    * Updates state to inform new @item updated.
    * 
    */
  async function doSave(event) {
    errors.current = [];
    valuesAjvRefs.current = getInitialValueAjvStates();

    /*
      Variables setup
    */
    //variables
    let keys = Object.keys(values.current);
    let variables = {};


    //attributes
    for(let i=0; i<keys.length; i++) {
      if(valuesOkRefs.current[keys[i]] !== -1
      && valuesOkRefs.current[keys[i]] !== -2 //FK
      && valuesOkRefs.current[keys[i]] !== -3 //readOnly
      ) {
        variables[keys[i]] = values.current[keys[i]];
      }
    }
    
    delete variables.investigation_id; //FK
    delete variables.factor_ids; //FK
    delete variables.protocol_ids; //FK
    delete variables.contact_ids; //FK
    delete variables.material_ids; //FK
    delete variables.ontologyAnnotation_ids; //FK
    delete variables.fileAttachment_ids; //FK

    //add & remove: to_one's
    setAddRemoveOneInvestigation(variables);

    //add & remove: to_many's
    setAddRemoveManyAssays(variables);
    setAddRemoveManyContacts(variables);
    setAddRemoveManyFactors(variables);
    setAddRemoveManyFileAttachments(variables);
    setAddRemoveManyMaterials(variables);
    setAddRemoveManyOntologyAnnotations(variables);
    setAddRemoveManyProtocols(variables);

    /*
      API Request: api.study.updateItem
    */
    let cancelableApiReq = makeCancelable(api.study.updateItem(graphqlServerUrl, variables));
    cancelablePromises.current.push(cancelableApiReq);
    await cancelableApiReq
      .promise
      .then(
      //resolved
      (response) => {
        //delete from cancelables
        cancelablePromises.current.splice(cancelablePromises.current.indexOf(cancelableApiReq), 1);
        //check: response
        if(response.message === 'ok') {
          //check: graphql errors
          if(response.graphqlErrors) {
            let newError = {};
            let withDetails=true;
            variant.current='info';
            newError.message = t('modelPanels.errors.data.e3', 'fetched with errors.');
            newError.locations=[{model: 'study', method: 'doSave()', request: 'api.study.updateItem'}];
            newError.path=['Studies', `study_id:${item.study_id}`, 'update'];
            newError.extensions = {graphQL:{data:response.data, errors:response.graphqlErrors}};
            errors.current.push(newError);
            console.log("Error: ", newError);

            showMessage(newError.message, withDetails);
          }
        } else { //not ok
          //show error
          let newError = {};
          let withDetails=true;
          variant.current='error';
          newError.message = t(`modelPanels.errors.data.${response.message}`, 'Error: '+response.message);
          newError.locations=[{model: 'study', method: 'doSave()', request: 'api.study.updateItem'}];
          newError.path=['Studies', `study_id:${item.study_id}`, 'update'];
          newError.extensions = {graphqlResponse:{data:response.data, errors:response.graphqlErrors}};
          errors.current.push(newError);
          console.log("Error: ", newError);

          showMessage(newError.message, withDetails);
          clearRequestDoSave();
          return false;
        } 

        //ok
        enqueueSnackbar( t('modelPanels.messages.msg5', "Record updated successfully."), {
          variant: 'success',
          preventDuplicate: false,
          persist: false,
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
          },
        });
        onClose(event, true, response.value);
        return;
      },
      //rejected
      (err) => {
        throw err;
      })
      //error
      .catch((err) => { //error: on api.study.updateItem
        if(err.isCanceled) {
          return;
        } else {
          //set ajv errors
          setAjvErrors(err);

          //show error
          let newError = {};
          let withDetails=true;
          variant.current='error';
          newError.message = t('modelPanels.errors.request.e1', 'Error in request made to server.');
          newError.locations=[{model: 'study', method: 'doSave()', request: 'api.study.updateItem'}];
          newError.path=['Studies', `study_id:${item.study_id}`, 'update'];
          newError.extensions = {error:{message:err.message, name:err.name, response:err.response}};
          errors.current.push(newError);
          console.log("Error: ", newError);

          showMessage(newError.message, withDetails);
          clearRequestDoSave();
          return;
        }
      });
  }

  const handleTabsChange = (event, newValue) => {
    //save last value
    lastTabValue.current = newValue;

    if(!isDebouncingTabsChange.current){
      //set last value
      currentTabValue.current = newValue;
      setTabsValue(newValue);
      
      //debounce
      isDebouncingTabsChange.current = true;
      let cancelableTimer = startTimerToDebounceTabsChange();
      cancelablePromises.current.push(cancelableTimer);
      cancelableTimer
        .promise
        .then(() => {
          //clear flag
          isDebouncingTabsChange.current = false;
          //delete from cancelables
          cancelablePromises.current.splice(cancelablePromises.current.indexOf(cancelableTimer), 1);
          //check
          if(lastTabValue.current !== currentTabValue.current){
            setTabsValue(lastTabValue.current);
            currentTabValue.current = lastTabValue.current;
          }
        })
        .catch(() => {
          return;
        })
    }
  };

  const handleSetValue = (value, status, key) => {
    values.current[key] = value;
    if(status !== valuesOkRefs.current[key]) {
      valuesOkRefs.current[key] = status;
      setValueOkStates({...valuesOkRefs.current});
    }
  }

  const handleSave = (event) => {
    if(areThereNotAcceptableFields()) {
      setConfirmationTitle( t('modelPanels.invalidFields', "Some fields are not valid") );
      setConfirmationText( t('modelPanels.invalidFieldsB', "To continue, please correct these fields.") );
      setConfirmationAcceptText("");
      setConfirmationRejectText( t('modelPanels.updateAccept', "I UNDERSTAND"));
      handleAccept.current = () => {
        isSaving.current = false;
        setConfirmationOpen(false);
      }
      handleReject.current = () => {
        isSaving.current = false;
        setConfirmationOpen(false);
      }
      setConfirmationOpen(true);
      return;
    }

    if(areThereIncompleteFields()) {
      setConfirmationTitle( t('modelPanels.incompleteFields', "Some fields are empty") );
      setConfirmationText( t('modelPanels.incompleteFieldsB', "Do you want to continue anyway?") );
      setConfirmationAcceptText( t('modelPanels.saveIncompleteAccept', "YES, SAVE") );
      setConfirmationRejectText( t('modelPanels.saveIncompleteReject', "DON'T SAVE YET") );
      handleAccept.current = () => {
        if(!isClosing.current) {
          isClosing.current = true;
          doSave(event);
          setConfirmationOpen(false);
        }
      }
      handleReject.current = () => {
        isSaving.current = false;
        setConfirmationOpen(false);
      }
      setConfirmationOpen(true);
    } else {
      doSave(event);
    }
  }

  const handleCancel = (event) => {
    if(areThereChangedFields()) {
        setConfirmationTitle( t('modelPanels.cancelChanges', "The edited information has not been saved") );
        setConfirmationText( t('modelPanels.cancelChangesB', "Some fields have been edited, if you continue without save, the changes will be lost, you want to continue?") );
        setConfirmationAcceptText( t('modelPanels.cancelChangesAccept', "YES, EXIT") );
        setConfirmationRejectText( t('modelPanels.cancelChangesReject', "STAY") );
        handleAccept.current = () => {
          if(!isClosing.current) {
            isClosing.current = true;
            setConfirmationOpen(false);
            onClose(event, false, null);
          }
        }
        handleReject.current = () => {
          isCanceling.current = false;
          setConfirmationOpen(false);
        }
        setConfirmationOpen(true);
        return;
    } else {
      onClose(event, false, null);
    }
  }

  const onClose = (event, status, newItem) => {
    setOpen(false);
    handleClose(event, status, item, newItem, changedAssociations.current);
  }

  const handleConfirmationAccept = (event) => {
    handleAccept.current();
  }

  const handleConfirmationReject = (event) => {
    handleReject.current();
  }

  const handleTransferToAdd = (associationKey, itemId) => {
    switch(associationKey) {
      case 'assays':
        assaysIdsToAdd.current.push(itemId);
        setAssaysIdsToAddState([...assaysIdsToAdd.current]);
        handleSetValue(itemId, -2, 'study_id');
        setForeignKeys({...foreignKeys, study_id: itemId});
        break;
      case 'contacts':
        contactsIdsToAdd.current.push(itemId);
        setContactsIdsToAddState([...contactsIdsToAdd.current]);
        handleSetValue(itemId, -2, 'contact_ids');
        setForeignKeys({...foreignKeys, contact_ids: itemId});
        break;
      case 'factors':
        factorsIdsToAdd.current.push(itemId);
        setFactorsIdsToAddState([...factorsIdsToAdd.current]);
        handleSetValue(itemId, -2, 'factor_ids');
        setForeignKeys({...foreignKeys, factor_ids: itemId});
        break;
      case 'fileAttachments':
        fileAttachmentsIdsToAdd.current.push(itemId);
        setFileAttachmentsIdsToAddState([...fileAttachmentsIdsToAdd.current]);
        handleSetValue(itemId, -2, 'fileAttachment_ids');
        setForeignKeys({...foreignKeys, fileAttachment_ids: itemId});
        break;
      case 'investigation':
        investigationIdsToAdd.current = [];
        investigationIdsToAdd.current.push(itemId);
        setInvestigationIdsToAddState([itemId]);
        handleSetValue(itemId, -2, 'investigation_id');
        setForeignKeys({...foreignKeys, investigation_id: itemId});
        break;
      case 'materials':
        materialsIdsToAdd.current.push(itemId);
        setMaterialsIdsToAddState([...materialsIdsToAdd.current]);
        handleSetValue(itemId, -2, 'material_ids');
        setForeignKeys({...foreignKeys, material_ids: itemId});
        break;
      case 'ontologyAnnotations':
        ontologyAnnotationsIdsToAdd.current.push(itemId);
        setOntologyAnnotationsIdsToAddState([...ontologyAnnotationsIdsToAdd.current]);
        handleSetValue(itemId, -2, 'ontologyAnnotation_ids');
        setForeignKeys({...foreignKeys, ontologyAnnotation_ids: itemId});
        break;
      case 'protocols':
        protocolsIdsToAdd.current.push(itemId);
        setProtocolsIdsToAddState([...protocolsIdsToAdd.current]);
        handleSetValue(itemId, -2, 'protocol_ids');
        setForeignKeys({...foreignKeys, protocol_ids: itemId});
        break;

      default:
        break;
    }
  }

  const handleUntransferFromAdd =(associationKey, itemId) => {
    if(associationKey === 'assays') {
      for(let i=0; i<assaysIdsToAdd.current.length; ++i)
      {
        if(assaysIdsToAdd.current[i] === itemId) {
          assaysIdsToAdd.current.splice(i, 1);
          setAssaysIdsToAddState([...assaysIdsToAdd.current]);
          handleSetValue(null, -2, 'study_id');
          setForeignKeys({...foreignKeys, study_id: null});
          return;
        }
      }
      return;
    }//end: case 'assays'
    if(associationKey === 'contacts') {
      for(let i=0; i<contactsIdsToAdd.current.length; ++i)
      {
        if(contactsIdsToAdd.current[i] === itemId) {
          contactsIdsToAdd.current.splice(i, 1);
          setContactsIdsToAddState([...contactsIdsToAdd.current]);
          handleSetValue(null, -2, 'contact_ids');
          setForeignKeys({...foreignKeys, contact_ids: null});
          return;
        }
      }
      return;
    }//end: case 'contacts'
    if(associationKey === 'factors') {
      for(let i=0; i<factorsIdsToAdd.current.length; ++i)
      {
        if(factorsIdsToAdd.current[i] === itemId) {
          factorsIdsToAdd.current.splice(i, 1);
          setFactorsIdsToAddState([...factorsIdsToAdd.current]);
          handleSetValue(null, -2, 'factor_ids');
          setForeignKeys({...foreignKeys, factor_ids: null});
          return;
        }
      }
      return;
    }//end: case 'factors'
    if(associationKey === 'fileAttachments') {
      for(let i=0; i<fileAttachmentsIdsToAdd.current.length; ++i)
      {
        if(fileAttachmentsIdsToAdd.current[i] === itemId) {
          fileAttachmentsIdsToAdd.current.splice(i, 1);
          setFileAttachmentsIdsToAddState([...fileAttachmentsIdsToAdd.current]);
          handleSetValue(null, -2, 'fileAttachment_ids');
          setForeignKeys({...foreignKeys, fileAttachment_ids: null});
          return;
        }
      }
      return;
    }//end: case 'fileAttachments'
    if(associationKey === 'investigation') {
      if(investigationIdsToAdd.current.length > 0
      && investigationIdsToAdd.current[0] === itemId) {
        investigationIdsToAdd.current = [];
        setInvestigationIdsToAddState([]);
        handleSetValue(null, -2, 'investigation_id');
        setForeignKeys({...foreignKeys, investigation_id: null});
      }
      return;
    }//end: case 'investigation'
    if(associationKey === 'materials') {
      for(let i=0; i<materialsIdsToAdd.current.length; ++i)
      {
        if(materialsIdsToAdd.current[i] === itemId) {
          materialsIdsToAdd.current.splice(i, 1);
          setMaterialsIdsToAddState([...materialsIdsToAdd.current]);
          handleSetValue(null, -2, 'material_ids');
          setForeignKeys({...foreignKeys, material_ids: null});
          return;
        }
      }
      return;
    }//end: case 'materials'
    if(associationKey === 'ontologyAnnotations') {
      for(let i=0; i<ontologyAnnotationsIdsToAdd.current.length; ++i)
      {
        if(ontologyAnnotationsIdsToAdd.current[i] === itemId) {
          ontologyAnnotationsIdsToAdd.current.splice(i, 1);
          setOntologyAnnotationsIdsToAddState([...ontologyAnnotationsIdsToAdd.current]);
          handleSetValue(null, -2, 'ontologyAnnotation_ids');
          setForeignKeys({...foreignKeys, ontologyAnnotation_ids: null});
          return;
        }
      }
      return;
    }//end: case 'ontologyAnnotations'
    if(associationKey === 'protocols') {
      for(let i=0; i<protocolsIdsToAdd.current.length; ++i)
      {
        if(protocolsIdsToAdd.current[i] === itemId) {
          protocolsIdsToAdd.current.splice(i, 1);
          setProtocolsIdsToAddState([...protocolsIdsToAdd.current]);
          handleSetValue(null, -2, 'protocol_ids');
          setForeignKeys({...foreignKeys, protocol_ids: null});
          return;
        }
      }
      return;
    }//end: case 'protocols'
  }

  const handleTransferToRemove = (associationKey, itemId) => {
    switch(associationKey) {
        case 'assays':
  
        assaysIdsToRemove.current.push(itemId);
        setAssaysIdsToRemoveState([...assaysIdsToRemove.current]);
        break;
        case 'contacts':
  
        contactsIdsToRemove.current.push(itemId);
        setContactsIdsToRemoveState([...contactsIdsToRemove.current]);
        break;
        case 'factors':
  
        factorsIdsToRemove.current.push(itemId);
        setFactorsIdsToRemoveState([...factorsIdsToRemove.current]);
        break;
        case 'fileAttachments':
  
        fileAttachmentsIdsToRemove.current.push(itemId);
        setFileAttachmentsIdsToRemoveState([...fileAttachmentsIdsToRemove.current]);
        break;
        case 'investigation':
          investigationIdsToRemove.current = [];
          investigationIdsToRemove.current.push(itemId);
          setInvestigationIdsToRemoveState([itemId]);
          handleSetValue(null, -2, 'investigation_id');
          setForeignKeys({...foreignKeys, investigation_id: null});
        break;
        case 'materials':
  
        materialsIdsToRemove.current.push(itemId);
        setMaterialsIdsToRemoveState([...materialsIdsToRemove.current]);
        break;
        case 'ontologyAnnotations':
  
        ontologyAnnotationsIdsToRemove.current.push(itemId);
        setOntologyAnnotationsIdsToRemoveState([...ontologyAnnotationsIdsToRemove.current]);
        break;
        case 'protocols':
  
        protocolsIdsToRemove.current.push(itemId);
        setProtocolsIdsToRemoveState([...protocolsIdsToRemove.current]);
        break;

      default:
        break;
    }
  }

  const handleUntransferFromRemove =(associationKey, itemId) => {
    if(associationKey === 'assays') {
      for(let i=0; i<assaysIdsToRemove.current.length; ++i)
      {
        if(assaysIdsToRemove.current[i] === itemId) {
          assaysIdsToRemove.current.splice(i, 1);
          setAssaysIdsToRemoveState([...assaysIdsToRemove.current]);
          return;
        }
      }
      return;
    }//end: case 'assays'
    if(associationKey === 'contacts') {
      for(let i=0; i<contactsIdsToRemove.current.length; ++i)
      {
        if(contactsIdsToRemove.current[i] === itemId) {
          contactsIdsToRemove.current.splice(i, 1);
          setContactsIdsToRemoveState([...contactsIdsToRemove.current]);
          return;
        }
      }
      return;
    }//end: case 'contacts'
    if(associationKey === 'factors') {
      for(let i=0; i<factorsIdsToRemove.current.length; ++i)
      {
        if(factorsIdsToRemove.current[i] === itemId) {
          factorsIdsToRemove.current.splice(i, 1);
          setFactorsIdsToRemoveState([...factorsIdsToRemove.current]);
          return;
        }
      }
      return;
    }//end: case 'factors'
    if(associationKey === 'fileAttachments') {
      for(let i=0; i<fileAttachmentsIdsToRemove.current.length; ++i)
      {
        if(fileAttachmentsIdsToRemove.current[i] === itemId) {
          fileAttachmentsIdsToRemove.current.splice(i, 1);
          setFileAttachmentsIdsToRemoveState([...fileAttachmentsIdsToRemove.current]);
          return;
        }
      }
      return;
    }//end: case 'fileAttachments'
    if(associationKey === 'investigation') {
      if(investigationIdsToRemove.current.length > 0
      && investigationIdsToRemove.current[0] === itemId) {
        investigationIdsToRemove.current = [];
        setInvestigationIdsToRemoveState([]);
        handleSetValue(itemId, -2, 'investigation_id');
        setForeignKeys({...foreignKeys, investigation_id: itemId});
      }
      return;
    }//end: case 'investigation'
    if(associationKey === 'materials') {
      for(let i=0; i<materialsIdsToRemove.current.length; ++i)
      {
        if(materialsIdsToRemove.current[i] === itemId) {
          materialsIdsToRemove.current.splice(i, 1);
          setMaterialsIdsToRemoveState([...materialsIdsToRemove.current]);
          return;
        }
      }
      return;
    }//end: case 'materials'
    if(associationKey === 'ontologyAnnotations') {
      for(let i=0; i<ontologyAnnotationsIdsToRemove.current.length; ++i)
      {
        if(ontologyAnnotationsIdsToRemove.current[i] === itemId) {
          ontologyAnnotationsIdsToRemove.current.splice(i, 1);
          setOntologyAnnotationsIdsToRemoveState([...ontologyAnnotationsIdsToRemove.current]);
          return;
        }
      }
      return;
    }//end: case 'ontologyAnnotations'
    if(associationKey === 'protocols') {
      for(let i=0; i<protocolsIdsToRemove.current.length; ++i)
      {
        if(protocolsIdsToRemove.current[i] === itemId) {
          protocolsIdsToRemove.current.splice(i, 1);
          setProtocolsIdsToRemoveState([...protocolsIdsToRemove.current]);
          return;
        }
      }
      return;
    }//end: case 'protocols'
  }

  const handleClickOnAssayRow = (event, item) => {
    setAssayDetailItem(item);
  };

  const handleAssayDetailDialogClose = (event) => {
    delayedCloseAssayDetailPanel(event, 500);
  }

  const delayedCloseAssayDetailPanel = async (event, ms) => {
    await new Promise(resolve => {
      window.setTimeout(function() {
        setAssayDetailDialogOpen(false);
        setAssayDetailItem(undefined);
        resolve("ok");
      }, ms);
    });
  };

  const handleClickOnContactRow = (event, item) => {
    setContactDetailItem(item);
  };

  const handleContactDetailDialogClose = (event) => {
    delayedCloseContactDetailPanel(event, 500);
  }

  const delayedCloseContactDetailPanel = async (event, ms) => {
    await new Promise(resolve => {
      window.setTimeout(function() {
        setContactDetailDialogOpen(false);
        setContactDetailItem(undefined);
        resolve("ok");
      }, ms);
    });
  };

  const handleClickOnFactorRow = (event, item) => {
    setFactorDetailItem(item);
  };

  const handleFactorDetailDialogClose = (event) => {
    delayedCloseFactorDetailPanel(event, 500);
  }

  const delayedCloseFactorDetailPanel = async (event, ms) => {
    await new Promise(resolve => {
      window.setTimeout(function() {
        setFactorDetailDialogOpen(false);
        setFactorDetailItem(undefined);
        resolve("ok");
      }, ms);
    });
  };

  const handleClickOnFileAttachmentRow = (event, item) => {
    setFileAttachmentDetailItem(item);
  };

  const handleFileAttachmentDetailDialogClose = (event) => {
    delayedCloseFileAttachmentDetailPanel(event, 500);
  }

  const delayedCloseFileAttachmentDetailPanel = async (event, ms) => {
    await new Promise(resolve => {
      window.setTimeout(function() {
        setFileAttachmentDetailDialogOpen(false);
        setFileAttachmentDetailItem(undefined);
        resolve("ok");
      }, ms);
    });
  };

  const handleClickOnInvestigationRow = (event, item) => {
    setInvestigationDetailItem(item);
  };

  const handleInvestigationDetailDialogClose = (event) => {
    delayedCloseInvestigationDetailPanel(event, 500);
  }

  const delayedCloseInvestigationDetailPanel = async (event, ms) => {
    await new Promise(resolve => {
      window.setTimeout(function() {
        setInvestigationDetailDialogOpen(false);
        setInvestigationDetailItem(undefined);
        resolve("ok");
      }, ms);
    });
  };

  const handleClickOnMaterialRow = (event, item) => {
    setMaterialDetailItem(item);
  };

  const handleMaterialDetailDialogClose = (event) => {
    delayedCloseMaterialDetailPanel(event, 500);
  }

  const delayedCloseMaterialDetailPanel = async (event, ms) => {
    await new Promise(resolve => {
      window.setTimeout(function() {
        setMaterialDetailDialogOpen(false);
        setMaterialDetailItem(undefined);
        resolve("ok");
      }, ms);
    });
  };

  const handleClickOnOntologyAnnotationRow = (event, item) => {
    setOntologyAnnotationDetailItem(item);
  };

  const handleOntologyAnnotationDetailDialogClose = (event) => {
    delayedCloseOntologyAnnotationDetailPanel(event, 500);
  }

  const delayedCloseOntologyAnnotationDetailPanel = async (event, ms) => {
    await new Promise(resolve => {
      window.setTimeout(function() {
        setOntologyAnnotationDetailDialogOpen(false);
        setOntologyAnnotationDetailItem(undefined);
        resolve("ok");
      }, ms);
    });
  };

  const handleClickOnProtocolRow = (event, item) => {
    setProtocolDetailItem(item);
  };

  const handleProtocolDetailDialogClose = (event) => {
    delayedCloseProtocolDetailPanel(event, 500);
  }

  const delayedCloseProtocolDetailPanel = async (event, ms) => {
    await new Promise(resolve => {
      window.setTimeout(function() {
        setProtocolDetailDialogOpen(false);
        setProtocolDetailItem(undefined);
        resolve("ok");
      }, ms);
    });
  };


  const startTimerToDebounceTabsChange = () => {
    return makeCancelable( new Promise(resolve => {
      window.setTimeout(function() { 
        resolve(); 
      }, debounceTimeout);
    }));
  };

  return (
    <Dialog id='StudyUpdatePanel-dialog' 
      fullScreen open={open} TransitionComponent={Transition}
      onClose={(event) => {
        if(!isCanceling.current){
          isCanceling.current = true;
          handleCancel(event);
        }
      }}
    >
      <AppBar>
        <Toolbar>
          <Tooltip title={ t('modelPanels.cancel') }>
            <IconButton
              id='StudyUpdatePanel-button-cancel'
              edge="start" 
              color="inherit" 
              onClick={(event) => {
                if(!isCanceling.current){
                  isCanceling.current = true;
                  handleCancel(event);
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h6" className={classes.title}>
            { t('modelPanels.editing') +  ": Study | study_id: " + item.study_id}
          </Typography>
          
          {(!deleted)&&(
            <Tooltip title={ t('modelPanels.save') + " study" }>
              <Fab
                id='StudyUpdatePanel-fabButton-save' 
                color="secondary" 
                className={classes.fabButton}
                onClick={(event) => {
                  if(!isSaving.current){
                    isSaving.current = true;
                    handleSave(event);
                  }
                }}
              >
                <SaveIcon />
              </Fab>
            </Tooltip>
          )}

        </Toolbar>
      </AppBar>
      <Toolbar/>

      <div className={classes.root}>
        <Grid container justify='center' alignItems='flex-start' alignContent='flex-start'>

          <Grid item xs={12}>
            {/* Delete warning */}
            <Box
              width="100%"
              p={0}
              position="fixed"
              top={appBarHeight}
              left={0}
              zIndex="speedDial"
            >
              <Collapse in={deleted}>
                <Card className={classes.warningCard} square={true}>
                  <CardHeader
                    avatar={
                      <DeletedWarning style={{ color: red[700] }} />
                    }
                    title={ t('modelPanels.deletedWarning', "This item no longer exists. It was deleted elsewhere.") }
                    subheader="Deleted"
                  />
                </Card>
              </Collapse>
            </Box>
          </Grid>
  
          <Grid item xs={12}>
            {/* Update warning */}
            <Box
              width="100%"
              p={0}
              position="fixed"
              top={appBarHeight}
              left={0}
              zIndex="speedDial"
            >
              <Collapse in={updated}>
                <Card className={classes.warningCard} square={true}>
                  <CardHeader
                    avatar={
                      <UpdateWarning style={{ color: amber[700] }} />
                    }
                    title={ t('modelPanels.updatedWarning', "This item was updated elsewhere.") }
                    subheader="Updated"
                  />
                </Card>
              </Collapse>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Collapse in={updated||deleted}>
              <Card className={classes.warningCard} square={true} elevation={0}>
              </Card>
            </Collapse>
          </Grid>
            
          {/* TabsA: Menú */}
          <Grid item xs={12}>
            <StudyTabsA
              value={tabsValue}
              handleChange={handleTabsChange}
            />
          </Grid>
          
          <Grid item xs={12}>
            {/* Attributes Page [0] */}
            <StudyAttributesPage
              hidden={tabsValue !== 0}
              item={item}
              valueOkStates={valueOkStates}
              valueAjvStates={valueAjvStates}
              foreignKeys = {foreignKeys}
              handleSetValue={handleSetValue}
            />
          </Grid>

          {/*
            * Conditional rendering:
            * Associations Page [1] 
            */}
          {(tabsValue === 1 && !deleted) && (
            <Grid item xs={12}>
              {/* Associations Page [1] */}
              <StudyAssociationsPage
                hidden={tabsValue !== 1 || deleted}
                item={item}
                assaysIdsToAdd={assaysIdsToAddState}
                assaysIdsToRemove={assaysIdsToRemoveState}
                contactsIdsToAdd={contactsIdsToAddState}
                contactsIdsToRemove={contactsIdsToRemoveState}
                factorsIdsToAdd={factorsIdsToAddState}
                factorsIdsToRemove={factorsIdsToRemoveState}
                fileAttachmentsIdsToAdd={fileAttachmentsIdsToAddState}
                fileAttachmentsIdsToRemove={fileAttachmentsIdsToRemoveState}
                investigationIdsToAdd={investigationIdsToAddState}
                investigationIdsToRemove={investigationIdsToRemoveState}
                materialsIdsToAdd={materialsIdsToAddState}
                materialsIdsToRemove={materialsIdsToRemoveState}
                ontologyAnnotationsIdsToAdd={ontologyAnnotationsIdsToAddState}
                ontologyAnnotationsIdsToRemove={ontologyAnnotationsIdsToRemoveState}
                protocolsIdsToAdd={protocolsIdsToAddState}
                protocolsIdsToRemove={protocolsIdsToRemoveState}
                handleTransferToAdd={handleTransferToAdd}
                handleUntransferFromAdd={handleUntransferFromAdd}
                handleTransferToRemove={handleTransferToRemove}
                handleUntransferFromRemove={handleUntransferFromRemove}
                handleClickOnAssayRow={handleClickOnAssayRow}
                handleClickOnContactRow={handleClickOnContactRow}
                handleClickOnFactorRow={handleClickOnFactorRow}
                handleClickOnFileAttachmentRow={handleClickOnFileAttachmentRow}
                handleClickOnInvestigationRow={handleClickOnInvestigationRow}
                handleClickOnMaterialRow={handleClickOnMaterialRow}
                handleClickOnOntologyAnnotationRow={handleClickOnOntologyAnnotationRow}
                handleClickOnProtocolRow={handleClickOnProtocolRow}
              />
            </Grid>
          )}
        </Grid>

        {/* Confirmation Dialog */}
        <StudyConfirmationDialog
          open={confirmationOpen}
          title={confirmationTitle}
          text={confirmationText}
          acceptText={confirmationAcceptText}
          rejectText={confirmationRejectText}
          handleAccept={handleConfirmationAccept}
          handleReject={handleConfirmationReject}
        />

        {/* Dialog: Assay Detail Panel */}
        {(assayDetailDialogOpen) && (
          <AssayDetailPanel
            permissions={permissions}
            item={assayDetailItem}
            dialog={true}
            handleClose={handleAssayDetailDialogClose}
          />
        )}
        {/* Dialog: Contact Detail Panel */}
        {(contactDetailDialogOpen) && (
          <ContactDetailPanel
            permissions={permissions}
            item={contactDetailItem}
            dialog={true}
            handleClose={handleContactDetailDialogClose}
          />
        )}
        {/* Dialog: Factor Detail Panel */}
        {(factorDetailDialogOpen) && (
          <FactorDetailPanel
            permissions={permissions}
            item={factorDetailItem}
            dialog={true}
            handleClose={handleFactorDetailDialogClose}
          />
        )}
        {/* Dialog: FileAttachment Detail Panel */}
        {(fileAttachmentDetailDialogOpen) && (
          <FileAttachmentDetailPanel
            permissions={permissions}
            item={fileAttachmentDetailItem}
            dialog={true}
            handleClose={handleFileAttachmentDetailDialogClose}
          />
        )}
        {/* Dialog: Investigation Detail Panel */}
        {(investigationDetailDialogOpen) && (
          <InvestigationDetailPanel
            permissions={permissions}
            item={investigationDetailItem}
            dialog={true}
            handleClose={handleInvestigationDetailDialogClose}
          />
        )}
        {/* Dialog: Material Detail Panel */}
        {(materialDetailDialogOpen) && (
          <MaterialDetailPanel
            permissions={permissions}
            item={materialDetailItem}
            dialog={true}
            handleClose={handleMaterialDetailDialogClose}
          />
        )}
        {/* Dialog: OntologyAnnotation Detail Panel */}
        {(ontologyAnnotationDetailDialogOpen) && (
          <OntologyAnnotationDetailPanel
            permissions={permissions}
            item={ontologyAnnotationDetailItem}
            dialog={true}
            handleClose={handleOntologyAnnotationDetailDialogClose}
          />
        )}
        {/* Dialog: Protocol Detail Panel */}
        {(protocolDetailDialogOpen) && (
          <ProtocolDetailPanel
            permissions={permissions}
            item={protocolDetailItem}
            dialog={true}
            handleClose={handleProtocolDetailDialogClose}
          />
        )}
      </div>

    </Dialog>
  );
}
StudyUpdatePanel.propTypes = {
  permissions: PropTypes.object,
  item: PropTypes.object.isRequired,
  handleClose: PropTypes.func.isRequired,
};
