from sqlalchemy.orm import Session as DBSession
from typing import Dict, Any, List, Optional, Union
from fastapi import HTTPException, status, UploadFile
import xml.etree.ElementTree as ET
from datetime import datetime
import io

from ..schemas.xml_schema import (
    NFeLeituraResponseSchema, NFeLeituraSchema, InfNFeSchema,
    IdeSchema, EmitenteSchema, DestinatarioSchema, EnderecoSchema,
    ItemSchema, ProdutoSchema, ImpostoSchema, ICMSSchema, PISSchema, COFINSSchema,
    TotalSchema, ICMSTotalSchema, TransporteSchema, TransportadoraSchema,
    VeiculoSchema, VolumeSchema, InformacaoAdicionalSchema, XMLGenericoSchema
)

class XMLService:
    def __init__(self):
        pass
    
    def upload_and_process_xml(self, db: DBSession, file: UploadFile) -> NFeLeituraResponseSchema:
        """Processa um arquivo XML em memória e retorna schema estruturado"""
        
        try:
            # Lê o conteúdo do arquivo em memória
            content = file.file.read()
            
            # Processa o XML diretamente da memória
            xml_data = self._parse_xml_content(content)
            
            return NFeLeituraResponseSchema(
                message="Arquivo XML processado com sucesso",
                filename=file.filename,
                size=len(content),
                content_type=file.content_type,
                xml_info=xml_data,
                processed_at=datetime.utcnow()
            )
            
        except ET.ParseError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao fazer parse do XML: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro ao processar arquivo XML: {str(e)}"
            )
        finally:
            file.file.close()
    
    def _parse_xml_content(self, content: bytes) -> Union[NFeLeituraSchema, XMLGenericoSchema]:
        """Faz o parse do XML a partir do conteúdo em bytes"""
        xml_string = content.decode('utf-8')
        root = ET.fromstring(xml_string)
        
        # Detecta o tipo de XML e processa conforme o tipo
        xml_type = self._detect_xml_type(root)
        
        if xml_type == "nfe":
            return self._parse_nfe(root)
        else:
            return self._parse_generic_xml(root)
    
    def _detect_xml_type(self, root: ET.Element) -> str:
        """Detecta o tipo de XML baseado na estrutura"""
        root_tag = self._clean_tag(root.tag)
        
        if root_tag == "NFe":
            return "nfe"
        elif root_tag == "CTe":
            return "cte"
        elif root_tag == "MDFe":
            return "mdfe"
        else:
            return "generic"
    
    def _clean_tag(self, tag: str) -> str:
        """Remove namespace do tag"""
        if '}' in tag:
            return tag.split('}')[1]
        return tag
    
    def _parse_nfe(self, root: ET.Element) -> NFeLeituraSchema:
        """Parse específico para NFe usando schemas Pydantic"""
        namespace = self._extract_namespace(root.tag)
        ns = {'nfe': namespace} if namespace else {}
        
        # Busca elementos principais da NFe
        inf_nfe = root.find('.//nfe:infNFe', ns) if namespace else root.find('.//infNFe')
        
        if inf_nfe is None:
            return XMLGenericoSchema(
                root_tag=self._clean_tag(root.tag),
                namespace=namespace,
                attributes=dict(root.attrib),
                total_elements=len(list(root.iter())),
                child_elements=[self._clean_tag(child.tag) for child in root],
                text_content=root.text.strip() if root.text else None
            )
        
        # Extrai seções principais
        ide = inf_nfe.find('.//nfe:ide', ns) if namespace else inf_nfe.find('.//ide')
        emit = inf_nfe.find('.//nfe:emit', ns) if namespace else inf_nfe.find('.//emit')
        dest = inf_nfe.find('.//nfe:dest', ns) if namespace else inf_nfe.find('.//dest')
        total = inf_nfe.find('.//nfe:total', ns) if namespace else inf_nfe.find('.//total')
        transp = inf_nfe.find('.//nfe:transp', ns) if namespace else inf_nfe.find('.//transp')
        inf_adic = inf_nfe.find('.//nfe:infAdic', ns) if namespace else inf_nfe.find('.//infAdic')
        retirada = inf_nfe.find('.//nfe:retirada', ns) if namespace else inf_nfe.find('.//retirada')
        entrega = inf_nfe.find('.//nfe:entrega', ns) if namespace else inf_nfe.find('.//entrega')
        
        # Processa items/produtos
        produtos = self._parse_items(inf_nfe, ns)
        
        # Monta o schema da infNFe
        inf_nfe_schema = InfNFeSchema(
            Id=inf_nfe.get('Id'),
            versao=inf_nfe.get('versao'),
            ide=self._parse_ide(ide, ns) if ide is not None else None,
            emit=self._parse_emitente(emit, ns) if emit is not None else None,
            dest=self._parse_destinatario(dest, ns) if dest is not None else None,
            retirada=self._parse_endereco(retirada, ns) if retirada is not None else None,
            entrega=self._parse_endereco(entrega, ns) if entrega is not None else None,
            det=produtos,
            total=self._parse_total(total, ns) if total is not None else None,
            transp=self._parse_transporte(transp, ns) if transp is not None else None,
            infAdic=self._parse_info_adicional(inf_adic, ns) if inf_adic is not None else None
        )
        
        return NFeLeituraSchema(
            tipo="NFe",
            namespace=namespace,
            id_nfe=inf_nfe.get('Id'),
            versao=inf_nfe.get('versao'),
            has_signature=self._has_signature(root),
            total_elements=len(list(root.iter())),
            total_items=len(produtos),
            infNFe=inf_nfe_schema,
            processed_at=datetime.utcnow()
        )
    
    def _parse_ide(self, ide: ET.Element, ns: Dict[str, str]) -> IdeSchema:
        """Parse da identificação da NFe"""
        return IdeSchema(
            cUF=self._get_element_text(ide, 'cUF', ns),
            cNF=self._get_element_text(ide, 'cNF', ns),
            natOp=self._get_element_text(ide, 'natOp', ns),
            indPag=self._get_element_text(ide, 'indPag', ns),
            mod=self._get_element_text(ide, 'mod', ns),
            serie=self._get_element_text(ide, 'serie', ns),
            nNF=self._get_element_text(ide, 'nNF', ns),
            dEmi=self._get_element_text(ide, 'dEmi', ns),
            dSaiEnt=self._get_element_text(ide, 'dSaiEnt', ns),
            tpNF=self._get_element_text(ide, 'tpNF', ns),
            cMunFG=self._get_element_text(ide, 'cMunFG', ns),
            tpImp=self._get_element_text(ide, 'tpImp', ns),
            tpEmis=self._get_element_text(ide, 'tpEmis', ns),
            cDV=self._get_element_text(ide, 'cDV', ns),
            tpAmb=self._get_element_text(ide, 'tpAmb', ns),
            finNFe=self._get_element_text(ide, 'finNFe', ns),
            procEmi=self._get_element_text(ide, 'procEmi', ns),
            verProc=self._get_element_text(ide, 'verProc', ns)
        )
    
    def _parse_endereco(self, endereco: ET.Element, ns: Dict[str, str]) -> EnderecoSchema:
        """Parse de endereço"""
        return EnderecoSchema(
            xLgr=self._get_element_text(endereco, 'xLgr', ns),
            nro=self._get_element_text(endereco, 'nro', ns),
            xCpl=self._get_element_text(endereco, 'xCpl', ns),
            xBairro=self._get_element_text(endereco, 'xBairro', ns),
            cMun=self._get_element_text(endereco, 'cMun', ns),
            xMun=self._get_element_text(endereco, 'xMun', ns),
            UF=self._get_element_text(endereco, 'UF', ns),
            CEP=self._get_element_text(endereco, 'CEP', ns),
            cPais=self._get_element_text(endereco, 'cPais', ns),
            xPais=self._get_element_text(endereco, 'xPais', ns),
            fone=self._get_element_text(endereco, 'fone', ns)
        )
    
    def _parse_emitente(self, emit: ET.Element, ns: Dict[str, str]) -> EmitenteSchema:
        """Parse do emitente"""
        endereco_emit = emit.find('.//nfe:enderEmit', ns) if ns else emit.find('.//enderEmit')
        
        return EmitenteSchema(
            CNPJ=self._get_element_text(emit, 'CNPJ', ns),
            CPF=self._get_element_text(emit, 'CPF', ns),
            xNome=self._get_element_text(emit, 'xNome', ns),
            xFant=self._get_element_text(emit, 'xFant', ns),
            enderEmit=self._parse_endereco(endereco_emit, ns) if endereco_emit is not None else None,
            IE=self._get_element_text(emit, 'IE', ns),
            IEST=self._get_element_text(emit, 'IEST', ns),
            IM=self._get_element_text(emit, 'IM', ns),
            CNAE=self._get_element_text(emit, 'CNAE', ns),
            CRT=self._get_element_text(emit, 'CRT', ns)
        )
    
    def _parse_destinatario(self, dest: ET.Element, ns: Dict[str, str]) -> DestinatarioSchema:
        """Parse do destinatário"""
        endereco_dest = dest.find('.//nfe:enderDest', ns) if ns else dest.find('.//enderDest')
        
        return DestinatarioSchema(
            CNPJ=self._get_element_text(dest, 'CNPJ', ns),
            CPF=self._get_element_text(dest, 'CPF', ns),
            idEstrangeiro=self._get_element_text(dest, 'idEstrangeiro', ns),
            xNome=self._get_element_text(dest, 'xNome', ns),
            enderDest=self._parse_endereco(endereco_dest, ns) if endereco_dest is not None else None,
            indIEDest=self._get_element_text(dest, 'indIEDest', ns),
            IE=self._get_element_text(dest, 'IE', ns),
            ISUF=self._get_element_text(dest, 'ISUF', ns),
            IM=self._get_element_text(dest, 'IM', ns),
            email=self._get_element_text(dest, 'email', ns)
        )
    
    def _parse_items(self, inf_nfe: ET.Element, ns: Dict[str, str]) -> List[ItemSchema]:
        """Parse dos itens da NFe"""
        items = []
        dets = inf_nfe.findall('.//nfe:det', ns) if ns else inf_nfe.findall('.//det')
        
        for det in dets:
            prod = det.find('.//nfe:prod', ns) if ns else det.find('.//prod')
            imposto = det.find('.//nfe:imposto', ns) if ns else det.find('.//imposto')
            
            item = ItemSchema(
                nItem=det.get('nItem'),
                prod=self._parse_produto(prod, ns) if prod is not None else None,
                imposto=self._parse_imposto(imposto, ns) if imposto is not None else None
            )
            items.append(item)
        
        return items
    
    def _parse_produto(self, prod: ET.Element, ns: Dict[str, str]) -> ProdutoSchema:
        """Parse do produto"""
        return ProdutoSchema(
            cProd=self._get_element_text(prod, 'cProd', ns),
            cEAN=self._get_element_text(prod, 'cEAN', ns),
            xProd=self._get_element_text(prod, 'xProd', ns),
            NCM=self._get_element_text(prod, 'NCM', ns),
            CEST=self._get_element_text(prod, 'CEST', ns),
            CFOP=self._get_element_text(prod, 'CFOP', ns),
            uCom=self._get_element_text(prod, 'uCom', ns),
            qCom=self._get_element_text(prod, 'qCom', ns),
            vUnCom=self._get_element_text(prod, 'vUnCom', ns),
            vProd=self._get_element_text(prod, 'vProd', ns),
            cEANTrib=self._get_element_text(prod, 'cEANTrib', ns),
            uTrib=self._get_element_text(prod, 'uTrib', ns),
            qTrib=self._get_element_text(prod, 'qTrib', ns),
            vUnTrib=self._get_element_text(prod, 'vUnTrib', ns),
            vFrete=self._get_element_text(prod, 'vFrete', ns),
            vSeg=self._get_element_text(prod, 'vSeg', ns),
            vDesc=self._get_element_text(prod, 'vDesc', ns),
            vOutro=self._get_element_text(prod, 'vOutro', ns),
            indTot=self._get_element_text(prod, 'indTot', ns)
        )
    
    def _parse_imposto(self, imposto: ET.Element, ns: Dict[str, str]) -> ImpostoSchema:
        """Parse dos impostos"""
        icms_elem = imposto.find('.//nfe:ICMS', ns) if ns else imposto.find('.//ICMS')
        pis_elem = imposto.find('.//nfe:PIS', ns) if ns else imposto.find('.//PIS')
        cofins_elem = imposto.find('.//nfe:COFINS', ns) if ns else imposto.find('.//COFINS')
        
        return ImpostoSchema(
            ICMS=self._parse_icms(icms_elem, ns) if icms_elem is not None else None,
            PIS=self._parse_pis(pis_elem, ns) if pis_elem is not None else None,
            COFINS=self._parse_cofins(cofins_elem, ns) if cofins_elem is not None else None
        )
    
    def _parse_icms(self, icms: ET.Element, ns: Dict[str, str]) -> ICMSSchema:
        """Parse do ICMS"""
        # Procura por diferentes tipos de ICMS (ICMS00, ICMS10, etc.)
        icms_det = None
        for child in icms:
            if 'ICMS' in self._clean_tag(child.tag):
                icms_det = child
                break
        
        if icms_det is None:
            return ICMSSchema()
        
        return ICMSSchema(
            orig=self._get_element_text(icms_det, 'orig', ns),
            CST=self._get_element_text(icms_det, 'CST', ns),
            modBC=self._get_element_text(icms_det, 'modBC', ns),
            vBC=self._get_element_text(icms_det, 'vBC', ns),
            pICMS=self._get_element_text(icms_det, 'pICMS', ns),
            vICMS=self._get_element_text(icms_det, 'vICMS', ns),
            modBCST=self._get_element_text(icms_det, 'modBCST', ns),
            pMVAST=self._get_element_text(icms_det, 'pMVAST', ns),
            pRedBCST=self._get_element_text(icms_det, 'pRedBCST', ns),
            vBCST=self._get_element_text(icms_det, 'vBCST', ns),
            pICMSST=self._get_element_text(icms_det, 'pICMSST', ns),
            vICMSST=self._get_element_text(icms_det, 'vICMSST', ns)
        )
    
    def _parse_pis(self, pis: ET.Element, ns: Dict[str, str]) -> PISSchema:
        """Parse do PIS"""
        # Procura por PISAliq, PISQtde, etc.
        pis_det = None
        for child in pis:
            if 'PIS' in self._clean_tag(child.tag):
                pis_det = child
                break
        
        if pis_det is None:
            return PISSchema()
        
        return PISSchema(
            CST=self._get_element_text(pis_det, 'CST', ns),
            vBC=self._get_element_text(pis_det, 'vBC', ns),
            pPIS=self._get_element_text(pis_det, 'pPIS', ns),
            vPIS=self._get_element_text(pis_det, 'vPIS', ns),
            qBCProd=self._get_element_text(pis_det, 'qBCProd', ns),
            vAliqProd=self._get_element_text(pis_det, 'vAliqProd', ns)
        )
    
    def _parse_cofins(self, cofins: ET.Element, ns: Dict[str, str]) -> COFINSSchema:
        """Parse do COFINS"""
        # Procura por COFINSAliq, COFINSQtde, etc.
        cofins_det = None
        for child in cofins:
            if 'COFINS' in self._clean_tag(child.tag):
                cofins_det = child
                break
        
        if cofins_det is None:
            return COFINSSchema()
        
        return COFINSSchema(
            CST=self._get_element_text(cofins_det, 'CST', ns),
            vBC=self._get_element_text(cofins_det, 'vBC', ns),
            pCOFINS=self._get_element_text(cofins_det, 'pCOFINS', ns),
            vCOFINS=self._get_element_text(cofins_det, 'vCOFINS', ns),
            qBCProd=self._get_element_text(cofins_det, 'qBCProd', ns),
            vAliqProd=self._get_element_text(cofins_det, 'vAliqProd', ns)
        )
    
    def _parse_total(self, total: ET.Element, ns: Dict[str, str]) -> TotalSchema:
        """Parse dos totais"""
        icms_tot = total.find('.//nfe:ICMSTot', ns) if ns else total.find('.//ICMSTot')
        
        return TotalSchema(
            ICMSTot=self._parse_icms_total(icms_tot, ns) if icms_tot is not None else None
        )
    
    def _parse_icms_total(self, icms_tot: ET.Element, ns: Dict[str, str]) -> ICMSTotalSchema:
        """Parse dos totais de ICMS"""
        return ICMSTotalSchema(
            vBC=self._get_element_text(icms_tot, 'vBC', ns),
            vICMS=self._get_element_text(icms_tot, 'vICMS', ns),
            vICMSDeson=self._get_element_text(icms_tot, 'vICMSDeson', ns),
            vBCST=self._get_element_text(icms_tot, 'vBCST', ns),
            vST=self._get_element_text(icms_tot, 'vST', ns),
            vProd=self._get_element_text(icms_tot, 'vProd', ns),
            vFrete=self._get_element_text(icms_tot, 'vFrete', ns),
            vSeg=self._get_element_text(icms_tot, 'vSeg', ns),
            vDesc=self._get_element_text(icms_tot, 'vDesc', ns),
            vII=self._get_element_text(icms_tot, 'vII', ns),
            vIPI=self._get_element_text(icms_tot, 'vIPI', ns),
            vPIS=self._get_element_text(icms_tot, 'vPIS', ns),
            vCOFINS=self._get_element_text(icms_tot, 'vCOFINS', ns),
            vOutro=self._get_element_text(icms_tot, 'vOutro', ns),
            vNF=self._get_element_text(icms_tot, 'vNF', ns)
        )
    
    def _parse_transporte(self, transp: ET.Element, ns: Dict[str, str]) -> TransporteSchema:
        """Parse das informações de transporte"""
        transporta = transp.find('.//nfe:transporta', ns) if ns else transp.find('.//transporta')
        veic_transp = transp.find('.//nfe:veicTransp', ns) if ns else transp.find('.//veicTransp')
        reboque = transp.find('.//nfe:reboque', ns) if ns else transp.find('.//reboque')
        vols = transp.findall('.//nfe:vol', ns) if ns else transp.findall('.//vol')
        
        volumes = []
        for vol in vols:
            volumes.append(VolumeSchema(
                qVol=self._get_element_text(vol, 'qVol', ns),
                esp=self._get_element_text(vol, 'esp', ns),
                marca=self._get_element_text(vol, 'marca', ns),
                nVol=self._get_element_text(vol, 'nVol', ns),
                pesoL=self._get_element_text(vol, 'pesoL', ns),
                pesoB=self._get_element_text(vol, 'pesoB', ns)
            ))
        
        return TransporteSchema(
            modFrete=self._get_element_text(transp, 'modFrete', ns),
            transporta=self._parse_transportadora(transporta, ns) if transporta is not None else None,
            veicTransp=self._parse_veiculo(veic_transp, ns) if veic_transp is not None else None,
            reboque=self._parse_veiculo(reboque, ns) if reboque is not None else None,
            vol=volumes if volumes else None
        )
    
    def _parse_transportadora(self, transporta: ET.Element, ns: Dict[str, str]) -> TransportadoraSchema:
        """Parse da transportadora"""
        return TransportadoraSchema(
            CNPJ=self._get_element_text(transporta, 'CNPJ', ns),
            CPF=self._get_element_text(transporta, 'CPF', ns),
            xNome=self._get_element_text(transporta, 'xNome', ns),
            IE=self._get_element_text(transporta, 'IE', ns),
            xEnder=self._get_element_text(transporta, 'xEnder', ns),
            xMun=self._get_element_text(transporta, 'xMun', ns),
            UF=self._get_element_text(transporta, 'UF', ns)
        )
    
    def _parse_veiculo(self, veiculo: ET.Element, ns: Dict[str, str]) -> VeiculoSchema:
        """Parse do veículo"""
        return VeiculoSchema(
            placa=self._get_element_text(veiculo, 'placa', ns),
            UF=self._get_element_text(veiculo, 'UF', ns),
            RNTC=self._get_element_text(veiculo, 'RNTC', ns)
        )
    
    def _parse_info_adicional(self, inf_adic: ET.Element, ns: Dict[str, str]) -> InformacaoAdicionalSchema:
        """Parse das informações adicionais"""
        return InformacaoAdicionalSchema(
            infAdFisco=self._get_element_text(inf_adic, 'infAdFisco', ns),
            infCpl=self._get_element_text(inf_adic, 'infCpl', ns)
        )
    
    def _get_element_text(self, parent: Optional[ET.Element], tag: str, ns: Dict[str, str]) -> Optional[str]:
        """Extrai texto de um elemento filho"""
        if parent is None:
            return None
        
        if ns:
            element = parent.find(f'nfe:{tag}', ns)
        else:
            element = parent.find(tag)
        
        return element.text if element is not None else None
    
    def _has_signature(self, root: ET.Element) -> bool:
        """Verifica se o XML possui assinatura digital"""
        signature = root.find('.//{http://www.w3.org/2000/09/xmldsig#}Signature')
        return signature is not None
    
    def _parse_generic_xml(self, root: ET.Element) -> XMLGenericoSchema:
        """Parse genérico para XMLs não identificados"""
        return XMLGenericoSchema(
            tipo="generic",
            root_tag=self._clean_tag(root.tag),
            namespace=self._extract_namespace(root.tag),
            attributes=dict(root.attrib),
            total_elements=len(list(root.iter())),
            child_elements=[self._clean_tag(child.tag) for child in root],
            text_content=root.text.strip() if root.text else None
        )
    
    def _extract_namespace(self, tag: str) -> Optional[str]:
        """Extrai o namespace do tag XML"""
        if tag.startswith('{'):
            return tag[1:].split('}')[0]
        return None
    
    def validate_xml_content(self, content: bytes, expected_root: str = None) -> bool:
        """Valida a estrutura básica do XML a partir do conteúdo"""
        try:
            xml_string = content.decode('utf-8')
            root = ET.fromstring(xml_string)
            
            if expected_root and self._clean_tag(root.tag) != expected_root:
                return False
                
            return True
        except (ET.ParseError, UnicodeDecodeError):
            return False