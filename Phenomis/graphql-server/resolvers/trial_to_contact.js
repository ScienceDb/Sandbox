/*
    Resolvers for basic CRUD operations
*/

const path = require('path');
const trial_to_contact = require(path.join(__dirname, '..', 'models_index.js')).trial_to_contact;
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
    'addTrial': 'trial',
    'addContact': 'contact'
}

/**
 * trial_to_contact.prototype.trial - Return associated record
 *
 * @param  {object} search       Search argument to match the associated record
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
trial_to_contact.prototype.trial = async function({
    search
}, context) {

    if (helper.isNotUndefinedAndNotNull(this.trialDbId)) {
        try {
            if (search === undefined) {
                return resolvers.readOneTrial({
                    [models.trial.idAttribute()]: this.trialDbId
                }, context)
            } else {
                //build new search filter
                let nsearch = helper.addSearchField({
                    "search": search,
                    "field": models.trial.idAttribute(),
                    "value": {
                        "value": this.trialDbId
                    },
                    "operator": "eq"
                });
                let found = await resolvers.trialsConnection({
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
 * trial_to_contact.prototype.contact - Return associated record
 *
 * @param  {object} search       Search argument to match the associated record
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
trial_to_contact.prototype.contact = async function({
    search
}, context) {

    if (helper.isNotUndefinedAndNotNull(this.contactDbId)) {
        try {
            if (search === undefined) {
                return resolvers.readOneContact({
                    [models.contact.idAttribute()]: this.contactDbId
                }, context)
            } else {
                //build new search filter
                let nsearch = helper.addSearchField({
                    "search": search,
                    "field": models.contact.idAttribute(),
                    "value": {
                        "value": this.contactDbId
                    },
                    "operator": "eq"
                });
                let found = await resolvers.contactsConnection({
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
trial_to_contact.prototype.handleAssociations = async function(input, context) {
    try {
        let promises = [];

        if (helper.isNotUndefinedAndNotNull(input.addTrial)) {
            promises.push(this.add_trial(input, context));
        }
        if (helper.isNotUndefinedAndNotNull(input.addContact)) {
            promises.push(this.add_contact(input, context));
        }

        if (helper.isNotUndefinedAndNotNull(input.removeTrial)) {
            promises.push(this.remove_trial(input, context));
        }
        if (helper.isNotUndefinedAndNotNull(input.removeContact)) {
            promises.push(this.remove_contact(input, context));
        }

        await Promise.all(promises);
    } catch (error) {
        throw error
    }
}
/**
 * add_trial - field Mutation for to_one associations to add
 *
 * @param {object} input   Info of input Ids to add  the association
 */
trial_to_contact.prototype.add_trial = async function(input) {
    await trial_to_contact.add_trialDbId(this.getIdValue(), input.addTrial);
    this.trialDbId = input.addTrial;
}
/**
 * add_contact - field Mutation for to_one associations to add
 *
 * @param {object} input   Info of input Ids to add  the association
 */
trial_to_contact.prototype.add_contact = async function(input) {
    await trial_to_contact.add_contactDbId(this.getIdValue(), input.addContact);
    this.contactDbId = input.addContact;
}
/**
 * remove_trial - field Mutation for to_one associations to remove
 *
 * @param {object} input   Info of input Ids to remove  the association
 */
trial_to_contact.prototype.remove_trial = async function(input) {
    if (input.removeTrial == this.trialDbId) {
        await trial_to_contact.remove_trialDbId(this.getIdValue(), input.removeTrial);
        this.trialDbId = null;
    }
}
/**
 * remove_contact - field Mutation for to_one associations to remove
 *
 * @param {object} input   Info of input Ids to remove  the association
 */
trial_to_contact.prototype.remove_contact = async function(input) {
    if (input.removeContact == this.contactDbId) {
        await trial_to_contact.remove_contactDbId(this.getIdValue(), input.removeContact);
        this.contactDbId = null;
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
 * checkCountAndReduceRecordsLimit(search, context, query) - Make sure that the current set of requested records does not exceed the record limit set in globals.js.
 *
 * @param {object} search  Search argument for filtering records
 * @param {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @param {string} query The query that makes this check
 */
async function checkCountAndReduceRecordsLimit(search, context, query) {
    let count = (await trial_to_contact.countRecords(search)).sum;
    if (count > context.recordsLimit) {
        throw new Error(errorMessageForRecordsLimit(query));
    }
    context.recordsLimit -= count;
}

/**
 * checkCountForOneAndReduceRecordsLimit(context) - Make sure that the record limit is not exhausted before requesting a single record
 *
 * @param {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 */
function checkCountForOneAndReduceRecordsLimit(context) {
    if (1 > context.recordsLimit) {
        throw new Error(errorMessageForRecordsLimit("readOneTrial_to_contact"));
    }
    context.recordsLimit -= 1;
}
/**
 * countAllAssociatedRecords - Count records associated with another given record
 *
 * @param  {ID} id      Id of the record which the associations will be counted
 * @param  {objec} context Default context by resolver
 * @return {Int}         Number of associated records
 */
async function countAllAssociatedRecords(id, context) {

    let trial_to_contact = await resolvers.readOneTrial_to_contact({
        id: id
    }, context);
    //check that record actually exists
    if (trial_to_contact === null) throw new Error(`Record with ID = ${id} does not exist`);
    let promises_to_many = [];
    let promises_to_one = [];

    promises_to_one.push(trial_to_contact.trial({}, context));
    promises_to_one.push(trial_to_contact.contact({}, context));

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
        throw new Error(`trial_to_contact with id ${id} has associated records and is NOT valid for deletion. Please clean up before you delete.`);
    }

    if (context.benignErrors.length > 0) {
        throw new Error('Errors occurred when counting associated records. No deletion permitted for reasons of security.');
    }

    return true;
}

module.exports = {

    /**
     * trial_to_contactsConnection - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
     */
    trial_to_contactsConnection: async function({
        search,
        order,
        pagination
    }, context) {
        //check: adapters
        let registeredAdapters = Object.values(trial_to_contact.registeredAdapters);
        if (registeredAdapters.length === 0) {
            throw new Error('No adapters registered for data model "trial_to_contact"');
        } //else

        try {
            //exclude adapters
            let adapters = helper.removeExcludedAdapters(search, registeredAdapters);
            if (adapters.length === 0) {
                throw new Error('All adapters was excluded for data model "trial_to_contact"');
            } //else

            //check: auth adapters
            let authorizationCheck = await helper.authorizedAdapters(context, adapters, 'read');
            if (authorizationCheck.authorizedAdapters.length > 0) {
                let connectionObj = await trial_to_contact.readAllCursor(search, order, pagination, authorizationCheck.authorizedAdapters);
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
                    throw new Error('No available adapters for data model "trial_to_contact" ');
                }
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },


    /**
     * readOneTrial_to_contact - Check user authorization and return one record with the specified id in the id argument.
     *
     * @param  {number} {id}    id of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with id requested
     */
    readOneTrial_to_contact: async function({
        id
    }, context) {
        //check: adapters auth
        try {
            let authorizationCheck = await checkAuthorization(context, trial_to_contact.adapterForIri(id), 'read');
            if (authorizationCheck === true) {
                return trial_to_contact.readById(id);
            } else { //adapter not auth
                throw new Error("You don't have authorization to perform this action on adapter");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * addTrial_to_contact - Check user authorization and creates a new record with data specified in the input argument
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
    addTrial_to_contact: async function(input, context) {
        //check: input has idAttribute
        if (!input.id) {
            throw new Error(`Illegal argument. Provided input requires attribute 'id'.`);
        }

        //check: adapters auth
        try {
            let authorizationCheck = await checkAuthorization(context, trial_to_contact.adapterForIri(input.id), 'create');
            if (authorizationCheck === true) {
                let inputSanitized = helper.sanitizeAssociationArguments(input, [Object.keys(associationArgsDef)]);
                await helper.checkAuthorizationOnAssocArgs(inputSanitized, context, associationArgsDef, ['read', 'update'], models);
                await helper.checkAndAdjustRecordLimitForCreateUpdate(inputSanitized, context, associationArgsDef);
                if (!input.skipAssociationsExistenceChecks) {
                    await helper.validateAssociationArgsExistence(inputSanitized, context, associationArgsDef);
                }
                let createdRecord = await trial_to_contact.addOne(inputSanitized);
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
     * bulkAddTrial_to_contactCsv - Load csv file of records
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddTrial_to_contactCsv: function(_, context) {
        return checkAuthorization(context, 'trial_to_contact', 'create').then(authorization => {
            if (authorization === true) {
                return trial_to_contact.bulkAddCsv(context);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * deleteTrial_to_contact - Check user authorization and delete a record with the specified id in the id argument.
     *
     * @param  {number} {id}    id of the record to delete
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {string}         Message indicating if deletion was successfull.
     */
    deleteTrial_to_contact: async function({
        id
    }, context) {
        //check: adapters auth
        try {
            let authorizationCheck = await checkAuthorization(context, trial_to_contact.adapterForIri(id), 'delete');
            if (authorizationCheck === true) {
                if (await validForDeletion(id, context)) {
                    return trial_to_contact.deleteOne(id);
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
     * updateTrial_to_contact - Check user authorization and update the record specified in the input argument
     *
     * @param  {object} input   record to update and new info to update
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Updated record
     */
    updateTrial_to_contact: async function(input, context) {
        //check: input has idAttribute
        if (!input.id) {
            throw new Error(`Illegal argument. Provided input requires attribute 'id'.`);
        }

        //check: adapters auth
        try {
            let authorizationCheck = await checkAuthorization(context, trial_to_contact.adapterForIri(input.id), 'update');
            if (authorizationCheck === true) {
                let inputSanitized = helper.sanitizeAssociationArguments(input, [Object.keys(associationArgsDef)]);
                await helper.checkAuthorizationOnAssocArgs(inputSanitized, context, associationArgsDef, ['read', 'update'], models);
                await helper.checkAndAdjustRecordLimitForCreateUpdate(inputSanitized, context, associationArgsDef);
                if (!input.skipAssociationsExistenceChecks) {
                    await helper.validateAssociationArgsExistence(inputSanitized, context, associationArgsDef);
                }
                let updatedRecord = await trial_to_contact.updateOne(inputSanitized);
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
     * countTrial_to_contacts - Counts number of records that holds the conditions specified in the search argument
     *
     * @param  {object} {search} Search argument for filtering records
     * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {number}          Number of records that holds the conditions specified in the search argument
     */

    countTrial_to_contacts: async function({
        search
    }, context) {
        //check: adapters
        let registeredAdapters = Object.values(trial_to_contact.registeredAdapters);
        if (registeredAdapters.length === 0) {
            throw new Error('No adapters registered for data model "trial_to_contact"');
        } //else

        try {
            //exclude adapters
            let adapters = helper.removeExcludedAdapters(search, registeredAdapters);
            if (adapters.length === 0) {
                throw new Error('All adapters was excluded for data model "trial_to_contact"');
            } //else

            //check: auth adapters
            let authorizationCheck = await helper.authorizedAdapters(context, adapters, 'read');
            if (authorizationCheck.authorizedAdapters.length > 0) {

                let countObj = await trial_to_contact.countRecords(search, authorizationCheck.authorizedAdapters);
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
                    throw new Error('No available adapters for data model "trial_to_contact"');
                }
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * csvTableTemplateTrial_to_contact - Returns table's template
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {Array}         Strings, one for header and one columns types
     */
    csvTableTemplateTrial_to_contact: function(_, context) {
        return checkAuthorization(context, 'trial_to_contact', 'read').then(authorization => {
            if (authorization === true) {
                return trial_to_contact.csvTableTemplate();
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    }

}