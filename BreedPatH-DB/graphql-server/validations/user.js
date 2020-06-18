// Delete this file, if you do not want or need any validations.
const validatorUtil = require('../utils/validatorUtil')
const Ajv = require('ajv')
const ajv = validatorUtil.addDateTimeAjvKeywords(new Ajv({
    allErrors: true
}))

// Dear user, edit the schema to adjust it to your model
module.exports.validator_patch = function(user) {

    user.prototype.validatorSchema = {
        "$async": true,
        "properties": {
            "email": {
                "type": ["string", "null"]
            },
            "password": {
                "type": ["string", "null"]
            }
        }
    }

    user.prototype.asyncValidate = ajv.compile(
        user.prototype.validatorSchema
    )

    user.prototype.validateForCreate = async function(record) {
        let ret = await user.prototype.asyncValidate(record);
        console.log("\n\nret: " + ret + "\n\n")
        console.log("\n\nret: " + JSON.stringify(ret) + "\n\n")
        return ret;
    }

    user.prototype.validateForUpdate = async function(record) {
        return await user.prototype.asyncValidate(record)
    }

    user.prototype.validateForDelete = async function(id) {

        //TODO: on the input you have the id of the record to be deleted, no generic
        // validation checks are available. You might need to import the correspondant model
        // in order to read the whole record info and the do the validation.

        return {
            error: null
        }
    }

    user.prototype.validateAfterRead = async function(record) {

        //TODO: on the input you have the record validated, no generic
        // validation checks are available.

        return {
            error: null
        }
    }

    return user
}