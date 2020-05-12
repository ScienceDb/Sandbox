// Delete this file, if you do not want or need any validations.
const validatorUtil = require('../utils/validatorUtil')
const Ajv = require('ajv')
const ajv = validatorUtil.addDateTimeAjvKeywords(new Ajv({
    allErrors: true
}))

// Dear user, edit the schema to adjust it to your model
module.exports.validator_patch = function(germplasm) {

    germplasm.prototype.validatorSchema = {
        "$async": true,
        "properties": {
            "accessionNumber": {
                "type": ["string", "null"]
            },
            "acquisitionDate": {
                "anyOf": [{
                    "isoDate": true
                }, {
                    "type": "null"
                }]
            },
            "breedingMethodDbId": {
                "type": ["string", "null"]
            },
            "commonCropName": {
                "type": ["string", "null"]
            },
            "countryOfOriginCode": {
                "type": ["string", "null"]
            },
            "defaultDisplayName": {
                "type": ["string", "null"]
            },
            "documentationURL": {
                "type": ["string", "null"]
            },
            "germplasmGenus": {
                "type": ["string", "null"]
            },
            "germplasmName": {
                "type": ["string", "null"]
            },
            "germplasmPUI": {
                "type": ["string", "null"]
            },
            "germplasmPreprocessing": {
                "type": ["string", "null"]
            },
            "germplasmSpecies": {
                "type": ["string", "null"]
            },
            "germplasmSubtaxa": {
                "type": ["string", "null"]
            },
            "instituteCode": {
                "type": ["string", "null"]
            },
            "instituteName": {
                "type": ["string", "null"]
            },
            "pedigree": {
                "type": ["string", "null"]
            },
            "seedSource": {
                "type": ["string", "null"]
            },
            "seedSourceDescription": {
                "type": ["string", "null"]
            },
            "speciesAuthority": {
                "type": ["string", "null"]
            },
            "subtaxaAuthority": {
                "type": ["string", "null"]
            },
            "xref": {
                "type": ["string", "null"]
            },
            "germplasmDbId": {
                "type": ["string", "null"]
            },
            "biologicalStatusOfAccessionCode": {
                "type": ["string", "null"]
            }
        }
    }

    germplasm.prototype.asyncValidate = ajv.compile(
        germplasm.prototype.validatorSchema
    )

    germplasm.prototype.validateForCreate = async function(record) {
        return await germplasm.prototype.asyncValidate(record)
    }

    germplasm.prototype.validateForUpdate = async function(record) {
        return await germplasm.prototype.asyncValidate(record)
    }

    germplasm.prototype.validateForDelete = async function(record) {

        //TODO: on the input you have the record to be deleted, no generic
        // validation checks are available.

        return {
            error: null
        }
    }
    return germplasm
}