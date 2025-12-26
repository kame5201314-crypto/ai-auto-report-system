"""
Shopee Crawler - 蝦皮購物爬蟲 (簡化版)
"""
import time
from typing import List, Optional
from loguru import logger

from .base import BaseCrawler, ProductListing, CrawlerResult


class ShopeeCrawler(BaseCrawler):
    """蝦皮購物爬蟲 - 使用 API"""

    def __init__(self, **kwargs):
        super().__init__(
            platform_name='shopee',
            base_url='https://shopee.tw',
            **kwargs
        )

    async def search(
        self,
        keyword: str,
        max_pages: int = 5,
        max_results: int = 100
    ) -> CrawlerResult:
        """搜尋蝦皮商品 - 模擬結果"""
        start_time = time.time()

        # 返回模擬搜尋結果（實際爬蟲需要更複雜的反爬機制）
        listings = []
        errors = []

        logger.info(f"Shopee search for: {keyword}")

        # 模擬找到的結果
        for i in range(min(10, max_results)):
            listings.append(ProductListing(
                id=f"shopee_{keyword}_{i}",
                platform='shopee',
                title=f"[蝦皮] {keyword} 商品 {i+1}",
                url=f"https://shopee.tw/search?keyword={keyword}",
                thumbnail_url="https://cf.shopee.tw/file/placeholder",
                price=100 + i * 50,
                seller_name="蝦皮賣家",
                sales_count=i * 10,
                location="台灣"
            ))

        duration_ms = int((time.time() - start_time) * 1000)

        return CrawlerResult(
            platform='shopee',
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
