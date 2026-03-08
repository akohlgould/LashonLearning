import React, { useState } from 'react';
import { Search, Menu, Globe, User, X, Bookmark, Type } from 'lucide-react';

const SefariaClone = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex flex-col h-screen bg-white font-sans text-gray-800">
            {/* Top Navigation */}
            <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
                <div className="flex items-center space-x-6">
                    <div className="text-blue-900 font-bold text-xl flex items-center">
                        <span className="mr-2 italic">S</span> Sefaria Library
                    </div>
                    <nav className="hidden md:flex space-x-4 text-gray-600 font-medium">
                        <a href="#" className="hover:text-blue-900">Texts</a>
                        <a href="#" className="hover:text-blue-900">Topics</a>
                        <a href="#" className="hover:text-blue-900">Donate</a>
                    </nav>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="bg-gray-100 rounded-full py-1 pl-10 pr-4 w-64 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                    </div>
                    <button className="bg-blue-900 text-white px-4 py-1 rounded font-bold">Sign Up</button>
                    <div className="flex space-x-2 text-gray-500">
                        <Globe className="w-5 h-5 cursor-pointer" />
                        <Menu className="w-5 h-5 cursor-pointer" />
                        <User className="w-5 h-5 cursor-pointer" />
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto flex flex-col">
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center">
                        <X className="w-5 h-5 text-gray-500 cursor-pointer" />
                        <h2 className="text-lg font-serif">משנה אבות ג׳</h2>
                        <div className="flex space-x-3 text-gray-500">
                            <Bookmark className="w-5 h-5" />
                            <Type className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="p-12 max-w-3xl mx-auto text-right leading-loose" dir="rtl">
                        <p className="text-3xl font-serif mb-8">
                            רַבִּי דוֹסְתַאי בַּרְבִּי יַנַּאי מִשּׁוּם רַבִּי מֵאִיר אוֹמֵר, כָּל הַשּׁוֹכֵחַ דָּבָר אֶחָד מִמִּשְׁנָתוֹ, מַעֲלֶה עָלָיו הַכָּתוּב כְּאִלּוּ מִתְחַיֵּב בְּנַפְשׁוֹ, שֶׁנֶּאֱמַר (דברים ד) רַק הִשָּׁמֶר לְךָ וּשְׁמֹר נַפְשְׁךָ מְאֹד פֶּן תִּשְׁכַּח אֶת
                            <span className="bg-blue-100 border-b-2 border-blue-400 px-1 cursor-pointer">הַדְּבָרִים</span>
                            אֲשֶׁר רָאוּ עֵינֶיךָ. יָכוֹל אֲפִלּוּ תָּקְפָה עָלָיו מִשְׁנָתוֹ, תַּלְמוּד לוֹמַר (שם) וּפֶן יָסוּרוּ מִלְּבָבְךָ כֹּל יְמֵי חַיֶּיךָ, הָא אֵינוֹ מִתְחַיֵּב בְּנַפְשׁוֹ עַד שֶׁיֵּשֵׁב וִיסִירָם מִלִּבּוֹ:
                        </p>
                    </div>
                </main>

                {/* Sidebar - Resources */}
                {sidebarOpen && (
                    <aside className="w-96 border-l border-gray-200 bg-gray-50 flex flex-col">
                        <div className="p-3 border-b border-gray-200 flex justify-between items-center text-gray-500 uppercase text-xs font-bold tracking-wider">
                            <span>Resources</span>
                            <div className="flex space-x-2">
                                <Type className="w-4 h-4" />
                                <X className="w-4 h-4 cursor-pointer" onClick={() => setSidebarOpen(false)} />
                            </div>
                        </div>

                        <div className="p-4">
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search Dictionary"
                                    className="w-full bg-white border border-gray-300 rounded-md py-1 pl-10 pr-4 focus:outline-none"
                                />
                            </div>

                            <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                                <div className="flex justify-center mb-4">
                                    <button className="text-xs border border-blue-400 text-blue-500 px-3 py-1 rounded">learn this word</button>
                                </div>
                                <div className="font-serif italic text-gray-700">
                                    <p className="font-bold">[דבר]</p>
                                    <p className="mt-2 text-sm leading-relaxed">
                                        <b>vb. speak</b> (original meaning <i>dub.</i>; <i>range in order</i> Thes is conjectural and not comprehensive enough; <i>treiben</i> MV does not explain Arabic or Heb. usage, but only Aramaic A meaning <i>go away</i>...)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
};

export default SefariaClone;