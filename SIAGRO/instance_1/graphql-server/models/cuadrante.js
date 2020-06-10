'use strict';

const _ = require('lodash');
const Sequelize = require('sequelize');
const dict = require('../utils/graphql-sequelize-types');
const searchArg = require('../utils/search-argument');
const globals = require('../config/globals');
const validatorUtil = require('../utils/validatorUtil');
const fileTools = require('../utils/file-tools');
const helpersAcl = require('../utils/helpers-acl');
const email = require('../utils/email');
const fs = require('fs');
const path = require('path');
const os = require('os');
const uuidv4 = require('uuidv4').uuid;
const helper = require('../utils/helper');
const models = require(path.join(__dirname, '..', 'models_index.js'));
const moment = require('moment');
// An exact copy of the the model definition that comes from the .json file
const definition = {
    model: 'cuadrante',
    storageType: 'sql',
    attributes: {
        cuadrante_id: 'String',
        tipo_planta: 'String',
        produccion_valor: 'Int',
        produccion_etiqueta: 'String',
        autoconsumo_valor: 'Int',
        autoconsumo_etiqueta: 'String',
        compra_valor: 'Int',
        compra_etiqueta: 'String',
        venta_valor: 'Int',
        venta_etiqueta: 'String',
        nombre_comun_grupo_enfoque: 'String',
        grupo_enfoque_id: 'String',
        taxon_id: 'String'
    },
    associations: {
        grupo_enfoque: {
            type: 'to_one',
            target: 'grupo_enfoque',
            targetKey: 'grupo_enfoque_id',
            keyIn: 'cuadrante',
            targetStorageType: 'sql',
            label: 'grupo_id',
            sublabel: 'fecha',
            name: 'grupo_enfoque',
            name_lc: 'grupo_enfoque',
            name_cp: 'Grupo_enfoque',
            target_lc: 'grupo_enfoque',
            target_lc_pl: 'grupo_enfoques',
            target_pl: 'grupo_enfoques',
            target_cp: 'Grupo_enfoque',
            target_cp_pl: 'Grupo_enfoques',
            keyIn_lc: 'cuadrante',
            holdsForeignKey: true
        },
        informacion_taxonomica: {
            type: 'to_one',
            target: 'taxon',
            targetKey: 'taxon_id',
            keyIn: 'cuadrante',
            targetStorageType: 'generic',
            label: 'taxon',
            name: 'informacion_taxonomica',
            name_lc: 'informacion_taxonomica',
            name_cp: 'Informacion_taxonomica',
            target_lc: 'taxon',
            target_lc_pl: 'taxons',
            target_pl: 'taxons',
            target_cp: 'Taxon',
            target_cp_pl: 'Taxons',
            keyIn_lc: 'cuadrante',
            holdsForeignKey: true
        }
    },
    internalId: 'cuadrante_id',
    id: {
        name: 'cuadrante_id',
        type: 'String'
    }
};

/**
 * module - Creates a sequelize model
 *
 * @param  {object} sequelize Sequelize instance.
 * @param  {object} DataTypes Allowed sequelize data types.
 * @return {object}           Sequelize model with associations defined
 */

module.exports = class cuadrante extends Sequelize.Model {

    static init(sequelize, DataTypes) {
        return super.init({

            cuadrante_id: {
                type: Sequelize[dict['String']],
                primaryKey: true
            },
            tipo_planta: {
                type: Sequelize[dict['String']]
            },
            produccion_valor: {
                type: Sequelize[dict['Int']]
            },
            produccion_etiqueta: {
                type: Sequelize[dict['String']]
            },
            autoconsumo_valor: {
                type: Sequelize[dict['Int']]
            },
            autoconsumo_etiqueta: {
                type: Sequelize[dict['String']]
            },
            compra_valor: {
                type: Sequelize[dict['Int']]
            },
            compra_etiqueta: {
                type: Sequelize[dict['String']]
            },
            venta_valor: {
                type: Sequelize[dict['Int']]
            },
            venta_etiqueta: {
                type: Sequelize[dict['String']]
            },
            nombre_comun_grupo_enfoque: {
                type: Sequelize[dict['String']]
            },
            grupo_enfoque_id: {
                type: Sequelize[dict['String']]
            },
            taxon_id: {
                type: Sequelize[dict['String']]
            }


        }, {
            modelName: "cuadrante",
            tableName: "cuadrantes",
            sequelize
        });
    }

    static associate(models) {
        cuadrante.belongsTo(models.grupo_enfoque, {
            as: 'grupo_enfoque',
            foreignKey: 'grupo_enfoque_id'
        });
    }

    static async readById(id) {
        let item = await cuadrante.findByPk(id);
        if (item === null) {
            throw new Error(`Record with ID = "${id}" does not exist`);
        }
        return validatorUtil.ifHasValidatorFunctionInvoke('validateAfterRead', this, item)
            .then((valSuccess) => {
                return item
            });
    }

    static async countRecords(search) {
        let options = {};
        if (search !== undefined) {

            //check
            if (typeof search !== 'object') {
                throw new Error('Illegal "search" argument type, it must be an object.');
            }

            let arg = new searchArg(search);
            let arg_sequelize = arg.toSequelize();
            options['where'] = arg_sequelize;
        }
        return super.count(options);
    }

    static readAll(search, order, pagination) {
        let options = {};
        if (search !== undefined) {

            //check
            if (typeof search !== 'object') {
                throw new Error('Illegal "search" argument type, it must be an object.');
            }

            let arg = new searchArg(search);
            let arg_sequelize = arg.toSequelize();
            options['where'] = arg_sequelize;
        }

        return super.count(options).then(items => {
            if (order !== undefined) {
                options['order'] = order.map((orderItem) => {
                    return [orderItem.field, orderItem.order];
                });
            } else if (pagination !== undefined) {
                options['order'] = [
                    ["cuadrante_id", "ASC"]
                ];
            }

            if (pagination !== undefined) {
                options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
                options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
            } else {
                options['offset'] = 0;
                options['limit'] = items;
            }

            if (globals.LIMIT_RECORDS < options['limit']) {
                throw new Error(`Request of total cuadrantes exceeds max limit of ${globals.LIMIT_RECORDS}. Please use pagination.`);
            }
            return super.findAll(options);
        });
    }

    static readAllCursor(search, order, pagination) {
        //check valid pagination arguments
        let argsValid = (pagination === undefined) || (pagination.first && !pagination.before && !pagination.last) || (pagination.last && !pagination.after && !pagination.first);
        if (!argsValid) {
            throw new Error('Illegal cursor based pagination arguments. Use either "first" and optionally "after", or "last" and optionally "before"!');
        }

        let isForwardPagination = !pagination || !(pagination.last != undefined);
        let options = {};
        options['where'] = {};

        /*
         * Search conditions
         */
        if (search !== undefined) {

            //check
            if (typeof search !== 'object') {
                throw new Error('Illegal "search" argument type, it must be an object.');
            }

            let arg = new searchArg(search);
            let arg_sequelize = arg.toSequelize();
            options['where'] = arg_sequelize;
        }

        /*
         * Count
         */
        return super.count(options).then(countA => {
            options['offset'] = 0;
            options['order'] = [];
            options['limit'] = countA;
            /*
             * Order conditions
             */
            if (order !== undefined) {
                options['order'] = order.map((orderItem) => {
                    return [orderItem.field, orderItem.order];
                });
            }
            if (!options['order'].map(orderItem => {
                    return orderItem[0]
                }).includes("cuadrante_id")) {
                options['order'] = [...options['order'], ...[
                    ["cuadrante_id", "ASC"]
                ]];
            }

            /*
             * Pagination conditions
             */
            if (pagination) {
                //forward
                if (isForwardPagination) {
                    if (pagination.after) {
                        let decoded_cursor = JSON.parse(this.base64Decode(pagination.after));
                        options['where'] = {
                            ...options['where'],
                            ...helper.parseOrderCursor(options['order'], decoded_cursor, "cuadrante_id", pagination.includeCursor)
                        };
                    }
                } else { //backward
                    if (pagination.before) {
                        let decoded_cursor = JSON.parse(this.base64Decode(pagination.before));
                        options['where'] = {
                            ...options['where'],
                            ...helper.parseOrderCursorBefore(options['order'], decoded_cursor, "cuadrante_id", pagination.includeCursor)
                        };
                    }
                }
            }
            //woptions: copy of {options} with only 'where' options
            let woptions = {};
            woptions['where'] = {
                ...options['where']
            };
            /*
             *  Count (with only where-options)
             */
            return super.count(woptions).then(countB => {
                /*
                 * Limit conditions
                 */
                if (pagination) {
                    //forward
                    if (isForwardPagination) {

                        if (pagination.first) {
                            options['limit'] = pagination.first;
                        }
                    } else { //backward
                        if (pagination.last) {
                            options['limit'] = pagination.last;
                            options['offset'] = Math.max((countB - pagination.last), 0);
                        }
                    }
                }
                //check: limit
                if (globals.LIMIT_RECORDS < options['limit']) {
                    throw new Error(`Request of total cuadrantes exceeds max limit of ${globals.LIMIT_RECORDS}. Please use pagination.`);
                }

                /*
                 * Get records
                 */
                return super.findAll(options).then(records => {
                    let edges = [];
                    let pageInfo = {
                        hasPreviousPage: false,
                        hasNextPage: false,
                        startCursor: null,
                        endCursor: null
                    };

                    //edges
                    if (records.length > 0) {
                        edges = records.map(record => {
                            return {
                                node: record,
                                cursor: record.base64Enconde()
                            }
                        });
                    }

                    //forward
                    if (isForwardPagination) {

                        pageInfo = {
                            hasPreviousPage: ((countA - countB) > 0),
                            hasNextPage: (pagination && pagination.first ? (countB > pagination.first) : false),
                            startCursor: (records.length > 0) ? edges[0].cursor : null,
                            endCursor: (records.length > 0) ? edges[edges.length - 1].cursor : null
                        }
                    } else { //backward

                        pageInfo = {
                            hasPreviousPage: (pagination && pagination.last ? (countB > pagination.last) : false),
                            hasNextPage: ((countA - countB) > 0),
                            startCursor: (records.length > 0) ? edges[0].cursor : null,
                            endCursor: (records.length > 0) ? edges[edges.length - 1].cursor : null
                        }
                    }

                    return {
                        edges,
                        pageInfo
                    };

                }).catch(error => {
                    throw error;
                });
            }).catch(error => {
                throw error;
            });
        }).catch(error => {
            throw error;
        });
    }

    static addOne(input) {
        return validatorUtil.ifHasValidatorFunctionInvoke('validateForCreate', this, input)
            .then(async (valSuccess) => {
                try {
                    const result = await sequelize.transaction(async (t) => {
                        let item = await super.create(input, {
                            transaction: t
                        });
                        return item;
                    });
                    return result;
                } catch (error) {
                    throw error;
                }
            });
    }

    static deleteOne(id) {
        return super.findByPk(id)
            .then(item => {

                if (item === null) return new Error(`Record with ID = ${id} does not exist`);

                return validatorUtil.ifHasValidatorFunctionInvoke('validateForDelete', this, item)
                    .then((valSuccess) => {
                        return item
                            .destroy()
                            .then(() => {
                                return 'Item successfully deleted';
                            });
                    }).catch((err) => {
                        return err
                    })
            });

    }

    static updateOne(input) {
        return validatorUtil.ifHasValidatorFunctionInvoke('validateForUpdate', this, input)
            .then(async (valSuccess) => {
                try {
                    let result = await sequelize.transaction(async (t) => {
                        let promises_associations = [];
                        let item = await super.findByPk(input[this.idAttribute()], {
                            transaction: t
                        });
                        if (item === null) {
                            throw new Error(`Record with ID = ${id} does not exist`);
                        }
                        let updated = await item.update(input, {
                            transaction: t
                        });
                        return updated;
                    });
                    return result;
                } catch (error) {
                    throw error;
                }
            });
    }

    static bulkAddCsv(context) {

        let delim = context.request.body.delim;
        let cols = context.request.body.cols;
        let tmpFile = path.join(os.tmpdir(), uuidv4() + '.csv');

        context.request.files.csv_file.mv(tmpFile).then(() => {

            fileTools.parseCsvStream(tmpFile, this, delim, cols).then((addedZipFilePath) => {
                try {
                    console.log(`Sending ${addedZipFilePath} to the user.`);

                    let attach = [];
                    attach.push({
                        filename: path.basename("added_data.zip"),
                        path: addedZipFilePath
                    });

                    email.sendEmail(helpersAcl.getTokenFromContext(context).email,
                        'ScienceDB batch add',
                        'Your data has been successfully added to the database.',
                        attach).then(function(info) {
                        fileTools.deleteIfExists(addedZipFilePath);
                        console.log(info);
                    }).catch(function(err) {
                        fileTools.deleteIfExists(addedZipFilePath);
                        console.error(err);
                    });

                } catch (error) {
                    console.error(error.message);
                }

                fs.unlinkSync(tmpFile);
            }).catch((error) => {
                email.sendEmail(helpersAcl.getTokenFromContext(context).email,
                    'ScienceDB batch add', `${error.message}`).then(function(info) {
                    console.error(info);
                }).catch(function(err) {
                    console.error(err);
                });

                fs.unlinkSync(tmpFile);
            });

        }).catch((error) => {
            throw new Error(error);
        });
    }

    static csvTableTemplate() {
        return helper.csvTableTemplate(cuadrante);
    }



    /**
     * add_grupo_enfoque_id - field Mutation (model-layer) for to_one associationsArguments to add 
     *
     * @param {Id}   cuadrante_id   IdAttribute of the root model to be updated
     * @param {Id}   grupo_enfoque_id Foreign Key (stored in "Me") of the Association to be updated. 
     */
    static async add_grupo_enfoque_id(cuadrante_id, grupo_enfoque_id) {
        let updated = await sequelize.transaction(async transaction => {
            return cuadrante.update({
                grupo_enfoque_id: grupo_enfoque_id
            }, {
                where: {
                    cuadrante_id: cuadrante_id
                }
            }, {
                transaction: transaction
            })
        });
        return updated;
    }
    /**
     * add_taxon_id - field Mutation (model-layer) for to_one associationsArguments to add 
     *
     * @param {Id}   cuadrante_id   IdAttribute of the root model to be updated
     * @param {Id}   taxon_id Foreign Key (stored in "Me") of the Association to be updated. 
     */
    static async add_taxon_id(cuadrante_id, taxon_id) {
        let updated = await sequelize.transaction(async transaction => {
            return cuadrante.update({
                taxon_id: taxon_id
            }, {
                where: {
                    cuadrante_id: cuadrante_id
                }
            }, {
                transaction: transaction
            })
        });
        return updated;
    }

    /**
     * remove_grupo_enfoque_id - field Mutation (model-layer) for to_one associationsArguments to remove 
     *
     * @param {Id}   cuadrante_id   IdAttribute of the root model to be updated
     * @param {Id}   grupo_enfoque_id Foreign Key (stored in "Me") of the Association to be updated. 
     */
    static async remove_grupo_enfoque_id(cuadrante_id, grupo_enfoque_id) {
        let updated = await sequelize.transaction(async transaction => {
            return cuadrante.update({
                grupo_enfoque_id: null
            }, {
                where: {
                    cuadrante_id: cuadrante_id,
                    grupo_enfoque_id: grupo_enfoque_id
                }
            }, {
                transaction: transaction
            })
        });
        return updated;
    }
    /**
     * remove_taxon_id - field Mutation (model-layer) for to_one associationsArguments to remove 
     *
     * @param {Id}   cuadrante_id   IdAttribute of the root model to be updated
     * @param {Id}   taxon_id Foreign Key (stored in "Me") of the Association to be updated. 
     */
    static async remove_taxon_id(cuadrante_id, taxon_id) {
        let updated = await sequelize.transaction(async transaction => {
            return cuadrante.update({
                taxon_id: null
            }, {
                where: {
                    cuadrante_id: cuadrante_id,
                    taxon_id: taxon_id
                }
            }, {
                transaction: transaction
            })
        });
        return updated;
    }






    /**
     * idAttribute - Check whether an attribute "internalId" is given in the JSON model. If not the standard "id" is used instead.
     *
     * @return {type} Name of the attribute that functions as an internalId
     */

    static idAttribute() {
        return cuadrante.definition.id.name;
    }

    /**
     * idAttributeType - Return the Type of the internalId.
     *
     * @return {type} Type given in the JSON model
     */

    static idAttributeType() {
        return cuadrante.definition.id.type;
    }

    /**
     * getIdValue - Get the value of the idAttribute ("id", or "internalId") for an instance of cuadrante.
     *
     * @return {type} id value
     */

    getIdValue() {
        return this[cuadrante.idAttribute()]
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
        let attributes = Object.keys(cuadrante.definition.attributes);
        let data_values = _.pick(this, attributes);
        return data_values;
    }

    static externalIdsArray() {
        let externalIds = [];
        if (definition.externalIds) {
            externalIds = definition.externalIds;
        }

        return externalIds;
    }

    static externalIdsObject() {
        return {};
    }

}