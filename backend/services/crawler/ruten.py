"""
Ruten Crawler - 露天拍賣爬蟲 (簡化版)
"""
import time
from typing import List, Optional
from loguru import logger

from .base import BaseCrawler, ProductListing, CrawlerResult


class RutenCrawler(BaseCrawler):
    """露天拍賣爬蟲"""

    def __init__(self, **kwargs):
        super().__init__(
            platform_name='ruten',
            base_url='https://www.ruten.com.tw',
            **kwargs
        )

    async def search(
        self,
        keyword: str,
        max_pages: int = 5,
        max_results: int = 100
    ) -> CrawlerResult:
        """搜尋露天商品 - 模擬結果"""
        start_time = time.time()
        listings = []
        errors = []

        logger.info(f"Ruten search for: {keyword}")

        for i in range(min(10, max_results)):
            listings.append(ProductListing(
                id=f"ruten_{keyword}_{i}",
                platform='ruten',
                title=f"[露天] {keyword} 商品 {i+1}",
                url=f"https://www.ruten.com.tw/find/?q={keyword}",
                thumbnail_url="https://www.ruten.com.tw/placeholder.jpg",
                price=80 + i * 40,
                seller_name="露天賣家",
                sales_count=i * 5,
                location="台灣"
            ))

        duration_ms = int((time.time() - start_time) * 1000)

        return CrawlerResult(
            platform='ruten',
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
