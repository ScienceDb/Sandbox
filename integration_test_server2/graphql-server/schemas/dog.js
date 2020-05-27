module.exports = `
type dog{
  """
  @original-field
  """
  dog_id: ID

"""
  @original-field
  
  """
  name: String

"""
  @original-field
  
  """
  person_id: String

person(search: searchPersonInput): person
}

type DogConnection{
edges: [DogEdge]
pageInfo: pageInfo!
}

type DogEdge{
cursor: String!
node: dog!
}

type VueTableDog{
  data : [dog]
  total: Int
  per_page: Int
  current_page: Int
  last_page: Int
  prev_page_url: String
  next_page_url: String
  from: Int
  to: Int
}

enum dogField {
  dog_id
  name
  person_id
}

input searchDogInput {
  field: dogField
  value: typeValue
  operator: Operator
  excludeAdapterNames: [String]
  search: [searchDogInput]
}

input orderDogInput{
  field: dogField
  order: Order
}

type Query {
  readOneDog(dog_id: ID!): dog
  countDogs(search: searchDogInput ): Int
  vueTableDog : VueTableDog  csvTableTemplateDog: [String]

  dogsConnection(search:searchDogInput, order: [ orderDogInput ], pagination: paginationCursorInput ): DogConnection
}

  type Mutation {
  addDog(dog_id: ID!, name: String , addPerson:ID , skipAssociationsExistenceChecks:Boolean = false): dog!
  updateDog(dog_id: ID!, name: String , addPerson:ID, removePerson:ID  , skipAssociationsExistenceChecks:Boolean = false): dog!
deleteDog(dog_id: ID!): String!
bulkAddDogCsv: [dog] }

`;