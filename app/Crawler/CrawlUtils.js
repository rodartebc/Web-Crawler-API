const cheerio = require('cheerio');
const axios = require('axios');

class CrawlUtils {
    
    // retrieves all links on a page as absolute links
    async scrapePageAsync(url, keyword) {
        console.log("SCRAPING: " + url);
        try {
            let startTime = new Date();
            const response = await axios({ url: url, timeout: 3000 });
            const $ = cheerio.load(response.data, {decodeEntities: false});
            let links = [];
            let keywordFound;
            if (response.data) {
                if (keyword) {
                    keywordFound = this.searchKeyword($, response.data, keyword);
                }
                links = this.parseLinks($, response.data, url);
            }
            console.log("* " + "REQUEST AND PARSE (" + url + ") DONE IN: " + (new Date() - startTime) + "ms")
            return {
                name: $('title').text().trim(),
                url: url,
                linksOnPage: links,
                keywordFound: keywordFound
            };
        }
        catch (e) {
            return null;
        }
    }

    async getLinkThatLoads(urls, keyword) {
        let selectedLink;
        let tryCount = 0;
        while(tryCount != urls.length){
            selectedLink = urls[Math.floor(Math.random() * urls.length)];
            let scrapeResult;
            try{
                scrapeResult = await this.scrapePageAsync(selectedLink, keyword);
                if(!scrapeResult){
                    tryCount++;
                    continue;
                }
            }
            catch (e) {
                tryCount++;
                continue;
            }
            return scrapeResult;
        }
        return null;
    }

    parseLinks($, html, url) {
        let links = [];
        $('a[href^="http"]').each((index, value) => {
            const link = $(value).attr('href');
            links.push(link);
        });
        $('a[href^="/"]').each((index, value) => {
            const link = $(value).attr('href');
            links.push(this.makeRelativeLinkAbsolute(url, link));
        });
        return links;
    }

    searchKeyword($, html, keyword) {
        const bodyText = $('html > body').text();
        if (bodyText.toLowerCase().indexOf(keyword.toLowerCase()) !== -1) {
            console.log("FOUND KEYWORD");
            return true;
        }
        return false;
    }

    makeRelativeLinkAbsolute(currentURL, relativePath) {
        return this.extractRootUrl(currentURL) + relativePath;
    }

    extractRootUrl(url) {
        return url.toString().replace(/^(.*\/\/[^\/?#]*).*$/, "$1");
    }
}

module.exports = CrawlUtils;