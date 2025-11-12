import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/property/analysis/trends - 市場趨勢分析
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const city = searchParams.get('city')
    const district = searchParams.get('district')
    const buildingType = searchParams.get('buildingType')
    const period = searchParams.get('period') || '12m' // 12m, 24m, 36m, 60m

    if (!city) {
      return NextResponse.json(
        { success: false, error: 'City is required' },
        { status: 400 }
      )
    }

    // 計算時間範圍
    const months = parseInt(period.replace('m', ''))
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    // 建構查詢條件
    const whereConditions: any = {
      city,
      transactionDate: { gte: startDate }
    }

    if (district) whereConditions.district = district
    if (buildingType) whereConditions.buildingType = buildingType

    // 按月份分組統計
    const transactions = await prisma.transaction.findMany({
      where: whereConditions,
      select: {
        transactionDate: true,
        price: true,
        unitPrice: true,
        area: true
      },
      orderBy: { transactionDate: 'asc' }
    })

    // 分組計算月份統計
    const monthlyStats = new Map<string, {
      count: number
      totalPrice: bigint
      totalUnitPrice: number
      prices: number[]
      unitPrices: number[]
    }>()

    for (const tx of transactions) {
      const monthKey = `${tx.transactionDate.getFullYear()}-${String(tx.transactionDate.getMonth() + 1).padStart(2, '0')}`

      if (!monthlyStats.has(monthKey)) {
        monthlyStats.set(monthKey, {
          count: 0,
          totalPrice: BigInt(0),
          totalUnitPrice: 0,
          prices: [],
          unitPrices: []
        })
      }

      const stats = monthlyStats.get(monthKey)!
      stats.count++
      stats.totalPrice += tx.price
      stats.totalUnitPrice += tx.unitPrice
      stats.prices.push(Number(tx.price))
      stats.unitPrices.push(tx.unitPrice)
    }

    // 計算趨勢數據
    const trendData = Array.from(monthlyStats.entries())
      .map(([month, stats]) => {
        const avgPrice = Number(stats.totalPrice) / stats.count
        const avgUnitPrice = stats.totalUnitPrice / stats.count

        // 計算中位數
        const sortedPrices = [...stats.prices].sort((a, b) => a - b)
        const sortedUnitPrices = [...stats.unitPrices].sort((a, b) => a - b)
        const medianPrice = sortedPrices[Math.floor(sortedPrices.length / 2)]
        const medianUnitPrice = sortedUnitPrices[Math.floor(sortedUnitPrices.length / 2)]

        return {
          month,
          count: stats.count,
          avgPrice: Math.round(avgPrice),
          avgUnitPrice: Math.round(avgUnitPrice),
          medianPrice: Math.round(medianPrice),
          medianUnitPrice: Math.round(medianUnitPrice),
          minPrice: Math.min(...stats.prices),
          maxPrice: Math.max(...stats.prices)
        }
      })
      .sort((a, b) => a.month.localeCompare(b.month))

    // 計算成長率
    if (trendData.length > 1) {
      for (let i = 1; i < trendData.length; i++) {
        const current = trendData[i]
        const previous = trendData[i - 1]

        current['priceGrowth'] = previous.avgPrice > 0
          ? ((current.avgPrice - previous.avgPrice) / previous.avgPrice * 100).toFixed(2)
          : '0.00'

        current['volumeGrowth'] = previous.count > 0
          ? ((current.count - previous.count) / previous.count * 100).toFixed(2)
          : '0.00'
      }
    }

    // 計算整體統計
    const overallStats = {
      totalTransactions: transactions.length,
      avgPrice: trendData.reduce((sum, d) => sum + d.avgPrice, 0) / trendData.length,
      avgUnitPrice: trendData.reduce((sum, d) => sum + d.avgUnitPrice, 0) / trendData.length,
      priceRange: {
        min: Math.min(...trendData.map(d => d.minPrice)),
        max: Math.max(...trendData.map(d => d.maxPrice))
      },
      // 計算期間漲跌幅
      periodGrowth: trendData.length >= 2 ? {
        price: ((trendData[trendData.length - 1].avgPrice - trendData[0].avgPrice) / trendData[0].avgPrice * 100).toFixed(2),
        volume: ((trendData[trendData.length - 1].count - trendData[0].count) / trendData[0].count * 100).toFixed(2)
      } : null
    }

    return NextResponse.json({
      success: true,
      data: {
        query: {
          city,
          district: district || 'all',
          buildingType: buildingType || 'all',
          period: `${months} months`
        },
        trends: trendData,
        overall: overallStats,
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching market trends:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trends' },
      { status: 500 }
    )
  }
}
