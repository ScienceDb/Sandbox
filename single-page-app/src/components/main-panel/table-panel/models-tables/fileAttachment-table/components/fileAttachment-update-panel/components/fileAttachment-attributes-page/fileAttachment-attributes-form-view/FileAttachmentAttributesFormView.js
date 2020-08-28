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

            {/* fileSizeKb */}
            <CardContent key='fileSizeKb' className={classes.cardContent} >
              <StringField
                itemKey='fileSizeKb'
                name='fileSizeKb'
                label='fileSizeKb'
                text={item.fileSizeKb}
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
                text={item.fileType}
                valueOk={valueOkStates.fileType}
                valueAjv={valueAjvStates.fileType}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* fileUrl */}
            <CardContent key='fileUrl' className={classes.cardContent} >
              <StringField
                itemKey='fileUrl'
                name='fileUrl'
                label='fileUrl'
                text={item.fileUrl}
                valueOk={valueOkStates.fileUrl}
                valueAjv={valueAjvStates.fileUrl}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* smallTnUrl */}
            <CardContent key='smallTnUrl' className={classes.cardContent} >
              <StringField
                itemKey='smallTnUrl'
                name='smallTnUrl'
                label='smallTnUrl'
                text={item.smallTnUrl}
                valueOk={valueOkStates.smallTnUrl}
                valueAjv={valueAjvStates.smallTnUrl}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* mediumTnUrl */}
            <CardContent key='mediumTnUrl' className={classes.cardContent} >
              <StringField
                itemKey='mediumTnUrl'
                name='mediumTnUrl'
                label='mediumTnUrl'
                text={item.mediumTnUrl}
                valueOk={valueOkStates.mediumTnUrl}
                valueAjv={valueAjvStates.mediumTnUrl}
                handleSetValue={handleSetValue}
              />
            </CardContent>

            {/* licence */}
            <CardContent key='licence' className={classes.cardContent} >
              <StringField
                itemKey='licence'
                name='licence'
                label='licence'
                text={item.licence}
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
                text={item.description}
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
FileAttachmentAttributesFormView.propTypes = {
  item: PropTypes.object.isRequired,
  valueOkStates: PropTypes.object.isRequired,
  valueAjvStates: PropTypes.object.isRequired,
  handleSetValue: PropTypes.func.isRequired,
};
