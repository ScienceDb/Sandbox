import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
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

export default function MethodAttributesFormView(props) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { item, 
          valueOkStates,
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
                    { t('modelPanels.model') + ': Method' }
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

            

            {/* description */}
            <CardContent key='description' className={classes.cardContent} >
              <StringField
                itemKey='description'
                name='description'
                label='description'
                text={item.description}
                valueOk={valueOkStates.description}
                autoFocus={true}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* formula */}
            <CardContent key='formula' className={classes.cardContent} >
              <StringField
                itemKey='formula'
                name='formula'
                label='formula'
                text={item.formula}
                valueOk={valueOkStates.formula}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* methodClass */}
            <CardContent key='methodClass' className={classes.cardContent} >
              <StringField
                itemKey='methodClass'
                name='methodClass'
                label='methodClass'
                text={item.methodClass}
                valueOk={valueOkStates.methodClass}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* methodName */}
            <CardContent key='methodName' className={classes.cardContent} >
              <StringField
                itemKey='methodName'
                name='methodName'
                label='methodName'
                text={item.methodName}
                valueOk={valueOkStates.methodName}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* reference */}
            <CardContent key='reference' className={classes.cardContent} >
              <StringField
                itemKey='reference'
                name='reference'
                label='reference'
                text={item.reference}
                valueOk={valueOkStates.reference}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* methodDbId */}
            <CardContent key='methodDbId' className={classes.cardContent} >
              <StringField
                itemKey='methodDbId'
                name='methodDbId'
                label='methodDbId'
                text={item.methodDbId}
                valueOk={valueOkStates.methodDbId}
                handleSetValue={handleSetValue}
              />
            </CardContent>

          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
MethodAttributesFormView.propTypes = {
  item: PropTypes.object.isRequired,
  valueOkStates: PropTypes.object.isRequired,
  handleSetValue: PropTypes.func.isRequired,
};

