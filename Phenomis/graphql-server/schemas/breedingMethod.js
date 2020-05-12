module.exports = `
type breedingMethod{
  """
  @original-field
  """
  breedingMethodDbId: ID

"""
  @original-field
  
  """
  abbreviation: String

"""
  @original-field
  
  """
  breedingMethodName: String

"""
  @original-field
  
  """
  description: String


  """
  @search-request
  """
  germplasmConnection(search: searchGermplasmInput, order: [ orderGermplasmInput ], pagination: paginationCursorInput): GermplasmConnection

  """
  @count-request
  """
  countFilteredGermplasm(search: searchGermplasmInput) : Int
}

type BreedingMethodConnection{
edges: [BreedingMethodEdge]
pageInfo: pageInfo!
}

type BreedingMethodEdge{
cursor: String!
node: breedingMethod!
}

type VueTableBreedingMethod{
  data : [breedingMethod]
  total: Int
  per_page: Int
  current_page: Int
  last_page: Int
  prev_page_url: String
  next_page_url: String
  from: Int
  to: Int
}

enum breedingMethodField {
  breedingMethodDbId
  abbreviation
  breedingMethodName
  description
}

input searchBreedingMethodInput {
  field: breedingMethodField
  value: typeValue
  operator: Operator
  excludeAdapterNames: [String]
  search: [searchBreedingMethodInput]
}

input orderBreedingMethodInput{
  field: breedingMethodField
  order: Order
}

type Query {
  readOneBreedingMethod(breedingMethodDbId: ID!): breedingMethod
  countBreedingMethods(search: searchBreedingMethodInput ): Int
  vueTableBreedingMethod : VueTableBreedingMethod  csvTableTemplateBreedingMethod: [String]

  breedingMethodsConnection(search:searchBreedingMethodInput, order: [ orderBreedingMethodInput ], pagination: paginationCursorInput ): BreedingMethodConnection
}

  type Mutation {
  addBreedingMethod(breedingMethodDbId: ID!, abbreviation: String, breedingMethodName: String, description: String  , addGermplasm:[ID], skipAssociationsExistenceChecks:Boolean = false): breedingMethod!
  updateBreedingMethod(breedingMethodDbId: ID!, abbreviation: String, breedingMethodName: String, description: String  , addGermplasm:[ID], removeGermplasm:[ID] , skipAssociationsExistenceChecks:Boolean = false): breedingMethod!
deleteBreedingMethod(breedingMethodDbId: ID!): String!
bulkAddBreedingMethodCsv: [breedingMethod] }

`;