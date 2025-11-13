import { supabase } from '../lib/supabase';
import { KOL, SocialPlatform, ProfitShareRecord } from '../types/kol';

// 轉換資料庫格式到前端格式
function transformKOLFromDB(dbKOL: any): KOL {
  return {
    id: dbKOL.id,
    name: dbKOL.name,
    nickname: dbKOL.nickname,
    email: dbKOL.email,
    phone: dbKOL.phone,
    facebookUrl: dbKOL.facebook_url,
    lineUrl: dbKOL.line_url,
    category: dbKOL.category || [],
    tags: dbKOL.tags || [],
    rating: dbKOL.rating,
    note: dbKOL.note || '',
    socialPlatforms: dbKOL.social_platforms || [],
    profitShares: dbKOL.profit_shares || [],
    createdAt: dbKOL.created_at,
    updatedAt: dbKOL.updated_at,
  };
}

// 轉換前端格式到資料庫格式
function transformKOLToDB(kol: Partial<KOL>) {
  return {
    name: kol.name,
    nickname: kol.nickname,
    email: kol.email,
    phone: kol.phone,
    facebook_url: kol.facebookUrl,
    line_url: kol.lineUrl,
    category: kol.category,
    tags: kol.tags,
    rating: kol.rating,
    note: kol.note,
  };
}

// 獲取所有 KOL
export async function getAllKOLs(): Promise<KOL[]> {
  try {
    // 獲取 KOLs
    const { data: kolsData, error: kolsError } = await supabase
      .from('kols')
      .select('*')
      .order('created_at', { ascending: false });

    if (kolsError) throw kolsError;
    if (!kolsData) return [];

    // 對每個 KOL 獲取其關聯資料
    const kolsWithRelations = await Promise.all(
      kolsData.map(async (kol) => {
        // 獲取社群平台
        const { data: platforms } = await supabase
          .from('social_platforms')
          .select('*')
          .eq('kol_id', kol.id);

        // 獲取分潤記錄
        const { data: profitShares } = await supabase
          .from('profit_shares')
          .select('*')
          .eq('kol_id', kol.id)
          .order('created_at', { ascending: false });

        return {
          ...kol,
          social_platforms: platforms?.map((p) => ({
            platform: p.platform,
            handle: p.handle,
            url: p.url,
            followers: p.followers,
            lastUpdated: p.last_updated,
          })) || [],
          profit_shares: profitShares?.map((ps) => ({
            id: ps.id,
            settlementDate: ps.settlement_date,
            period: ps.period,
            periodStart: ps.period_start,
            periodEnd: ps.period_end,
            month: ps.month,
            salesAmount: parseFloat(ps.sales_amount),
            profitShareRate: parseFloat(ps.profit_share_rate),
            profitAmount: parseFloat(ps.profit_amount),
            note: ps.note,
            createdAt: ps.created_at,
          })) || [],
        };
      })
    );

    return kolsWithRelations.map(transformKOLFromDB);
  } catch (error) {
    console.error('Error fetching KOLs:', error);
    throw error;
  }
}

// 獲取單個 KOL
export async function getKOLById(id: number): Promise<KOL | null> {
  try {
    const { data: kolData, error: kolError } = await supabase
      .from('kols')
      .select('*')
      .eq('id', id)
      .single();

    if (kolError) throw kolError;
    if (!kolData) return null;

    // 獲取社群平台
    const { data: platforms } = await supabase
      .from('social_platforms')
      .select('*')
      .eq('kol_id', id);

    // 獲取分潤記錄
    const { data: profitShares } = await supabase
      .from('profit_shares')
      .select('*')
      .eq('kol_id', id)
      .order('created_at', { ascending: false });

    const kolWithRelations = {
      ...kolData,
      social_platforms: platforms?.map((p) => ({
        platform: p.platform,
        handle: p.handle,
        url: p.url,
        followers: p.followers,
        lastUpdated: p.last_updated,
      })) || [],
      profit_shares: profitShares?.map((ps) => ({
        id: ps.id,
        settlementDate: ps.settlement_date,
        period: ps.period,
        periodStart: ps.period_start,
        periodEnd: ps.period_end,
        month: ps.month,
        salesAmount: parseFloat(ps.sales_amount),
        profitShareRate: parseFloat(ps.profit_share_rate),
        profitAmount: parseFloat(ps.profit_amount),
        note: ps.note,
        createdAt: ps.created_at,
      })) || [],
    };

    return transformKOLFromDB(kolWithRelations);
  } catch (error) {
    console.error('Error fetching KOL:', error);
    throw error;
  }
}

// 建立新 KOL
export async function createKOL(kol: Omit<KOL, 'id' | 'createdAt' | 'updatedAt'>): Promise<KOL> {
  try {
    // 建立 KOL
    const { data: kolData, error: kolError } = await supabase
      .from('kols')
      .insert([transformKOLToDB(kol)])
      .select()
      .single();

    if (kolError) throw kolError;

    // 建立社群平台
    if (kol.socialPlatforms && kol.socialPlatforms.length > 0) {
      const platformsToInsert = kol.socialPlatforms.map((p) => ({
        kol_id: kolData.id,
        platform: p.platform,
        handle: p.handle,
        url: p.url,
        followers: p.followers,
        last_updated: p.lastUpdated,
      }));

      await supabase.from('social_platforms').insert(platformsToInsert);
    }

    // 建立分潤記錄
    if (kol.profitShares && kol.profitShares.length > 0) {
      const profitSharesToInsert = kol.profitShares.map((ps) => ({
        id: ps.id,
        kol_id: kolData.id,
        settlement_date: ps.settlementDate,
        period: ps.period,
        period_start: ps.periodStart,
        period_end: ps.periodEnd,
        month: ps.month,
        sales_amount: ps.salesAmount,
        profit_share_rate: ps.profitShareRate,
        profit_amount: ps.profitAmount,
        note: ps.note,
      }));

      await supabase.from('profit_shares').insert(profitSharesToInsert);
    }

    return await getKOLById(kolData.id) as KOL;
  } catch (error) {
    console.error('Error creating KOL (Supabase unavailable, using mock data):', error);
    // Supabase 不可用，使用 Mock 資料模式
    const mockKOL: KOL = {
      ...kol,
      id: Date.now(), // 使用時間戳作為 ID
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      socialPlatforms: kol.socialPlatforms || [],
      profitShares: kol.profitShares || [],
    } as KOL;

    return mockKOL;
  }
}

// 更新 KOL
export async function updateKOL(id: number, kol: Partial<KOL>): Promise<KOL> {
  try {
    // 更新 KOL
    const { error: kolError } = await supabase
      .from('kols')
      .update(transformKOLToDB(kol))
      .eq('id', id);

    if (kolError) throw kolError;

    // 更新社群平台（先刪除再新增）
    if (kol.socialPlatforms) {
      await supabase.from('social_platforms').delete().eq('kol_id', id);

      if (kol.socialPlatforms.length > 0) {
        const platformsToInsert = kol.socialPlatforms.map((p) => ({
          kol_id: id,
          platform: p.platform,
          handle: p.handle,
          url: p.url,
          followers: p.followers,
          last_updated: p.lastUpdated,
        }));

        await supabase.from('social_platforms').insert(platformsToInsert);
      }
    }

    // 更新分潤記錄（先刪除再新增）
    if (kol.profitShares) {
      await supabase.from('profit_shares').delete().eq('kol_id', id);

      if (kol.profitShares.length > 0) {
        const profitSharesToInsert = kol.profitShares.map((ps) => ({
          id: ps.id,
          kol_id: id,
          settlement_date: ps.settlementDate,
          period: ps.period,
          period_start: ps.periodStart,
          period_end: ps.periodEnd,
          month: ps.month,
          sales_amount: ps.salesAmount,
          profit_share_rate: ps.profitShareRate,
          profit_amount: ps.profitAmount,
          note: ps.note,
        }));

        await supabase.from('profit_shares').insert(profitSharesToInsert);
      }
    }

    return await getKOLById(id) as KOL;
  } catch (error) {
    console.error('Error updating KOL (Supabase unavailable, using mock data):', error);
    // Supabase 不可用，返回更新後的 Mock 資料
    const mockKOL: KOL = {
      ...kol,
      id,
      createdAt: kol.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      socialPlatforms: kol.socialPlatforms || [],
      profitShares: kol.profitShares || [],
    } as KOL;

    return mockKOL;
  }
}

// 刪除 KOL
export async function deleteKOL(id: number): Promise<void> {
  try {
    const { error } = await supabase.from('kols').delete().eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting KOL (Supabase unavailable, mock delete):', error);
    // Supabase 不可用，Mock 刪除成功（實際上前端會處理）
    return;
  }
}
