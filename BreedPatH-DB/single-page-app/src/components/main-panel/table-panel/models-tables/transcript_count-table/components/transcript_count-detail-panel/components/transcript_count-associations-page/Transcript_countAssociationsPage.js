import React from 'react';
import PropTypes from 'prop-types';
import SampleCompactView from './sample-compact-view/SampleCompactView'
import TranscriptCountAssociationsMenuTabs from './Transcript_countAssociationsMenuTabs'
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

export default function TranscriptCountAssociationsPage(props) {
  const classes = useStyles();
  const {
    item,
    deleted,
    handleClickOnSampleRow,
  } = props;
  const [associationSelected, setAssociationSelected] = React.useState('sample');

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
          <TranscriptCountAssociationsMenuTabs
            associationSelected={associationSelected}
            handleClick={handleAssociationClick}
          />
        </Grid>

        {/* Sample Compact View */}
        {(associationSelected === 'sample') && (
          <Grid item xs={12} sm={10} md={9} lg={8} xl={7}>
            <SampleCompactView
              item={item}
              handleClickOnSampleRow={handleClickOnSampleRow}
            />
          </Grid>
        )}

      </Grid>
    </Fade>
  );
}
TranscriptCountAssociationsPage.propTypes = {
  item: PropTypes.object.isRequired,
  deleted: PropTypes.bool,
  handleClickOnSampleRow: PropTypes.func.isRequired, 
};
