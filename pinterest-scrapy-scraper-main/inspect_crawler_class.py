import scrapy
from scrapy.crawler import Crawler
from scrapy.utils.project import get_project_settings
from pinterest_scraper.spiders.handloom_search import HandloomSearchSpider
from twisted.internet import defer, reactor

def inspect_crawl():
    settings = get_project_settings()
    settings.set('TWISTED_REACTOR', 'twisted.internet.selectreactor.SelectReactor')
    
    crawler = Crawler(HandloomSearchSpider, settings)
    
    # We will hook Crawler._create_engine to capture the engine instance
    original_create_engine = crawler._create_engine
    
    def hooked_create_engine():
        engine = original_create_engine()
        print("\n=== Engine created ===", flush=True)
        print("Engine class:", engine.__class__, flush=True)
        
        # Now hook open_spider on this specific engine instance
        original_open_spider = engine.open_spider
        
        def hooked_open_spider(spider, start_requests=(), close_if_idle=True):
            print("\n=== engine.open_spider called ===", flush=True)
            print("Spider:", spider, flush=True)
            start_reqs_list = list(start_requests)
            print(f"Number of start requests: {len(start_reqs_list)}", flush=True)
            for i, r in enumerate(start_reqs_list):
                print(f"  Req {i}: URL={r.url}", flush=True)
            return original_open_spider(spider, start_reqs_list, close_if_idle)
            
        engine.open_spider = hooked_open_spider
        return engine
        
    crawler._create_engine = hooked_create_engine
    
    d = crawler.crawl(mode="full")
    
    def done(res):
        print("Crawl completed. Result:", res, flush=True)
        reactor.stop()
        
    d.addBoth(done)
    reactor.run()

if __name__ == "__main__":
    inspect_crawl()
