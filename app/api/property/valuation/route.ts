import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 簡易估價演算法 (相似物件比較法)
async function calculateValuation(params: {
  city: string
  district: string
  lat?: number
  lng?: number
  buildingType: string
  area: number
  floor?: number
  totalFloors?: number
  buildingAge?: number
  bedrooms?: number
  bathrooms?: number
  parkingSpaces?: number
  hasElevator?: boolean
}) {
  const {
    city,
    district,
    lat,
    lng,
    buildingType,
    area,
    floor,
    totalFloors,
    buildingAge,
    bedrooms,
    bathrooms,
    parkingSpaces,
    hasElevator
  } = params

  // 1. 找尋相似交易案例 (過去 1 年內)
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  const whereConditions: any = {
    city,
    district,
    buildingType,
    transactionDate: { gte: oneYearAgo },
    // 面積範圍 ±30%
    area: {
      gte: area * 0.7,
      lte: area * 1.3
    }
  }

  // 如果有經緯度,找附近 1km 的案例
  if (lat && lng) {
    const latRange = 0.009 // 約 1km
    const lngRange = 0.009
    whereConditions.lat = {
      gte: lat - latRange,
      lte: lat + latRange
    }
    whereConditions.lng = {
      gte: lng - lngRange,
      lte: lng + lngRange
    }
  }

  const similarTransactions = await prisma.transaction.findMany({
    where: whereConditions,
    orderBy: { transactionDate: 'desc' },
    take: 20,
    select: {
      id: true,
      address: true,
      transactionDate: true,
      price: true,
      unitPrice: true,
      area: true,
      floor: true,
      totalFloors: true,
      buildingAge: true,
      bedrooms: true,
      bathrooms: true,
      parkingSpaces: true,
      hasElevator: true,
      lat: true,
      lng: true
    }
  })

  if (similarTransactions.length === 0) {
    // 沒有相似案例,使用區域平均
    const districtAvg = await prisma.transaction.aggregate({
      where: {
        city,
        district,
        buildingType,
        transactionDate: { gte: oneYearAgo }
      },
      _avg: { unitPrice: true }
    })

    const avgUnitPrice = districtAvg._avg.unitPrice || 0
    const estimatedPrice = Math.round(avgUnitPrice * area)

    return {
      estimatedPrice,
      unitPrice: avgUnitPrice,
      priceRange: {
        min: Math.round(estimatedPrice * 0.85),
        max: Math.round(estimatedPrice * 1.15)
      },
      confidence: 0.5,
      similarTransactions: [],
      factors: {
        method: 'district_average',
        sampleSize: 0,
        message: '使用區域平均單價估算'
      }
    }
  }

  // 2. 計算加權平均單價
  let totalWeight = 0
  let weightedSumUnitPrice = 0

  for (const tx of similarTransactions) {
    let weight = 1.0

    // 面積相似度加權
    const areaDiff = Math.abs(Number(tx.area) - area) / area
    weight *= Math.max(0.5, 1 - areaDiff)

    // 屋齡相似度加權
    if (buildingAge && tx.buildingAge) {
      const ageDiff = Math.abs(tx.buildingAge - buildingAge) / 10
      weight *= Math.max(0.7, 1 - ageDiff * 0.1)
    }

    // 樓層相似度加權
    if (floor && tx.floor && totalFloors && tx.totalFloors) {
      const floorRatio1 = floor / totalFloors
      const floorRatio2 = tx.floor / tx.totalFloors
      const floorDiff = Math.abs(floorRatio1 - floorRatio2)
      weight *= Math.max(0.8, 1 - floorDiff)
    }

    // 有無電梯加權
    if (hasElevator !== null && tx.hasElevator !== null) {
      weight *= hasElevator === tx.hasElevator ? 1.0 : 0.9
    }

    // 時間衰減 (越新的案例權重越高)
    const monthsAgo = (Date.now() - new Date(tx.transactionDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
    weight *= Math.max(0.7, 1 - monthsAgo / 12 * 0.3)

    totalWeight += weight
    weightedSumUnitPrice += tx.unitPrice * weight
  }

  const avgUnitPrice = Math.round(weightedSumUnitPrice / totalWeight)

  // 3. 調整因子
  let adjustedUnitPrice = avgUnitPrice

  // 停車位價值 (每個車位約加 150 萬)
  if (parkingSpaces && parkingSpaces > 0) {
    adjustedUnitPrice += Math.round((parkingSpaces * 1500000) / area)
  }

  // 低樓層折價 (1-2 樓)
  if (floor && floor <= 2 && totalFloors && totalFloors >= 5) {
    adjustedUnitPrice *= 0.95
  }

  // 頂樓加價或折價
  if (floor && totalFloors && floor === totalFloors) {
    adjustedUnitPrice *= totalFloors >= 10 ? 1.05 : 0.95 // 高樓頂樓加價, 低樓折價
  }

  // 屋齡折舊 (超過 20 年每年折 0.5%)
  if (buildingAge && buildingAge > 20) {
    const depreciation = (buildingAge - 20) * 0.005
    adjustedUnitPrice *= Math.max(0.7, 1 - depreciation)
  }

  const estimatedPrice = Math.round(adjustedUnitPrice * area)

  // 4. 計算信心度
  const confidence = Math.min(0.95, 0.6 + (similarTransactions.length / 20) * 0.35)

  // 5. 價格區間 (根據信心度決定範圍)
  const priceRangePercent = 1 - confidence * 0.5 // 信心度越高, 區間越窄
  const priceRange = {
    min: Math.round(estimatedPrice * (1 - priceRangePercent)),
    max: Math.round(estimatedPrice * (1 + priceRangePercent))
  }

  return {
    estimatedPrice,
    unitPrice: adjustedUnitPrice,
    priceRange,
    confidence: Math.round(confidence * 100) / 100,
    similarTransactions: similarTransactions.slice(0, 5).map(tx => ({
      ...tx,
      price: tx.price.toString(),
      area: tx.area.toString(),
      lat: tx.lat?.toString(),
      lng: tx.lng?.toString()
    })),
    factors: {
      method: 'comparable_sales',
      sampleSize: similarTransactions.length,
      avgMonthsAgo: Math.round(
        similarTransactions.reduce(
          (sum, tx) => sum + (Date.now() - new Date(tx.transactionDate).getTime()) / (1000 * 60 * 60 * 24 * 30),
          0
        ) / similarTransactions.length
      ),
      adjustments: {
        parkingSpaces: parkingSpaces || 0,
        floorFactor: floor && totalFloors ? `${floor}/${totalFloors}` : null,
        buildingAge: buildingAge || null
      }
    }
  }
}

// POST /api/property/valuation - 房屋估價
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 驗證必要欄位
    const requiredFields = ['city', 'district', 'buildingType', 'area']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // 執行估價計算
    const valuationResult = await calculateValuation({
      city: body.city,
      district: body.district,
      lat: body.lat ? parseFloat(body.lat) : undefined,
      lng: body.lng ? parseFloat(body.lng) : undefined,
      buildingType: body.buildingType,
      area: parseFloat(body.area),
      floor: body.floor ? parseInt(body.floor) : undefined,
      totalFloors: body.totalFloors ? parseInt(body.totalFloors) : undefined,
      buildingAge: body.buildingAge ? parseInt(body.buildingAge) : undefined,
      bedrooms: body.bedrooms ? parseInt(body.bedrooms) : undefined,
      bathrooms: body.bathrooms ? parseInt(body.bathrooms) : undefined,
      parkingSpaces: body.parkingSpaces ? parseInt(body.parkingSpaces) : undefined,
      hasElevator: body.hasElevator
    })

    // TODO: 檢查用戶權限與查詢額度

    // 記錄估價歷史
    // const userId = body.userId // 從 session 取得
    // await prisma.valuation.create({
    //   data: {
    //     userId,
    //     address: body.address || `${body.city}${body.district}`,
    //     city: body.city,
    //     district: body.district,
    //     ...
    //   }
    // })

    return NextResponse.json({
      success: true,
      data: {
        address: body.address || `${body.city}${body.district}`,
        input: {
          city: body.city,
          district: body.district,
          buildingType: body.buildingType,
          area: body.area,
          floor: body.floor,
          totalFloors: body.totalFloors,
          buildingAge: body.buildingAge,
          bedrooms: body.bedrooms,
          bathrooms: body.bathrooms,
          parkingSpaces: body.parkingSpaces,
          hasElevator: body.hasElevator
        },
        valuation: valuationResult,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error calculating valuation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to calculate valuation' },
      { status: 500 }
    )
  }
}

// GET /api/property/valuation - 查詢估價歷史
export async function GET(request: NextRequest) {
  try {
    // TODO: 從 session 取得 userId
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const valuations = await prisma.valuation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        address: true,
        city: true,
        district: true,
        buildingType: true,
        area: true,
        estimatedPrice: true,
        unitPrice: true,
        confidence: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: valuations.map(v => ({
        ...v,
        area: v.area.toString(),
        estimatedPrice: v.estimatedPrice.toString(),
        confidence: v.confidence.toString()
      }))
    })

  } catch (error) {
    console.error('Error fetching valuation history:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch history' },
      { status: 500 }
    )
  }
}
