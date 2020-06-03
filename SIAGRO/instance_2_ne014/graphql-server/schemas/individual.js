module.exports = `
type Individual{
  """
  @original-field
  """
  name: ID

  """
  @original-field
  
  """
  origin: String
"""
  @original-field
  
  """
  description: String
"""
  @original-field
  
  """
  accession_id: String
"""
  @original-field
  
  """
  genotypeId: Int
"""
  @original-field
  
  """
  field_unit_id: Int

accession(search: searchAccessionInput): Accession
  """
  @search-request
  """
  measurementsConnection(search: searchMeasurementInput, order: [ orderMeasurementInput ], pagination: paginationCursorInput): MeasurementConnection
  """
  @count-request
  """
  countFilteredMeasurements(search: searchMeasurementInput) : Int

}

type IndividualConnection{
edges: [IndividualEdge]
pageInfo: pageInfo!
}

type IndividualEdge{
cursor: String!
node: Individual!
}

type VueTableIndividual{
  data : [Individual]
  total: Int
  per_page: Int
  current_page: Int
  last_page: Int
  prev_page_url: String
  next_page_url: String
  from: Int
  to: Int
}

enum IndividualField {
  name
  origin
  description
  accession_id
  genotypeId
  field_unit_id
}

input searchIndividualInput {
  field: IndividualField
  value: typeValue
  operator: Operator
  excludeAdapterNames: [String]
  search: [searchIndividualInput]
}

input orderIndividualInput{
  field: IndividualField
  order: Order
}

type Query {
  readOneIndividual(name: ID!): Individual
  countIndividuals(search: searchIndividualInput ): Int
  vueTableIndividual : VueTableIndividual  csvTableTemplateIndividual: [String]

  individualsConnection(search:searchIndividualInput, order: [ orderIndividualInput ], pagination: paginationCursorInput ): IndividualConnection
}

  type Mutation {
  addIndividual(name: ID!, origin: String, description: String, genotypeId: Int, field_unit_id: Int , addAccession:ID  , addMeasurements:[ID] , skipAssociationsExistenceChecks:Boolean = false): Individual!
  updateIndividual(name: ID!, origin: String, description: String, genotypeId: Int, field_unit_id: Int , addAccession:ID, removeAccession:ID   , addMeasurements:[ID], removeMeasurements:[ID]  , skipAssociationsExistenceChecks:Boolean = false): Individual!
deleteIndividual(name: ID!): String!
bulkAddIndividualCsv: [Individual] }

`;