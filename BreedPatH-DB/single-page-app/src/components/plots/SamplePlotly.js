import React, { useState, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import Plot from 'react-plotly.js';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import Snackbar from '../snackbar/Snackbar';
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import api from '../../requests/requests.index'

const useStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(2),
  },
  card: {
    maxWidth: 345,
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(8),
  },
  formControl: {
    width: '100%'
  },
  plotDiv: {
    minWidth: 454,
  },
  plot: {
    width: "100%",
    height: "100%",
  },
}));

export default function SamplePlotly(props) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  //state
  const [data, setData] = useState([ {x: [], y: [], type: 'bar',} ]);
  const [layout, setLayout] = useState({title: '', autosize: true});
  const [frames, setFrames] = useState([]);
  const [config, setConfig] = useState({
    responsive: true, 
    displaylogo: false
  }); 
  const [selectedAttribute, setSelectedAttribute] = useState("");

  //model attributes
  const modelAttributes = getModelAttributes();

  //server url
  const graphqlServerUrl = useSelector(state => state.urls.graphqlServerUrl);

  //snackbar
  const variant = useRef('info');
  const errors = useRef([]);
  const content = useRef((key, message) => (
    <Snackbar id={key} message={message} errors={errors.current}
    variant={variant.current} />
  ));
  const actionText = useRef(t('modelPanels.gotIt', "Got it"));
  const action = useRef((key) => (
    <>
      <Button color='inherit' variant='text' size='small' 
      onClick={() => { closeSnackbar(key) }}>
        {actionText.current}
      </Button>
    </> 
  ));

  /**
   * Callbacks:
   */

   /**
    * showMessage
    * 
    * Show the given message in a notistack snackbar.
    * 
    */
   const showMessage = useCallback((message, withDetail) => {
    enqueueSnackbar( message, {
      variant: variant.current,
      preventDuplicate: false,
      persist: true,
      action: !withDetail ? action.current : undefined,
      content: withDetail ? content.current : undefined,
    });
  },[enqueueSnackbar]);

  /**
    * Handlers
    */
  const handleChangeSelectedAttribute = (event) => {
    setSelectedAttribute(event.target.value);
  }

  const handleClickOnGeneratePlot = (event) => {
    getItemsAttribute(selectedAttribute);
  }

  /**
    * Utils functions
    */
  async function getItemsAttribute(attribute) {
    /**
      * API Request
      */
      api.sample.getItemsAttribute(graphqlServerUrl, attribute)
    .then((response) => {
      
      //check data
      if(response.data.data.samplesConnection) {
        //reduce to {x1:y1, x2:y2, ...}
        let result = response.data.data.samplesConnection.edges.reduce((acc, item) => {
          let key = item.node[attribute];
          if(!acc[key]) acc[key] = 1; //first ocurrence
          else acc[key]++;
          return acc;
        }, {});

        //update title
        setLayout((current) => ({...current[0], title: attribute}));

        //update plot data
        setData((current) => ([{...current[0], x: [...Object.keys(result)], y: [...Object.values(result)]}]));
      }

      //check: graphql errors
      if(response.data.errors) {
        let newError = {};
        let withDetails=true;
        variant.current='info';
        newError.message = 'samplesConnection: ' + t('modelPanels.errors.data.e3', 'fetched with errors.');
        newError.locations=[{model: 'sample', query: 'samplesConnection', method: 'getItemsAttribute()', request: 'api.sample.getItemsAttribute'}];
        newError.path=['Samples', 'csvTemplate'];
        newError.extensions = {graphQL:{data:response.data.data, errors:response.data.errors}};
        errors.current.push(newError);
        console.log("Error: ", newError);

        showMessage(newError.message, withDetails);
      }
    })
    .catch((error) => {
      let newError = {};
      let withDetails=true;
      variant.current='error';
      newError.message = t('modelPanels.errors.request.e1', 'Error in request made to server.');
      newError.locations=[{model: 'sample', query: 'samplesConnection', method: 'getItemsAttribute()', request: 'api.sample.getItemsAttribute'}];
      newError.path=['Samples', 'Plot'];
      newError.extensions = {error};
      errors.current.push(newError);      
      console.log("Error: ", newError);
      console.log("@@: error: ", error);
      
      showMessage(newError.message, withDetails);
    });
  }

  function getModelAttributes() {
    return [
      "name",
      "sampling_date",
      "type",
      "biological_replicate_no",
      "lab_code",
      "treatment",
      "tissue",
      "individual_id",
      "sequencing_experiment_id",
    ];
  }

  return (
    <div className={classes.root}>
      <Grid container>
        {/*
          Selector 
        */}
        <Grid item xs={12}>
          <Grid container spacing={1}>
            <Grid item>
              <Card className={classes.card}>
                <CardContent>
                  <Typography gutterBottom variant="h4">
                    { t('modelPanels.plot1.title', 'Bar chart') }
                  </Typography>
                  <Typography variant="body2" color="textSecondary" component="p">
                    { t('modelPanels.plot1.description', "Select a model attribute and click on button 'generate plot' to generate a frequency distribution bar chart of the selected attribute.") }
                  </Typography>
                </CardContent>
                <CardContent>
                  <FormControl className={classes.formControl}>
                    <TextField 
                      id="select" 
                      label={t('modelPanels.plot1.label', 'Attributes')}
                      value={selectedAttribute}
                      variant="outlined" 
                      select
                      onChange={handleChangeSelectedAttribute}
                    >
                      <MenuItem value="">
                        <em>{t('modelPanels.plot1.none', 'None')}</em>
                      </MenuItem>

                      {modelAttributes.map((item, index) => {
                        return (
                          <MenuItem key={index} value={item}>
                            {item}
                          </MenuItem>
                        );
                      })}
                    </TextField>
                  </FormControl>
                </CardContent>
                <CardActions>
                  <Button 
                    color="primary"
                    disabled={(selectedAttribute==="") ? true : false}
                    onClick={handleClickOnGeneratePlot}
                  >
                    {t('modelPanels.plot1.button', 'Generate plot')}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            {/*
              Plot 
            */}
            <Grid item xs>
              <div className={classes.plotDiv}>
                <Plot
                  data={data}
                  layout={layout}
                  frames={frames}
                  config={config}
                  useResizeHandler={true}
                  className={classes.plot}

                  onInitialized={(figure) => {
                    setData(figure.data);
                    setLayout(figure.layout);
                    setFrames(figure.frames);
                    setConfig(figure.config);
                  }}
                  onUpdate={(figure) => {
                    setData(figure.data);
                    setLayout(figure.layout);
                    setFrames(figure.frames);
                    setConfig(figure.config);
                  }}
                />
              </div>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}
