// Index.js

const fs = require('fs');
const path = require('path');

// Função para processar a cobrança
async function processarCobrança(args, from, sasah, tednexmart, enviar, SoDono, pushname) {
  if (!SoDono) {
    return tednexmart.sendMessage(from, { text: enviar.msg.donosmt }, { quoted: sasah });
  }

  try {
    const links = {
      logocapa3: 'https://zero-two.info/uploads/images/file-1732371084754-44359918.jpeg' // Link da imagem
    };

    // Extrair argumentos
    const valor = args[0];
    const numero = args[1].replace(/[^\d]/g, '');
    const mensagem = args[2];
    const prazo = args[3];
    const cobrador = pushname || 'Um cobrador';
    const chavePix = 'jeovajmp200@gmail.com';
    const cobrancasDir = path.join(__dirname, 'cobrancas');
    const cobrancasPath = path.join(cobrancasDir, 'cobrancaspendentes.json');

    // Criar a pasta 'cobrancas' caso não exista
    if (!fs.existsSync(cobrancasDir)) {
      fs.mkdirSync(cobrancasDir);
    }

    const mensagemCobrança = `💰 *Cobrança* \n\n${cobrador} lhe está enviando uma cobrança de R$${valor}.\n\n*Mensagem do cobrador:* ${mensagem}`;
    const numeroFormatado = numero && numero.length >= 10 ? `${numero}@s.whatsapp.net` : null;

    if (!numeroFormatado) {
      return tednexmart.sendMessage(from, { text: `❌ O número fornecido (${numero}) não é válido.` }, { quoted: sasah });
    }

    // Função para calcular o prazo em milissegundos
    function calcularPrazoEmMilissegundos(prazo) {
      const regex = /(\d+)([smhd])/g;
      let totalMilliseconds = 0;
      prazo.replace(regex, (_, valor, unidade) => {
        const unidades = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
        totalMilliseconds += parseInt(valor) * (unidades[unidade] || 0);
      });
      return totalMilliseconds;
    }

    // Função para formatar a data
    function formatarData(data) {
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      const horas = String(data.getHours()).padStart(2, '0');
      const minutos = String(data.getMinutes()).padStart(2, '0');
      return `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
    }

    // Função para carregar cobranças pendentes
    function carregarCobrancasPendentes() {
      if (fs.existsSync(cobrancasPath)) {
        const data = fs.readFileSync(cobrancasPath, 'utf8');
        return JSON.parse(data);
      }
      return [];
    }

    // Função para salvar cobranças pendentes
    function salvarCobrancasPendentes(cobrancas) {
      try {
        fs.writeFileSync(cobrancasPath, JSON.stringify(cobrancas, null, 2));
      } catch (error) {
        console.error('Erro ao salvar cobranças:', error.message);
      }
    }

    // Função para remover cobrança do JSON
    function removerCobranca(cobrancaParaRemover) {
      const cobrancasPendentes = carregarCobrancasPendentes();
      const novasCobrancas = cobrancasPendentes.filter(
        c => c.numeroFormatado !== cobrancaParaRemover.numeroFormatado || c.dataAgendamento !== cobrancaParaRemover.dataAgendamento
      );
      salvarCobrancasPendentes(novasCobrancas);
    }

    // Função para agendar a cobrança
    async function agendarCobranca(cobranca) {
      const { valor, numeroFormatado, mensagemCobrança, prazo, cobrador, dataAgendamento } = cobranca;
      const timeToWait = calcularPrazoEmMilissegundos(prazo);

      setTimeout(async () => {
        try {
          await tednexmart.sendMessage(numeroFormatado, {
            image: { url: links.logocapa3 },
            caption: mensagemCobrança
          }, { quoted: sasah });
          await tednexmart.sendMessage(numeroFormatado, { text: `🔑 Aqui está sua chave Pix:\n\n*${chavePix}*` }, { quoted: sasah });
          await tednexmart.sendMessage(numeroFormatado, {
            text: `> *Nome*: 𖧄 𝐋𝐔𝐂𝐀𝐒 𝐌𝐎𝐃 𝐃𝐎𝐌𝐈𝐍𝐀 𖧄\n\n> *Descrição*: Criador Ofc TED BOT\n\n> 🌟 *O contato dele, caso você precise de ajuda:*\nhttps://wa.me/5599992241471\n\n> 🎥 *Inscreva-se no meu canal para não perder nenhuma novidade:*\nhttps://youtube.com/@ted_bot\n\n> 🌐 *Minha API:* https://tedzinho.online\n\n> 🌐 *Meu site:* https://linktr.ee/tedbox`
          }, { quoted: sasah });
          await tednexmart.sendMessage(from, { text: `✅ A cobrança de R$${valor} foi enviada para o número ${numeroFormatado}.\nMensagem: ${mensagemCobrança}` }, { quoted: sasah });
          removerCobranca(cobranca);
        } catch (error) {
          console.log(`Erro ao enviar cobrança programada: ${error.message}`);
        }
      }, timeToWait);
    }

    // Agendamento da cobrança
    const dataAgendamento = formatarData(new Date());
    const cobrancasPendentes = carregarCobrancasPendentes();
    const novaCobranca = {
      valor,
      numeroFormatado,
      mensagemCobrança,
      prazo,
      cobrador,
      dataAgendamento
    };
    cobrancasPendentes.push(novaCobranca);
    salvarCobrancasPendentes(cobrancasPendentes);
    agendarCobranca(novaCobranca);

    // Mensagem de confirmação ao solicitante
    await tednexmart.sendMessage(from, {
      text: `✅ A cobrança de R$${valor} foi agendada para o número ${numero}.\nEla será enviada após ${prazo}.\n\nData e Hora de Agendamento: ${dataAgendamento}`
    }, { quoted: sasah });

  } catch (error) {
    console.error('Erro na cobrança:', error.message);
    await tednexmart.sendMessage(from, { text: '❌ Ocorreu um erro ao agendar a cobrança. Por favor, tente novamente.' }, { quoted: sasah });
  }
}

module.exports = { processarCobrança };