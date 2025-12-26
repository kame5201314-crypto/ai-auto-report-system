"""
Image Comparison Engine (簡化版)
使用 pHash 進行圖片比對
"""
from typing import Dict, Optional, List, Tuple
from dataclasses import dataclass
from loguru import logger
import asyncio

from .phash import PHashCompare


@dataclass
class ComparisonResult:
    """圖片比對結果"""
    overall_similarity: float
    phash_score: float
    orb_score: float
    color_score: float
    similarity_level: str
    is_match: bool
    details: Dict


class ImageCompareEngine:
    """
    簡化版圖片比對引擎 - 只使用 pHash
    """

    def __init__(
        self,
        similarity_threshold: float = 70.0
    ):
        self.phash = PHashCompare(hash_size=16)
        self.threshold = similarity_threshold

    async def compute_fingerprint(
        self,
        image_source: str | bytes
    ) -> Optional[Dict]:
        """計算圖片指紋"""
        try:
            phash_hash = await self.phash.compute_hash(image_source)
            return {
                'hashes': {'phash': phash_hash},
                'orb': None,
                'color': None
            }
        except Exception as e:
            logger.error(f"Error computing fingerprint: {e}")
            return None

    async def compare(
        self,
        image1: str | bytes,
        image2: str | bytes,
        fast_mode: bool = False
    ) -> ComparisonResult:
        """比對兩張圖片"""
        try:
            similarity, hash1, hash2 = await self.phash.compare_images(image1, image2)

            return ComparisonResult(
                overall_similarity=round(similarity, 2),
                phash_score=round(similarity, 2),
                orb_score=0,
                color_score=0,
                similarity_level=self._get_similarity_level(similarity),
                is_match=similarity >= self.threshold,
                details={'phash1': hash1, 'phash2': hash2}
            )

        except Exception as e:
            logger.error(f"Error comparing images: {e}")
            return ComparisonResult(
                overall_similarity=0,
                phash_score=0,
                orb_score=0,
                color_score=0,
                similarity_level='error',
                is_match=False,
                details={'error': str(e)}
            )

    def _get_similarity_level(self, score: float) -> str:
        """判斷相似度等級"""
        if score >= 95:
            return 'exact'
        elif score >= 80:
            return 'high'
        elif score >= 60:
            return 'medium'
        else:
            return 'low'

    async def batch_compare(
        self,
        source_image: str | bytes,
        target_images: List[str | bytes],
        fast_mode: bool = True,
        min_similarity: float = 50.0
    ) -> List[Tuple[int, ComparisonResult]]:
        """批次比對"""
        results = []

        for i, target in enumerate(target_images):
            try:
                result = await self.compare(source_image, target, fast_mode=fast_mode)
                if result.overall_similarity >= min_similarity:
                    results.append((i, result))
            except Exception as e:
                logger.error(f"Error comparing image {i}: {e}")

        results.sort(key=lambda x: x[1].overall_similarity, reverse=True)
        return results
