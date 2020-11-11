import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Attributes from '@material-ui/icons/HdrWeakTwoTone';
import Key from '@material-ui/icons/VpnKey';

import StringField from './components/StringField'

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(0),
  },
  card: {
    margin: theme.spacing(0),
    maxHeight: '70vh',
    overflow: 'auto',
  },
  cardB: {
    margin: theme.spacing(0),
    padding: theme.spacing(0),
  },
  cardContent: {
    marginLeft: theme.spacing(5),
    marginRight: theme.spacing(5),
    minWidth: 200,
  },
}));

export default function AssayAttributesFormView(props) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { item, 
          valueOkStates,
          valueAjvStates,
          handleSetValue,
        } = props;

  function getItemsOk() {
    let countOk=0;
    let a = Object.entries(valueOkStates);
    for(let i=0; i<a.length; ++i) {
      if(a[i][1] === 1) {
        countOk++;
      }
    }
    return countOk;
  }

  return (
    <div id='AssayAttributesFormView-div-root' className={classes.root}>
      <Grid container justify='center'>
        <Grid item xs={12}>

        <Card className={classes.cardB} elevation={0}>
            {/* Header */}
            <CardHeader
              avatar={
                <Attributes color="primary" fontSize="small" />
              }
              title={
                <Typography variant="h6">
                    { t('modelPanels.model') + ': Assay' }
                </Typography>
              }
              subheader={getItemsOk()+' / 5 ' + t('modelPanels.completed')}
            >
            </CardHeader>
          </Card>

          <Card className={classes.card}>
            {/* 
              Fields 
            */}
            {/* assay_id*/}
            <CardContent key='assay_id' className={classes.cardContent}>
              <Grid container alignItems='center' alignContent='center' wrap='nowrap' spacing={1}>
                <Grid item>
                  <Typography variant="h6" display="inline">assay_id:</Typography>
                  <Typography variant="h6" display="inline" color="textSecondary">&nbsp;{item.assay_id}</Typography>
                </Grid>
                {/*Key icon*/}
                <Grid item>
                  <Tooltip title={ t('modelPanels.internalId', 'Unique Identifier') }>
                    <Key fontSize="small" color="disabled" style={{ marginTop:8}} />
                  </Tooltip>
                </Grid>
              </Grid>
            </CardContent>


            {/* measurement */}
            <CardContent key='measurement' className={classes.cardContent} >
              <StringField
                itemKey='measurement'
                name='measurement'
                label='measurement'
                text={item.measurement}
                valueOk={valueOkStates.measurement}
                valueAjv={valueAjvStates.measurement}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* technology */}
            <CardContent key='technology' className={classes.cardContent} >
              <StringField
                itemKey='technology'
                name='technology'
                label='technology'
                text={item.technology}
                valueOk={valueOkStates.technology}
                valueAjv={valueAjvStates.technology}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* platform */}
            <CardContent key='platform' className={classes.cardContent} >
              <StringField
                itemKey='platform'
                name='platform'
                label='platform'
                text={item.platform}
                valueOk={valueOkStates.platform}
                valueAjv={valueAjvStates.platform}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* method */}
            <CardContent key='method' className={classes.cardContent} >
              <StringField
                itemKey='method'
                name='method'
                label='method'
                text={item.method}
                valueOk={valueOkStates.method}
                valueAjv={valueAjvStates.method}
                handleSetValue={handleSetValue}
              />
            </CardContent>

          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
AssayAttributesFormView.propTypes = {
  item: PropTypes.object.isRequired,
  valueOkStates: PropTypes.object.isRequired,
  valueAjvStates: PropTypes.object.isRequired,
  handleSetValue: PropTypes.func.isRequired,
};

