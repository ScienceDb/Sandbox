import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import moment from "moment";
import { useTranslation } from 'react-i18next';
import EventAttributesPage from './components/event-attributes-page/EventAttributesPage'
import EventAssociationsPage from './components/event-associations-page/EventAssociationsPage'
import EventTabsA from './components/EventTabsA'
import EventConfirmationDialog from './components/EventConfirmationDialog'
import EventParameterDetailPanel from '../../../eventParameter-table/components/eventParameter-detail-panel/EventParameterDetailPanel'
import ObservationUnitToEventDetailPanel from '../../../observationUnit_to_event-table/components/observationUnit_to_event-detail-panel/ObservationUnit_to_eventDetailPanel'
import StudyDetailPanel from '../../../study-table/components/study-detail-panel/StudyDetailPanel'
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
  notiErrorActionText: {
    color: '#eba0a0',
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function EventUpdatePanel(props) {
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
  const changedAssociations = useRef({});
  
  const [eventParametersIdsToAddState, setEventParametersIdsToAddState] = useState([]);
  const eventParametersIdsToAdd = useRef([]);
  const [eventParametersIdsToRemoveState, setEventParametersIdsToRemoveState] = useState([]);
  const eventParametersIdsToRemove = useRef([]);
  const [eventToObservationUnitsIdsToAddState, setEventToObservationUnitsIdsToAddState] = useState([]);
  const eventToObservationUnitsIdsToAdd = useRef([]);
  const [eventToObservationUnitsIdsToRemoveState, setEventToObservationUnitsIdsToRemoveState] = useState([]);
  const eventToObservationUnitsIdsToRemove = useRef([]);
  const studyIdsToAdd = useRef((item.study&& item.study.studyDbId) ? [item.study.studyDbId] : []);
  const [studyIdsToAddState, setStudyIdsToAddState] = useState((item.study&& item.study.studyDbId) ? [item.study.studyDbId] : []);

  const [eventParameterDetailDialogOpen, setEventParameterDetailDialogOpen] = useState(false);
  const [eventParameterDetailItem, setEventParameterDetailItem] = useState(undefined);
  const [observationUnit_to_eventDetailDialogOpen, setObservationUnit_to_eventDetailDialogOpen] = useState(false);
  const [observationUnit_to_eventDetailItem, setObservationUnit_to_eventDetailItem] = useState(undefined);
  const [studyDetailDialogOpen, setStudyDetailDialogOpen] = useState(false);
  const [studyDetailItem, setStudyDetailItem] = useState(undefined);

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

  const actionText = useRef(null);
  const action = (key) => (
    <>
      <Button color='inherit' variant='text' size='small' className={classes.notiErrorActionText} onClick={() => { closeSnackbar(key) }}>
        {actionText.current}
      </Button>
    </> 
  );

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
      lastModelChanged.event&&
      lastModelChanged.event[String(item.eventType)]) {

        //updated item
        if(lastModelChanged.event[String(item.eventType)].op === "update"&&
            lastModelChanged.event[String(item.eventType)].newItem) {
              //show alert
              setUpdated(true);
        } else {
          //deleted item
          if(lastModelChanged.event[String(item.eventType)].op === "delete") {
              //show alert
              setDeleted(true);
          }
        }
    }//end: Case 1
  }, [lastModelChanged, lastChangeTimestamp, item.eventType]);

  useEffect(() => {
    if(deleted&&updated) {
      setUpdated(false);
    }
  }, [deleted, updated]);

  useEffect(() => {
    if (eventParameterDetailItem !== undefined) {
      setEventParameterDetailDialogOpen(true);
    }
  }, [eventParameterDetailItem]);
  useEffect(() => {
    if (observationUnit_to_eventDetailItem !== undefined) {
      setObservationUnit_to_eventDetailDialogOpen(true);
    }
  }, [observationUnit_to_eventDetailItem]);
  useEffect(() => {
    if (studyDetailItem !== undefined) {
      setStudyDetailDialogOpen(true);
    }
  }, [studyDetailItem]);

  function getInitialValues() {
    let initialValues = {};

    initialValues.eventDbId = item.eventDbId;
    initialValues.eventDescription = item.eventDescription;
    initialValues.eventType = item.eventType;
    initialValues.studyDbId = item.studyDbId;
    initialValues.date = item.date;

    return initialValues;
  }

  function getInitialForeignKeys() {
    let initialForeignKeys = {};
    
    initialForeignKeys.studyDbId = item.studyDbId;

    return initialForeignKeys;
  }

  function getInitialValueOkStates() {
    /*
      status codes:
        1: acceptable
        0: unknown/not tested yet (this is set on initial render)/empty
       -1: not acceptable
       -2: foreing key
    */
    let initialValueOkStates = {};

  initialValueOkStates.eventDbId = (item.eventDbId!==null ? 1 : 0);
  initialValueOkStates.eventDescription = (item.eventDescription!==null ? 1 : 0);
  initialValueOkStates.eventType = (item.eventType!==null ? 1 : 0);
    initialValueOkStates.studyDbId = -2; //FK
  initialValueOkStates.date = (item.date!==null ? 1 : 0);

    return initialValueOkStates;
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
    if(values.current.eventDbId !== item.eventDbId) { return true;}
    if(values.current.eventDescription !== item.eventDescription) { return true;}
    if(values.current.eventType !== item.eventType) { return true;}
    if(values.current.studyDbId !== item.studyDbId) { return true;}
    if((values.current.date === null || item.date === null) && item.date !== values.current.date) { return true; }
    if(values.current.date !== null && item.date !== null && !moment(values.current.date).isSame(item.date)) { return true; }
    return false;
  }

  function setAddRemoveStudy(variables) {
    //data to notify changes
    changedAssociations.current.study = {added: false, removed: false};
    
    /*
     * Case I: Currently, this record is associated.
     */
    if(item.study&&item.study.studyDbId) {
      /*
       * Case I.a: The toAdd list isn't empty.
       */      
      if(studyIdsToAdd.current.length>0) {
        /*
         * Case I.a.1: There is a new ID (current association changed).
         */
        if(item.study.studyDbId!== studyIdsToAdd.current[0]) {
          //set id to add
          variables.addStudy = studyIdsToAdd.current[0];
          
          changedAssociations.current.study.added = true;
          changedAssociations.current.study.idsAdded = studyIdsToAdd.current;
          changedAssociations.current.study.removed = true;
          changedAssociations.current.study.idsRemoved = [item.study.studyDbId];
        } else {
          /*
           * Case I.a.2: The ID on toAdd list es equal to the current associated ID.
           */
          //do nothing here (nothing changes).
        }
      } else {
        /*
         * Case I.b: The toAdd list is empty (current association removed).
         */
        //set id to remove
        variables.removeStudy = item.study.studyDbId;
        
        changedAssociations.current.study.removed = true;
        changedAssociations.current.study.idsRemoved = [item.study.studyDbId];
      }
    } else { //currently not to-one-associated
      /*
       * Case II: Currently, this record is not associated.
       */
      
      /*
       * Case II.a: The toAdd list isn't empty (has new id to add).
       */
      if(studyIdsToAdd.current.length>0) {
        //set id to add
        variables.addStudy = studyIdsToAdd.current[0];
        
        changedAssociations.current.study.added = true;
        changedAssociations.current.study.idsAdded = studyIdsToAdd.current;
      } else {
        /*
         * Case II.b: The toAdd list is empty.
         */
        //do nothing here (nothing changes).
      }
    }
  }

  function doSave(event) {
    /*
      Variables setup
    */
    //variables
    let keys = Object.keys(values.current);
    let variables = {};


    //attributes
    for(let i=0; i<keys.length; i++) {
      if(valuesOkRefs.current[keys[i]] !== -1) {
        variables[keys[i]] = values.current[keys[i]];
      }
    }

    //delete: fk's
    delete variables.studyDbId;

    //add & remove: to_one's
    setAddRemoveStudy(variables);

    //add & remove: to_many's
    //data to notify changes
    changedAssociations.current.eventParameters = {added: false, removed: false};
    
    if(eventParametersIdsToAdd.current.length>0) {
      variables.addEventParameters = eventParametersIdsToAdd.current;
      
      changedAssociations.current.eventParameters.added = true;
      changedAssociations.current.eventParameters.idsAdded = eventParametersIdsToAdd.current;
    }
    if(eventParametersIdsToRemove.current.length>0) {
      variables.removeEventParameters = eventParametersIdsToRemove.current;
      
      changedAssociations.current.eventParameters.removed = true;
      changedAssociations.current.eventParameters.idsRemoved = eventParametersIdsToRemove.current;
    }
    //data to notify changes
    changedAssociations.current.eventToObservationUnits = {added: false, removed: false};
    
    if(eventToObservationUnitsIdsToAdd.current.length>0) {
      variables.addEventToObservationUnits = eventToObservationUnitsIdsToAdd.current;
      
      changedAssociations.current.eventToObservationUnits.added = true;
      changedAssociations.current.eventToObservationUnits.idsAdded = eventToObservationUnitsIdsToAdd.current;
    }
    if(eventToObservationUnitsIdsToRemove.current.length>0) {
      variables.removeEventToObservationUnits = eventToObservationUnitsIdsToRemove.current;
      
      changedAssociations.current.eventToObservationUnits.removed = true;
      changedAssociations.current.eventToObservationUnits.idsRemoved = eventToObservationUnitsIdsToRemove.current;
    }

    /*
      API Request: updateItem
    */
    let cancelableApiReq = makeCancelable(api.event.updateItem(graphqlServerUrl, variables));
    cancelablePromises.current.push(cancelableApiReq);
    cancelableApiReq
      .promise
      .then(response => {
        //delete from cancelables
        cancelablePromises.current.splice(cancelablePromises.current.indexOf(cancelableApiReq), 1);
        //check response
        if (
          response.data &&
          response.data.data
        ) {
          //notify graphql errors
          if(response.data.errors) {
            actionText.current = t('modelPanels.gotIt', "Got it");
            enqueueSnackbar( t('modelPanels.errors.e3', "The GraphQL query returned a response with errors. Please contact your administrator."), {
              variant: 'error',
              preventDuplicate: false,
              persist: true,
              action,
            });
            console.log("Errors: ", response.data.errors);
          } else {

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
            onClose(event, true, response.data.data.updateEvent);
          }
          return;

        } else { //error: bad response on updateItem()
          actionText.current = t('modelPanels.gotIt', "Got it");
          enqueueSnackbar( t('modelPanels.errors.e2', "An error ocurred while trying to execute the GraphQL query, cannot process server response. Please contact your administrator."), {
            variant: 'error',
            preventDuplicate: false,
            persist: true,
            action,
          });
          console.log("Error: ", t('modelPanels.errors.e2', "An error ocurred while trying to execute the GraphQL query, cannot process server response. Please contact your administrator."));
          
          //reset contention flags
          isSaving.current = false;
          isClosing.current = false;
          return;
        }
      })
      .catch(({isCanceled, ...err}) => { //error: on updateItem()
        if(isCanceled) {
          return;
        } else {
          actionText.current = t('modelPanels.gotIt', "Got it");
          enqueueSnackbar( t('modelPanels.errors.e1', "An error occurred while trying to execute the GraphQL query. Please contact your administrator."), {
            variant: 'error',
            preventDuplicate: false,
            persist: true,
            action,
          });
          console.log("Error: ", err);
          
          //reset contention flags
          isSaving.current = false;
          isClosing.current = false;
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
      case 'eventParameters':
        eventParametersIdsToAdd.current.push(itemId);
        setEventParametersIdsToAddState(eventParametersIdsToAdd.current);
        break;
      case 'eventToObservationUnits':
        eventToObservationUnitsIdsToAdd.current.push(itemId);
        setEventToObservationUnitsIdsToAddState(eventToObservationUnitsIdsToAdd.current);
        break;
      case 'study':
        studyIdsToAdd.current = [];
        studyIdsToAdd.current.push(itemId);
        setStudyIdsToAddState(studyIdsToAdd.current);
        handleSetValue(itemId, 1, 'studyDbId');
        setForeignKeys({...foreignKeys, studyDbId: itemId});
        break;

      default:
        break;
    }
  }

  const handleUntransferFromAdd =(associationKey, itemId) => {
    if(associationKey === 'eventParameters') {
      for(let i=0; i<eventParametersIdsToAdd.current.length; ++i)
      {
        if(eventParametersIdsToAdd.current[i] === itemId) {
          eventParametersIdsToAdd.current.splice(i, 1);
          setEventParametersIdsToAddState(eventParametersIdsToAdd.current);
          return;
        }
      }
      return;
    }//end: case 'eventParameters'
    if(associationKey === 'eventToObservationUnits') {
      for(let i=0; i<eventToObservationUnitsIdsToAdd.current.length; ++i)
      {
        if(eventToObservationUnitsIdsToAdd.current[i] === itemId) {
          eventToObservationUnitsIdsToAdd.current.splice(i, 1);
          setEventToObservationUnitsIdsToAddState(eventToObservationUnitsIdsToAdd.current);
          return;
        }
      }
      return;
    }//end: case 'eventToObservationUnits'
    if(associationKey === 'study') {
      studyIdsToAdd.current = [];
      setStudyIdsToAddState([]);
      handleSetValue(null, 0, 'studyDbId');
      setForeignKeys({...foreignKeys, studyDbId: null});
      return;
    }//end: case 'study'
  }

  const handleTransferToRemove = (associationKey, itemId) => {
    switch(associationKey) {
      case 'eventParameters':
        eventParametersIdsToRemove.current.push(itemId);
        setEventParametersIdsToRemoveState(eventParametersIdsToRemove.current);
        break;
      case 'eventToObservationUnits':
        eventToObservationUnitsIdsToRemove.current.push(itemId);
        setEventToObservationUnitsIdsToRemoveState(eventToObservationUnitsIdsToRemove.current);
        break;

      default:
        break;
    }
  }

  const handleUntransferFromRemove =(associationKey, itemId) => {
    if(associationKey === 'eventParameters') {
      for(let i=0; i<eventParametersIdsToRemove.current.length; ++i)
      {
        if(eventParametersIdsToRemove.current[i] === itemId) {
          eventParametersIdsToRemove.current.splice(i, 1);
          setEventParametersIdsToRemoveState(eventParametersIdsToRemove.current);
          return;
        }
      }
      return;
    }//end: case 'eventParameters'
    if(associationKey === 'eventToObservationUnits') {
      for(let i=0; i<eventToObservationUnitsIdsToRemove.current.length; ++i)
      {
        if(eventToObservationUnitsIdsToRemove.current[i] === itemId) {
          eventToObservationUnitsIdsToRemove.current.splice(i, 1);
          setEventToObservationUnitsIdsToRemoveState(eventToObservationUnitsIdsToRemove.current);
          return;
        }
      }
      return;
    }//end: case 'eventToObservationUnits'
  }

  const handleClickOnEventParameterRow = (event, item) => {
    setEventParameterDetailItem(item);
  };

  const handleEventParameterDetailDialogClose = (event) => {
    delayedCloseEventParameterDetailPanel(event, 500);
  }

  const delayedCloseEventParameterDetailPanel = async (event, ms) => {
    await new Promise(resolve => {
      window.setTimeout(function() {
        setEventParameterDetailDialogOpen(false);
        setEventParameterDetailItem(undefined);
        resolve("ok");
      }, ms);
    });
  };

  const handleClickOnObservationUnit_to_eventRow = (event, item) => {
    setObservationUnit_to_eventDetailItem(item);
  };

  const handleObservationUnit_to_eventDetailDialogClose = (event) => {
    delayedCloseObservationUnit_to_eventDetailPanel(event, 500);
  }

  const delayedCloseObservationUnit_to_eventDetailPanel = async (event, ms) => {
    await new Promise(resolve => {
      window.setTimeout(function() {
        setObservationUnit_to_eventDetailDialogOpen(false);
        setObservationUnit_to_eventDetailItem(undefined);
        resolve("ok");
      }, ms);
    });
  };

  const handleClickOnStudyRow = (event, item) => {
    setStudyDetailItem(item);
  };

  const handleStudyDetailDialogClose = (event) => {
    delayedCloseStudyDetailPanel(event, 500);
  }

  const delayedCloseStudyDetailPanel = async (event, ms) => {
    await new Promise(resolve => {
      window.setTimeout(function() {
        setStudyDetailDialogOpen(false);
        setStudyDetailItem(undefined);
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
    <Dialog fullScreen open={open} TransitionComponent={Transition}
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
            { t('modelPanels.editing') +  ": Event | eventType: " + item.eventType}
          </Typography>
          
          {(!deleted)&&(
            <Tooltip title={ t('modelPanels.save') + " event" }>
              <Fab 
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
            <EventTabsA
              value={tabsValue}
              handleChange={handleTabsChange}
            />
          </Grid>
          
          <Grid item xs={12}>
            {/* Attributes Page [0] */}
            <EventAttributesPage
              hidden={tabsValue !== 0}
              item={item}
              valueOkStates={valueOkStates}
              foreignKeys = {foreignKeys}
              handleSetValue={handleSetValue}
            />
          </Grid>

          <Grid item xs={12}>
            {/* Associations Page [1] */}
            <EventAssociationsPage
              hidden={tabsValue !== 1 || deleted}
              item={item}
              eventParametersIdsToAdd={eventParametersIdsToAddState}
              eventParametersIdsToRemove={eventParametersIdsToRemoveState}
              eventToObservationUnitsIdsToAdd={eventToObservationUnitsIdsToAddState}
              eventToObservationUnitsIdsToRemove={eventToObservationUnitsIdsToRemoveState}
              studyIdsToAdd={studyIdsToAddState}
              handleTransferToAdd={handleTransferToAdd}
              handleUntransferFromAdd={handleUntransferFromAdd}
              handleTransferToRemove={handleTransferToRemove}
              handleUntransferFromRemove={handleUntransferFromRemove}
              handleClickOnEventParameterRow={handleClickOnEventParameterRow}
              handleClickOnObservationUnit_to_eventRow={handleClickOnObservationUnit_to_eventRow}
              handleClickOnStudyRow={handleClickOnStudyRow}
            />
          </Grid>
        </Grid>

        {/* Confirmation Dialog */}
        <EventConfirmationDialog
          open={confirmationOpen}
          title={confirmationTitle}
          text={confirmationText}
          acceptText={confirmationAcceptText}
          rejectText={confirmationRejectText}
          handleAccept={handleConfirmationAccept}
          handleReject={handleConfirmationReject}
        />

        {/* Dialog: EventParameter Detail Panel */}
        {(eventParameterDetailDialogOpen) && (
          <EventParameterDetailPanel
            permissions={permissions}
            item={eventParameterDetailItem}
            dialog={true}
            handleClose={handleEventParameterDetailDialogClose}
          />
        )}
        {/* Dialog: ObservationUnit_to_event Detail Panel */}
        {(observationUnit_to_eventDetailDialogOpen) && (
          <ObservationUnitToEventDetailPanel
            permissions={permissions}
            item={observationUnit_to_eventDetailItem}
            dialog={true}
            handleClose={handleObservationUnit_to_eventDetailDialogClose}
          />
        )}
        {/* Dialog: Study Detail Panel */}
        {(studyDetailDialogOpen) && (
          <StudyDetailPanel
            permissions={permissions}
            item={studyDetailItem}
            dialog={true}
            handleClose={handleStudyDetailDialogClose}
          />
        )}
      </div>

    </Dialog>
  );
}
EventUpdatePanel.propTypes = {
  permissions: PropTypes.object,
  item: PropTypes.object.isRequired,
  handleClose: PropTypes.func.isRequired,
};
