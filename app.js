const axios = require('axios');
const contentURL = 'https://an-26.com/eng/index.php';
const templateURL = 'https://an-26.com/eng/';
const cheerio = require('cheerio');
const fs = require('fs');
const pdfShift = require('pdfshift')('6ffbf70e85924ad7a54896a1abcc12da');
let linksArray = [];

const mainViewPath = 'body > table > tbody > tr > td> table > tbody > tr > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > table:nth-child(8)';
const annexesPath = 'body > table > tbody > tr > td> table > tbody > tr > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > table:nth-child(10)'

// TODO Скачать списки Приложений

axios.get(contentURL, {responseType: "arraybuffer"})
    .then((response) => {
        const decodedResponse = new TextDecoder('windows-1251').decode(response.data);
        let $ = cheerio.load(decodedResponse);
        const mainViewElement = $(mainViewPath).html();
        //const annexesViewElement = $(annexesPath).html();

        $ = cheerio.load(mainViewElement); // $ - основное содержание
        //$ = cheerio.load(annexesViewElement); // $ - приложения
        //fs.writeFileSync('./response.txt', $.html());

        /**
         * Заполнение массива ссылками на статьи
         */
        for(let i = 0; i < 149; i++) {
            linksArray.push($('a')[i]);
        }

        /*for(let i = 0; i < 17; i++) {
            linksArray.push($('a')[i]);
        }*/

        //console.log($('a').length)

        getPDFpage();
    })
    .catch(function(err){
        console.error(err)
    });

function getPDFpage() {
    console.log('Creating...')
    linksArray.forEach((link, index) => {
        setTimeout(() => {
            getPdfApi(link, index);
        }, 5000 * (index + 1));
    })
}

function getPdfApi(link, index) {
    pdfShift.convert(templateURL + link.attribs.href, {
            sandbox: true,
            disable_links: true,
            margin: {
                top: 0,
                right: 0,
                left: 0,
                bottom: 0
            },
            zoom: 1.2
        })
        .then((binaryResponse) => {
            fs.writeFile(`./config/${index + 1}. ${link.children[0].data}.pdf`, binaryResponse, {encoding: "binary"}, () => {
                console.log(`File \"${index + 1}. ${link.children[0].data}.pdf\" was created!`);
            })
        })
        .catch((error) => {
            console.error(error);
        })
}
