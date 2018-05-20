const crawler = require ('../Crawler/Crawler.js');
const webCrawler = new crawler();

// default route returns test crawl to blizzard.com
exports.defaultGet = async (req, res) => {
    const crawlParams = {
        'start': 'https://www.blizzard.com/en-us/',
        'method': 'DFS',
        'limit': 20,
        'maxSeconds': 5,
        'keyword': null
    };
    try {
        console.log("Crawl in progress: \n", crawlParams);
        const links = await webCrawler.CrawlAsync(crawlParams);
        console.log("Crawl complete");
        links.notes = "This is a test request made with default parameters. To make requests with specified parameters POST to /crawl";
        res.send(links);
    }
    catch (error) {
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
        'limit': parseInt(req.body.limit),
        'maxSeconds': req.body.maxSeconds ? parseInt(req.body.maxSeconds) : 10,
        'keyword': req.body.keyword ? req.body.keyword : null
    };
    try {
        let links;
        console.log("Crawl in progress: \n", crawlParams);
        if (crawlParams.method === "DFS") {
            links = await webCrawler.CrawlAsync(crawlParams);
        }
        else if (crawlParams.method === "BFS") {
            links = await webCrawler.CrawlAsync(crawlParams);
        }
        console.log("Crawl complete");
        res.send(links);
    }
    catch (error) {
        console.log(error);
        console.log("Crawler error");
        return error;
    }
};