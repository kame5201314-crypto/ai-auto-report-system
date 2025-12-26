// 產品資料
export interface Product {
  id: string
  name: string
  category: 'telephoto' | 'macro' | 'wide-angle' | 'accessory'
  price: number
  originalPrice?: number
  description: string
  features: string[]
  beforeImage: string
  afterImage: string
  tips: string[]
  relatedAccessories: string[]
}

export interface Accessory {
  id: string
  name: string
  price: number
  description: string
  forProducts: string[]
}

// 主力鏡頭產品
export const products: Product[] = [
  {
    id: 'telephoto-20x',
    name: '20X 長焦望遠鏡頭',
    category: 'telephoto',
    price: 1299,
    originalPrice: 1599,
    description: '專業級長焦鏡頭，讓您的手機變身望遠鏡，輕鬆拍攝演唱會、月亮、野生動物。',
    features: [
      '20倍光學變焦',
      '多層鍍膜減少眩光',
      '鋁合金機身',
      '適用所有手機型號'
    ],
    beforeImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
    afterImage: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80',
    tips: [
      '建議搭配腳架使用，避免手震',
      '光線充足時效果最佳',
      '先對焦再拍攝'
    ],
    relatedAccessories: ['tripod-pro', 'phone-mount']
  },
  {
    id: 'macro-lens',
    name: '4K 微距鏡頭',
    category: 'macro',
    price: 899,
    originalPrice: 1099,
    description: '探索微觀世界，拍出驚人細節。美食、珠寶、花卉攝影必備。',
    features: [
      '15X 放大倍率',
      '1.2-3cm 最佳對焦距離',
      'LED 補光環設計',
      '消除黑角技術'
    ],
    beforeImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
    afterImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
    tips: [
      '請貼近拍攝對象（1-3公分）',
      '記得取下手機殼',
      '使用 LED 補光獲得最佳效果'
    ],
    relatedAccessories: ['led-ring', 'lens-clip']
  },
  {
    id: 'wide-angle',
    name: '0.6X 超廣角鏡頭',
    category: 'wide-angle',
    price: 799,
    description: '捕捉更寬廣的視野，風景、建築、團體照的最佳選擇。',
    features: [
      '120° 超廣視角',
      '低畸變設計',
      '抗反射鍍膜',
      '輕便攜帶'
    ],
    beforeImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    afterImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    tips: [
      '適合拍攝風景和建築',
      '避免逆光拍攝',
      '注意邊緣變形'
    ],
    relatedAccessories: ['cpl-filter', 'lens-clip']
  }
]

// 配件產品
export const accessories: Accessory[] = [
  {
    id: 'tripod-pro',
    name: '專業手機腳架',
    price: 399,
    description: '穩定支撐，告別手震模糊。長焦攝影必備配件。',
    forProducts: ['telephoto-20x']
  },
  {
    id: 'phone-mount',
    name: '萬用手機夾具',
    price: 199,
    description: '適用所有手機型號，一夾即用。',
    forProducts: ['telephoto-20x', 'macro-lens', 'wide-angle']
  },
  {
    id: 'led-ring',
    name: 'LED 補光環',
    price: 299,
    description: '微距攝影補光神器，三段亮度可調。',
    forProducts: ['macro-lens']
  },
  {
    id: 'lens-clip',
    name: '高級鏡頭夾',
    price: 149,
    description: '快速安裝，穩固不晃動。',
    forProducts: ['macro-lens', 'wide-angle']
  },
  {
    id: 'cpl-filter',
    name: 'CPL 偏光濾鏡',
    price: 349,
    description: '消除反光，讓天空更藍、水面更清澈。',
    forProducts: ['wide-angle']
  }
]

// 根據 ID 獲取產品
export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id)
}

// 根據 ID 獲取配件
export const getAccessoryById = (id: string): Accessory | undefined => {
  return accessories.find(a => a.id === id)
}

// 獲取產品的相關配件
export const getRelatedAccessories = (productId: string): Accessory[] => {
  const product = getProductById(productId)
  if (!product) return []
  return accessories.filter(a => product.relatedAccessories.includes(a.id))
}
