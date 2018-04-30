const cheerio = require('cheerio');
const axios = require('axios');

class WebCrawler {
    async BFSCrawlAsync(crawlParams) {
        return "BFSCrawlAsync not implemented";
    }

    /* Scrapes links from start page, picks a link at random to visit (and add to result). Repeats this process 
    ** until page limit, time limit, or error limit is reached.
    */
    async DFSCrawlAsync(crawlParams) {
        let crawlResult = [crawlParams.start];
        let errorCount = 0;
        let maxTimeElapsed = false;
        
        const requestTimer = setTimeout(() => { 
            maxTimeElapsed = true 
        }, crawlParams.maxSeconds * 1000); // *1000 because setTimeout uses ms

        while (crawlResult.length < crawlParams.limit && errorCount < crawlParams.limit * 2 && !maxTimeElapsed) {
            try {
                const linksOnCurrentPage = await this.scrapePageAsync(crawlResult[crawlResult.length - 1]);
                if (!linksOnCurrentPage || linksOnCurrentPage.length === 0) {
                    // 404 or page had no links
                    crawlResult.pop();
                    errorCount++;
                    continue;
                }
                let linkToAdd = linksOnCurrentPage[Math.floor(Math.random() * linksOnCurrentPage.length)];
                // ensure no duplicates added to result
                while (crawlResult.includes(linkToAdd)) {
                    errorCount++;
                    linkToAdd = linksOnCurrentPage[Math.floor(Math.random() * linksOnCurrentPage.length)]
                }
                crawlResult.push(linkToAdd);
            }
            catch (error) {
                errorCount++;
                continue;
            }
        }
        return crawlResult;
    }

    // retrieves all links on a page as absolute links
    async scrapePageAsync(url) {
        try {
            const response = await axios.get(url);
            let links = [];
            if (response.data) {
                links = this.parseLinks(response.data, url);
            }
            return links;
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

    makeRelativeLinkAbsolute(currentURL, relativePath) {
        return this.extractRootUrl(currentURL) + relativePath;
    }

    extractRootUrl(url) {
        return url.toString().replace(/^(.*\/\/[^\/?#]*).*$/, "$1");
    }
}

module.exports = WebCrawler;