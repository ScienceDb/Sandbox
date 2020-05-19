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

export default function ObservationUnitPositionAttributesFormView(props) {
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
                    { t('modelPanels.model') + ': ObservationUnitPosition' }
                </Typography>
              }
              subheader={getItemsOk()+' / 7 ' + t('modelPanels.completed')}
            >
            </CardHeader>
          </Card>
            
          <Card className={classes.card}>
            {/* 
              Fields 
            */}

            {/* blockNumber */}
            <CardContent key='blockNumber' className={classes.cardContent} >
              <StringField
                itemKey='blockNumber'
                name='blockNumber'
                label='blockNumber'
                valueOk={valueOkStates.blockNumber}
                autoFocus={true}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* entryNumber */}
            <CardContent key='entryNumber' className={classes.cardContent} >
              <StringField
                itemKey='entryNumber'
                name='entryNumber'
                label='entryNumber'
                valueOk={valueOkStates.entryNumber}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* positionCoordinateX */}
            <CardContent key='positionCoordinateX' className={classes.cardContent} >
              <StringField
                itemKey='positionCoordinateX'
                name='positionCoordinateX'
                label='positionCoordinateX'
                valueOk={valueOkStates.positionCoordinateX}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* positionCoordinateY */}
            <CardContent key='positionCoordinateY' className={classes.cardContent} >
              <StringField
                itemKey='positionCoordinateY'
                name='positionCoordinateY'
                label='positionCoordinateY'
                valueOk={valueOkStates.positionCoordinateY}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* replicate */}
            <CardContent key='replicate' className={classes.cardContent} >
              <StringField
                itemKey='replicate'
                name='replicate'
                label='replicate'
                valueOk={valueOkStates.replicate}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* observationUnitPositionDbId */}
            <CardContent key='observationUnitPositionDbId' className={classes.cardContent} >
              <StringField
                itemKey='observationUnitPositionDbId'
                name='observationUnitPositionDbId'
                label='observationUnitPositionDbId'
                valueOk={valueOkStates.observationUnitPositionDbId}
                handleSetValue={handleSetValue}
              />
            </CardContent>
                        
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
ObservationUnitPositionAttributesFormView.propTypes = {
  valueOkStates: PropTypes.object.isRequired,
  handleSetValue: PropTypes.func.isRequired,
};