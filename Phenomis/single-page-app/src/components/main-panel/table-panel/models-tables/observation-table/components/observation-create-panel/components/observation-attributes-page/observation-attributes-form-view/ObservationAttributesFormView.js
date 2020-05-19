import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Attributes from '@material-ui/icons/HdrWeakTwoTone';


import StringField from './components/StringField'

import DateTimeField from './components/DateTimeField'

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

export default function ObservationAttributesFormView(props) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { valueOkStates,
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
    <div className={classes.root}>
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
                    { t('modelPanels.model') + ': Observation' }
                </Typography>
              }
              subheader={getItemsOk()+' / 11 ' + t('modelPanels.completed')}
            >
            </CardHeader>
          </Card>
            
          <Card className={classes.card}>
            {/* 
              Fields 
            */}

            {/* collector */}
            <CardContent key='collector' className={classes.cardContent} >
              <StringField
                itemKey='collector'
                name='collector'
                label='collector'
                valueOk={valueOkStates.collector}
                autoFocus={true}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* observationTimeStamp */}
            <CardContent key='observationTimeStamp' className={classes.cardContent} >
              <DateTimeField
                itemKey='observationTimeStamp'
                name='observationTimeStamp'
                label='observationTimeStamp'
                valueOk={valueOkStates.observationTimeStamp}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* uploadedBy */}
            <CardContent key='uploadedBy' className={classes.cardContent} >
              <StringField
                itemKey='uploadedBy'
                name='uploadedBy'
                label='uploadedBy'
                valueOk={valueOkStates.uploadedBy}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* value */}
            <CardContent key='value' className={classes.cardContent} >
              <StringField
                itemKey='value'
                name='value'
                label='value'
                valueOk={valueOkStates.value}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* observationDbId */}
            <CardContent key='observationDbId' className={classes.cardContent} >
              <StringField
                itemKey='observationDbId'
                name='observationDbId'
                label='observationDbId'
                valueOk={valueOkStates.observationDbId}
                handleSetValue={handleSetValue}
              />
            </CardContent>
                        
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
ObservationAttributesFormView.propTypes = {
  valueOkStates: PropTypes.object.isRequired,
  handleSetValue: PropTypes.func.isRequired,
};