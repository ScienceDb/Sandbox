import React from 'react';
import PropTypes from 'prop-types';
import AssaysCompactView from './assays-compact-view/AssaysCompactView'
import FileAttachmentsCompactView from './fileAttachments-compact-view/FileAttachmentsCompactView'
import OntologyAnnotationCompactView from './ontologyAnnotation-compact-view/OntologyAnnotationCompactView'
import StudiesCompactView from './studies-compact-view/StudiesCompactView'
import FactorAssociationsMenuTabs from './FactorAssociationsMenuTabs'
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Fade from '@material-ui/core/Fade';

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(0),
    minHeight: `calc(57vh + 84px)`,
  },
  menu: {
    marginTop: theme.spacing(0),
  }
}));

export default function FactorAssociationsPage(props) {
  const classes = useStyles();
  const {
    item,
    deleted,
    handleClickOnAssayRow,
    handleClickOnFileAttachmentRow,
    handleClickOnOntologyAnnotationRow,
    handleClickOnStudyRow,
  } = props;
  const [associationSelected, setAssociationSelected] = React.useState('assays');

  const handleAssociationClick = (event, newValue) => {
    setAssociationSelected(newValue);
  }

  return (
    <Fade in={!deleted} timeout={500}>
      <Grid
        id='FactorAssociationsPage-div-root'
        className={classes.root} 
        container 
        justify='center'
        alignItems='flex-start'
        alignContent='flex-start'
        spacing={2}
      > 
        {/* Menu Tabs: Associations */}
        <Grid item xs={12} sm={10} md={9} lg={8} xl={7} className={classes.menu}>
          <FactorAssociationsMenuTabs
            associationSelected={associationSelected}
            handleClick={handleAssociationClick}
          />
        </Grid>

        {/* Assays Compact View */}
        {(associationSelected === 'assays') && (
          <Grid item xs={12} sm={10} md={9} lg={8} xl={7}>
            <AssaysCompactView
              item={item}
              handleClickOnAssayRow={handleClickOnAssayRow}
            />
          </Grid>
        )}
        {/* FileAttachments Compact View */}
        {(associationSelected === 'fileAttachments') && (
          <Grid item xs={12} sm={10} md={9} lg={8} xl={7}>
            <FileAttachmentsCompactView
              item={item}
              handleClickOnFileAttachmentRow={handleClickOnFileAttachmentRow}
            />
          </Grid>
        )}
        {/* OntologyAnnotation Compact View */}
        {(associationSelected === 'ontologyAnnotation') && (
          <Grid item xs={12} sm={10} md={9} lg={8} xl={7}>
            <OntologyAnnotationCompactView
              item={item}
              handleClickOnOntologyAnnotationRow={handleClickOnOntologyAnnotationRow}
            />
          </Grid>
        )}
        {/* Studies Compact View */}
        {(associationSelected === 'studies') && (
          <Grid item xs={12} sm={10} md={9} lg={8} xl={7}>
            <StudiesCompactView
              item={item}
              handleClickOnStudyRow={handleClickOnStudyRow}
            />
          </Grid>
        )}

      </Grid>
    </Fade>
  );
}
FactorAssociationsPage.propTypes = {
  item: PropTypes.object.isRequired,
  deleted: PropTypes.bool,
  handleClickOnAssayRow: PropTypes.func.isRequired, 
  handleClickOnFileAttachmentRow: PropTypes.func.isRequired, 
  handleClickOnOntologyAnnotationRow: PropTypes.func.isRequired, 
  handleClickOnStudyRow: PropTypes.func.isRequired, 
};
