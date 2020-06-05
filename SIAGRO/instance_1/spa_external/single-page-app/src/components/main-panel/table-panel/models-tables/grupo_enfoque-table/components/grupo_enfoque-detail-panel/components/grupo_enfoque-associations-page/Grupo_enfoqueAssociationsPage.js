import React from 'react';
import PropTypes from 'prop-types';
import CuadrantesCompactView from './cuadrantes-compact-view/CuadrantesCompactView'
import SitioCompactView from './sitio-compact-view/SitioCompactView'
import GrupoEnfoqueAssociationsMenuTabs from './Grupo_enfoqueAssociationsMenuTabs'
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

export default function GrupoEnfoqueAssociationsPage(props) {
  const classes = useStyles();
  const {
    item,
    deleted,
    handleClickOnCuadranteRow,
    handleClickOnSitioRow,
  } = props;
  const [associationSelected, setAssociationSelected] = React.useState('cuadrantes');

  const handleAssociationClick = (event, newValue) => {
    setAssociationSelected(newValue);
  }

  return (
    <Fade in={!deleted} timeout={500}>
      <Grid
        className={classes.root} 
        container 
        justify='center'
        alignItems='flex-start'
        alignContent='flex-start'
        spacing={2}
      > 
        {/* Menu Tabs: Associations */}
        <Grid item xs={12} sm={10} md={9} lg={8} xl={7} className={classes.menu}>
          <GrupoEnfoqueAssociationsMenuTabs
            associationSelected={associationSelected}
            handleClick={handleAssociationClick}
          />
        </Grid>

        {/* Cuadrantes Compact View */}
        {(associationSelected === 'cuadrantes') && (
          <Grid item xs={12} sm={10} md={9} lg={8} xl={7}>
            <CuadrantesCompactView
              item={item}
              handleClickOnCuadranteRow={handleClickOnCuadranteRow}
            />
          </Grid>
        )}
        {/* Sitio Compact View */}
        {(associationSelected === 'sitio') && (
          <Grid item xs={12} sm={10} md={9} lg={8} xl={7}>
            <SitioCompactView
              item={item}
              handleClickOnSitioRow={handleClickOnSitioRow}
            />
          </Grid>
        )}

      </Grid>
    </Fade>
  );
}
GrupoEnfoqueAssociationsPage.propTypes = {
  item: PropTypes.object.isRequired,
  deleted: PropTypes.bool,
  handleClickOnCuadranteRow: PropTypes.func.isRequired, 
  handleClickOnSitioRow: PropTypes.func.isRequired, 
};