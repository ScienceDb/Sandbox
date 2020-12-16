import React from 'react';
import PropTypes from 'prop-types';
import ObservationAttributesFormView from './observation-attributes-form-view/ObservationAttributesFormView'
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Fade from '@material-ui/core/Fade';

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(0),
  },
}));

export default function ObservationAttributesPage(props) {
  const classes = useStyles();
  const {
    item,
    valueOkStates,
  } = props;

  return (
    <Fade in={true} timeout={500}>
      <Grid
        className={classes.root} 
        container justify='center' 
        alignItems='flex-start'
        spacing={0}
      > 
        {/* Attributes Form View */}
        <Grid item xs={12} sm={10} md={9} lg={8} xl={7}>
          <ObservationAttributesFormView
            item={item}
            valueOkStates={valueOkStates}
          />
        </Grid>
      </Grid>
    </Fade>
  );
}
ObservationAttributesPage.propTypes = {
  item: PropTypes.object.isRequired,
  valueOkStates: PropTypes.object.isRequired,
};