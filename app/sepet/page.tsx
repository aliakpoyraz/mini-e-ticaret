"use client";

import { useCart } from '../context/cart-context';
import { useRouter } from 'next/navigation';
import { Trash2, ArrowRight, CreditCard, Wallet, Truck, User, MapPin, Phone, Mail, Building, Tag, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

const TURKISH_CITIES = [
    "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir",
    "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli",
    "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari",
    "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
    "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir",
    "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat",
    "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman",
    "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];



export default function CartPage() {
    const { items, updateQuantity, removeFromCart, clearCart } = useCart();
    const router = useRouter();
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const [isGuest, setIsGuest] = useState<boolean | null>(null);
    const [userData, setUserData] = useState<{ firstName: string, lastName: string, email: string, phone: string } | null>(null);
    const [showLoginPrompt, setShowLoginPrompt] = useState(true);
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneCode: '90',
        phone: '',
        city: 'İstanbul',
        addressDetail: '',
        paymentMethod: 'CREDIT_CARD'
    });

    const [cardData, setCardData] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: ''
    });

    const [cartDiscounts, setCartDiscounts] = useState<any[]>([]);

    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [couponError, setCouponError] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    useEffect(() => {
        // Indirimleri getir
        fetch('/api/discounts/cart')
            .then(res => res.json())
            .then(data => setCartDiscounts(data))
            .catch(err => console.error(err));

        // Kullanıcı oturumunu kontrol et
        fetch('/api/auth/me')
            .then(res => {
                if (res.ok) {
                    setIsGuest(false);
                    return res.json();
                } else {
                    setIsGuest(true);
                    return null;
                }
            })
            .then(data => {
                if (data && data.user) {
                    const sessionUser = data.user;
                    // fetch full profile for phone
                    fetch('/api/user/profile')
                        .then(r => r.json())
                        .then(profileData => {
                            const profile = profileData.user || sessionUser;
                            const rawPhone = profile.phone || '';
                            // Strip leading zero, keep only digits for the phone input
                            const cleanPhone = rawPhone.startsWith('0') ? rawPhone.slice(1) : rawPhone;

                            setUserData({
                                firstName: profile.firstName || '',
                                lastName: profile.lastName || '',
                                email: profile.email || '',
                                phone: cleanPhone
                            });

                            setFormData(prev => ({
                                ...prev,
                                firstName: profile.firstName || '',
                                lastName: profile.lastName || '',
                                email: profile.email || '',
                                phone: cleanPhone
                            }));
                        })
                        .catch(() => { });

                    // Fetch saved addresses
                    fetch('/api/user/addresses')
                        .then(r => r.json())
                        .then(addrData => {
                            if (addrData.addresses && addrData.addresses.length > 0) {
                                setSavedAddresses(addrData.addresses);
                                const def = addrData.addresses.find((a: any) => a.isDefault) || addrData.addresses[0];
                                setSelectedAddressId(def.id);
                                setFormData(prev => ({
                                    ...prev,
                                    city: def.city || 'İstanbul',
                                    addressDetail: def.address || ''
                                }));
                            }
                        })
                        .catch(() => { });
                }
            })
            .catch(err => console.error(err));
    }, []);

    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = 0; // kargo ücretsiz

    let discountAmount = 0;
    let appliedDiscountName = '';

    for (const d of cartDiscounts) {
        if (d.minCartValue === null || subtotal >= Number(d.minCartValue)) {
            if (d.type === 'PERCENTAGE') {
                discountAmount = subtotal * Number(d.value) / 100;
            } else if (d.type === 'FIXED') {
                discountAmount = Number(d.value);
                if (discountAmount > subtotal) discountAmount = subtotal;
            }
            appliedDiscountName = d.name;
            break;
        }
    }

    let couponDiscountAmount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === 'PERCENTAGE') {
            couponDiscountAmount = subtotal * Number(appliedCoupon.value) / 100;
        } else if (appliedCoupon.type === 'FIXED') {
            couponDiscountAmount = Number(appliedCoupon.value);
        }
    }

    let totalDiscount = discountAmount + couponDiscountAmount;
    if (totalDiscount > subtotal) totalDiscount = subtotal;

    const total = subtotal - totalDiscount + shipping;

    const handleApplyCoupon = async () => {
        setCouponError('');
        if (!couponCode) return;
        setIsApplyingCoupon(true);
        try {
            const res = await fetch('/api/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode, cartTotal: subtotal })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setAppliedCoupon(data.coupon);
            setCouponCode('');
        } catch (err: any) {
            setCouponError(err.message);
            setAppliedCoupon(null);
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponError('');
        setCouponCode('');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();

        if (items.length === 0) return;

        if (formData.paymentMethod === 'CREDIT_CARD') {
            if (!cardData.cardNumber || !cardData.cardName || !cardData.expiryDate || !cardData.cvv) {
                alert('Lütfen kredi kartı bilgilerini eksiksiz doldurun.');
                return;
            }
            if (cardData.cardNumber.replace(/\s/g, '').length < 16) {
                alert('Geçerli bir kredi kartı numarası girin.');
                return;
            }
            if (cardData.expiryDate.length < 5) {
                alert('Lütfen son kullanma tarihini AA/YY formatında girin.');
                return;
            }

            const expiryParts = cardData.expiryDate.split('/');
            if (expiryParts.length === 2) {
                const month = parseInt(expiryParts[0], 10);
                const year = parseInt(expiryParts[1], 10);
                const currentYear = new Date().getFullYear() % 100;

                if (month < 1 || month > 12) {
                    alert('Lütfen geçerli bir ay girin (01-12).');
                    return;
                }
                if (year < currentYear || year > currentYear + 20) {
                    alert('Lütfen geçerli bir yıl girin.');
                    return;
                }
            } else {
                alert('Lütfen son kullanma tarihini AA/YY formatında girin.');
                return;
            }

            if (cardData.cvv.length < 3) {
                alert('Lütfen geçerli bir CVV girin.');
                return;
            }
        }

        setIsCheckingOut(true);

        const customerName = `${formData.firstName} ${formData.lastName}`.trim() || formData.firstName;
        let customerAddress = `${formData.addressDetail}, ${formData.city}, Türkiye`;

        // Use selected saved address if logged in
        if (!isGuest && selectedAddressId) {
            const sel = savedAddresses.find(a => a.id === selectedAddressId);
            if (sel) {
                customerAddress = `${sel.address}, ${sel.city}, ${sel.country}`;
            }
        }
        const fullPhone = `+90 ${formData.phone}`;

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: items,
                    customerName: customerName,
                    customerEmail: formData.email,
                    customerPhone: fullPhone,
                    customerAddress: customerAddress,
                    paymentMethod: formData.paymentMethod,
                    couponCode: appliedCoupon?.code
                })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Checkout failed');
            }

            const order = await res.json();
            clearCart();
            router.push(`/siparislerim/${order.id}`);
        } catch (error: any) {
            alert(error.message);
            setIsCheckingOut(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="mb-6 inline-flex p-6 bg-slate-50 rounded-full text-slate-300">
                    <Trash2 size={48} />
                </div>
                <h1 className="text-2xl font-bold mb-4 text-slate-900">Sepetiniz Boş</h1>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">Görünüşe göre henüz sepetinize bir şey eklememişsiniz.</p>
                <button
                    onClick={() => router.push('/urunler')}
                    className="inline-flex items-center gap-2 bg-brand-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-500/30"
                >
                    Alışverişe Başla <ArrowRight size={20} />
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 pt-28 pb-12 max-w-7xl">
            <h1 className="text-3xl font-bold mb-8 text-slate-900 tracking-tight">Ödeme Yap</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Truck className="text-brand-600" /> Sipariş Öğeleri ({items.length})
                        </h2>
                        <div className="space-y-6">
                            {items.map((item) => (
                                <div key={item.variantId} className="flex gap-4 items-center group">
                                    <div className="w-20 h-20 bg-slate-50 rounded-xl flex-shrink-0 overflow-hidden border border-slate-100 relative">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs font-bold uppercase">
                                                Resim Yok
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-slate-900">{item.name}</h3>
                                            <p className="font-bold text-slate-900">{(item.price * item.quantity).toFixed(2)} ₺</p>
                                        </div>
                                        <p className="text-slate-500 text-sm mb-2">{item.variantName}</p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1 w-fit">
                                                    <button
                                                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                        className="w-8 h-8 flex items-center justify-center bg-white rounded-md text-slate-600 shadow-sm hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="text-sm font-bold text-slate-900 w-4 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                                        disabled={item.quantity >= item.stock}
                                                        className="w-8 h-8 flex items-center justify-center bg-white rounded-md text-slate-600 shadow-sm hover:text-slate-900 focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed transition"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                {item.quantity >= item.stock && (
                                                    <span className="text-[10px] text-orange-600 font-bold uppercase tracking-tight animate-fade-in pl-1">
                                                        Maks. Stok ({item.stock})
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.variantId)}
                                                className="text-slate-400 hover:text-red-500 transition p-2 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Özet</h2>

                        <div className="mb-6 pb-6 border-b border-slate-100">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Tag size={14} /> KUPON KODU</label>

                            {!appliedCoupon ? (
                                <div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Kupon Kodunuz"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            className="flex-1 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none transition bg-slate-50/50 font-mono text-sm uppercase placeholder:font-sans placeholder-normal"
                                        />
                                        <button
                                            onClick={handleApplyCoupon}
                                            type="button"
                                            disabled={isApplyingCoupon || !couponCode}
                                            className="bg-slate-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition disabled:opacity-50"
                                        >
                                            {isApplyingCoupon ? '...' : 'Uygula'}
                                        </button>
                                    </div>
                                    {couponError && <p className="text-red-500 text-xs font-bold mt-2">{couponError}</p>}
                                </div>
                            ) : (
                                <div className="bg-green-50/50 border border-green-100 rounded-xl p-3 flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-1 text-green-700 font-bold text-sm">
                                            <Check size={16} /> Kupon Uygulandı
                                        </div>
                                        <div className="text-green-600 text-xs font-mono mt-0.5">{appliedCoupon.code}</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveCoupon}
                                        className="text-slate-400 hover:text-red-500 p-1 transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-slate-600">
                                <span>Ara Toplam</span>
                                <span className="font-medium">{subtotal.toFixed(2)} ₺</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>İndirim ({appliedDiscountName})</span>
                                    <span className="font-bold">-{discountAmount.toFixed(2)} ₺</span>
                                </div>
                            )}
                            {appliedCoupon && (
                                <div className="flex justify-between text-brand-600">
                                    <span>Kupon İndirimi ({appliedCoupon.code})</span>
                                    <span className="font-bold">-{couponDiscountAmount.toFixed(2)} ₺</span>
                                </div>
                            )}
                            <div className="flex justify-between text-slate-600">
                                <span>Kargo</span>
                                <span className="text-green-600 font-bold">Ücretsiz</span>
                            </div>
                            <div className="border-t border-slate-100 pt-4 flex justify-between text-xl font-bold text-slate-900">
                                <span>Toplam</span>
                                <span>{total.toFixed(2)} ₺</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-lg shadow-slate-200/50 sticky top-24">
                        {isGuest && (
                            <div className="mb-8 p-4 bg-brand-50 border border-brand-100 rounded-xl">
                                <h3 className="text-brand-900 font-bold mb-2">Daha Hızlı Ödeme İçin</h3>
                                <p className="text-brand-700 text-sm mb-4">Kayıtlı adreslerinizi kullanmak ve siparişinizi kolayca takip etmek için giriş yapın.</p>
                                <div className="flex gap-3">
                                    <button onClick={() => router.push('/giris-yap?redirect=/sepet')} className="bg-brand-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-brand-700 transition">
                                        Giriş Yap
                                    </button>
                                    <button onClick={() => router.push('/kayit-ol?redirect=/sepet')} className="bg-white text-brand-600 px-5 py-2 rounded-lg text-sm font-bold border border-brand-200 hover:bg-brand-50 transition">
                                        Kayıt Ol
                                    </button>
                                </div>
                            </div>
                        )}

                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Wallet className="text-brand-600" /> Müşteri Bilgileri
                        </h2>

                        <form onSubmit={handleCheckout} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                        <User size={16} className="text-slate-400" /> Ad
                                    </label>
                                    <input
                                        name="firstName"
                                        required
                                        placeholder="Ahmet"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '') }))}
                                        className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none transition bg-slate-50/50 text-slate-900 font-medium placeholder:font-normal placeholder:text-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">&nbsp;Soyad</label>
                                    <input
                                        name="lastName"
                                        required
                                        placeholder="Yılmaz"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '') }))}
                                        className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none transition bg-slate-50/50 text-slate-900 font-medium placeholder:font-normal placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                        <Mail size={16} className="text-slate-400" /> E-posta
                                    </label>
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="ahmet@ornek.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none transition bg-slate-50/50 text-slate-900 font-medium placeholder:font-normal placeholder:text-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                        <Phone size={16} className="text-slate-400" /> Telefon
                                    </label>
                                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/50 focus-within:ring-2 focus-within:ring-brand-500 transition overflow-hidden">
                                        <span className="pl-4 pr-2 text-sm font-semibold text-slate-500 whitespace-nowrap select-none">+90</span>
                                        <input
                                            name="phone"
                                            type="tel"
                                            inputMode="numeric"
                                            required
                                            maxLength={10}
                                            placeholder="5321234567"
                                            value={formData.phone}
                                            onChange={(e) => {
                                                const raw = e.target.value.replace(/\D/g, '');
                                                const cleaned = raw.startsWith('0') ? raw.slice(1) : raw;
                                                setFormData(prev => ({ ...prev, phone: cleaned.slice(0, 10) }));
                                            }}
                                            className="flex-1 px-2 py-3 bg-transparent outline-none text-sm text-slate-900 font-medium placeholder:font-normal placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <MapPin size={16} className="text-slate-400" /> Teslimat Adresi
                                </label>

                                {/* Saved Address Selector for logged-in users */}
                                {!isGuest && savedAddresses.length > 0 ? (
                                    <div className="space-y-3">
                                        {savedAddresses.map((addr) => (
                                            <label
                                                key={addr.id}
                                                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${selectedAddressId === addr.id
                                                    ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="savedAddress"
                                                    className="mt-1 accent-brand-600"
                                                    checked={selectedAddressId === addr.id}
                                                    onChange={() => setSelectedAddressId(addr.id)}
                                                />
                                                <div>
                                                    <div className="font-bold text-sm text-slate-900">{addr.title}</div>
                                                    <div className="text-slate-600 text-xs mt-0.5">{addr.address}, {addr.city}</div>
                                                </div>
                                            </label>
                                        ))}
                                        <a href="/hesabim/adreslerim" className="text-xs font-semibold text-brand-600 hover:text-brand-700 pl-1 inline-block">
                                            + Yeni adres ekle
                                        </a>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">ÜLKE</label>
                                                <input
                                                    value="Türkiye"
                                                    readOnly
                                                    className="w-full border border-slate-200 p-3 rounded-xl bg-slate-100 text-slate-500 font-medium cursor-not-allowed select-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">ŞEHİR</label>
                                                <select
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none transition bg-slate-50/50 text-slate-900 font-medium appearance-none cursor-pointer"
                                                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.75rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                                                >
                                                    {TURKISH_CITIES.map(city => (
                                                        <option key={city} value={city}>{city}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">ADRES DETAYLARI</label>
                                            <textarea
                                                name="addressDetail"
                                                required={selectedAddressId === null}
                                                placeholder="Sokak, Bina No, Kapı No..."
                                                value={formData.addressDetail}
                                                onChange={handleInputChange}
                                                className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none transition bg-slate-50/50 min-h-[80px] resize-none text-slate-900 font-medium placeholder:font-normal placeholder:text-slate-400"
                                            />
                                        </div>
                                        {!isGuest && savedAddresses.length === 0 && (
                                            <p className="text-xs text-brand-600 mt-2">
                                                <a href="/hesabim/adreslerim" className="font-semibold hover:underline">Hesabım</a>'a giderek adres kaydedebilirsiniz.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <CreditCard size={16} className="text-slate-400" /> Ödeme Yöntemi
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <label className={`border rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${formData.paymentMethod === 'CREDIT_CARD' ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-500' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="CREDIT_CARD"
                                            className="hidden"
                                            checked={formData.paymentMethod === 'CREDIT_CARD'}
                                            onChange={handleInputChange}
                                        />
                                        <CreditCard size={24} />
                                        <span className="text-xs font-bold uppercase tracking-wider text-center">Kredi Kartı</span>
                                    </label>
                                    <label className={`border rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${formData.paymentMethod === 'CASH_ON_DELIVERY' ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-500' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="CASH_ON_DELIVERY"
                                            className="hidden"
                                            checked={formData.paymentMethod === 'CASH_ON_DELIVERY'}
                                            onChange={handleInputChange}
                                        />
                                        <Wallet size={24} />
                                        <span className="text-xs font-bold uppercase tracking-wider text-center">Kapıda Ödeme</span>
                                    </label>
                                </div>
                            </div>

                            {formData.paymentMethod === 'CREDIT_CARD' && (
                                <div className="space-y-4 pt-6 border-t border-slate-100 mt-6 !mb-6">
                                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
                                        <CreditCard size={16} className="text-slate-400" /> Kredi Kartı Bilgileri
                                    </h3>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Kart Üzerindeki İsim</label>
                                        <input
                                            type="text"
                                            required={formData.paymentMethod === 'CREDIT_CARD'}
                                            placeholder="Ad Soyad"
                                            value={cardData.cardName}
                                            onChange={(e) => setCardData({ ...cardData, cardName: e.target.value })}
                                            className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none transition bg-slate-50/50 text-slate-900 font-medium placeholder:font-normal placeholder:text-slate-400"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Kart Numarası</label>
                                        <input
                                            type="text"
                                            required={formData.paymentMethod === 'CREDIT_CARD'}
                                            placeholder="0000 0000 0000 0000"
                                            maxLength={19}
                                            value={cardData.cardNumber}
                                            onChange={(e) => {
                                                let val = e.target.value.replace(/\D/g, '');
                                                let formattedVal = '';
                                                for (let i = 0; i < val.length; i++) {
                                                    if (i > 0 && i % 4 === 0) formattedVal += ' ';
                                                    formattedVal += val[i];
                                                }
                                                setCardData({ ...cardData, cardNumber: formattedVal });
                                            }}
                                            className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none transition bg-slate-50/50 text-slate-900 font-medium placeholder:font-normal placeholder:text-slate-400 font-mono tracking-wider"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Son Kullanma Tarihi</label>
                                            <input
                                                type="text"
                                                required={formData.paymentMethod === 'CREDIT_CARD'}
                                                placeholder="AA/YY"
                                                maxLength={5}
                                                value={cardData.expiryDate}
                                                onChange={(e) => {
                                                    let val = e.target.value.replace(/\D/g, '');
                                                    if (val.length > 2) {
                                                        val = val.substring(0, 2) + '/' + val.substring(2, 4);
                                                    }
                                                    setCardData({ ...cardData, expiryDate: val });
                                                }}
                                                className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none transition bg-slate-50/50 text-slate-900 font-medium placeholder:font-normal placeholder:text-slate-400 text-center font-mono tracking-wider"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">CVV</label>
                                            <input
                                                type="text"
                                                required={formData.paymentMethod === 'CREDIT_CARD'}
                                                placeholder="123"
                                                maxLength={4}
                                                value={cardData.cvv}
                                                onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })}
                                                className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none transition bg-slate-50/50 text-slate-900 font-medium placeholder:font-normal placeholder:text-slate-400 text-center font-mono tracking-wider"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isCheckingOut}
                                className={`w-full py-4 rounded-xl text-lg font-bold text-white flex items-center justify-center gap-2 transition-all shadow-xl shadow-brand-500/20 hover:-translate-y-1 ${isCheckingOut ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-brand-600 hover:bg-brand-700'}`}
                            >
                                {isCheckingOut ? 'Sipariş İşleniyor...' : (
                                    <>Siparişi Ver <ArrowRight size={20} /></>
                                )}
                            </button>
                            <p className="text-center text-xs text-slate-400">
                                Bu siparişi vererek, Hizmet Şartlarımızı kabul etmiş olursunuz.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
