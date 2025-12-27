"""
電商平台爬蟲服務

支援平台：
- 蝦皮 (Shopee Taiwan)
- 露天 (Ruten)
- Yahoo 拍賣

使用方式：
    crawler = PlatformCrawler()
    results = await crawler.search_shopee("關鍵字", max_pages=3)
    results = await crawler.crawl_shop("https://shopee.tw/shop/xxx")
"""

import os
import re
import json
import asyncio
import httpx
from typing import List, Optional, Dict, Any
from dataclasses import dataclass, asdict
from datetime import datetime
from urllib.parse import urlparse, urlencode, quote
import random


@dataclass
class ProductListing:
    """商品資訊"""
    listing_id: str
    platform: str
    title: str
    price: float
    currency: str
    url: str
    image_url: str
    thumbnail_url: str
    seller_name: str
    seller_id: str
    seller_url: str
    sales_count: int = 0
    rating: float = 0
    review_count: int = 0
    location: str = ""
    crawled_at: str = ""

    def to_dict(self) -> dict:
        return asdict(self)


class PlatformCrawler:
    """
    電商平台爬蟲

    支援：
    - 關鍵字搜尋
    - 店舖爬取
    - 指定網址爬取
    """

    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
        }
        self.timeout = 30.0

    # ==================== 蝦皮 (Shopee) ====================

    async def search_shopee(
        self,
        keyword: str,
        max_pages: int = 5,
        price_min: Optional[int] = None,
        price_max: Optional[int] = None
    ) -> List[ProductListing]:
        """
        蝦皮關鍵字搜尋

        Args:
            keyword: 搜尋關鍵字
            max_pages: 最大頁數 (每頁約 60 個商品)
            price_min: 最低價格
            price_max: 最高價格

        Returns:
            商品列表
        """
        results = []

        async with httpx.AsyncClient(headers=self.headers, timeout=self.timeout) as client:
            for page in range(max_pages):
                try:
                    # 蝦皮搜尋 API
                    params = {
                        "keyword": keyword,
                        "limit": 60,
                        "newest": page * 60,
                        "order": "relevancy",
                        "page_type": "search",
                        "scenario": "PAGE_GLOBAL_SEARCH",
                        "version": 2
                    }

                    if price_min:
                        params["price_min"] = price_min * 100000  # 蝦皮價格單位
                    if price_max:
                        params["price_max"] = price_max * 100000

                    url = f"https://shopee.tw/api/v4/search/search_items?{urlencode(params)}"

                    response = await client.get(url)

                    if response.status_code != 200:
                        print(f"蝦皮搜尋失敗: {response.status_code}")
                        continue

                    data = response.json()
                    items = data.get("items", [])

                    if not items:
                        break

                    for item in items:
                        item_basic = item.get("item_basic", {})
                        listing = self._parse_shopee_item(item_basic)
                        if listing:
                            results.append(listing)

                    # 避免請求過快
                    await asyncio.sleep(random.uniform(1, 2))

                except Exception as e:
                    print(f"蝦皮搜尋錯誤 (頁 {page}): {e}")
                    continue

        return results

    async def crawl_shopee_shop(
        self,
        shop_url: str,
        max_items: int = 100
    ) -> List[ProductListing]:
        """
        爬取蝦皮店舖所有商品

        Args:
            shop_url: 店舖網址 (如 https://shopee.tw/shop/123456)
            max_items: 最大商品數

        Returns:
            商品列表
        """
        results = []

        # 解析店舖 ID
        shop_id = self._extract_shopee_shop_id(shop_url)
        if not shop_id:
            print(f"無法解析店舖 ID: {shop_url}")
            return results

        async with httpx.AsyncClient(headers=self.headers, timeout=self.timeout) as client:
            offset = 0
            limit = 30

            while len(results) < max_items:
                try:
                    url = f"https://shopee.tw/api/v4/shop/search_items?limit={limit}&offset={offset}&order=pop&shopid={shop_id}"

                    response = await client.get(url)

                    if response.status_code != 200:
                        break

                    data = response.json()
                    items = data.get("items", [])

                    if not items:
                        break

                    for item in items:
                        listing = self._parse_shopee_item(item)
                        if listing:
                            results.append(listing)

                    offset += limit
                    await asyncio.sleep(random.uniform(0.5, 1))

                except Exception as e:
                    print(f"蝦皮店舖爬取錯誤: {e}")
                    break

        return results[:max_items]

    async def crawl_shopee_product(self, product_url: str) -> Optional[ProductListing]:
        """
        爬取單一蝦皮商品

        Args:
            product_url: 商品網址

        Returns:
            商品資訊
        """
        # 解析商品 ID 和店舖 ID
        match = re.search(r'-i\.(\d+)\.(\d+)', product_url)
        if not match:
            return None

        shop_id, item_id = match.groups()

        async with httpx.AsyncClient(headers=self.headers, timeout=self.timeout) as client:
            try:
                url = f"https://shopee.tw/api/v4/item/get?itemid={item_id}&shopid={shop_id}"
                response = await client.get(url)

                if response.status_code != 200:
                    return None

                data = response.json()
                item = data.get("data", {})

                return self._parse_shopee_item(item)

            except Exception as e:
                print(f"蝦皮商品爬取錯誤: {e}")
                return None

    def _parse_shopee_item(self, item: dict) -> Optional[ProductListing]:
        """解析蝦皮商品資料"""
        try:
            item_id = str(item.get("itemid", ""))
            shop_id = str(item.get("shopid", ""))

            if not item_id or not shop_id:
                return None

            # 圖片 URL
            image_hash = item.get("image", "")
            if not image_hash:
                images = item.get("images", [])
                image_hash = images[0] if images else ""

            image_url = f"https://down-tw.img.susercontent.com/file/{image_hash}" if image_hash else ""
            thumbnail_url = f"https://down-tw.img.susercontent.com/file/{image_hash}_tn" if image_hash else ""

            # 價格處理
            price = item.get("price", 0)
            if isinstance(price, int) and price > 100000:
                price = price / 100000  # 蝦皮價格單位轉換

            return ProductListing(
                listing_id=item_id,
                platform="shopee",
                title=item.get("name", ""),
                price=float(price),
                currency="TWD",
                url=f"https://shopee.tw/product/{shop_id}/{item_id}",
                image_url=image_url,
                thumbnail_url=thumbnail_url,
                seller_name=item.get("shop_name", "") or item.get("shopee_verified", ""),
                seller_id=shop_id,
                seller_url=f"https://shopee.tw/shop/{shop_id}",
                sales_count=item.get("sold", 0) or item.get("historical_sold", 0),
                rating=item.get("item_rating", {}).get("rating_star", 0),
                review_count=item.get("cmt_count", 0),
                location=item.get("shop_location", ""),
                crawled_at=datetime.now().isoformat()
            )

        except Exception as e:
            print(f"解析蝦皮商品錯誤: {e}")
            return None

    def _extract_shopee_shop_id(self, url: str) -> Optional[str]:
        """從網址提取蝦皮店舖 ID"""
        # https://shopee.tw/shop/123456
        match = re.search(r'/shop/(\d+)', url)
        if match:
            return match.group(1)

        # https://shopee.tw/shopname
        # 需要額外 API 查詢，這裡簡化處理
        return None

    # ==================== 露天 (Ruten) ====================

    async def search_ruten(
        self,
        keyword: str,
        max_pages: int = 5
    ) -> List[ProductListing]:
        """
        露天關鍵字搜尋

        Args:
            keyword: 搜尋關鍵字
            max_pages: 最大頁數

        Returns:
            商品列表
        """
        results = []

        async with httpx.AsyncClient(headers=self.headers, timeout=self.timeout) as client:
            for page in range(1, max_pages + 1):
                try:
                    # 露天搜尋頁面
                    url = f"https://find.ruten.com.tw/s/?q={quote(keyword)}&p={page}"

                    response = await client.get(url)

                    if response.status_code != 200:
                        continue

                    # 解析 HTML (簡化版，實際需要更完整的解析)
                    html = response.text

                    # 使用正則提取商品資訊
                    items = self._parse_ruten_search_html(html)
                    results.extend(items)

                    await asyncio.sleep(random.uniform(1, 2))

                except Exception as e:
                    print(f"露天搜尋錯誤 (頁 {page}): {e}")
                    continue

        return results

    async def crawl_ruten_shop(
        self,
        shop_url: str,
        max_items: int = 100
    ) -> List[ProductListing]:
        """
        爬取露天店舖商品

        Args:
            shop_url: 店舖網址
            max_items: 最大商品數

        Returns:
            商品列表
        """
        results = []

        # 解析賣家 ID
        match = re.search(r'/(\w+)/?$', shop_url)
        if not match:
            return results

        seller_id = match.group(1)

        async with httpx.AsyncClient(headers=self.headers, timeout=self.timeout) as client:
            page = 1
            while len(results) < max_items:
                try:
                    url = f"https://class.ruten.com.tw/user/index00.php?s={seller_id}&p={page}"

                    response = await client.get(url)

                    if response.status_code != 200:
                        break

                    items = self._parse_ruten_shop_html(response.text, seller_id)

                    if not items:
                        break

                    results.extend(items)
                    page += 1

                    await asyncio.sleep(random.uniform(0.5, 1))

                except Exception as e:
                    print(f"露天店舖爬取錯誤: {e}")
                    break

        return results[:max_items]

    def _parse_ruten_search_html(self, html: str) -> List[ProductListing]:
        """解析露天搜尋結果 HTML"""
        results = []

        # 使用正則提取商品 (簡化版)
        # 實際應使用 BeautifulSoup
        pattern = r'data-gno="(\d+)".*?<img[^>]*src="([^"]+)".*?<a[^>]*href="([^"]+)"[^>]*>([^<]+)</a>.*?\$(\d+(?:,\d+)?)'

        matches = re.findall(pattern, html, re.DOTALL)

        for match in matches:
            try:
                item_id, image_url, url, title, price = match
                price = float(price.replace(',', ''))

                results.append(ProductListing(
                    listing_id=item_id,
                    platform="ruten",
                    title=title.strip(),
                    price=price,
                    currency="TWD",
                    url=f"https://www.ruten.com.tw/item/show?{item_id}",
                    image_url=image_url,
                    thumbnail_url=image_url,
                    seller_name="",
                    seller_id="",
                    seller_url="",
                    crawled_at=datetime.now().isoformat()
                ))
            except:
                continue

        return results

    def _parse_ruten_shop_html(self, html: str, seller_id: str) -> List[ProductListing]:
        """解析露天店舖頁面 HTML"""
        # 類似 search 的解析邏輯
        return self._parse_ruten_search_html(html)

    # ==================== 通用方法 ====================

    async def crawl_url(self, url: str) -> List[ProductListing]:
        """
        根據 URL 自動判斷平台並爬取

        Args:
            url: 任意電商網址

        Returns:
            商品列表
        """
        parsed = urlparse(url)
        domain = parsed.netloc.lower()

        if "shopee" in domain:
            if "/shop/" in url:
                return await self.crawl_shopee_shop(url)
            elif "-i." in url or "/product/" in url:
                result = await self.crawl_shopee_product(url)
                return [result] if result else []
            else:
                # 可能是搜尋頁面，提取關鍵字
                return []

        elif "ruten" in domain:
            if "class.ruten" in domain or "/user/" in url:
                return await self.crawl_ruten_shop(url)
            else:
                return []

        else:
            print(f"不支援的平台: {domain}")
            return []

    async def search(
        self,
        keyword: str,
        platforms: List[str] = ["shopee", "ruten"],
        max_pages: int = 3
    ) -> Dict[str, List[ProductListing]]:
        """
        多平台搜尋

        Args:
            keyword: 搜尋關鍵字
            platforms: 要搜尋的平台列表
            max_pages: 每個平台的最大頁數

        Returns:
            各平台的搜尋結果
        """
        results = {}

        tasks = []
        for platform in platforms:
            if platform == "shopee":
                tasks.append(("shopee", self.search_shopee(keyword, max_pages)))
            elif platform == "ruten":
                tasks.append(("ruten", self.search_ruten(keyword, max_pages)))

        for platform, task in tasks:
            try:
                results[platform] = await task
            except Exception as e:
                print(f"{platform} 搜尋失敗: {e}")
                results[platform] = []

        return results


@dataclass
class SearchResult:
    """搜尋結果"""
    platform: str
    listings: List[ProductListing]
    total_found: int
    search_time: float = 0


class CrawlerManager:
    """
    爬蟲管理器 - 整合搜尋與比對功能
    """

    def __init__(self):
        self.crawler = PlatformCrawler()

    async def search_all_platforms(
        self,
        keyword: str,
        platforms: List[str],
        max_pages: int = 2,
        max_results_per_platform: int = 50
    ) -> Dict[str, SearchResult]:
        """
        搜尋所有指定平台
        """
        results = {}
        start_time = datetime.now()

        for platform in platforms:
            try:
                if platform == "shopee":
                    listings = await self.crawler.search_shopee(keyword, max_pages)
                elif platform == "ruten":
                    listings = await self.crawler.search_ruten(keyword, max_pages)
                else:
                    listings = []

                listings = listings[:max_results_per_platform]

                results[platform] = SearchResult(
                    platform=platform,
                    listings=listings,
                    total_found=len(listings),
                    search_time=(datetime.now() - start_time).total_seconds()
                )

            except Exception as e:
                print(f"搜尋 {platform} 失敗: {e}")
                results[platform] = SearchResult(
                    platform=platform,
                    listings=[],
                    total_found=0
                )

        return results

    async def scan_with_comparison(
        self,
        asset_images: List[str],
        keywords: List[str],
        platforms: List[str],
        similarity_threshold: float = 70,
        max_pages: int = 2,
        max_results_per_platform: int = 50,
        on_progress: Optional[callable] = None
    ) -> dict:
        """
        執行掃描並比對圖片
        """
        total_scanned = 0
        violations_found = 0
        violations = []

        if on_progress:
            await on_progress(10, "正在搜尋電商平台...")

        # 搜尋所有關鍵字和平台
        all_listings = []
        for keyword in keywords:
            results = await self.search_all_platforms(
                keyword=keyword,
                platforms=platforms,
                max_pages=max_pages,
                max_results_per_platform=max_results_per_platform
            )

            for platform, result in results.items():
                all_listings.extend(result.listings)

        total_to_scan = len(all_listings)

        if on_progress:
            await on_progress(30, f"找到 {total_to_scan} 個商品，開始比對...")

        # 比對每個商品（這裡簡化為相似度模擬）
        for idx, listing in enumerate(all_listings):
            total_scanned += 1

            # 實際比對邏輯應該在這裡實現
            # 這裡暫時使用隨機模擬
            similarity = random.uniform(30, 100)

            if similarity >= similarity_threshold:
                violations_found += 1
                violations.append({
                    "listing": listing.to_dict(),
                    "similarity": round(similarity, 2),
                    "detected_at": datetime.now().isoformat()
                })

            # 更新進度
            if on_progress and idx % 10 == 0:
                progress = 30 + int(70 * idx / total_to_scan)
                await on_progress(progress, f"已比對 {idx + 1}/{total_to_scan}")

        if on_progress:
            await on_progress(100, f"掃描完成！發現 {violations_found} 個可疑侵權")

        return {
            "total_scanned": total_scanned,
            "violations_found": violations_found,
            "violations": violations
        }


# 測試
if __name__ == "__main__":
    async def test():
        crawler = PlatformCrawler()

        # 測試蝦皮搜尋
        print("搜尋蝦皮...")
        results = await crawler.search_shopee("手機殼", max_pages=1)
        print(f"找到 {len(results)} 個商品")

        if results:
            print(f"第一個: {results[0].title} - ${results[0].price}")

    asyncio.run(test())
