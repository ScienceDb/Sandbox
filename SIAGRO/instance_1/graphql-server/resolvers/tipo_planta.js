/*
    Resolvers for basic CRUD operations
*/

const path = require('path');
const tipo_planta = require(path.join(__dirname, '..', 'models', 'index.js')).tipo_planta;
const helper = require('../utils/helper');
const checkAuthorization = require('../utils/check-authorization');
const fs = require('fs');
const os = require('os');
const resolvers = require(path.join(__dirname, 'index.js'));
const models = require(path.join(__dirname, '..', 'models', 'index.js'));
const globals = require('../config/globals');
const errorHelper = require('../utils/errors');

const associationArgsDef = {
    'addCuadrantes': 'cuadrante'
}




/**
 * tipo_planta.prototype.cuadrantesFilter - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Offset and limit to get the records from and to respectively
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of associated records holding conditions specified by search, order and pagination argument
 */
tipo_planta.prototype.cuadrantesFilter = function({
    search,
    order,
    pagination
}, context) {
    //build new search filter
    let nsearch = helper.addSearchField({
        "search": search,
        "field": "tipo_planta_id",
        "value": {
            "value": this.getIdValue()
        },
        "operator": "eq"
    });

    return resolvers.cuadrantes({
        search: nsearch,
        order: order,
        pagination: pagination
    }, context);
}

/**
 * tipo_planta.prototype.countFilteredCuadrantes - Count number of associated records that holds the conditions specified in the search argument
 *
 * @param  {object} {search} description
 * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}          Number of associated records that holds the conditions specified in the search argument
 */
tipo_planta.prototype.countFilteredCuadrantes = function({
    search
}, context) {

    //build new search filter
    let nsearch = helper.addSearchField({
        "search": search,
        "field": "tipo_planta_id",
        "value": {
            "value": this.getIdValue()
        },
        "operator": "eq"
    });

    return resolvers.countCuadrantes({
        search: nsearch
    }, context);
}

/**
 * tipo_planta.prototype.cuadrantesConnection - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
 */
tipo_planta.prototype.cuadrantesConnection = function({
    search,
    order,
    pagination
}, context) {

    //build new search filter
    let nsearch = helper.addSearchField({
        "search": search,
        "field": "tipo_planta_id",
        "value": {
            "value": this.getIdValue()
        },
        "operator": "eq"
    });

    return resolvers.cuadrantesConnection({
        search: nsearch,
        order: order,
        pagination: pagination
    }, context);
}




/**
 * handleAssociations - handles the given associations in the create and update case.
 *
 * @param {object} input   Info of each field to create the new record
 * @param {BenignErrorReporter} benignErrorReporter Error Reporter used for reporting Errors from remote zendro services
 */
tipo_planta.prototype.handleAssociations = async function(input, benignErrorReporter) {
    let promises = [];
    if (helper.isNonEmptyArray(input.addCuadrantes)) {
        promises.push(this.add_cuadrantes(input, benignErrorReporter));
    }
    if (helper.isNonEmptyArray(input.removeCuadrantes)) {
        promises.push(this.remove_cuadrantes(input, benignErrorReporter));
    }

    await Promise.all(promises);
}
/**
 * add_cuadrantes - field Mutation for to_many associations to add
 * uses bulkAssociate to efficiently update associations
 *
 * @param {object} input   Info of input Ids to add  the association
 * @param {BenignErrorReporter} benignErrorReporter Error Reporter used for reporting Errors from remote zendro services
 */
tipo_planta.prototype.add_cuadrantes = async function(input, benignErrorReporter) {
    let bulkAssociationInput = input.addCuadrantes.map(associatedRecordId => {
        return {
            tipo_planta_id: this.getIdValue(),
            [models.cuadrante.idAttribute()]: associatedRecordId
        }
    });
    await models.cuadrante.bulkAssociateCuadranteWithTipo_planta_id(bulkAssociationInput, benignErrorReporter);
}

/**
 * remove_cuadrantes - field Mutation for to_many associations to remove
 * uses bulkAssociate to efficiently update associations
 *
 * @param {object} input   Info of input Ids to remove  the association
 * @param {BenignErrorReporter} benignErrorReporter Error Reporter used for reporting Errors from remote zendro services
 */
tipo_planta.prototype.remove_cuadrantes = async function(input, benignErrorReporter) {
    let bulkAssociationInput = input.removeCuadrantes.map(associatedRecordId => {
        return {
            tipo_planta_id: this.getIdValue(),
            [models.cuadrante.idAttribute()]: associatedRecordId
        }
    });
    await models.cuadrante.bulkDisAssociateCuadranteWithTipo_planta_id(bulkAssociationInput, benignErrorReporter);
}




/**
 * checkCountAndReduceRecordsLimit({search, pagination}, context, resolverName, modelName) - Make sure that the current
 * set of requested records does not exceed the record limit set in globals.js.
 *
 * @param {object} {search}  Search argument for filtering records
 * @param {object} {pagination}  If limit-offset pagination, this object will include 'offset' and 'limit' properties
 * to get the records from and to respectively. If cursor-based pagination, this object will include 'first' or 'last'
 * properties to indicate the number of records to fetch, and 'after' or 'before' cursors to indicate from which record
 * to start fetching.
 * @param {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @param {string} resolverName The resolver that makes this check
 * @param {string} modelName The model to do the count
 */
async function checkCountAndReduceRecordsLimit({
    search,
    pagination
}, context, resolverName, modelName = 'tipo_planta') {
    //defaults
    let inputPaginationValues = {
        limit: undefined,
        offset: 0,
        search: undefined,
        order: [
            ["tipo_planta_id", "ASC"]
        ],
    }

    //check search
    helper.checkSearchArgument(search);
    if (search) inputPaginationValues.search = {
        ...search
    }; //copy

    //get generic pagination values
    let paginationValues = helper.getGenericPaginationValues(pagination, "tipo_planta_id", inputPaginationValues);
    //get records count
    let count = (await models[modelName].countRecords(paginationValues.search));
    //get effective records count
    let effectiveCount = helper.getEffectiveRecordsCount(count, paginationValues.limit, paginationValues.offset);
    //do check and reduce of record limit.
    helper.checkCountAndReduceRecordLimitHelper(effectiveCount, context, resolverName);
}

/**
 * checkCountForOneAndReduceRecordsLimit(context) - Make sure that the record limit is not exhausted before requesting a single record
 *
 * @param {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 */
function checkCountForOneAndReduceRecordsLimit(context) {
    helper.checkCountAndReduceRecordLimitHelper(1, context, "readOneTipo_planta")
}
/**
 * countAllAssociatedRecords - Count records associated with another given record
 *
 * @param  {ID} id      Id of the record which the associations will be counted
 * @param  {objec} context Default context by resolver
 * @return {Int}         Number of associated records
 */
async function countAllAssociatedRecords(id, context) {

    let tipo_planta = await resolvers.readOneTipo_planta({
        tipo_planta_id: id
    }, context);
    //check that record actually exists
    if (tipo_planta === null) throw new Error(`Record with ID = ${id} does not exist`);
    let promises_to_many = [];
    let promises_to_one = [];

    promises_to_many.push(tipo_planta.countFilteredCuadrantes({}, context));

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
        throw new Error(`tipo_planta with tipo_planta_id ${id} has associated records and is NOT valid for deletion. Please clean up before you delete.`);
    }
    return true;
}

module.exports = {
    /**
     * tipo_planta - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Offset and limit to get the records from and to respectively
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records holding conditions specified by search, order and pagination argument
     */
    tipo_planta: async function({
        search,
        order,
        pagination
    }, context) {
        if (await checkAuthorization(context, 'tipo_planta', 'read') === true) {
            await checkCountAndReduceRecordsLimit({
                search,
                pagination
            }, context, "tipo_planta");
            let benignErrorReporter = new errorHelper.BenignErrorReporter(context);
            return await tipo_planta.readAll(search, order, pagination, benignErrorReporter);
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },

    /**
     * tipo_plantaConnection - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
     */
    tipo_plantaConnection: async function({
        search,
        order,
        pagination
    }, context) {
        if (await checkAuthorization(context, 'tipo_planta', 'read') === true) {
            await checkCountAndReduceRecordsLimit({
                search,
                pagination
            }, context, "tipo_plantaConnection");
            let benignErrorReporter = new errorHelper.BenignErrorReporter(context);
            return await tipo_planta.readAllCursor(search, order, pagination, benignErrorReporter);
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },

    /**
     * readOneTipo_planta - Check user authorization and return one record with the specified tipo_planta_id in the tipo_planta_id argument.
     *
     * @param  {number} {tipo_planta_id}    tipo_planta_id of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with tipo_planta_id requested
     */
    readOneTipo_planta: async function({
        tipo_planta_id
    }, context) {
        if (await checkAuthorization(context, 'tipo_planta', 'read') === true) {
            checkCountForOneAndReduceRecordsLimit(context);
            let benignErrorReporter = new errorHelper.BenignErrorReporter(context);
            return await tipo_planta.readById(tipo_planta_id, benignErrorReporter);
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },

    /**
     * countTipo_planta - Counts number of records that holds the conditions specified in the search argument
     *
     * @param  {object} {search} Search argument for filtering records
     * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {number}          Number of records that holds the conditions specified in the search argument
     */
    countTipo_planta: async function({
        search
    }, context) {
        if (await checkAuthorization(context, 'tipo_planta', 'read') === true) {
            let benignErrorReporter = new errorHelper.BenignErrorReporter(context);
            return await tipo_planta.countRecords(search, benignErrorReporter);
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },

    /**
     * vueTableTipo_planta - Return table of records as needed for displaying a vuejs table
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Records with format as needed for displaying a vuejs table
     */
    vueTableTipo_planta: async function(_, context) {
        if (await checkAuthorization(context, 'tipo_planta', 'read') === true) {
            return helper.vueTable(context.request, tipo_planta, ["id", "tipo_planta_id", "tipo_planta", "foto_produccion", "foto_autoconsumo", "foto_venta", "foto_compra", "justificacion_produccion_cuadrante1", "justificacion_produccion_cuadrante2", "justificacion_produccion_cuadrante3", "justificacion_produccion_cuadrante4"]);
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },

    /**
     * addTipo_planta - Check user authorization and creates a new record with data specified in the input argument.
     * This function only handles attributes, not associations.
     * @see handleAssociations for further information.
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
    addTipo_planta: async function(input, context) {
        let authorization = await checkAuthorization(context, 'tipo_planta', 'create');
        if (authorization === true) {
            let inputSanitized = helper.sanitizeAssociationArguments(input, [Object.keys(associationArgsDef)]);
            await helper.checkAuthorizationOnAssocArgs(inputSanitized, context, associationArgsDef, ['read', 'create'], models);
            await helper.checkAndAdjustRecordLimitForCreateUpdate(inputSanitized, context, associationArgsDef);
            if (!input.skipAssociationsExistenceChecks) {
                await helper.validateAssociationArgsExistence(inputSanitized, context, associationArgsDef);
            }
            let benignErrorReporter = new errorHelper.BenignErrorReporter(context);
            let createdTipo_planta = await tipo_planta.addOne(inputSanitized, benignErrorReporter);
            await createdTipo_planta.handleAssociations(inputSanitized, benignErrorReporter);
            return createdTipo_planta;
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },

    /**
     * bulkAddTipo_plantaCsv - Load csv file of records
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddTipo_plantaCsv: async function(_, context) {
        if (await checkAuthorization(context, 'tipo_planta', 'create') === true) {
            let benignErrorReporter = new errorHelper.BenignErrorReporter(context);
            return tipo_planta.bulkAddCsv(context, benignErrorReporter);
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },

    /**
     * deleteTipo_planta - Check user authorization and delete a record with the specified tipo_planta_id in the tipo_planta_id argument.
     *
     * @param  {number} {tipo_planta_id}    tipo_planta_id of the record to delete
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {string}         Message indicating if deletion was successfull.
     */
    deleteTipo_planta: async function({
        tipo_planta_id
    }, context) {
        if (await checkAuthorization(context, 'tipo_planta', 'delete') === true) {
            if (await validForDeletion(tipo_planta_id, context)) {
                let benignErrorReporter = new errorHelper.BenignErrorReporter(context);
                return tipo_planta.deleteOne(tipo_planta_id, benignErrorReporter);
            }
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },

    /**
     * updateTipo_planta - Check user authorization and update the record specified in the input argument
     * This function only handles attributes, not associations.
     * @see handleAssociations for further information.
     *
     * @param  {object} input   record to update and new info to update
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Updated record
     */
    updateTipo_planta: async function(input, context) {
        let authorization = await checkAuthorization(context, 'tipo_planta', 'update');
        if (authorization === true) {
            let inputSanitized = helper.sanitizeAssociationArguments(input, [Object.keys(associationArgsDef)]);
            await helper.checkAuthorizationOnAssocArgs(inputSanitized, context, associationArgsDef, ['read', 'create'], models);
            await helper.checkAndAdjustRecordLimitForCreateUpdate(inputSanitized, context, associationArgsDef);
            if (!input.skipAssociationsExistenceChecks) {
                await helper.validateAssociationArgsExistence(inputSanitized, context, associationArgsDef);
            }
            let benignErrorReporter = new errorHelper.BenignErrorReporter(context);
            let updatedTipo_planta = await tipo_planta.updateOne(inputSanitized, benignErrorReporter);
            await updatedTipo_planta.handleAssociations(inputSanitized, benignErrorReporter);
            return updatedTipo_planta;
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    },


    /**
     * csvTableTemplateTipo_planta - Returns table's template
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {Array}         Strings, one for header and one columns types
     */
    csvTableTemplateTipo_planta: async function(_, context) {
        if (await checkAuthorization(context, 'tipo_planta', 'read') === true) {
            let benignErrorReporter = new errorHelper.BenignErrorReporter(context);
            return tipo_planta.csvTableTemplate(benignErrorReporter);
        } else {
            throw new Error("You don't have authorization to perform this action");
        }
    }

}