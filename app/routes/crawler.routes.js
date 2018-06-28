module.exports = (app) => {
    const crawlerController = require('../controllers/crawler.controller.js');
    app.get('/', crawlerController.defaultGet);
    app.post('/crawl', crawlerController.crawl);
}