//Desenvolvedor tedzinho
// 559984814822
 
const fs = require('fs');
const { exec } = require('child_process');

function salvarImagem(buffer, path) {
  fs.writeFileSync(path, buffer);
}

function converterPngParaWebp(inputPng, outputWebp) {
  return new Promise((resolve, reject) => {
    exec(`ffmpeg -i ${inputPng} -vcodec libwebp -lossless 1 -loop 0 -preset default -an -vsync 0 -s 1024:576 ${outputWebp}`, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

function criarExif(path, packName, publisher) {
  const metadata = { "sticker-pack-name": packName, "sticker-pack-publisher": publisher };
  const exifAttr = Buffer.from([0x49,0x49,0x2A,0x00,0x08,0x00,0x00,0x00,0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,0x00,0x00,0x16,0x00,0x00,0x00]);
  const jsonBuff = Buffer.from(JSON.stringify(metadata));
  exifAttr.writeUIntLE(jsonBuff.length, 14, 4);
  fs.writeFileSync(path, Buffer.concat([exifAttr, jsonBuff]));
}

function adicionarExifWebp(exifPath, webpPath) {
  return new Promise((resolve, reject) => {
    exec(`webpmux -set exif ${exifPath} ${webpPath} -o ${webpPath}`, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

function limparArquivos(...files) {
  files.forEach(f => { if(fs.existsSync(f)) fs.unlinkSync(f); });
}

async function enviarSticker(buffer, from, client, packName, publisher, quoted=null) {
  const id = Date.now();
  const png = `./temp_${id}.png`;
  const webp = `./temp_${id}.webp`;
  const exif = `./temp_${id}.exif`;

  try {
    salvarImagem(buffer, png);
    await converterPngParaWebp(png, webp);
    limparArquivos(png);
    criarExif(exif, packName, publisher);
    await adicionarExifWebp(exif, webp);
    await client.sendMessage(from, { sticker: fs.readFileSync(webp) }, { quoted });
  } finally {
    limparArquivos(exif, webp);
  }
}

module.exports = { enviarSticker };