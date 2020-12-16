import React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

export default function ObservationAssociationsMenuTabs(props) {
  const {
    associationSelected,
    handleClick,
  } = props;

  return (
    <div>
      <Tabs
        value={associationSelected}
        onChange={handleClick}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab key='germplasm' label='Germplasm' value='germplasm' />
        <Tab key='image' label='Image' value='image' />
        <Tab key='observationUnit' label='ObservationUnit' value='observationUnit' />
        <Tab key='observationVariable' label='ObservationVariable' value='observationVariable' />
        <Tab key='season' label='Season' value='season' />
        <Tab key='study' label='Study' value='study' />
      </Tabs>
    </div>
  );
}
ObservationAssociationsMenuTabs.propTypes = {
  associationSelected: PropTypes.string.isRequired,
  handleClick: PropTypes.func.isRequired,
};