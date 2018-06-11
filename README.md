# Web-Crawler-API
Web API for OSU CS 467 Web Crawler Visualization group project. My primary responsibility was the webcrawler itself and the back-end API.

Live Demo: https://crawlerapp20180611014013.azurewebsites.net/  
App (ASP.NET Core 2) Repo: https://github.com/rodartebc/Web-Crawler-App

This web crawler was built with ASP.NET Core 2, Node, and Express. To use it, simply visit the URL. To request a web crawl, the following parameters should be provided:  

Start URL: URL of page to start crawl on (e.g. google.com or https://github.com)

Keyword: A string keyword to scan for. If found, crawl will immediately return and report its location

Crawl Method: Depth-First (result is a chain) or Breadth-First (result is a sprawling tree).

Limit: If DF this is number of max number of links in the chain, if BF this is the max depth of the tree.
