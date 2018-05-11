const cheerio = require('cheerio');
const axios = require('axios');
const CrawlUtils = require('./CrawlUtils.js');

crawlUtils = new CrawlUtils();

class WebCrawler {
    /* Scrapes links from start page, picks a link at random to visit (and add to result). Repeats this process 
    ** until page limit, time limit, or error limit is reached.
    */
    async DFSCrawlAsync(crawlParams) {
        let currentPage = {
            name: null, 
            url: crawlParams.start,
            parent: null,
            children: []
        };
        let crawlResults = {
            pages: currentPage,
            keyword: crawlParams.keyword,
            keywordFound: false,
            keywordLocation: null
        };

        let maxTimeElapsed = {
            timeElapsed: false
        };

        const requestTimer = setTimeout(() => {
            console.log("DFS CRAWL: MAX TIME ELAPSED");
            maxTimeElapsed.timeElapsed = true;
        }, crawlParams.maxSeconds * 1000)

        let visitedPages = [];
        const scrapeResult = await crawlUtils.scrapePageAsync(crawlParams.start, crawlParams.keyword);
        if(!scrapeResult){
            return {error: "Start URL was not valid"};
        }
        if(scrapeResult.keywordFound){
            crawlResults.keywordFound = true;
            crawlResults.keywordLocation = scrapeResult.url;
            return crawlResults;
        }
        currentPage.name = scrapeResult.name;
        visitedPages.push(crawlParams.start);
        let unvisitedLinks = scrapeResult.linksOnPage.filter(link => {return !visitedPages.includes(link)});
        let nextPage = await crawlUtils.getLinkThatLoads(unvisitedLinks, crawlParams.keyword);
        currentPage.children.push({
            name: nextPage.name,
            parent: currentPage.name,
            url: nextPage.url,
            children: nextPage.linksOnPage.filter(link => {return !visitedPages.includes(link)})
        });
        if(nextPage.keywordFound){
            crawlResults.keywordFound = true;
            crawlResults.keywordLocation = nextPage.url;
            return crawlResults;
        }
        await this.DFSRecurse(currentPage.children[0], currentPage.name, crawlResults, 1, crawlParams.limit, visitedPages, maxTimeElapsed, crawlParams.keyword);
        return crawlResults;
    }

    async DFSRecurse(currentPage, parentName, crawlResults, currentDepth, maxDepth, visitedPages, maxTimeElapsed, keyword){
        if(currentDepth === maxDepth) {
            delete currentPage.children;
            return;
        }
        else if (maxTimeElapsed.timeElapsed){
            console.log("DFS CRAWL: MAX TIME ELAPSED");
            delete currentPage.children;
            return;
        }
        let nextPage = await crawlUtils.getLinkThatLoads(currentPage.children, keyword);
        currentPage.children = [{
            name: nextPage.name,
            parent: currentPage.name,
            url: nextPage.url,
            children: nextPage.linksOnPage.filter(link => {return !visitedPages.includes(link)})
        }];
        if(nextPage.keywordFound){
            crawlResults.keywordFound = true;
            crawlResults.keywordLocation = nextPage.url;
            delete currentPage.children;
            return 
        }

        await this.DFSRecurse(currentPage.children[0], currentPage.name, crawlResults, currentDepth + 1, maxDepth, visitedPages, maxTimeElapsed, keyword);
        return;  
    }

    async BFSCrawlAsync(crawlParams) {
        let crawlResults = {
            name: crawlParams.start,
            url: crawlParams.start,
            parent: null,
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
        const scrapeResult = await crawlUtils.scrapePageAsync(crawlParams.start, null);
        visitedPages.push(crawlParams.start);

        const transformedLinks = scrapeResult.linksOnPage.filter(link => { return !visitedPages.includes(link) }).map(link => { return { name: "unvisited", url: link, parent: scrapeResult.name, children: [] } });
        if (scrapeResult) {
            crawlResults.name = scrapeResult.name;
            crawlResults.children = transformedLinks;
        }
        await this.BFSRecurse(scrapeResult.name, crawlResults.children, 1, crawlParams.limit, visitedPages, maxTimeElapsed);
        return crawlResults;
    }

    async BFSRecurse(parentName, pages, currentDepth, maxDepth, visitedPages, maxTimeElapsed) {
        if (currentDepth === maxDepth || pages.legnth == 0) {
            return;
        }

        for (let page of pages) {
            if (maxTimeElapsed.timeElapsed) {
                return;
            }
            // console.log(page);
            let transformedLinks = [];
            let scrapeResult;
            try {
                scrapeResult = await crawlUtils.scrapePageAsync(page.url, null);
                page.name = scrapeResult.name;
                visitedPages.push(page.url);
                if (scrapeResult && scrapeResult.linksOnPage.length > 0) {
                    transformedLinks = scrapeResult.linksOnPage.filter(link => { return !visitedPages.includes(link) }).map(link => { return { name: "unvisited", url: link, parent: page.name, children: [] } });
                }
            }
            catch (error) {
                console.log(error);
                continue;
            }
            page.children = transformedLinks;
            let pageName = scrapeResult.name ? scrapeResult.name : page.url;
            await this.BFSRecurse(pageName, page.children, currentDepth + 1, maxDepth, visitedPages, maxTimeElapsed);
        }
        return;
    }
}

module.exports = WebCrawler;