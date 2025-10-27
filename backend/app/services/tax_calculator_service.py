from typing import Dict, Any, List, Optional
from decimal import Decimal, ROUND_HALF_UP
from ..schemas.xml_schema import (
    NFeLeituraSchema, InfNFeSchema, ItemSchema, 
    ICMSSchema, PISSchema, COFINSSchema, ICMSTotalSchema
)

class TaxCalculatorService:
    """Service para cálculos tributários e análises de NFe"""
    
    def __init__(self):
        # Configurações padrão para IVA (podem vir de configuração)
        self.iva_config = {
            "aliquota_padrao": Decimal("25.0"),
            "aliquotas_por_categoria": {
                "alimentacao": Decimal("12.0"),
                "medicamentos": Decimal("8.0"),
                "servicos": Decimal("28.0"),
                "outros": Decimal("25.0")
            }
        }
        
        # Mapeamento de regimes tributários
        self.regimes_tributarios = {
            "1": "Simples Nacional",
            "2": "Simples Nacional - Excesso Sublimite",
            "3": "Regime Normal - Lucro Presumido/Real"
        }
    
    def analyze_nfe_taxation(self, nfe_data: NFeLeituraSchema) -> Dict[str, Any]:
        """Análise completa da tributação da NFe"""
        
        if not isinstance(nfe_data, NFeLeituraSchema) or not nfe_data.infNFe:
            raise ValueError("Dados de NFe inválidos para análise tributária")
        
        analysis = {
            "regime_tributario": self._identify_tax_regime(nfe_data.infNFe),
            "resumo_atual": self._create_current_tax_summary(nfe_data.infNFe),
            "analise_por_item": self._analyze_items_taxation(nfe_data.infNFe),
            "projecao_iva": self._calculate_iva_projection(nfe_data.infNFe),
            "comparativo": {},
            "recomendacoes": []
        }
        
        # Calcula comparativo
        analysis["comparativo"] = self._create_comparison(
            analysis["resumo_atual"], 
            analysis["projecao_iva"]
        )
        
        # Gera recomendações
        analysis["recomendacoes"] = self._generate_recommendations(analysis)
        
        return analysis
    
    def _identify_tax_regime(self, inf_nfe: InfNFeSchema) -> Dict[str, Any]:
        """Identifica regime tributário do emitente"""
        
        if not inf_nfe.emit:
            return {"regime": "unknown", "descricao": "Não identificado"}
        
        crt = inf_nfe.emit.CRT or "3"  # Default para regime normal
        
        return {
            "codigo": crt,
            "descricao": self.regimes_tributarios.get(crt, "Não identificado"),
            "cnpj": inf_nfe.emit.CNPJ,
            "razao_social": inf_nfe.emit.xNome,
            "is_simples_nacional": crt in ["1", "2"]
        }
    
    def _create_current_tax_summary(self, inf_nfe: InfNFeSchema) -> Dict[str, Any]:
        """Cria resumo da tributação atual"""
        
        if not inf_nfe.total or not inf_nfe.total.ICMSTot:
            return {"erro": "Dados de totais não encontrados"}
        
        total = inf_nfe.total.ICMSTot
        
        # Converte strings para Decimal para cálculos precisos
        valor_produtos = self._to_decimal(total.vProd)
        valor_total_nf = self._to_decimal(total.vNF)
        icms_total = self._to_decimal(total.vICMS)
        pis_total = self._to_decimal(total.vPIS)
        cofins_total = self._to_decimal(total.vCOFINS)
        ipi_total = self._to_decimal(total.vIPI)
        
        # Calcula carga tributária
        total_impostos = icms_total + pis_total + cofins_total + ipi_total
        carga_tributaria = (total_impostos / valor_produtos * 100) if valor_produtos > 0 else Decimal("0")
        
        return {
            "valor_produtos": float(valor_produtos),
            "valor_total_nf": float(valor_total_nf),
            "impostos": {
                "icms": float(icms_total),
                "pis": float(pis_total),
                "cofins": float(cofins_total),
                "ipi": float(ipi_total),
                "total": float(total_impostos)
            },
            "carga_tributaria_percentual": float(carga_tributaria.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)),
            "aliquota_efetiva_icms": float((icms_total / valor_produtos * 100) if valor_produtos > 0 else Decimal("0")),
            "aliquota_efetiva_pis_cofins": float(((pis_total + cofins_total) / valor_produtos * 100) if valor_produtos > 0 else Decimal("0"))
        }
    
    def _analyze_items_taxation(self, inf_nfe: InfNFeSchema) -> List[Dict[str, Any]]:
        """Analisa tributação item por item"""
        
        if not inf_nfe.det:
            return []
        
        items_analysis = []
        
        for item in inf_nfe.det:
            if not item.prod:
                continue
                
            item_analysis = {
                "numero_item": item.nItem,
                "produto": {
                    "codigo": item.prod.cProd,
                    "descricao": item.prod.xProd,
                    "ncm": item.prod.NCM,
                    "cfop": item.prod.CFOP,
                    "valor": float(self._to_decimal(item.prod.vProd))
                },
                "tributacao_atual": self._analyze_item_taxes(item),
                "categoria_iva": self._classify_for_iva(item.prod.xProd, item.prod.NCM),
                "projecao_iva": {}
            }
            
            # Calcula projeção IVA para o item
            item_analysis["projecao_iva"] = self._calculate_item_iva(
                item_analysis["produto"]["valor"],
                item_analysis["categoria_iva"]
            )
            
            items_analysis.append(item_analysis)
        
        return items_analysis
    
    def _analyze_item_taxes(self, item: ItemSchema) -> Dict[str, Any]:
        """Analisa impostos de um item específico"""
        
        if not item.imposto:
            return {"icms": {}, "pis": {}, "cofins": {}}
        
        valor_produto = self._to_decimal(item.prod.vProd) if item.prod else Decimal("0")
        
        return {
            "icms": self._analyze_icms(item.imposto.ICMS, valor_produto),
            "pis": self._analyze_pis(item.imposto.PIS, valor_produto),
            "cofins": self._analyze_cofins(item.imposto.COFINS, valor_produto)
        }
    
    def _analyze_icms(self, icms: Optional[ICMSSchema], valor_produto: Decimal) -> Dict[str, Any]:
        """Analisa ICMS do item"""
        
        if not icms:
            return {"situacao": "sem_icms", "aliquota": 0, "valor": 0, "base_calculo": 0}
        
        aliquota = self._to_decimal(icms.pICMS)
        valor = self._to_decimal(icms.vICMS)
        base_calculo = self._to_decimal(icms.vBC)
        
        return {
            "situacao": self._get_icms_situation(icms.CST),
            "cst": icms.CST,
            "origem": icms.orig,
            "aliquota": float(aliquota),
            "valor": float(valor),
            "base_calculo": float(base_calculo),
            "aliquota_efetiva": float((valor / valor_produto * 100) if valor_produto > 0 else Decimal("0"))
        }
    
    def _analyze_pis(self, pis: Optional[PISSchema], valor_produto: Decimal) -> Dict[str, Any]:
        """Analisa PIS do item"""
        
        if not pis:
            return {"situacao": "sem_pis", "aliquota": 0, "valor": 0}
        
        aliquota = self._to_decimal(pis.pPIS)
        valor = self._to_decimal(pis.vPIS)
        
        return {
            "cst": pis.CST,
            "aliquota": float(aliquota),
            "valor": float(valor),
            "aliquota_efetiva": float((valor / valor_produto * 100) if valor_produto > 0 else Decimal("0"))
        }
    
    def _analyze_cofins(self, cofins: Optional[COFINSSchema], valor_produto: Decimal) -> Dict[str, Any]:
        """Analisa COFINS do item"""
        
        if not cofins:
            return {"situacao": "sem_cofins", "aliquota": 0, "valor": 0}
        
        aliquota = self._to_decimal(cofins.pCOFINS)
        valor = self._to_decimal(cofins.vCOFINS)
        
        return {
            "cst": cofins.CST,
            "aliquota": float(aliquota),
            "valor": float(valor),
            "aliquota_efetiva": float((valor / valor_produto * 100) if valor_produto > 0 else Decimal("0"))
        }
    
    def _calculate_iva_projection(self, inf_nfe: InfNFeSchema) -> Dict[str, Any]:
        """Calcula projeção do IVA para toda a NFe"""
        
        if not inf_nfe.total or not inf_nfe.total.ICMSTot:
            return {"erro": "Dados insuficientes para projeção"}
        
        valor_produtos = self._to_decimal(inf_nfe.total.ICMSTot.vProd)
        
        # Calcula IVA por categoria de produtos
        iva_por_categoria = {}
        valor_total_iva = Decimal("0")
        
        if inf_nfe.det:
            for item in inf_nfe.det:
                if not item.prod:
                    continue
                    
                valor_item = self._to_decimal(item.prod.vProd)
                categoria = self._classify_for_iva(item.prod.xProd, item.prod.NCM)
                aliquota_iva = self.iva_config["aliquotas_por_categoria"].get(
                    categoria, self.iva_config["aliquota_padrao"]
                )
                
                iva_item = valor_item * (aliquota_iva / 100)
                valor_total_iva += iva_item
                
                if categoria not in iva_por_categoria:
                    iva_por_categoria[categoria] = {
                        "valor_produtos": 0,
                        "valor_iva": 0,
                        "aliquota": float(aliquota_iva),
                        "itens": 0
                    }
                
                iva_por_categoria[categoria]["valor_produtos"] += float(valor_item)
                iva_por_categoria[categoria]["valor_iva"] += float(iva_item)
                iva_por_categoria[categoria]["itens"] += 1
        
        # Se não há itens, usa alíquota padrão
        if valor_total_iva == 0:
            valor_total_iva = valor_produtos * (self.iva_config["aliquota_padrao"] / 100)
        
        return {
            "valor_base": float(valor_produtos),
            "valor_iva_total": float(valor_total_iva),
            "aliquota_media": float((valor_total_iva / valor_produtos * 100) if valor_produtos > 0 else Decimal("0")),
            "detalhamento_por_categoria": iva_por_categoria
        }
    
    def _create_comparison(self, atual: Dict[str, Any], iva: Dict[str, Any]) -> Dict[str, Any]:
        """Cria comparativo entre regime atual e IVA"""
        
        if "erro" in atual or "erro" in iva:
            return {"erro": "Dados insuficientes para comparação"}
        
        impostos_atuais = atual["impostos"]["total"]
        iva_total = iva["valor_iva_total"]
        diferenca = iva_total - impostos_atuais
        percentual_diferenca = (diferenca / impostos_atuais * 100) if impostos_atuais > 0 else 0
        
        return {
            "regime_atual": {
                "total_impostos": impostos_atuais,
                "carga_tributaria": atual["carga_tributaria_percentual"]
            },
            "regime_iva": {
                "total_impostos": iva_total,
                "carga_tributaria": iva["aliquota_media"]
            },
            "diferenca": {
                "absoluta": diferenca,
                "percentual": percentual_diferenca,
                "favoravel_ao": "iva" if diferenca < 0 else "atual" if diferenca > 0 else "neutro"
            }
        }
    
    def _generate_recommendations(self, analysis: Dict[str, Any]) -> List[str]:
        """Gera recomendações baseadas na análise"""
        
        recomendacoes = []
        comparativo = analysis.get("comparativo", {})
        
        if "diferenca" in comparativo:
            diferenca_pct = comparativo["diferenca"]["percentual"]
            
            if diferenca_pct < -10:
                recomendacoes.append(
                    f"O IVA resultaria em redução de {abs(diferenca_pct):.1f}% na carga tributária. "
                    "Considere planejar para a transição."
                )
            elif diferenca_pct > 10:
                recomendacoes.append(
                    f"O IVA resultaria em aumento de {diferenca_pct:.1f}% na carga tributária. "
                    "Avalie estratégias de otimização fiscal."
                )
            else:
                recomendacoes.append(
                    "O impacto do IVA seria neutro. Monitore mudanças nas alíquotas."
                )
        
        # Recomendações específicas por categoria
        if "analise_por_item" in analysis:
            categorias_impactadas = set()
            for item in analysis["analise_por_item"]:
                if "projecao_iva" in item:
                    categorias_impactadas.add(item["categoria_iva"])
            
            if "alimentacao" in categorias_impactadas:
                recomendacoes.append(
                    "Produtos de alimentação podem se beneficiar da alíquota reduzida do IVA."
                )
        
        return recomendacoes
    
    def create_rag_context(self, analysis: Dict[str, Any], nfe_data: NFeLeituraSchema) -> str:
        """Cria contexto estruturado para RAG"""
        
        context = f"""
ANÁLISE TRIBUTÁRIA DETALHADA - NFE {nfe_data.id_nfe}

=== INFORMAÇÕES GERAIS ===
Emitente: {nfe_data.infNFe.emit.xNome if nfe_data.infNFe and nfe_data.infNFe.emit else 'N/A'}
CNPJ: {nfe_data.infNFe.emit.CNPJ if nfe_data.infNFe and nfe_data.infNFe.emit else 'N/A'}
Regime Tributário: {analysis['regime_tributario']['descricao']}
Data Emissão: {nfe_data.infNFe.ide.dEmi if nfe_data.infNFe and nfe_data.infNFe.ide else 'N/A'}

=== TRIBUTAÇÃO ATUAL ===
Valor dos Produtos: R$ {analysis['resumo_atual']['valor_produtos']:,.2f}
ICMS: R$ {analysis['resumo_atual']['impostos']['icms']:,.2f}
PIS: R$ {analysis['resumo_atual']['impostos']['pis']:,.2f}
COFINS: R$ {analysis['resumo_atual']['impostos']['cofins']:,.2f}
Total de Impostos: R$ {analysis['resumo_atual']['impostos']['total']:,.2f}
Carga Tributária: {analysis['resumo_atual']['carga_tributaria_percentual']:.2f}%

=== PROJEÇÃO IVA ===
Valor Base: R$ {analysis['projecao_iva']['valor_base']:,.2f}
IVA Total: R$ {analysis['projecao_iva']['valor_iva_total']:,.2f}
Alíquota Média IVA: {analysis['projecao_iva']['aliquota_media']:.2f}%

=== COMPARATIVO ===
Diferença Absoluta: R$ {analysis['comparativo']['diferenca']['absoluta']:,.2f}
Diferença Percentual: {analysis['comparativo']['diferenca']['percentual']:.1f}%
Regime Mais Favorável: {analysis['comparativo']['diferenca']['favoravel_ao'].upper()}

=== ANÁLISE POR PRODUTO ===
"""
        
        for item in analysis['analise_por_item'][:5]:  # Limita a 5 itens principais
            context += f"""
Produto: {item['produto']['descricao']}
- CFOP: {item['produto']['cfop']}
- Valor: R$ {item['produto']['valor']:,.2f}
- ICMS Atual: {item['tributacao_atual']['icms']['aliquota']:.2f}%
- Categoria IVA: {item['categoria_iva']}
- Alíquota IVA: {item['projecao_iva']['aliquota']:.2f}%
"""
        
        context += f"""

=== RECOMENDAÇÕES ===
"""
        for rec in analysis['recomendacoes']:
            context += f"• {rec}\n"
        
        context += """

Este documento pode ser usado para:
- Análise de impacto da reforma tributária
- Planejamento fiscal estratégico
- Comparação de cenários tributários
- Otimização da carga tributária
"""
        
        return context
    
    # Métodos auxiliares
    def _to_decimal(self, value: Optional[str]) -> Decimal:
        """Converte string para Decimal de forma segura"""
        if not value:
            return Decimal("0")
        try:
            return Decimal(str(value))
        except:
            return Decimal("0")
    
    def _classify_for_iva(self, descricao: Optional[str], ncm: Optional[str]) -> str:
        """Classifica produto para alíquota de IVA"""
        
        if not descricao:
            return "outros"
        
        descricao_lower = descricao.lower()
        
        # Palavras-chave para categorização
        if any(word in descricao_lower for word in ['agua', 'leite', 'pao', 'arroz', 'feijao', 'carne']):
            return "alimentacao"
        elif any(word in descricao_lower for word in ['medicamento', 'remedio', 'farmaco']):
            return "medicamentos"
        elif any(word in descricao_lower for word in ['servico', 'consultoria', 'manutencao']):
            return "servicos"
        else:
            return "outros"
    
    def _calculate_item_iva(self, valor: float, categoria: str) -> Dict[str, Any]:
        """Calcula IVA para um item específico"""
        
        aliquota = self.iva_config["aliquotas_por_categoria"].get(
            categoria, self.iva_config["aliquota_padrao"]
        )
        
        valor_iva = Decimal(str(valor)) * (aliquota / 100)
        
        return {
            "categoria": categoria,
            "aliquota": float(aliquota),
            "valor_iva": float(valor_iva),
            "aliquota_efetiva": float(aliquota)
        }
    
    def _get_icms_situation(self, cst: Optional[str]) -> str:
        """Retorna situação do ICMS baseada no CST"""
        
        if not cst:
            return "indefinido"
        
        situacoes = {
            "00": "tributado_integralmente",
            "10": "tributado_com_cobranca_st",
            "20": "com_reducao_base_calculo",
            "30": "isento_nao_tributado",
            "40": "isento",
            "41": "nao_tributado",
            "50": "suspenso",
            "51": "diferimento",
            "60": "st_cobrado_anteriormente",
            "70": "com_reducao_base_calculo_st",
            "90": "outros"
        }
        
        return situacoes.get(cst, "outros")