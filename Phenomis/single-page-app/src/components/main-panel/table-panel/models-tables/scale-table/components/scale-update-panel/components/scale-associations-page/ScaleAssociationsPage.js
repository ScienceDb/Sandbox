import React, { useRef, useEffect } from 'react';
import { makeCancelable } from '../../../../../../../../../utils'
import PropTypes from 'prop-types';
import ObservationVariablesTransferLists from './observationVariables-transfer-lists/ObservationVariablesTransferLists'
import OntologyReferenceTransferLists from './ontologyReference-transfer-lists/OntologyReferenceTransferLists'
import ScaleAssociationsMenuTabs from './ScaleAssociationsMenuTabs'
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Fade from '@material-ui/core/Fade';

const debounceTimeout = 700;

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(0),
    minHeight: 1200,
  },
  menu: {
    marginTop: theme.spacing(0),
  }
}));

export default function ScaleAssociationsPage(props) {
  const classes = useStyles();
  const {
    hidden,
    item,
    observationVariablesIdsToAdd,
    observationVariablesIdsToRemove,
    ontologyReferenceIdsToAdd,
    handleTransferToAdd,
    handleUntransferFromAdd,
    handleTransferToRemove,
    handleUntransferFromRemove,
    handleClickOnObservationVariableRow,
    handleClickOnOntologyReferenceRow,
  } = props;
  const [associationSelected, setAssociationSelected] = React.useState('observationVariables');

  //debouncing & event contention
  const cancelablePromises = useRef([]);
  const isDebouncingAssociationClick = useRef(false);
  const currentAssociationSelected = useRef(associationSelected);
  const lastAssociationSelected = useRef(associationSelected);

  useEffect(() => {

    //cleanup on unmounted.
    return function cleanup() {
      cancelablePromises.current.forEach(p => p.cancel());
      cancelablePromises.current = [];
    };
  }, []);

  const handleAssociationClick = (event, newValue) => {
    //save last value
    lastAssociationSelected.current = newValue;

    if(!isDebouncingAssociationClick.current){
      //set last value
      currentAssociationSelected.current = newValue;
      setAssociationSelected(newValue);

      //debounce
      isDebouncingAssociationClick.current = true;
      let cancelableTimer = startTimerToDebounceAssociationClick();
      cancelablePromises.current.push(cancelableTimer);
      cancelableTimer
        .promise
        .then(() => {
          //clear flag
          isDebouncingAssociationClick.current = false;
          //delete from cancelables
          cancelablePromises.current.splice(cancelablePromises.current.indexOf(cancelableTimer), 1);
          //check
          if(lastAssociationSelected.current !== currentAssociationSelected.current){
            setAssociationSelected(lastAssociationSelected.current);
            currentAssociationSelected.current = lastAssociationSelected.current;
          }
        })
        .catch(() => {
          return;
        })
    }
  };
  
  const startTimerToDebounceAssociationClick = () => {
    return makeCancelable( new Promise(resolve => {
      window.setTimeout(function() { 
        resolve(); 
      }, debounceTimeout);
    }));
  };

  return (
    <div hidden={hidden}>
      <Fade in={!hidden} timeout={500}>
        <Grid
          className={classes.root} 
          container 
          justify='center'
          alignItems='flex-start'
          alignContent='flex-start'
          spacing={0}
        > 

          {/* Menu Tabs: Associations */}
          <Grid item xs={12} sm={10} md={9} className={classes.menu}>
            <ScaleAssociationsMenuTabs
              associationSelected={associationSelected}
              handleClick={handleAssociationClick}
            />
          </Grid>

          {/* ObservationVariables Transfer Lists */}
          {(associationSelected === 'observationVariables') && (
            <Grid item xs={12} sm={10} md={9}>
              <ObservationVariablesTransferLists
                item={item}
                idsToAdd={observationVariablesIdsToAdd}
                idsToRemove={observationVariablesIdsToRemove}
                handleTransferToAdd={handleTransferToAdd}
                handleUntransferFromAdd={handleUntransferFromAdd}
                handleTransferToRemove={handleTransferToRemove}
                handleUntransferFromRemove={handleUntransferFromRemove}
                handleClickOnObservationVariableRow={handleClickOnObservationVariableRow}
              />
            </Grid>
          )}
          {/* OntologyReference Transfer Lists */}
          {(associationSelected === 'ontologyReference') && (
            <Grid item xs={12} sm={10} md={9}>
              <OntologyReferenceTransferLists
                item={item}
                idsToAdd={ontologyReferenceIdsToAdd}
                handleTransferToAdd={handleTransferToAdd}
                handleUntransferFromAdd={handleUntransferFromAdd}
                handleClickOnOntologyReferenceRow={handleClickOnOntologyReferenceRow}
              />
            </Grid>
          )}

        </Grid>
      </Fade>
    </div>
  );
}
ScaleAssociationsPage.propTypes = {
  hidden: PropTypes.bool.isRequired,
  item: PropTypes.object.isRequired,
  observationVariablesIdsToAdd: PropTypes.array.isRequired,
  observationVariablesIdsToRemove: PropTypes.array.isRequired,
  ontologyReferenceIdsToAdd: PropTypes.array.isRequired,
  handleTransferToAdd: PropTypes.func.isRequired,
  handleUntransferFromAdd: PropTypes.func.isRequired,
  handleTransferToRemove: PropTypes.func.isRequired,
  handleUntransferFromRemove: PropTypes.func.isRequired,
  handleClickOnObservationVariableRow: PropTypes.func.isRequired,
  handleClickOnOntologyReferenceRow: PropTypes.func.isRequired,
};