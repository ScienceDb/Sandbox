import React, { Suspense, lazy } from 'react';
import { retry } from '../../../../../../../../../utils';
import PropTypes from 'prop-types';
import ErrorBoundary from '../../../../../../../../pages/ErrorBoundary';
import CapitalAssociationsMenuTabs from './CapitalAssociationsMenuTabs';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Fade from '@material-ui/core/Fade';
//lazy loading
const UniqueCountryCompactView = lazy(() => retry(() => import(/* webpackChunkName: "Detail-CompactView-UniqueCountry" */ './unique_country-compact-view/Unique_countryCompactView')));

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(0),
    minHeight: `calc(57vh + 84px)`,
  },
  menu: {
    marginTop: theme.spacing(0),
  }
}));

export default function CapitalAssociationsPage(props) {
  const classes = useStyles();
  const {
    item,
    deleted,
    handleClickOnCountryRow,
  } = props;
  const [associationSelected, setAssociationSelected] = React.useState('unique_country');

  const handleAssociationClick = (event, newValue) => {
    setAssociationSelected(newValue);
  }

  return (
    <Fade in={!deleted} timeout={500}>
      <Grid
        id='CapitalAssociationsPage-div-root'
        className={classes.root} 
        container 
        justify='center'
        alignItems='flex-start'
        alignContent='flex-start'
        spacing={2}
      > 
        {/* Menu Tabs: Associations */}
        <Grid item xs={12} sm={10} md={9} lg={8} xl={7} className={classes.menu}>
          <CapitalAssociationsMenuTabs
            associationSelected={associationSelected}
            handleClick={handleAssociationClick}
          />
        </Grid>

        {/* Unique_country Compact View */}
        {(associationSelected === 'unique_country') && (
          <Grid item xs={12} sm={10} md={9} lg={8} xl={7}>
            <Suspense fallback={<div />}><ErrorBoundary belowToolbar={true} showMessage={true}>
              <UniqueCountryCompactView
                item={item}
                handleClickOnCountryRow={handleClickOnCountryRow}
              />
            </ErrorBoundary></Suspense>
          </Grid>
        )}

      </Grid>
    </Fade>
  );
}
CapitalAssociationsPage.propTypes = {
  item: PropTypes.object.isRequired,
  deleted: PropTypes.bool,
  handleClickOnCountryRow: PropTypes.func.isRequired, 
};