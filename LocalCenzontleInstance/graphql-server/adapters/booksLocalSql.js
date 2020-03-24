const _ = require('lodash');
const axios_general = require('axios');
const globals = require('../config/globals');
const {
    handleError
} = require('../utils/errors');
const Sequelize = require('sequelize');
const dict = require('../utils/graphql-sequelize-types');
const validatorUtil = require('../utils/validatorUtil');
const helper = require('../utils/helper');
const searchArg = require('../utils/search-argument');
const path = require('path');
const models = require(path.join(__dirname, '..', 'models_index.js'));


let axios = axios_general.create();
axios.defaults.timeout = globals.MAX_TIME_OUT;

//const remoteCenzontleURL = "http://localhost:3030/graphql";
const iriRegex = new RegExp('booksLocal');

const definition = {
    model: 'Book',
    storageType: 'distributed-data-model',
    registry: [
        'booksRemote',
        'booksLocalSql'
    ],
    attributes: {
        title: 'String',
        genre: 'String',
        internalPersonId: 'String',
        internalBookId: 'String'
    },
    associations: {
        author: {
            type: 'to_one',
            target: 'Person',
            targetKey: 'internalPersonId',
            keyIn: 'Book',
            targetStorageType: 'cenz_server',
            label: 'email',
            name: 'author',
            name_lc: 'author',
            name_cp: 'Author',
            target_lc: 'person',
            target_lc_pl: 'people',
            target_pl: 'People',
            target_cp: 'Person',
            target_cp_pl: 'People',
            keyIn_lc: 'book'
        }
    },
    internalId: 'internalBookId',
    id: {
        name: 'internalBookId',
        type: 'String'
    }
};

module.exports = class booksLocalSql extends Sequelize.Model{

  static init(sequelize, DataTypes) {
      return super.init({

          internalBookId: {
              type: Sequelize[dict['String']],
              primaryKey: true
          },
          title: {
              type: Sequelize[dict['String']]
          },
          genre: {
              type: Sequelize[dict['String']]
          },
          internalPersonId: {
              type: Sequelize[dict['String']]
          }


      }, {
          modelName: "book",
          tableName: "books",
          sequelize
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
                      let promises_associations = [];

                      return Promise.all(promises_associations).then(() => {
                          return item
                      });
                  });

                  if (input.addAuthor) {
                      let wrong_ids = await helper.checkExistence(input.addAuthor, models.person);
                      if (wrong_ids.length > 0) {
                          throw new Error(`Ids ${wrong_ids.join(",")} in model person were not found.`);
                      } else {
                          await result._addAuthor(input.addAuthor);
                      }
                  }
                  return result;
              } catch (error) {
                  throw error;
              }
          });
  }

    static recognizeId(iri) {
        return iriRegex.test(iri);
    }

    static readById(id) {
        let options = {};
        options['where'] = {};
        options['where'][this.idAttribute()] = id;
        return booksLocalSql.findOne(options);
    }

    static countRecords(search) {
        let options = {};
        if (search !== undefined) {
            let arg = new searchArg(search);
            let arg_sequelize = arg.toSequelize();
            options['where'] = arg_sequelize;
        }
        return super.count(options);
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
                }).includes("internalBookId")) {
                options['order'] = [...options['order'], ...[
                    ["internalBookId", "ASC"]
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
                            ...helper.parseOrderCursor(options['order'], decoded_cursor, "internalBookId", pagination.includeCursor)
                        };
                    }
                } else { //backward
                    if (pagination.before) {
                        let decoded_cursor = JSON.parse(this.base64Decode(pagination.before));
                        options['where'] = {
                            ...options['where'],
                            ...helper.parseOrderCursorBefore(options['order'], decoded_cursor, "internalBookId", pagination.includeCursor)
                        };
                    }
                }
            }
            //woptions: copy of {options} with only 'where' options
            let woptions = {};
            woptions['where'] = { ...options['where']
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
                    throw new Error(`Request of total books exceeds max limit of ${globals.LIMIT_RECORDS}. Please use pagination.`);
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

    static deleteOne(id) {
        return super.findByPk(id)
            .then(item => {

                if (item === null) return new Error(`Record with ID = ${id} not exist`);

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
                        let updated = await item.update(input, {
                            transaction: t
                        });

                        return Promise.all(promises_associations).then(() => {
                            return updated;
                        });
                    });

                    if (input.addAuthor) {
                        let wrong_ids = await helper.checkExistence(input.addAuthor, models.person);
                        if (wrong_ids.length > 0) {
                            throw new Error(`Ids ${wrong_ids.join(",")} in model person were not found.`);
                        } else {
                            await result._addAuthor(input.addAuthor);
                        }
                    }

                    if (input.removeAuthor) {
                        let author = await result.authorImpl();
                        if (author && input.removeAuthor === `${author[models.person.idAttribute()]}`) {
                            await result._removeAuthor(input.removeAuthor);
                        } else {
                            throw new Error("The association you're trying to remove it doesn't exists");
                        }
                    }




                    return result;
                } catch (error) {
                    throw error;
                }
            });
    }


    async set_internalPersonId(value) {
        this.internalPersonId = value;
        return await super.save();
    }


    _addAuthor(id) {
        return this.set_internalPersonId(id);
    }

    _removeAuthor(id) {
        return this.set_internalPersonId(null);
    }

    getIdValue() {
        return this[Book.idAttribute()]
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
        let attributes = Object.keys(booksLocalSql.definition.attributes);
        let data_values = _.pick(this, attributes);
        return data_values;
    }

    static idAttributeType() {
        return booksLocalSql.definition.id.type;
    }

    static get name() {
        return "booksLocalSql";
    }

    static get type(){
      return 'local';
    }
}
