/* Geração do PDF "Pré Contagem" (6 itens por página, A4) no mesmo layout do modelo ETIQUETA_UNICO.pdf
   e do Code 39 desenhado em vetor (sem imagem), para leitura limpa no coletor.
   Funciona no navegador (window.OC_PDF) e no Node (module.exports) para testes. */
(function (root) {
  "use strict";

  /* ---------- Code 39 ---------- */
  var C39 = {
    "0":"nnnwwnwnn","1":"wnnwnnnnw","2":"nnwwnnnnw","3":"wnwwnnnnn","4":"nnnwwnnnw",
    "5":"wnnwwnnnn","6":"nnwwwnnnn","7":"nnnwnnwnw","8":"wnnwnnwnn","9":"nnwwnnwnn",
    "A":"wnnnnwnnw","B":"nnwnnwnnw","C":"wnwnnwnnn","D":"nnnnwwnnw","E":"wnnnwwnnn",
    "F":"nnwnwwnnn","G":"nnnnnwwnw","H":"wnnnnwwnn","I":"nnwnnwwnn","J":"nnnnwwwnn",
    "K":"wnnnnnnww","L":"nnwnnnnww","M":"wnwnnnnwn","N":"nnnnwnnww","O":"wnnnwnnwn",
    "P":"nnwnwnnwn","Q":"nnnnnnwww","R":"wnnnnnwwn","S":"nnwnnnwwn","T":"nnnnwnwwn",
    "U":"wwnnnnnnw","V":"nwwnnnnnw","W":"wwwnnnnnn","X":"nwnnwnnnw","Y":"wwnnwnnnn",
    "Z":"nwwnwnnnn","-":"nwnnnnwnw",".":"wwnnnnwnn"," ":"nwwnnnwnn","*":"nwnnwnwnn"
  };

  /* devolve lista de retângulos [x, largura] em "módulos" + largura total */
  function code39Bars(texto, ratio) {
    ratio = ratio || 3;
    var s = "*" + String(texto).toUpperCase().replace(/[^0-9A-Z\-\. ]/g, "") + "*";
    var bars = [], x = 0;
    for (var i = 0; i < s.length; i++) {
      var p = C39[s[i]];
      for (var j = 0; j < 9; j++) {
        var w = p[j] === "w" ? ratio : 1;
        if (j % 2 === 0) bars.push([x, w]); // índices pares = barras
        x += w;
      }
      x += 1; // espaço entre caracteres
    }
    return { bars: bars, width: x - 1 };
  }

  /* ---------- PDF ---------- */
  var K = 595 / 827; // o modelo foi medido em px de uma página de 827 px de largura
  function p(v) { return v * K; }

  function ajustaTexto(doc, txt, maxW, tam, min) {
    var t = tam;
    doc.setFontSize(t);
    while (t > min && doc.getTextWidth(txt) > maxW) { t -= 0.5; doc.setFontSize(t); }
    return t;
  }

  var POR_PAGINA = 6;      // itens por folha
  var TOPO = 172;          // y (px do modelo) do 1º item
  var PASSO = 150;         // distância entre itens

  function desenhaCabecalho(doc, d) {
    var Y = [255, 255, 204];
    doc.setDrawColor(0); doc.setTextColor(0);
    doc.setLineWidth(0.6);
    doc.rect(p(40), p(50), p(555), p(78));
    doc.setFillColor(Y[0], Y[1], Y[2]);
    doc.rect(p(40), p(75), p(555), p(25), "FD");
    doc.rect(p(40), p(100), p(555), p(28), "FD");
    doc.rect(p(598), p(49), p(190), p(81));
    if (d.logo) { try { doc.addImage(d.logo, "PNG", p(46), p(51), p(118), p(24.8)); } catch (e) {} }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text("Pré Contagem - " + (d.cfg.tipo === "DEPOSITO" ? "DEPÓSITO" : "LOJA"), p(346), p(71), { align: "center" });
    doc.setFontSize(7);
    var resp = "Responsável da Pré contagem:" + (d.cfg.matricula || "") + (d.cfg.nome ? " - " + d.cfg.nome : "");
    doc.text(resp, p(42), p(88));
    doc.text("Responsável Prevenção de Riscos (NOME COMPLETO):", p(42), p(114));
    doc.setFontSize(8);
    doc.text("Carimbo de Prevenção de Riscos:", p(608), p(63));
    doc.setFontSize(10);
    doc.text("Identificador informado no coletor:", p(34), p(142));
    doc.setFont("helvetica", "bold");
    doc.text(String(d.cfg.identificador || ""), p(250), p(142));
    doc.setFont("helvetica", "normal");
    doc.text("Local da coleta:", p(540), p(142));
    var wl = doc.getTextWidth("Local da coleta: ");
    doc.setFont("helvetica", "bold");
    doc.text(d.cfg.tipo === "DEPOSITO" ? "DEPÓSITO" : "LOJA", p(540) + wl, p(142));
  }

  /* bloco de 1 item; topo = y (px) do início do bloco (no modelo = 526) */
  function desenhaItem(doc, it, numero, topo) {
    var Y = [255, 255, 204];
    var dy = topo - 526;
    function q(v) { return p(v + dy); }
    doc.setDrawColor(0); doc.setTextColor(0);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text("ITEM", p(75), q(555), { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text(String(numero), p(75), q(580), { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text("ID", p(75), q(616), { align: "right" });
    doc.setFontSize(5);
    doc.text(String(it.id || ""), p(81), q(630), { align: "right" });

    doc.setLineWidth(0.6);
    doc.setFillColor(Y[0], Y[1], Y[2]);
    doc.rect(p(81), q(526), p(421), p(44), "FD");
    doc.setFillColor(255, 255, 255);
    doc.setLineWidth(1.4);
    doc.rect(p(81), q(570), p(421), p(70));
    doc.setLineWidth(0.6);
    doc.setFillColor(Y[0], Y[1], Y[2]);
    doc.rect(p(81), q(641), p(421), p(16), "FD");
    doc.setFillColor(255, 255, 255);
    doc.rect(p(502), q(526), p(208), p(43), "FD");
    doc.setFillColor(Y[0], Y[1], Y[2]);
    doc.rect(p(502), q(569), p(208), p(88), "FD");

    doc.setFont("helvetica", "normal");
    ajustaTexto(doc, it.desc, p(405), 8.5, 5);
    doc.text(it.desc, p(291.5), q(551), { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("Colocar quantidade em unidades", p(606), q(552), { align: "center" });

    doc.setFont("helvetica", "normal");
    var qtd = String(it.qtd);
    ajustaTexto(doc, qtd, p(190), 24, 10);
    doc.text(qtd, p(606), q(620), { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(String(it.ean), p(291.5), q(653), { align: "center" });

    var cb = code39Bars(it.ean, 3);
    var mod = Math.min(p(173) / cb.width, 0.9);
    var larg = cb.width * mod;
    var x0 = p(291.5) - larg / 2;
    doc.setFillColor(0, 0, 0);
    for (var i = 0; i < cb.bars.length; i++) {
      doc.rect(x0 + cb.bars[i][0] * mod, q(590), cb.bars[i][1] * mod, p(32), "F");
    }
  }

  function desenhaRodape(doc, pag, total) {
    doc.setDrawColor(0); doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text("Página:", p(74), p(1137));
    doc.text(String(pag), p(141), p(1137), { align: "center" });
    doc.text("de", p(168), p(1137));
    doc.text(String(total), p(213), p(1137), { align: "center" });
    doc.setLineWidth(0.6);
    doc.line(p(125), p(1143), p(158), p(1143));
    doc.line(p(196), p(1143), p(229), p(1143));
  }

  function gerarPDF(JsPDF, dados, opc) {
    var por = (opc && opc.porPagina) || POR_PAGINA;
    var doc = new JsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
    var itens = dados.items;
    var paginas = Math.max(1, Math.ceil(itens.length / por));
    for (var pg = 0; pg < paginas; pg++) {
      if (pg > 0) doc.addPage();
      desenhaCabecalho(doc, dados);
      for (var k = 0; k < por; k++) {
        var i = pg * por + k;
        if (i >= itens.length) break;
        desenhaItem(doc, itens[i], i + 1, TOPO + k * PASSO);
      }
      desenhaRodape(doc, pg + 1, paginas);
    }
    return doc;
  }

  var api = { code39Bars: code39Bars, gerarPDF: gerarPDF };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.OC_PDF = api;
})(typeof window !== "undefined" ? window : globalThis);
