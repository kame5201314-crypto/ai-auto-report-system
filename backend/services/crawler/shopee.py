"""
Shopee Crawler - 蝦皮購物爬蟲 (真實API版本)
使用 Shopee API 進行真實搜尋
"""
import time
import httpx
import urllib.parse
from typing import List, Optional
from loguru import logger

from .base import BaseCrawler, ProductListing, CrawlerResult


class ShopeeCrawler(BaseCrawler):
    """蝦皮購物爬蟲 - 使用真實 API"""

    def __init__(self, **kwargs):
        super().__init__(
            platform_name="shopee",
            base_url="https://shopee.tw",
            **kwargs
        )
        self.api_base = "https://shopee.tw/api/v4/search/search_items"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json",
            "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
            "Referer": "https://shopee.tw/",
            "X-Requested-With": "XMLHttpRequest",
            "X-API-SOURCE": "pc",
        }

    async def search(
        self,
        keyword: str,
        max_pages: int = 5,
        max_results: int = 100
    ) -> CrawlerResult:
        """搜尋蝦皮商品 - 真實API"""
        start_time = time.time()
        listings = []
        errors = []
        pages_scraped = 0

        logger.info(f"Shopee real search for: {keyword}")

        try:
            items_per_page = 60

            for page in range(max_pages):
                if len(listings) >= max_results:
                    break

                offset = page * items_per_page

                params = {
                    "by": "relevancy",
                    "keyword": keyword,
                    "limit": items_per_page,
                    "newest": offset,
                    "order": "desc",
                    "page_type": "search",
                    "scenario": "PAGE_GLOBAL_SEARCH",
                    "version": 2
                }

                try:
                    async with httpx.AsyncClient(timeout=30, headers=self.headers) as client:
                        response = await client.get(self.api_base, params=params)

                        if response.status_code == 200:
                            data = response.json()
                            items = data.get("items", [])

                            if not items:
                                logger.info(f"No more items at page {page + 1}")
                                break

                            for item in items:
                                if len(listings) >= max_results:
                                    break

                                item_info = item.get("item_basic", {})

                                item_id = item_info.get("itemid", "")
                                shop_id = item_info.get("shopid", "")
                                name = item_info.get("name", "Unknown Product")

                                clean_name = name[:50].replace(" ", "-").replace("/", "-")
                                product_url = f"https://shopee.tw/{urllib.parse.quote(clean_name)}-i.{shop_id}.{item_id}"

                                image = item_info.get("image", "")
                                if image:
                                    thumbnail_url = f"https://cf.shopee.tw/file/{image}"
                                else:
                                    images = item_info.get("images", [])
                                    if images:
                                        thumbnail_url = f"https://cf.shopee.tw/file/{images[0]}"
                                    else:
                                        thumbnail_url = "https://cf.shopee.tw/file/placeholder"

                                price = item_info.get("price", 0) / 100000 if item_info.get("price") else 0
                                price_min = item_info.get("price_min", 0) / 100000 if item_info.get("price_min") else price
                                seller_name = item_info.get("shop_name", "") or f"Shop_{shop_id}"
                                sold = item_info.get("sold", 0) or item_info.get("historical_sold", 0)
                                location = item_info.get("shop_location", "") or "台灣"
                                rating = item_info.get("item_rating", {}).get("rating_star", None)

                                listings.append(ProductListing(
                                    id=f"shopee_{shop_id}_{item_id}",
                                    platform="shopee",
                                    title=name,
                                    url=product_url,
                                    thumbnail_url=thumbnail_url,
                                    price=price_min if price_min > 0 else price,
                                    seller_id=str(shop_id),
                                    seller_name=seller_name,
                                    seller_url=f"https://shopee.tw/shop/{shop_id}",
                                    sales_count=sold,
                                    rating=rating,
                                    location=location,
                                    raw_data={
                                        "itemid": item_id,
                                        "shopid": shop_id,
                                        "liked_count": item_info.get("liked_count", 0),
                                        "stock": item_info.get("stock", 0)
                                    }
                                ))

                            pages_scraped += 1
                            logger.info(f"Page {page + 1}: Found {len(items)} items, total: {len(listings)}")

                            await self.random_delay()
                        else:
                            error_msg = f"API returned status {response.status_code}"
                            errors.append(error_msg)
                            logger.warning(error_msg)
                            break

                except httpx.TimeoutException:
                    error_msg = f"Timeout on page {page + 1}"
                    errors.append(error_msg)
                    logger.warning(error_msg)
                except Exception as e:
                    error_msg = f"Error on page {page + 1}: {str(e)}"
                    errors.append(error_msg)
                    logger.error(error_msg)

        except Exception as e:
            error_msg = f"Search failed: {str(e)}"
            errors.append(error_msg)
            logger.error(error_msg)

        duration_ms = int((time.time() - start_time) * 1000)
        logger.info(f"Shopee search completed: {len(listings)} products in {duration_ms}ms")

        return CrawlerResult(
            platform="shopee",
            keyword=keyword,
            total_found=len(listings),
            listings=listings,
            pages_scraped=pages_scraped,
            duration_ms=duration_ms,
            errors=errors,
            success=len(listings) > 0 or len(errors) == 0
        )

    async def get_product_details(self, product_url: str) -> Optional[ProductListing]:
        return None

    async def get_seller_products(self, seller_id: str, max_products: int = 50) -> List[ProductListing]:
        return []

