import React, { useRef, useEffect } from 'react';
import { makeCancelable } from '../../../../../../../../../utils'
import PropTypes from 'prop-types';
import ObservationsTransferLists from './observations-transfer-lists/ObservationsTransferLists'
import SeasonToStudiesTransferLists from './seasonToStudies-transfer-lists/SeasonToStudiesTransferLists'
import SeasonAssociationsMenuTabs from './SeasonAssociationsMenuTabs'
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

export default function SeasonAssociationsPage(props) {
  const classes = useStyles();
  const {
    hidden,
    item,
    observationsIdsToAdd,
    observationsIdsToRemove,
    seasonToStudiesIdsToAdd,
    seasonToStudiesIdsToRemove,
    handleTransferToAdd,
    handleUntransferFromAdd,
    handleTransferToRemove,
    handleUntransferFromRemove,
    handleClickOnObservationRow,
    handleClickOnStudy_to_seasonRow,
  } = props;
  const [associationSelected, setAssociationSelected] = React.useState('observations');

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
            <SeasonAssociationsMenuTabs
              associationSelected={associationSelected}
              handleClick={handleAssociationClick}
            />
          </Grid>

          {/* Observations Transfer Lists */}
          {(associationSelected === 'observations') && (
            <Grid item xs={12} sm={10} md={9}>
              <ObservationsTransferLists
                item={item}
                idsToAdd={observationsIdsToAdd}
                idsToRemove={observationsIdsToRemove}
                handleTransferToAdd={handleTransferToAdd}
                handleUntransferFromAdd={handleUntransferFromAdd}
                handleTransferToRemove={handleTransferToRemove}
                handleUntransferFromRemove={handleUntransferFromRemove}
                handleClickOnObservationRow={handleClickOnObservationRow}
              />
            </Grid>
          )}
          {/* SeasonToStudies Transfer Lists */}
          {(associationSelected === 'seasonToStudies') && (
            <Grid item xs={12} sm={10} md={9}>
              <SeasonToStudiesTransferLists
                item={item}
                idsToAdd={seasonToStudiesIdsToAdd}
                idsToRemove={seasonToStudiesIdsToRemove}
                handleTransferToAdd={handleTransferToAdd}
                handleUntransferFromAdd={handleUntransferFromAdd}
                handleTransferToRemove={handleTransferToRemove}
                handleUntransferFromRemove={handleUntransferFromRemove}
                handleClickOnStudy_to_seasonRow={handleClickOnStudy_to_seasonRow}
              />
            </Grid>
          )}

        </Grid>
      </Fade>
    </div>
  );
}
SeasonAssociationsPage.propTypes = {
  hidden: PropTypes.bool.isRequired,
  item: PropTypes.object.isRequired,
  observationsIdsToAdd: PropTypes.array.isRequired,
  observationsIdsToRemove: PropTypes.array.isRequired,
  seasonToStudiesIdsToAdd: PropTypes.array.isRequired,
  seasonToStudiesIdsToRemove: PropTypes.array.isRequired,
  handleTransferToAdd: PropTypes.func.isRequired,
  handleUntransferFromAdd: PropTypes.func.isRequired,
  handleTransferToRemove: PropTypes.func.isRequired,
  handleUntransferFromRemove: PropTypes.func.isRequired,
  handleClickOnObservationRow: PropTypes.func.isRequired,
  handleClickOnStudy_to_seasonRow: PropTypes.func.isRequired,
};