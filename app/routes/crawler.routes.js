module.exports = (app) => {
    const testController = require('../controllers/crawler.controller.js');
    app.get('/', testController.defaultGet);
    app.post('/crawl', testController.crawl);
}