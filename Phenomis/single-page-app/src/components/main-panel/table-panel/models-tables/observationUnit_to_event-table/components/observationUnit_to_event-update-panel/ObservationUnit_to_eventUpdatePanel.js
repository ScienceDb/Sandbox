import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import ObservationUnitToEventAttributesPage from './components/observationUnit_to_event-attributes-page/ObservationUnit_to_eventAttributesPage'
import ObservationUnitToEventAssociationsPage from './components/observationUnit_to_event-associations-page/ObservationUnit_to_eventAssociationsPage'
import ObservationUnitToEventTabsA from './components/ObservationUnit_to_eventTabsA'
import ObservationUnitToEventConfirmationDialog from './components/ObservationUnit_to_eventConfirmationDialog'
import EventDetailPanel from '../../../event-table/components/event-detail-panel/EventDetailPanel'
import ObservationUnitDetailPanel from '../../../observationUnit-table/components/observationUnit-detail-panel/ObservationUnitDetailPanel'
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

export default function ObservationUnitToEventUpdatePanel(props) {
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
  
  const eventIdsToAdd = useRef((item.event&& item.event.eventType) ? [item.event.eventType] : []);
  const [eventIdsToAddState, setEventIdsToAddState] = useState((item.event&& item.event.eventType) ? [item.event.eventType] : []);
  const observationUnitIdsToAdd = useRef((item.observationUnit&& item.observationUnit.observationUnitDbId) ? [item.observationUnit.observationUnitDbId] : []);
  const [observationUnitIdsToAddState, setObservationUnitIdsToAddState] = useState((item.observationUnit&& item.observationUnit.observationUnitDbId) ? [item.observationUnit.observationUnitDbId] : []);

  const [eventDetailDialogOpen, setEventDetailDialogOpen] = useState(false);
  const [eventDetailItem, setEventDetailItem] = useState(undefined);
  const [observationUnitDetailDialogOpen, setObservationUnitDetailDialogOpen] = useState(false);
  const [observationUnitDetailItem, setObservationUnitDetailItem] = useState(undefined);

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
      lastModelChanged.observationUnit_to_event&&
      lastModelChanged.observationUnit_to_event[String(item.id)]) {

        //updated item
        if(lastModelChanged.observationUnit_to_event[String(item.id)].op === "update"&&
            lastModelChanged.observationUnit_to_event[String(item.id)].newItem) {
              //show alert
              setUpdated(true);
        } else {
          //deleted item
          if(lastModelChanged.observationUnit_to_event[String(item.id)].op === "delete") {
              //show alert
              setDeleted(true);
          }
        }
    }//end: Case 1
  }, [lastModelChanged, lastChangeTimestamp, item.id]);

  useEffect(() => {
    if(deleted&&updated) {
      setUpdated(false);
    }
  }, [deleted, updated]);

  useEffect(() => {
    if (eventDetailItem !== undefined) {
      setEventDetailDialogOpen(true);
    }
  }, [eventDetailItem]);
  useEffect(() => {
    if (observationUnitDetailItem !== undefined) {
      setObservationUnitDetailDialogOpen(true);
    }
  }, [observationUnitDetailItem]);

  function getInitialValues() {
    let initialValues = {};

    initialValues.observationUnitDbId = item.observationUnitDbId;
    initialValues.eventDbId = item.eventDbId;

    return initialValues;
  }

  function getInitialForeignKeys() {
    let initialForeignKeys = {};
    
    initialForeignKeys.observationUnitDbId = item.observationUnitDbId;
    initialForeignKeys.eventDbId = item.eventDbId;

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

    initialValueOkStates.observationUnitDbId = -2; //FK
    initialValueOkStates.eventDbId = -2; //FK

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
    if(values.current.observationUnitDbId !== item.observationUnitDbId) { return true;}
    if(values.current.eventDbId !== item.eventDbId) { return true;}
    return false;
  }

  function setAddRemoveEvent(variables) {
    //data to notify changes
    changedAssociations.current.event = {added: false, removed: false};
    
    /*
     * Case I: Currently, this record is associated.
     */
    if(item.event&&item.event.eventType) {
      /*
       * Case I.a: The toAdd list isn't empty.
       */      
      if(eventIdsToAdd.current.length>0) {
        /*
         * Case I.a.1: There is a new ID (current association changed).
         */
        if(item.event.eventType!== eventIdsToAdd.current[0]) {
          //set id to add
          variables.addEvent = eventIdsToAdd.current[0];
          
          changedAssociations.current.event.added = true;
          changedAssociations.current.event.idsAdded = eventIdsToAdd.current;
          changedAssociations.current.event.removed = true;
          changedAssociations.current.event.idsRemoved = [item.event.eventType];
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
        variables.removeEvent = item.event.eventType;
        
        changedAssociations.current.event.removed = true;
        changedAssociations.current.event.idsRemoved = [item.event.eventType];
      }
    } else { //currently not to-one-associated
      /*
       * Case II: Currently, this record is not associated.
       */
      
      /*
       * Case II.a: The toAdd list isn't empty (has new id to add).
       */
      if(eventIdsToAdd.current.length>0) {
        //set id to add
        variables.addEvent = eventIdsToAdd.current[0];
        
        changedAssociations.current.event.added = true;
        changedAssociations.current.event.idsAdded = eventIdsToAdd.current;
      } else {
        /*
         * Case II.b: The toAdd list is empty.
         */
        //do nothing here (nothing changes).
      }
    }
  }
  function setAddRemoveObservationUnit(variables) {
    //data to notify changes
    changedAssociations.current.observationUnit = {added: false, removed: false};
    
    /*
     * Case I: Currently, this record is associated.
     */
    if(item.observationUnit&&item.observationUnit.observationUnitDbId) {
      /*
       * Case I.a: The toAdd list isn't empty.
       */      
      if(observationUnitIdsToAdd.current.length>0) {
        /*
         * Case I.a.1: There is a new ID (current association changed).
         */
        if(item.observationUnit.observationUnitDbId!== observationUnitIdsToAdd.current[0]) {
          //set id to add
          variables.addObservationUnit = observationUnitIdsToAdd.current[0];
          
          changedAssociations.current.observationUnit.added = true;
          changedAssociations.current.observationUnit.idsAdded = observationUnitIdsToAdd.current;
          changedAssociations.current.observationUnit.removed = true;
          changedAssociations.current.observationUnit.idsRemoved = [item.observationUnit.observationUnitDbId];
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
        variables.removeObservationUnit = item.observationUnit.observationUnitDbId;
        
        changedAssociations.current.observationUnit.removed = true;
        changedAssociations.current.observationUnit.idsRemoved = [item.observationUnit.observationUnitDbId];
      }
    } else { //currently not to-one-associated
      /*
       * Case II: Currently, this record is not associated.
       */
      
      /*
       * Case II.a: The toAdd list isn't empty (has new id to add).
       */
      if(observationUnitIdsToAdd.current.length>0) {
        //set id to add
        variables.addObservationUnit = observationUnitIdsToAdd.current[0];
        
        changedAssociations.current.observationUnit.added = true;
        changedAssociations.current.observationUnit.idsAdded = observationUnitIdsToAdd.current;
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

    //id    variables.id= item.id;

    //attributes
    for(let i=0; i<keys.length; i++) {
      if(valuesOkRefs.current[keys[i]] !== -1) {
        variables[keys[i]] = values.current[keys[i]];
      }
    }

    //delete: fk's
    delete variables.observationUnitDbId;
    delete variables.eventDbId;

    //add & remove: to_one's
    setAddRemoveEvent(variables);
    setAddRemoveObservationUnit(variables);

    //add & remove: to_many's

    /*
      API Request: updateItem
    */
    let cancelableApiReq = makeCancelable(api.observationUnit_to_event.updateItem(graphqlServerUrl, variables));
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
            onClose(event, true, response.data.data.updateObservationUnit_to_event);
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
      case 'event':
        eventIdsToAdd.current = [];
        eventIdsToAdd.current.push(itemId);
        setEventIdsToAddState(eventIdsToAdd.current);
        handleSetValue(itemId, 1, 'eventDbId');
        setForeignKeys({...foreignKeys, eventDbId: itemId});
        break;
      case 'observationUnit':
        observationUnitIdsToAdd.current = [];
        observationUnitIdsToAdd.current.push(itemId);
        setObservationUnitIdsToAddState(observationUnitIdsToAdd.current);
        handleSetValue(itemId, 1, 'observationUnitDbId');
        setForeignKeys({...foreignKeys, observationUnitDbId: itemId});
        break;

      default:
        break;
    }
  }

  const handleUntransferFromAdd =(associationKey, itemId) => {
    if(associationKey === 'event') {
      eventIdsToAdd.current = [];
      setEventIdsToAddState([]);
      handleSetValue(null, 0, 'eventDbId');
      setForeignKeys({...foreignKeys, eventDbId: null});
      return;
    }//end: case 'event'
    if(associationKey === 'observationUnit') {
      observationUnitIdsToAdd.current = [];
      setObservationUnitIdsToAddState([]);
      handleSetValue(null, 0, 'observationUnitDbId');
      setForeignKeys({...foreignKeys, observationUnitDbId: null});
      return;
    }//end: case 'observationUnit'
  }


  const handleClickOnEventRow = (event, item) => {
    setEventDetailItem(item);
  };

  const handleEventDetailDialogClose = (event) => {
    delayedCloseEventDetailPanel(event, 500);
  }

  const delayedCloseEventDetailPanel = async (event, ms) => {
    await new Promise(resolve => {
      window.setTimeout(function() {
        setEventDetailDialogOpen(false);
        setEventDetailItem(undefined);
        resolve("ok");
      }, ms);
    });
  };

  const handleClickOnObservationUnitRow = (event, item) => {
    setObservationUnitDetailItem(item);
  };

  const handleObservationUnitDetailDialogClose = (event) => {
    delayedCloseObservationUnitDetailPanel(event, 500);
  }

  const delayedCloseObservationUnitDetailPanel = async (event, ms) => {
    await new Promise(resolve => {
      window.setTimeout(function() {
        setObservationUnitDetailDialogOpen(false);
        setObservationUnitDetailItem(undefined);
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
            { t('modelPanels.editing') +  ": ObservationUnit_to_event | id: " + item.id}
          </Typography>
          
          {(!deleted)&&(
            <Tooltip title={ t('modelPanels.save') + " observationUnit_to_event" }>
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
            <ObservationUnitToEventTabsA
              value={tabsValue}
              handleChange={handleTabsChange}
            />
          </Grid>
          
          <Grid item xs={12}>
            {/* Attributes Page [0] */}
            <ObservationUnitToEventAttributesPage
              hidden={tabsValue !== 0}
              item={item}
              valueOkStates={valueOkStates}
              foreignKeys = {foreignKeys}
              handleSetValue={handleSetValue}
            />
          </Grid>

          <Grid item xs={12}>
            {/* Associations Page [1] */}
            <ObservationUnitToEventAssociationsPage
              hidden={tabsValue !== 1 || deleted}
              item={item}
              eventIdsToAdd={eventIdsToAddState}
              observationUnitIdsToAdd={observationUnitIdsToAddState}
              handleTransferToAdd={handleTransferToAdd}
              handleUntransferFromAdd={handleUntransferFromAdd}
              handleClickOnEventRow={handleClickOnEventRow}
              handleClickOnObservationUnitRow={handleClickOnObservationUnitRow}
            />
          </Grid>
        </Grid>

        {/* Confirmation Dialog */}
        <ObservationUnitToEventConfirmationDialog
          open={confirmationOpen}
          title={confirmationTitle}
          text={confirmationText}
          acceptText={confirmationAcceptText}
          rejectText={confirmationRejectText}
          handleAccept={handleConfirmationAccept}
          handleReject={handleConfirmationReject}
        />

        {/* Dialog: Event Detail Panel */}
        {(eventDetailDialogOpen) && (
          <EventDetailPanel
            permissions={permissions}
            item={eventDetailItem}
            dialog={true}
            handleClose={handleEventDetailDialogClose}
          />
        )}
        {/* Dialog: ObservationUnit Detail Panel */}
        {(observationUnitDetailDialogOpen) && (
          <ObservationUnitDetailPanel
            permissions={permissions}
            item={observationUnitDetailItem}
            dialog={true}
            handleClose={handleObservationUnitDetailDialogClose}
          />
        )}
      </div>

    </Dialog>
  );
}
ObservationUnitToEventUpdatePanel.propTypes = {
  permissions: PropTypes.object,
  item: PropTypes.object.isRequired,
  handleClose: PropTypes.func.isRequired,
};
