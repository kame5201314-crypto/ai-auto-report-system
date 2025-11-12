import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/property/communities - 查詢社區列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const city = searchParams.get('city')
    const district = searchParams.get('district')
    const search = searchParams.get('search') // 社區名稱搜尋
    const minRating = searchParams.get('minRating')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

    const where: any = {}

    if (city) where.city = city
    if (district) where.district = district
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ]
    }
    if (minRating) {
      where.avgRating = { gte: parseFloat(minRating) }
    }

    const [communities, total] = await Promise.all([
      prisma.community.findMany({
        where,
        orderBy: [
          { avgRating: 'desc' },
          { totalReviews: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: {
              transactions: true,
              reviews: true
            }
          }
        }
      }),
      prisma.community.count({ where })
    ])

    // 為每個社區計算平均成交價
    const communitiesWithStats = await Promise.all(
      communities.map(async (community) => {
        const recentTransactions = await prisma.transaction.aggregate({
          where: {
            communityId: community.id,
            transactionDate: {
              gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // 近一年
            }
          },
          _avg: { unitPrice: true },
          _count: true
        })

        return {
          ...community,
          lat: community.lat?.toString(),
          lng: community.lng?.toString(),
          parkingRatio: community.parkingRatio?.toString(),
          avgRating: community.avgRating?.toString(),
          recentStats: {
            avgUnitPrice: recentTransactions._avg.unitPrice || 0,
            transactionCount: recentTransactions._count
          },
          transactionCount: community._count.transactions,
          reviewCount: community._count.reviews
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: communitiesWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching communities:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch communities' },
      { status: 500 }
    )
  }
}

// POST /api/property/communities - 新增社區
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // TODO: 驗證用戶權限

    const community = await prisma.community.create({
      data: {
        name: body.name,
        address: body.address,
        city: body.city,
        district: body.district,
        lat: body.lat ? parseFloat(body.lat) : null,
        lng: body.lng ? parseFloat(body.lng) : null,
        totalUnits: body.totalUnits ? parseInt(body.totalUnits) : null,
        completedYear: body.completedYear ? parseInt(body.completedYear) : null,
        builder: body.builder || null,
        managementFee: body.managementFee ? parseInt(body.managementFee) : null,
        parkingRatio: body.parkingRatio ? parseFloat(body.parkingRatio) : null,
        facilities: body.facilities || null,
        images: body.images || [],
        description: body.description || null
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...community,
        lat: community.lat?.toString(),
        lng: community.lng?.toString(),
        parkingRatio: community.parkingRatio?.toString(),
        avgRating: community.avgRating?.toString()
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating community:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create community' },
      { status: 500 }
    )
  }
}
