/**
 * OUTRAS COLETAS — fornece a base DE PARA (COD_EAN + DSC_PRODUTO_VAR_VENDA) para o app.
 *
 * COMO PUBLICAR
 * 1) Abra a planilha DE PARA > Extensões > Apps Script > cole este código > Salvar.
 * 2) Implantar > Nova implantação > tipo "App da Web"
 *      Executar como: Eu
 *      Quem tem acesso: Qualquer pessoa
 * 3) Copie a URL que termina em /exec e cole em PRODUCTS_ENDPOINT, no index.html.
 * 4) Sempre que mudar este código: Implantar > Gerenciar implantações > editar > Nova versão.
 *
 * IMPORTANTE: a coluna A (COD_EAN) precisa estar formatada como TEXTO. Se estiver como número,
 * o Excel/Sheets arredonda (7891100000000) e o código bipado nunca vai bater.
 */
const SHEET_ID = "1XM2UHpeISbXn5rYvxXNE_WVWONSbFYq4Zx7jVesjQ_E";
const ABA = "DE PARA";

function doGet() {
  const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(ABA);
  const ultima = sh.getLastRow();
  if (ultima < 2) return saida_({ v: 1, n: 0, invalidos: 0, items: [] });

  // getDisplayValues = o texto exatamente como aparece na célula (não perde zeros nem vira número)
  const valores = sh.getRange(2, 1, ultima - 1, 2).getDisplayValues();
  const vistos = {};
  const items = [];
  let invalidos = 0;

  for (let i = 0; i < valores.length; i++) {
    const ean = String(valores[i][0]).trim();
    const desc = String(valores[i][1]).trim();
    if (!ean || !desc) continue;
    if (!/^\d+$/.test(ean)) { invalidos++; continue; }          // ex.: "7,8911E+12"
    const k = ean.replace(/^0+/, "");
    if (vistos[k]) continue;                                    // repetidos: fica o primeiro
    vistos[k] = 1;
    items.push([ean, desc]);                                    // formato compacto: [ean, descrição]
  }
  return saida_({ v: 1, n: items.length, invalidos: invalidos, items: items });
}

function saida_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
