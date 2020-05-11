/*
    Resolvers for basic CRUD operations
*/

const path = require('path');
const observationTreatment = require(path.join(__dirname, '..', 'models_index.js')).observationTreatment;
const helper = require('../utils/helper');
const checkAuthorization = require('../utils/check-authorization');
const fs = require('fs');
const {
    handleError
} = require('../utils/errors');
const os = require('os');
const resolvers = require(path.join(__dirname, 'index.js'));
const models = require(path.join(__dirname, '..', 'models_index.js'));
const globals = require('../config/globals');

const associationArgsDef = {
    'addObservationUnit': 'observationUnit'
}

/**
 * observationTreatment.prototype.observationUnit - Return associated record
 *
 * @param  {object} search       Search argument to match the associated record
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
observationTreatment.prototype.observationUnit = async function({
    search
}, context) {
    if (helper.isNotUndefinedAndNotNull(this.observationUnitDbId)) {
        try {
            if (search === undefined) {
                return resolvers.readOneObservationUnit({
                    [models.observationUnit.idAttribute()]: this.observationUnitDbId
                }, context)
            } else {
                //build new search filter
                let nsearch = helper.addSearchField({
                    "search": search,
                    "field": models.observationUnit.idAttribute(),
                    "value": {
                        "value": this.observationUnitDbId
                    },
                    "operator": "eq"
                });
                let found = await resolvers.observationUnitsConnection({
                    search: nsearch
                }, context);
                if (found) {
                    return found[0]
                }
                return found;
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        };
    }
}



/**
 * handleAssociations - handles the given associations in the create and update case.
 *
 * @param {object} input   Info of each field to create the new record
 * @param {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 */
observationTreatment.prototype.handleAssociations = async function(input, context) {
    try {
        let promises = [];

        if (helper.isNotUndefinedAndNotNull(input.addObservationUnit)) {
            promises.push(this.add_observationUnit(input, context));
        }

        if (helper.isNotUndefinedAndNotNull(input.removeObservationUnit)) {
            promises.push(this.remove_observationUnit(input, context));
        }

        await Promise.all(promises);
    } catch (error) {
        throw error
    }
}
/**
 * add_observationUnit - field Mutation for to_one associations to add
 *
 * @param {object} input   Info of input Ids to add  the association
 */
observationTreatment.prototype.add_observationUnit = async function(input) {
    await observationTreatment.add_observationUnitDbId(this.getIdValue(), input.addObservationUnit);
    this.observationUnitDbId = input.addObservationUnit;
}
/**
 * remove_observationUnit - field Mutation for to_one associations to remove
 *
 * @param {object} input   Info of input Ids to remove  the association
 */
observationTreatment.prototype.remove_observationUnit = async function(input) {
    if (input.removeObservationUnit == this.observationUnitDbId) {
        await observationTreatment.remove_observationUnitDbId(this.getIdValue(), input.removeObservationUnit);
        this.observationUnitDbId = null;
    }
}


/**
 * errorMessageForRecordsLimit(query) - returns error message in case the record limit is exceeded.
 *
 * @param {string} query The query that failed
 */
function errorMessageForRecordsLimit(query) {
    return "Max record limit of " + globals.LIMIT_RECORDS + " exceeded in " + query;
}

/**
 * checkCount(search, context, query) - Make sure that the current set of requested records does not exceed the record limit set in globals.js.
 *
 * @param {object} search  Search argument for filtering records
 * @param {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @param {string} query The query that makes this check
 */
async function checkCount(search, context, query) {
    if (await observationTreatment.countRecords(search).sum > context.recordsLimit) {
        throw new Error(errorMessageForRecordsLimit(query));
    }
}

/**
 * checkCountForOne(context) - Make sure that the record limit is not exhausted before requesting a single record
 *
 * @param {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 */
function checkCountForOne(context) {
    if (1 > context.recordsLimit) {
        throw new Error(errorMessageForRecordsLimit("readOneObservationTreatment"));
    }
}

/**
 * checkCountAgainAndAdaptLimit(context, numberOfFoundItems, query) - Make sure that the current set of requested records does not exceed the record limit set in globals.js.
 *
 * @param {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @param {number} numberOfFoundItems number of items that were found, to be subtracted from the current record limit
 * @param {string} query The query that makes this check
 */
function checkCountAgainAndAdaptLimit(context, numberOfFoundItems, query) {
    if (numberOfFoundItems > context.recordsLimit) {
        throw new Error(errorMessageForRecordsLimit(query));
    }
    context.recordsLimit -= numberOfFoundItems;
}
/**
 * countAllAssociatedRecords - Count records associated with another given record
 *
 * @param  {ID} id      Id of the record which the associations will be counted
 * @param  {objec} context Default context by resolver
 * @return {Int}         Number of associated records
 */
async function countAllAssociatedRecords(id, context) {

    let observationTreatment = await resolvers.readOneObservationTreatment({
        observationTreatmentDbId: id
    }, context);
    //check that record actually exists
    if (observationTreatment === null) throw new Error(`Record with ID = ${id} does not exist`);
    let promises_to_many = [];
    let promises_to_one = [];

    promises_to_one.push(observationTreatment.observationUnit({}, context));

    let result_to_many = await Promise.all(promises_to_many);
    let result_to_one = await Promise.all(promises_to_one);

    let get_to_many_associated = result_to_many.reduce((accumulator, current_val) => accumulator + current_val, 0);
    let get_to_one_associated = result_to_one.filter((r, index) => helper.isNotUndefinedAndNotNull(r)).length;

    return get_to_one_associated + get_to_many_associated;
}

/**
 * validForDeletion - Checks wether a record is allowed to be deleted
 *
 * @param  {ID} id      Id of record to check if it can be deleted
 * @param  {object} context Default context by resolver
 * @return {boolean}         True if it is allowed to be deleted and false otherwise
 */
async function validForDeletion(id, context) {
    if (await countAllAssociatedRecords(id, context) > 0) {
        throw new Error(`observationTreatment with observationTreatmentDbId ${id} has associated records and is NOT valid for deletion. Please clean up before you delete.`);
    }

    if (context.benignErrors.length > 0) {
        throw new Error('Errors occurred when counting associated records. No deletion permitted for reasons of security.');
    }

    return true;
}

module.exports = {

    /**
     * observationTreatmentsConnection - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
     */
    observationTreatmentsConnection: async function({
        search,
        order,
        pagination
    }, context) {
        //check: adapters
        let registeredAdapters = Object.values(observationTreatment.registeredAdapters);
        if (registeredAdapters.length === 0) {
            throw new Error('No adapters registered for data model "observationTreatment"');
        } //else

        try {
            //exclude adapters
            let adapters = helper.removeExcludedAdapters(search, registeredAdapters);
            if (adapters.length === 0) {
                throw new Error('All adapters was excluded for data model "observationTreatment"');
            } //else

            //check: auth adapters
            let authorizationCheck = await helper.authorizedAdapters(context, adapters, 'read');
            if (authorizationCheck.authorizedAdapters.length > 0) {
                let connectionObj = await observationTreatment.readAllCursor(search, order, pagination, authorizationCheck.authorizedAdapters);
                //check adapter authorization Errors
                if (authorizationCheck.authorizationErrors.length > 0) {
                    context.benignErrors = context.benignErrors.concat(authorizationCheck.authorizationErrors);
                }
                //check Errors returned by the model layer (time-outs, unreachable, etc...)
                if (connectionObj.errors !== undefined && Array.isArray(connectionObj.errors) && connectionObj.errors.length > 0) {
                    context.benignErrors = context.benignErrors.concat(connectionObj.errors)
                    delete connectionObj['errors']
                }
                return connectionObj;
            } else { //adapters not auth || errors
                // else new Error
                if (authorizationCheck.authorizationErrors.length > 0) {
                    throw new Error(authorizationCheck.authorizationErrors.reduce((a, c) => `${a}, ${c.message}`));
                } else {
                    throw new Error('No available adapters for data model "observationTreatment" ');
                }
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },


    /**
     * readOneObservationTreatment - Check user authorization and return one record with the specified observationTreatmentDbId in the observationTreatmentDbId argument.
     *
     * @param  {number} {observationTreatmentDbId}    observationTreatmentDbId of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with observationTreatmentDbId requested
     */
    readOneObservationTreatment: async function({
        observationTreatmentDbId
    }, context) {
        //check: adapters auth
        try {
            let authorizationCheck = await checkAuthorization(context, observationTreatment.adapterForIri(observationTreatmentDbId), 'read');
            if (authorizationCheck === true) {
                return observationTreatment.readById(observationTreatmentDbId);
            } else { //adapter not auth
                throw new Error("You don't have authorization to perform this action on adapter");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * addObservationTreatment - Check user authorization and creates a new record with data specified in the input argument
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
    addObservationTreatment: async function(input, context) {
        //check: input has idAttribute
        if (!input.observationTreatmentDbId) {
            throw new Error(`Illegal argument. Provided input requires attribute 'observationTreatmentDbId'.`);
        }

        //check: adapters auth
        try {
            let authorizationCheck = await checkAuthorization(context, observationTreatment.adapterForIri(input.observationTreatmentDbId), 'create');
            if (authorizationCheck === true) {
                let inputSanitized = helper.sanitizeAssociationArguments(input, [Object.keys(associationArgsDef)]);
                await helper.checkAuthorizationOnAssocArgs(inputSanitized, context, associationArgsDef, ['read', 'update'], models);
                await helper.checkAndAdjustRecordLimitForCreateUpdate(inputSanitized, context, associationArgsDef);
                if (!input.skipAssociationsExistenceChecks) {
                    await helper.validateAssociationArgsExistence(inputSanitized, context, associationArgsDef);
                }
                let createdRecord = await observationTreatment.addOne(inputSanitized);
                await createdRecord.handleAssociations(inputSanitized, context);
                return createdRecord;
            } else { //adapter not auth
                throw new Error("You don't have authorization to perform this action on adapter");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },


    /**
     * bulkAddObservationTreatmentCsv - Load csv file of records
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddObservationTreatmentCsv: function(_, context) {
        return checkAuthorization(context, 'observationTreatment', 'create').then(authorization => {
            if (authorization === true) {
                return observationTreatment.bulkAddCsv(context);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * deleteObservationTreatment - Check user authorization and delete a record with the specified observationTreatmentDbId in the observationTreatmentDbId argument.
     *
     * @param  {number} {observationTreatmentDbId}    observationTreatmentDbId of the record to delete
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {string}         Message indicating if deletion was successfull.
     */
    deleteObservationTreatment: async function({
        observationTreatmentDbId
    }, context) {
        //check: adapters auth
        try {
            let authorizationCheck = await checkAuthorization(context, observationTreatment.adapterForIri(observationTreatmentDbId), 'delete');
            if (authorizationCheck === true) {
                if (await validForDeletion(observationTreatmentDbId, context)) {
                    return observationTreatment.deleteOne(observationTreatmentDbId);
                }
            } else { //adapter not auth
                throw new Error("You don't have authorization to perform this action on adapter");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * updateObservationTreatment - Check user authorization and update the record specified in the input argument
     *
     * @param  {object} input   record to update and new info to update
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Updated record
     */
    updateObservationTreatment: async function(input, context) {
        //check: input has idAttribute
        if (!input.observationTreatmentDbId) {
            throw new Error(`Illegal argument. Provided input requires attribute 'observationTreatmentDbId'.`);
        }

        //check: adapters auth
        try {
            let authorizationCheck = await checkAuthorization(context, observationTreatment.adapterForIri(input.observationTreatmentDbId), 'update');
            if (authorizationCheck === true) {
                let inputSanitized = helper.sanitizeAssociationArguments(input, [Object.keys(associationArgsDef)]);
                await helper.checkAuthorizationOnAssocArgs(inputSanitized, context, associationArgsDef, ['read', 'update'], models);
                await helper.checkAndAdjustRecordLimitForCreateUpdate(inputSanitized, context, associationArgsDef);
                if (!input.skipAssociationsExistenceChecks) {
                    await helper.validateAssociationArgsExistence(inputSanitized, context, associationArgsDef);
                }
                let updatedRecord = await observationTreatment.updateOne(inputSanitized);
                await updatedRecord.handleAssociations(inputSanitized, context);
                return updatedRecord;
            } else { //adapter not auth
                throw new Error("You don't have authorization to perform this action on adapter");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * countObservationTreatments - Counts number of records that holds the conditions specified in the search argument
     *
     * @param  {object} {search} Search argument for filtering records
     * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {number}          Number of records that holds the conditions specified in the search argument
     */

    countObservationTreatments: async function({
        search
    }, context) {
        //check: adapters
        let registeredAdapters = Object.values(observationTreatment.registeredAdapters);
        if (registeredAdapters.length === 0) {
            throw new Error('No adapters registered for data model "observationTreatment"');
        } //else

        try {
            //exclude adapters
            let adapters = helper.removeExcludedAdapters(search, registeredAdapters);
            if (adapters.length === 0) {
                throw new Error('All adapters was excluded for data model "observationTreatment"');
            } //else

            //check: auth adapters
            let authorizationCheck = await helper.authorizedAdapters(context, adapters, 'read');
            if (authorizationCheck.authorizedAdapters.length > 0) {

                let countObj = await observationTreatment.countRecords(search, authorizationCheck.authorizedAdapters);
                //check adapter authorization Errors
                if (authorizationCheck.authorizationErrors.length > 0) {
                    context.benignErrors = context.benignErrors.concat(authorizationCheck.authorizationErrors);
                }
                //check Errors returned by the model layer (time-outs, unreachable, etc...)
                if (countObj.errors !== undefined && Array.isArray(countObj.errors) && countObj.errors.length > 0) {
                    context.benignErrors = context.benignErrors.concat(countObj.errors)
                    delete countObj['errors']
                }
                return countObj.sum;
            } else { //adapters not auth || errors
                // else new Error
                if (authorizationCheck.authorizationErrors.length > 0) {
                    throw new Error(authorizationCheck.authorizationErrors.reduce((a, c) => `${a}, ${c.message}`));
                } else {
                    throw new Error('No available adapters for data model "observationTreatment"');
                }
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * csvTableTemplateObservationTreatment - Returns table's template
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {Array}         Strings, one for header and one columns types
     */
    csvTableTemplateObservationTreatment: function(_, context) {
        return checkAuthorization(context, 'observationTreatment', 'read').then(authorization => {
            if (authorization === true) {
                return observationTreatment.csvTableTemplate();
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    }

}