import requestGraphql from './request.graphql'
import getAttributes from './requests.attributes'

export default {
  
  tableTemplate(url) {
    let query = `query {csvTableTemplateAccession}`

    /**
     * Debug
     */
    console.log("tableTemplate.query: gql:\n", query);

    return requestGraphql({ url, query });
  },

  /**
   * getCountItems
   * 
   * Get count of items from GraphQL Server.
   *  
   * @param {String} url GraphQL Server url
   * @param {String} searchText Text string currently on search bar.
   * @param {String} ops Object with adittional query options.
   */
  getCountItems(url, searchText, ops) {
    //search
    var s = getSearchArgument('accession', searchText, ops);
    
    var query = '';

    //if has search
    if (s !== null) {
      query = `{ countAccessions(${s}) }`;
    }
    else {
      query = `{ countAccessions }`;
    }

    /**
     * Debug
     */
    console.log("getCountItems.query: gql:\n", query);

    return requestGraphql({ url, query });
  },

  /**
   * getItemsConnection
   * 
   * Get items from GraphQL Server using a cursor-based-connection. 
   * 
   * @param {String} url GraphQL Server url
   * @param {String} searchText Text string currently on search bar.
   * @param {String} orderBy Order field string.
   * @param {String} orderDirection Text string: asc | desc.
   * @param {Object} variables Object with cursor-based-pagination variables. 
   * @param {String} ops Object with additional query options.
   */
  getItemsConnection(url, searchText, orderBy, orderDirection, variables, ops) {
    //search
    var s = getSearchArgument('accession', searchText, ops);

    //order
    var o = null;
    if (orderBy !== '' && orderBy !== null) {
      let upOrderDirection = String(orderDirection).toUpperCase();
      o = `order: [ {field: ${orderBy}, order: ${upOrderDirection}} ]`;
    }
    
    var query = '';
    var qbody = `
          pageInfo {
            startCursor
            endCursor
            hasPreviousPage
            hasNextPage
          }
          edges {
            node {
              accession_id,
              collectors_name,
              collectors_initials,
              sampling_date,
              sampling_number,
              catalog_number,
              institution_deposited,
              collection_name,
              collection_acronym,
              identified_by,
              identification_date,
              abundance,
              habitat,
              observations,
              family,
              genus,
              species,
              subspecies,
              variety,
              race,
              form,
              taxon_id,
              collection_deposit,
              collect_number,
              collect_source,
              collected_seeds,
              collected_plants,
              collected_other,
              habit,
              local_name,
              locationId,
              location{ locationId },
              taxon{ id },
            }
          }`

    //if has search
    if (s !== null) {
      //if has order
      if (o != null) {
        
        query =
          `query accessionsConnection($pagination: paginationCursorInput)
            { accessionsConnection( ${s}, ${o}, pagination: $pagination ) {
              ${qbody}
            }}`
      }
      else {

        query =
          `query accessionsConnection($pagination: paginationCursorInput)
            { accessionsConnection( ${s}, pagination: $pagination ) {
              ${qbody}
            }}`
      }
    }
    else {
      //if has order
      if (o != null) {
        
        query =
          `query accessionsConnection($pagination: paginationCursorInput)
          { accessionsConnection( ${o}, pagination: $pagination ) {
            ${qbody}
          }}`
      }
      else {
        
        query =
          `query accessionsConnection($pagination: paginationCursorInput)
          { accessionsConnection( pagination: $pagination ) {
            ${qbody}
          }}`
      }
    }

    /**
     * Debug
     */
    console.log("getItemsConnection.query: gql:\n", query);
    console.log("getItemsConnection.variables: gql:\n", variables);

    return requestGraphql({ url, query, variables });

  },

  /**
   * createItem
   * 
   * Add new Accession item on GraphQL Server.
   * 
   * @param {String} url GraphQL Server url.
   * @param {Object} variables Object with values to create new Accession item. 
   */
  createItem(url, variables) {
    var query = 
      `mutation
        addAccession(
          $accession_id:ID!,
          $collectors_name:String,
          $collectors_initials:String,
          $sampling_date:Date,
          $sampling_number:String,
          $catalog_number:String,
          $institution_deposited:String,
          $collection_name:String,
          $collection_acronym:String,
          $identified_by:String,
          $identification_date:Date,
          $abundance:String,
          $habitat:String,
          $observations:String,
          $family:String,
          $genus:String,
          $species:String,
          $subspecies:String,
          $variety:String,
          $race:String,
          $form:String,
          $collection_deposit:String,
          $collect_number:String,
          $collect_source:String,
          $collected_seeds:Int,
          $collected_plants:Int,
          $collected_other:String,
          $habit:String,
          $local_name:String,
          $addLocation: ID,
          $addTaxon: ID,
          $addIndividuals: [ID],
          $addMeasurements: [ID],
          ) { addAccession(
            accession_id:$accession_id,
            collectors_name:$collectors_name,
            collectors_initials:$collectors_initials,
            sampling_date:$sampling_date,
            sampling_number:$sampling_number,
            catalog_number:$catalog_number,
            institution_deposited:$institution_deposited,
            collection_name:$collection_name,
            collection_acronym:$collection_acronym,
            identified_by:$identified_by,
            identification_date:$identification_date,
            abundance:$abundance,
            habitat:$habitat,
            observations:$observations,
            family:$family,
            genus:$genus,
            species:$species,
            subspecies:$subspecies,
            variety:$variety,
            race:$race,
            form:$form,
            collection_deposit:$collection_deposit,
            collect_number:$collect_number,
            collect_source:$collect_source,
            collected_seeds:$collected_seeds,
            collected_plants:$collected_plants,
            collected_other:$collected_other,
            habit:$habit,
            local_name:$local_name,
            addLocation: $addLocation,
            addTaxon: $addTaxon,
            addIndividuals: $addIndividuals,
            addMeasurements: $addMeasurements,
          ) {
            accession_id,
            collectors_name,
            collectors_initials,
            sampling_date,
            sampling_number,
            catalog_number,
            institution_deposited,
            collection_name,
            collection_acronym,
            identified_by,
            identification_date,
            abundance,
            habitat,
            observations,
            family,
            genus,
            species,
            subspecies,
            variety,
            race,
            form,
            taxon_id,
            collection_deposit,
            collect_number,
            collect_source,
            collected_seeds,
            collected_plants,
            collected_other,
            habit,
            local_name,
            locationId,
            location{ locationId },
            taxon{ id },
          } }`;

    /**
     * Debug
     */
    console.log("createItem.query: gql:\n", query);
    console.log("createItem.variables: gql:\n", variables);

    return requestGraphql({ url, query, variables });
  },

  /**
   * updateItem
   * 
   * Update Accession item on GraphQL Server.
   * 
   * @param {String} url GraphQL Server url.
   * @param {Object} variables Object with values to update the given Accession item.  
   */
  updateItem(url, variables) {
    var query = 
      `mutation
        updateAccession(
          $accession_id:ID!
          $collectors_name:String,
          $collectors_initials:String,
          $sampling_date:Date,
          $sampling_number:String,
          $catalog_number:String,
          $institution_deposited:String,
          $collection_name:String,
          $collection_acronym:String,
          $identified_by:String,
          $identification_date:Date,
          $abundance:String,
          $habitat:String,
          $observations:String,
          $family:String,
          $genus:String,
          $species:String,
          $subspecies:String,
          $variety:String,
          $race:String,
          $form:String,
          $collection_deposit:String,
          $collect_number:String,
          $collect_source:String,
          $collected_seeds:Int,
          $collected_plants:Int,
          $collected_other:String,
          $habit:String,
          $local_name:String,
          $addLocation: ID,
          $removeLocation: ID,
          $addTaxon: ID,
          $removeTaxon: ID,
          $addIndividuals: [ID],
          $removeIndividuals: [ID],
          $addMeasurements: [ID],
          $removeMeasurements: [ID],
          ) { updateAccession(
            accession_id: $accession_id
            collectors_name: $collectors_name,
            collectors_initials: $collectors_initials,
            sampling_date: $sampling_date,
            sampling_number: $sampling_number,
            catalog_number: $catalog_number,
            institution_deposited: $institution_deposited,
            collection_name: $collection_name,
            collection_acronym: $collection_acronym,
            identified_by: $identified_by,
            identification_date: $identification_date,
            abundance: $abundance,
            habitat: $habitat,
            observations: $observations,
            family: $family,
            genus: $genus,
            species: $species,
            subspecies: $subspecies,
            variety: $variety,
            race: $race,
            form: $form,
            collection_deposit: $collection_deposit,
            collect_number: $collect_number,
            collect_source: $collect_source,
            collected_seeds: $collected_seeds,
            collected_plants: $collected_plants,
            collected_other: $collected_other,
            habit: $habit,
            local_name: $local_name,
            addLocation: $addLocation,
            removeLocation: $removeLocation,
            addTaxon: $addTaxon,
            removeTaxon: $removeTaxon,
            addIndividuals: $addIndividuals,
            removeIndividuals: $removeIndividuals,
            addMeasurements: $addMeasurements,
            removeMeasurements: $removeMeasurements,
          ) {
            accession_id,
            collectors_name,
            collectors_initials,
            sampling_date,
            sampling_number,
            catalog_number,
            institution_deposited,
            collection_name,
            collection_acronym,
            identified_by,
            identification_date,
            abundance,
            habitat,
            observations,
            family,
            genus,
            species,
            subspecies,
            variety,
            race,
            form,
            taxon_id,
            collection_deposit,
            collect_number,
            collect_source,
            collected_seeds,
            collected_plants,
            collected_other,
            habit,
            local_name,
            locationId,
            location{ locationId },
            taxon{ id },
          } }`;

    /**
     * Debug
     */
    console.log("updateItem.query: gql:\n", query);
    console.log("updateItem.variables: gql:\n", variables);

    return requestGraphql({ url, query, variables });
  },

  /**
   * deleteItem
   * 
   * Delete an item on GraphQL Server.
   * 
   * @param {String} url GraphQL Server url.
   * @param {Object} variables Object with values needed to delete the Accession item. 
   */
  deleteItem(url, variables) {
    var query = 
      `mutation
        deleteAccession(
          $accession_id:ID! 
        ) {
          deleteAccession(
            accession_id:$accession_id
        ) }`

    /**
     * Debug
     */
    console.log("deleteItem.query: gql:\n", query);
    console.log("deleteItem.variables: gql:\n", variables);

    return requestGraphql({ url, query, variables });
  },

  /**
   * getIndividualsConnection
   * 
   * Get individuals connection (cursor based) records associated to the given accession record
   * through association 'Individuals', from GraphQL Server.
   * 
   * 
   * @param {String} url GraphQL Server url
   * @param {Number} itemId Model item internalId.
   * @param {String} label Label name.
   * @param {String} sublabel Sublabel name.
   * @param {String} searchText Text string currently on search bar.
   * @param {Object} variables Object with cursor-based-pagination variables.
   * @param {String} ops Object with adittional query options.
   */
  getIndividualsConnection(url, itemId, label, sublabel, searchText, variables, ops) {
    //search
    var s = getSearchArgument('individual', searchText, ops); 

    var qbody = `
          pageInfo {
            startCursor
            endCursor
            hasPreviousPage
            hasNextPage
          },
          edges {
            node {
              name,
              origin,
              description,
              accession_id,
              genotypeId,
              field_unit_id,
            }
          }`

    var query = (s) ?
      `query readOneAccession($pagination: paginationCursorInput) {
        readOneAccession(accession_id: "${itemId}") { 
          individualsConnection( ${s}, pagination: $pagination ) { 
            ${qbody},
          },
          countFilteredIndividuals( ${s} ) 
      } }` :      
      `query readOneAccession($pagination: paginationCursorInput) {
        readOneAccession(accession_id: "${itemId}") { 
          individualsConnection( pagination: $pagination ) { 
            ${qbody},
          },
          countFilteredIndividuals 
      } }`;

    /**
     * Debug
     */
    console.log("getAssociationFilter.query: gql:\n", query);
    console.log("getAssociationFilter.variables: gql:\n", variables);

    return requestGraphql({ url, query, variables });
  },

  /**
   * 
   *  
   * getAssociatedIndividualsConnection
   * 
   * Get the individual-ids associated (by cursor based connection) to the given accession record 
   * through association 'Individuals', from GraphQL Server.
   * 
   * @param {String} url GraphQL Server url
   * @param {Number} itemId Model item internalId.
   */
  getAssociatedIndividualsConnection(url, itemId) {
    var query = 
      `{ readOneAccession( accession_id: "${itemId}" ){ 
        individualsConnection{ edges { node { name } } } } }`;
    /**
     * Debug
     */
    console.log("getAssociatedIds.query: gql:\n", query);

    return requestGraphql({ url, query });
  },
  /**
   * getLocationConnection
   * 
   * Get locations connection (cursor based) records associated to the given accession record
   * through association 'Location', from GraphQL Server.
   * 
   * 
   * @param {String} url GraphQL Server url
   * @param {Number} itemId Model item internalId.
   * @param {String} label Label name.
   * @param {String} sublabel Sublabel name.
   * @param {String} searchText Text string currently on search bar.
   * @param {Object} variables Object with cursor-based-pagination variables.
   * @param {String} ops Object with adittional query options.
   */
  getLocationConnection(url, itemId, label, sublabel, searchText, variables, ops) {
    var query = 
      `{ readOneAccession(accession_id: "${itemId}") { 
        location{ 
          locationId,
          country,
          state,
          municipality,
          locality,
          latitude,
          longitude,
          altitude,
          natural_area,
          natural_area_name,
          georeference_method,
          georeference_source,
          datum,
          vegetation,
          stoniness,
          sewer,
          topography,
          slope,
      } } }`;

    /**
     * Debug
     */
    console.log("getAssociationFilter.query: gql:\n", query);
    console.log("getAssociationFilter.variables: gql:\n", variables);

    return requestGraphql({ url, query, variables });
  },

  /**
   * 
   *  
   * getAssociatedLocationConnection
   * 
   * Get the location-ids associated (by cursor based connection) to the given accession record 
   * through association 'Location', from GraphQL Server.
   * 
   * @param {String} url GraphQL Server url
   * @param {Number} itemId Model item internalId.
   */
  getAssociatedLocationConnection(url, itemId) {
    var query = 
    `{ readOneAccession( accession_id: "${itemId}" ){ 
      location{ locationId } } }`;
    /**
     * Debug
     */
    console.log("getAssociatedIds.query: gql:\n", query);

    return requestGraphql({ url, query });
  },
  /**
   * getMeasurementsConnection
   * 
   * Get measurements connection (cursor based) records associated to the given accession record
   * through association 'Measurements', from GraphQL Server.
   * 
   * 
   * @param {String} url GraphQL Server url
   * @param {Number} itemId Model item internalId.
   * @param {String} label Label name.
   * @param {String} sublabel Sublabel name.
   * @param {String} searchText Text string currently on search bar.
   * @param {Object} variables Object with cursor-based-pagination variables.
   * @param {String} ops Object with adittional query options.
   */
  getMeasurementsConnection(url, itemId, label, sublabel, searchText, variables, ops) {
    //search
    var s = getSearchArgument('measurement', searchText, ops); 

    var qbody = `
          pageInfo {
            startCursor
            endCursor
            hasPreviousPage
            hasNextPage
          },
          edges {
            node {
              measurement_id,
              name,
              method,
              reference,
              reference_link,
              value,
              unit,
              short_name,
              comments,
              field_unit_id,
              individual_id,
              accession_id,
            }
          }`

    var query = (s) ?
      `query readOneAccession($pagination: paginationCursorInput) {
        readOneAccession(accession_id: "${itemId}") { 
          measurementsConnection( ${s}, pagination: $pagination ) { 
            ${qbody},
          },
          countFilteredMeasurements( ${s} ) 
      } }` :      
      `query readOneAccession($pagination: paginationCursorInput) {
        readOneAccession(accession_id: "${itemId}") { 
          measurementsConnection( pagination: $pagination ) { 
            ${qbody},
          },
          countFilteredMeasurements 
      } }`;

    /**
     * Debug
     */
    console.log("getAssociationFilter.query: gql:\n", query);
    console.log("getAssociationFilter.variables: gql:\n", variables);

    return requestGraphql({ url, query, variables });
  },

  /**
   * 
   *  
   * getAssociatedMeasurementsConnection
   * 
   * Get the measurement-ids associated (by cursor based connection) to the given accession record 
   * through association 'Measurements', from GraphQL Server.
   * 
   * @param {String} url GraphQL Server url
   * @param {Number} itemId Model item internalId.
   */
  getAssociatedMeasurementsConnection(url, itemId) {
    var query = 
      `{ readOneAccession( accession_id: "${itemId}" ){ 
        measurementsConnection{ edges { node { measurement_id } } } } }`;
    /**
     * Debug
     */
    console.log("getAssociatedIds.query: gql:\n", query);

    return requestGraphql({ url, query });
  },
  /**
   * getTaxonConnection
   * 
   * Get taxons connection (cursor based) records associated to the given accession record
   * through association 'Taxon', from GraphQL Server.
   * 
   * 
   * @param {String} url GraphQL Server url
   * @param {Number} itemId Model item internalId.
   * @param {String} label Label name.
   * @param {String} sublabel Sublabel name.
   * @param {String} searchText Text string currently on search bar.
   * @param {Object} variables Object with cursor-based-pagination variables.
   * @param {String} ops Object with adittional query options.
   */
  getTaxonConnection(url, itemId, label, sublabel, searchText, variables, ops) {
    var query = 
      `{ readOneAccession(accession_id: "${itemId}") { 
        taxon{ 
          id,
          taxon,
          categoria,
          estatus,
          nombreAutoridad,
          citaNomenclatural,
          fuente,
          ambiente,
          grupoSNIB,
          categoriaResidencia,
          nom,
          cites,
          iucn,
          prioritarias,
          endemismo,
      } } }`;

    /**
     * Debug
     */
    console.log("getAssociationFilter.query: gql:\n", query);
    console.log("getAssociationFilter.variables: gql:\n", variables);

    return requestGraphql({ url, query, variables });
  },

  /**
   * 
   *  
   * getAssociatedTaxonConnection
   * 
   * Get the taxon-ids associated (by cursor based connection) to the given accession record 
   * through association 'Taxon', from GraphQL Server.
   * 
   * @param {String} url GraphQL Server url
   * @param {Number} itemId Model item internalId.
   */
  getAssociatedTaxonConnection(url, itemId) {
    var query = 
    `{ readOneAccession( accession_id: "${itemId}" ){ 
      taxon{ id } } }`;
    /**
     * Debug
     */
    console.log("getAssociatedIds.query: gql:\n", query);

    return requestGraphql({ url, query });
  },
}

/**
 * Utils
 */
function getSearchArgument(filterName, searchText, ops) {
  
  var filterAttributes = getAttributes(filterName);
  var modelAttributes = Object.keys(filterAttributes);
  var ors = '';
  var orSearch = null;
  var ands = '';
  var andSearch = null;

  if(searchText !== null && searchText !== '' && modelAttributes.length > 0) {
    /*
      Make AND fields
    */
    var words = searchText.split(' ');

    //for each word
    for(let w = 0; w < words.length; w++) {
      /*
        Make OR fields
      */

      //for each attribute
      for(let i = 0; i < modelAttributes.length; i++) {
        let num = 0;
        let d = '';
        let t = '';
        let dt = '';

        switch (filterAttributes[modelAttributes[i]]) {
          case 'String':
            //add
            ors += `{field:${modelAttributes[i]}, value:{value:"%${words[w]}%"}, operator:like},`
            break;

          case 'Int':
            num = parseInt(words[w]);
            //add if: word is an integer number
            if (!isNaN(num)) {
              ors += `{field:${modelAttributes[i]}, value:{value:"${num}"}, operator:eq},`
            }
            break;

          case 'Float':
            num = parseFloat(words[w]);
            //add if: word is a float number
            if (!isNaN(num)) {
              ors += `{field:${modelAttributes[i]}, value:{value:"${num}"}, operator:eq},`
            }
            break;

          case 'Boolean':
            //add if: word is 'true' or 'false'
            if (words[w] === 'true' || words[w] === 'false') {
              ors += `{field:${modelAttributes[i]}, value:{value:"${words[w]}"}, operator:eq},`
            }
            break;

          case 'Date':
            d = getIsoDate(words[w]);
            //add if: word is an ISO date
            if (d !== '') {
              ors += `{field:${modelAttributes[i]}, value:{value:"${d}"}, operator:eq},`
            }
            break;

          case 'Time':
            t = getIsoTime(words[w]);
            //add if: word is an ISO time
            if (t !== '') {
              ors += `{field:${modelAttributes[i]}, value:{value:"${t}"}, operator:eq},`
            }
            break;

          case 'DateTime':
            dt = getIsoDateTime(words[w]);
            //add if: word is an ISO datetime
            if (dt !== '') {
              ors += `{field:${modelAttributes[i]}, value:{value:"${dt}"}, operator:eq},`
            }
            break;

          default:
            break;
        }

        //make OR search argument
        orSearch = `{operator:or, search: [ ${ors} ]},`

      }//end: for each attribute (ORs)

      //add to ANDs
      ands += orSearch;

    }//end: for each word (ANDs)

    /*
      Options
    */
    if (ops !== undefined && ops !== null && typeof ops === 'object') {

      /*
        -- 'only' option --
        For each field name in only array, an AND search argument will be added to search string. 

        Format:
          {
            only: [
              {
                values: {
                  'fieldName1': ['value1', 'value2', ..., 'valueN'],
                  ...
                  'fieldNameM': ['value1', 'value2', ..., 'valueN'],
                }
                type: 'type'
              },
              ...
              {
                values: {
                  'fieldName1': ['value1', 'value2', ..., 'valueN'],
                  ...
                  'fieldNameN': ['value1', 'value2', ..., 'valueN'],
                }
                type: 'type'
              }
            ]
          }
      */
      if (ops.hasOwnProperty('only') && Array.isArray(ops.only)) {
        let onlyOrs = '';
        let onlySearch = '';

        //for each only object
        for(let i = 0; i < ops.only.length; i++) {
          let o = ops.only[i];
          /*
            Switch type
            At the momment, this only works for [InternalId] fields.
            An internalID can be of types: Int, Float or String.
          */
          if (o.type === 'Int' || o.type === 'Float' || o.type === 'String') {
            let v = o.values;
            let vkeys = Object.keys(v);

            //for each key
            for(let k = 0; k < vkeys.length; k++) {
              let va = v[vkeys[k]]; //values array

              //for each value
              for(let kv = 0; kv < va.length; kv++) {
                onlyOrs += `{field:${vkeys[k]}, value:{value:"${String(va[kv])}"}, operator:eq},`
              }//end: for earch value
            }//end: for earch key
          }//end: if type 'Int
        }//end: for earch only object

        onlySearch = `{operator:or, search: [ ${onlyOrs} ]},`;
        ands += onlySearch;

      }//end: if has 'only'

      /*
        -- 'exclude' option --
        For each field name in exclude array, an AND search argument will be added to search string. 

        Format:
          {
            exclude: [
              {
                values: {
                  'fieldName1': ['value1', 'value2', ..., 'valueN'],
                  ...
                  'fieldNameM': ['value1', 'value2', ..., 'valueN'],
                }
                type: 'type'
              },
              ...
              {
                values: {
                  'fieldName1': ['value1', 'value2', ..., 'valueN'],
                  ...
                  'fieldNameN': ['value1', 'value2', ..., 'valueN'],
                }
                type: 'type'
              }
            ]
          }
      */
      if (ops.hasOwnProperty('exclude') && Array.isArray(ops.exclude)) {
        //for each exclude object
        for(let i = 0; i < ops.exclude.length; i++) {
          let o = ops.exclude[i];

          /*
            Switch type
            At the momment, this only works for [InternalId] fields.
            An internalID can be of types: Int, Float or String.
          */
          if (o.type === 'Int' || o.type === 'Float' || o.type === 'String') {
            let v = o.values;
            let vkeys = Object.keys(v);

            //for each key
            for(let k = 0; k < vkeys.length; k++) {
              let va = v[vkeys[k]]; //values array

              //for each value
              for(let kv = 0; kv < va.length; kv++) {
                ands += `{field:${vkeys[k]}, value:{value:"${String(va[kv])}"}, operator:ne},`
              }//end: for earch value
            }//end: for earch key
          }//end: if type 'Int
        }//end: for earch exclude object
      }//end: if has 'exclude'
    }//end: if has 'ops'

    //make search argument
    andSearch = `search: {operator:and, search: [ ${ands} ]}`
  }//end: if searchText
  else {
    /*
      Check: ops
    */
    /*
      Options
    */
    if (ops !== undefined && ops !== null && typeof ops === 'object') {
      /*
        -- 'only' option --
        For each field name in only array, an AND search argument will be added to search string. 
  
        Format:
          {
            only: [
              {
                values: {
                  'fieldName1': ['value1', 'value2', ..., 'valueN'],
                  ...
                  'fieldNameM': ['value1', 'value2', ..., 'valueN'],
                }
                type: 'type'
              },
              ...
              {
                values: {
                  'fieldName1': ['value1', 'value2', ..., 'valueN'],
                  ...
                  'fieldNameN': ['value1', 'value2', ..., 'valueN'],
                }
                type: 'type'
              }
            ]
          }
      */
      if (ops.hasOwnProperty('only') && Array.isArray(ops.only)) {
        let onlyOrs = '';
        let onlySearch = '';

        //for each only object
        for(let i = 0; i < ops.only.length; i++) {
          let o = ops.only[i];
          /*
            Switch type
            At the momment, this only works for [InternalId] fields.
            An internalID can be of types: Int, Float or String.
          */
          if (o.type === 'Int' || o.type === 'Float' || o.type === 'String') {
            let v = o.values;
            let vkeys = Object.keys(v);

            //for each key
            for(let k = 0; k < vkeys.length; k++) {
              let va = v[vkeys[k]]; //values array

              //for each value
              for(let kv = 0; kv < va.length; kv++) {
                onlyOrs += `{field:${vkeys[k]}, value:{value:"${String(va[kv])}"}, operator:eq},`
              }//end: for earch value
            }//end: for earch key
          }//end: if type 'Int
        }//end: for earch only object

        onlySearch = `{operator:or, search: [ ${onlyOrs} ]},`;
        ands += onlySearch;

      }//end: if has 'only'

      /*
        -- 'exclude' option --
        For each field name in exclude array, an AND search argument will be added to search string. 
  
        Format:
          {
            exclude: [
              {
                values: {
                  'fieldName1': ['value1', 'value2', ..., 'valueN'],
                  ...
                  'fieldNameM': ['value1', 'value2', ..., 'valueN'],
                }
                type: 'type'
              },
              ...
              {
                values: {
                  'fieldName1': ['value1', 'value2', ..., 'valueN'],
                  ...
                  'fieldNameN': ['value1', 'value2', ..., 'valueN'],
                }
                type: 'type'
              }
            ]
          }
      */
      if (ops.hasOwnProperty('exclude') && Array.isArray(ops.exclude)) {

        //for each exclude object
        for(let i = 0; i < ops.exclude.length; i++) {
          let o = ops.exclude[i];
          /*
            Switch type
            At the momment, this only works for [InternalId] fields.
            An internalID can be of types: Int, Float or String.
          */
          if (o.type === 'Int' || o.type === 'Float' || o.type === 'String') {
            let v = o.values;
            let vkeys = Object.keys(v);

            //for each key
            for(let k = 0; k < vkeys.length; k++) {
              let va = v[vkeys[k]]; //values array

              //for each value
              for(let kv = 0; kv < va.length; kv++) {
                ands += `{field:${vkeys[k]}, value:{value:"${String(va[kv])}"}, operator:ne},`
              }//end: for earch value
            }//end: for earch key
          }//end: if type 'Int
        }//end: for earch exclude object
      }//end: if has 'exclude'

      //make search argument
      andSearch = `search: {operator:and, search: [ ${ands} ]}`
    }//end: if has 'ops'
  }//end: if !searchText

  return andSearch;
}

function getIsoDate(text) {
  //if has the form: aaaa[-/]mm[-/]dd
  if (/^\d{4}[-/][01]\d[-/][0-3]\d/.test(text)) {

    let m = text.slice(5, 7);
    let d = text.slice(8, 10);

    let numM = parseInt(m);
    let numD = parseInt(d);

    //if has the correct content
    if ((numM >= 1 && numM <= 12) && (numD >= 1 && numD <= 31)) {
      return text;
    }
  }
  return '';
}

function getIsoTime(text) {

  /**
   * Case: complete precision: hh:mm:ss.d+
   */
  if (/^[0-2]\d:[0-5]\d:[0-5]\d\.\d+/.test(text)) {

    let h = text.slice(0, 2);
    let numH = parseInt(h);

    if (numH >= 0 && numH <= 23) {
      return text;
    }

    return '';
  } else {
    /**
     * Case: no milliseconds: hh:mm:ss
     */
    if (/^[0-2]\d:[0-5]\d:[0-5]\d/.test(text)) {

      let h = text.slice(0, 2);
      let numH = parseInt(h);

      if (numH >= 0 && numH <= 23) {
        return text;
      }

      return '';
    } else {
      /**
       * Case: no seconds: hh:mm
       */
      if (/^[0-2]\d:[0-5]\d/.test(text)) {

        let h = text.slice(0, 2);
        let numH = parseInt(h);

        if (numH >= 0 && numH <= 23) {
          return text;
        }

        return '';
      }
    }
  }

  return '';
}

function getIsoDateTime(text) {

  /**
   * Case: complete precision: YYYY[-/]MM[-/]DD[ T]hh:mm:ss.d+
   */
  if (/^\d{4}[/-][01]\d[/-][0-3]\d[T ][0-2]\d:[0-5]\d:[0-5]\d\.\d+/.test(text)) {

    let M = text.slice(5, 7);
    let D = text.slice(8, 10);
    let h = text.slice(11, 13);

    let numM = parseInt(M);
    let numD = parseInt(D);
    let numH = parseInt(h);

    //if content ok
    if ((numM >= 1 && numM <= 12) && (numD >= 1 && numD <= 31) && (numH >= 0 && numH <= 23)) {
      return text;
    }

    return '';
  } else {
    /**
     * Case: no milliseconds: YYYY[-/]MM[-/]DD[ T]hh:mm:ss
     */
    if (/^\d{4}[/-][01]\d[/-][0-3]\d[T ][0-2]\d:[0-5]\d:[0-5]\d/.test(text)) {

      let M = text.slice(5, 7);
      let D = text.slice(8, 10);
      let h = text.slice(11, 13);

      let numM = parseInt(M);
      let numD = parseInt(D);
      let numH = parseInt(h);

      //if content ok
      if ((numM >= 1 && numM <= 12) && (numD >= 1 && numD <= 31) && (numH >= 0 && numH <= 23)) {
        return text;
      }

      return '';
    } else {
      /**
       * Case: no seconds: YYYY[-/]MM[-/]DD[ T]hh:mm
       */
      if (/^\d{4}[/-][01]\d[/-][0-3]\d[T ][0-2]\d:[0-5]\d/.test(text)) {

        let M = text.slice(5, 7);
        let D = text.slice(8, 10);
        let h = text.slice(11, 13);

        let numM = parseInt(M);
        let numD = parseInt(D);
        let numH = parseInt(h);

        //if content ok
        if ((numM >= 1 && numM <= 12) && (numD >= 1 && numD <= 31) && (numH >= 0 && numH <= 23)) {
          return text;
        }

        return '';
      } else {
        /**
         * Case: no time: YYYY[-/]MM[-/]DD
         */
        if (/^\d{4}[/-][01]\d[/-][0-3]\d/.test(text)) {

          let M = text.slice(5, 7);
          let D = text.slice(8, 10);

          let numM = parseInt(M);
          let numD = parseInt(D);

          //if content ok
          if ((numM >= 1 && numM <= 12) && (numD >= 1 && numD <= 31)) {
            return text;
          }

          return '';
        }
      }
    }
  }

  return '';
}