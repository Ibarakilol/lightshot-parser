const fs = require('fs')
const path = require('path')
const axios = require('axios')
const cheerio = require('cheerio')

const headers = {
  'Accept-language': 'en',
  'User-Agent': 'Mozilla/5.0 (iPad; U; CPU OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B334b Safari/531.21.102011-10-16 20:23:10'
}

const randString = (length) => {
  const pattern = 'abcdefghijklmnopqrstuvwxyz1234567890'

  let resultString = ''
  for (let i = 0; i < length; i++) {
    resultString += pattern.split('')[Math.floor(Math.random() * pattern.split('').length)]
  }

  return resultString
}

const parseImage = async () => {
  try {
    const randomString = randString(5)
    const { data } = await axios.get(`https://prnt.sc/m${randomString}`, { headers })
    const $ = cheerio.load(data)
    let imageLink = $('meta[name="twitter:image:src"]').attr('content')
    imageLink = imageLink.replace('//st.prntscr', 'https://st.prntscr')

    if (imageLink === 'https://st.prntscr.com/2022/05/15/0209/img/0_173a7b_211be8ff.png') {
      console.log(`По адресу https://prntscr.com/m${randomString} нет картинки`)
      return false
    }
    if (imageLink.length > 1) {
      const imageName = imageLink.split('/')[imageLink.split('/').length - 1]
      return { imageLink, imageName }
    } else {
      console.log(`По адресу https://prntscr.com/m${randomString} нет картинки`)
      return false
    }
  } catch(e) {
    console.log(e)
  }
}

const downloadImage = async (imageLink, imageName) => {
  const imagePath = path.resolve(__dirname, 'lightshot_images', imageName)
  const writer = fs.createWriteStream(imagePath)

  const response = await axios({
    url: imageLink,
    method: 'GET',
    responseType: 'stream'
  })

  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}

const main = async (total) => {
  if (!fs.existsSync('./lightshot_images')) {
    fs.mkdirSync('./lightshot_images')
  }

  for (let i = 1; i <= total; i++) {
    console.log(`Загрузка №${i}`)
    const parseResult = await parseImage()
    if (parseResult) {
      const { imageLink, imageName } = parseResult
      console.log(`Сохранение - ${imageName}, скачиваем с ${imageLink}`)
      await downloadImage(imageLink, imageName)
    }
  }
}

main(10)
