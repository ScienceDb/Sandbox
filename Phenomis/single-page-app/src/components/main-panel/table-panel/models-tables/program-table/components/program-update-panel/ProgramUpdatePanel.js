import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import ProgramAttributesPage from './components/program-attributes-page/ProgramAttributesPage'
import ProgramAssociationsPage from './components/program-associations-page/ProgramAssociationsPage'
import ProgramTabsA from './components/ProgramTabsA'
import ProgramConfirmationDialog from './components/ProgramConfirmationDialog'
import ObservationUnitDetailPanel from '../../../observationUnit-table/components/observationUnit-detail-panel/ObservationUnitDetailPanel'
import TrialDetailPanel from '../../../trial-table/components/trial-detail-panel/TrialDetailPanel'
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

export default function ProgramUpdatePanel(props) {
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
  
  const [observationUnitsIdsToAddState, setObservationUnitsIdsToAddState] = useState([]);
  const observationUnitsIdsToAdd = useRef([]);
  const [observationUnitsIdsToRemoveState, setObservationUnitsIdsToRemoveState] = useState([]);
  const observationUnitsIdsToRemove = useRef([]);
  const [trialsIdsToAddState, setTrialsIdsToAddState] = useState([]);
  const trialsIdsToAdd = useRef([]);
  const [trialsIdsToRemoveState, setTrialsIdsToRemoveState] = useState([]);
  const trialsIdsToRemove = useRef([]);

  const [observationUnitDetailDialogOpen, setObservationUnitDetailDialogOpen] = useState(false);
  const [observationUnitDetailItem, setObservationUnitDetailItem] = useState(undefined);
  const [trialDetailDialogOpen, setTrialDetailDialogOpen] = useState(false);
  const [trialDetailItem, setTrialDetailItem] = useState(undefined);

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
      lastModelChanged.program&&
      lastModelChanged.program[String(item.programDbId)]) {

        //updated item
        if(lastModelChanged.program[String(item.programDbId)].op === "update"&&
            lastModelChanged.program[String(item.programDbId)].newItem) {
              //show alert
              setUpdated(true);
        } else {
          //deleted item
          if(lastModelChanged.program[String(item.programDbId)].op === "delete") {
              //show alert
              setDeleted(true);
          }
        }
    }//end: Case 1
  }, [lastModelChanged, lastChangeTimestamp, item.programDbId]);

  useEffect(() => {
    if(deleted&&updated) {
      setUpdated(false);
    }
  }, [deleted, updated]);

  useEffect(() => {
    if (observationUnitDetailItem !== undefined) {
      setObservationUnitDetailDialogOpen(true);
    }
  }, [observationUnitDetailItem]);
  useEffect(() => {
    if (trialDetailItem !== undefined) {
      setTrialDetailDialogOpen(true);
    }
  }, [trialDetailItem]);

  function getInitialValues() {
    let initialValues = {};

    initialValues.abbreviation = item.abbreviation;
    initialValues.commonCropName = item.commonCropName;
    initialValues.documentationURL = item.documentationURL;
    initialValues.leadPersonDbId = item.leadPersonDbId;
    initialValues.leadPersonName = item.leadPersonName;
    initialValues.objective = item.objective;
    initialValues.programName = item.programName;
    initialValues.programDbId = item.programDbId;

    return initialValues;
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

  initialValueOkStates.abbreviation = (item.abbreviation!==null ? 1 : 0);
  initialValueOkStates.commonCropName = (item.commonCropName!==null ? 1 : 0);
  initialValueOkStates.documentationURL = (item.documentationURL!==null ? 1 : 0);
  initialValueOkStates.leadPersonDbId = (item.leadPersonDbId!==null ? 1 : 0);
  initialValueOkStates.leadPersonName = (item.leadPersonName!==null ? 1 : 0);
  initialValueOkStates.objective = (item.objective!==null ? 1 : 0);
  initialValueOkStates.programName = (item.programName!==null ? 1 : 0);
  initialValueOkStates.programDbId = (item.programDbId!==null ? 1 : 0);

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
    if(values.current.abbreviation !== item.abbreviation) { return true;}
    if(values.current.commonCropName !== item.commonCropName) { return true;}
    if(values.current.documentationURL !== item.documentationURL) { return true;}
    if(values.current.leadPersonDbId !== item.leadPersonDbId) { return true;}
    if(values.current.leadPersonName !== item.leadPersonName) { return true;}
    if(values.current.objective !== item.objective) { return true;}
    if(values.current.programName !== item.programName) { return true;}
    if(values.current.programDbId !== item.programDbId) { return true;}
    return false;
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

    //add & remove: to_one's

    //add & remove: to_many's
    //data to notify changes
    changedAssociations.current.observationUnits = {added: false, removed: false};
    
    if(observationUnitsIdsToAdd.current.length>0) {
      variables.addObservationUnits = observationUnitsIdsToAdd.current;
      
      changedAssociations.current.observationUnits.added = true;
      changedAssociations.current.observationUnits.idsAdded = observationUnitsIdsToAdd.current;
    }
    if(observationUnitsIdsToRemove.current.length>0) {
      variables.removeObservationUnits = observationUnitsIdsToRemove.current;
      
      changedAssociations.current.observationUnits.removed = true;
      changedAssociations.current.observationUnits.idsRemoved = observationUnitsIdsToRemove.current;
    }
    //data to notify changes
    changedAssociations.current.trials = {added: false, removed: false};
    
    if(trialsIdsToAdd.current.length>0) {
      variables.addTrials = trialsIdsToAdd.current;
      
      changedAssociations.current.trials.added = true;
      changedAssociations.current.trials.idsAdded = trialsIdsToAdd.current;
    }
    if(trialsIdsToRemove.current.length>0) {
      variables.removeTrials = trialsIdsToRemove.current;
      
      changedAssociations.current.trials.removed = true;
      changedAssociations.current.trials.idsRemoved = trialsIdsToRemove.current;
    }

    /*
      API Request: updateItem
    */
    let cancelableApiReq = makeCancelable(api.program.updateItem(graphqlServerUrl, variables));
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
            onClose(event, true, response.data.data.updateProgram);
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
      case 'observationUnits':
        observationUnitsIdsToAdd.current.push(itemId);
        setObservationUnitsIdsToAddState(observationUnitsIdsToAdd.current);
        break;
      case 'trials':
        trialsIdsToAdd.current.push(itemId);
        setTrialsIdsToAddState(trialsIdsToAdd.current);
        break;

      default:
        break;
    }
  }

  const handleUntransferFromAdd =(associationKey, itemId) => {
    if(associationKey === 'observationUnits') {
      for(let i=0; i<observationUnitsIdsToAdd.current.length; ++i)
      {
        if(observationUnitsIdsToAdd.current[i] === itemId) {
          observationUnitsIdsToAdd.current.splice(i, 1);
          setObservationUnitsIdsToAddState(observationUnitsIdsToAdd.current);
          return;
        }
      }
      return;
    }//end: case 'observationUnits'
    if(associationKey === 'trials') {
      for(let i=0; i<trialsIdsToAdd.current.length; ++i)
      {
        if(trialsIdsToAdd.current[i] === itemId) {
          trialsIdsToAdd.current.splice(i, 1);
          setTrialsIdsToAddState(trialsIdsToAdd.current);
          return;
        }
      }
      return;
    }//end: case 'trials'
  }

  const handleTransferToRemove = (associationKey, itemId) => {
    switch(associationKey) {
      case 'observationUnits':
        observationUnitsIdsToRemove.current.push(itemId);
        setObservationUnitsIdsToRemoveState(observationUnitsIdsToRemove.current);
        break;
      case 'trials':
        trialsIdsToRemove.current.push(itemId);
        setTrialsIdsToRemoveState(trialsIdsToRemove.current);
        break;

      default:
        break;
    }
  }

  const handleUntransferFromRemove =(associationKey, itemId) => {
    if(associationKey === 'observationUnits') {
      for(let i=0; i<observationUnitsIdsToRemove.current.length; ++i)
      {
        if(observationUnitsIdsToRemove.current[i] === itemId) {
          observationUnitsIdsToRemove.current.splice(i, 1);
          setObservationUnitsIdsToRemoveState(observationUnitsIdsToRemove.current);
          return;
        }
      }
      return;
    }//end: case 'observationUnits'
    if(associationKey === 'trials') {
      for(let i=0; i<trialsIdsToRemove.current.length; ++i)
      {
        if(trialsIdsToRemove.current[i] === itemId) {
          trialsIdsToRemove.current.splice(i, 1);
          setTrialsIdsToRemoveState(trialsIdsToRemove.current);
          return;
        }
      }
      return;
    }//end: case 'trials'
  }

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

  const handleClickOnTrialRow = (event, item) => {
    setTrialDetailItem(item);
  };

  const handleTrialDetailDialogClose = (event) => {
    delayedCloseTrialDetailPanel(event, 500);
  }

  const delayedCloseTrialDetailPanel = async (event, ms) => {
    await new Promise(resolve => {
      window.setTimeout(function() {
        setTrialDetailDialogOpen(false);
        setTrialDetailItem(undefined);
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
            { t('modelPanels.editing') +  ": Program | programDbId: " + item.programDbId}
          </Typography>
          
          {(!deleted)&&(
            <Tooltip title={ t('modelPanels.save') + " program" }>
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
            <ProgramTabsA
              value={tabsValue}
              handleChange={handleTabsChange}
            />
          </Grid>
          
          <Grid item xs={12}>
            {/* Attributes Page [0] */}
            <ProgramAttributesPage
              hidden={tabsValue !== 0}
              item={item}
              valueOkStates={valueOkStates}
              handleSetValue={handleSetValue}
            />
          </Grid>

          <Grid item xs={12}>
            {/* Associations Page [1] */}
            <ProgramAssociationsPage
              hidden={tabsValue !== 1 || deleted}
              item={item}
              observationUnitsIdsToAdd={observationUnitsIdsToAddState}
              observationUnitsIdsToRemove={observationUnitsIdsToRemoveState}
              trialsIdsToAdd={trialsIdsToAddState}
              trialsIdsToRemove={trialsIdsToRemoveState}
              handleTransferToAdd={handleTransferToAdd}
              handleUntransferFromAdd={handleUntransferFromAdd}
              handleTransferToRemove={handleTransferToRemove}
              handleUntransferFromRemove={handleUntransferFromRemove}
              handleClickOnObservationUnitRow={handleClickOnObservationUnitRow}
              handleClickOnTrialRow={handleClickOnTrialRow}
            />
          </Grid>
        </Grid>

        {/* Confirmation Dialog */}
        <ProgramConfirmationDialog
          open={confirmationOpen}
          title={confirmationTitle}
          text={confirmationText}
          acceptText={confirmationAcceptText}
          rejectText={confirmationRejectText}
          handleAccept={handleConfirmationAccept}
          handleReject={handleConfirmationReject}
        />

        {/* Dialog: ObservationUnit Detail Panel */}
        {(observationUnitDetailDialogOpen) && (
          <ObservationUnitDetailPanel
            permissions={permissions}
            item={observationUnitDetailItem}
            dialog={true}
            handleClose={handleObservationUnitDetailDialogClose}
          />
        )}
        {/* Dialog: Trial Detail Panel */}
        {(trialDetailDialogOpen) && (
          <TrialDetailPanel
            permissions={permissions}
            item={trialDetailItem}
            dialog={true}
            handleClose={handleTrialDetailDialogClose}
          />
        )}
      </div>

    </Dialog>
  );
}
ProgramUpdatePanel.propTypes = {
  permissions: PropTypes.object,
  item: PropTypes.object.isRequired,
  handleClose: PropTypes.func.isRequired,
};
