const fs = require('fs');

const frasesEngracadas = [
  "🤖 Anti-bot ativado. Alvo identificado e bloqueado.",
  "🛑 Botzinho de rodoviária detectado. Próxima parada: o ban!",
  "🗑️ Esse bot veio direto da lixeira do Windows 95.",
  "🚫 Bot com alma de spam bloqueado com sucesso.",
  "🔌 Bot sem tomada. Vai desligar no susto!",
  "🧠 Inteligência artificial? Isso aí é burrice automatizada.",
  "💀 Esse bot é mais inútil que antivírus vencido.",
  "🧽 Faxina digital em andamento: bot removido com desonra.",
  "👢 Bot chutado sem nem dizer tchau.",
  "🔒 Tentou invadir, mas esqueceu que aqui tem cadeado de verdade.",
  "🐍 Bot rastejante detectado. Mata na chinelada virtual.",
  "💣 Bot eliminado com precisão cirúrgica e ironia.",
  "📛 Esse bot não serve nem pra spam de farmácia.",
  "📴 Desligando bot. Motivo: vergonha alheia demais.",
  "🧯 Apaga esse bot antes que contamine o grupo.",
  "🕳️ Bot jogado no buraco do esquecimento digital.",
  "🥴 Bot tão fake que até a mentira ficou constrangida.",
  "🛠️ Bot montado com peça de impressora velha.",
  "🚿 Banho de firewall nesse bot fedorento.",
  "🎭 Disfarce de humano: nota 2/10. Bot óbvio demais.",
  "🧬 DNA de bot detectado: gene 100% spammer.",
  "🦠 Bot com vírus social. Quarentena instantânea.",
  "💩 Esse bot fede a código mal feito e intenção ruim.",
  "👽 Esse bot veio do espaço... mas sem atualização.",
  "🎮 Bot de fase 1 querendo entrar no chefão. Que dó.",
  "📼 Bot retrô? Parece ter saído direto de um disquete!",
  "🐸 Esse bot coaxou alto demais. Ban nele.",
  "📡 Sinal do bot fraco. Nem o Wi-Fi quer se conectar.",
  "🧊 Bot congelado por falta de graça e carisma.",
  "💤 Bot dormindo no ponto. Foi banido enquanto sonhava.",
  "🎯 Bot mirou no grupo e acertou o limbo.",
  "🧨 Explosão de vergonha: bot auto-destruiu de tanto cringe.",
  "📬 Bot entregando spam desde 2007.",
  "🥷 Bot ninja... mas sem talento e sem stealth.",
  "🔎 Investigamos o bot e só achamos decepção.",
  "🐢 Bot lento, fraco, sem propósito. Adeus.",
  "🔧 Bot quebrado tentando se passar por gente. Risos.",
  "🧟‍♂️ Bot zumbi do WhatsApp. Aqui não tem cérebro pra você.",
  "📉 Utilidade do bot: abaixo de zero. Banimento merecido.",
  "🧱 Bot bateu na parede do bom senso e quebrou a cara."
];

if (!global.botDetectionCache) {
  global.botDetectionCache = new Map();
}

const comandosNegros = ['crash', 'spam', 'nuke', 'lag', 'bug', 'exploit', 'attack', 'ddos'];

function tipoDispositivo(messageId) {
  if (!messageId) return 'desconhecido';
  const tipoId = messageId.length;

  return tipoId === 32 ? 'Android'
       : tipoId === 20 ? 'iPhone'
       : tipoId === 22 ? 'WhatsApp Web (bot)'
       : tipoId === 16 ? 'Baileys (Bot)'
       : tipoId === 18 ? 'WhatsApp Desktop (bot)'
       : 'Desconhecido';
}

function contemComandoNegro(texto) {
  if (!texto) return false;
  const palavras = texto.toLowerCase().split(/\s+/);
  return comandosNegros.some(cmd => palavras.includes(cmd));
}

async function verificarBots(info, from, sender, isGroup, isAntibot, isAdminFunc, tednexmart, fs, selo, donoBot) {
  if (!isGroup || !info.message || !isAntibot) return;

  const messageId = info.key.id;
  const texto = info.message.conversation 
              || info.message.extendedTextMessage?.text 
              || info.message.imageMessage?.caption 
              || '';

  const dispositivo = tipoDispositivo(messageId);
  const isComandoNegro = contemComandoNegro(texto);

  const tipoId = messageId.length;
  const suspeitoBot = (tipoId === 16 || tipoId === 18 || tipoId === 22) || isComandoNegro;

  if (!suspeitoBot) return;

  const cacheKey = `${from}_${sender}`;
  if (global.botDetectionCache.has(cacheKey)) return;
  global.botDetectionCache.set(cacheKey, true);
  setTimeout(() => global.botDetectionCache.delete(cacheKey), 60000);

  const isUserAdmin = await isAdminFunc(from, sender);
  const ehDono = sender === donoBot;

  // Se for dono ou admin, simplesmente não faz nada
  if (ehDono || isUserAdmin) {
    return;
  }

  try {
    if (Math.random() < 0.3) {
      const frase = frasesEngracadas[Math.floor(Math.random() * frasesEngracadas.length)];
      await tednexmart.sendMessage(from, { text: frase });
    }

    await tednexmart.sendMessage(from, {
      text: `🚨 @${sender.split('@')[0]} foi identificado como *bot ou spammer*. Executando remoção!`,
      mentions: [sender]
    });

    const audioPath = "/home/container/database/audios/fake.mp3";
    if (fs.existsSync(audioPath)) {
      const audio = fs.readFileSync(audioPath);
      await tednexmart.sendMessage(from, {
        audio,
        mimetype: 'audio/mpeg',
        ptt: true
      }, { quoted: selo });
    }

    await new Promise(resolve => setTimeout(resolve, 1500));
    await tednexmart.groupParticipantsUpdate(from, [sender], 'remove');

  } catch (err) {
    // Erros silenciosamente ignorados
  }
}

module.exports = { verificarBots };