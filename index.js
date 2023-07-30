import historicoInflacao from "./colecao_dados.js";
import express from "express";
const app = express();
const port = 8080;

app.get("/historicoInflacao", (req, res) => {
  res.json(historicoInflacao);
});

app.get("/historicoInflacao/:id", (req, res) => {
  const id = req.params.id;
  let historico = historicoId(id);

  if (!isNaN(id)) {
    historico
      ? res.json(historico)
      : res.status(400).json({ mensagem: "ID não encontrado!" });
  } else {
    res.status(404).json({ mensagem: "ID invalido!" });
  }
});

app.get("/historicoInflacao/ano/:ano", (req, res) => {
  const ano = req.params.ano;
  let historico = historicoAno(ano);

  if (!isNaN(ano)) {
    historico
      ? res.json(historico)
      : res.status(400).json({ mensagem: "Ano não encontrado!" });
  } else {
    res.status(404).json({ mensagem: "Valor invalido!" });
  }
});

app.get("/historicoInflacao/reajuste/:inicio/:fim/:valor", (req, res) => {
  const inicio = req.params.inicio;
  const fim = req.params.fim;
  const valor = req.params.valor;

  const periodo = formartarDados(inicio, fim);

  let mesInicio = periodo[0];
  let mesFim = periodo[1];
  let anoInicio = periodo[2];
  let anoFim = periodo[3];

  if (
    mesInicio === 0 ||
    mesFim === 0 ||
    anoInicio < 2015 ||
    anoInicio > 2023 ||
    anoFim < 2015 ||
    anoFim > 2023 ||
    anoInicio > anoFim ||
    (anoInicio === anoFim && mesInicio > mesFim) ||
    (anoFim === 2023 && mesFim > 5)
  ) {
    res.status(400).json({ mensagem: "Periodo desconhecido." });
  } else {
    let resultado = calcularIPCA(mesInicio, mesFim, anoInicio, anoFim, valor);

    if (!isNaN(resultado)) {
      res.json({ resultado: resultado });
    } else {
      res.status(404).json({ mensagem: "Valor invalido!" });
    }
  }
});

app.listen(port, () => {
  console.log("listening on localhost:" + port);
});

const historicoId = (id) => {
  return historicoInflacao.find((historico) => historico.id === Number(id));
};

const historicoAno = (ano) => {
  return historicoInflacao.filter((historico) => historico.ano == ano);
};

const calcularIPCA = (mesInicio, mesFim, anoInicio, anoFim, valor) => {
  let valido = !isNaN(valor) ? true : false;
  let resultado = 0;

  if (valido) {
    let periodoCompleto = returnPeriodoCompleto(
      anoInicio,
      anoFim,
      mesInicio,
      mesFim
    );

    resultado = periodoCompleto.reduce(
      (current, periodo) => current * returnIPCA(current, periodo.ipca),
      valor
    );

    return resultado;
  } else {
    return valido;
  }
};

function formartarDados(inicio, fim) {
  inicio = inicio.split(/[^a-zA-Z0-9]/);
  fim = fim.split(/[^a-zA-Z0-9]/);

  let mesInicio = inicio[0];
  let mesFim = fim[0];
  let anoInicio = inicio[1];
  let anoFim = fim[1];

  mesInicio = mesInicio[0] + mesInicio[1] + mesInicio[2];
  mesFim = mesFim[0] + mesFim[1] + mesFim[2];

  mesInicio = getValueMonth(mesInicio);
  mesFim = getValueMonth(mesFim);
  anoInicio = Number(anoInicio);
  anoFim = Number(anoFim);

  return [mesInicio, mesFim, anoInicio, anoFim];
}

function returnPeriodoCompleto(anoInicio, anoFim, mesInicio, mesFim) {
  let periodoAnual = historicoInflacao.filter(
    (historico) => historico.ano >= anoInicio && historico.ano <= anoFim
  );

  let retirarPeriodo = periodoAnual.filter(
    (periodo) => periodo.ano == anoInicio && periodo.mes < mesInicio
  );

  periodoAnual.forEach((periodo) => {
    if (periodo.ano == anoFim && periodo.mes > mesFim)
      retirarPeriodo.push(periodo);
  });

  let periodoCompleto = periodoAnual.filter(
    (periodo) => retirarPeriodo.indexOf(periodo) == -1
  );

  return periodoCompleto;
}

function returnIPCA(valor, ipca) {
  return 1 + ipca / valor;
}

function getValueMonth(mes) {
  switch (mes.toLowerCase()) {
    case "jan":
      return 1;
    case "fev":
      return 2;
    case "mar":
      return 3;
    case "abr":
      return 4;
    case "mai":
      return 5;
    case "jun":
      return 6;
    case "jul":
      return 7;
    case "ago":
      return 8;
    case "set":
      return 9;
    case "out":
      return 10;
    case "nov":
      return 11;
    case "dez":
      return 12;
    default:
      return 0;
  }
}
