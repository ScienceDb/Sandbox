// Delete this file, if you do not want or need any validations.
const validatorUtil = require('../utils/validatorUtil')
const Ajv = require('ajv')
const ajv = validatorUtil.addDateTimeAjvKeywords(new Ajv({
    allErrors: true
}))

// Dear user, edit the schema to adjust it to your model
module.exports.validator_patch = function(imageAttachment) {

    imageAttachment.prototype.validationControl = {
        validateForCreate: true,
        validateForUpdate: true,
        validateForDelete: false,
        validateAfterRead: false
    }

    imageAttachment.prototype.validatorSchema = {
        "$async": true,
        "properties": {
            "fileName": {
                "type": ["string", "null"]
            },
            "fileSizeKb": {
                "type": ["number", "null"]
            },
            "fileType": {
                "type": ["string", "null"]
            },
            "filePath": {
                "type": ["string", "null"]
            },
            "smallTnPath": {
                "type": ["string", "null"]
            },
            "mediumTnPath": {
                "type": ["string", "null"]
            },
            "licence": {
                "type": ["string", "null"]
            },
            "description": {
                "type": ["string", "null"]
            }
        }
    }

    imageAttachment.prototype.asyncValidate = ajv.compile(
        imageAttachment.prototype.validatorSchema
    )

    imageAttachment.prototype.validateForCreate = async function(record) {
        return await imageAttachment.prototype.asyncValidate(record)
    }

    imageAttachment.prototype.validateForUpdate = async function(record) {
        return await imageAttachment.prototype.asyncValidate(record)
    }

    imageAttachment.prototype.validateForDelete = async function(id) {

        //TODO: on the input you have the id of the record to be deleted, no generic
        // validation checks are available. You might need to import the correspondant model
        // in order to read the whole record info and the do the validation.

        return {
            error: null
        }
    }

    imageAttachment.prototype.validateAfterRead = async function(record) {
        return await imageAttachment.prototype.asyncValidate(record)
    }

    return imageAttachment
}