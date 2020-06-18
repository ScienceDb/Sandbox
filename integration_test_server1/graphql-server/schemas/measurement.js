module.exports = `
  type Measurement{
    """
    @original-field
    """
    measurement_id: ID
    """
    @original-field
    
    """
    name: String

    """
    @original-field
    
    """
    method: String

    """
    @original-field
    
    """
    reference: String

    """
    @original-field
    
    """
    accessionId: String

    accession(search: searchAccessionInput): Accession
    
    }
type MeasurementConnection{
  edges: [MeasurementEdge]
  pageInfo: pageInfo!
}

type MeasurementEdge{
  cursor: String!
  node: Measurement!
}

  type VueTableMeasurement{
    data : [Measurement]
    total: Int
    per_page: Int
    current_page: Int
    last_page: Int
    prev_page_url: String
    next_page_url: String
    from: Int
    to: Int
  }
  enum MeasurementField {
    measurement_id
    name
    method
    reference
    accessionId
  }
  input searchMeasurementInput {
    field: MeasurementField
    value: typeValue
    operator: Operator
    search: [searchMeasurementInput]
  }

  input orderMeasurementInput{
    field: MeasurementField
    order: Order
  }
  type Query {
    measurements(search: searchMeasurementInput, order: [ orderMeasurementInput ], pagination: paginationInput ): [Measurement]
    readOneMeasurement(measurement_id: ID!): Measurement
    countMeasurements(search: searchMeasurementInput ): Int
    vueTableMeasurement : VueTableMeasurement    csvTableTemplateMeasurement: [String]

    measurementsConnection(search:searchMeasurementInput, order: [ orderMeasurementInput ], pagination: paginationCursorInput ): MeasurementConnection
  }
    type Mutation {
    addMeasurement(measurement_id: ID!, name: String, method: String, reference: String , addAccession:ID   , skipAssociationsExistenceChecks:Boolean = false): Measurement!
    updateMeasurement(measurement_id: ID!, name: String, method: String, reference: String , addAccession:ID, removeAccession:ID    , skipAssociationsExistenceChecks:Boolean = false): Measurement!
  deleteMeasurement(measurement_id: ID!): String!
  bulkAddMeasurementCsv: String! }

`;