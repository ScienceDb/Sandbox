import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Key from '@material-ui/icons/VpnKey';

export default function CountryEnhancedTableHead(props) {
  const { t } = useTranslation();
  const {
    permissions,
    order,
    orderBy,
    onRequestSort
  } = props;

  return (
    <TableHead>
      <TableRow>

        {/* See-info icon */}
        <TableCell padding="checkbox" />

        {/* Actions */}
        {
          /* acl check */
          (permissions&&permissions.country&&Array.isArray(permissions.country)
          &&(permissions.country.includes('update') || permissions.country.includes('delete') || permissions.country.includes('*')))
          &&(
            <TableCell 
              padding="checkbox" 
              align='center' 
              size='small' 
              colSpan={
                0 +
                ((permissions.country.includes('update') || permissions.country.includes('*')) ? 1 : 0) 
                +
                ((permissions.country.includes('delete') || permissions.country.includes('*')) ? 1 : 0)
              }
            >
              <Typography color="inherit" variant="caption">
                { t('modelPanels.actions') }
              </Typography>
            </TableCell>
          )
        }

        {/* 
          Headers 
        */}

        {/* country_id*/}
        <TableCell
          key='country_id'
          align='left'
          padding="checkbox"
          sortDirection={orderBy === 'country_id' ? order : false}
        >
          <TableSortLabel
            active={orderBy === 'country_id'}
            direction={order}
            onClick={(event) => { onRequestSort(event, 'country_id') }}
          >
          <Grid container alignItems='center' alignContent='center' wrap='nowrap' spacing={1}>
            <Grid item>
              <Tooltip title={ t('modelPanels.internalId', 'Unique Identifier') }>
                <Key fontSize="small" color="disabled" style={{ marginTop:8}} />
              </Tooltip>
            </Grid>
            <Grid item>
              <Typography color="inherit" variant="caption" display='inline' noWrap={true}>
                country_id              </Typography>
            </Grid>
          </Grid>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='name'
          align='left'
          padding="default"
          sortDirection={orderBy === 'name' ? order : false}
        >
          {/* name */}
          <TableSortLabel
              active={orderBy === 'name'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'name')}}
          >
            <Typography color="inherit" variant="caption">
              name
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='continent_id'
          align='left'
          padding="default"
          sortDirection={orderBy === 'continent_id' ? order : false}
        >
          {/* continent_id */}
          <TableSortLabel
              active={orderBy === 'continent_id'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'continent_id')}}
          >
            <Typography color="inherit" variant="caption">
              continent_id
            </Typography>
          </TableSortLabel>
        </TableCell>

        <TableCell
          key='river_ids'
          align='left'
          padding="default"
          sortDirection={orderBy === 'river_ids' ? order : false}
        >
          {/* river_ids */}
          <TableSortLabel
              active={orderBy === 'river_ids'}
              direction={order}
              onClick={(event) => {onRequestSort(event, 'river_ids')}}
          >
            <Typography color="inherit" variant="caption">
              river_ids
            </Typography>
          </TableSortLabel>
        </TableCell>

      </TableRow>
    </TableHead>
  );
}
CountryEnhancedTableHead.propTypes = {
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  onRequestSort: PropTypes.func.isRequired,
};