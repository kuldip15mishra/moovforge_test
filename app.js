const cheerio = require('cheerio')
const request = require('request');

const pattern = "cheerio"
const findresult = [];
const crawllinks = [];
const url = 'https://www.npmjs.com/package/cheerio'

function loadwebsite(pageLink) {
    request({
        method: 'GET',
        url: pageLink
    }, (err, res, body) => {

        if (err) return console.error(err);
        const $ = cheerio.load(body)
        const linkObjects = $('a');

        loopEachAnchorLink(linkObjects, $);
        fetchAllLinks(crawllinks);

    });
}
async function fetchAllLinks(links) {

    var promiseArray = [];

    if (links && links.length > 0) {
        for (let i = 0; i < links.length; i++) {
            if (links[i].href && links[i].href.includes("http")) {
                 promiseArray.push(new Promise((resolve, reject) => {
                    request({
                        method: 'GET',
                        url: links[i].href
                    }, (err, res, body) => {

                        if (err) reject(err);
                         
                        const $ = cheerio.load(body)
                        const linkObjects = $('a');

                        let urlFindWithPattern = findthePatterninUrl(linkObjects, $);
                        if (urlFindWithPattern && urlFindWithPattern.length > 0) {
                            addToMainArray(urlFindWithPattern)
                        }
                        resolve(urlFindWithPattern)
                      
                    });

                 }))
            }
        
           
        }
        let result=  await  Promise.all(promiseArray)
        console.log(" Crawled ", + crawllinks.length + " pages." + "Found " + findresult.length + " pages with the term " + pattern);
        displayresult();
        
    }
}


function displayresult(){
    if(findresult && findresult.length>0)
    for(let i=0;i<findresult.length;i++){
        console.log("$ " +findresult[i].href + " =>"  + findresult[i].text);
    }
}


    function addToMainArray(data) {
     
        for (let k = 0; k < data.length; k++) {
            findresult.push(data[k]);

        }
    }
    function findthePatterninUrl(linkObjects, $) {
        let result = []
        linkObjects.each((index, element) => {
            if ($(element).text().includes(pattern)) {
                result.push({
                    text: $(element).text(), // get the text
                    href: $(element).attr('href'), // get the href attribute
                });
            }


        });
        return result;
    }
    function loopEachAnchorLink(linkObjects, $) {
        linkObjects.each((index, element) => {

            crawllinks.push({
                text: $(element).text(), // get the text
                href: $(element).attr('href'), // get the href attribute
            });


        });
    }

    loadwebsite(url);
    

