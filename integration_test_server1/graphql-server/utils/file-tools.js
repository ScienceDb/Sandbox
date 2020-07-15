const XLSX = require('xlsx');
const Promise = require('bluebird');
const promise_csv_parse = Promise.promisify(require('csv-parse'));
const csv_parse = require('csv-parse');
const fs = require('fs');
const awaitifyStream = require('awaitify-stream');
const validatorUtil = require('./validatorUtil');
const admZip = require('adm-zip');
const exceljs = require('exceljs');
const XlsxStreamReader = require("xlsx-stream-reader");

/**
 * replaceNullStringsWithLiteralNulls - Replace null entries of columns with literal null types
 *
 * @param  {array} arrOfObjs Each item correponds to a column represented as object.
 * @return {array}           Each item corresponds to a column and all items have either a valid entry or null type.
 */
replaceNullStringsWithLiteralNulls = function(arrOfObjs) {
  console.log(typeof arrOfObjs, arrOfObjs);
  return arrOfObjs.map(function(csvRow) {
    Object.keys(csvRow).forEach(function(csvCol) {
      csvCell = csvRow[csvCol]
      csvRow[csvCol] = csvCell === 'null' || csvCell === 'NULL' ?
        null : csvCell
    })
    return csvRow;
  });
}


/**
 * parseCsv - parse csv file (string)
 *
 * @param  {string} csvStr Csv file converted to string.
 * @param {string} delim Set the field delimiter in the csv file. One or multiple character.
 * @param {array|boolean|function} cols Columns as in csv-parser options.(true if auto-discovered in the first CSV line).
 * @return {array}        Each item correponds to a column represented as object and filtered with replaceNullStringsWithLiteralNulls function.
 */
exports.parseCsv = function(csvStr, delim, cols) {
  if (!delim) delim = ","
  if (typeof cols === 'undefined') cols = true
  return replaceNullStringsWithLiteralNulls(
    promise_csv_parse(csvStr, {
      delimiter: delim,
      columns: cols
    })
  )
}


/**
 * parseXlsx - description
 *
 * @param  {string} bstr Xlsx file converted to string
 * @return {array}      Each item correponds to a column represented as object and filtered with replaceNullStringsWithLiteralNulls function.
 */
exports.parseXlsx = function(bstr) {
  var workbook = XLSX.read(bstr, {
    type: "binary"
  });
  var sheet_name_list = workbook.SheetNames;
  return replaceNullStringsWithLiteralNulls(
    XLSX.utils.sheet_to_json(
      workbook.Sheets[sheet_name_list[0]])
  );
};

/**
 * Function that will delete a file if it exists and is insensitive to the
 * case when a file not exist.
 *
 * @param {String} path - A path to the file
 */
exports.deleteIfExists = function(path) {
  console.log(`Removing ${path}`);
  fs.unlink(path, function(err) {
    console.log(" File doesn't exist", path)
    // file may be already deleted
  });
};

/**
 * Function deletes properties that contain string values "NULL" or "null".
 *
 * @param {Object} pojo - A plain old JavaScript object.
 *
 * @return {Object} A modified clone of the argument pojo in which all String
 * "NULL" or "null" values are deleted.
 */
exports.replacePojoNullValueWithLiteralNull = function(pojo) {
  if (pojo === null || pojo === undefined) {
    return null
  }
  let res = Object.assign({}, pojo);
  Object.keys(res).forEach((k) => {
    if (typeof res[k] === "string" && res[k].match(/\s*null\s*/i)) {
      delete res[k];
    }
  });
  return res
};


xlsxRowToObject = function( headers, row_values ){

  let record_length = headers.length;
  let record = {};
  for(let index = 0; index < record_length; index++){
    //if value no present or null in data, it won't be added to the record info.
    if( row_values[ index ] !== undefined &&  row_values[ index ] !== null){
      record[ headers[index] ] = row_values[ index];
    }
  }

  return record;
}


/**
 * Parse by streaming a xlsx file and create the records in the correspondant table
 * @function
 * @param {string} xlsxFilePath - The path where the xlsx file is stored.
 * @param {object} model - Sequelize model, record will be created through this model.
 */
exports.parseXlsxStream = async function(xlsxFilePath, model) {
  console.log("PATH FILE: ", xlsxFilePath);
  let options = {

  }
  let addedFilePath = xlsxFilePath.substr(0, xlsxFilePath.lastIndexOf(".")) +
    ".json";

  let addedZipFilePath = xlsxFilePath.substr(0, xlsxFilePath.lastIndexOf(".")) +
      ".zip";

  // Create an output file stream
  let addedRecords = awaitifyStream.createWriter(
    fs.createWriteStream(addedFilePath)
  );
  if(fs.existsSync(addedFilePath)){
    console.log("FILES EXISTS");
  }else{
    console.log("FILE NO CREATED");
  }

  console.log(typeof addedRecords, " TYPE OF CREATED");

  // Wrap all database actions within a transaction:
  let transaction = await model.sequelize.transaction();

  let record;
  let errors = [];
  let headers = [];
  var workBookReader = new XlsxStreamReader();



workBookReader.on('error', async function (error) {
  console.log("ERROR IN READER ", error);
  await transaction.rollback();

  console.log("DELETE IN END");
  //exports.deleteIfExists(addedFilePath);
  //exports.deleteIfExists(addedZipFilePath);
    throw(error);
});
workBookReader.on('sharedStrings', function () {
    // do not need to do anything with these,
    // cached and used when processing worksheets
    //console.log(workBookReader.workBookSharedStrings);
});

workBookReader.on('styles', function () {
    // do not need to do anything with these
    // but not currently handled in any other way
    //console.log(workBookReader.workBookStyles);
});

workBookReader.on('worksheet', function (workSheetReader) {
    if (workSheetReader.id > 1){
        // we only want first sheet
        //workSheetReader.skip();
        //return;
    }
    // print worksheet name
    console.log(workSheetReader.name);

    // if we do not listen for rows we will only get end event
    // and have infor about the sheet like row count
    workSheetReader.on('row', async function (row) {
        if (row.attributes.r == 1){
            //console.log("HEADERS: ", row);
            headers = row.values.slice(1);
            console.log("HEADERS: ", headers);
            // do something with row 1 like save as column names
        }else{
            // second param to forEach colNum is very important as
            // null columns are not defined in the array, ie sparse array
           record = xlsxRowToObject( headers, row.values.slice(1) );
            console.log("RECORD: ", record);

            try {
              let result = await validatorUtil.validateData(
                'validateForCreate', model, record);
              //console.log(result);
              await model.create(record, {
                transaction: transaction
              }).then(created => {

                // this is async, here we just push new line into the parallel thread
                // synchronization goes at endAsync;
                addedRecords.writeAsync(`${JSON.stringify(created)}\n`);

              }).catch(error => {
                console.log(
                  `here Caught sequelize error during XLSX batch upload: ${JSON.stringify(error)}`
                );
                error['record'] = record;
                errors.push(error);
              })
            } catch (error) {
              console.log(
                `Validation error during CSV batch upload: ${JSON.stringify(error)}`
              );
              error['record'] = record;
              errors.push(error);

            }
        }
    });
    workSheetReader.on('end', async function () {

      if(fs.existsSync(addedFilePath)){
        console.log("FILES EXISTS IN reader end");
      }else{
        console.log("FILE NO CREATED IN reader end");

      }

      console.log("END SHEET READER");
      // close the addedRecords file so it can be sent afterwards
      await addedRecords.endAsync();

      if (errors.length > 0) {
        console.log("GOT HERE 1");
        let message =
          "Some records could not be submitted. No database changes has been applied.\n";
        message += "Please see the next list for details:\n";

        errors.forEach(function(error) {
          valErrMessages = error.errors.reduce((acc, val) => {
            return acc.concat(val.dataPath).concat(" ").concat(val.message)
              .concat(" ")
          })
          message +=
            `record ${JSON.stringify(error.record)} ${error.message}: ${valErrMessages}; \n`;
        });

        console.log("GOT HERE 2");
        throw new Error(message.slice(0, message.length - 1));
      }

      console.log("FINAL STEP BEFORE ADDING RECORDS");
      await transaction.rollback();

      //await transaction.commit();

      // zip comitted data and return a corresponding file path
      //let zipper = new admZip();
      //zipper.addLocalFile(addedFilePath);
      //await zipper.writeZip(addedZipFilePath);

      console.log(addedZipFilePath);

      // At this moment the parseCsvStream caller is responsible in deleting the
      // addedZipFilePath
      //return addedZipFilePath;


        console.log(workSheetReader.rowCount);
    });

    // call process after registering handlers
    workSheetReader.process();
});
workBookReader.on('end', function () {
  try{
    console.log("DELETE IN END END");
    //exports.deleteIfExists(addedFilePath);
  }catch(error){
    console.log("ERROR CATCHED: ", error);
  }

  if(fs.existsSync(addedFilePath)){
    console.log("FILES EXISTS IN workbook end", addedFilePath);
    exports.deleteIfExists(addedFilePath);
  }else{
    console.log("FILE NO CREATED IN workbook end");

  }
  console.log("DONE! :D");
  //return "SOME MESSAGE"
  //return addedZipFilePath;
    // end of workbook reached
});


workBookReader.on('finished', function () {

  console.log("WB FINISHED");
})

console.log(workBookReader);
let stream = fs.createReadStream(xlsxFilePath);
stream.on('end', function(){
  console.log("DONE STREAMING");
} );



 await stream.pipe(workBookReader);

//return;
}

/**
 * Parse by streaming a csv file and create the records in the correspondant table
 * @function
 * @param {string} csvFilePath - The path where the csv file is stored.
 * @param {object} model - Sequelize model, record will be created through this model.
 * @param {string} delim - Set the field delimiter in the csv file. One or multiple character.
 * @param {array|boolean|function} cols - Columns as in csv-parser options.(true if auto-discovered in the first CSV line).
 */
exports.parseCsvStream = async function(csvFilePath, model, delim, cols) {

  if (!delim) delim = ",";
  if (typeof cols === 'undefined') cols = true;
  console.log("TYPEOF", typeof model);
  // Wrap all database actions within a transaction:
  let transaction = await model.sequelize.transaction();

  let addedFilePath = csvFilePath.substr(0, csvFilePath.lastIndexOf(".")) +
    ".json";
  let addedZipFilePath = csvFilePath.substr(0, csvFilePath.lastIndexOf(".")) +
    ".zip";

  console.log(addedFilePath);
  console.log(addedZipFilePath);

  try {
    // Pipe a file read-stream through a CSV-Reader and handle records asynchronously:
    let csvStream = awaitifyStream.createReader(
      fs.createReadStream(csvFilePath).pipe(
        csv_parse({
          delimiter: delim,
          columns: cols,
          cast: true
        })
      )
    );

    // Create an output file stream
    let addedRecords = awaitifyStream.createWriter(
      fs.createWriteStream(addedFilePath)
    );

    let record;
    let errors = [];

    while (null !== (record = await csvStream.readAsync())) {

      console.log("RECOOORD",record);
      record = exports.replacePojoNullValueWithLiteralNull(record);
      //console.log(record);


      try {
        let result = await validatorUtil.validateData(
          'validateForCreate', model, record);
        //console.log(result);
        await model.create(record, {
          transaction: transaction
        }).then(created => {

          // this is async, here we just push new line into the parallel thread
          // synchronization goes at endAsync;
          addedRecords.writeAsync(`${JSON.stringify(created)}\n`);

        }).catch(error => {
          console.log(
            `Caught sequelize error during CSV batch upload: ${JSON.stringify(error)}`
          );
          error.record = record;
          errors.push(error);
        })
      } catch (error) {
        console.log(
          `Validation error during CSV batch upload: ${JSON.stringify(error)}`
        );
        error['record'] = record;
        errors.push(error);

      }

    }

    // close the addedRecords file so it can be sent afterwards
    await addedRecords.endAsync();

    if (errors.length > 0) {
      let message =
        "Some records could not be submitted. No database changes has been applied.\n";
      message += "Please see the next list for details:\n";

      errors.forEach(function(error) {
        valErrMessages = error.errors.reduce((acc, val) => {
          return acc.concat(val.dataPath).concat(" ").concat(val.message)
            .concat(" ")
        })
        message +=
          `record ${JSON.stringify(error.record)} ${error.message}: ${valErrMessages}; \n`;
      });

      throw new Error(message.slice(0, message.length - 1));
    }

    await transaction.commit();

    // zip comitted data and return a corresponding file path
    let zipper = new admZip();
    zipper.addLocalFile(addedFilePath);
    await zipper.writeZip(addedZipFilePath);

    console.log(addedZipFilePath);

    // At this moment the parseCsvStream caller is responsible in deleting the
    // addedZipFilePath
    return addedZipFilePath;

  } catch (error) {

    await transaction.rollback();

    exports.deleteIfExists(addedFilePath);
    exports.deleteIfExists(addedZipFilePath);

    throw error;

  } finally {
    exports.deleteIfExists(addedFilePath);
  }
};
