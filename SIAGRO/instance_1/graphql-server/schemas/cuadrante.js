module.exports = `
  type cuadrante{
    """
    @original-field
    """
    cuadrante_id: ID
    """
    @original-field
    
    """
    tipo_planta: String

    """
    @original-field
    
    """
    produccion_valor: Int

    """
    @original-field
    
    """
    produccion_etiqueta: String

    """
    @original-field
    
    """
    autoconsumo_valor: Int

    """
    @original-field
    
    """
    autoconsumo_etiqueta: String

    """
    @original-field
    
    """
    compra_valor: Int

    """
    @original-field
    
    """
    compra_etiqueta: String

    """
    @original-field
    
    """
    venta_valor: Int

    """
    @original-field
    
    """
    venta_etiqueta: String

    """
    @original-field
    
    """
    nombre_comun_grupo_enfoque: String

    """
    @original-field
    
    """
    grupo_enfoque_id: String

    """
    @original-field
    
    """
    taxon_id: String

    grupo_enfoque(search: searchGrupo_enfoqueInput): grupo_enfoque
  informacion_taxonomica(search: searchTaxonInput): taxon
    
    }
type CuadranteConnection{
  edges: [CuadranteEdge]
  pageInfo: pageInfo!
}

type CuadranteEdge{
  cursor: String!
  node: cuadrante!
}

  type VueTableCuadrante{
    data : [cuadrante]
    total: Int
    per_page: Int
    current_page: Int
    last_page: Int
    prev_page_url: String
    next_page_url: String
    from: Int
    to: Int
  }
  enum cuadranteField {
    cuadrante_id
    tipo_planta
    produccion_valor
    produccion_etiqueta
    autoconsumo_valor
    autoconsumo_etiqueta
    compra_valor
    compra_etiqueta
    venta_valor
    venta_etiqueta
    nombre_comun_grupo_enfoque
    grupo_enfoque_id
    taxon_id
  }
  input searchCuadranteInput {
    field: cuadranteField
    value: typeValue
    operator: Operator
    search: [searchCuadranteInput]
  }

  input orderCuadranteInput{
    field: cuadranteField
    order: Order
  }
  type Query {
    cuadrantes(search: searchCuadranteInput, order: [ orderCuadranteInput ], pagination: paginationInput ): [cuadrante]
    readOneCuadrante(cuadrante_id: ID!): cuadrante
    countCuadrantes(search: searchCuadranteInput ): Int
    vueTableCuadrante : VueTableCuadrante    csvTableTemplateCuadrante: [String]

    cuadrantesConnection(search:searchCuadranteInput, order: [ orderCuadranteInput ], pagination: paginationCursorInput ): CuadranteConnection
  }
    type Mutation {
    addCuadrante(cuadrante_id: ID!, tipo_planta: String, produccion_valor: Int, produccion_etiqueta: String, autoconsumo_valor: Int, autoconsumo_etiqueta: String, compra_valor: Int, compra_etiqueta: String, venta_valor: Int, venta_etiqueta: String, nombre_comun_grupo_enfoque: String , addGrupo_enfoque:ID, addInformacion_taxonomica:ID   , skipAssociationsExistenceChecks:Boolean = false): cuadrante!
    updateCuadrante(cuadrante_id: ID!, tipo_planta: String, produccion_valor: Int, produccion_etiqueta: String, autoconsumo_valor: Int, autoconsumo_etiqueta: String, compra_valor: Int, compra_etiqueta: String, venta_valor: Int, venta_etiqueta: String, nombre_comun_grupo_enfoque: String , addGrupo_enfoque:ID, removeGrupo_enfoque:ID , addInformacion_taxonomica:ID, removeInformacion_taxonomica:ID    , skipAssociationsExistenceChecks:Boolean = false): cuadrante!
  deleteCuadrante(cuadrante_id: ID!): String!
  bulkAddCuadranteCsv: [cuadrante] }

`;