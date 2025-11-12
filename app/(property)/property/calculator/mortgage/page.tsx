'use client'

import { useState } from 'react'
import { Calculator, TrendingDown, DollarSign } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function MortgageCalculatorPage() {
  const [formData, setFormData] = useState({
    housePrice: '15000000',
    downPayment: '3000000',
    interestRate: '2.06',
    loanYears: '30',
    graceYears: '0',
    paymentType: 'equal_payment' // equal_payment 或 equal_principal
  })

  const [result, setResult] = useState<any>(null)

  const calculateMortgage = () => {
    const housePrice = parseInt(formData.housePrice)
    const downPayment = parseInt(formData.downPayment)
    const loanAmount = housePrice - downPayment
    const annualRate = parseFloat(formData.interestRate) / 100
    const monthlyRate = annualRate / 12
    const totalMonths = parseInt(formData.loanYears) * 12
    const graceMonths = parseInt(formData.graceYears) * 12

    let schedule = []
    let totalInterest = 0
    let totalPayment = 0

    if (formData.paymentType === 'equal_payment') {
      // 本息平均攤還
      const monthlyPayment = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) / (Math.pow(1 + monthlyRate, totalMonths) - 1)

      let remainingPrincipal = loanAmount

      for (let month = 1; month <= totalMonths; month++) {
        const interestPayment = remainingPrincipal * monthlyRate
        const principalPayment = monthlyPayment - interestPayment
        remainingPrincipal -= principalPayment

        totalInterest += interestPayment
        totalPayment += monthlyPayment

        if (month <= 12 || month % 12 === 0) {
          schedule.push({
            month,
            year: Math.ceil(month / 12),
            monthlyPayment: Math.round(monthlyPayment),
            principalPayment: Math.round(principalPayment),
            interestPayment: Math.round(interestPayment),
            remainingPrincipal: Math.round(remainingPrincipal)
          })
        }
      }

      setResult({
        loanAmount,
        monthlyPayment: Math.round(monthlyPayment),
        totalPayment: Math.round(totalPayment),
        totalInterest: Math.round(totalInterest),
        schedule,
        paymentType: '本息平均攤還'
      })

    } else {
      // 本金平均攤還
      const monthlyPrincipal = loanAmount / totalMonths
      let remainingPrincipal = loanAmount

      for (let month = 1; month <= totalMonths; month++) {
        const interestPayment = remainingPrincipal * monthlyRate
        const monthlyPayment = monthlyPrincipal + interestPayment
        remainingPrincipal -= monthlyPrincipal

        totalInterest += interestPayment
        totalPayment += monthlyPayment

        if (month <= 12 || month % 12 === 0) {
          schedule.push({
            month,
            year: Math.ceil(month / 12),
            monthlyPayment: Math.round(monthlyPayment),
            principalPayment: Math.round(monthlyPrincipal),
            interestPayment: Math.round(interestPayment),
            remainingPrincipal: Math.round(remainingPrincipal)
          })
        }
      }

      setResult({
        loanAmount,
        firstMonthPayment: Math.round(monthlyPrincipal + (loanAmount * monthlyRate)),
        lastMonthPayment: Math.round(monthlyPrincipal + ((loanAmount / totalMonths) * monthlyRate)),
        totalPayment: Math.round(totalPayment),
        totalInterest: Math.round(totalInterest),
        schedule,
        paymentType: '本金平均攤還'
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">房貸試算工具</h1>
          <p className="text-gray-600">快速計算您的房貸月付金與總利息</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calculator Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Calculator className="mr-2 text-blue-600" />
              貸款資訊
            </h2>

            <div className="space-y-6">
              {/* House Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  房屋總價
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.housePrice}
                    onChange={(e) => setFormData({ ...formData, housePrice: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">元</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  ≈ {(parseInt(formData.housePrice || '0') / 10000).toLocaleString()} 萬元
                </p>
              </div>

              {/* Down Payment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自備款 (頭期款)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.downPayment}
                    onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">元</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  貸款成數: {(((parseInt(formData.housePrice || '0') - parseInt(formData.downPayment || '0')) / parseInt(formData.housePrice || '1')) * 100).toFixed(1)}%
                </p>
              </div>

              {/* Interest Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  年利率 (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  目前市場利率約 1.8% - 2.5%
                </p>
              </div>

              {/* Loan Years */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  貸款年限
                </label>
                <select
                  value={formData.loanYears}
                  onChange={(e) => setFormData({ ...formData, loanYears: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="10">10 年</option>
                  <option value="15">15 年</option>
                  <option value="20">20 年</option>
                  <option value="30">30 年</option>
                  <option value="40">40 年</option>
                </select>
              </div>

              {/* Grace Period */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  寬限期 (年)
                </label>
                <select
                  value={formData.graceYears}
                  onChange={(e) => setFormData({ ...formData, graceYears: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="0">無寬限期</option>
                  <option value="1">1 年</option>
                  <option value="2">2 年</option>
                  <option value="3">3 年</option>
                </select>
              </div>

              {/* Payment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  還款方式
                </label>
                <select
                  value={formData.paymentType}
                  onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="equal_payment">本息平均攤還</option>
                  <option value="equal_principal">本金平均攤還</option>
                </select>
              </div>

              <button
                onClick={calculateMortgage}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center"
              >
                <Calculator className="mr-2" size={20} />
                開始試算
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {result ? (
              <>
                {/* Main Result */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold mb-6">試算結果</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-blue-100 mb-1">貸款金額</p>
                      <p className="text-3xl font-bold">
                        {result.loanAmount.toLocaleString()} 元
                      </p>
                    </div>
                    <div className="pt-4 border-t border-blue-400">
                      <p className="text-blue-100 mb-1">
                        {result.paymentType === '本息平均攤還' ? '每月應付' : '首月應付'}
                      </p>
                      <p className="text-4xl font-bold">
                        {(result.monthlyPayment || result.firstMonthPayment).toLocaleString()}
                        <span className="text-xl ml-2">元</span>
                      </p>
                    </div>
                    {result.lastMonthPayment && (
                      <div>
                        <p className="text-blue-100 mb-1">末月應付</p>
                        <p className="text-2xl font-bold">
                          {result.lastMonthPayment.toLocaleString()} 元
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="font-bold text-gray-800 mb-4">貸款詳情</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">還款方式</span>
                      <span className="font-medium">{result.paymentType}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">總還款金額</span>
                      <span className="font-bold text-lg">{result.totalPayment.toLocaleString()} 元</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">總利息支出</span>
                      <span className="font-bold text-red-600">{result.totalInterest.toLocaleString()} 元</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">利息佔比</span>
                      <span className="font-medium">
                        {((result.totalInterest / result.totalPayment) * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="font-bold text-gray-800 mb-4">還款趨勢圖</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={result.schedule}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" label={{ value: '年', position: 'insideBottomRight', offset: -5 }} />
                      <YAxis label={{ value: '金額 (元)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip
                        formatter={(value: number) => value.toLocaleString() + ' 元'}
                        labelFormatter={(label) => `第 ${label} 年`}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="principalPayment" stroke="#3b82f6" name="本金" />
                      <Line type="monotone" dataKey="interestPayment" stroke="#ef4444" name="利息" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Schedule Table */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="font-bold text-gray-800 mb-4">還款明細表 (前 12 個月)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">期數</th>
                          <th className="px-4 py-2 text-right">每月應付</th>
                          <th className="px-4 py-2 text-right">本金</th>
                          <th className="px-4 py-2 text-right">利息</th>
                          <th className="px-4 py-2 text-right">剩餘本金</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {result.schedule.slice(0, 12).map((row: any) => (
                          <tr key={row.month} className="hover:bg-gray-50">
                            <td className="px-4 py-2">{row.month}</td>
                            <td className="px-4 py-2 text-right font-medium">
                              {row.monthlyPayment.toLocaleString()}
                            </td>
                            <td className="px-4 py-2 text-right text-blue-600">
                              {row.principalPayment.toLocaleString()}
                            </td>
                            <td className="px-4 py-2 text-right text-red-600">
                              {row.interestPayment.toLocaleString()}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {row.remainingPrincipal.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <TrendingDown className="mx-auto text-gray-300 mb-4" size={64} />
                <p className="text-gray-500">填寫左側資訊並點擊試算按鈕</p>
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-3 flex items-center">
            <DollarSign className="mr-2" />
            房貸小知識
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• <strong>本息平均攤還</strong>: 每月還款金額固定,前期利息較多,後期本金較多</li>
            <li>• <strong>本金平均攤還</strong>: 每月還款本金固定,總利息較少,但初期月付金較高</li>
            <li>• <strong>寬限期</strong>: 前幾年只還利息不還本金,適合短期資金壓力大的情況</li>
            <li>• 一般銀行貸款成數約 7-8 成,首購族可能有優惠利率</li>
            <li>• 提前還款可節省利息,但需注意是否有提前清償違約金</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
