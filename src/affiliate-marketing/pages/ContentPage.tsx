import React, { useState } from 'react';
import { FileText, Image, Video, Check, Copy, RefreshCw, Save, Send, Sparkles, Download } from 'lucide-react';
import { mockProducts } from '../services/mockData';
import { ContentType, Platform, Tone, ImageStyle, ImageSize, VideoType, VideoLength } from '../types';

type Tab = 'copy' | 'image' | 'video';

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<Tab>('copy');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [contentType, setContentType] = useState<ContentType>('list');
  const [platform, setPlatform] = useState<Platform>('facebook');
  const [tone, setTone] = useState<Tone>('casual');
  const [generatedCopy, setGeneratedCopy] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [imageStyle, setImageStyle] = useState<ImageStyle>('white-bg');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [videoType, setVideoType] = useState<VideoType>('unboxing');
  const [videoLength, setVideoLength] = useState<VideoLength>('30s');
  const [generatedScript, setGeneratedScript] = useState<any>(null);

  const handleGenerateCopy = async () => {
    if (selectedProducts.length === 0) return;
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const selectedProductNames = selectedProducts.map((id) => mockProducts.find((p) => p.id === id)?.name).filter(Boolean);
    setGeneratedCopy(`🎯 網友激推！${selectedProductNames.length} 個超值好物大公開\n\n最近整理了一些自己用過覺得很讚的東西，今天來跟大家分享～\n\n${selectedProductNames.map((name, i) => `${i + 1}️⃣ ${name}\n   真心推薦，用過回不去！`).join('\n\n')}\n\n每一個都是自己買過、用過才敢推薦的\n連結都整理在留言區囉～\n\n#蝦皮好物 #好物清單 #推薦清單`);
    setIsGenerating(false);
  };

  const handleGenerateImage = async () => {
    if (selectedProducts.length === 0) return;
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2500));
    setGeneratedImages(['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500']);
    setIsGenerating(false);
  };

  const handleGenerateScript = async () => {
    if (selectedProducts.length === 0) return;
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const productName = mockProducts.find((p) => p.id === selectedProducts[0])?.name;
    setGeneratedScript({
      scenes: [
        { sceneNumber: 1, duration: '0-5秒', dialogue: '欸！你們知道這個東西有多好用嗎？', visualDescription: '拿起商品，表情驚喜' },
        { sceneNumber: 2, duration: '5-15秒', dialogue: `這個 ${productName} 我已經用了一個月，真的回不去了`, visualDescription: '展示商品細節，示範使用' },
        { sceneNumber: 3, duration: '15-25秒', dialogue: '它的優點是...（說明 2-3 個優點）', visualDescription: '實際使用畫面，特寫功能' },
        { sceneNumber: 4, duration: '25-30秒', dialogue: '連結放在我的主頁，有需要的快去看看！', visualDescription: '指向畫面，CTA 動作' },
      ],
      titleOptions: [`這個${productName}也太好用了吧！`, `用了就回不去的好物推薦`, `${productName}開箱實測`],
      hashtags: ['#蝦皮好物', '#開箱', '#好物推薦', '#生活分享', '#必買清單'],
    });
    setIsGenerating(false);
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedContent(true);
    setTimeout(() => setCopiedContent(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI 內容生成</h1>
        <p className="text-gray-600">選擇商品，讓 AI 幫你產出高轉換內容</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[{ id: 'copy', label: '文案生成', icon: FileText }, { id: 'image', label: '圖片生成', icon: Image }, { id: 'video', label: '影片腳本', icon: Video }].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)} className={`flex items-center gap-2 px-6 py-3 font-medium transition border-b-2 -mb-px ${activeTab === tab.id ? 'text-indigo-600 border-indigo-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}>
            <tab.icon className="w-5 h-5" />{tab.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Settings */}
        <div className="space-y-6">
          {/* Select Products */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">選擇商品</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {mockProducts.map((product) => (
                <label key={product.id} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${selectedProducts.includes(product.id) ? 'bg-indigo-50 border-2 border-indigo-300' : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'}`}>
                  <input type="checkbox" checked={selectedProducts.includes(product.id)} onChange={(e) => e.target.checked ? setSelectedProducts([...selectedProducts, product.id]) : setSelectedProducts(selectedProducts.filter((id) => id !== product.id))} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                  <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-sm text-gray-500">${product.price}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Tab-specific settings */}
          {activeTab === 'copy' && (
            <>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">內容類型</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[{ id: 'single', label: '單品開箱文' }, { id: 'list', label: '多品項清單' }, { id: 'compare', label: '比較文' }, { id: 'ai-pick', label: 'AI 選物文' }].map((type) => (
                    <button key={type.id} onClick={() => setContentType(type.id as ContentType)} className={`p-3 rounded-lg text-sm font-medium transition ${contentType === type.id ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300' : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'}`}>{type.label}</button>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">平台 & 語氣</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">發布平台</label>
                    <div className="flex gap-2">
                      {[{ id: 'facebook', label: 'FB 長文' }, { id: 'instagram', label: 'IG' }, { id: 'line', label: 'LINE 群' }].map((p) => (
                        <button key={p.id} onClick={() => setPlatform(p.id as Platform)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${platform === p.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{p.label}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">語氣風格</label>
                    <div className="flex gap-2">
                      {[{ id: 'sales', label: '實測老闆' }, { id: 'comparison', label: '理性比較' }, { id: 'casual', label: '生活聊天' }].map((t) => (
                        <button key={t.id} onClick={() => setTone(t.id as Tone)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tone === t.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{t.label}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'image' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">圖片風格</label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ id: 'white-bg', label: '去背純白' }, { id: 'office', label: '辦公桌' }, { id: 'kitchen', label: '廚房' }, { id: 'bedroom', label: '臥室' }].map((style) => (
                    <button key={style.id} onClick={() => setImageStyle(style.id as ImageStyle)} className={`p-3 rounded-lg text-sm font-medium transition ${imageStyle === style.id ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300' : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'}`}>{style.label}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'video' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">影片類型</label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ id: 'unboxing', label: '開箱' }, { id: 'ranking', label: '排行榜' }, { id: 'compare', label: '比較' }, { id: 'lifestyle', label: '生活置入' }].map((type) => (
                    <button key={type.id} onClick={() => setVideoType(type.id as VideoType)} className={`p-3 rounded-lg text-sm font-medium transition ${videoType === type.id ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300' : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'}`}>{type.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">影片長度</label>
                <div className="flex gap-2">
                  {[{ id: '15s', label: '15 秒' }, { id: '30s', label: '30 秒' }].map((len) => (
                    <button key={len.id} onClick={() => setVideoLength(len.id as VideoLength)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${videoLength === len.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{len.label}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button onClick={activeTab === 'copy' ? handleGenerateCopy : activeTab === 'image' ? handleGenerateImage : handleGenerateScript} disabled={selectedProducts.length === 0 || isGenerating} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
            {isGenerating ? <><RefreshCw className="w-5 h-5 animate-spin" />AI 生成中...</> : <><Sparkles className="w-5 h-5" />生成{activeTab === 'copy' ? '文案' : activeTab === 'image' ? '圖片' : '腳本'}</>}
          </button>
        </div>

        {/* Right: Generated Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">生成結果</h3>

          {activeTab === 'copy' && (generatedCopy ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg"><pre className="whitespace-pre-wrap text-gray-800 font-sans">{generatedCopy}</pre></div>
              <div className="flex gap-2">
                <button onClick={handleGenerateCopy} className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"><RefreshCw className="w-4 h-4" />再次生成</button>
                <button onClick={() => handleCopy(generatedCopy)} className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition">{copiedContent ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}{copiedContent ? '已複製' : '複製'}</button>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"><Send className="w-4 h-4" />建立貼文草稿</button>
              </div>
            </div>
          ) : <div className="text-center py-12 text-gray-500"><FileText className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>選擇商品並點擊生成</p></div>)}

          {activeTab === 'image' && (generatedImages.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {generatedImages.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} alt={`Generated ${i + 1}`} className="w-full aspect-square object-cover rounded-lg" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button className="p-2 bg-white rounded-lg"><Download className="w-5 h-5" /></button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"><Send className="w-4 h-4" />加到貼文草稿</button>
            </div>
          ) : <div className="text-center py-12 text-gray-500"><Image className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>選擇商品並設定風格後點擊生成</p></div>)}

          {activeTab === 'video' && (generatedScript ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">標題候選</h4>
                <div className="space-y-2">
                  {generatedScript.titleOptions.map((title: string, i: number) => (
                    <div key={i} className="p-2 bg-gray-50 rounded text-sm flex items-center justify-between"><span>{title}</span><button onClick={() => handleCopy(title)} className="text-gray-400 hover:text-gray-600"><Copy className="w-4 h-4" /></button></div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">分鏡腳本</h4>
                <div className="space-y-3">
                  {generatedScript.scenes.map((scene: any) => (
                    <div key={scene.sceneNumber} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">{scene.sceneNumber}</span>
                        <span className="text-sm text-gray-500">{scene.duration}</span>
                      </div>
                      <p className="font-medium text-gray-900 mb-1">「{scene.dialogue}」</p>
                      <p className="text-sm text-gray-500">畫面：{scene.visualDescription}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Hashtag 推薦</h4>
                <div className="flex flex-wrap gap-2">
                  {generatedScript.hashtags.map((tag: string) => <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">{tag}</span>)}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"><Download className="w-4 h-4" />匯出 PDF</button>
                <button className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"><Save className="w-4 h-4" />存成專案</button>
              </div>
            </div>
          ) : <div className="text-center py-12 text-gray-500"><Video className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>選擇商品並設定類型後點擊生成</p></div>)}
        </div>
      </div>
    </div>
  );
}
