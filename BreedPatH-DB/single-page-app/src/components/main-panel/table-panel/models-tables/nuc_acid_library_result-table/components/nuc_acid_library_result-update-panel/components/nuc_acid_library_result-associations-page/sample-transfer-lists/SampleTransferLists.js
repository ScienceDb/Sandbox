import React from 'react';
import PropTypes from 'prop-types';
import SampleToAddTransferView from './sample-to-add-transfer-view/SampleToAddTransferView'
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import Grid from '@material-ui/core/Grid';
import Fade from '@material-ui/core/Fade';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(0),
  },
  container: {
    margin: theme.spacing(0),
  },
  div: {
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(0),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

export default function SampleTransferLists(props) {
  const classes = useStyles();
  const { t } = useTranslation();

  const {
    item,
    idsToAdd,
    handleTransferToAdd,
    handleUntransferFromAdd,
    handleClickOnSampleRow,
  } = props;
  
  return (
    <div className={classes.root}>
      <Fade in={true} timeout={500}>
        <Grid
          className={classes.container} 
          container 
          justify='center'
          alignItems='flex-start'
          spacing={0}
        > 
          <Grid item xs={12}>
            <div className={classes.div}>
              <Typography variant="body2" display='inline'>
                { t('modelPanels.toAddHelperA', "Please select ") }
              </Typography>
              <Typography variant="body2" display='inline'>
                {  t('modelPanels.theRecord', "the record ") }
              </Typography>
              <Typography variant="body2" display='inline'>
                { t('modelPanels.toAddHelperB', " that you want to be associated with this ") }
              </Typography>
              <Typography variant="body2" display='inline'>
                <b>{ 'Nuc_acid_library_result.' }</b>
              </Typography>
            </div>
          </Grid>
          <Grid item xs={12}>
            <SampleToAddTransferView
              item={item}
              idsToAdd={idsToAdd}
              handleTransfer={handleTransferToAdd}
              handleUntransfer={handleUntransferFromAdd}
              handleClickOnSampleRow={handleClickOnSampleRow}
            />
          </Grid>


        </Grid>
      </Fade>
    </div>
  );
}
SampleTransferLists.propTypes = {
  item: PropTypes.object.isRequired,
  idsToAdd: PropTypes.array.isRequired,
  handleTransferToAdd: PropTypes.func.isRequired,
  handleUntransferFromAdd: PropTypes.func.isRequired,
  handleClickOnSampleRow: PropTypes.func.isRequired,    
};