import React, { useState, useRef, useEffect, useCallback, Suspense, lazy } from 'react';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import Snackbar from '../../../../../../snackbar/Snackbar';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import TaxonTabsA from './components/TaxonTabsA';
import { loadApi } from '../../../../../../../requests/requests.index.js';
import { makeCancelable } from '../../../../../../../utils';
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
//lazy loading
const TaxonAttributesPage = lazy(() => import(/* webpackChunkName: "Update-Attributes-Taxon" */ './components/taxon-attributes-page/TaxonAttributesPage'));
const TaxonAssociationsPage = lazy(() => import(/* webpackChunkName: "Update-Associations-Taxon" */ './components/taxon-associations-page/TaxonAssociationsPage'));
const TaxonConfirmationDialog = lazy(() => import(/* webpackChunkName: "Update-Confirmation-Taxon" */ './components/TaxonConfirmationDialog'));
const EjemplarDetailPanel = lazy(() => import(/* webpackChunkName: "Update-Detail-Ejemplar" */ '../../../ejemplar-table/components/ejemplar-detail-panel/EjemplarDetailPanel'));

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

export default function TaxonUpdatePanel(props) {
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
  
  const [ejemplaresIdsToAddState, setEjemplaresIdsToAddState] = useState([]);
  const ejemplaresIdsToAdd = useRef([]);
  const [ejemplaresIdsToRemoveState, setEjemplaresIdsToRemoveState] = useState([]);
  const ejemplaresIdsToRemove = useRef([]);

  const [ejemplarDetailDialogOpen, setEjemplarDetailDialogOpen] = useState(false);
  const [ejemplarDetailItem, setEjemplarDetailItem] = useState(undefined);

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
      lastModelChanged.Taxon&&
      lastModelChanged.Taxon[String(item.id)]) {

        //updated item
        if(lastModelChanged.Taxon[String(item.id)].op === "update"&&
            lastModelChanged.Taxon[String(item.id)].newItem) {
              //show alert
              setUpdated(true);
        } else {
          //deleted item
          if(lastModelChanged.Taxon[String(item.id)].op === "delete") {
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
    if (ejemplarDetailItem !== undefined) {
      setEjemplarDetailDialogOpen(true);
    }
  }, [ejemplarDetailItem]);

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

    initialValues.id = item.id;
    initialValues.taxon = item.taxon;
    initialValues.categoria = item.categoria;
    initialValues.estatus = item.estatus;
    initialValues.nombreAutoridad = item.nombreAutoridad;
    initialValues.citaNomenclatural = item.citaNomenclatural;
    initialValues.fuente = item.fuente;
    initialValues.ambiente = item.ambiente;
    initialValues.grupoSNIB = item.grupoSNIB;
    initialValues.categoriaResidencia = item.categoriaResidencia;
    initialValues.nom = item.nom;
    initialValues.cites = item.cites;
    initialValues.iucn = item.iucn;
    initialValues.prioritarias = item.prioritarias;
    initialValues.endemismo = item.endemismo;
    initialValues.categoriaSorter = item.categoriaSorter;
    initialValues.bibliografia = item.bibliografia;

    return initialValues;
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

  initialValueOkStates.id = (item.id!==null ? 1 : 0);
  initialValueOkStates.taxon = (item.taxon!==null ? 1 : 0);
  initialValueOkStates.categoria = (item.categoria!==null ? 1 : 0);
  initialValueOkStates.estatus = (item.estatus!==null ? 1 : 0);
  initialValueOkStates.nombreAutoridad = (item.nombreAutoridad!==null ? 1 : 0);
  initialValueOkStates.citaNomenclatural = (item.citaNomenclatural!==null ? 1 : 0);
  initialValueOkStates.fuente = (item.fuente!==null ? 1 : 0);
  initialValueOkStates.ambiente = (item.ambiente!==null ? 1 : 0);
  initialValueOkStates.grupoSNIB = (item.grupoSNIB!==null ? 1 : 0);
  initialValueOkStates.categoriaResidencia = (item.categoriaResidencia!==null ? 1 : 0);
  initialValueOkStates.nom = (item.nom!==null ? 1 : 0);
  initialValueOkStates.cites = (item.cites!==null ? 1 : 0);
  initialValueOkStates.iucn = (item.iucn!==null ? 1 : 0);
  initialValueOkStates.prioritarias = (item.prioritarias!==null ? 1 : 0);
  initialValueOkStates.endemismo = (item.endemismo!==null ? 1 : 0);
  initialValueOkStates.categoriaSorter = (item.categoriaSorter!==null ? 1 : 0);
  initialValueOkStates.bibliografia = (item.bibliografia!==null ? 1 : 0);

    return initialValueOkStates;
  }

  function getInitialValueAjvStates() {
    let _initialValueAjvStates = {};

    _initialValueAjvStates.id = {errors: []};
    _initialValueAjvStates.taxon = {errors: []};
    _initialValueAjvStates.categoria = {errors: []};
    _initialValueAjvStates.estatus = {errors: []};
    _initialValueAjvStates.nombreAutoridad = {errors: []};
    _initialValueAjvStates.citaNomenclatural = {errors: []};
    _initialValueAjvStates.fuente = {errors: []};
    _initialValueAjvStates.ambiente = {errors: []};
    _initialValueAjvStates.grupoSNIB = {errors: []};
    _initialValueAjvStates.categoriaResidencia = {errors: []};
    _initialValueAjvStates.nom = {errors: []};
    _initialValueAjvStates.cites = {errors: []};
    _initialValueAjvStates.iucn = {errors: []};
    _initialValueAjvStates.prioritarias = {errors: []};
    _initialValueAjvStates.endemismo = {errors: []};
    _initialValueAjvStates.categoriaSorter = {errors: []};
    _initialValueAjvStates.bibliografia = {errors: []};

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
    if(values.current.id !== item.id) { return true;}
    if(values.current.taxon !== item.taxon) { return true;}
    if(values.current.categoria !== item.categoria) { return true;}
    if(values.current.estatus !== item.estatus) { return true;}
    if(values.current.nombreAutoridad !== item.nombreAutoridad) { return true;}
    if(values.current.citaNomenclatural !== item.citaNomenclatural) { return true;}
    if(values.current.fuente !== item.fuente) { return true;}
    if(values.current.ambiente !== item.ambiente) { return true;}
    if(values.current.grupoSNIB !== item.grupoSNIB) { return true;}
    if(values.current.categoriaResidencia !== item.categoriaResidencia) { return true;}
    if(values.current.nom !== item.nom) { return true;}
    if(values.current.cites !== item.cites) { return true;}
    if(values.current.iucn !== item.iucn) { return true;}
    if(values.current.prioritarias !== item.prioritarias) { return true;}
    if(values.current.endemismo !== item.endemismo) { return true;}
    if(values.current.categoriaSorter !== item.categoriaSorter) { return true;}
    if(values.current.bibliografia !== item.bibliografia) { return true;}
    return false;
  }


  function setAddRemoveManyEjemplares(variables) {
    //data to notify changes
    if(!changedAssociations.current.Taxon_ejemplares) changedAssociations.current.Taxon_ejemplares = {};

    /**
     * Case: The toAdd list isn't empty.
     */
    if(ejemplaresIdsToAdd.current.length>0) {
      //set ids to add
      variables.addEjemplares = [ ...ejemplaresIdsToAdd.current];
      //changes to nofity
      changedAssociations.current.Taxon_ejemplares.added = true;
      if(changedAssociations.current.Taxon_ejemplares.idsAdded){
        ejemplaresIdsToAdd.current.forEach((it) => {if(!changedAssociations.current.Taxon_ejemplares.idsAdded.includes(it)) changedAssociations.current.Taxon_ejemplares.idsAdded.push(it);});
      } else {
        changedAssociations.current.Taxon_ejemplares.idsAdded = [...ejemplaresIdsToAdd.current];
      }
    }
    /**
     * Case: The toRemove list isn't empty.
     */
    if(ejemplaresIdsToRemove.current.length>0) {
      //set ids to remove
      variables.removeEjemplares = [ ...ejemplaresIdsToRemove.current];
      //changes to nofity
      changedAssociations.current.Taxon_ejemplares.removed = true;
      if(changedAssociations.current.Taxon_ejemplares.idsRemoved){
        ejemplaresIdsToRemove.current.forEach((it) => {if(!changedAssociations.current.Taxon_ejemplares.idsRemoved.includes(it)) changedAssociations.current.Taxon_ejemplares.idsRemoved.push(it);});
      } else {
        changedAssociations.current.Taxon_ejemplares.idsRemoved = [...ejemplaresIdsToRemove.current];
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
    

    //add & remove: to_one's

    //add & remove: to_many's
    setAddRemoveManyEjemplares(variables);

    /*
      API Request: api.taxon.updateItem
    */
    let api = await loadApi("taxon");
    let cancelableApiReq = makeCancelable(api.taxon.updateItem(graphqlServerUrl, variables));
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
            newError.locations=[{model: 'Taxon', method: 'doSave()', request: 'api.taxon.updateItem'}];
            newError.path=['Taxons', `id:${item.id}`, 'update'];
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
          newError.locations=[{model: 'Taxon', method: 'doSave()', request: 'api.taxon.updateItem'}];
          newError.path=['Taxons', `id:${item.id}`, 'update'];
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
      .catch((err) => { //error: on api.taxon.updateItem
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
          newError.locations=[{model: 'Taxon', method: 'doSave()', request: 'api.taxon.updateItem'}];
          newError.path=['Taxons', `id:${item.id}`, 'update'];
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
      case 'ejemplares':
        ejemplaresIdsToAdd.current.push(itemId);
        setEjemplaresIdsToAddState([...ejemplaresIdsToAdd.current]);
        break;

      default:
        break;
    }
  }

  const handleUntransferFromAdd =(associationKey, itemId) => {
    if(associationKey === 'ejemplares') {
      for(let i=0; i<ejemplaresIdsToAdd.current.length; ++i)
      {
        if(ejemplaresIdsToAdd.current[i] === itemId) {
          ejemplaresIdsToAdd.current.splice(i, 1);
          setEjemplaresIdsToAddState([...ejemplaresIdsToAdd.current]);
          return;
        }
      }
      return;
    }//end: case 'ejemplares'
  }

  const handleTransferToRemove = (associationKey, itemId) => {
    switch(associationKey) {
        case 'ejemplares':
  
        ejemplaresIdsToRemove.current.push(itemId);
        setEjemplaresIdsToRemoveState([...ejemplaresIdsToRemove.current]);
        break;

      default:
        break;
    }
  }

  const handleUntransferFromRemove =(associationKey, itemId) => {
    if(associationKey === 'ejemplares') {
      for(let i=0; i<ejemplaresIdsToRemove.current.length; ++i)
      {
        if(ejemplaresIdsToRemove.current[i] === itemId) {
          ejemplaresIdsToRemove.current.splice(i, 1);
          setEjemplaresIdsToRemoveState([...ejemplaresIdsToRemove.current]);
          return;
        }
      }
      return;
    }//end: case 'ejemplares'
  }

  const handleClickOnEjemplarRow = (event, item) => {
    setEjemplarDetailItem(item);
  };

  const handleEjemplarDetailDialogClose = (event) => {
    delayedCloseEjemplarDetailPanel(event, 500);
  }

  const delayedCloseEjemplarDetailPanel = async (event, ms) => {
    await new Promise(resolve => {
      window.setTimeout(function() {
        setEjemplarDetailDialogOpen(false);
        setEjemplarDetailItem(undefined);
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
    <Dialog id='TaxonUpdatePanel-dialog' 
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
              id='TaxonUpdatePanel-button-cancel'
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
            { t('modelPanels.editing') +  ": Taxon | id: " + item.id}
          </Typography>
          
          {(!deleted)&&(
            <Tooltip title={ t('modelPanels.save') + " taxon" }>
              <Fab
                id='TaxonUpdatePanel-fabButton-save' 
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
            <TaxonTabsA
              value={tabsValue}
              handleChange={handleTabsChange}
            />
          </Grid>
          
          <Grid item xs={12}>
            {/* Attributes Page [0] */}
            <Suspense fallback={<div />}>
              <TaxonAttributesPage
                hidden={tabsValue !== 0}
                item={item}
                valueOkStates={valueOkStates}
                valueAjvStates={valueAjvStates}
                handleSetValue={handleSetValue}
              />
            </Suspense>
          </Grid>

          {/*
            * Conditional rendering:
            * Associations Page [1] 
            */}
          {(tabsValue === 1 && !deleted) && (
            <Grid item xs={12}>
              {/* Associations Page [1] */}
              <Suspense fallback={<div />}>
                <TaxonAssociationsPage
                  hidden={tabsValue !== 1 || deleted}
                  item={item}
                  ejemplaresIdsToAdd={ejemplaresIdsToAddState}
                  ejemplaresIdsToRemove={ejemplaresIdsToRemoveState}
                  handleTransferToAdd={handleTransferToAdd}
                  handleUntransferFromAdd={handleUntransferFromAdd}
                  handleTransferToRemove={handleTransferToRemove}
                  handleUntransferFromRemove={handleUntransferFromRemove}
                  handleClickOnEjemplarRow={handleClickOnEjemplarRow}
                />
              </Suspense>
            </Grid>
          )}
        </Grid>

        {/* Confirmation Dialog */}
        <Suspense fallback={<div />}>
          <TaxonConfirmationDialog
            open={confirmationOpen}
            title={confirmationTitle}
            text={confirmationText}
            acceptText={confirmationAcceptText}
            rejectText={confirmationRejectText}
            handleAccept={handleConfirmationAccept}
            handleReject={handleConfirmationReject}
          />
        </Suspense>

        {/* Dialog: Ejemplar Detail Panel */}
        {(ejemplarDetailDialogOpen) && (
          <Suspense fallback={<div />}>
            <EjemplarDetailPanel
              permissions={permissions}
              item={ejemplarDetailItem}
              dialog={true}
              handleClose={handleEjemplarDetailDialogClose}
            />
          </Suspense>
        )}
      </div>

    </Dialog>
  );
}
TaxonUpdatePanel.propTypes = {
  permissions: PropTypes.object,
  item: PropTypes.object.isRequired,
  handleClose: PropTypes.func.isRequired,
};