const cheerio = require('cheerio');
const axios = require('axios');

class CrawlUtils {
    
    // retrieves all links on a page as absolute links
    async scrapePageAsync(url, keyword) {
        console.log("SCRAPING: " + url);
        try {
            let startTime = new Date();
            const response = await axios({ url: url, timeout: 3000 });
            let links = [];
            let keywordFound;
            if (response.data) {
                if (keyword) {
                    keywordFound = this.searchKeyword(response.data, keyword);
                }
                links = this.parseLinks(response.data, url);
            }
            console.log("* " + "REQUEST AND PARSE (" + url + ") DONE IN: " + (new Date() - startTime) + "ms")
            return {
                linksOnPage: links,
                keywordFound: keywordFound
            };
        }
        catch (e) {
            return null;
        }
    }

    parseLinks(html, url) {
        let links = [];
        const $ = cheerio.load(html, { decodeEntities: false });
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

    searchKeyword(html, keyword) {
        const $ = cheerio.load(html);
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