const crawler = require('../Crawler/Crawler.js');
const webCrawler = new crawler();

// default route returns test crawl to blizzard.com
exports.defaultGet = async (req, res) => {
    const crawlParams = {
        'start': 'https://www.blizzard.com/en-us/',
        'method': 'DFS',
        'limit': 10,
        'maxSeconds': 10
    };
    try {
        console.log("Crawl in progress: \n", crawlParams);
        const links = await webCrawler.DFSCrawlAsync(crawlParams);
        console.log("Crawl complete");
        res.send(links);
    }
    catch (error) {
        console.log("Crawler error");
        return error;
    }

};

// crawl w/ params from request body. 
exports.crawl = async (req, res) => {
    if (!req.body.startURL || !req.body.method || !req.body.limit) {
        return res.status(400).send({
            message: "Crawl request must contain: startURL, method, and limit"
        });
    }
    const crawlParams = {
        'start': req.body.startURL,
        'method': req.body.method,
        'limit': req.body.limit,
        'maxSeconds': req.body.maxSeconds ? req.body.maxSeconds : 10
    };
    try {
        let links;
        console.log("Crawl in progress: \n", crawlParams);
        if (crawlParams.method === "DFS") {
            links = await webCrawler.DFSCrawlAsync(crawlParams);
        }
        else if (crawlParams.method === "BFS") {
            links = await webCrawler.BFSCrawlAsync(crawlParams);
        }
        console.log("Crawl complete");
        res.send(links);
    }
    catch (error) {
        console.log("Crawler error");
        return error;
    }
};