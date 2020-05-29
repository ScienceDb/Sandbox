/*
    Resolvers for basic CRUD operations
*/

const path = require('path');
const country = require(path.join(__dirname, '..', 'models_index.js')).country;
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
    'addUnique_capital': 'capital'
}



/**
 * country.prototype.unique_capital - Return associated record
 *
 * @param  {object} search       Search argument to match the associated record
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
country.prototype.unique_capital = async function({
    search
}, context) {
    //build new search filter
    let nsearch = helper.addSearchField({
        "search": search,
        "field": "country_id",
        "value": {
            "value": this.getIdValue()
        },
        "operator": "eq"
    });

    let found = await resolvers.capitals({
        search: nsearch
    }, context);
    if (found) {
        if (found.length > 1) {
            let foundIds = [];
            found.forEach(capital => {
                foundIds.push(capital.getIdValue())
            })
            context.benignErrors.push(new Error(
                `Not unique "to_one" association Error: Found ${found.length} capitals matching country with country_id ${this.getIdValue()}. Consider making this association a "to_many", using unique constraints, or moving the foreign key into the country model. Returning first capital. Found capitals ${models.capital.idAttribute()}s: [${foundIds.toString()}]`
            ));
        }
        return found[0];
    }
    return found;
}





/**
 * handleAssociations - handles the given associations in the create and update case.
 *
 * @param {object} input   Info of each field to create the new record
 * @param {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 */
country.prototype.handleAssociations = async function(input, context) {
    let promises = [];

    if (helper.isNotUndefinedAndNotNull(input.addUnique_capital)) {
        promises.push(this.add_unique_capital(input, context));
    }

    if (helper.isNotUndefinedAndNotNull(input.removeUnique_capital)) {
        promises.push(this.remove_unique_capital(input, context));
    }

    await Promise.all(promises);
}
/**
 * add_unique_capital - field Mutation for to_one associations to add
 *
 * @param {object} input   Info of input Ids to add  the association
 */
country.prototype.add_unique_capital = async function(input) {
    await models.capital.add_country_id(input.addUnique_capital, this.getIdValue());
}
/**
 * remove_unique_capital - field Mutation for to_one associations to remove
 *
 * @param {object} input   Info of input Ids to remove  the association
 */
country.prototype.remove_unique_capital = async function(input) {
    await models.capital.remove_country_id(input.removeUnique_capital, this.getIdValue());
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
    let count = (await country.countRecords(search)).sum;
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
        throw new Error(errorMessageForRecordsLimit("readOneCountry"));
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

    let country = await resolvers.readOneCountry({
        country_id: id
    }, context);
    //check that record actually exists
    if (country === null) throw new Error(`Record with ID = ${id} does not exist`);
    let promises_to_many = [];
    let promises_to_one = [];

    promises_to_one.push(country.unique_capital({}, context));

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
        throw new Error(`country with country_id ${id} has associated records and is NOT valid for deletion. Please clean up before you delete.`);
    }
    return true;
}

module.exports = {
    /**
     * countries - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Offset and limit to get the records from and to respectively
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records holding conditions specified by search, order and pagination argument
     */
    countries: async function({
        search,
        order,
        pagination
    }, context) {
        if (await checkAuthorization(context, 'country', 'read') === true) {
            await checkCountAndReduceRecordsLimit(search, context, "countries");
            return await country.readAll(search, order, pagination);
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },

    /**
     * countriesConnection - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
     */
    countriesConnection: async function({
        search,
        order,
        pagination
    }, context) {
        if (await checkAuthorization(context, 'country', 'read') === true) {
            await checkCountAndReduceRecordsLimit(search, context, "countriesConnection");
            return country.readAllCursor(search, order, pagination);
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },

    /**
     * readOneCountry - Check user authorization and return one record with the specified country_id in the country_id argument.
     *
     * @param  {number} {country_id}    country_id of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with country_id requested
     */
    readOneCountry: async function({
        country_id
    }, context) {
        if (await checkAuthorization(context, 'country', 'read') === true) {
            checkCountForOneAndReduceRecordsLimit(context);
            return country.readById(country_id);
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },

    /**
     * countCountries - Counts number of records that holds the conditions specified in the search argument
     *
     * @param  {object} {search} Search argument for filtering records
     * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {number}          Number of records that holds the conditions specified in the search argument
     */
    countCountries: async function({
        search
    }, context) {
        if (await checkAuthorization(context, 'country', 'read') === true) {
            return (await country.countRecords(search)).sum;
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },

    /**
     * vueTableCountry - Return table of records as needed for displaying a vuejs table
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Records with format as needed for displaying a vuejs table
     */
    vueTableCountry: async function(_, context) {
        if (await checkAuthorization(context, 'country', 'read') === true) {
            return helper.vueTable(context.request, country, ["id", "name", "country_id"]);
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },

    /**
     * addCountry - Check user authorization and creates a new record with data specified in the input argument.
     * This function only handles attributes, not associations.
     * @see handleAssociations for further information.
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
    addCountry: async function(input, context) {
        let authorization = await checkAuthorization(context, 'country', 'create');
        if (authorization === true) {
            let inputSanitized = helper.sanitizeAssociationArguments(input, [Object.keys(associationArgsDef)]);
            await helper.checkAuthorizationOnAssocArgs(inputSanitized, context, associationArgsDef, ['read', 'create'], models);
            await helper.checkAndAdjustRecordLimitForCreateUpdate(inputSanitized, context, associationArgsDef);
            if (!input.skipAssociationsExistenceChecks) {
                await helper.validateAssociationArgsExistence(inputSanitized, context, associationArgsDef);
            }
            let createdCountry = await country.addOne(inputSanitized);
            await createdCountry.handleAssociations(inputSanitized, context);
            return createdCountry;
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },

    /**
     * bulkAddCountryCsv - Load csv file of records
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddCountryCsv: async function(_, context) {
        if (await checkAuthorization(context, 'country', 'create') === true) {
            return country.bulkAddCsv(context);
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },

    /**
     * deleteCountry - Check user authorization and delete a record with the specified country_id in the country_id argument.
     *
     * @param  {number} {country_id}    country_id of the record to delete
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {string}         Message indicating if deletion was successfull.
     */
    deleteCountry: async function({
        country_id
    }, context) {
        if (await checkAuthorization(context, 'country', 'delete') === true) {
            if (await validForDeletion(country_id, context)) {
                return country.deleteOne(country_id);
            }
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },

    /**
     * updateCountry - Check user authorization and update the record specified in the input argument
     * This function only handles attributes, not associations.
     * @see handleAssociations for further information.
     *
     * @param  {object} input   record to update and new info to update
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Updated record
     */
    updateCountry: async function(input, context) {
        let authorization = await checkAuthorization(context, 'country', 'update');
        if (authorization === true) {
            let inputSanitized = helper.sanitizeAssociationArguments(input, [Object.keys(associationArgsDef)]);
            await helper.checkAuthorizationOnAssocArgs(inputSanitized, context, associationArgsDef, ['read', 'create'], models);
            await helper.checkAndAdjustRecordLimitForCreateUpdate(inputSanitized, context, associationArgsDef);
            if (!input.skipAssociationsExistenceChecks) {
                await helper.validateAssociationArgsExistence(inputSanitized, context, associationArgsDef);
            }
            let updatedCountry = await country.updateOne(inputSanitized);
            await updatedCountry.handleAssociations(inputSanitized, context);
            return updatedCountry;
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },

    /**
     * csvTableTemplateCountry - Returns table's template
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {Array}         Strings, one for header and one columns types
     */
    csvTableTemplateCountry: async function(_, context) {
        if (await checkAuthorization(context, 'country', 'read') === true) {
            return country.csvTableTemplate();
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    }

}