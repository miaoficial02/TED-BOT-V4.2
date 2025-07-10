// baixarApp.js
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

module.exports = async function baixarApp(q, from, sasah, tednexmart, reagir, prefix, API_KEY_TED) {
  try {
    if (!q) {
      await tednexmart.sendMessage(from, { 
        text: `❌ *Ops, você errou o comando!*\n\n✅ Tente assim:\n\n*${prefix}baixarapp nome do app*` 
      }, { quoted: sasah });
      return;
    }

    setTimeout(() => { reagir(from, "🔄") }, 300);

    const searchQuery = encodeURIComponent(q);
    const url = `https://tedzinho.online/api/search/an1?apikey=${API_KEY_TED}&name=${searchQuery}`;
    const response = await axios.get(url);
    const data = response.data;

    if (!data || !data.resultado || data.resultado.length === 0) {
      await tednexmart.sendMessage(from, { text: "❌ Nenhum resultado encontrado." }, { quoted: sasah });
      reagir(from, "❌");
      return;
    }

    const resultado = data.resultado[0];
    const pageUrl = resultado.downloadUrl;
    const pageResponse = await axios.get(pageUrl);
    const $ = cheerio.load(pageResponse.data);
    const apkLink = $('#pre_download').attr('href');

    if (!apkLink) {
      await tednexmart.sendMessage(from, { text: "❌ Não consegui encontrar o link do APK na página." }, { quoted: sasah });
      reagir(from, "❌");
      return;
    }

    setTimeout(() => { reagir(from, "⚙️") }, 300);

    const fileName = `${resultado.name.replace(/[^\w\s]/gi, '')}.apk`;
    const filePath = path.join(__dirname, fileName);
    const apkResponse = await axios.get(apkLink, { responseType: 'arraybuffer' });

    fs.writeFileSync(filePath, apkResponse.data);

    await tednexmart.sendMessage(from, {
      image: { url: resultado.thumbnail },
      caption:
`🧠 *Nome:* ${resultado.name}
👨‍💻 *Developer:* ${resultado.developer}
⭐ *Rating:* ${resultado.rating} (${resultado.ratingCount} avaliações)
📦 *Tamanho:* ${resultado.size}
🔢 *Versão:* ${resultado.version}
📱 *Android:* ${resultado.os}
⬇️ *Instalações:* ${resultado.installs}
💰 *Preço:* ${resultado.price}
🗓️ *Atualizado:* ${resultado.updated}

🌐 *Link da Página:* ${resultado.link}`,
      mimetype: 'image/jpeg'
    }, { quoted: sasah });

    await tednexmart.sendMessage(from, {
      document: fs.readFileSync(filePath),
      mimetype: 'application/vnd.android.package-archive',
      fileName: fileName,
      caption: `✅ *${resultado.name}* enviado com sucesso!`
    }, { quoted: sasah });

    reagir(from, "✅");
    fs.unlinkSync(filePath);

  } catch (error) {
    console.log(error);
    reagir(from, "❌");
    await tednexmart.sendMessage(from, { text: "❌ Ocorreu um erro ao tentar baixar o aplicativo." }, { quoted: sasah });
  }
};