/*
    Resolvers for basic CRUD operations
*/

const path = require('path');
const river = require(path.join(__dirname, '..', 'models', 'index.js')).river;
const helper = require('../utils/helper');
const checkAuthorization = require('../utils/check-authorization');
const fs = require('fs');
const os = require('os');
const resolvers = require(path.join(__dirname, 'index.js'));
const models = require(path.join(__dirname, '..', 'models', 'index.js'));
const globals = require('../config/globals');
const errorHelper = require('../utils/errors');

const associationArgsDef = {
    'addCountries': 'country'
}


/**
 * river.prototype.countriesFilter - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Offset and limit to get the records from and to respectively
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of associated records holding conditions specified by search, order and pagination argument
 */
river.prototype.countriesFilter = async function({
    search,
    order,
    pagination
}, context) {
    if (await checkAuthorization(context, 'country', 'read') === true) {
        helper.checkCountAndReduceRecordLimitHelper(pagination.limit, context, "riversConnection");
        await checkCountAndReduceRecordsLimit({
            search,
            pagination
        }, context, 'countriesFilter', 'country');
        return this.countriesFilterImpl({
            search,
            order,
            pagination
        });
    } else {
        throw new Error("You don't have authorization to perform this action");
    }
}

/**
 * river.prototype.countriesConnection - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
 */
river.prototype.countriesConnection = async function({
    search,
    order,
    pagination
}, context) {
    if (await checkAuthorization(context, 'country', 'read') === true) {
        helper.checkCursorBasedPaginationArgument(pagination);
        let limit = pagination.first !== undefined ? pagination.first : pagination.last;
        helper.checkCountAndReduceRecordLimitHelper(limit, context, "riversConnection");
        return this.countriesConnectionImpl({
            search,
            order,
            pagination
        });
    } else {
        throw new Error("You don't have authorization to perform this action");
    }
}

/**
 * river.prototype.countFilteredCountries - Count number of associated records that holds the conditions specified in the search argument
 *
 * @param  {object} {search} description
 * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}          Number of associated records that holds the conditions specified in the search argument
 */
river.prototype.countFilteredCountries = async function({
    search
}, context) {
    if (await checkAuthorization(context, 'country', 'read') === true) {
        return this.countFilteredCountriesImpl({
            search
        });
    } else {
        throw new Error("You don't have authorization to perform this action");
    }
}






/**
 * handleAssociations - handles the given associations in the create and update case.
 *
 * @param {object} input   Info of each field to create the new record
 * @param {BenignErrorReporter} benignErrorReporter Error Reporter used for reporting Errors from remote zendro services
 */
river.prototype.handleAssociations = async function(input, benignErrorReporter) {
    let promises = [];
    if (helper.isNonEmptyArray(input.addCountries)) {
        promises.push(this.add_countries(input, benignErrorReporter));
    }
    if (helper.isNonEmptyArray(input.removeCountries)) {
        promises.push(this.remove_countries(input, benignErrorReporter));
    }

    await Promise.all(promises);
}
/**
 * add_countries - field Mutation for to_many associations to add
 *
 * @param {object} input   Info of input Ids to add  the association
 */
river.prototype.add_countries = async function(input) {
    await models.river.add_country_id(this, input.addCountries);
}

/**
 * remove_countries - field Mutation for to_many associations to remove
 *
 * @param {object} input   Info of input Ids to remove  the association
 */
river.prototype.remove_countries = async function(input) {
    await models.river.remove_country_id(this, input.removeCountries);
}



/**
 * countAllAssociatedRecords - Count records associated with another given record
 *
 * @param  {ID} id      Id of the record which the associations will be counted
 * @param  {objec} context Default context by resolver
 * @return {Int}         Number of associated records
 */
async function countAllAssociatedRecords(id, context) {

    let river = await resolvers.readOneRiver({
        river_id: id
    }, context);
    //check that record actually exists
    if (river === null) throw new Error(`Record with ID = ${id} does not exist`);
    let promises_to_many = [];
    let promises_to_one = [];


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
        throw new Error(`river with river_id ${id} has associated records and is NOT valid for deletion. Please clean up before you delete.`);
    }
    return true;
}

module.exports = {
    /**
     * rivers - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Offset and limit to get the records from and to respectively
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records holding conditions specified by search, order and pagination argument
     */
    rivers: async function({
        search,
        order,
        pagination
    }, context) {
        if (await checkAuthorization(context, 'river', 'read') === true) {
            helper.checkCountAndReduceRecordLimitHelper(pagination.limit, context, "rivers")
            let benignErrorReporter = new errorHelper.BenignErrorReporter(context);
            return await river.readAll(search, order, pagination, benignErrorReporter);
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },

    /**
     * riversConnection - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
     */
    riversConnection: async function({
        search,
        order,
        pagination
    }, context) {
        if (await checkAuthorization(context, 'river', 'read') === true) {
            helper.checkCursorBasedPaginationArgument(pagination);
            let limit = pagination.first !== undefined ? pagination.first : pagination.last;
            helper.checkCountAndReduceRecordLimitHelper(limit, context, "riversConnection");
            let benignErrorReporter = new errorHelper.BenignErrorReporter(context);
            return await river.readAllCursor(search, order, pagination, benignErrorReporter);
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },

    /**
     * readOneRiver - Check user authorization and return one record with the specified river_id in the river_id argument.
     *
     * @param  {number} {river_id}    river_id of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with river_id requested
     */
    readOneRiver: async function({
        river_id
    }, context) {
        if (await checkAuthorization(context, 'river', 'read') === true) {
            helper.checkCountAndReduceRecordLimitHelper(1, context, "readOneRiver")
            let benignErrorReporter = new errorHelper.BenignErrorReporter(context);
            return await river.readById(river_id, benignErrorReporter);
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },

    /**
     * countRivers - Counts number of records that holds the conditions specified in the search argument
     *
     * @param  {object} {search} Search argument for filtering records
     * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {number}          Number of records that holds the conditions specified in the search argument
     */
    countRivers: async function({
        search
    }, context) {
        if (await checkAuthorization(context, 'river', 'read') === true) {
            let benignErrorReporter = new errorHelper.BenignErrorReporter(context);
            return await river.countRecords(search, benignErrorReporter);
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },

    /**
     * vueTableRiver - Return table of records as needed for displaying a vuejs table
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Records with format as needed for displaying a vuejs table
     */
    vueTableRiver: async function(_, context) {
        if (await checkAuthorization(context, 'river', 'read') === true) {
            return helper.vueTable(context.request, river, ["id", "name", "river_id"]);
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },

    /**
     * addRiver - Check user authorization and creates a new record with data specified in the input argument.
     * This function only handles attributes, not associations.
     * @see handleAssociations for further information.
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
    addRiver: async function(input, context) {
        let authorization = await checkAuthorization(context, 'river', 'create');
        if (authorization === true) {
            let inputSanitized = helper.sanitizeAssociationArguments(input, [Object.keys(associationArgsDef)]);
            await helper.checkAuthorizationOnAssocArgs(inputSanitized, context, associationArgsDef, ['read', 'create'], models);
            await helper.checkAndAdjustRecordLimitForCreateUpdate(inputSanitized, context, associationArgsDef);
            if (!input.skipAssociationsExistenceChecks) {
                await helper.validateAssociationArgsExistence(inputSanitized, context, associationArgsDef);
            }
            let benignErrorReporter = new errorHelper.BenignErrorReporter(context);
            let createdRiver = await river.addOne(inputSanitized, benignErrorReporter);
            await createdRiver.handleAssociations(inputSanitized, benignErrorReporter);
            return createdRiver;
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },

    /**
     * bulkAddRiverCsv - Load csv file of records
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddRiverCsv: async function(_, context) {
        if (await checkAuthorization(context, 'river', 'create') === true) {
            let benignErrorReporter = new errorHelper.BenignErrorReporter(context);
            return river.bulkAddCsv(context, benignErrorReporter);
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },

    /**
     * deleteRiver - Check user authorization and delete a record with the specified river_id in the river_id argument.
     *
     * @param  {number} {river_id}    river_id of the record to delete
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {string}         Message indicating if deletion was successfull.
     */
    deleteRiver: async function({
        river_id
    }, context) {
        if (await checkAuthorization(context, 'river', 'delete') === true) {
            if (await validForDeletion(river_id, context)) {
                let benignErrorReporter = new errorHelper.BenignErrorReporter(context);
                return river.deleteOne(river_id, benignErrorReporter);
            }
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },

    /**
     * updateRiver - Check user authorization and update the record specified in the input argument
     * This function only handles attributes, not associations.
     * @see handleAssociations for further information.
     *
     * @param  {object} input   record to update and new info to update
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Updated record
     */
    updateRiver: async function(input, context) {
        let authorization = await checkAuthorization(context, 'river', 'update');
        if (authorization === true) {
            let inputSanitized = helper.sanitizeAssociationArguments(input, [Object.keys(associationArgsDef)]);
            await helper.checkAuthorizationOnAssocArgs(inputSanitized, context, associationArgsDef, ['read', 'create'], models);
            await helper.checkAndAdjustRecordLimitForCreateUpdate(inputSanitized, context, associationArgsDef);
            if (!input.skipAssociationsExistenceChecks) {
                await helper.validateAssociationArgsExistence(inputSanitized, context, associationArgsDef);
            }
            let benignErrorReporter = new errorHelper.BenignErrorReporter(context);
            let updatedRiver = await river.updateOne(inputSanitized, benignErrorReporter);
            await updatedRiver.handleAssociations(inputSanitized, benignErrorReporter);
            return updatedRiver;
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },


    /**
     * csvTableTemplateRiver - Returns table's template
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {Array}         Strings, one for header and one columns types
     */
    csvTableTemplateRiver: async function(_, context) {
        if (await checkAuthorization(context, 'river', 'read') === true) {
            let benignErrorReporter = new errorHelper.BenignErrorReporter(context);
            return river.csvTableTemplate(benignErrorReporter);
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    }

}