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

import BoolField from './components/BoolField'

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

export default function FileAttachmentAttributesFormView(props) {
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
    <div id='FileAttachmentAttributesFormView-div-root' className={classes.root}>
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
                    { t('modelPanels.model') + ': FileAttachment' }
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
            {/* fileAttachment_id*/}
            <CardContent key='fileAttachment_id' className={classes.cardContent}>
              <Grid container alignItems='center' alignContent='center' wrap='nowrap' spacing={1}>
                <Grid item>
                  <Typography variant="h6" display="inline">fileAttachment_id:</Typography>
                  <Typography variant="h6" display="inline" color="textSecondary">&nbsp;{item.fileAttachment_id}</Typography>
                </Grid>
                {/*Key icon*/}
                <Grid item>
                  <Tooltip title={ t('modelPanels.internalId', 'Unique Identifier') }>
                    <Key fontSize="small" color="disabled" style={{ marginTop:8}} />
                  </Tooltip>
                </Grid>
              </Grid>
            </CardContent>


            {/* fileName */}
            <CardContent key='fileName' className={classes.cardContent} >
              <StringField
                itemKey='fileName'
                name='fileName'
                label='fileName'
                text={item.fileName}
                valueOk={valueOkStates.fileName}
                valueAjv={valueAjvStates.fileName}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* mimeType */}
            <CardContent key='mimeType' className={classes.cardContent} >
              <StringField
                itemKey='mimeType'
                name='mimeType'
                label='mimeType'
                text={item.mimeType}
                valueOk={valueOkStates.mimeType}
                valueAjv={valueAjvStates.mimeType}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* fileSizeKb */}
            <CardContent key='fileSizeKb' className={classes.cardContent} >
              <IntField
                itemKey='fileSizeKb'
                name='fileSizeKb'
                label='fileSizeKb'
                text={item.fileSizeKb}
                valueOk={valueOkStates.fileSizeKb}
                valueAjv={valueAjvStates.fileSizeKb}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* fileURL */}
            <CardContent key='fileURL' className={classes.cardContent} >
              <StringField
                itemKey='fileURL'
                name='fileURL'
                label='fileURL'
                text={item.fileURL}
                valueOk={valueOkStates.fileURL}
                valueAjv={valueAjvStates.fileURL}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* isImage */}
            <CardContent key='isImage' className={classes.cardContent} >
              <BoolField
                itemKey='isImage'
                name='isImage'
                label='isImage'
                text={item.isImage}
                valueOk={valueOkStates.isImage}
                valueAjv={valueAjvStates.isImage}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* smallThumbnailURL */}
            <CardContent key='smallThumbnailURL' className={classes.cardContent} >
              <StringField
                itemKey='smallThumbnailURL'
                name='smallThumbnailURL'
                label='smallThumbnailURL'
                text={item.smallThumbnailURL}
                valueOk={valueOkStates.smallThumbnailURL}
                valueAjv={valueAjvStates.smallThumbnailURL}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* bigThumbnailURL */}
            <CardContent key='bigThumbnailURL' className={classes.cardContent} >
              <StringField
                itemKey='bigThumbnailURL'
                name='bigThumbnailURL'
                label='bigThumbnailURL'
                text={item.bigThumbnailURL}
                valueOk={valueOkStates.bigThumbnailURL}
                valueAjv={valueAjvStates.bigThumbnailURL}
                handleSetValue={handleSetValue}
              />
            </CardContent>

          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
FileAttachmentAttributesFormView.propTypes = {
  item: PropTypes.object.isRequired,
  valueOkStates: PropTypes.object.isRequired,
  valueAjvStates: PropTypes.object.isRequired,
  handleSetValue: PropTypes.func.isRequired,
};

