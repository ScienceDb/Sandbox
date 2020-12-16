import React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

export default function ContactAssociationsMenuTabs(props) {
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
        <Tab id='ContactUpdatePanel-tabsA-button-programs' 
          key='programs' label='Programs' value='programs' />
        <Tab id='ContactUpdatePanel-tabsA-button-studies' 
          key='studies' label='Studies' value='studies' />
        <Tab id='ContactUpdatePanel-tabsA-button-trials' 
          key='trials' label='Trials' value='trials' />
      </Tabs>
    </div>
  );
}
ContactAssociationsMenuTabs.propTypes = {
  associationSelected: PropTypes.string.isRequired,
  handleClick: PropTypes.func.isRequired,
};