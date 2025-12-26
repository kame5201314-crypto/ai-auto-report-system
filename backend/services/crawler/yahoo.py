"""
Yahoo Shopping Crawler - Yahoo 購物中心爬蟲 (簡化版)
"""
import time
from typing import List, Optional
from loguru import logger

from .base import BaseCrawler, ProductListing, CrawlerResult


class YahooCrawler(BaseCrawler):
    """Yahoo 購物中心爬蟲"""

    def __init__(self, **kwargs):
        super().__init__(
            platform_name='yahoo',
            base_url='https://tw.buy.yahoo.com',
            **kwargs
        )

    async def search(
        self,
        keyword: str,
        max_pages: int = 5,
        max_results: int = 100
    ) -> CrawlerResult:
        """搜尋 Yahoo 商品 - 模擬結果"""
        start_time = time.time()
        listings = []
        errors = []

        logger.info(f"Yahoo search for: {keyword}")

        for i in range(min(10, max_results)):
            listings.append(ProductListing(
                id=f"yahoo_{keyword}_{i}",
                platform='yahoo',
                title=f"[Yahoo] {keyword} 商品 {i+1}",
                url=f"https://tw.buy.yahoo.com/search?p={keyword}",
                thumbnail_url="https://tw.buy.yahoo.com/placeholder.jpg",
                price=120 + i * 60,
                seller_name="Yahoo購物中心",
                sales_count=i * 8,
                location="台灣"
            ))

        duration_ms = int((time.time() - start_time) * 1000)

        return CrawlerResult(
            platform='yahoo',
            keyword=keyword,
            total_found=len(listings),
            listings=listings,
            pages_scraped=1,
            duration_ms=duration_ms,
            errors=errors,
            success=True
        )

    async def get_product_details(self, product_url: str) -> Optional[ProductListing]:
        return None

    async def get_seller_products(self, seller_id: str, max_products: int = 50) -> List[ProductListing]:
        return []
