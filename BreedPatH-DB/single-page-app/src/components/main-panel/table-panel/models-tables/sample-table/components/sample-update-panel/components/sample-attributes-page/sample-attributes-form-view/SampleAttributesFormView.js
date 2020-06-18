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

import IntField from './components/IntField'

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

export default function SampleAttributesFormView(props) {
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
                    { t('modelPanels.model') + ': Sample' }
                </Typography>
              }
              subheader={getItemsOk()+' / 9 ' + t('modelPanels.completed')}
            >
            </CardHeader>
          </Card>

          <Card className={classes.card}>
            {/* 
              Fields 
            */}
            {/* id*/}
            <CardContent key='id' className={classes.cardContent}>
              <Grid container alignItems='center' alignContent='center' wrap='nowrap' spacing={1}>
                <Grid item>
                  <Typography variant="h6" display="inline">id:</Typography>
                  <Typography variant="h6" display="inline" color="textSecondary">&nbsp;{item.id}</Typography>
                </Grid>
                {/*Key icon*/}
                <Grid item>
                  <Tooltip title={ t('modelPanels.internalId', 'Unique Identifier') }>
                    <Key fontSize="small" color="disabled" style={{ marginTop:8}} />
                  </Tooltip>
                </Grid>
              </Grid>
            </CardContent>


            {/* name */}
            <CardContent key='name' className={classes.cardContent} >
              <StringField
                itemKey='name'
                name='name'
                label='name'
                text={item.name}
                valueOk={valueOkStates.name}
                valueAjv={valueAjvStates.name}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* sampling_date */}
            <CardContent key='sampling_date' className={classes.cardContent} >
              <StringField
                itemKey='sampling_date'
                name='sampling_date'
                label='sampling_date'
                text={item.sampling_date}
                valueOk={valueOkStates.sampling_date}
                valueAjv={valueAjvStates.sampling_date}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* type */}
            <CardContent key='type' className={classes.cardContent} >
              <StringField
                itemKey='type'
                name='type'
                label='type'
                text={item.type}
                valueOk={valueOkStates.type}
                valueAjv={valueAjvStates.type}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* biological_replicate_no */}
            <CardContent key='biological_replicate_no' className={classes.cardContent} >
              <IntField
                itemKey='biological_replicate_no'
                name='biological_replicate_no'
                label='biological_replicate_no'
                text={item.biological_replicate_no}
                valueOk={valueOkStates.biological_replicate_no}
                valueAjv={valueAjvStates.biological_replicate_no}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* lab_code */}
            <CardContent key='lab_code' className={classes.cardContent} >
              <StringField
                itemKey='lab_code'
                name='lab_code'
                label='lab_code'
                text={item.lab_code}
                valueOk={valueOkStates.lab_code}
                valueAjv={valueAjvStates.lab_code}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* treatment */}
            <CardContent key='treatment' className={classes.cardContent} >
              <StringField
                itemKey='treatment'
                name='treatment'
                label='treatment'
                text={item.treatment}
                valueOk={valueOkStates.treatment}
                valueAjv={valueAjvStates.treatment}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* tissue */}
            <CardContent key='tissue' className={classes.cardContent} >
              <StringField
                itemKey='tissue'
                name='tissue'
                label='tissue'
                text={item.tissue}
                valueOk={valueOkStates.tissue}
                valueAjv={valueAjvStates.tissue}
                handleSetValue={handleSetValue}
              />
            </CardContent>

          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
SampleAttributesFormView.propTypes = {
  item: PropTypes.object.isRequired,
  valueOkStates: PropTypes.object.isRequired,
  valueAjvStates: PropTypes.object.isRequired,
  handleSetValue: PropTypes.func.isRequired,
};

