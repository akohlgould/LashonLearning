import React, { useState } from 'react';
import { Search, User, X, Bookmark, Type, ChevronLeft, Loader2, BookOpen, Users } from 'lucide-react';

const Lashonia = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('lexicon');
    const [selectedWord, setSelectedWord] = useState("");
    const [data, setData] = useState({ lexicon: null, bio: null });
    const [loading, setLoading] = useState(false);

    // MOCK DATA: Updated with your specific Rabbi & Lexicon data
    const bioData = {
        "rabbi-meir": {
            title: "רבי מאיר",
            nameEn: "R. Meir",
            sub: "Tannaim - Fifth Generation (c.135 – c.170 CE)",
            desc: "R. Meir was a second century scholar whose teachings are quoted frequently in the Mishnah. He studied under Elisha b. Abuya, R. Yishmael, and R. Akiva. He later became the head of the court in Usha."
        },
        "rabbi-dostai-b-r-yannai": {
            title: "רבי דוסתאי ברבי ינאי",
            nameEn: "R. Dostai b. Yannai",
            sub: "Tannaim - Fifth Generation (c.135 – c.170 CE)",
            desc: "R. Dostai b. Yannai appears throughout the Talmud and Midrash, primarily as a teacher of homiletical ideas. It is likely that he was a student of R. Meir."
        }
    };

    const localLexicon = {
        "מִשּׁוּם": [{
            source: "Klein Dictionary",
            word: "מִשּׁוּם (prep.)",
            definition: "from the point of view. because of. [Formed from שׁוּם (= name) with prep. מִ◌.]"
        }],
        "אוֹמֵר": [{
            source: "BDB Dictionary",
            word: "אָמַר",
            definition: "vb. utter, say (MI Ph. אמר, Aramaic אֲמַר, Ethiopic አመረ I. 2 shew, declare). Qal Pf. א׳ Gn 3:1 +; Say (subj. God Gn 3:1 + or man 32:5)."
        }],
        "כָּל": [{
            source: "Jastrow Dictionary",
            word: "כָּל, כֹּל",
            definition: "all, every one. דברי הכל the words of all, (it is) the unanimous opinion, all agree. כָּל שֶׁהוּא whatever it be, i.e. the smallest quantity."
        }]
    };

    // Text with embedded Sefaria-style links
    const rawHtmlText = `
        <a class="entity-link" data-slug="rabbi-dostai-b-r-yannai">רַבִּי דּוֹסְתַּאי בְּרַבִּי יַנַּאי</a> 
        <span class="word">מִשּׁוּם</span> 
        <a class="entity-link" data-slug="rabbi-meir">רַבִּי מֵאִיר</a> 
        <span class="word">אוֹמֵר</span>, 
        <span class="word">כָּל</span> הַשּׁוֹכֵחַ דָּבָר אֶחָד מִמִּשְׁנָתוֹ...
    `;

    const handleTextClick = async (e) => {
        const target = e.target;
        const slug = target.getAttribute('data-slug');
        const wordText = target.innerText.replace(/[^\u05D0-\u05EA]/g, ""); // Clean Hebrew

        setLoading(true);
        setSelectedWord(target.innerText);

        // 1. Check for Biography Slug
        if (slug && bioData[slug]) {
            setData({ lexicon: null, bio: bioData[slug] });
            setActiveTab('bio');
            setLoading(false);
            return;
        }

        // 2. Check for Local Lexicon first, then Fetch API
        if (localLexicon[target.innerText]) {
            setData({ bio: null, lexicon: localLexicon[target.innerText] });
            setActiveTab('lexicon');
            setLoading(false);
        } else {
            try {
                const response = await fetch(`https://www.sefaria.org/api/words/${wordText}`);
                const result = await response.json();
                setData({ bio: null, lexicon: result });
                setActiveTab('lexicon');
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        }
    };

    return (
        <div className="flex flex-col h-screen bg-white font-sans text-[#333]">
            <header className="flex items-center justify-between px-6 py-2 border-b border-gray-200 z-20 shadow-sm bg-white">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-[#18345D] rounded-full flex items-center justify-center text-white font-serif italic text-xl pt-1">ל</div>
                    <span className="text-[#18345D] font-bold text-lg tracking-tight uppercase">Lashonia</span>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999] w-4 h-4" />
                        <input type="text" placeholder="Search Lashonia..." className="bg-[#EDEDEC] rounded-full py-1.5 pl-10 pr-4 w-64 text-sm focus:outline-none"/>
                    </div>
                    <User className="w-5 h-5 text-[#999]" />
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <main className="flex-1 overflow-y-auto relative border-r border-[#E5E5E5]">
                    <div className="h-1 w-full bg-[#5A99B7] sticky top-0 z-10"></div>
                    <div className="max-w-3xl mx-auto px-8 py-20 text-right leading-[2.5]" dir="rtl">
                        <div
                            className="text-[32px] font-serif cursor-default"
                            style={{ fontFamily: "'Taamey Frank CLM', serif" }}
                            onClick={handleTextClick}
                        >
                            {/* Rendering the text as clickable spans/links */}
                            <span className="hover:bg-gray-100 px-1 rounded cursor-pointer transition-colors" data-slug="rabbi-dostai-b-r-yannai">רַבִּי דּוֹסְתַּאי בְּרַבִּי יַנַּאי</span>
                            {" "}
                            <span className="hover:bg-gray-100 px-1 rounded cursor-pointer transition-colors">מִשּׁוּם</span>
                            {" "}
                            <span className="hover:bg-gray-100 px-1 rounded cursor-pointer transition-colors" data-slug="rabbi-meir">רַבִּי מֵאִיר</span>
                            {" "}
                            <span className="hover:bg-gray-100 px-1 rounded cursor-pointer transition-colors">אוֹמֵר</span>,
                            {" "}
                            <span className="hover:bg-gray-100 px-1 rounded cursor-pointer transition-colors">כָּל</span>
                            {" "}
                            הַשּׁוֹכֵחַ דָּבָר אֶחָד מִמִּשְׁנָתוֹ...
                        </div>
                    </div>
                </main>

                {sidebarOpen && (
                    <aside className="w-[450px] bg-[#FBFBFA] border-l border-[#E5E5E5] flex flex-col shadow-inner">
                        <div className="flex border-b border-gray-200 bg-white">
                            <button onClick={() => setActiveTab('lexicon')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center space-x-2 ${activeTab === 'lexicon' ? 'border-b-2 border-[#18345D] text-[#18345D]' : 'text-[#999]'}`}><BookOpen className="w-3 h-3" /> <span>Lexicon</span></button>
                            <button onClick={() => setActiveTab('bio')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center space-x-2 ${activeTab === 'bio' ? 'border-b-2 border-[#18345D] text-[#18345D]' : 'text-[#999]'}`}><Users className="w-3 h-3" /> <span>Biographies</span></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {loading ? (
                                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#18345D]" /></div>
                            ) : (
                                <div className="space-y-6">
                                    {activeTab === 'lexicon' && data.lexicon ? (
                                        data.lexicon.map((entry, idx) => (
                                            <div key={idx} className="bg-white p-5 rounded border border-gray-200 shadow-sm">
                                                <span className="text-[9px] font-bold text-[#5A99B7] uppercase tracking-tighter">{entry.source}</span>
                                                <h3 className="text-xl font-serif font-bold mb-2">{entry.word}</h3>
                                                <div className="text-sm text-[#555] italic leading-relaxed">{entry.definition}</div>
                                            </div>
                                        ))
                                    ) : activeTab === 'bio' && data.bio ? (
                                        <div className="bg-white p-6 rounded border border-gray-200 shadow-sm border-t-4 border-t-[#CCB479]">
                                            <h3 className="text-2xl font-bold text-[#18345D] mb-1">{data.bio.title}</h3>
                                            <p className="text-xs text-gray-500 mb-1">{data.bio.nameEn}</p>
                                            <p className="text-[10px] text-[#CCB479] mb-4 font-bold uppercase tracking-wide">{data.bio.sub}</p>
                                            <p className="text-sm leading-relaxed text-[#444]">{data.bio.desc}</p>
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 text-[#999] text-sm italic">Click a linked name or a word to see details.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
};

export default Lashonia;