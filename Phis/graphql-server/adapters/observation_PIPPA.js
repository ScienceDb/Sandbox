const axios_general = require('axios');
const globals = require('../config/globals');
const {
    handleError
} = require('../utils/errors');

let axios = axios_general.create();
axios.defaults.timeout = globals.MAX_TIME_OUT;

const remoteCenzontleURL = "http://pippa-graphql-container:3002/graphql";
const iriRegex = new RegExp('pippa');

module.exports = class observation_PIPPA {

    static get adapterName() {
        return 'observation_PIPPA';
    }

    static get adapterType() {
        return 'ddm-adapter';
    }

    static recognizeId(iri) {
        return iriRegex.test(iri);
    }

    static readById(iri) {
        let query = `
          query
            readOneObservation
            {
              readOneObservation(observationDbId:"${iri}")
              {
                observationDbId 
                collector 
                germplasmDbId 
                observationTimeStamp 
                observationUnitDbId 
                observationVariableDbId 
                studyDbId 
                uploadedBy 
                value 
                seasonDbId 
                imageDbId 
              }
            }`;

        return axios.post(remoteCenzontleURL, {
            query: query
        }).then(res => {
            //check
            if (res && res.data && res.data.data) {
                return res.data.data.readOneObservation;
            } else {
                throw new Error(`Invalid response from remote cenz-server: ${remoteCenzontleURL}`);
            }
        }).catch(error => {
            error['url'] = remoteCenzontleURL;
            handleError(error);
        });
    }

    static countRecords(search) {
        let query = `
      query countObservations($search: searchObservationInput){
        countObservations(search: $search)
      }`

        return axios.post(remoteCenzontleURL, {
            query: query,
            variables: {
                search: search
            }
        }).then(res => {
            //check
            if (res && res.data && res.data.data) {
                return res.data.data.countObservations;
            } else {
                throw new Error(`Invalid response from remote cenz-server: ${remoteCenzontleURL}`);
            }
        }).catch(error => {
            error['url'] = remoteCenzontleURL;
            handleError(error);
        });
    }

    static readAllCursor(search, order, pagination) {
        //check valid pagination arguments
        let argsValid = (pagination === undefined) || (pagination.first && !pagination.before && !pagination.last) || (pagination.last && !pagination.after && !pagination.first);
        if (!argsValid) {
            throw new Error('Illegal cursor based pagination arguments. Use either "first" and optionally "after", or "last" and optionally "before"!');
        }
        let query = `query observationsConnection($search: searchObservationInput $pagination: paginationCursorInput $order: [orderObservationInput]){
      observationsConnection(search:$search pagination:$pagination order:$order){ edges{cursor node{  observationDbId  collector
         germplasmDbId
         observationTimeStamp
         observationUnitDbId
         observationVariableDbId
         studyDbId
         uploadedBy
         value
         seasonDbId
         imageDbId
        } } pageInfo{ startCursor endCursor hasPreviousPage hasNextPage } } }`

        return axios.post(remoteCenzontleURL, {
            query: query,
            variables: {
                search: search,
                order: order,
                pagination: pagination
            }
        }).then(res => {
            //check
            if (res && res.data && res.data.data) {
                return res.data.data.observationsConnection;
            } else {
                throw new Error(`Invalid response from remote cenz-server: ${remoteCenzontleURL}`);
            }
        }).catch(error => {
            error['url'] = remoteCenzontleURL;
            handleError(error);
        });
    }

    static addOne(input) {
        let query = `
        mutation addObservation(
          $observationDbId:ID!  
          $collector:String
          $observationTimeStamp:DateTime
          $uploadedBy:String
          $value:String        ){
          addObservation(          observationDbId:$observationDbId  
          collector:$collector
          observationTimeStamp:$observationTimeStamp
          uploadedBy:$uploadedBy
          value:$value){
            observationDbId            collector
            germplasmDbId
            observationTimeStamp
            observationUnitDbId
            observationVariableDbId
            studyDbId
            uploadedBy
            value
            seasonDbId
            imageDbId
          }
        }`;

        return axios.post(remoteCenzontleURL, {
            query: query,
            variables: input
        }).then(res => {
            //check
            if (res && res.data && res.data.data) {
                return res.data.data.addObservation;
            } else {
                throw new Error(`Invalid response from remote cenz-server: ${remoteCenzontleURL}`);
            }
        }).catch(error => {
            error['url'] = remoteCenzontleURL;
            handleError(error);
        });
    }

    static deleteOne(id) {
        let query = `
          mutation
            deleteObservation{
              deleteObservation(
                observationDbId: "${id}" )}`;

        return axios.post(remoteCenzontleURL, {
            query: query
        }).then(res => {
            //check
            if (res && res.data && res.data.data) {
                return res.data.data.deleteObservation;
            } else {
                throw new Error(`Invalid response from remote cenz-server: ${remoteCenzontleURL}`);
            }
        }).catch(error => {
            error['url'] = remoteCenzontleURL;
            handleError(error);
        });
    }

    static updateOne(input) {
        let query = `
          mutation
            updateObservation(
              $observationDbId:ID! 
              $collector:String 
              $observationTimeStamp:DateTime 
              $uploadedBy:String 
              $value:String             ){
              updateObservation(
                observationDbId:$observationDbId 
                collector:$collector 
                observationTimeStamp:$observationTimeStamp 
                uploadedBy:$uploadedBy 
                value:$value               ){
                observationDbId 
                collector 
                germplasmDbId 
                observationTimeStamp 
                observationUnitDbId 
                observationVariableDbId 
                studyDbId 
                uploadedBy 
                value 
                seasonDbId 
                imageDbId 
              }
            }`

        return axios.post(remoteCenzontleURL, {
            query: query,
            variables: input
        }).then(res => {
            //check
            if (res && res.data && res.data.data) {
                return res.data.data.updateObservation;
            } else {
                throw new Error(`Invalid response from remote cenz-server: ${remoteCenzontleURL}`);
            }
        }).catch(error => {
            error['url'] = remoteCenzontleURL;
            handleError(error);
        });
    }


    /**
     * add_seasonDbId - field Mutation (adapter-layer) for to_one associationsArguments to add
     *
     * @param {Id}   observationDbId   IdAttribute of the root model to be updated
     * @param {Id}   seasonDbId Foreign Key (stored in "Me") of the Association to be updated.
     */




    /**
     * add_germplasmDbId - field Mutation (adapter-layer) for to_one associationsArguments to add
     *
     * @param {Id}   observationDbId   IdAttribute of the root model to be updated
     * @param {Id}   germplasmDbId Foreign Key (stored in "Me") of the Association to be updated.
     */




    /**
     * add_observationUnitDbId - field Mutation (adapter-layer) for to_one associationsArguments to add
     *
     * @param {Id}   observationDbId   IdAttribute of the root model to be updated
     * @param {Id}   observationUnitDbId Foreign Key (stored in "Me") of the Association to be updated.
     */




    /**
     * add_observationVariableDbId - field Mutation (adapter-layer) for to_one associationsArguments to add
     *
     * @param {Id}   observationDbId   IdAttribute of the root model to be updated
     * @param {Id}   observationVariableDbId Foreign Key (stored in "Me") of the Association to be updated.
     */




    /**
     * add_studyDbId - field Mutation (adapter-layer) for to_one associationsArguments to add
     *
     * @param {Id}   observationDbId   IdAttribute of the root model to be updated
     * @param {Id}   studyDbId Foreign Key (stored in "Me") of the Association to be updated.
     */




    /**
     * add_imageDbId - field Mutation (adapter-layer) for to_one associationsArguments to add
     *
     * @param {Id}   observationDbId   IdAttribute of the root model to be updated
     * @param {Id}   imageDbId Foreign Key (stored in "Me") of the Association to be updated.
     */





    /**
     * remove_seasonDbId - field Mutation (adapter-layer) for to_one associationsArguments to remove
     *
     * @param {Id}   observationDbId   IdAttribute of the root model to be updated
     * @param {Id}   seasonDbId Foreign Key (stored in "Me") of the Association to be updated.
     */




    /**
     * remove_germplasmDbId - field Mutation (adapter-layer) for to_one associationsArguments to remove
     *
     * @param {Id}   observationDbId   IdAttribute of the root model to be updated
     * @param {Id}   germplasmDbId Foreign Key (stored in "Me") of the Association to be updated.
     */




    /**
     * remove_observationUnitDbId - field Mutation (adapter-layer) for to_one associationsArguments to remove
     *
     * @param {Id}   observationDbId   IdAttribute of the root model to be updated
     * @param {Id}   observationUnitDbId Foreign Key (stored in "Me") of the Association to be updated.
     */




    /**
     * remove_observationVariableDbId - field Mutation (adapter-layer) for to_one associationsArguments to remove
     *
     * @param {Id}   observationDbId   IdAttribute of the root model to be updated
     * @param {Id}   observationVariableDbId Foreign Key (stored in "Me") of the Association to be updated.
     */




    /**
     * remove_studyDbId - field Mutation (adapter-layer) for to_one associationsArguments to remove
     *
     * @param {Id}   observationDbId   IdAttribute of the root model to be updated
     * @param {Id}   studyDbId Foreign Key (stored in "Me") of the Association to be updated.
     */




    /**
     * remove_imageDbId - field Mutation (adapter-layer) for to_one associationsArguments to remove
     *
     * @param {Id}   observationDbId   IdAttribute of the root model to be updated
     * @param {Id}   imageDbId Foreign Key (stored in "Me") of the Association to be updated.
     */







    static bulkAddCsv(context) {
        throw new Error("observation.bulkAddCsv is not implemented.")
    }

    static csvTableTemplate() {
        let query = `query { csvTableTemplateObservation }`;
        return axios.post(remoteCenzontleURL, {
            query: query
        }).then(res => {
            //check
            if (res && res.data && res.data.data) {
                return res.data.data.csvTableTemplateObservation;
            } else {
                throw new Error(`Invalid response from remote cenz-server: ${remoteCenzontleURL}`);
            }
        }).catch(error => {
            error['url'] = remoteCenzontleURL;
            handleError(error);
        });
    }
}