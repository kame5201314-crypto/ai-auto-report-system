'use client'

import { useState } from 'react'
import { TrendingUp, DollarSign, PieChart } from 'lucide-react'
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

export default function InvestmentCalculatorPage() {
  const [formData, setFormData] = useState({
    purchasePrice: '15000000',
    renovationCost: '500000',
    monthlyRent: '25000',
    managementFee: '3000',
    propertyTax: '50000',
    insurance: '10000',
    mortgagePayment: '45000',
    vacancyRate: '5',
    appreciationRate: '2'
  })

  const [result, setResult] = useState<any>(null)

  const calculateInvestment = () => {
    const purchasePrice = parseInt(formData.purchasePrice)
    const renovationCost = parseInt(formData.renovationCost)
    const totalInvestment = purchasePrice + renovationCost

    const monthlyRent = parseInt(formData.monthlyRent)
    const annualRent = monthlyRent * 12

    const managementFee = parseInt(formData.managementFee) * 12
    const propertyTax = parseInt(formData.propertyTax)
    const insurance = parseInt(formData.insurance)
    const mortgagePayment = parseInt(formData.mortgagePayment) * 12

    const vacancyRate = parseFloat(formData.vacancyRate) / 100
    const effectiveRent = annualRent * (1 - vacancyRate)

    const totalExpenses = managementFee + propertyTax + insurance + mortgagePayment
    const netIncome = effectiveRent - totalExpenses

    // 投資指標計算
    const grossYield = (annualRent / purchasePrice) * 100
    const netYield = (netIncome / purchasePrice) * 100
    const cashOnCashReturn = (netIncome / totalInvestment) * 100
    const capRate = ((effectiveRent - (managementFee + propertyTax + insurance)) / purchasePrice) * 100
    const breakEvenYears = totalInvestment / netIncome

    // 未來價值預測 (10年)
    const appreciationRate = parseFloat(formData.appreciationRate) / 100
    const futureValue10Y = purchasePrice * Math.pow(1 + appreciationRate, 10)
    const totalReturn10Y = (futureValue10Y + netIncome * 10 - totalInvestment) / totalInvestment * 100
    const annualizedReturn = Math.pow(1 + totalReturn10Y / 100, 1 / 10) - 1

    // 支出分布
    const expenseBreakdown = [
      { name: '管理費', value: managementFee, color: '#3b82f6' },
      { name: '房貸', value: mortgagePayment, color: '#ef4444' },
      { name: '房屋稅', value: propertyTax, color: '#f59e0b' },
      { name: '保險', value: insurance, color: '#10b981' }
    ]

    setResult({
      totalInvestment,
      annualRent,
      effectiveRent,
      totalExpenses,
      netIncome,
      monthlyNetIncome: netIncome / 12,
      grossYield,
      netYield,
      cashOnCashReturn,
      capRate,
      breakEvenYears,
      futureValue10Y,
      totalReturn10Y,
      annualizedReturn: annualizedReturn * 100,
      expenseBreakdown
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">投資報酬率計算</h1>
          <p className="text-gray-600">評估房地產投資的獲利潛力</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <DollarSign className="mr-2 text-green-600" />
              投資資訊
            </h2>

            <div className="space-y-6">
              {/* Purchase Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  購買價格
                </label>
                <input
                  type="number"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-sm text-gray-500 mt-1">
                  ≈ {(parseInt(formData.purchasePrice || '0') / 10000).toLocaleString()} 萬元
                </p>
              </div>

              {/* Renovation Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  裝修成本
                </label>
                <input
                  type="number"
                  value={formData.renovationCost}
                  onChange={(e) => setFormData({ ...formData, renovationCost: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="font-bold text-gray-800 mb-4">收入</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    月租金收入
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyRent}
                    onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    年收入: {(parseInt(formData.monthlyRent || '0') * 12).toLocaleString()} 元
                  </p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-bold text-gray-800 mb-4">支出 (年度)</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      月管理費
                    </label>
                    <input
                      type="number"
                      value={formData.managementFee}
                      onChange={(e) => setFormData({ ...formData, managementFee: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      房屋稅 (年)
                    </label>
                    <input
                      type="number"
                      value={formData.propertyTax}
                      onChange={(e) => setFormData({ ...formData, propertyTax: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      保險費 (年)
                    </label>
                    <input
                      type="number"
                      value={formData.insurance}
                      onChange={(e) => setFormData({ ...formData, insurance: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      月房貸支出
                    </label>
                    <input
                      type="number"
                      value={formData.mortgagePayment}
                      onChange={(e) => setFormData({ ...formData, mortgagePayment: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-bold text-gray-800 mb-4">其他參數</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      空置率 (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.vacancyRate}
                      onChange={(e) => setFormData({ ...formData, vacancyRate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      年增值率 (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.appreciationRate}
                      onChange={(e) => setFormData({ ...formData, appreciationRate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={calculateInvestment}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center"
              >
                <TrendingUp className="mr-2" size={20} />
                計算報酬率
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {result ? (
              <>
                {/* Main Metrics */}
                <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold mb-6">投資回報</h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-green-100 mb-1">租金報酬率</p>
                      <p className="text-4xl font-bold">{result.grossYield.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-green-100 mb-1">淨報酬率</p>
                      <p className="text-4xl font-bold">{result.netYield.toFixed(2)}%</p>
                    </div>
                    <div className="col-span-2 pt-4 border-t border-green-400">
                      <p className="text-green-100 mb-1">月淨收入</p>
                      <p className="text-3xl font-bold">
                        {result.monthlyNetIncome > 0 ? '+' : ''}{Math.round(result.monthlyNetIncome).toLocaleString()} 元
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detailed Metrics */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="font-bold text-gray-800 mb-4">詳細指標</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">總投資額</span>
                      <span className="font-bold">{result.totalInvestment.toLocaleString()} 元</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">年租金收入</span>
                      <span className="font-medium text-green-600">{result.annualRent.toLocaleString()} 元</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">有效租金收入</span>
                      <span className="font-medium">{result.effectiveRent.toLocaleString()} 元</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">年度總支出</span>
                      <span className="font-medium text-red-600">{result.totalExpenses.toLocaleString()} 元</span>
                    </div>
                    <div className="flex justify-between py-2 border-b bg-gray-50">
                      <span className="text-gray-800 font-bold">年度淨收入</span>
                      <span className={`font-bold text-lg ${result.netIncome > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {result.netIncome > 0 ? '+' : ''}{result.netIncome.toLocaleString()} 元
                      </span>
                    </div>
                  </div>
                </div>

                {/* Investment Metrics */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="font-bold text-gray-800 mb-4">投資績效</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">現金回報率</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {result.cashOnCashReturn.toFixed(2)}%
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">資本化率</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {result.capRate.toFixed(2)}%
                      </p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">回本年限</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {result.breakEvenYears.toFixed(1)} 年
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">年化報酬</p>
                      <p className="text-2xl font-bold text-green-600">
                        {result.annualizedReturn.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expense Breakdown */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="font-bold text-gray-800 mb-4">支出分布</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <RePieChart>
                      <Pie
                        data={result.expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {result.expenseBreakdown.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => value.toLocaleString() + ' 元'} />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>

                {/* Future Projection */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="font-bold text-gray-800 mb-4">10 年預測</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">預估房價</span>
                      <span className="font-bold text-lg">{result.futureValue10Y.toLocaleString()} 元</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">總資本利得</span>
                      <span className="font-bold text-green-600">
                        +{(result.futureValue10Y - parseInt(formData.purchasePrice)).toLocaleString()} 元
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-t">
                      <span className="text-gray-800 font-bold">總報酬率 (10年)</span>
                      <span className="font-bold text-2xl text-green-600">
                        {result.totalReturn10Y.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Evaluation */}
                <div className={`rounded-xl p-6 ${
                  result.netYield > 4 ? 'bg-green-50 border border-green-200' :
                  result.netYield > 2 ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-red-50 border border-red-200'
                }`}>
                  <h3 className="font-bold mb-2">
                    {result.netYield > 4 ? '✅ 優質投資' :
                     result.netYield > 2 ? '⚠️ 尚可投資' :
                     '❌ 投資風險高'}
                  </h3>
                  <p className="text-sm">
                    {result.netYield > 4 ? '淨報酬率超過 4%,屬於優質投資標的' :
                     result.netYield > 2 ? '淨報酬率 2-4%,投資回報普通,建議評估其他因素' :
                     result.netYield > 0 ? '淨報酬率低於 2%,投資回報較低' :
                     '淨報酬率為負,每月現金流虧損,不建議投資'}
                  </p>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <PieChart className="mx-auto text-gray-300 mb-4" size={64} />
                <p className="text-gray-500">填寫左側資訊並點擊計算按鈕</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
