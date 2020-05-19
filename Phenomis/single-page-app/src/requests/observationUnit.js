import requestGraphql from './request.graphql'
import getAttributes from './requests.attributes'

export default {
  
  tableTemplate(url) {
    let query = `query {csvTableTemplateObservationUnit}`

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
    var s = getSearchArgument('observationUnit', searchText, ops);
    
    var query = '';

    //if has search
    if (s !== null) {
      query = `{ countObservationUnits(${s}) }`;
    }
    else {
      query = `{ countObservationUnits }`;
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
    var s = getSearchArgument('observationUnit', searchText, ops);

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
              germplasmDbId,
              locationDbId,
              observationLevel,
              observationUnitName,
              observationUnitPUI,
              plantNumber,
              plotNumber,
              programDbId,
              studyDbId,
              trialDbId,
              observationUnitDbId,
              germplasm{ germplasmDbId },
              location{ locationDbId },
              observationUnitPosition{ observationUnitPositionDbId },
              program{ programDbId },
              study{ studyDbId },
              trial{ trialDbId },
            }
          }`

    //if has search
    if (s !== null) {
      //if has order
      if (o != null) {
        
        query =
          `query observationUnitsConnection($pagination: paginationCursorInput)
            { observationUnitsConnection( ${s}, ${o}, pagination: $pagination ) {
              ${qbody}
            }}`
      }
      else {

        query =
          `query observationUnitsConnection($pagination: paginationCursorInput)
            { observationUnitsConnection( ${s}, pagination: $pagination ) {
              ${qbody}
            }}`
      }
    }
    else {
      //if has order
      if (o != null) {
        
        query =
          `query observationUnitsConnection($pagination: paginationCursorInput)
          { observationUnitsConnection( ${o}, pagination: $pagination ) {
            ${qbody}
          }}`
      }
      else {
        
        query =
          `query observationUnitsConnection($pagination: paginationCursorInput)
          { observationUnitsConnection( pagination: $pagination ) {
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
   * Add new ObservationUnit item on GraphQL Server.
   * 
   * @param {String} url GraphQL Server url.
   * @param {Object} variables Object with values to create new ObservationUnit item. 
   */
  createItem(url, variables) {
    var query = 
      `mutation
        addObservationUnit(
          $observationUnitDbId:ID!,
          $observationLevel:String,
          $observationUnitName:String,
          $observationUnitPUI:String,
          $plantNumber:String,
          $plotNumber:String,
          $addGermplasm: ID,
          $addLocation: ID,
          $addObservationUnitPosition: ID,
          $addProgram: ID,
          $addStudy: ID,
          $addTrial: ID,
          $addImages: [ID],
          $addObservations: [ID],
          $addObservationTreatments: [ID],
          $addObservationUnitToEvents: [ID],
          ) { addObservationUnit(
            observationUnitDbId:$observationUnitDbId,
            observationLevel:$observationLevel,
            observationUnitName:$observationUnitName,
            observationUnitPUI:$observationUnitPUI,
            plantNumber:$plantNumber,
            plotNumber:$plotNumber,
            addGermplasm: $addGermplasm,
            addLocation: $addLocation,
            addObservationUnitPosition: $addObservationUnitPosition,
            addProgram: $addProgram,
            addStudy: $addStudy,
            addTrial: $addTrial,
            addImages: $addImages,
            addObservations: $addObservations,
            addObservationTreatments: $addObservationTreatments,
            addObservationUnitToEvents: $addObservationUnitToEvents,
          ) {
            germplasmDbId,
            locationDbId,
            observationLevel,
            observationUnitName,
            observationUnitPUI,
            plantNumber,
            plotNumber,
            programDbId,
            studyDbId,
            trialDbId,
            observationUnitDbId,
            germplasm{ germplasmDbId },
            location{ locationDbId },
            observationUnitPosition{ observationUnitPositionDbId },
            program{ programDbId },
            study{ studyDbId },
            trial{ trialDbId },
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
   * Update ObservationUnit item on GraphQL Server.
   * 
   * @param {String} url GraphQL Server url.
   * @param {Object} variables Object with values to update the given ObservationUnit item.  
   */
  updateItem(url, variables) {
    var query = 
      `mutation
        updateObservationUnit(
          $observationUnitDbId:ID!
          $observationLevel:String,
          $observationUnitName:String,
          $observationUnitPUI:String,
          $plantNumber:String,
          $plotNumber:String,
          $addGermplasm: ID,
          $removeGermplasm: ID,
          $addLocation: ID,
          $removeLocation: ID,
          $addObservationUnitPosition: ID,
          $removeObservationUnitPosition: ID,
          $addProgram: ID,
          $removeProgram: ID,
          $addStudy: ID,
          $removeStudy: ID,
          $addTrial: ID,
          $removeTrial: ID,
          $addImages: [ID],
          $removeImages: [ID],
          $addObservations: [ID],
          $removeObservations: [ID],
          $addObservationTreatments: [ID],
          $removeObservationTreatments: [ID],
          $addObservationUnitToEvents: [ID],
          $removeObservationUnitToEvents: [ID],
          ) { updateObservationUnit(
            observationUnitDbId: $observationUnitDbId
            observationLevel: $observationLevel,
            observationUnitName: $observationUnitName,
            observationUnitPUI: $observationUnitPUI,
            plantNumber: $plantNumber,
            plotNumber: $plotNumber,
            addGermplasm: $addGermplasm,
            removeGermplasm: $removeGermplasm,
            addLocation: $addLocation,
            removeLocation: $removeLocation,
            addObservationUnitPosition: $addObservationUnitPosition,
            removeObservationUnitPosition: $removeObservationUnitPosition,
            addProgram: $addProgram,
            removeProgram: $removeProgram,
            addStudy: $addStudy,
            removeStudy: $removeStudy,
            addTrial: $addTrial,
            removeTrial: $removeTrial,
            addImages: $addImages,
            removeImages: $removeImages,
            addObservations: $addObservations,
            removeObservations: $removeObservations,
            addObservationTreatments: $addObservationTreatments,
            removeObservationTreatments: $removeObservationTreatments,
            addObservationUnitToEvents: $addObservationUnitToEvents,
            removeObservationUnitToEvents: $removeObservationUnitToEvents,
          ) {
            germplasmDbId,
            locationDbId,
            observationLevel,
            observationUnitName,
            observationUnitPUI,
            plantNumber,
            plotNumber,
            programDbId,
            studyDbId,
            trialDbId,
            observationUnitDbId,
            germplasm{ germplasmDbId },
            location{ locationDbId },
            observationUnitPosition{ observationUnitPositionDbId },
            program{ programDbId },
            study{ studyDbId },
            trial{ trialDbId },
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
   * @param {Object} variables Object with values needed to delete the ObservationUnit item. 
   */
  deleteItem(url, variables) {
    var query = 
      `mutation
        deleteObservationUnit(
          $observationUnitDbId:ID! 
        ) {
          deleteObservationUnit(
            observationUnitDbId:$observationUnitDbId
        ) }`

    /**
     * Debug
     */
    console.log("deleteItem.query: gql:\n", query);
    console.log("deleteItem.variables: gql:\n", variables);

    return requestGraphql({ url, query, variables });
  },

  /**
   * getGermplasmConnection
   * 
   * Get germplasms connection (cursor based) records associated to the given observationUnit record
   * through association 'Germplasm', from GraphQL Server.
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
  getGermplasmConnection(url, itemId, label, sublabel, searchText, variables, ops) {
    var query = 
      `{ readOneObservationUnit(observationUnitDbId: "${itemId}") { 
        germplasm{ 
          accessionNumber,
          acquisitionDate,
          breedingMethodDbId,
          commonCropName,
          countryOfOriginCode,
          defaultDisplayName,
          documentationURL,
          germplasmGenus,
          germplasmName,
          germplasmPUI,
          germplasmPreprocessing,
          germplasmSpecies,
          germplasmSubtaxa,
          instituteCode,
          instituteName,
          pedigree,
          seedSource,
          seedSourceDescription,
          speciesAuthority,
          subtaxaAuthority,
          xref,
          germplasmDbId,
          biologicalStatusOfAccessionCode,
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
   * getAssociatedGermplasmConnection
   * 
   * Get the germplasm-ids associated (by cursor based connection) to the given observationUnit record 
   * through association 'Germplasm', from GraphQL Server.
   * 
   * @param {String} url GraphQL Server url
   * @param {Number} itemId Model item internalId.
   */
  getAssociatedGermplasmConnection(url, itemId) {
    var query = 
    `{ readOneObservationUnit( observationUnitDbId: "${itemId}" ){ 
      germplasm{ germplasmDbId } } }`;
    /**
     * Debug
     */
    console.log("getAssociatedIds.query: gql:\n", query);

    return requestGraphql({ url, query });
  },
  /**
   * getImagesConnection
   * 
   * Get images connection (cursor based) records associated to the given observationUnit record
   * through association 'Images', from GraphQL Server.
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
  getImagesConnection(url, itemId, label, sublabel, searchText, variables, ops) {
    //search
    var s = getSearchArgument('image', searchText, ops); 

    var qbody = `
          pageInfo {
            startCursor
            endCursor
            hasPreviousPage
            hasNextPage
          },
          edges {
            node {
              copyright,
              description,
              imageFileName,
              imageFileSize,
              imageHeight,
              imageName,
              imageTimeStamp,
              imageURL,
              imageWidth,
              mimeType,
              observationUnitDbId,
              imageDbId,
            }
          }`

    var query = (s) ?
      `query readOneObservationUnit($pagination: paginationCursorInput) {
        readOneObservationUnit(observationUnitDbId: "${itemId}") { 
          imagesConnection( ${s}, pagination: $pagination ) { 
            ${qbody},
          },
          countFilteredImages( ${s} ) 
      } }` :      
      `query readOneObservationUnit($pagination: paginationCursorInput) {
        readOneObservationUnit(observationUnitDbId: "${itemId}") { 
          imagesConnection( pagination: $pagination ) { 
            ${qbody},
          },
          countFilteredImages 
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
   * getAssociatedImagesConnection
   * 
   * Get the image-ids associated (by cursor based connection) to the given observationUnit record 
   * through association 'Images', from GraphQL Server.
   * 
   * @param {String} url GraphQL Server url
   * @param {Number} itemId Model item internalId.
   */
  getAssociatedImagesConnection(url, itemId) {
    var query = 
      `{ readOneObservationUnit( observationUnitDbId: "${itemId}" ){ 
        imagesConnection{ edges { node { imageDbId } } } } }`;
    /**
     * Debug
     */
    console.log("getAssociatedIds.query: gql:\n", query);

    return requestGraphql({ url, query });
  },
  /**
   * getLocationConnection
   * 
   * Get locations connection (cursor based) records associated to the given observationUnit record
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
      `{ readOneObservationUnit(observationUnitDbId: "${itemId}") { 
        location{ 
          abbreviation,
          coordinateDescription,
          countryCode,
          countryName,
          documentationURL,
          environmentType,
          exposure,
          instituteAddress,
          instituteName,
          locationName,
          locationType,
          siteStatus,
          slope,
          topography,
          locationDbId,
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
   * Get the location-ids associated (by cursor based connection) to the given observationUnit record 
   * through association 'Location', from GraphQL Server.
   * 
   * @param {String} url GraphQL Server url
   * @param {Number} itemId Model item internalId.
   */
  getAssociatedLocationConnection(url, itemId) {
    var query = 
    `{ readOneObservationUnit( observationUnitDbId: "${itemId}" ){ 
      location{ locationDbId } } }`;
    /**
     * Debug
     */
    console.log("getAssociatedIds.query: gql:\n", query);

    return requestGraphql({ url, query });
  },
  /**
   * getObservationsConnection
   * 
   * Get observations connection (cursor based) records associated to the given observationUnit record
   * through association 'Observations', from GraphQL Server.
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
  getObservationsConnection(url, itemId, label, sublabel, searchText, variables, ops) {
    //search
    var s = getSearchArgument('observation', searchText, ops); 

    var qbody = `
          pageInfo {
            startCursor
            endCursor
            hasPreviousPage
            hasNextPage
          },
          edges {
            node {
              collector,
              germplasmDbId,
              observationTimeStamp,
              observationUnitDbId,
              observationVariableDbId,
              studyDbId,
              uploadedBy,
              value,
              observationDbId,
              seasonDbId,
              imageDbId,
            }
          }`

    var query = (s) ?
      `query readOneObservationUnit($pagination: paginationCursorInput) {
        readOneObservationUnit(observationUnitDbId: "${itemId}") { 
          observationsConnection( ${s}, pagination: $pagination ) { 
            ${qbody},
          },
          countFilteredObservations( ${s} ) 
      } }` :      
      `query readOneObservationUnit($pagination: paginationCursorInput) {
        readOneObservationUnit(observationUnitDbId: "${itemId}") { 
          observationsConnection( pagination: $pagination ) { 
            ${qbody},
          },
          countFilteredObservations 
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
   * getAssociatedObservationsConnection
   * 
   * Get the observation-ids associated (by cursor based connection) to the given observationUnit record 
   * through association 'Observations', from GraphQL Server.
   * 
   * @param {String} url GraphQL Server url
   * @param {Number} itemId Model item internalId.
   */
  getAssociatedObservationsConnection(url, itemId) {
    var query = 
      `{ readOneObservationUnit( observationUnitDbId: "${itemId}" ){ 
        observationsConnection{ edges { node { observationDbId } } } } }`;
    /**
     * Debug
     */
    console.log("getAssociatedIds.query: gql:\n", query);

    return requestGraphql({ url, query });
  },
  /**
   * getObservationTreatmentsConnection
   * 
   * Get observationTreatments connection (cursor based) records associated to the given observationUnit record
   * through association 'ObservationTreatments', from GraphQL Server.
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
  getObservationTreatmentsConnection(url, itemId, label, sublabel, searchText, variables, ops) {
    //search
    var s = getSearchArgument('observationTreatment', searchText, ops); 

    var qbody = `
          pageInfo {
            startCursor
            endCursor
            hasPreviousPage
            hasNextPage
          },
          edges {
            node {
              factor,
              modality,
              observationUnitDbId,
              observationTreatmentDbId,
            }
          }`

    var query = (s) ?
      `query readOneObservationUnit($pagination: paginationCursorInput) {
        readOneObservationUnit(observationUnitDbId: "${itemId}") { 
          observationTreatmentsConnection( ${s}, pagination: $pagination ) { 
            ${qbody},
          },
          countFilteredObservationTreatments( ${s} ) 
      } }` :      
      `query readOneObservationUnit($pagination: paginationCursorInput) {
        readOneObservationUnit(observationUnitDbId: "${itemId}") { 
          observationTreatmentsConnection( pagination: $pagination ) { 
            ${qbody},
          },
          countFilteredObservationTreatments 
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
   * getAssociatedObservationTreatmentsConnection
   * 
   * Get the observationTreatment-ids associated (by cursor based connection) to the given observationUnit record 
   * through association 'ObservationTreatments', from GraphQL Server.
   * 
   * @param {String} url GraphQL Server url
   * @param {Number} itemId Model item internalId.
   */
  getAssociatedObservationTreatmentsConnection(url, itemId) {
    var query = 
      `{ readOneObservationUnit( observationUnitDbId: "${itemId}" ){ 
        observationTreatmentsConnection{ edges { node { observationTreatmentDbId } } } } }`;
    /**
     * Debug
     */
    console.log("getAssociatedIds.query: gql:\n", query);

    return requestGraphql({ url, query });
  },
  /**
   * getObservationUnitPositionConnection
   * 
   * Get observationUnitPositions connection (cursor based) records associated to the given observationUnit record
   * through association 'ObservationUnitPosition', from GraphQL Server.
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
  getObservationUnitPositionConnection(url, itemId, label, sublabel, searchText, variables, ops) {
    var query = 
      `{ readOneObservationUnit(observationUnitDbId: "${itemId}") { 
        observationUnitPosition{ 
          blockNumber,
          entryNumber,
          positionCoordinateX,
          positionCoordinateY,
          replicate,
          observationUnitDbId,
          observationUnitPositionDbId,
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
   * getAssociatedObservationUnitPositionConnection
   * 
   * Get the observationUnitPosition-ids associated (by cursor based connection) to the given observationUnit record 
   * through association 'ObservationUnitPosition', from GraphQL Server.
   * 
   * @param {String} url GraphQL Server url
   * @param {Number} itemId Model item internalId.
   */
  getAssociatedObservationUnitPositionConnection(url, itemId) {
    var query = 
    `{ readOneObservationUnit( observationUnitDbId: "${itemId}" ){ 
      observationUnitPosition{ observationUnitPositionDbId } } }`;
    /**
     * Debug
     */
    console.log("getAssociatedIds.query: gql:\n", query);

    return requestGraphql({ url, query });
  },
  /**
   * getObservationUnitToEventsConnection
   * 
   * Get observationUnit_to_events connection (cursor based) records associated to the given observationUnit record
   * through association 'ObservationUnitToEvents', from GraphQL Server.
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
  getObservationUnitToEventsConnection(url, itemId, label, sublabel, searchText, variables, ops) {
    //search
    var s = getSearchArgument('observationUnit_to_event', searchText, ops); 

    var qbody = `
          pageInfo {
            startCursor
            endCursor
            hasPreviousPage
            hasNextPage
          },
          edges {
            node {
              observationUnitDbId,
              observationUnitDbId,
              eventDbId,
            }
          }`

    var query = (s) ?
      `query readOneObservationUnit($pagination: paginationCursorInput) {
        readOneObservationUnit(observationUnitDbId: "${itemId}") { 
          observationUnitToEventsConnection( ${s}, pagination: $pagination ) { 
            ${qbody},
          },
          countFilteredObservationUnitToEvents( ${s} ) 
      } }` :      
      `query readOneObservationUnit($pagination: paginationCursorInput) {
        readOneObservationUnit(observationUnitDbId: "${itemId}") { 
          observationUnitToEventsConnection( pagination: $pagination ) { 
            ${qbody},
          },
          countFilteredObservationUnitToEvents 
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
   * getAssociatedObservationUnitToEventsConnection
   * 
   * Get the observationUnit_to_event-ids associated (by cursor based connection) to the given observationUnit record 
   * through association 'ObservationUnitToEvents', from GraphQL Server.
   * 
   * @param {String} url GraphQL Server url
   * @param {Number} itemId Model item internalId.
   */
  getAssociatedObservationUnitToEventsConnection(url, itemId) {
    var query = 
      `{ readOneObservationUnit( observationUnitDbId: "${itemId}" ){ 
        observationUnitToEventsConnection{ edges { node { id } } } } }`;
    /**
     * Debug
     */
    console.log("getAssociatedIds.query: gql:\n", query);

    return requestGraphql({ url, query });
  },
  /**
   * getProgramConnection
   * 
   * Get programs connection (cursor based) records associated to the given observationUnit record
   * through association 'Program', from GraphQL Server.
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
  getProgramConnection(url, itemId, label, sublabel, searchText, variables, ops) {
    var query = 
      `{ readOneObservationUnit(observationUnitDbId: "${itemId}") { 
        program{ 
          abbreviation,
          commonCropName,
          documentationURL,
          leadPersonDbId,
          leadPersonName,
          objective,
          programName,
          programDbId,
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
   * getAssociatedProgramConnection
   * 
   * Get the program-ids associated (by cursor based connection) to the given observationUnit record 
   * through association 'Program', from GraphQL Server.
   * 
   * @param {String} url GraphQL Server url
   * @param {Number} itemId Model item internalId.
   */
  getAssociatedProgramConnection(url, itemId) {
    var query = 
    `{ readOneObservationUnit( observationUnitDbId: "${itemId}" ){ 
      program{ programDbId } } }`;
    /**
     * Debug
     */
    console.log("getAssociatedIds.query: gql:\n", query);

    return requestGraphql({ url, query });
  },
  /**
   * getStudyConnection
   * 
   * Get studies connection (cursor based) records associated to the given observationUnit record
   * through association 'Study', from GraphQL Server.
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
  getStudyConnection(url, itemId, label, sublabel, searchText, variables, ops) {
    var query = 
      `{ readOneObservationUnit(observationUnitDbId: "${itemId}") { 
        study{ 
          active,
          commonCropName,
          culturalPractices,
          documentationURL,
          endDate,
          license,
          observationUnitsDescription,
          startDate,
          studyDescription,
          studyName,
          studyType,
          trialDbId,
          studyDbId,
          locationDbId,
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
   * getAssociatedStudyConnection
   * 
   * Get the study-ids associated (by cursor based connection) to the given observationUnit record 
   * through association 'Study', from GraphQL Server.
   * 
   * @param {String} url GraphQL Server url
   * @param {Number} itemId Model item internalId.
   */
  getAssociatedStudyConnection(url, itemId) {
    var query = 
    `{ readOneObservationUnit( observationUnitDbId: "${itemId}" ){ 
      study{ studyDbId } } }`;
    /**
     * Debug
     */
    console.log("getAssociatedIds.query: gql:\n", query);

    return requestGraphql({ url, query });
  },
  /**
   * getTrialConnection
   * 
   * Get trials connection (cursor based) records associated to the given observationUnit record
   * through association 'Trial', from GraphQL Server.
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
  getTrialConnection(url, itemId, label, sublabel, searchText, variables, ops) {
    var query = 
      `{ readOneObservationUnit(observationUnitDbId: "${itemId}") { 
        trial{ 
          active,
          commonCropName,
          documentationURL,
          endDate,
          programDbId,
          startDate,
          trialDescription,
          trialName,
          trialPUI,
          trialDbId,
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
   * getAssociatedTrialConnection
   * 
   * Get the trial-ids associated (by cursor based connection) to the given observationUnit record 
   * through association 'Trial', from GraphQL Server.
   * 
   * @param {String} url GraphQL Server url
   * @param {Number} itemId Model item internalId.
   */
  getAssociatedTrialConnection(url, itemId) {
    var query = 
    `{ readOneObservationUnit( observationUnitDbId: "${itemId}" ){ 
      trial{ trialDbId } } }`;
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