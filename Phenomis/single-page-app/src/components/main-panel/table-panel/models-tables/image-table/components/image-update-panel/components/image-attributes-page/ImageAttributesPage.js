import React from 'react';
import PropTypes from 'prop-types';
import ImageAttributesFormView from './image-attributes-form-view/ImageAttributesFormView'
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Fade from '@material-ui/core/Fade';

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(0),
  },
}));

export default function ImageAttributesPage(props) {
  const classes = useStyles();
  const {
    item,
    valueOkStates,
    foreignKeys,
    hidden,
    handleSetValue,
  } = props;

  return (
    <div hidden={hidden}>
      <Fade in={!hidden} timeout={500}>
        <Grid
          className={classes.root} 
          container justify='center' 
          alignItems='flex-start'
          spacing={0}
        > 
          {/* Attributes Form View */}
          <Grid item xs={12} sm={10} md={9} lg={8} xl={7}>
            <ImageAttributesFormView
              item={item}
              valueOkStates={valueOkStates}
              foreignKeys={foreignKeys}
              handleSetValue={handleSetValue}
            />
          </Grid>
        </Grid>
      </Fade>
    </div>
  );
}
ImageAttributesPage.propTypes = {
  item: PropTypes.object.isRequired,
  valueOkStates: PropTypes.object.isRequired,
  foreignKeys: PropTypes.object.isRequired,
  hidden: PropTypes.bool.isRequired,
  handleSetValue: PropTypes.func.isRequired,
};