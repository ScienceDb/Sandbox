import React, { useRef, useEffect, Suspense, lazy } from 'react';
import { makeCancelable, retry } from '../../../../../../../../../utils';
import PropTypes from 'prop-types';
import ErrorBoundary from '../../../../../../../../pages/ErrorBoundary';
import CapitalAssociationsMenuTabs from './CapitalAssociationsMenuTabs';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Fade from '@material-ui/core/Fade';
//lazy loading
const UniqueCountryTransferLists = lazy(() => retry(() => import(/* webpackChunkName: "Create-TransferLists-UniqueCountry" */ './unique_country-transfer-lists/Unique_countryTransferLists')));

const debounceTimeout = 700;

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(0),
  },
  menu: {
    marginTop: theme.spacing(0),
  }
}));

export default function CapitalAssociationsPage(props) {
  const classes = useStyles();

  const {
    hidden,
    unique_countryIdsToAdd,
    handleTransferToAdd,
    handleUntransferFromAdd,
    handleClickOnCountryRow,
  } = props;
  const [associationSelected, setAssociationSelected] = React.useState('unique_country');

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
            <CapitalAssociationsMenuTabs
              associationSelected={associationSelected}
              handleClick={handleAssociationClick}
            />
          </Grid>

          {/* Transfer Lists */}
          {/* Unique_country Transfer Lists */}
          {(associationSelected === 'unique_country') && (
            <Grid item xs={12} sm={10} md={9}>
              <Suspense fallback={<div />}><ErrorBoundary belowToolbar={true} showMessage={true}>
                <UniqueCountryTransferLists
                  idsToAdd={unique_countryIdsToAdd}
                  handleClickOnCountryRow={handleClickOnCountryRow}
                  handleTransferToAdd={handleTransferToAdd}
                  handleUntransferFromAdd={handleUntransferFromAdd}
                />
              </ErrorBoundary></Suspense>
            </Grid>
          )}
        </Grid>
      </Fade>
    </div>
  );
}
CapitalAssociationsPage.propTypes = {
  hidden: PropTypes.bool.isRequired,
  unique_countryIdsToAdd: PropTypes.array.isRequired,
  handleTransferToAdd: PropTypes.func.isRequired,
  handleUntransferFromAdd: PropTypes.func.isRequired,
  handleClickOnCountryRow: PropTypes.func.isRequired,
};