/*
    Resolvers for basic CRUD operations
*/

const path = require('path');
const accession = require(path.join(__dirname, '..', 'models_index.js')).accession;
const helper = require('../utils/helper');
const checkAuthorization = require('../utils/check-authorization');
const fs = require('fs');
const {
    handleError
} = require('../utils/errors');
const os = require('os');
const resolvers = require(path.join(__dirname, 'index.js'));
const models = require(path.join(__dirname, '..', 'models_index.js'));

const associationArgsDef = {
    'addTaxon': 'taxon',
    'addLocation': 'location',
    'addIndividuals': 'individual',
    'addMeasurements': 'measurement'
}

/**
 * accession.prototype.taxon - Return associated record
 *
 * @param  {object} search       Search argument to match the associated record
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
accession.prototype.taxon = async function({
    search
}, context) {
    try {
        if (search === undefined) {
            return resolvers.readOneTaxon({
                [models.taxon.idAttribute()]: this.taxon_id
            }, context)
        } else {
            //build new search filter
            let nsearch = helper.addSearchField({
                "search": search,
                "field": models.taxon.idAttribute(),
                "value": {
                    "value": this.taxon_id
                },
                "operator": "eq"
            });
            let found = await resolvers.taxonsConnection({
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
/**
 * accession.prototype.location - Return associated record
 *
 * @param  {object} search       Search argument to match the associated record
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
accession.prototype.location = async function({
    search
}, context) {
    try {
        if (search === undefined) {
            return resolvers.readOneLocation({
                [models.location.idAttribute()]: this.locationId
            }, context)
        } else {
            //build new search filter
            let nsearch = helper.addSearchField({
                "search": search,
                "field": models.location.idAttribute(),
                "value": {
                    "value": this.locationId
                },
                "operator": "eq"
            });
            let found = await resolvers.locationsConnection({
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


/**
 * accession.prototype.countFilteredIndividuals - Count number of associated records that holds the conditions specified in the search argument
 *
 * @param  {object} {search} description
 * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}          Number of associated records that holds the conditions specified in the search argument
 */
accession.prototype.countFilteredIndividuals = function({
    search
}, context) {
    try {

        //build new search filter
        let nsearch = helper.addSearchField({
            "search": search,
            "field": "accession_id",
            "value": {
                "value": this.getIdValue()
            },
            "operator": "eq"
        });

        return resolvers.countIndividuals({
            search: nsearch
        }, context);
    } catch (error) {
        console.error(error);
        handleError(error);
    };
}


/**
 * accession.prototype.individualsConnection - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
 */
accession.prototype.individualsConnection = function({
    search,
    order,
    pagination
}, context) {
    try {

        //build new search filter
        let nsearch = helper.addSearchField({
            "search": search,
            "field": "accession_id",
            "value": {
                "value": this.getIdValue()
            },
            "operator": "eq"
        });

        return resolvers.individualsConnection({
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
 * accession.prototype.countFilteredMeasurements - Count number of associated records that holds the conditions specified in the search argument
 *
 * @param  {object} {search} description
 * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}          Number of associated records that holds the conditions specified in the search argument
 */
accession.prototype.countFilteredMeasurements = function({
    search
}, context) {
    try {

        //build new search filter
        let nsearch = helper.addSearchField({
            "search": search,
            "field": "accession_id",
            "value": {
                "value": this.getIdValue()
            },
            "operator": "eq"
        });

        return resolvers.countMeasurements({
            search: nsearch
        }, context);
    } catch (error) {
        console.error(error);
        handleError(error);
    };
}


/**
 * accession.prototype.measurementsConnection - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
 */
accession.prototype.measurementsConnection = function({
    search,
    order,
    pagination
}, context) {
    try {

        //build new search filter
        let nsearch = helper.addSearchField({
            "search": search,
            "field": "accession_id",
            "value": {
                "value": this.getIdValue()
            },
            "operator": "eq"
        });

        return resolvers.measurementsConnection({
            search: nsearch,
            order: order,
            pagination: pagination
        }, context);
    } catch (error) {
        console.error(error);
        handleError(error);
    };
}

module.exports = {

    /**
     * accessionsConnection - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Cursor and first(indicatig the number of records to retrieve) arguments to apply cursor-based pagination.
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records as grapqhql connections holding conditions specified by search, order and pagination argument
     */
    accessionsConnection: async function({
        search,
        order,
        pagination
    }, context) {
        /**
         * Debug
         */
        console.log("\n-@--resolver: on: accessionsConnection");

        //check: adapters
        let registeredAdapters = Object.values(accession.registeredAdapters);
        if (registeredAdapters.length === 0) {
            throw new Error('No adapters registered for data model "Accession"');
        } //else

        try {
            //exclude adapters
            let adapters = helper.removeExcludedAdapters(search, registeredAdapters);
            if (adapters.length === 0) {
                throw new Error('All adapters was excluded for data model "Accession"');
            } //else

            //check: auth adapters
            let authorizationCheck = await helper.authorizedAdapters(context, adapters, 'read');
            if (authorizationCheck.authorizedAdapters.length > 0) {
                let connectionObj = await accession.readAllCursor(search, order, pagination, authorizationCheck.authorizedAdapters);
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
                    throw new Error('No available adapters for data model "Accession" ');
                }
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },


    /**
     * readOneAccession - Check user authorization and return one record with the specified accession_id in the accession_id argument.
     *
     * @param  {number} {accession_id}    accession_id of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with accession_id requested
     */
    readOneAccession: async function({
        accession_id
    }, context) {
        /**
         * Debug
         */
        console.log("\n-@--resolver: on: readOneAccession");

        //check: adapters auth
        try {
            let authorizationCheck = await checkAuthorization(context, accession.adapterForIri(accession_id), 'read');
            if (authorizationCheck === true) {
                return accession.readById(accession_id);
            } else { //adapter not auth
                throw new Error("You don't have authorization to perform this action on adapter");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * addAccession - Check user authorization and creates a new record with data specified in the input argument
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
    addAccession: async function(input, context) {
        /**
         * Debug
         */
        console.log("\n-@--resolver: on: addAccession");

        //check: input has idAttribute
        if (!input.accession_id) {
            throw new Error(`Illegal argument. Provided input requires attribute 'accession_id'.`);
        }

        //check: adapters auth
        try {
            let authorizationCheck = await checkAuthorization(context, accession.adapterForIri(input.accession_id), 'create');
            if (authorizationCheck === true) {
                return accession.addOne(input);
            } else { //adapter not auth
                throw new Error("You don't have authorization to perform this action on adapter");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },


    /**
     * bulkAddAccessionCsv - Load csv file of records
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddAccessionCsv: function(_, context) {
        return checkAuthorization(context, 'Accession', 'create').then(authorization => {
            if (authorization === true) {
                return accession.bulkAddCsv(context);
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    },

    /**
     * deleteAccession - Check user authorization and delete a record with the specified accession_id in the accession_id argument.
     *
     * @param  {number} {accession_id}    accession_id of the record to delete
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {string}         Message indicating if deletion was successfull.
     */
    deleteAccession: async function({
        accession_id
    }, context) {
        /**
         * Debug
         */
        console.log("\n-@--resolver: on: deleteAccession");

        //check: adapters auth
        try {
            let authorizationCheck = await checkAuthorization(context, accession.adapterForIri(accession_id), 'delete');
            if (authorizationCheck === true) {
                return accession.deleteOne(accession_id);
            } else { //adapter not auth
                throw new Error("You don't have authorization to perform this action on adapter");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * updateAccession - Check user authorization and update the record specified in the input argument
     *
     * @param  {object} input   record to update and new info to update
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Updated record
     */
    updateAccession: async function(input, context) {
        /**
         * Debug
         */
        console.log("\n-@--resolver: on: updateAccession");

        //check: input has idAttribute
        if (!input.accession_id) {
            throw new Error(`Illegal argument. Provided input requires attribute 'accession_id'.`);
        }

        //check: adapters auth
        try {
            let authorizationCheck = await checkAuthorization(context, accession.adapterForIri(input.accession_id), 'update');
            if (authorizationCheck === true) {
                return accession.updateOne(input);
            } else { //adapter not auth
                throw new Error("You don't have authorization to perform this action on adapter");
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * countAccessions - Counts number of records that holds the conditions specified in the search argument
     *
     * @param  {object} {search} Search argument for filtering records
     * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {number}          Number of records that holds the conditions specified in the search argument
     */

    countAccessions: async function({
        search
    }, context) {
        /**
         * Debug
         */
        console.log("\n-@--resolver: on: countAccession");

        //check: adapters
        let registeredAdapters = Object.values(accession.registeredAdapters);
        if (registeredAdapters.length === 0) {
            throw new Error('No adapters registered for data model "Accession"');
        } //else

        try {
            //exclude adapters
            let adapters = helper.removeExcludedAdapters(search, registeredAdapters);
            if (adapters.length === 0) {
                throw new Error('All adapters was excluded for data model "Accession"');
            } //else

            //check: auth adapters
            let authorizationCheck = await helper.authorizedAdapters(context, adapters, 'read');
            if (authorizationCheck.authorizedAdapters.length > 0) {

                let countObj = await accession.countRecords(search, authorizationCheck.authorizedAdapters);
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
                    throw new Error('No available adapters for data model "Accession"');
                }
            }
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    },

    /**
     * csvTableTemplateAccession - Returns table's template
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {Array}         Strings, one for header and one columns types
     */
    csvTableTemplateAccession: function(_, context) {
        return checkAuthorization(context, 'Accession', 'read').then(authorization => {
            if (authorization === true) {
                return accession.csvTableTemplate();
            } else {
                throw new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            console.error(error);
            handleError(error);
        })
    }

}