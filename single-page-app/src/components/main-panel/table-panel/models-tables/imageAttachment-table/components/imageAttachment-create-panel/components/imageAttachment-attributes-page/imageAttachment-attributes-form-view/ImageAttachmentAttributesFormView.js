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

import FloatField from './components/FloatField'

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

export default function ImageAttachmentAttributesFormView(props) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { valueOkStates,
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
    <div id='ImageAttachmentAttributesFormView-div-root' className={classes.root}>
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
                    { t('modelPanels.model') + ': ImageAttachment' }
                </Typography>
              }
              subheader={getItemsOk()+' / 8 ' + t('modelPanels.completed')}
            >
            </CardHeader>
          </Card>
            
          <Card className={classes.card}>
            {/* 
              Fields 
            */}


            {/* fileName */}
            <CardContent key='fileName' className={classes.cardContent} >
              <StringField
                itemKey='fileName'
                name='fileName'
                label='fileName'
                valueOk={valueOkStates.fileName}
                valueAjv={valueAjvStates.fileName}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* fileSizeKb */}
            <CardContent key='fileSizeKb' className={classes.cardContent} >
              <FloatField
                itemKey='fileSizeKb'
                name='fileSizeKb'
                label='fileSizeKb'
                valueOk={valueOkStates.fileSizeKb}
                valueAjv={valueAjvStates.fileSizeKb}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* fileType */}
            <CardContent key='fileType' className={classes.cardContent} >
              <StringField
                itemKey='fileType'
                name='fileType'
                label='fileType'
                valueOk={valueOkStates.fileType}
                valueAjv={valueAjvStates.fileType}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* filePath */}
            <CardContent key='filePath' className={classes.cardContent} >
              <StringField
                itemKey='filePath'
                name='filePath'
                label='filePath'
                valueOk={valueOkStates.filePath}
                valueAjv={valueAjvStates.filePath}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* smallTnPath */}
            <CardContent key='smallTnPath' className={classes.cardContent} >
              <StringField
                itemKey='smallTnPath'
                name='smallTnPath'
                label='smallTnPath'
                valueOk={valueOkStates.smallTnPath}
                valueAjv={valueAjvStates.smallTnPath}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* mediumTnPath */}
            <CardContent key='mediumTnPath' className={classes.cardContent} >
              <StringField
                itemKey='mediumTnPath'
                name='mediumTnPath'
                label='mediumTnPath'
                valueOk={valueOkStates.mediumTnPath}
                valueAjv={valueAjvStates.mediumTnPath}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* licence */}
            <CardContent key='licence' className={classes.cardContent} >
              <StringField
                itemKey='licence'
                name='licence'
                label='licence'
                valueOk={valueOkStates.licence}
                valueAjv={valueAjvStates.licence}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* description */}
            <CardContent key='description' className={classes.cardContent} >
              <StringField
                itemKey='description'
                name='description'
                label='description'
                valueOk={valueOkStates.description}
                valueAjv={valueAjvStates.description}
                handleSetValue={handleSetValue}
              />
            </CardContent>
                        
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
ImageAttachmentAttributesFormView.propTypes = {
  valueOkStates: PropTypes.object.isRequired,
  valueAjvStates: PropTypes.object.isRequired,
  handleSetValue: PropTypes.func.isRequired,
};