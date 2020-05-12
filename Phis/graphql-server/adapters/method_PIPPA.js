const axios_general = require('axios');
const globals = require('../config/globals');
const {
    handleError
} = require('../utils/errors');

let axios = axios_general.create();
axios.defaults.timeout = globals.MAX_TIME_OUT;

const remoteCenzontleURL = "http://pippa-graphql-container:3002/graphql";
const iriRegex = new RegExp('pippa');

module.exports = class method_PIPPA {

    static get adapterName() {
        return 'method_PIPPA';
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
            readOneMethod
            {
              readOneMethod(methodDbId:"${iri}")
              {
                methodDbId 
                description 
                formula 
                methodClass 
                methodName 
                reference 
                ontologyDbId 
              }
            }`;

        return axios.post(remoteCenzontleURL, {
            query: query
        }).then(res => {
            //check
            if (res && res.data && res.data.data) {
                return res.data.data.readOneMethod;
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
      query countMethods($search: searchMethodInput){
        countMethods(search: $search)
      }`

        return axios.post(remoteCenzontleURL, {
            query: query,
            variables: {
                search: search
            }
        }).then(res => {
            //check
            if (res && res.data && res.data.data) {
                return res.data.data.countMethods;
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
        let query = `query methodsConnection($search: searchMethodInput $pagination: paginationCursorInput $order: [orderMethodInput]){
      methodsConnection(search:$search pagination:$pagination order:$order){ edges{cursor node{  methodDbId  description
         formula
         methodClass
         methodName
         reference
         ontologyDbId
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
                return res.data.data.methodsConnection;
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
        mutation addMethod(
          $methodDbId:ID!  
          $description:String
          $formula:String
          $methodClass:String
          $methodName:String
          $reference:String        ){
          addMethod(          methodDbId:$methodDbId  
          description:$description
          formula:$formula
          methodClass:$methodClass
          methodName:$methodName
          reference:$reference){
            methodDbId            description
            formula
            methodClass
            methodName
            reference
            ontologyDbId
          }
        }`;

        return axios.post(remoteCenzontleURL, {
            query: query,
            variables: input
        }).then(res => {
            //check
            if (res && res.data && res.data.data) {
                return res.data.data.addMethod;
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
            deleteMethod{
              deleteMethod(
                methodDbId: "${id}" )}`;

        return axios.post(remoteCenzontleURL, {
            query: query
        }).then(res => {
            //check
            if (res && res.data && res.data.data) {
                return res.data.data.deleteMethod;
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
            updateMethod(
              $methodDbId:ID! 
              $description:String 
              $formula:String 
              $methodClass:String 
              $methodName:String 
              $reference:String             ){
              updateMethod(
                methodDbId:$methodDbId 
                description:$description 
                formula:$formula 
                methodClass:$methodClass 
                methodName:$methodName 
                reference:$reference               ){
                methodDbId 
                description 
                formula 
                methodClass 
                methodName 
                reference 
                ontologyDbId 
              }
            }`

        return axios.post(remoteCenzontleURL, {
            query: query,
            variables: input
        }).then(res => {
            //check
            if (res && res.data && res.data.data) {
                return res.data.data.updateMethod;
            } else {
                throw new Error(`Invalid response from remote cenz-server: ${remoteCenzontleURL}`);
            }
        }).catch(error => {
            error['url'] = remoteCenzontleURL;
            handleError(error);
        });
    }


    /**
     * add_ontologyDbId - field Mutation (adapter-layer) for to_one associationsArguments to add
     *
     * @param {Id}   methodDbId   IdAttribute of the root model to be updated
     * @param {Id}   ontologyDbId Foreign Key (stored in "Me") of the Association to be updated.
     */





    /**
     * remove_ontologyDbId - field Mutation (adapter-layer) for to_one associationsArguments to remove
     *
     * @param {Id}   methodDbId   IdAttribute of the root model to be updated
     * @param {Id}   ontologyDbId Foreign Key (stored in "Me") of the Association to be updated.
     */







    static bulkAddCsv(context) {
        throw new Error("method.bulkAddCsv is not implemented.")
    }

    static csvTableTemplate() {
        let query = `query { csvTableTemplateMethod }`;
        return axios.post(remoteCenzontleURL, {
            query: query
        }).then(res => {
            //check
            if (res && res.data && res.data.data) {
                return res.data.data.csvTableTemplateMethod;
            } else {
                throw new Error(`Invalid response from remote cenz-server: ${remoteCenzontleURL}`);
            }
        }).catch(error => {
            error['url'] = remoteCenzontleURL;
            handleError(error);
        });
    }
}