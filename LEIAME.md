# Outras Coletas — passo a passo

Arquivos: index.html, pdf-coleta.js, sw.js, manifest.json, 3 ícones, apps-script.gs

1. PLANILHA: na aba "DE PARA", coluna A (COD_EAN) deve estar como TEXTO
   (selecione a coluna > Formatar > Número > Texto simples) e os códigos devem ser colados/importados de novo
   a partir da origem. Códigos já arredondados (7891100000000) não têm como ser recuperados.
2. APPS SCRIPT: abra a planilha > Extensões > Apps Script > cole apps-script.gs > Implantar > App da Web
   (Executar como: Eu / Acesso: Qualquer pessoa) > copie a URL /exec.
3. Cole a URL em PRODUCTS_ENDPOINT no index.html.
4. PUBLICAÇÃO: suba esta pasta inteira num projeto Vercel chamado "outras-coletas"
   (link: https://outras-coletas.vercel.app, se o nome estiver livre).
5. Cada celular guarda a própria coleta (nada é gravado na planilha), então uma loja não interfere em outra.
