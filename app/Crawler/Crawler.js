const cheerio = require('cheerio');
const axios = require('axios');
const CrawlUtils = require('./CrawlUtils.js');

crawlUtils = new CrawlUtils();

class WebCrawler {
    /* Scrapes links from start page, picks a link at random to visit (and add to result). Repeats this process 
    ** until page limit, time limit, or error limit is reached.
    */
    async CrawlAsync(crawlParams) {
        let currentPage = {
            name: crawlParams.start,
            url: crawlParams.start,
            parent: null
        };

        let crawlResults = {
            pages: currentPage,
            keyword: crawlParams.keyword,
            keywordFound: false,
            keywordLocation: null
        };

        // declaring timeout flag in obj so JS passes it by reference
        let maxTimeElapsed = {
            timeElapsed: false
        };

        let visitedPages = [];

        // timeout is maxSeconds * 1000 because setTimeout takes ms
        setTimeout(() => {
            console.log("CRAWLER: MAX TIME ELAPSED");
            maxTimeElapsed.timeElapsed = true;
        }, crawlParams.maxSeconds * 1000);

        await this.CrawlRecurseAsync(currentPage, crawlResults, 0, crawlParams.limit, visitedPages, maxTimeElapsed, crawlParams.keyword, crawlParams.method);

        return crawlResults;
    }

    async CrawlRecurseAsync(currentPage, crawlResults, currentDepth, maxDepth, visitedPages, maxTimeElapsed, keyword, crawlMethod) {
        if (currentDepth === maxDepth || maxTimeElapsed.timeElapsed) {
            return;
        }

        // scrape current page and populate its info
        const scrapeResult = await crawlUtils.scrapePageAsync(currentPage.url, keyword);

        if (scrapeResult) {
            visitedPages.push(currentPage.url);
            currentPage.name = scrapeResult.name;

            // return early if keyword is on current page
            if (scrapeResult.keywordFound) {
                crawlResults.keywordFound = true;
                crawlResults.keywordLocation = currentPage.url;
                return;
            }

            // filter out visited links from scraped links
            const unseenLinks = scrapeResult.linksOnPage.filter(link => { return !visitedPages.includes(link) });

            // BFS CRAWL
            if (crawlMethod === 'BFS') {
                // add children to currentPage
                const transformedLinks = unseenLinks.map(link => {
                    return { name: link, url: link, parent: currentPage.name }
                });
                currentPage.children = transformedLinks;

                // recurse for each child of currentPage
                for (let child of currentPage.children) {
                    await this.CrawlRecurseAsync(child, crawlResults, currentDepth + 1, maxDepth, visitedPages, maxTimeElapsed, keyword, crawlMethod);
                }
            }
            // DFS CRAWL
            else if (crawlMethod === 'DFS') {
                // add a randomly selected link as a child of currentPage
                const randomLink = unseenLinks[Math.floor(Math.random() * unseenLinks.length)];
                currentPage.children = [{
                    name: randomLink,
                    url: randomLink,
                    parent: currentPage.name,
                }];

                await this.CrawlRecurseAsync(currentPage.children[0], crawlResults, currentDepth + 1, maxDepth, visitedPages, maxTimeElapsed, keyword, crawlMethod);
            }
        }
        return;
    }
}

module.exports = WebCrawler;