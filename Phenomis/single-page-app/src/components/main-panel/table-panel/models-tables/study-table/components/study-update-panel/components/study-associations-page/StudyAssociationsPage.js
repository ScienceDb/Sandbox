import React, { useRef, useEffect } from 'react';
import { makeCancelable } from '../../../../../../../../../utils'
import PropTypes from 'prop-types';
import EnvironmentParametersTransferLists from './environmentParameters-transfer-lists/EnvironmentParametersTransferLists'
import EventsTransferLists from './events-transfer-lists/EventsTransferLists'
import LocationTransferLists from './location-transfer-lists/LocationTransferLists'
import ObservationsTransferLists from './observations-transfer-lists/ObservationsTransferLists'
import ObservationUnitsTransferLists from './observationUnits-transfer-lists/ObservationUnitsTransferLists'
import StudyToContactsTransferLists from './studyToContacts-transfer-lists/StudyToContactsTransferLists'
import StudyToSeasonsTransferLists from './studyToSeasons-transfer-lists/StudyToSeasonsTransferLists'
import TrialTransferLists from './trial-transfer-lists/TrialTransferLists'
import StudyAssociationsMenuTabs from './StudyAssociationsMenuTabs'
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

export default function StudyAssociationsPage(props) {
  const classes = useStyles();
  const {
    hidden,
    item,
    environmentParametersIdsToAdd,
    environmentParametersIdsToRemove,
    eventsIdsToAdd,
    eventsIdsToRemove,
    locationIdsToAdd,
    observationsIdsToAdd,
    observationsIdsToRemove,
    observationUnitsIdsToAdd,
    observationUnitsIdsToRemove,
    studyToContactsIdsToAdd,
    studyToContactsIdsToRemove,
    studyToSeasonsIdsToAdd,
    studyToSeasonsIdsToRemove,
    trialIdsToAdd,
    handleTransferToAdd,
    handleUntransferFromAdd,
    handleTransferToRemove,
    handleUntransferFromRemove,
    handleClickOnEnvironmentParameterRow,
    handleClickOnEventRow,
    handleClickOnLocationRow,
    handleClickOnObservationRow,
    handleClickOnObservationUnitRow,
    handleClickOnStudy_to_contactRow,
    handleClickOnStudy_to_seasonRow,
    handleClickOnTrialRow,
  } = props;
  const [associationSelected, setAssociationSelected] = React.useState('environmentParameters');

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
            <StudyAssociationsMenuTabs
              associationSelected={associationSelected}
              handleClick={handleAssociationClick}
            />
          </Grid>

          {/* EnvironmentParameters Transfer Lists */}
          {(associationSelected === 'environmentParameters') && (
            <Grid item xs={12} sm={10} md={9}>
              <EnvironmentParametersTransferLists
                item={item}
                idsToAdd={environmentParametersIdsToAdd}
                idsToRemove={environmentParametersIdsToRemove}
                handleTransferToAdd={handleTransferToAdd}
                handleUntransferFromAdd={handleUntransferFromAdd}
                handleTransferToRemove={handleTransferToRemove}
                handleUntransferFromRemove={handleUntransferFromRemove}
                handleClickOnEnvironmentParameterRow={handleClickOnEnvironmentParameterRow}
              />
            </Grid>
          )}
          {/* Events Transfer Lists */}
          {(associationSelected === 'events') && (
            <Grid item xs={12} sm={10} md={9}>
              <EventsTransferLists
                item={item}
                idsToAdd={eventsIdsToAdd}
                idsToRemove={eventsIdsToRemove}
                handleTransferToAdd={handleTransferToAdd}
                handleUntransferFromAdd={handleUntransferFromAdd}
                handleTransferToRemove={handleTransferToRemove}
                handleUntransferFromRemove={handleUntransferFromRemove}
                handleClickOnEventRow={handleClickOnEventRow}
              />
            </Grid>
          )}
          {/* Location Transfer Lists */}
          {(associationSelected === 'location') && (
            <Grid item xs={12} sm={10} md={9}>
              <LocationTransferLists
                item={item}
                idsToAdd={locationIdsToAdd}
                handleTransferToAdd={handleTransferToAdd}
                handleUntransferFromAdd={handleUntransferFromAdd}
                handleClickOnLocationRow={handleClickOnLocationRow}
              />
            </Grid>
          )}
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
          {/* ObservationUnits Transfer Lists */}
          {(associationSelected === 'observationUnits') && (
            <Grid item xs={12} sm={10} md={9}>
              <ObservationUnitsTransferLists
                item={item}
                idsToAdd={observationUnitsIdsToAdd}
                idsToRemove={observationUnitsIdsToRemove}
                handleTransferToAdd={handleTransferToAdd}
                handleUntransferFromAdd={handleUntransferFromAdd}
                handleTransferToRemove={handleTransferToRemove}
                handleUntransferFromRemove={handleUntransferFromRemove}
                handleClickOnObservationUnitRow={handleClickOnObservationUnitRow}
              />
            </Grid>
          )}
          {/* StudyToContacts Transfer Lists */}
          {(associationSelected === 'studyToContacts') && (
            <Grid item xs={12} sm={10} md={9}>
              <StudyToContactsTransferLists
                item={item}
                idsToAdd={studyToContactsIdsToAdd}
                idsToRemove={studyToContactsIdsToRemove}
                handleTransferToAdd={handleTransferToAdd}
                handleUntransferFromAdd={handleUntransferFromAdd}
                handleTransferToRemove={handleTransferToRemove}
                handleUntransferFromRemove={handleUntransferFromRemove}
                handleClickOnStudy_to_contactRow={handleClickOnStudy_to_contactRow}
              />
            </Grid>
          )}
          {/* StudyToSeasons Transfer Lists */}
          {(associationSelected === 'studyToSeasons') && (
            <Grid item xs={12} sm={10} md={9}>
              <StudyToSeasonsTransferLists
                item={item}
                idsToAdd={studyToSeasonsIdsToAdd}
                idsToRemove={studyToSeasonsIdsToRemove}
                handleTransferToAdd={handleTransferToAdd}
                handleUntransferFromAdd={handleUntransferFromAdd}
                handleTransferToRemove={handleTransferToRemove}
                handleUntransferFromRemove={handleUntransferFromRemove}
                handleClickOnStudy_to_seasonRow={handleClickOnStudy_to_seasonRow}
              />
            </Grid>
          )}
          {/* Trial Transfer Lists */}
          {(associationSelected === 'trial') && (
            <Grid item xs={12} sm={10} md={9}>
              <TrialTransferLists
                item={item}
                idsToAdd={trialIdsToAdd}
                handleTransferToAdd={handleTransferToAdd}
                handleUntransferFromAdd={handleUntransferFromAdd}
                handleClickOnTrialRow={handleClickOnTrialRow}
              />
            </Grid>
          )}

        </Grid>
      </Fade>
    </div>
  );
}
StudyAssociationsPage.propTypes = {
  hidden: PropTypes.bool.isRequired,
  item: PropTypes.object.isRequired,
  environmentParametersIdsToAdd: PropTypes.array.isRequired,
  environmentParametersIdsToRemove: PropTypes.array.isRequired,
  eventsIdsToAdd: PropTypes.array.isRequired,
  eventsIdsToRemove: PropTypes.array.isRequired,
  locationIdsToAdd: PropTypes.array.isRequired,
  observationsIdsToAdd: PropTypes.array.isRequired,
  observationsIdsToRemove: PropTypes.array.isRequired,
  observationUnitsIdsToAdd: PropTypes.array.isRequired,
  observationUnitsIdsToRemove: PropTypes.array.isRequired,
  studyToContactsIdsToAdd: PropTypes.array.isRequired,
  studyToContactsIdsToRemove: PropTypes.array.isRequired,
  studyToSeasonsIdsToAdd: PropTypes.array.isRequired,
  studyToSeasonsIdsToRemove: PropTypes.array.isRequired,
  trialIdsToAdd: PropTypes.array.isRequired,
  handleTransferToAdd: PropTypes.func.isRequired,
  handleUntransferFromAdd: PropTypes.func.isRequired,
  handleTransferToRemove: PropTypes.func.isRequired,
  handleUntransferFromRemove: PropTypes.func.isRequired,
  handleClickOnEnvironmentParameterRow: PropTypes.func.isRequired,
  handleClickOnEventRow: PropTypes.func.isRequired,
  handleClickOnLocationRow: PropTypes.func.isRequired,
  handleClickOnObservationRow: PropTypes.func.isRequired,
  handleClickOnObservationUnitRow: PropTypes.func.isRequired,
  handleClickOnStudy_to_contactRow: PropTypes.func.isRequired,
  handleClickOnStudy_to_seasonRow: PropTypes.func.isRequired,
  handleClickOnTrialRow: PropTypes.func.isRequired,
};