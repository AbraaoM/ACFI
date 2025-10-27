from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal

# Schemas para Identificação da NFe
class IdeSchema(BaseModel):
    """Schema para dados de identificação da NFe"""
    cUF: Optional[str] = Field(None, description="Código da UF do emitente")
    cNF: Optional[str] = Field(None, description="Código numérico da NFe")
    natOp: Optional[str] = Field(None, description="Natureza da operação")
    indPag: Optional[str] = Field(None, description="Indicador da forma de pagamento")
    mod: Optional[str] = Field(None, description="Modelo do documento fiscal")
    serie: Optional[str] = Field(None, description="Série do documento")
    nNF: Optional[str] = Field(None, description="Número da NFe")
    dEmi: Optional[str] = Field(None, description="Data de emissão")
    dSaiEnt: Optional[str] = Field(None, description="Data de saída/entrada")
    tpNF: Optional[str] = Field(None, description="Tipo da NFe")
    cMunFG: Optional[str] = Field(None, description="Código do município de fato gerador")
    tpImp: Optional[str] = Field(None, description="Tipo de impressão")
    tpEmis: Optional[str] = Field(None, description="Tipo de emissão")
    cDV: Optional[str] = Field(None, description="Dígito verificador")
    tpAmb: Optional[str] = Field(None, description="Tipo de ambiente")
    finNFe: Optional[str] = Field(None, description="Finalidade da NFe")
    procEmi: Optional[str] = Field(None, description="Processo de emissão")
    verProc: Optional[str] = Field(None, description="Versão do processo")

# Schemas para Endereço
class EnderecoSchema(BaseModel):
    """Schema para endereço"""
    xLgr: Optional[str] = Field(None, description="Logradouro")
    nro: Optional[str] = Field(None, description="Número")
    xCpl: Optional[str] = Field(None, description="Complemento")
    xBairro: Optional[str] = Field(None, description="Bairro")
    cMun: Optional[str] = Field(None, description="Código do município")
    xMun: Optional[str] = Field(None, description="Nome do município")
    UF: Optional[str] = Field(None, description="UF")
    CEP: Optional[str] = Field(None, description="CEP")
    cPais: Optional[str] = Field(None, description="Código do país")
    xPais: Optional[str] = Field(None, description="Nome do país")
    fone: Optional[str] = Field(None, description="Telefone")

# Schemas para Emitente
class EmitenteSchema(BaseModel):
    """Schema para dados do emitente"""
    CNPJ: Optional[str] = Field(None, description="CNPJ do emitente")
    CPF: Optional[str] = Field(None, description="CPF do emitente")
    xNome: Optional[str] = Field(None, description="Razão social do emitente")
    xFant: Optional[str] = Field(None, description="Nome fantasia")
    enderEmit: Optional[EnderecoSchema] = Field(None, description="Endereço do emitente")
    IE: Optional[str] = Field(None, description="Inscrição estadual")
    IEST: Optional[str] = Field(None, description="IE substituto tributário")
    IM: Optional[str] = Field(None, description="Inscrição municipal")
    CNAE: Optional[str] = Field(None, description="CNAE fiscal")
    CRT: Optional[str] = Field(None, description="Código regime tributário")

# Schemas para Destinatário
class DestinatarioSchema(BaseModel):
    """Schema para dados do destinatário"""
    CNPJ: Optional[str] = Field(None, description="CNPJ do destinatário")
    CPF: Optional[str] = Field(None, description="CPF do destinatário")
    idEstrangeiro: Optional[str] = Field(None, description="ID estrangeiro")
    xNome: Optional[str] = Field(None, description="Razão social do destinatário")
    enderDest: Optional[EnderecoSchema] = Field(None, description="Endereço do destinatário")
    indIEDest: Optional[str] = Field(None, description="Indicador IE destinatário")
    IE: Optional[str] = Field(None, description="Inscrição estadual")
    ISUF: Optional[str] = Field(None, description="Inscrição SUFRAMA")
    IM: Optional[str] = Field(None, description="Inscrição municipal")
    email: Optional[str] = Field(None, description="Email")

# Schemas para Produto
class ProdutoSchema(BaseModel):
    """Schema para dados do produto"""
    cProd: Optional[str] = Field(None, description="Código do produto")
    cEAN: Optional[str] = Field(None, description="Código EAN")
    xProd: Optional[str] = Field(None, description="Descrição do produto")
    NCM: Optional[str] = Field(None, description="Código NCM")
    CEST: Optional[str] = Field(None, description="Código CEST")
    CFOP: Optional[str] = Field(None, description="CFOP")
    uCom: Optional[str] = Field(None, description="Unidade comercial")
    qCom: Optional[str] = Field(None, description="Quantidade comercial")
    vUnCom: Optional[str] = Field(None, description="Valor unitário comercial")
    vProd: Optional[str] = Field(None, description="Valor total do produto")
    cEANTrib: Optional[str] = Field(None, description="Código EAN tributável")
    uTrib: Optional[str] = Field(None, description="Unidade tributável")
    qTrib: Optional[str] = Field(None, description="Quantidade tributável")
    vUnTrib: Optional[str] = Field(None, description="Valor unitário tributável")
    vFrete: Optional[str] = Field(None, description="Valor do frete")
    vSeg: Optional[str] = Field(None, description="Valor do seguro")
    vDesc: Optional[str] = Field(None, description="Valor do desconto")
    vOutro: Optional[str] = Field(None, description="Outras despesas")
    indTot: Optional[str] = Field(None, description="Indica se compõe o total")

# Schemas para Impostos
class ICMSSchema(BaseModel):
    """Schema para ICMS"""
    orig: Optional[str] = Field(None, description="Origem da mercadoria")
    CST: Optional[str] = Field(None, description="Código de situação tributária")
    modBC: Optional[str] = Field(None, description="Modalidade BC ICMS")
    vBC: Optional[str] = Field(None, description="Valor da BC ICMS")
    pICMS: Optional[str] = Field(None, description="Alíquota ICMS")
    vICMS: Optional[str] = Field(None, description="Valor do ICMS")
    modBCST: Optional[str] = Field(None, description="Modalidade BC ICMS ST")
    pMVAST: Optional[str] = Field(None, description="Percentual margem valor ST")
    pRedBCST: Optional[str] = Field(None, description="Percentual redução BC ST")
    vBCST: Optional[str] = Field(None, description="Valor da BC ICMS ST")
    pICMSST: Optional[str] = Field(None, description="Alíquota ICMS ST")
    vICMSST: Optional[str] = Field(None, description="Valor do ICMS ST")

class PISSchema(BaseModel):
    """Schema para PIS"""
    CST: Optional[str] = Field(None, description="Código de situação tributária")
    vBC: Optional[str] = Field(None, description="Valor da base de cálculo")
    pPIS: Optional[str] = Field(None, description="Alíquota PIS")
    vPIS: Optional[str] = Field(None, description="Valor do PIS")
    qBCProd: Optional[str] = Field(None, description="Quantidade vendida")
    vAliqProd: Optional[str] = Field(None, description="Alíquota por unidade")

class COFINSSchema(BaseModel):
    """Schema para COFINS"""
    CST: Optional[str] = Field(None, description="Código de situação tributária")
    vBC: Optional[str] = Field(None, description="Valor da base de cálculo")
    pCOFINS: Optional[str] = Field(None, description="Alíquota COFINS")
    vCOFINS: Optional[str] = Field(None, description="Valor do COFINS")
    qBCProd: Optional[str] = Field(None, description="Quantidade vendida")
    vAliqProd: Optional[str] = Field(None, description="Alíquota por unidade")

class ImpostoSchema(BaseModel):
    """Schema para impostos do item"""
    ICMS: Optional[ICMSSchema] = Field(None, description="ICMS")
    PIS: Optional[PISSchema] = Field(None, description="PIS")
    COFINS: Optional[COFINSSchema] = Field(None, description="COFINS")

# Schema para Item (det)
class ItemSchema(BaseModel):
    """Schema para item da NFe"""
    nItem: Optional[str] = Field(None, description="Número do item")
    prod: Optional[ProdutoSchema] = Field(None, description="Dados do produto")
    imposto: Optional[ImpostoSchema] = Field(None, description="Impostos do item")

# Schemas para Totais
class ICMSTotalSchema(BaseModel):
    """Schema para totais de ICMS"""
    vBC: Optional[str] = Field(None, description="Base de cálculo ICMS")
    vICMS: Optional[str] = Field(None, description="Valor total ICMS")
    vICMSDeson: Optional[str] = Field(None, description="Valor ICMS desonerado")
    vBCST: Optional[str] = Field(None, description="Base de cálculo ICMS ST")
    vST: Optional[str] = Field(None, description="Valor total ICMS ST")
    vProd: Optional[str] = Field(None, description="Valor total produtos")
    vFrete: Optional[str] = Field(None, description="Valor total frete")
    vSeg: Optional[str] = Field(None, description="Valor total seguro")
    vDesc: Optional[str] = Field(None, description="Valor total desconto")
    vII: Optional[str] = Field(None, description="Valor total II")
    vIPI: Optional[str] = Field(None, description="Valor total IPI")
    vPIS: Optional[str] = Field(None, description="Valor total PIS")
    vCOFINS: Optional[str] = Field(None, description="Valor total COFINS")
    vOutro: Optional[str] = Field(None, description="Outras despesas")
    vNF: Optional[str] = Field(None, description="Valor total da NFe")

class TotalSchema(BaseModel):
    """Schema para totais da NFe"""
    ICMSTot: Optional[ICMSTotalSchema] = Field(None, description="Totais ICMS")

# Schemas para Transporte
class TransportadoraSchema(BaseModel):
    """Schema para dados da transportadora"""
    CNPJ: Optional[str] = Field(None, description="CNPJ da transportadora")
    CPF: Optional[str] = Field(None, description="CPF da transportadora")
    xNome: Optional[str] = Field(None, description="Razão social")
    IE: Optional[str] = Field(None, description="Inscrição estadual")
    xEnder: Optional[str] = Field(None, description="Endereço completo")
    xMun: Optional[str] = Field(None, description="Nome do município")
    UF: Optional[str] = Field(None, description="UF")

class VeiculoSchema(BaseModel):
    """Schema para veículo de transporte"""
    placa: Optional[str] = Field(None, description="Placa do veículo")
    UF: Optional[str] = Field(None, description="UF do veículo")
    RNTC: Optional[str] = Field(None, description="RNTC")

class VolumeSchema(BaseModel):
    """Schema para volume transportado"""
    qVol: Optional[str] = Field(None, description="Quantidade de volumes")
    esp: Optional[str] = Field(None, description="Espécie dos volumes")
    marca: Optional[str] = Field(None, description="Marca dos volumes")
    nVol: Optional[str] = Field(None, description="Numeração dos volumes")
    pesoL: Optional[str] = Field(None, description="Peso líquido")
    pesoB: Optional[str] = Field(None, description="Peso bruto")

class TransporteSchema(BaseModel):
    """Schema para dados de transporte"""
    modFrete: Optional[str] = Field(None, description="Modalidade do frete")
    transporta: Optional[TransportadoraSchema] = Field(None, description="Transportadora")
    veicTransp: Optional[VeiculoSchema] = Field(None, description="Veículo de transporte")
    reboque: Optional[VeiculoSchema] = Field(None, description="Reboque")
    vol: Optional[List[VolumeSchema]] = Field(None, description="Volumes")

# Schema para Informações Adicionais
class InformacaoAdicionalSchema(BaseModel):
    """Schema para informações adicionais"""
    infAdFisco: Optional[str] = Field(None, description="Informações adicionais de interesse do fisco")
    infCpl: Optional[str] = Field(None, description="Informações complementares")

# Schema principal da NFe
class InfNFeSchema(BaseModel):
    """Schema para informações da NFe"""
    Id: Optional[str] = Field(None, description="ID da NFe")
    versao: Optional[str] = Field(None, description="Versão do schema")
    ide: Optional[IdeSchema] = Field(None, description="Identificação da NFe")
    emit: Optional[EmitenteSchema] = Field(None, description="Dados do emitente")
    dest: Optional[DestinatarioSchema] = Field(None, description="Dados do destinatário")
    retirada: Optional[EnderecoSchema] = Field(None, description="Local de retirada")
    entrega: Optional[EnderecoSchema] = Field(None, description="Local de entrega")
    det: Optional[List[ItemSchema]] = Field(None, description="Detalhamento dos produtos/serviços")
    total: Optional[TotalSchema] = Field(None, description="Valores totais da NFe")
    transp: Optional[TransporteSchema] = Field(None, description="Informações de transporte")
    infAdic: Optional[InformacaoAdicionalSchema] = Field(None, description="Informações adicionais")

class NFeLeituraSchema(BaseModel):
    """Schema principal para leitura da NFe"""
    tipo: str = Field(..., description="Tipo do documento (NFe, CTe, etc.)")
    namespace: Optional[str] = Field(None, description="Namespace do XML")
    id_nfe: Optional[str] = Field(None, description="ID da NFe")
    versao: Optional[str] = Field(None, description="Versão do schema")
    has_signature: bool = Field(False, description="Indica se possui assinatura digital")
    total_elements: int = Field(0, description="Total de elementos XML")
    total_items: int = Field(0, description="Total de itens da NFe")
    infNFe: Optional[InfNFeSchema] = Field(None, description="Informações da NFe")
    processed_at: datetime = Field(default_factory=datetime.utcnow, description="Data de processamento")

# Schema simplificado para resposta da API
class NFeLeituraResponseSchema(BaseModel):
    """Schema de resposta simplificado para leitura de NFe"""
    message: str
    filename: str
    size: int
    content_type: str
    xml_info: NFeLeituraSchema
    processed_at: datetime

# Schema genérico para XMLs não identificados
class XMLGenericoSchema(BaseModel):
    """Schema para XMLs genéricos"""
    tipo: str = Field("generic", description="Tipo do documento")
    root_tag: str = Field(..., description="Tag raiz do XML")
    namespace: Optional[str] = Field(None, description="Namespace do XML")
    attributes: dict = Field(default_factory=dict, description="Atributos da tag raiz")
    total_elements: int = Field(0, description="Total de elementos XML")
    child_elements: List[str] = Field(default_factory=list, description="Elementos filhos")
    text_content: Optional[str] = Field(None, description="Conteúdo de texto")