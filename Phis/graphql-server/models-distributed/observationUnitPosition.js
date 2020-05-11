const _ = require('lodash');
const path = require('path');
const adapters = require('../adapters/index');
const globals = require('../config/globals');
const helper = require('../utils/helper');
const models = require(path.join(__dirname, '..', 'models_index.js'));

const definition = {
    model: 'observationUnitPosition',
    storageType: 'distributed-data-model',
    registry: [
        'observationUnitPosition_PHENOMIS',
        'observationUnitPosition_PHIS',
        'observationUnitPosition_PIPPA'
    ],
    attributes: {
        blockNumber: 'String',
        entryNumber: 'String',
        positionCoordinateX: 'String',
        positionCoordinateY: 'String',
        replicate: 'String',
        observationUnitDbId: 'String',
        observationUnitPositionDbId: 'String'
    },
    associations: {
        observationUnit: {
            type: 'to_one',
            target: 'observationUnit',
            targetKey: 'observationUnitDbId',
            keyIn: 'observationUnitPosition',
            targetStorageType: 'distributed-data-model',
            label: 'observationUnitName',
            name: 'observationUnit',
            name_lc: 'observationUnit',
            name_cp: 'ObservationUnit',
            target_lc: 'observationUnit',
            target_lc_pl: 'observationUnits',
            target_pl: 'observationUnits',
            target_cp: 'ObservationUnit',
            target_cp_pl: 'ObservationUnits',
            keyIn_lc: 'observationUnitPosition',
            holdsForeignKey: true
        }
    },
    internalId: 'observationUnitPositionDbId',
    id: {
        name: 'observationUnitPositionDbId',
        type: 'String'
    }
};

let registry = ["observationUnitPosition_PHENOMIS", "observationUnitPosition_PHIS", "observationUnitPosition_PIPPA"];

module.exports = class observationUnitPosition {

    /**
     * constructor - Creates an instance of the model
     *
     * @param  {obejct} input    Data for the new instances. Input for each field of the model.
     */

    constructor({
        observationUnitPositionDbId,
        blockNumber,
        entryNumber,
        positionCoordinateX,
        positionCoordinateY,
        replicate,
        observationUnitDbId
    }) {
        this.observationUnitPositionDbId = observationUnitPositionDbId;
        this.blockNumber = blockNumber;
        this.entryNumber = entryNumber;
        this.positionCoordinateX = positionCoordinateX;
        this.positionCoordinateY = positionCoordinateY;
        this.replicate = replicate;
        this.observationUnitDbId = observationUnitDbId;
    }

    static get name() {
        return "observationUnitPosition";
    }

    /**
     * registeredAdapters - Returns an object which has a key for each
     * adapter on adapter/index.js. Each key of the object will have
     *
     * @return {string}     baseUrl from request.
     */
    static get registeredAdapters() {
        return ["observationUnitPosition_PHENOMIS", "observationUnitPosition_PHIS", "observationUnitPosition_PIPPA"].reduce((a, c) => {
            a[c] = adapters[c];
            return a;
        }, {});
    }

    static adapterForIri(iri) {
        let responsibleAdapter = registry.filter(adapter => adapters[adapter].recognizeId(iri));
        if (responsibleAdapter.length > 1) {
            throw new Error("IRI has no unique match");
        } else if (responsibleAdapter.length === 0) {
            throw new Error("IRI has no match WS");
        }
        return responsibleAdapter[0];
    }

    static readById(id) {
        if (id !== null) {
            let responsibleAdapter = registry.filter(adapter => adapters[adapter].recognizeId(id));

            if (responsibleAdapter.length > 1) {
                throw new Error("IRI has no unique match");
            } else if (responsibleAdapter.length === 0) {
                throw new Error("IRI has no match WS");
            }

            return adapters[responsibleAdapter[0]].readById(id).then(result => new observationUnitPosition(result));
        }
    }

    static countRecords(search, authorizedAdapters) {
        let authAdapters = [];
        /**
         * Differentiated cases:
         *    if authorizedAdapters is defined:
         *      - called from resolver.
         *      - authorizedAdapters will no be modified.
         *
         *    if authorizedAdapters is not defined:
         *      - called internally
         *      - authorizedAdapters will be set to registered adapters.
         */
        if (authorizedAdapters === undefined) {
            authAdapters = Object.values(this.registeredAdapters);
        } else {
            authAdapters = Array.from(authorizedAdapters)
        }

        let promises = authAdapters.map(adapter => {
            /**
             * Differentiated cases:
             *   sql-adapter:
             *      resolve with current parameters.
             *
             *   ddm-adapter:
             *   cenzontle-webservice-adapter:
             *   generic-adapter:
             *      add exclusions to search.excludeAdapterNames parameter.
             */
            switch (adapter.adapterType) {
                case 'ddm-adapter':
                case 'generic-adapter':
                    let nsearch = helper.addExclusions(search, adapter.adapterName, Object.values(this.registeredAdapters));
                    return adapter.countRecords(nsearch).catch(benignErrors => benignErrors);

                case 'sql-adapter':
                case 'cenzontle-webservice-adapter':
                    return adapter.countRecords(search).catch(benignErrors => benignErrors);

                case 'default':
                    throw new Error(`Adapter type: '${adapter.adapterType}' is not supported`);
            }
        });

        return Promise.all(promises).then(results => {
            return results.reduce((total, current) => {
                //check if current is Error
                if (current instanceof Error) {
                    total.errors.push(current);
                }
                //check current result
                else if (current) {
                    total.sum += current;
                }
                return total;
            }, {
                sum: 0,
                errors: []
            });
        });
    }

    static readAllCursor(search, order, pagination, authorizedAdapters) {
        let authAdapters = [];
        /**
         * Differentiated cases:
         *    if authorizedAdapters is defined:
         *      - called from resolver.
         *      - authorizedAdapters will no be modified.
         *
         *    if authorizedAdapters is not defined:
         *      - called internally
         *      - authorizedAdapters will be set to registered adapters.
         */
        if (authorizedAdapters === undefined) {
            authAdapters = Object.values(this.registeredAdapters);
        } else {
            authAdapters = Array.from(authorizedAdapters)
        }

        //check valid pagination arguments
        let argsValid = (pagination === undefined) || (pagination.first && !pagination.before && !pagination.last) || (pagination.last && !pagination.after && !pagination.first);
        if (!argsValid) {
            throw new Error('Illegal cursor based pagination arguments. Use either "first" and optionally "after", or "last" and optionally "before"!');
        }

        let isForwardPagination = !pagination || !(pagination.last != undefined);
        let promises = authAdapters.map(adapter => {
            /**
             * Differentiated cases:
             *   sql-adapter:
             *      resolve with current parameters.
             *
             *   ddm-adapter:
             *   cenzontle-webservice-adapter:
             *   generic-adapter:
             *      add exclusions to search.excludeAdapterNames parameter.
             */
            switch (adapter.adapterType) {
                case 'ddm-adapter':
                case 'generic-adapter':
                    let nsearch = helper.addExclusions(search, adapter.adapterName, Object.values(this.registeredAdapters));
                    return adapter.readAllCursor(nsearch, order, pagination).catch(benignErrors => benignErrors);

                case 'sql-adapter':
                case 'cenzontle-webservice-adapter':
                    return adapter.readAllCursor(search, order, pagination).catch(benignErrors => benignErrors);

                case 'default':
                    throw new Error(`Adapter type '${adapter.adapterType}' is not supported`);
            }
        });
        let someHasNextPage = false;
        let someHasPreviousPage = false;
        return Promise.all(promises)
            //phase 1: reduce
            .then(results => {
                return results.reduce((total, current) => {
                    //check if current is Error
                    if (current instanceof Error) {
                        total.errors.push(current);
                    }
                    //check current
                    else if (current && current.pageInfo && current.edges) {
                        someHasNextPage |= current.pageInfo.hasNextPage;
                        someHasPreviousPage |= current.pageInfo.hasPreviousPage;
                        total.nodes = total.nodes.concat(current.edges.map(e => e.node));
                    }
                    return total;
                }, {
                    nodes: [],
                    errors: []
                });
            })
            //phase 2: order & paginate
            .then(nodesAndErrors => {
                let nodes = nodesAndErrors.nodes;
                let errors = nodesAndErrors.errors;

                if (order === undefined) {
                    order = [{
                        field: "observationUnitPositionDbId",
                        order: 'ASC'
                    }];
                }
                if (pagination === undefined) {
                    pagination = {
                        first: Math.min(globals.LIMIT_RECORDS, nodes.length)
                    }
                }

                let ordered_records = helper.orderRecords(nodes, order);
                let paginated_records = [];

                if (isForwardPagination) {
                    paginated_records = helper.paginateRecordsCursor(ordered_records, pagination.first);
                } else {
                    paginated_records = helper.paginateRecordsBefore(ordered_records, pagination.last);
                }

                let hasNextPage = ordered_records.length > pagination.first || someHasNextPage;
                let hasPreviousPage = ordered_records.length > pagination.last || someHasPreviousPage;

                let graphQLConnection = helper.toGraphQLConnectionObject(paginated_records, this, hasNextPage, hasPreviousPage);
                graphQLConnection['errors'] = errors;
                return graphQLConnection;
            });
    }

    static get definition() {
        return definition;
    }

    static base64Decode(cursor) {
        return Buffer.from(cursor, 'base64').toString('utf-8');
    }

    base64Enconde() {
        return Buffer.from(JSON.stringify(this.stripAssociations())).toString('base64');
    }

    stripAssociations() {
        let attributes = Object.keys(observationUnitPosition.definition.attributes);
        let data_values = _.pick(this, attributes);
        return data_values;
    }

    /**
     * idAttribute - Check whether an attribute "internalId" is given in the JSON model. If not the standard "id" is used instead.
     *
     * @return {type} Name of the attribute that functions as an internalId
     */

    static idAttribute() {
        let internalId = observationUnitPosition.definition.id.name;
        return internalId;
    }

    /**
     * idAttributeType - Return the Type of the internalId.
     *
     * @return {type} Type given in the JSON model
     */

    static idAttributeType() {
        return observationUnitPosition.definition.id.type;
    }

    /**
     * getIdValue - Get the value of the idAttribute ("id", or "internalId") for an instance of observationUnitPosition.
     *
     * @return {type} id value
     */

    getIdValue() {
        return this[observationUnitPosition.idAttribute()]
    }

    static assertInputHasId(input) {
        if (!input.observationUnitPositionDbId) {
            throw new Error(`Illegal argument. Provided input requires attribute 'observationUnitPositionDbId'.`);
        }
        return true;
    }

    static addOne(input) {
        this.assertInputHasId(input);
        let responsibleAdapter = this.adapterForIri(input.observationUnitPositionDbId);
        return adapters[responsibleAdapter].addOne(input).then(result => new observationUnitPosition(result));
    }

    static deleteOne(id) {
        let responsibleAdapter = this.adapterForIri(id);
        return adapters[responsibleAdapter].deleteOne(id);
    }

    static updateOne(input) {
        this.assertInputHasId(input);
        let responsibleAdapter = this.adapterForIri(input.observationUnitPositionDbId);
        return adapters[responsibleAdapter].updateOne(input).then(result => new observationUnitPosition(result));
    }

    /**
     * add_observationUnitDbId - field Mutation (model-layer) for to_one associationsArguments to add
     *
     * @param {Id}   observationUnitPositionDbId   IdAttribute of the root model to be updated
     * @param {Id}   observationUnitDbId Foreign Key (stored in "Me") of the Association to be updated.
     */
    static async add_observationUnitDbId(observationUnitPositionDbId, observationUnitDbId) {
        let responsibleAdapter = this.adapterForIri(observationUnitPositionDbId);
        return await adapters[responsibleAdapter].add_observationUnitDbId(observationUnitPositionDbId, observationUnitDbId);
    }

    /**
     * remove_observationUnitDbId - field Mutation (model-layer) for to_one associationsArguments to remove
     *
     * @param {Id}   observationUnitPositionDbId   IdAttribute of the root model to be updated
     * @param {Id}   observationUnitDbId Foreign Key (stored in "Me") of the Association to be updated.
     */
    static async remove_observationUnitDbId(observationUnitPositionDbId, observationUnitDbId) {
        let responsibleAdapter = this.adapterForIri(observationUnitPositionDbId);
        return await adapters[responsibleAdapter].remove_observationUnitDbId(observationUnitPositionDbId, observationUnitDbId);
    }



    static bulkAddCsv(context) {
        throw new Error("observationUnitPosition.bulkAddCsv is not implemented.")
    }

    static csvTableTemplate() {
        return helper.csvTableTemplate(observationUnitPosition);
    }
}