import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import Snackbar from '../../../../../../snackbar/Snackbar';
import GrupoEnfoqueAttributesPage from './components/grupo_enfoque-attributes-page/Grupo_enfoqueAttributesPage'
import GrupoEnfoqueAssociationsPage from './components/grupo_enfoque-associations-page/Grupo_enfoqueAssociationsPage'
import GrupoEnfoqueTabsA from './components/Grupo_enfoqueTabsA'
import GrupoEnfoqueConfirmationDialog from './components/Grupo_enfoqueConfirmationDialog'
import CuadranteDetailPanel from '../../../cuadrante-table/components/cuadrante-detail-panel/CuadranteDetailPanel'
import SitioDetailPanel from '../../../sitio-table/components/sitio-detail-panel/SitioDetailPanel'
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
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function GrupoEnfoqueCreatePanel(props) {
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
  const [valueAjvStates, setValueAjvStates] = useState(getInitialValueAjvStates());
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
  const valuesAjvRefs = useRef(getInitialValueAjvStates());

  const [cuadrantesIdsToAddState, setCuadrantesIdsToAddState] = useState([]);
  const cuadrantesIdsToAdd = useRef([]);
  const [sitioIdsToAddState, setSitioIdsToAddState] = useState([]);
  const sitioIdsToAdd = useRef([]);

  const [cuadranteDetailDialogOpen, setCuadranteDetailDialogOpen] = useState(false);
  const [cuadranteDetailItem, setCuadranteDetailItem] = useState(undefined);
  const [sitioDetailDialogOpen, setSitioDetailDialogOpen] = useState(false);
  const [sitioDetailItem, setSitioDetailItem] = useState(undefined);

  //debouncing & event contention
  const cancelablePromises = useRef([]);
  const isSaving = useRef(false);
  const isCanceling = useRef(false);
  const isClosing = useRef(false);
  const isDebouncingTabsChange = useRef(false);
  const currentTabValue = useRef(tabsValue);
  const lastTabValue = useRef(tabsValue);

  const graphqlServerUrl = useSelector(state => state.urls.graphqlServerUrl);

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
    if (cuadranteDetailItem !== undefined) {
      setCuadranteDetailDialogOpen(true);
    }
  }, [cuadranteDetailItem]);

  useEffect(() => {
    if (sitioDetailItem !== undefined) {
      setSitioDetailDialogOpen(true);
    }
  }, [sitioDetailItem]);


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
    
    initialValues.grupo_id = null;
    initialValues.tipo_grupo = null;
    initialValues.numero_participantes = null;
    initialValues.fecha = null;
    initialValues.lista_especies = null;
    initialValues.foto_produccion = null;
    initialValues.foto_autoconsumo = null;
    initialValues.foto_venta = null;
    initialValues.foto_compra = null;
    initialValues.observaciones = null;
    initialValues.justificacion_produccion_cuadrante1 = null;
    initialValues.justificacion_produccion_cuadrante2 = null;
    initialValues.justificacion_produccion_cuadrante3 = null;
    initialValues.justificacion_produccion_cuadrante4 = null;
    initialValues.sitio_id = null;

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

    initialValueOkStates.grupo_id = 0;
    initialValueOkStates.tipo_grupo = 0;
    initialValueOkStates.numero_participantes = 0;
    initialValueOkStates.fecha = 0;
    initialValueOkStates.lista_especies = 0;
    initialValueOkStates.foto_produccion = 0;
    initialValueOkStates.foto_autoconsumo = 0;
    initialValueOkStates.foto_venta = 0;
    initialValueOkStates.foto_compra = 0;
    initialValueOkStates.observaciones = 0;
    initialValueOkStates.justificacion_produccion_cuadrante1 = 0;
    initialValueOkStates.justificacion_produccion_cuadrante2 = 0;
    initialValueOkStates.justificacion_produccion_cuadrante3 = 0;
    initialValueOkStates.justificacion_produccion_cuadrante4 = 0;
    initialValueOkStates.sitio_id = -2; //FK

    return initialValueOkStates;
  }

  function getInitialValueAjvStates() {
    let _initialValueAjvStates = {};

    _initialValueAjvStates.grupo_id = {errors: []};
    _initialValueAjvStates.tipo_grupo = {errors: []};
    _initialValueAjvStates.numero_participantes = {errors: []};
    _initialValueAjvStates.fecha = {errors: []};
    _initialValueAjvStates.lista_especies = {errors: []};
    _initialValueAjvStates.foto_produccion = {errors: []};
    _initialValueAjvStates.foto_autoconsumo = {errors: []};
    _initialValueAjvStates.foto_venta = {errors: []};
    _initialValueAjvStates.foto_compra = {errors: []};
    _initialValueAjvStates.observaciones = {errors: []};
    _initialValueAjvStates.justificacion_produccion_cuadrante1 = {errors: []};
    _initialValueAjvStates.justificacion_produccion_cuadrante2 = {errors: []};
    _initialValueAjvStates.justificacion_produccion_cuadrante3 = {errors: []};
    _initialValueAjvStates.justificacion_produccion_cuadrante4 = {errors: []};
    _initialValueAjvStates.sitio_id = {errors: []}; //FK

    return _initialValueAjvStates;
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

  function setAddSitio(variables) {
    if(sitioIdsToAdd.current.length>0) {
      //set the new id on toAdd property
      variables.addSitio = sitioIdsToAdd.current[0];
    } else {
      //do nothing
    }
  }

  function setAjvErrors(err) {
    //check
    if(err&&err.response&&err.response.data&&Array.isArray(err.response.data.errors)) {
      let errors = err.response.data.errors;
      
      //for each error
      for(let i=0; i<errors.length; ++i) {
        let e=errors[i];
        //check
        if(e && typeof e === 'object' && Array.isArray(e.details)){
          let details = e.details;
          
          for(let d=0; d<details.length; ++d) {
            let detail = details[d];

            //check
            if(detail && typeof detail === 'object' && detail.dataPath && detail.message) {
              /**
               * In this point, the error is considered as an AJV error.
               * 
               * It will be set in a ajvStatus reference and at the end of this function 
               * the ajvStatus state will be updated.
               */
              //set reference
              addAjvErrorToField(detail);
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
    * Add new @item using GrahpQL Server mutation.
    * Uses current state properties to fill query request.
    * Updates state to inform new @item added.
    * 
    */
  function doSave(event) {
    errors.current = [];

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
    delete variables.sitio_id;

    //add: to_one's
    setAddSitio(variables);
    
    //add: to_many's
    variables.addCuadrantes = cuadrantesIdsToAdd.current;

    /*
      API Request: addGrupo_enfoque
    */
    let cancelableApiReq = makeCancelable(api.grupo_enfoque.createItem(graphqlServerUrl, variables));
    cancelablePromises.current.push(cancelableApiReq);
    cancelableApiReq
      .promise
      .then(
      //resolved
      (response) => {
        //delete from cancelables
        cancelablePromises.current.splice(cancelablePromises.current.indexOf(cancelableApiReq), 1);
        
        //check: response data
        if(!response.data ||!response.data.data) {
          let newError = {};
          let withDetails=true;
          variant.current='error';
          newError.message = t('modelPanels.errors.data.e1', 'No data was received from the server.');
          newError.locations=[{model: 'grupo_enfoque', query: 'addGrupo_enfoque', method: 'doSave()', request: 'api.grupo_enfoque.createItem'}];
          newError.path=['Grupo_enfoques', 'add'];
          newError.extensions = {graphqlResponse:{data:response.data.data, errors:response.data.errors}};
          errors.current.push(newError);
          console.log("Error: ", newError);

          showMessage(newError.message, withDetails);
          clearRequestDoSave();
          return;
        }

        //check: addGrupo_enfoque
        let addGrupo_enfoque = response.data.data.addGrupo_enfoque;
        if(addGrupo_enfoque === null) {
          let newError = {};
          let withDetails=true;
          variant.current='error';
          newError.message = 'addGrupo_enfoque ' + t('modelPanels.errors.data.e5', 'could not be completed.');
          newError.locations=[{model: 'grupo_enfoque', query: 'addGrupo_enfoque', method: 'doSave()', request: 'api.grupo_enfoque.createItem'}];
          newError.path=['Grupo_enfoques', 'add'];
          newError.extensions = {graphqlResponse:{data:response.data.data, errors:response.data.errors}};
          errors.current.push(newError);
          console.log("Error: ", newError);

          showMessage(newError.message, withDetails);
          clearRequestDoSave();
          return;
        }

        //check: addGrupo_enfoque type
        if(typeof addGrupo_enfoque !== 'object') {
          let newError = {};
          let withDetails=true;
          variant.current='error';
          newError.message = 'grupo_enfoque ' + t('modelPanels.errors.data.e4', ' received, does not have the expected format.');
          newError.locations=[{model: 'grupo_enfoque', query: 'addGrupo_enfoque', method: 'doSave()', request: 'api.grupo_enfoque.createItem'}];
          newError.path=['Grupo_enfoques', 'add'];
          newError.extensions = {graphqlResponse:{data:response.data.data, errors:response.data.errors}};
          errors.current.push(newError);
          console.log("Error: ", newError);

          showMessage(newError.message, withDetails);
          clearRequestDoSave();
          return;
        }

        //check: graphql errors
        if(response.data.errors) {
          let newError = {};
          let withDetails=true;
          variant.current='info';
          newError.message = 'addGrupo_enfoque ' + t('modelPanels.errors.data.e6', 'completed with errors.');
          newError.locations=[{model: 'grupo_enfoque', query: 'addGrupo_enfoque', method: 'doSave()', request: 'api.grupo_enfoque.createItem'}];
          newError.path=['Grupo_enfoques', 'add'];
          newError.extensions = {graphQL:{data:response.data.data, errors:response.data.errors}};
          errors.current.push(newError);
          console.log("Error: ", newError);

          showMessage(newError.message, withDetails);
        }

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
        onClose(event, true, addGrupo_enfoque);
        return;
      },
      //rejected
      (err) => {
        throw err;
      })
      //error
      .catch((err) => { //error: on api.grupo_enfoque.createItem
        if(err.isCanceled) {
          return
        } else {
          //set ajv errors
          setAjvErrors(err);

          //show error
          let newError = {};
          let withDetails=true;
          variant.current='error';
          newError.message = t('modelPanels.errors.request.e1', 'Error in request made to server.');
          newError.locations=[{model: 'grupo_enfoque', query: 'addGrupo_enfoque', method: 'doSave()', request: 'api.grupo_enfoque.createItem'}];
          newError.path=['Grupo_enfoques', 'add'];
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
      case 'cuadrantes':
        if(cuadrantesIdsToAdd.current.indexOf(itemId) === -1) {
          cuadrantesIdsToAdd.current.push(itemId);
          setCuadrantesIdsToAddState(cuadrantesIdsToAdd.current);
        }
        break;
      case 'sitio':
        if(sitioIdsToAdd.current.indexOf(itemId) === -1) {
          sitioIdsToAdd.current = [];
          sitioIdsToAdd.current.push(itemId);
          setSitioIdsToAddState(sitioIdsToAdd.current);
          handleSetValue(itemId, 1, 'sitio_id');
          setForeignKeys({...foreignKeys, sitio_id: itemId});
        }
        break;

      default:
        break;
    }
  }

  const handleUntransferFromAdd =(associationKey, itemId) => {
    if(associationKey === 'cuadrantes') {
      let iof = cuadrantesIdsToAdd.current.indexOf(itemId);
      if(iof !== -1) {
        cuadrantesIdsToAdd.current.splice(iof, 1);
      }
      return;
    }//end: case 'cuadrantes'
    if(associationKey === 'sitio') {
      if(sitioIdsToAdd.current.length > 0) {
        sitioIdsToAdd.current = [];
        setSitioIdsToAddState([]);
        handleSetValue(null, 0, 'sitio_id');
        setForeignKeys({...foreignKeys, sitio_id: null});
      }
      return;
    }//end: case 'sitio'
  }

  const handleClickOnCuadranteRow = (event, item) => {
    setCuadranteDetailItem(item);
  };

  const handleCuadranteDetailDialogClose = (event) => {
    delayedCloseCuadranteDetailPanel(event, 500);
  }

  const delayedCloseCuadranteDetailPanel = async (event, ms) => {
    await new Promise(resolve => {
      window.setTimeout(function() {
        setCuadranteDetailDialogOpen(false);
        setCuadranteDetailItem(undefined);
        resolve("ok");
      }, ms);
    });
  };
  const handleClickOnSitioRow = (event, item) => {
    setSitioDetailItem(item);
  };

  const handleSitioDetailDialogClose = (event) => {
    delayedCloseSitioDetailPanel(event, 500);
  }

  const delayedCloseSitioDetailPanel = async (event, ms) => {
    await new Promise(resolve => {
      window.setTimeout(function() {
        setSitioDetailDialogOpen(false);
        setSitioDetailItem(undefined);
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
            {t('modelPanels.new') + ' Grupo_enfoque'}
          </Typography>
          <Tooltip title={ t('modelPanels.save') + " grupo_enfoque" }>
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
              <GrupoEnfoqueTabsA
                value={tabsValue}
                handleChange={handleTabsChange}
              />
            </div>
          </Grid>

          <Grid item xs={12}>
            {/* Attributes Page [0] */}
            <GrupoEnfoqueAttributesPage
              hidden={tabsValue !== 0}
              valueOkStates={valueOkStates}
              valueAjvStates={valueAjvStates}
              foreignKeys = {foreignKeys}
              handleSetValue={handleSetValue}
            />
          </Grid>

          <Grid item xs={12}>
            {/* Associations Page [1] */}
            <GrupoEnfoqueAssociationsPage
              hidden={tabsValue !== 1}
              cuadrantesIdsToAdd={cuadrantesIdsToAddState}
              sitioIdsToAdd={sitioIdsToAddState}
              handleTransferToAdd={handleTransferToAdd}
              handleUntransferFromAdd={handleUntransferFromAdd}
              handleClickOnCuadranteRow={handleClickOnCuadranteRow}
              handleClickOnSitioRow={handleClickOnSitioRow}
            />
          </Grid>
        </Grid>

        {/* Confirmation Dialog */}
        <GrupoEnfoqueConfirmationDialog
          open={confirmationOpen}
          title={confirmationTitle}
          text={confirmationText}
          acceptText={confirmationAcceptText}
          rejectText={confirmationRejectText}
          handleAccept={handleConfirmationAccept}
          handleReject={handleConfirmationReject}
        />

        {/* Dialog: Cuadrante Detail Panel */}
        {(cuadranteDetailDialogOpen) && (
          <CuadranteDetailPanel
            permissions={permissions}
            item={cuadranteDetailItem}
            dialog={true}
            handleClose={handleCuadranteDetailDialogClose}
          />
        )}
        {/* Dialog: Sitio Detail Panel */}
        {(sitioDetailDialogOpen) && (
          <SitioDetailPanel
            permissions={permissions}
            item={sitioDetailItem}
            dialog={true}
            handleClose={handleSitioDetailDialogClose}
          />
        )}
      </div>

    </Dialog>
  );
}
GrupoEnfoqueCreatePanel.propTypes = {
  permissions: PropTypes.object,
  handleClose: PropTypes.func.isRequired,
};