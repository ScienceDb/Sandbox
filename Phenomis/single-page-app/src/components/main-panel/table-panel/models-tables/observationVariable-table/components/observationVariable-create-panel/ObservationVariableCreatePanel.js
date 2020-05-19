import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import ObservationVariableAttributesPage from './components/observationVariable-attributes-page/ObservationVariableAttributesPage'
import ObservationVariableAssociationsPage from './components/observationVariable-associations-page/ObservationVariableAssociationsPage'
import ObservationVariableTabsA from './components/ObservationVariableTabsA'
import ObservationVariableConfirmationDialog from './components/ObservationVariableConfirmationDialog'
import MethodDetailPanel from '../../../method-table/components/method-detail-panel/MethodDetailPanel'
import ObservationDetailPanel from '../../../observation-table/components/observation-detail-panel/ObservationDetailPanel'
import OntologyReferenceDetailPanel from '../../../ontologyReference-table/components/ontologyReference-detail-panel/OntologyReferenceDetailPanel'
import ScaleDetailPanel from '../../../scale-table/components/scale-detail-panel/ScaleDetailPanel'
import TraitDetailPanel from '../../../trait-table/components/trait-detail-panel/TraitDetailPanel'
import api from '../../../../../../../requests/requests.index.js'
import { makeCancelable } from '../../../../../../../utils'
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import SaveIcon from '@material-ui/icons/Save';

const debounceTimeout = 700;

const useStyles = makeStyles(theme => ({
  root: {
    minWidth: 450,
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
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

export default function ObservationVariableCreatePanel(props) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const {
    permissions,
    handleClose,
  } = props;

  const [open, setOpen] = useState(true);
  const [tabsValue, setTabsValue] = useState(0);
  const [valueOkStates, setValueOkStates] = useState(getInitialValueOkStates());
  const [foreignKeys, setForeignKeys] = useState({});

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationTitle, setConfirmationTitle] = useState('');
  const [confirmationText, setConfirmationText] = useState('');
  const [confirmationAcceptText, setConfirmationAcceptText] = useState('');
  const [confirmationRejectText, setConfirmationRejectText] = useState('');

  const handleAccept = useRef(undefined);
  const handleReject = useRef(undefined);

  const values = useRef(getInitialValues());
  const valuesOkRefs = useRef(getInitialValueOkStates());

  const [methodIdsToAddState, setMethodIdsToAddState] = useState([]);
  const methodIdsToAdd = useRef([]);
  const [observationsIdsToAddState, setObservationsIdsToAddState] = useState([]);
  const observationsIdsToAdd = useRef([]);
  const [ontologyReferenceIdsToAddState, setOntologyReferenceIdsToAddState] = useState([]);
  const ontologyReferenceIdsToAdd = useRef([]);
  const [scaleIdsToAddState, setScaleIdsToAddState] = useState([]);
  const scaleIdsToAdd = useRef([]);
  const [traitIdsToAddState, setTraitIdsToAddState] = useState([]);
  const traitIdsToAdd = useRef([]);

  const [methodDetailDialogOpen, setMethodDetailDialogOpen] = useState(false);
  const [methodDetailItem, setMethodDetailItem] = useState(undefined);
  const [observationDetailDialogOpen, setObservationDetailDialogOpen] = useState(false);
  const [observationDetailItem, setObservationDetailItem] = useState(undefined);
  const [ontologyReferenceDetailDialogOpen, setOntologyReferenceDetailDialogOpen] = useState(false);
  const [ontologyReferenceDetailItem, setOntologyReferenceDetailItem] = useState(undefined);
  const [scaleDetailDialogOpen, setScaleDetailDialogOpen] = useState(false);
  const [scaleDetailItem, setScaleDetailItem] = useState(undefined);
  const [traitDetailDialogOpen, setTraitDetailDialogOpen] = useState(false);
  const [traitDetailItem, setTraitDetailItem] = useState(undefined);

  //debouncing & event contention
  const cancelablePromises = useRef([]);
  const isSaving = useRef(false);
  const isCanceling = useRef(false);
  const isClosing = useRef(false);
  const isDebouncingTabsChange = useRef(false);
  const currentTabValue = useRef(tabsValue);
  const lastTabValue = useRef(tabsValue);

  const graphqlServerUrl = useSelector(state => state.urls.graphqlServerUrl);

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
    if (methodDetailItem !== undefined) {
      setMethodDetailDialogOpen(true);
    }
  }, [methodDetailItem]);

  useEffect(() => {
    if (observationDetailItem !== undefined) {
      setObservationDetailDialogOpen(true);
    }
  }, [observationDetailItem]);

  useEffect(() => {
    if (ontologyReferenceDetailItem !== undefined) {
      setOntologyReferenceDetailDialogOpen(true);
    }
  }, [ontologyReferenceDetailItem]);

  useEffect(() => {
    if (scaleDetailItem !== undefined) {
      setScaleDetailDialogOpen(true);
    }
  }, [scaleDetailItem]);

  useEffect(() => {
    if (traitDetailItem !== undefined) {
      setTraitDetailDialogOpen(true);
    }
  }, [traitDetailItem]);


  function getInitialValues() {
    let initialValues = {};
    
    initialValues.commonCropName = null;
    initialValues.defaultValue = null;
    initialValues.documentationURL = null;
    initialValues.growthStage = null;
    initialValues.institution = null;
    initialValues.language = null;
    initialValues.scientist = null;
    initialValues.status = null;
    initialValues.submissionTimestamp = null;
    initialValues.xref = null;
    initialValues.observationVariableDbId = null;
    initialValues.observationVariableName = null;
    initialValues.methodDbId = null;
    initialValues.scaleDbId = null;
    initialValues.traitDbId = null;
    initialValues.ontologyDbId = null;

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

    initialValueOkStates.commonCropName = 0;
    initialValueOkStates.defaultValue = 0;
    initialValueOkStates.documentationURL = 0;
    initialValueOkStates.growthStage = 0;
    initialValueOkStates.institution = 0;
    initialValueOkStates.language = 0;
    initialValueOkStates.scientist = 0;
    initialValueOkStates.status = 0;
    initialValueOkStates.submissionTimestamp = 0;
    initialValueOkStates.xref = 0;
    initialValueOkStates.observationVariableDbId = 0;
    initialValueOkStates.observationVariableName = 0;
    initialValueOkStates.methodDbId = -2; //FK
    initialValueOkStates.scaleDbId = -2; //FK
    initialValueOkStates.traitDbId = -2; //FK
    initialValueOkStates.ontologyDbId = -2; //FK

    return initialValueOkStates;
  }

  function areThereAcceptableFields() {
    let a = Object.entries(valueOkStates);
    for(let i=0; i<a.length; ++i) {
      if(a[i][1] === 1) {
        return true;
      }
    }
    return false;
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

  function setAddMethod(variables) {
    if(methodIdsToAdd.current.length>0) {
      //set the new id on toAdd property
      variables.addMethod = methodIdsToAdd.current[0];
    } else {
      //do nothing
    }
  }
  function setAddOntologyReference(variables) {
    if(ontologyReferenceIdsToAdd.current.length>0) {
      //set the new id on toAdd property
      variables.addOntologyReference = ontologyReferenceIdsToAdd.current[0];
    } else {
      //do nothing
    }
  }
  function setAddScale(variables) {
    if(scaleIdsToAdd.current.length>0) {
      //set the new id on toAdd property
      variables.addScale = scaleIdsToAdd.current[0];
    } else {
      //do nothing
    }
  }
  function setAddTrait(variables) {
    if(traitIdsToAdd.current.length>0) {
      //set the new id on toAdd property
      variables.addTrait = traitIdsToAdd.current[0];
    } else {
      //do nothing
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
    delete variables.methodDbId;
    delete variables.scaleDbId;
    delete variables.traitDbId;
    delete variables.ontologyDbId;

    //add: to_one's
    setAddMethod(variables);
    setAddOntologyReference(variables);
    setAddScale(variables);
    setAddTrait(variables);
    
    //add: to_many's
    variables.addObservations = observationsIdsToAdd.current;

    /*
      API Request: createItem
    */
    let cancelableApiReq = makeCancelable(api.observationVariable.createItem(graphqlServerUrl, variables));
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
            enqueueSnackbar( t('modelPanels.messages.msg6', "Record created successfully."), {
              variant: 'success',
              preventDuplicate: false,
              persist: false,
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left',
              },
            });
            onClose(event, true, response.data.data.addObservationVariable);
          }
          return;

        } else { //error: bad response on createItem()
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
      .catch(({isCanceled, ...err}) => { //error: on createItem()
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
    if(areThereAcceptableFields()) {
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
    handleClose(event, status, newItem);
  }

  const handleConfirmationAccept = (event) => {
    handleAccept.current();
  }

  const handleConfirmationReject = (event) => {
    handleReject.current();
  }
  
  const handleTransferToAdd = (associationKey, itemId) => {
    switch(associationKey) {
      case 'method':
        if(methodIdsToAdd.current.indexOf(itemId) === -1) {
          methodIdsToAdd.current = [];
          methodIdsToAdd.current.push(itemId);
          setMethodIdsToAddState(methodIdsToAdd.current);
          handleSetValue(itemId, 1, 'methodDbId');
          setForeignKeys({...foreignKeys, methodDbId: itemId});
        }
        break;
      case 'observations':
        if(observationsIdsToAdd.current.indexOf(itemId) === -1) {
          observationsIdsToAdd.current.push(itemId);
          setObservationsIdsToAddState(observationsIdsToAdd.current);
        }
        break;
      case 'ontologyReference':
        if(ontologyReferenceIdsToAdd.current.indexOf(itemId) === -1) {
          ontologyReferenceIdsToAdd.current = [];
          ontologyReferenceIdsToAdd.current.push(itemId);
          setOntologyReferenceIdsToAddState(ontologyReferenceIdsToAdd.current);
          handleSetValue(itemId, 1, 'ontologyDbId');
          setForeignKeys({...foreignKeys, ontologyDbId: itemId});
        }
        break;
      case 'scale':
        if(scaleIdsToAdd.current.indexOf(itemId) === -1) {
          scaleIdsToAdd.current = [];
          scaleIdsToAdd.current.push(itemId);
          setScaleIdsToAddState(scaleIdsToAdd.current);
          handleSetValue(itemId, 1, 'scaleDbId');
          setForeignKeys({...foreignKeys, scaleDbId: itemId});
        }
        break;
      case 'trait':
        if(traitIdsToAdd.current.indexOf(itemId) === -1) {
          traitIdsToAdd.current = [];
          traitIdsToAdd.current.push(itemId);
          setTraitIdsToAddState(traitIdsToAdd.current);
          handleSetValue(itemId, 1, 'traitDbId');
          setForeignKeys({...foreignKeys, traitDbId: itemId});
        }
        break;

      default:
        break;
    }
  }

  const handleUntransferFromAdd =(associationKey, itemId) => {
    if(associationKey === 'method') {
      if(methodIdsToAdd.current.length > 0) {
        methodIdsToAdd.current = [];
        setMethodIdsToAddState([]);
        handleSetValue(null, 0, 'methodDbId');
        setForeignKeys({...foreignKeys, methodDbId: null});
      }
      return;
    }//end: case 'method'
    if(associationKey === 'observations') {
      let iof = observationsIdsToAdd.current.indexOf(itemId);
      if(iof !== -1) {
        observationsIdsToAdd.current.splice(iof, 1);
      }
      return;
    }//end: case 'observations'
    if(associationKey === 'ontologyReference') {
      if(ontologyReferenceIdsToAdd.current.length > 0) {
        ontologyReferenceIdsToAdd.current = [];
        setOntologyReferenceIdsToAddState([]);
        handleSetValue(null, 0, 'ontologyDbId');
        setForeignKeys({...foreignKeys, ontologyDbId: null});
      }
      return;
    }//end: case 'ontologyReference'
    if(associationKey === 'scale') {
      if(scaleIdsToAdd.current.length > 0) {
        scaleIdsToAdd.current = [];
        setScaleIdsToAddState([]);
        handleSetValue(null, 0, 'scaleDbId');
        setForeignKeys({...foreignKeys, scaleDbId: null});
      }
      return;
    }//end: case 'scale'
    if(associationKey === 'trait') {
      if(traitIdsToAdd.current.length > 0) {
        traitIdsToAdd.current = [];
        setTraitIdsToAddState([]);
        handleSetValue(null, 0, 'traitDbId');
        setForeignKeys({...foreignKeys, traitDbId: null});
      }
      return;
    }//end: case 'trait'
  }

  const handleClickOnMethodRow = (event, item) => {
    setMethodDetailItem(item);
  };

  const handleMethodDetailDialogClose = (event) => {
    delayedCloseMethodDetailPanel(event, 500);
  }

  const delayedCloseMethodDetailPanel = async (event, ms) => {
    await new Promise(resolve => {
      window.setTimeout(function() {
        setMethodDetailDialogOpen(false);
        setMethodDetailItem(undefined);
        resolve("ok");
      }, ms);
    });
  };
  const handleClickOnObservationRow = (event, item) => {
    setObservationDetailItem(item);
  };

  const handleObservationDetailDialogClose = (event) => {
    delayedCloseObservationDetailPanel(event, 500);
  }

  const delayedCloseObservationDetailPanel = async (event, ms) => {
    await new Promise(resolve => {
      window.setTimeout(function() {
        setObservationDetailDialogOpen(false);
        setObservationDetailItem(undefined);
        resolve("ok");
      }, ms);
    });
  };
  const handleClickOnOntologyReferenceRow = (event, item) => {
    setOntologyReferenceDetailItem(item);
  };

  const handleOntologyReferenceDetailDialogClose = (event) => {
    delayedCloseOntologyReferenceDetailPanel(event, 500);
  }

  const delayedCloseOntologyReferenceDetailPanel = async (event, ms) => {
    await new Promise(resolve => {
      window.setTimeout(function() {
        setOntologyReferenceDetailDialogOpen(false);
        setOntologyReferenceDetailItem(undefined);
        resolve("ok");
      }, ms);
    });
  };
  const handleClickOnScaleRow = (event, item) => {
    setScaleDetailItem(item);
  };

  const handleScaleDetailDialogClose = (event) => {
    delayedCloseScaleDetailPanel(event, 500);
  }

  const delayedCloseScaleDetailPanel = async (event, ms) => {
    await new Promise(resolve => {
      window.setTimeout(function() {
        setScaleDetailDialogOpen(false);
        setScaleDetailItem(undefined);
        resolve("ok");
      }, ms);
    });
  };
  const handleClickOnTraitRow = (event, item) => {
    setTraitDetailItem(item);
  };

  const handleTraitDetailDialogClose = (event) => {
    delayedCloseTraitDetailPanel(event, 500);
  }

  const delayedCloseTraitDetailPanel = async (event, ms) => {
    await new Promise(resolve => {
      window.setTimeout(function() {
        setTraitDetailDialogOpen(false);
        setTraitDetailItem(undefined);
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
      <CssBaseline />
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
            {t('modelPanels.new') + ' ObservationVariable'}
          </Typography>
          <Tooltip title={ t('modelPanels.save') + " observationVariable" }>
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
        </Toolbar>
      </AppBar>
      <Toolbar />

      <div className={classes.root}>
        <Grid container justify='center' alignItems='flex-start' alignContent='flex-start'>
          <Grid item xs={12}>  
            {/* TabsA: Menú */}
            <div className={classes.tabsA}>
              <ObservationVariableTabsA
                value={tabsValue}
                handleChange={handleTabsChange}
              />
            </div>
          </Grid>

          <Grid item xs={12}>
            {/* Attributes Page [0] */}
            <ObservationVariableAttributesPage
              hidden={tabsValue !== 0}
              valueOkStates={valueOkStates}
              foreignKeys = {foreignKeys}
              handleSetValue={handleSetValue}
            />
          </Grid>

          <Grid item xs={12}>
            {/* Associations Page [1] */}
            <ObservationVariableAssociationsPage
              hidden={tabsValue !== 1}
              methodIdsToAdd={methodIdsToAddState}
              observationsIdsToAdd={observationsIdsToAddState}
              ontologyReferenceIdsToAdd={ontologyReferenceIdsToAddState}
              scaleIdsToAdd={scaleIdsToAddState}
              traitIdsToAdd={traitIdsToAddState}
              handleTransferToAdd={handleTransferToAdd}
              handleUntransferFromAdd={handleUntransferFromAdd}
              handleClickOnMethodRow={handleClickOnMethodRow}
              handleClickOnObservationRow={handleClickOnObservationRow}
              handleClickOnOntologyReferenceRow={handleClickOnOntologyReferenceRow}
              handleClickOnScaleRow={handleClickOnScaleRow}
              handleClickOnTraitRow={handleClickOnTraitRow}
            />
          </Grid>
        </Grid>

        {/* Confirmation Dialog */}
        <ObservationVariableConfirmationDialog
          open={confirmationOpen}
          title={confirmationTitle}
          text={confirmationText}
          acceptText={confirmationAcceptText}
          rejectText={confirmationRejectText}
          handleAccept={handleConfirmationAccept}
          handleReject={handleConfirmationReject}
        />

        {/* Dialog: Method Detail Panel */}
        {(methodDetailDialogOpen) && (
          <MethodDetailPanel
            permissions={permissions}
            item={methodDetailItem}
            dialog={true}
            handleClose={handleMethodDetailDialogClose}
          />
        )}
        {/* Dialog: Observation Detail Panel */}
        {(observationDetailDialogOpen) && (
          <ObservationDetailPanel
            permissions={permissions}
            item={observationDetailItem}
            dialog={true}
            handleClose={handleObservationDetailDialogClose}
          />
        )}
        {/* Dialog: OntologyReference Detail Panel */}
        {(ontologyReferenceDetailDialogOpen) && (
          <OntologyReferenceDetailPanel
            permissions={permissions}
            item={ontologyReferenceDetailItem}
            dialog={true}
            handleClose={handleOntologyReferenceDetailDialogClose}
          />
        )}
        {/* Dialog: Scale Detail Panel */}
        {(scaleDetailDialogOpen) && (
          <ScaleDetailPanel
            permissions={permissions}
            item={scaleDetailItem}
            dialog={true}
            handleClose={handleScaleDetailDialogClose}
          />
        )}
        {/* Dialog: Trait Detail Panel */}
        {(traitDetailDialogOpen) && (
          <TraitDetailPanel
            permissions={permissions}
            item={traitDetailItem}
            dialog={true}
            handleClose={handleTraitDetailDialogClose}
          />
        )}
      </div>

    </Dialog>
  );
}
ObservationVariableCreatePanel.propTypes = {
  permissions: PropTypes.object,
  handleClose: PropTypes.func.isRequired,
};