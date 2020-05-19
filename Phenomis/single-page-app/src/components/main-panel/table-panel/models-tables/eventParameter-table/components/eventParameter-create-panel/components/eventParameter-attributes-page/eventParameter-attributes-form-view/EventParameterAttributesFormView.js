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

export default function EventParameterAttributesFormView(props) {
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
                    { t('modelPanels.model') + ': EventParameter' }
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

            {/* key */}
            <CardContent key='key' className={classes.cardContent} >
              <StringField
                itemKey='key'
                name='key'
                label='key'
                valueOk={valueOkStates.key}
                autoFocus={true}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* rdfValue */}
            <CardContent key='rdfValue' className={classes.cardContent} >
              <StringField
                itemKey='rdfValue'
                name='rdfValue'
                label='rdfValue'
                valueOk={valueOkStates.rdfValue}
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

            {/* eventParameterDbId */}
            <CardContent key='eventParameterDbId' className={classes.cardContent} >
              <StringField
                itemKey='eventParameterDbId'
                name='eventParameterDbId'
                label='eventParameterDbId'
                valueOk={valueOkStates.eventParameterDbId}
                handleSetValue={handleSetValue}
              />
            </CardContent>
                        
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
EventParameterAttributesFormView.propTypes = {
  valueOkStates: PropTypes.object.isRequired,
  handleSetValue: PropTypes.func.isRequired,
};