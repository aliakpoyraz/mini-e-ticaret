export default function TailwindTestPage() {
    return (
        <div className="min-h-screen bg-gray-100 p-10 flex flex-col items-center gap-10">
            <h1 className="text-4xl font-bold text-blue-600 mb-4">Tailwind Test Page</h1>

            {/* 1. Basic Colors & Backgrounds */}
            <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">1. Colors & Backgrounds</h2>
                <div className="grid grid-cols-4 gap-4">
                    <div className="h-16 bg-red-500 rounded flex items-center justify-center text-white font-bold">Red</div>
                    <div className="h-16 bg-blue-500 rounded flex items-center justify-center text-white font-bold">Blue</div>
                    <div className="h-16 bg-green-500 rounded flex items-center justify-center text-white font-bold">Green</div>
                    <div className="h-16 bg-purple-500 rounded flex items-center justify-center text-white font-bold">Purple</div>
                </div>
            </div>

            {/* 2. Brand Colors (Custom Config) */}
            <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">2. Custom Brand Colors</h2>
                <p className="mb-4 text-gray-600">These should use the 'brand' colors defined in tailwind.config.ts</p>
                <div className="grid grid-cols-5 gap-2">
                    <div className="h-12 bg-brand-100 rounded">100</div>
                    <div className="h-12 bg-brand-300 rounded">300</div>
                    <div className="h-12 bg-brand-500 rounded text-white flex items-center justify-center">500</div>
                    <div className="h-12 bg-brand-700 rounded text-white flex items-center justify-center">700</div>
                    <div className="h-12 bg-brand-900 rounded text-white flex items-center justify-center">900</div>
                </div>
            </div>

            {/* 3. Typography & Spacing */}
            <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-lg space-y-4">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">3. Typography & Spacing</h2>
                <p className="text-xs text-gray-500">text-xs</p>
                <p className="text-sm text-gray-700">text-sm (gray-700)</p>
                <p className="text-base font-medium">text-base font-medium</p>
                <p className="text-lg font-bold tracking-wide uppercase">text-lg bold tracking-wide</p>
                <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-600">
                    Gradient Text
                </p>
            </div>

            {/* 4. Effects & Interactions */}
            <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">4. Effects & Hover</h2>
                <div className="flex gap-4">
                    <button className="bg-brand-600 text-white px-6 py-2 rounded shadow hover:bg-brand-700 transition hover:scale-105 active:scale-95">
                        Hover Me (Scale)
                    </button>
                    <div className="w-32 h-12 bg-white border rounded shadow-sm hover:shadow-xl transition-shadow flex items-center justify-center">
                        Hover Shadow
                    </div>
                    <div className="w-32 h-12 bg-white/50 backdrop-blur-md border border-gray-200 rounded flex items-center justify-center">
                        Glass Effect
                    </div>
                </div>
            </div>

            {/* 5. Responsive Grid */}
            <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">5. Responsive Grid</h2>
                <p className="mb-2 text-sm text-gray-500">Resize window to see columns change</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-100 p-4 rounded text-center">Col 1</div>
                    <div className="bg-gray-100 p-4 rounded text-center">Col 2</div>
                    <div className="bg-gray-100 p-4 rounded text-center">Col 3</div>
                    <div className="bg-gray-100 p-4 rounded text-center">Col 4</div>
                </div>
            </div>
        </div>
    );
}
