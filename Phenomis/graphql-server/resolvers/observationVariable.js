/*
    Resolvers for basic CRUD operations
*/

const path = require('path');
const observationVariable = require(path.join(__dirname, '..', 'models_index.js')).observationVariable;
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
    'addMethod': 'method',
    'addOntologyReference': 'ontologyReference',
    'addScale': 'scale',
    'addTrait': 'trait',
    'addObservations': 'observation'
}

/**
 * observationVariable.prototype.method - Return associated record
 *
 * @param  {object} search       Search argument to match the associated record
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
observationVariable.prototype.method = async function({
    search
}, context) {
    if (helper.isNotUndefinedAndNotNull(this.methodDbId)) {
        try {
            if (search === undefined) {
                return resolvers.readOneMethod({
                    [models.method.idAttribute()]: this.methodDbId
                }, context)
            } else {
                //build new search filter
                let nsearch = helper.addSearchField({
                    "search": search,
                    "field": models.method.idAttribute(),
                    "value": {
                        "value": this.methodDbId
                    },
                    "operator": "eq"
                });
                let found = await resolvers.methodsConnection({
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
 * observationVariable.prototype.ontologyReference - Return associated record
 *
 * @param  {object} search       Search argument to match the associated record
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
observationVariable.prototype.ontologyReference = async function({
    search
}, context) {
    if (helper.isNotUndefinedAndNotNull(this.ontologyDbId)) {
        try {
            if (search === undefined) {
                return resolvers.readOneOntologyReference({
                    [models.ontologyReference.idAttribute()]: this.ontologyDbId
                }, context)
            } else {
                //build new search filter
                let nsearch = helper.addSearchField({
                    "search": search,
                    "field": models.ontologyReference.idAttribute(),
                    "value": {
                        "value": this.ontologyDbId
                    },
                    "operator": "eq"
                });
                let found = await resolvers.ontologyReferencesConnection({
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
 * observationVariable.prototype.scale - Return associated record
 *
 * @param  {object} search       Search argument to match the associated record
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
observationVariable.prototype.scale = async function({
    search
}, context) {
    if (helper.isNotUndefinedAndNotNull(this.scaleDbId)) {
        try {
            if (search === undefined) {
                return resolvers.readOneScale({
                    [models.scale.idAttribute()]: this.scaleDbId
                }, context)
            } else {
                //build new search filter
                let nsearch = helper.addSearchField({
                    "search": search,
                    "field": models.scale.idAttribute(),
                    "value": {
                        "value": this.scaleDbId
                    },
                    "operator": "eq"
                });
                let found = await resolvers.scalesConnection({
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
 * observationVariable.prototype.trait - Return associated record
 *
 * @param  {object} search       Search argument to match the associated record
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
observationVariable.prototype.trait = async function({
    search
}, context) {
    if (helper.isNotUndefinedAndNotNull(this.traitDbId)) {
        try {
            if (search === undefined) {
                return resolvers.readOneTrait({
                    [models.trait.idAttribute()]: this.traitDbId
                }, context)
            } else {
                //build new search filter
                let nsearch = helper.addSearchField({
                    "search": search,
                    "field": models.trait.idAttribute(),
                    "value": {
                        "value": this.traitDbId
                    },
                    "operator": "eq"
                });
                let found = await resolvers.traitsConnection({
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
 * observationVariable.prototype.countFilteredObservations - Count number of associated records that holds the conditions specified in the search argument
 *
 * @param  {object} {search} description
 * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}          Number of associated records that holds the conditions specified in the search argument
 */
observationVariable.prototype.countFilteredObservations = function({
    search
}, context) {
    try {

        //build new search filter
        let nsearch = helper.addSearchField({
            "search": search,
            "field": "observationVariableDbId",
            "value": {
                "value": this.getIdValue()
            },
            "operator": "eq"
        });

        return resolvers.countObservations({
            search: nsearch
        }, context);
    } catch (error) {
        console.error(error);
        handleError(error);
    };
}


/**
 * observationVariable.prototype.observationsConnection - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
 */
observationVariable.prototype.observationsConnection = function({
    search,
    order,
    pagination
}, context) {
    try {

        //build new search filter
        let nsearch = helper.addSearchField({
            "search": search,
            "field": "observationVariableDbId",
            "value": {
                "value": this.getIdValue()
            },
            "operator": "eq"
        });

        return resolvers.observationsConnection({
            search: nsearch,
            order: order,
            pagination: pagination
        }, context);
    } catch (error) {
        console.error(error);
        handleError(error);
    };
}


/**
 * handleAssociations - handles the given associations in the create and update case.
 *
 * @param {object} input   Info of each field to create the new record
 * @param {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 */
observationVariable.prototype.handleAssociations = async function(input, context) {
    try {
        let promises = [];
        if (helper.isNonEmptyArray(input.addObservations)) {
            promises.push(this.add_observations(input, context));
        }
        if (helper.isNotUndefinedAndNotNull(input.addMethod)) {
            promises.push(this.add_method(input, context));
        }
        if (helper.isNotUndefinedAndNotNull(input.addOntologyReference)) {
            promises.push(this.add_ontologyReference(input, context));
        }
        if (helper.isNotUndefinedAndNotNull(input.addScale)) {
            promises.push(this.add_scale(input, context));
        }
        if (helper.isNotUndefinedAndNotNull(input.addTrait)) {
            promises.push(this.add_trait(input, context));
        }
        if (helper.isNonEmptyArray(input.removeObservations)) {
            promises.push(this.remove_observations(input, context));
        }
        if (helper.isNotUndefinedAndNotNull(input.removeMethod)) {
            promises.push(this.remove_method(input, context));
        }
        if (helper.isNotUndefinedAndNotNull(input.removeOntologyReference)) {
            promises.push(this.remove_ontologyReference(input, context));
        }
        if (helper.isNotUndefinedAndNotNull(input.removeScale)) {
            promises.push(this.remove_scale(input, context));
        }
        if (helper.isNotUndefinedAndNotNull(input.removeTrait)) {
            promises.push(this.remove_trait(input, context));
        }

        await Promise.all(promises);
    } catch (error) {
        throw error
    }
}
/**
 * add_observations - field Mutation for to_many associations to add
 *
 * @param {object} input   Info of input Ids to add  the association
 */
observationVariable.prototype.add_observations = async function(input) {
    let results = [];
    for await (associatedRecordId of input.addObservations) {
        results.push(models.observation.add_observationVariableDbId(associatedRecordId, this.getIdValue()));
    }
    await Promise.all(results);
}

/**
 * add_method - field Mutation for to_one associations to add
 *
 * @param {object} input   Info of input Ids to add  the association
 */
observationVariable.prototype.add_method = async function(input) {
    await observationVariable.add_methodDbId(this.getIdValue(), input.addMethod);
    this.methodDbId = input.addMethod;
}
/**
 * add_ontologyReference - field Mutation for to_one associations to add
 *
 * @param {object} input   Info of input Ids to add  the association
 */
observationVariable.prototype.add_ontologyReference = async function(input) {
    await observationVariable.add_ontologyDbId(this.getIdValue(), input.addOntologyReference);
    this.ontologyDbId = input.addOntologyReference;
}
/**
 * add_scale - field Mutation for to_one associations to add
 *
 * @param {object} input   Info of input Ids to add  the association
 */
observationVariable.prototype.add_scale = async function(input) {
    await observationVariable.add_scaleDbId(this.getIdValue(), input.addScale);
    this.scaleDbId = input.addScale;
}
/**
 * add_trait - field Mutation for to_one associations to add
 *
 * @param {object} input   Info of input Ids to add  the association
 */
observationVariable.prototype.add_trait = async function(input) {
    await observationVariable.add_traitDbId(this.getIdValue(), input.addTrait);
    this.traitDbId = input.addTrait;
}
/**
 * remove_observations - field Mutation for to_many associations to remove
 *
 * @param {object} input   Info of input Ids to remove  the association
 */
observationVariable.prototype.remove_observations = async function(input) {
    let results = [];
    for await (associatedRecordId of input.removeObservations) {
        results.push(models.observation.remove_observationVariableDbId(associatedRecordId, this.getIdValue()));
    }
    await Promise.all(results);
}

/**
 * remove_method - field Mutation for to_one associations to remove
 *
 * @param {object} input   Info of input Ids to remove  the association
 */
observationVariable.prototype.remove_method = async function(input) {
    if (input.removeMethod == this.methodDbId) {
        await observationVariable.remove_methodDbId(this.getIdValue(), input.removeMethod);
        this.methodDbId = null;
    }
}
/**
 * remove_ontologyReference - field Mutation for to_one associations to remove
 *
 * @param {object} input   Info of input Ids to remove  the association
 */
observationVariable.prototype.remove_ontologyReference = async function(input) {
    if (input.removeOntologyReference == this.ontologyDbId) {
        await observationVariable.remove_ontologyDbId(this.getIdValue(), input.removeOntologyReference);
        this.ontologyDbId = null;
    }
}
/**
 * remove_scale - field Mutation for to_one associations to remove
 *
 * @param {object} input   Info of input Ids to remove  the association
 */
observationVariable.prototype.remove_scale = async function(input) {
    if (input.removeScale == this.scaleDbId) {
        await observationVariable.remove_scaleDbId(this.getIdValue(), input.removeScale);
        this.scaleDbId = null;
    }
}
/**
 * remove_trait - field Mutation for to_one associations to remove
 *
 * @param {object} input   Info of input Ids to remove  the association
 */
observationVariable.prototype.remove_trait = async function(input) {
    if (input.removeTrait == this.traitDbId) {
        await observationVariable.remove_traitDbId(this.getIdValue(), input.removeTrait);
        this.traitDbId = null;
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
    if (await observationVariable.countRecords(search).sum > context.recordsLimit) {
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
        throw new Error(errorMessageForRecordsLimit("readOneObservationVariable"));
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

    let observationVariable = await resolvers.readOneObservationVariable({
        observationVariableDbId: id
    }, context);
    //check that record actually exists
    if (observationVariable === null) throw new Error(`Record with ID = ${id} does not exist`);
    let promises_to_many = [];
    let promises_to_one = [];

    promises_to_many.push(observationVariable.countFilteredObservations({}, context));
    promises_to_one.push(observationVariable.method({}, context));
    promises_to_one.push(observationVariable.ontologyReference({}, context));
    promises_to_one.push(observationVariable.scale({}, context));
    promises_to_one.push(observationVariable.trait({}, context));

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
        throw new Error(`observationVariable with observationVariableDbId ${id} has associated records and is NOT valid for deletion. Please clean up before you delete.`);
    }

    if (context.benignErrors.length > 0) {
        throw new Error('Errors occurred when counting associated records. No deletion permitted for reasons of security.');
    }

    return true;
}

module.exports = {

    /**
     * observationVariablesConnection - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
     */
    observationVariablesConnection: async function({
        search,
        order,
        pagination
    }, context) {
        //check: adapters
        let registeredAdapters = Object.values(observationVariable.registeredAdapters);
        if (registeredAdapters.length === 0) {
            throw new Error('No adapters registered for data model "observationVariable"');
        } //else

        try {
            //exclude adapters
            let adapters = helper.removeExcludedAdapters(search, registeredAdapters);
            if (adapters.length === 0) {
                throw new Error('All adapters was excluded for data model "observationVariable"');
            } //else

            //check: auth adapters
            let authorizationCheck = await helper.authorizedAdapters(context, adapters, 'read');
            if (authorizationCheck.authorizedAdapters.length > 0) {
                let connectionObj = await observationVariable.readAllCursor(search, order, pagination, authorizationCheck.authorizedAdapters);
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
                    throw new Error('No available adapters for data model "observationVariable" ');
                }
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },


    /**
     * readOneObservationVariable - Check user authorization and return one record with the specified observationVariableDbId in the observationVariableDbId argument.
     *
     * @param  {number} {observationVariableDbId}    observationVariableDbId of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with observationVariableDbId requested
     */
    readOneObservationVariable: async function({
        observationVariableDbId
    }, context) {
        //check: adapters auth
        try {
            let authorizationCheck = await checkAuthorization(context, observationVariable.adapterForIri(observationVariableDbId), 'read');
            if (authorizationCheck === true) {
                return observationVariable.readById(observationVariableDbId);
            } else { //adapter not auth
                throw new Error("You don't have authorization to perform this action on adapter");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * addObservationVariable - Check user authorization and creates a new record with data specified in the input argument
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
    addObservationVariable: async function(input, context) {
        //check: input has idAttribute
        if (!input.observationVariableDbId) {
            throw new Error(`Illegal argument. Provided input requires attribute 'observationVariableDbId'.`);
        }

        //check: adapters auth
        try {
            let authorizationCheck = await checkAuthorization(context, observationVariable.adapterForIri(input.observationVariableDbId), 'create');
            if (authorizationCheck === true) {
                let inputSanitized = helper.sanitizeAssociationArguments(input, [Object.keys(associationArgsDef)]);
                await helper.checkAuthorizationOnAssocArgs(inputSanitized, context, associationArgsDef, ['read', 'update'], models);
                await helper.checkAndAdjustRecordLimitForCreateUpdate(inputSanitized, context, associationArgsDef);
                if (!input.skipAssociationsExistenceChecks) {
                    await helper.validateAssociationArgsExistence(inputSanitized, context, associationArgsDef);
                }
                let createdRecord = await observationVariable.addOne(inputSanitized);
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
     * bulkAddObservationVariableCsv - Load csv file of records
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddObservationVariableCsv: function(_, context) {
        return checkAuthorization(context, 'observationVariable', 'create').then(authorization => {
            if (authorization === true) {
                return observationVariable.bulkAddCsv(context);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * deleteObservationVariable - Check user authorization and delete a record with the specified observationVariableDbId in the observationVariableDbId argument.
     *
     * @param  {number} {observationVariableDbId}    observationVariableDbId of the record to delete
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {string}         Message indicating if deletion was successfull.
     */
    deleteObservationVariable: async function({
        observationVariableDbId
    }, context) {
        //check: adapters auth
        try {
            let authorizationCheck = await checkAuthorization(context, observationVariable.adapterForIri(observationVariableDbId), 'delete');
            if (authorizationCheck === true) {
                if (await validForDeletion(observationVariableDbId, context)) {
                    return observationVariable.deleteOne(observationVariableDbId);
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
     * updateObservationVariable - Check user authorization and update the record specified in the input argument
     *
     * @param  {object} input   record to update and new info to update
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Updated record
     */
    updateObservationVariable: async function(input, context) {
        //check: input has idAttribute
        if (!input.observationVariableDbId) {
            throw new Error(`Illegal argument. Provided input requires attribute 'observationVariableDbId'.`);
        }

        //check: adapters auth
        try {
            let authorizationCheck = await checkAuthorization(context, observationVariable.adapterForIri(input.observationVariableDbId), 'update');
            if (authorizationCheck === true) {
                let inputSanitized = helper.sanitizeAssociationArguments(input, [Object.keys(associationArgsDef)]);
                await helper.checkAuthorizationOnAssocArgs(inputSanitized, context, associationArgsDef, ['read', 'update'], models);
                await helper.checkAndAdjustRecordLimitForCreateUpdate(inputSanitized, context, associationArgsDef);
                if (!input.skipAssociationsExistenceChecks) {
                    await helper.validateAssociationArgsExistence(inputSanitized, context, associationArgsDef);
                }
                let updatedRecord = await observationVariable.updateOne(inputSanitized);
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
     * countObservationVariables - Counts number of records that holds the conditions specified in the search argument
     *
     * @param  {object} {search} Search argument for filtering records
     * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {number}          Number of records that holds the conditions specified in the search argument
     */

    countObservationVariables: async function({
        search
    }, context) {
        //check: adapters
        let registeredAdapters = Object.values(observationVariable.registeredAdapters);
        if (registeredAdapters.length === 0) {
            throw new Error('No adapters registered for data model "observationVariable"');
        } //else

        try {
            //exclude adapters
            let adapters = helper.removeExcludedAdapters(search, registeredAdapters);
            if (adapters.length === 0) {
                throw new Error('All adapters was excluded for data model "observationVariable"');
            } //else

            //check: auth adapters
            let authorizationCheck = await helper.authorizedAdapters(context, adapters, 'read');
            if (authorizationCheck.authorizedAdapters.length > 0) {

                let countObj = await observationVariable.countRecords(search, authorizationCheck.authorizedAdapters);
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
                    throw new Error('No available adapters for data model "observationVariable"');
                }
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * csvTableTemplateObservationVariable - Returns table's template
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {Array}         Strings, one for header and one columns types
     */
    csvTableTemplateObservationVariable: function(_, context) {
        return checkAuthorization(context, 'observationVariable', 'read').then(authorization => {
            if (authorization === true) {
                return observationVariable.csvTableTemplate();
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    }

}