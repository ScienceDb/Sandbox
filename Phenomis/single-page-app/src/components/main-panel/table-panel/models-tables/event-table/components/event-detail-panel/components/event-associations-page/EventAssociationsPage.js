import React from 'react';
import PropTypes from 'prop-types';
import EventParametersCompactView from './eventParameters-compact-view/EventParametersCompactView'
import EventToObservationUnitsCompactView from './eventToObservationUnits-compact-view/EventToObservationUnitsCompactView'
import StudyCompactView from './study-compact-view/StudyCompactView'
import EventAssociationsMenuTabs from './EventAssociationsMenuTabs'
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Fade from '@material-ui/core/Fade';

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(0),
    minHeight: `calc(57vh + 84px)`,
  },
  menu: {
    marginTop: theme.spacing(0),
  }
}));

export default function EventAssociationsPage(props) {
  const classes = useStyles();
  const {
    item,
    deleted,
    handleClickOnEventParameterRow,
    handleClickOnObservationUnit_to_eventRow,
    handleClickOnStudyRow,
  } = props;
  const [associationSelected, setAssociationSelected] = React.useState('eventParameters');

  const handleAssociationClick = (event, newValue) => {
    setAssociationSelected(newValue);
  }

  return (
    <Fade in={!deleted} timeout={500}>
      <Grid
        className={classes.root} 
        container 
        justify='center'
        alignItems='flex-start'
        alignContent='flex-start'
        spacing={2}
      > 
        {/* Menu Tabs: Associations */}
        <Grid item xs={12} sm={10} md={9} lg={8} xl={7} className={classes.menu}>
          <EventAssociationsMenuTabs
            associationSelected={associationSelected}
            handleClick={handleAssociationClick}
          />
        </Grid>

        {/* EventParameters Compact View */}
        {(associationSelected === 'eventParameters') && (
          <Grid item xs={12} sm={10} md={9} lg={8} xl={7}>
            <EventParametersCompactView
              item={item}
              handleClickOnEventParameterRow={handleClickOnEventParameterRow}
            />
          </Grid>
        )}
        {/* EventToObservationUnits Compact View */}
        {(associationSelected === 'eventToObservationUnits') && (
          <Grid item xs={12} sm={10} md={9} lg={8} xl={7}>
            <EventToObservationUnitsCompactView
              item={item}
              handleClickOnObservationUnit_to_eventRow={handleClickOnObservationUnit_to_eventRow}
            />
          </Grid>
        )}
        {/* Study Compact View */}
        {(associationSelected === 'study') && (
          <Grid item xs={12} sm={10} md={9} lg={8} xl={7}>
            <StudyCompactView
              item={item}
              handleClickOnStudyRow={handleClickOnStudyRow}
            />
          </Grid>
        )}

      </Grid>
    </Fade>
  );
}
EventAssociationsPage.propTypes = {
  item: PropTypes.object.isRequired,
  deleted: PropTypes.bool,
  handleClickOnEventParameterRow: PropTypes.func.isRequired, 
  handleClickOnObservationUnit_to_eventRow: PropTypes.func.isRequired, 
  handleClickOnStudyRow: PropTypes.func.isRequired, 
};
