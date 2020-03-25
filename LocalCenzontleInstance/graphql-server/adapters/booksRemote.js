const axios_general = require('axios');
const path = require('path');
const globals = require('../config/globals');
const {
    handleError
} = require('../utils/errors');
const models = require(path.join(__dirname, '..', 'models_index.js'));

let axios = axios_general.create();
axios.defaults.timeout = globals.MAX_TIME_OUT;

const remoteCenzontleURL = "http://remotecenzontleinstance_sdb_science_db_graphql_server_1:3030/graphql";
const iriRegex = new RegExp('booksRemote');

module.exports = class booksRemote {


    static recognizeId(iri) {
        return iriRegex.test(iri);
    }

    static readById(iri) {
        let query = `query readOneBook{readOneBook(internalBookId: "${iri}"){ internalBookId        title
            genre
            internalPersonId
      }}  `;

        return axios.post(remoteCenzontleURL, {
            query: query
        }).then(res => {
            let data = res.data.data.readOneBook;
            return data;
        }).catch(error => {
            error['url'] = remoteCenzontleURL;
            handleError(error);
        });
    }

    static countRecords(search) {
        let query = `query countBooks($search: searchBookInput){
    countBooks(search: $search)
    }`

        return axios.post(remoteCenzontleURL, {
            query: query,
            variables: {
                search: search
            }
        }).then(res => {
            return res.data.data.countBooks;
        }).catch(error => {
            error['url'] = remoteCenzontleURL;
            handleError(error);
        });
    }

    static readAllCursor(search, order, pagination) {
        //check valid pagination arguments
        let argsValid = (pagination === undefined) || (pagination.first && !pagination.before && !pagination.last) || (pagination.last && !pagination.after && !pagination.first);
        if (!argsValid) {
            throw new Error('Illegal cursor based pagination arguments. Use either "first" and optionally "after", or "last" and optionally "before"!');
        }
        let query = `query booksConnection($search: searchBookInput $pagination: paginationCursorInput $order: [orderBookInput]){
      booksConnection(search:$search pagination:$pagination order:$order){ edges{cursor node{  internalBookId  title
         genre
         internalPersonId
        } } pageInfo{ startCursor endCursor hasPreviousPage hasNextPage } } }`

        return axios.post(remoteCenzontleURL, {
            query: query,
            variables: {
                search: search,
                order: order,
                pagination: pagination
            }
        }).then(res => {
            return res.data.data.booksConnection;
        }).catch(error => {
            error['url'] = remoteCenzontleURL;
            handleError(error);
        });
    }

    static addOne(input) {
        let query = `mutation addBook(
          $internalBookId:ID!
          $title:String
          $genre:String
          $addAuthor:ID
        ){
          addBook(
            internalBookId:$internalBookId
            title:$title
            genre:$genre
            addAuthor:$addAuthor
          ){
            internalBookId
            title
            genre
            internalPersonId

          }
        }`;

        return axios.post(remoteCenzontleURL, {
            query: query,
            variables: input
        }).then(res => {
            let data = res.data.data.addBook;
            return new models.book(data);
        }).catch(error => {
          console.log("ERROOOOR", error);
          console.log("ERROOOOR 1", error.response.data.errors);
          console.log("ERROOOOR 2", error.data)
            error['url'] = remoteCenzontleURL;
            handleError(error);
        });
    }

    static deleteOne(id) {
        let query = `mutation deleteBook{ deleteBook(internalBookId: ${id}) }`;

        return axios.post(remoteCenzontleURL, {
            query: query
        }).then(res => {
            return res.data.data.deleteBook;
        }).catch(error => {
            error['url'] = remoteCenzontleURL;
            handleError(error);
        });
    }

    static updateOne(input) {
        let query = `mutation updateBook(
          $internalBookId:ID!
          $title:String
          $genre:String
          $internalPersonId:String
        ){
            updateBook(
              internalBookId:$internalBookId
              title:$title
              genre:$genre
              internalPersonId:$internalPersonId
            ){
              internalBookId
              title
              genre
              internalPersonId
            }
        }`

        return axios.post(remoteCenzontleURL, {
            query: query,
            variables: input
        }).then(res => {
            let data = res.data.data.updateBook;
            return new models.book(data);
        }).catch(error => {
            error['url'] = remoteCenzontleURL;
            handleError(error);
        });
    }


    static get name() {
        return "booksRemote";
    }

    static get type(){
      return 'cenz';
    }
}