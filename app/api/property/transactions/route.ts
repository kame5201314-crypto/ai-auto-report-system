import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/property/transactions - 查詢實價登錄交易記錄
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // 解析查詢參數
    const city = searchParams.get('city')
    const district = searchParams.get('district')
    const buildingType = searchParams.get('buildingType')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const minArea = searchParams.get('minArea')
    const maxArea = searchParams.get('maxArea')
    const minUnitPrice = searchParams.get('minUnitPrice')
    const maxUnitPrice = searchParams.get('maxUnitPrice')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

    // 構建查詢條件
    const where: any = {}

    if (city) where.city = city
    if (district) where.district = district
    if (buildingType) where.buildingType = buildingType

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = BigInt(minPrice)
      if (maxPrice) where.price.lte = BigInt(maxPrice)
    }

    if (minArea || maxArea) {
      where.area = {}
      if (minArea) where.area.gte = parseFloat(minArea)
      if (maxArea) where.area.lte = parseFloat(maxArea)
    }

    if (minUnitPrice || maxUnitPrice) {
      where.unitPrice = {}
      if (minUnitPrice) where.unitPrice.gte = parseInt(minUnitPrice)
      if (maxUnitPrice) where.unitPrice.lte = parseInt(maxUnitPrice)
    }

    if (startDate || endDate) {
      where.transactionDate = {}
      if (startDate) where.transactionDate.gte = new Date(startDate)
      if (endDate) where.transactionDate.lte = new Date(endDate)
    }

    // 執行查詢
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { transactionDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          community: {
            select: {
              id: true,
              name: true,
              avgRating: true
            }
          }
        }
      }),
      prisma.transaction.count({ where })
    ])

    // 轉換 BigInt 為 String
    const serializedTransactions = transactions.map(t => ({
      ...t,
      price: t.price.toString(),
      lat: t.lat?.toString(),
      lng: t.lng?.toString(),
      area: t.area.toString(),
      community: t.community ? {
        ...t.community,
        avgRating: t.community.avgRating?.toString()
      } : null
    }))

    return NextResponse.json({
      success: true,
      data: serializedTransactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

// POST /api/property/transactions - 新增交易記錄 (管理員功能)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // TODO: 驗證用戶權限 (僅管理員)

    const transaction = await prisma.transaction.create({
      data: {
        city: body.city,
        district: body.district,
        address: body.address,
        lat: body.lat ? parseFloat(body.lat) : null,
        lng: body.lng ? parseFloat(body.lng) : null,
        buildingType: body.buildingType,
        transactionDate: new Date(body.transactionDate),
        price: BigInt(body.price),
        unitPrice: parseInt(body.unitPrice),
        area: parseFloat(body.area),
        floor: body.floor ? parseInt(body.floor) : null,
        totalFloors: body.totalFloors ? parseInt(body.totalFloors) : null,
        buildingAge: body.buildingAge ? parseInt(body.buildingAge) : null,
        bedrooms: body.bedrooms ? parseInt(body.bedrooms) : null,
        bathrooms: body.bathrooms ? parseInt(body.bathrooms) : null,
        livingRooms: body.livingRooms ? parseInt(body.livingRooms) : null,
        parkingSpaces: body.parkingSpaces ? parseInt(body.parkingSpaces) : 0,
        hasElevator: body.hasElevator || false,
        transactionType: body.transactionType || 'SALE',
        dataSource: body.dataSource || '實價登錄',
        communityId: body.communityId || null,
        notes: body.notes || null,
        metadata: body.metadata || null
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...transaction,
        price: transaction.price.toString(),
        lat: transaction.lat?.toString(),
        lng: transaction.lng?.toString(),
        area: transaction.area.toString()
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}
