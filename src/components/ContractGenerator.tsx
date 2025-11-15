import React, { useState } from 'react';
import { KOL } from '../types/kol';
import { ContractVariables } from '../types/contract';
import { X, FileText, Download, Copy } from 'lucide-react';

interface ContractGeneratorProps {
  kol: KOL;
  onClose: () => void;
}

const ContractGenerator: React.FC<ContractGeneratorProps> = ({ kol, onClose }) => {
  const [variables, setVariables] = useState<ContractVariables>({
    kolName: kol.name,
    kolNickname: kol.nickname,
    kolEmail: kol.email,
    kolPhone: kol.phone,
    kolIdNumber: '',
    kolAddress: '',
    kolBankInfo: '',
    companyName: '育愛科技有限公司',
    companyRep: '張凱為',
    companyId: '69563216',
    companyContact: '楊羿米',
    companyPhone: '03-4928838',
    companyEmail: 'mefu0802@gmail.com',
    companyAddress: '桃園市中壢區大享街45之1號',
    projectName: '',
    productName: '',
    deliveryDate: '',
    startDate: '',
    endDate: '',
    profitPeriod: '每月',
    salesAmount: '',
    profitShareRate: '',
    bonusAmount: '',
    budget: '',
    paymentTerms: '合作結束後 30 日內支付',
    deliverables: '',
    socialPlatforms: '',
    additionalTerms: '',
    signDate: new Date().toISOString().split('T')[0]
  });

  // 預設合約範本 - 育愛科技合作授權書
  const defaultTemplate = `

                         育愛科技有限公司
                          合作授權書


合作對象：{{kolName}}



一、合作內容

    發文類型：指定社群平台推廣商品，影片+圖文開箱與評測。


二、立契約書人

【甲方】
    公司名稱：{{companyName}}
    負責人：{{companyRep}}
    統一編號：{{companyId}}
    聯繫窗口：{{companyContact}}
    聯繫電話：{{companyPhone}}
    Email：{{companyEmail}}
    公司地址：{{companyAddress}}

【乙方】
    姓名：{{kolName}}
    暱稱：{{kolNickname}}
    身分證字號/統一編號：{{kolIdNumber}}
    通訊地址：{{kolAddress}}
    聯繫電話：{{kolPhone}}
    Email：{{kolEmail}}
    匯款資料：{{kolBankInfo}}


三、預計寄出日

    合作商品：{{productName}}
    約定交稿日：{{deliveryDate}}


四、合作細節

    (一) 指定社群平台露出發文。

    (二) 商品特色&創作方向於簽約後提供、討論。

    (三) 初稿完成後請line通知，定稿發布後當天請提供貼文連結。

    (四) 原拍攝素材(照片/影片)請上傳指定雲端。上傳兩種：
         1. 原始拍攝未加字幕的影片/照片素材
         2. 剪輯加字後的完成稿影片

    (五) 每款贈購(分潤)為期6個月，開始日期依照簽署上架日或發布日為主


五、贈購銷售期間

    商品：{{productName}}
    贈購(分潤)開始：{{startDate}}
    贈購(分潤)結束：{{endDate}}


六、分潤合約

    (一) 分潤條件：贈零點零"埤礎之專屬連結"後下單。(取消/退貨訂單/未完成(未付款)不計入)

    (二) 分潤期限：發布日起+180天(6個月)，回贈購銷售期間。

    (三) 結算&匯款日：

         【結算日】贈購銷售期截止後30天內，甲方需按合作商品實際銷售狀況結算銷售
         總額，並以Line訊息通知乙方。

         【匯款日】乙方發布貼文及廣告主授權且結算日後，雙方確認金額無誤後30天內，
         將銷售分潤總額款項（銷售額減去以分潤佔比，全額以合報計算）匯入乙方指定之
         銀行帳戶。（逾例假日順延至次一工作日）

    (四) 分潤資訊：
         分潤週期：{{profitPeriod}}
         銷售金額：NT$ {{salesAmount}}
         分潤比例：{{profitShareRate}}%
         額外獎金：NT$ {{bonusAmount}}


七、內容授權

    (一) FB/IG 廣告主權限給予育愛科技有限公司長期投放廣告，創造雙贏互惠，並納入
         長期合作對象。

    (二) FB/IG 貼文加入「品牌合作」內容宣入標籤，FB標記 @mefu.shop；IG標記
         @mefu_shop @apexel_tw，創作原稿無使用、可重製作為二創使用、回函永久授權
         專圖文、影片給予本公司 複製、後製剪輯、轉載引用、擷取、行銷推廣使用，包含
         官網路宣傳、FB廣告、粉絲圈文案等等。

    (三) 乙方之部落格文章或社群貼文內容，甲方同時也會刊登在我司的部落格，內容有可能
         會針對SEO做些微調整、文案編修、富圖並標示來自之旬作者的部分。

    (四) 乙方同意授權上述產品二篇素材（照片、影片、文案），如有第三篇以上乙方自發性
         拍攝和推薦，甲方如需使用此類素材，需向乙方洽授授權方得使用。


八、指定社群平台露出

{{socialPlatforms}}


九、合作程規劃

    交付內容：
{{deliverables}}


十、【影片合作】約定事項

    (一) 影片長度至少 45~60 秒以上

    (二) 影片腳本可依照實際拍攝狀況做微幅調整，影片畫面比例希望為橫幅影片50%以上

    (三) 影片置入詞應與創作者供給在乙方方向、腳本大綱、宣傳畫面或拍攝場域/風格，
         宣傳屬性由創作者風格而定。

    (四) 影片審稿方向為: 影片標題趣味、提出影片基面劇減及補充字卡討論、影片節奏、
         順序、字卡、錯別字進行討論、資訊錯誤、合作重點提及但未出現。


十一、【圖文合作】約定事項

    (一) 一則圖文合作至少需拍攝 12-15 張照片以上。

    (二) 文案審稿方向為: 資訊錯誤、合作重點提及但未加入的資訊跟錯誤字修改

    (三) 拍攝照片以自然情境 且產品能夠辨識為主。


十二、合作約定事項

    第一條  甲方需於合作確認且簽訂合作授權書後，將商品寄給乙方，提供合作商品之
            使用注意事項，確認內容正確無誤。

    第二條  照片、影片拍攝注意事項：甲方若有預設的拍攝方向，或是一定要帶到的產品
            特色等重點，可以事先提供給乙方參考。主要創作內容由乙方之創作風格與拍攝，
            腳本大綱需經雙方確認後方能拍攝，以起到事宣傳完成後發方對影響內容認知有
            所不同。

    第三條  於合作期間內乙方 FB/IG 粉絲專頁開放 FB/IG 廣告主權限予甲方，其他廣告
            需求，雙方需另行洽談約定。

    第四條  影音／文案／圖文 修改與授權分享規則：
            (一) 雙方合作之影音、部落格文章或發文布文後，乙方不得任意刪除此文，甲方
                 自發布日起可無限引用，並放置於品牌粉專／產品網／電商平台／Instagram
                 ／facebook／YouTube等社群平台做宣傳推廣，且不限於台灣國度使用。
            (二) 甲方自授權期後即不得重新製之方創作內容，然授權期間內己使用或發布之
                 內容超過授權期後母移除

    第五條  乙方不得在合作期間內任意開閉本合作授權書指定露出之社群平台。若社群名稱
            有所更動，應唱時知甲方，然則方本合約的權益不受影響；本合作授權書 乙方
            不得片面增購修訂，更動時間及內容字句或照片。

    第六條  如有約定收回之產品，須保留完整包裝，保持商品與包裝的的吹淨、無損、無缺
            配件，若商品或包裝污損將約收款新算。

    第七條  非經雙方書面同意，不得片面取消合作授權書。若乙方因個人人因素推延影響業務
            進行，未執行合作內容須按照官網原價歸回甲方提供之產品，不得異議。

    第八條  乙方保證所提供之相關資料無侵害他人著作權、營業秘密、專利權及其他相關權利，
            如有違反，乙方應對甲方公司之損害（例如違失保金額等）及程序費用（例如律師費、
            訴訟費）負賠償責任。

    第九條  雙方同意几因本合作權書所發生之訴訟，均以臺灣新北地方法院為第一審管轄法院。

    第十條  甲方保證因甲方提供產品/任在何洞洛上或其他糾紛，由甲方全權負責，與乙方無關。

    其他條款：
    {{additionalTerms}}


十三、合約效力

    本合作授權書雙方均同意得使用，乙方商裝業上可採用之軟體簽訂，具確認簽名應以電子
    方式交付予雙方。本合約一式兩份，雙方各執一份，自簽署之日起生效。

    簽約日期：{{signDate}}




    甲方授權簽章：                        乙方授權人簽章：

    {{companyName}}                       {{kolName}}
    統一編號：{{companyId}}
    電話：{{companyPhone}}
    負責人：{{companyRep}}
    地址：{{companyAddress}}





                      © 2025 育愛科技有限公司. All rights reserved.

`;

  const [contractContent, setContractContent] = useState(defaultTemplate);

  // 替換合約變數
  const generateContract = () => {
    let result = contractContent;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value || `[請填寫${key}]`);
    });
    return result;
  };

  const finalContract = generateContract();

  // 複製到剪貼簿
  const copyToClipboard = () => {
    navigator.clipboard.writeText(finalContract);
    alert('合約已複製到剪貼簿！');
  };

  // 下載為文字檔
  const downloadContract = () => {
    const blob = new Blob([finalContract], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `合作合約_${kol.name}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 標題列 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText size={28} className="text-blue-600" />
            合約生成器 - {kol.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* 內容區 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左側：變數輸入 */}
            <div className="space-y-4 overflow-y-auto max-h-[70vh]">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 sticky top-0 bg-white z-10 pb-2">填寫合約資訊</h3>

              {/* 乙方資訊 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-3">乙方（KOL）資訊</h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">身分證字號/統一編號 *</label>
                    <input
                      type="text"
                      value={variables.kolIdNumber}
                      onChange={(e) => setVariables({ ...variables, kolIdNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="請輸入身分證字號或統一編號"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">通訊地址 *</label>
                    <input
                      type="text"
                      value={variables.kolAddress}
                      onChange={(e) => setVariables({ ...variables, kolAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="請輸入完整地址"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">匯款資料 *</label>
                    <input
                      type="text"
                      value={variables.kolBankInfo}
                      onChange={(e) => setVariables({ ...variables, kolBankInfo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="銀行名稱、分行、帳號"
                    />
                  </div>
                </div>
              </div>

              {/* 合作商品與期間 */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-3">合作商品與期間</h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">合作商品 *</label>
                    <input
                      type="text"
                      value={variables.productName}
                      onChange={(e) => setVariables({ ...variables, productName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例如：美妝保養組合"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">約定交稿日 *</label>
                    <input
                      type="date"
                      value={variables.deliveryDate}
                      onChange={(e) => setVariables({ ...variables, deliveryDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">贈購開始日 *</label>
                      <input
                        type="date"
                        value={variables.startDate}
                        onChange={(e) => setVariables({ ...variables, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">贈購結束日 *</label>
                      <input
                        type="date"
                        value={variables.endDate}
                        onChange={(e) => setVariables({ ...variables, endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 分潤資訊 */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-3">分潤資訊</h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">分潤週期 *</label>
                    <select
                      value={variables.profitPeriod}
                      onChange={(e) => setVariables({ ...variables, profitPeriod: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="每月">每月</option>
                      <option value="每季">每季</option>
                      <option value="每半年">每半年</option>
                      <option value="每年">每年</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">銷售金額</label>
                    <input
                      type="text"
                      value={variables.salesAmount}
                      onChange={(e) => setVariables({ ...variables, salesAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例如：500000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">分潤比例 (%)</label>
                    <input
                      type="text"
                      value={variables.profitShareRate}
                      onChange={(e) => setVariables({ ...variables, profitShareRate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例如：15"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">額外獎金</label>
                    <input
                      type="text"
                      value={variables.bonusAmount}
                      onChange={(e) => setVariables({ ...variables, bonusAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例如：10000"
                    />
                  </div>
                </div>
              </div>

              {/* 社群平台 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">指定社群平台露出 *</label>
                <textarea
                  value={variables.socialPlatforms}
                  onChange={(e) => setVariables({ ...variables, socialPlatforms: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="請輸入社群平台網址，每行一個：
Instagram: https://...
YouTube: https://...
Facebook: https://...
TikTok: https://..."
                />
              </div>

              {/* 交付內容 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">交付內容 *</label>
                <textarea
                  value={variables.deliverables}
                  onChange={(e) => setVariables({ ...variables, deliverables: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="請詳細描述交付內容，例如：
- Instagram 貼文 3 則
- YouTube 影片 1 支（5-8 分鐘）
- IG 限時動態 5 則
- Facebook 粉專貼文 2 則"
                />
              </div>

              {/* 其他條款 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">其他條款</label>
                <textarea
                  value={variables.additionalTerms}
                  onChange={(e) => setVariables({ ...variables, additionalTerms: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="選填：其他需要註明的條款或特殊約定"
                />
              </div>
            </div>

            {/* 右側：合約預覽 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">合約預覽</h3>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Copy size={16} />
                    複製
                  </button>
                  <button
                    onClick={downloadContract}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    <Download size={16} />
                    下載
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border border-gray-300 min-h-[600px]">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                  {finalContract}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按鈕 */}
        <div className="border-t p-6 bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractGenerator;
