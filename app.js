const axios = require('axios');
const contentURL = 'https://an-26.com/eng/index.php';
const templateURL = 'https://an-26.com/eng/';
const cheerio = require('cheerio');
const fs = require('fs');
const pdfShift = require('pdfshift')('6ffbf70e85924ad7a54896a1abcc12da');
let linksArray = [];

const mainViewPath = 'body > table > tbody > tr > td> table > tbody > tr > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > table:nth-child(8)';
const annexesPath = 'body > table > tbody > tr > td> table > tbody > tr > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > table:nth-child(10)'

const pdfShiftConfig = {
    sandbox: true,
    disable_links: true,
    margin: {
        top: 0,
        right: 0,
        left: 0,
        bottom: 0
    },
    zoom: 1.2
}

axios.get(contentURL, {responseType: "arraybuffer"})
    .then((response) => {
        const decodedResponse = new TextDecoder('windows-1251').decode(response.data);
        let $ = cheerio.load(decodedResponse);

        //$ = cheerio.load($(mainViewPath).html()); // $ - основное содержание
        $ = cheerio.load($(annexesPath).html()); // $ - приложения
        fs.writeFileSync('./response.txt', $.html());

        /**
         * Заполнение массива ссылками на статьи
         */
        /*for(let i = 0; i < 149; i++) {
            linksArray.push($('a')[i]);
        }*/

        for(let i = 0; i < 17; i++) {
            linksArray.push($('a')[i]);
        }

        console.log(linksArray[1].attribs.href);
        console.log(linksArray[1].children[0].data);
        //getPDFpageEmit();
    })
    .catch(function(err){
        console.error(err)
    });

function getPDFpageEmit() {
    console.log('Creating...')
    linksArray.forEach((link, index) => {
        setTimeout(() => {
            getPdfApi(link, index);
        }, 5000 * (index + 1));
    })
}

function getPdfApi(link, index) {
    pdfShift.convert(templateURL + link.attribs.href, pdfShiftConfig)
        .then((binaryResponse) => {
            fs.writeFile(`./config/${index + 1}. ${link.children[0].data}.pdf`, binaryResponse, {encoding: "binary"}, () => {
                console.log(`File \"${index + 1}. ${link.children[0].data}.pdf\" was created!`);
            })
        })
        .catch((error) => {
            console.error(error);
        })
}
