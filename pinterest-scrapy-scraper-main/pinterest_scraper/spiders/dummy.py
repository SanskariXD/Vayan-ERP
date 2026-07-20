import scrapy

class DummySpider(scrapy.Spider):
    name = "dummy"
    
    def start_requests(self):
        self.logger.info("DUMMY START REQUESTS CALLED")
        yield scrapy.Request("https://example.com", dont_filter=True)
        
    def parse(self, response):
        self.logger.info("DUMMY PARSE CALLED")
        yield {"title": "dummy"}
