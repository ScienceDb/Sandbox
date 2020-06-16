const path = require('path');
const resolvers = require(path.join(__dirname, '..', 'resolvers', 'index.js'));
const inflection = require('inflection');
const schema = require('./graphql_schema');

getAttributes = function( model_name ){
    return schema.getModelFieldByAnnotation(model_name, '@original-field');
}

crateHeaderCSV = function(attributes){
  let str_header = "";
  attributes.forEach( att =>{
    str_header+= att+",";
  } )
  str_header= str_header.replace(/.$/,"\n");

  return str_header;
}

jsonToCSV = function(row_data, attributes){
  let str_csv = "";
  attributes.forEach( att => {
    if(row_data[att]===null || row_data[att] === undefined){
      str_csv+='NULL,';
    }else {
      str_csv+= row_data[att]+",";
    }
  })

  str_csv= str_csv.replace(/.$/,"\n");
  return str_csv;
}

// wait ms milliseconds
function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}


module.exports = async function(context, body_info, writableStream ){

      try{
      //get resolver name for model
      let model_name = body_info.model;
      let getter_resolver = inflection.pluralize(model_name.slice(0,1).toLowerCase() + model_name.slice(1, model_name.length)) + 'Connection';

      //get count resolver
      let count_resolver = 'count'+inflection.pluralize(model_name.slice(0,1).toUpperCase() + model_name.slice(1, model_name.length));
      let total_records = await resolvers[count_resolver]({}, context);
      console.log("TOTAL NUMBER OF RECORDS TO STREAM: ", total_records);

      //pagination
      let batch_step = {
        first: 2
      }

      let hasNextPage = total_records > 0;

      // http send stream header
      let timestamp = new Date().getTime();

      //get attributes names
      let attributes = getAttributes(model_name);

      //write csv header
      let csv_header = crateHeaderCSV(attributes);

      if(!writableStream.responseSent){
        writableStream.writeHead(200, {'Content-Type': 'application/force-download',
            'Content-disposition': `attachment; filename = ${timestamp}.csv`});
        await writableStream.write(csv_header);
      }else{
        throw new Error("RESPONSE ALREADY SENT, MOST LIKELY BY TIMEOUT EXCEEDS" );
      }

      while(hasNextPage){

        //  await new Promise(resolve => setTimeout(resolve, 5000));
          let data = await resolvers[getter_resolver]({pagination: batch_step},context);
          let nodes = data.edges.map( e => e.node );
          let endCursor = data.pageInfo.endCursor;
          hasNextPage = data.pageInfo.hasNextPage;

           batch_step['after'] = endCursor;

           for await( record of nodes ){
             let row = jsonToCSV(record, attributes);
             if(!writableStream.responseSent){
               await  writableStream.write(row);
             }else{
               throw new Error("RESPONSE ALREADY SENT, MOST LIKELY BY TIMEOUT EXCEEDS" );
             }
           }
      }
    }catch(err){
      throw err;
    }
}
