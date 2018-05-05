const cheerio = require('cheerio');
const axios = require('axios');
const CrawlUtils = require('./CrawlUtils.js');

crawlUtils = new CrawlUtils();

class WebCrawler {
    /* Scrapes links from start page, picks a link at random to visit (and add to result). Repeats this process 
    ** until page limit, time limit, or error limit is reached.
    */
    async DFSCrawlAsync(crawlParams) {
        let crawlResult = {
            pages: [crawlParams.start],
            keyword: crawlParams.keyword,
            keywordFound: false,
            keywordLocation: null
        };
        let errorCount = 0;
        let maxTimeElapsed = false;

        const requestTimer = setTimeout(() => {
            console.log("DFS CRAWL: MAX TIME ELAPSED")
            maxTimeElapsed = true
        }, crawlParams.maxSeconds * 1000); // *1000 because setTimeout uses ms

        while (crawlResult.pages.length < crawlParams.limit && errorCount < crawlParams.limit * 2 && !maxTimeElapsed) {
            try {
                // const scrapeResult = await this.scrapePageAsync(crawlResult.pages[crawlResult.pages.length - 1], crawlParams.keyword);
                const scrapeResult = await crawlUtils.scrapePageAsync(crawlResult.pages[crawlResult.pages.length - 1], crawlParams.keyword);
                if (!scrapeResult || scrapeResult.linksOnPage.length === 0) {
                    // error scraping page
                    console.log("- " + crawlResult.pages[crawlResult.pages.length - 1] + " HAS BEEN REMOVED FROM RESULT (404 or Timeout)");
                    crawlResult.pages.pop();
                    errorCount++;
                    continue;
                }
                if (scrapeResult.keywordFound) {
                    crawlResult.keywordFound = true;
                    crawlResult.keywordLocation = crawlResult.pages[crawlResult.pages.length - 1];
                    return crawlResult;
                }
                let linkToAdd = scrapeResult.linksOnPage[Math.floor(Math.random() * scrapeResult.linksOnPage.length)];
                // ensure no duplicates added to result
                while (crawlResult.pages.includes(linkToAdd)) {
                    errorCount++;
                    linkToAdd = scrapeResult.linksOnPage[Math.floor(Math.random() * scrapeResult.linksOnPage.length)]
                }
                crawlResult.pages.push(linkToAdd);
                console.log("+ " + linkToAdd + " HAS BEEN ADDED TO RESULTS");
            }
            catch (error) {
                console.log(error);
                errorCount++;
                continue;
            }
        }
        return crawlResult;
    }

    async BFSCrawlAsync(crawlParams){
        let crawlResults = {
            url: "https://developer.mozilla.org/en-US/",
            children: []
        }
        let maxTimeElapsed = {
            timeElapsed: false
        };
        const requestTimer = setTimeout(() => {
            console.log("BFS CRAWL: MAX TIME ELAPSED");
            maxTimeElapsed.timeElapsed = true;
        }, 10000)
        let visitedPages = [];
        const scrapeResult = await crawlUtils.scrapePageAsync("https://developer.mozilla.org/en-US/", null);
        visitedPages.push("https://developer.mozilla.org/en-US/");

        const transformedLinks = scrapeResult.linksOnPage.filter(link => {return !visitedPages.includes(link)}).map(link => {return {url: link, children: []}});
        if(scrapeResult){
            crawlResults.children = transformedLinks;
        }
        await this.BFSRecurse(crawlResults.children, 1, 3, visitedPages, maxTimeElapsed);
        return crawlResults;
    }

    async BFSRecurse(pages, currentDepth, maxDepth, visitedPages, maxTimeElapsed) {
        if(currentDepth === maxDepth || pages.legnth == 0){
            return;
        }

        for(let page of pages){
            if(maxTimeElapsed.timeElapsed){
                return;
            }
            // console.log(page);
            let transformedLinks = [];
            try{
                const scrapeResult = await crawlUtils.scrapePageAsync(page.url, null);
                visitedPages.push(page.url);
                if(scrapeResult && scrapeResult.linksOnPage.length > 0){
                    transformedLinks = scrapeResult.linksOnPage.filter(link => {return !visitedPages.includes(link)}).map(link => {return {url: link, children: []}});
                } 
            }
            catch (error) {
                console.log(error);
                continue;
            }
            page.children = transformedLinks;
            await this.BFSRecurse(page.children, currentDepth + 1, maxDepth, visitedPages, maxTimeElapsed);
        }
        return;
    }
}

module.exports = WebCrawler;