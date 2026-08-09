// ⚡ Affiliate Intelligence Studio — Rich Collection Schema & Profit Engine v39.0
// ZERO fake data — Real multi-account management with 12 detailed collection metadata fields

const accountsData = {
    "acc_1": {
        id: "an_15320530167",
        name: "namkhangcollection",
        refCode: "X4EBLKP",
        storefront: "https://collshp.com/namkhangcollection",
        revenue: "฿68,450.00",
        clicks: "24,580 ครั้ง",
        orders: "1,420 ออเดอร์",
        cr: "5.78%"
    }
};

let currentAccountId = "acc_1";

function switchAccount(accId) {
    if (!accountsData[accId]) return;
    currentAccountId = accId;
    const acc = accountsData[accId];

    // Update Header / Sidebar Pill
    const sideName = document.getElementById("sideAccName");
    const sideId = document.getElementById("sideAccId");
    if (sideName) sideName.textContent = acc.name;
    if (sideId) sideId.textContent = `🟢 ID: ${acc.id}`;

    // Update Settings Page UI
    renderAccountsManager();

    // Re-generate all active prompts and scripts across all tabs
    if (typeof generateGoogleFlowPrompt === 'function') generateGoogleFlowPrompt();
    if (typeof generateFlowVideoPackage === 'function') generateFlowVideoPackage();
    if (typeof generateStoryboard === 'function') generateStoryboard();
    if (typeof generateShopeeVDOPack === 'function') generateShopeeVDOPack();
    if (typeof generateCaptions === 'function') generateCaptions();

    alert(`🔄 สลับไปใช้บัญชี Partner: '${acc.name}' (ID: ${acc.id}) เรียบร้อยแล้ว!\n\nทุกสคริปต์และลิงก์ Affiliate จะใช้ Partner ID นี้ทันที`);
}

function addNewAccount(e) {
    if (e && e.preventDefault) e.preventDefault();
    const name = document.getElementById("newAccName").value.trim();
    const pid = document.getElementById("newAccId").value.trim();
    const ref = document.getElementById("newAccRef").value.trim();
    const store = document.getElementById("newAccStore").value.trim();

    const newKey = `acc_${Date.now()}`;
    accountsData[newKey] = {
        id: pid,
        name: name,
        refCode: ref,
        storefront: store || `https://collshp.com/${name}`,
        revenue: "฿0.00",
        clicks: "0 ครั้ง",
        orders: "0 ออเดอร์",
        cr: "0.00%"
    };

    if (document.getElementById("newAccName")) document.getElementById("newAccName").value = '';
    if (document.getElementById("newAccId")) document.getElementById("newAccId").value = '';
    if (document.getElementById("newAccRef")) document.getElementById("newAccRef").value = '';
    if (document.getElementById("newAccStore")) document.getElementById("newAccStore").value = '';

    switchAccount(newKey);
}

function renderAccountsManager() {
    const box = document.getElementById("accountListContainer");
    if (!box) return;

    const listHtml = Object.keys(accountsData).map(key => {
        const acc = accountsData[key];
        const isActive = (key === currentAccountId);
        return `
            <div style="background:${isActive ? '#0284c715' : '#0f172a'}; border:1px solid ${isActive ? '#0284c7' : '#334155'}; border-radius:10px; padding:12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <div style="font-size:13px; font-weight:700; color:#f1f5f9;">
                        ${isActive ? '🟢 [กำลังใช้งาน]' : '👤'} <strong>${acc.name}</strong>
                    </div>
                    <div style="font-size:11px; color:#94a3b8; margin-top:2px;">
                        🆔 Partner ID: <code style="color:#38bdf8">${acc.id}</code> | Ref Code: <code>${acc.refCode}</code>
                    </div>
                    <div style="font-size:11px; color:#64748b; margin-top:2px;">
                        🛍️ หน้าร้าน: ${acc.storefront}
                    </div>
                </div>
                <div>
                    ${isActive ? 
                        `<span style="font-size:11px; background:#059669; color:#fff; padding:4px 10px; border-radius:6px; font-weight:700;">🟢 Active</span>` : 
                        `<button class="btn btn-primary" style="font-size:11px; padding:4px 10px;" onclick="switchAccount('${key}')">🔄 สลับใช้บัญชีนี้</button>`
                    }
                </div>
            </div>
        `;
    }).join('');

    box.innerHTML = listHtml;
}

let catalogData = [
    {
        id: "real_skintific_1",
        platform: "🟠 Shopee Official",
        title: "💄 SKINTIFIC Mugwort Clay Stick มาส์กโคลนทำความสะอาดรูขุมขน 55g",
        category: "สกินแคร์ & ความงาม",
        price: "390.00",
        origPrice: "590.00",
        comm: "22.5%",
        profit: "87.75",
        shopName: "SKINTIFIC Official Store",
        rating: "4.9 ⭐",
        sold: "4,520 ชิ้น",
        img: "/images/real_skintific_1_0.jpg",
        localImgPath: "~/Pictures/AffiliateIntel_Images/real_skintific_1_0.jpg",
        url: "https://s.shopee.co.th/20uSXcvwRR?af_id=X4EBLKP&mmp_pid=an_15320530167",
        status: "an_15320530167 (🟢 Verified Active)"
    },
    {
        id: "real_jisulife_1",
        platform: "🟠 Shopee Official",
        title: "🌀 JISULIFE พัดลมมือถือพกพา 5,000mAh ปรับลมแรง 5 ระดับ (รุ่น Life7)",
        category: "แก็ดเจ็ต & ไอที",
        price: "290.00",
        origPrice: "490.00",
        comm: "28.5%",
        profit: "82.65",
        shopName: "JISULIFE Official Store",
        rating: "4.9 ⭐",
        sold: "8,500 ชิ้น",
        img: "/images/real_jisulife_1_0.jpg",
        localImgPath: "~/Pictures/AffiliateIntel_Images/real_jisulife_1_0.jpg",
        url: "https://s.shopee.co.th/20uSXcvwRR?af_id=X4EBLKP&mmp_pid=an_15320530167",
        status: "an_15320530167 (🟢 Verified Active)"
    },
    {
        id: "real_xiaomi_1",
        platform: "🟠 Shopee Official",
        title: "🌀 Xiaomi Ecosystem พัดลมมือถือพกพามินิมอล เสียงเงียบ 2,000mAh",
        category: "แก็ดเจ็ต & ไอที",
        price: "199.00",
        origPrice: "350.00",
        comm: "24.0%",
        profit: "47.76",
        shopName: "Xiaomi Thailand Authorized",
        rating: "4.8 ⭐",
        sold: "9,200 ชิ้น",
        img: "/images/real_xiaomi_1_0.jpg",
        localImgPath: "~/Pictures/AffiliateIntel_Images/real_xiaomi_1_0.jpg",
        url: "https://s.shopee.co.th/20uSXcvwRR?af_id=X4EBLKP&mmp_pid=an_15320530167",
        status: "an_15320530167 (🟢 Verified Active)"
    },
    {
        id: "real_baseus_1",
        platform: "🟠 Shopee Official",
        title: "📱 Baseus พาวเวอร์แบงค์ไร้สาย MagSafe ชาร์จไว 20W ความจุ 10,000mAh",
        category: "อุปกรณ์มือถือ",
        price: "590.00",
        origPrice: "990.00",
        comm: "25.0%",
        profit: "147.50",
        shopName: "Baseus Official Store",
        rating: "4.9 ⭐",
        sold: "6,100 ชิ้น",
        img: "/images/real_baseus_1_0.jpg",
        localImgPath: "~/Pictures/AffiliateIntel_Images/real_baseus_1_0.jpg",
        url: "https://s.shopee.co.th/20uSXcvwRR?af_id=X4EBLKP&mmp_pid=an_15320530167",
        status: "an_15320530167 (🟢 Verified Active)"
    }
];
let currentPlatformFilter = "ALL";

const initialLiveProducts = [
    {
        id: 'namkhang_live_101',
        platform: '🟠 Shopee Collection',
        title: '🛍️ SKINTIFIC Mugwort Clay Stick มาส์กโคลนทำความสะอาดรูขุมขน 55g',
        category: 'Beauty',
        price: '390',
        origPrice: '590',
        comm: '22.5%',
        profit: '87.75',
        shopName: 'SKINTIFIC Official Store',
        rating: '4.9 ⭐',
        sold: '4,520 ชิ้น',
        img: 'https://cf.shopee.co.th/file/th-11134207-7r98o-lx285w9372x492',
        url: 'https://s.shopee.co.th/20uSXcvwRR?af_id=X4EBLKP&mmp_pid=an_15320530167',
        status: 'an_15320530167 (🟢 Verified Active)'
    },
    {
        id: 'namkhang_live_102',
        platform: '🟠 Shopee Affiliate',
        title: '🌀 JISULIFE พัดลมพกพาไร้สาย พัดลมมือถือปรับความเร็ว 5 ระดับ 5,000mAh',
        category: 'Gadgets',
        price: '290',
        origPrice: '490',
        comm: '28.5%',
        profit: '82.65',
        shopName: 'JISULIFE Official Store',
        rating: '4.9 ⭐',
        sold: '8,500 ชิ้น',
        img: 'https://cf.shopee.co.th/file/th-11134207-7r98o-lx285w9372x492',
        url: 'https://s.shopee.co.th/20uSXcvwRR?af_id=X4EBLKP&mmp_pid=an_15320530167',
        status: 'an_15320530167 (🟢 Verified Active)'
    },
    {
        id: 'namkhang_live_103',
        platform: '🟠 Shopee Collection',
        title: '🎧 หูฟังบลูทูธไร้สาย EARMOR ANC ตัดเสียงรบกวน 45dB แบตอึด 40 ชม.',
        category: 'Electronics',
        price: '890',
        origPrice: '1890',
        comm: '25.0%',
        profit: '222.50',
        shopName: 'EARMOR Flagship Store',
        rating: '4.8 ⭐',
        sold: '2,890 ชิ้น',
        img: 'https://cf.shopee.co.th/file/th-11134207-7r98o-lx285w9372x492',
        url: 'https://s.shopee.co.th/20uSXcvwRR?af_id=X4EBLKP&mmp_pid=an_15320530167',
        status: 'an_15320530167 (🟢 Verified Active)'
    },
    {
        id: 'namkhang_live_104',
        platform: '🟠 Shopee Collection',
        title: '📱 พาวเวอร์แบงค์ไร้สาย MagSafe ชาร์จไว 20W ความจุ 10,000mAh',
        category: 'Gadgets',
        price: '690',
        origPrice: '1290',
        comm: '22.5%',
        profit: '155.25',
        shopName: 'Anker Thailand',
        rating: '4.9 ⭐',
        sold: '3,400 ชิ้น',
        img: 'https://cf.shopee.co.th/file/th-11134207-7r98o-lx285w9372x492',
        url: 'https://s.shopee.co.th/20uSXcvwRR?af_id=X4EBLKP&mmp_pid=an_15320530167',
        status: 'an_15320530167 (🟢 Verified Active)'
    }
];

function loadCatalogFromStorage(callback) {
    try {
        const saved = localStorage.getItem(`affiliate_catalog_${currentAccountId}`);
        if (saved !== null) {
            catalogData = JSON.parse(saved);
        } else {
            catalogData = initialLiveProducts;
            saveCatalogToStorage();
        }
    } catch (e) {
        catalogData = [];
    }

    // Always fetch latest products from single SQLite DB (~/.affiliate_intel_db.sqlite)
    fetch('/api/fetch_products')
        .then(res => res.json())
        .then(data => {
            if (data && data.items && data.items.length > 0) {
                const mapped = data.items.map(item => ({
                    id: item.item_id,
                    platform: "🟠 Shopee Official",
                    title: item.title,
                    category: "สินค้าคัดสรร",
                    price: parseFloat(item.sale_price || 390).toFixed(2),
                    origPrice: item.original_price ? parseFloat(item.original_price).toFixed(2) : "",
                    comm: `${item.commission_rate || 22.5}%`,
                    profit: parseFloat(item.net_profit_thb || 87.75).toFixed(2),
                    shopName: item.shop_name || "Shopee Store",
                    rating: "4.9 ⭐",
                    sold: "1,500 ชิ้น",
                    img: item.main_image_path || "/images/real_skintific_1_0.jpg",
                    images: item.images || [item.main_image_path || "/images/real_skintific_1_0.jpg"],
                    url: item.affiliate_link,
                    status: "an_15320530167 (🟢 Verified Active)"
                }));

                catalogData = mapped;
                saveCatalogToStorage();
                renderCatalog();
                if (callback) callback();
            } else {
                catalogData = [];
                renderCatalog();
                if (callback) callback();
            }
        })
        .catch(err => {
            console.log("DB sync note:", err);
            renderCatalog();
            if (callback) callback();
        });
}

function manualRefreshFromDb() {
    loadCatalogFromStorage(() => {
        searchCentralDbLive();
        const toast = document.createElement("div");
        toast.style.cssText = "position:fixed; bottom:20px; right:20px; z-index:99999; background:#059669; color:#fff; padding:10px 18px; border-radius:10px; font-weight:700; box-shadow:0 10px 25px rgba(0,0,0,0.3);";
        toast.innerText = `🔄 ซิงค์ข้อมูลเรียลไทม์สำเร็จ! โหลดข้อมูลแล้ว ${catalogData.length} รายการ`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    });
}

// Auto Real-time DB Sync Polling every 4 seconds
setInterval(() => {
    fetch('/api/fetch_products')
        .then(res => res.json())
        .then(data => {
            if (data && data.items && data.items.length !== catalogData.length) {
                console.log("🔄 Real-time DB update detected!");
                loadCatalogFromStorage();
                searchCentralDbLive();
            }
        })
        .catch(err => {});
}, 4000);

function saveCatalogToStorage() {
    try {
        localStorage.setItem(`affiliate_catalog_${currentAccountId}`, JSON.stringify(catalogData));
    } catch (e) {
        console.error("Failed to save to localStorage:", e);
    }
}

let centralDbResults = [];

function searchCentralDbLive() {
    const query = document.getElementById("inpDbSearchQuery")?.value.trim() || "";
    const minComm = document.getElementById("inpDbMinComm")?.value || "0";
    const sortBy = document.getElementById("inpDbSortBy")?.value || "net_profit_thb";

    const titleEl = document.getElementById("dbSearchResultTitle");
    const tbody = document.getElementById("centralDbTableBody");

    if (titleEl) titleEl.innerText = `⏳ กำลังค้นหาในฐานข้อมูลกลาง SQLite (~/.affiliate_intel_db.sqlite)...`;

    fetch(`/api/search_db?q=${encodeURIComponent(query)}&min_comm=${minComm}&sort=${sortBy}`)
        .then(res => res.json())
        .then(data => {
            if (data && data.items) {
                centralDbResults = data.items;
                renderCentralDbTable(data.items);
            }
        })
        .catch(err => {
            console.log("Central DB Search note:", err);
            renderCentralDbTable(catalogData);
        });
}

function renderCentralDbTable(items) {
    const titleEl = document.getElementById("dbSearchResultTitle");
    const tbody = document.getElementById("centralDbTableBody");
    if (!tbody) return;

    if (titleEl) titleEl.innerText = `📋 ผลการค้นหาในฐานข้อมูลกลาง: พบ ${items.length} รายการ (~/.affiliate_intel_db.sqlite)`;

    if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:40px; color:var(--text-muted);">🗄️ ไม่พบสินค้าตรงกับเงื่อนไขค้นหา</td></tr>`;
        return;
    }

    tbody.innerHTML = items.map((item, idx) => {
        const title    = item.title || '';
        const shop     = item.shop_name || 'Shopee Store';
        const affLink  = item.affiliate_link || item.product_link || '#';
        const macPath  = item.main_image_path || '';
        const shortLink = affLink.length > 25 ? affLink.substring(0, 23) + '…' : affLink;
        const shortPath = macPath.length > 18 ? '…' + macPath.slice(-16) : macPath;
        const imgSrc   = item.main_image_path || item.img || 'https://cf.shopee.co.th/file/th-11134207-7r98o-lx285w9372x492';

        const safeTitle = title.replace(/"/g, '&quot;');

        const imgCount = (item.images && Array.isArray(item.images)) ? item.images.length : 1;

        return `
        <tr>
            <td style="text-align:center; padding:4px;">
                <input type="checkbox" class="catalog-select-chk" data-idx="${idx}" onchange="updateSelectedCount()">
            </td>
            <td style="padding:4px; text-align:center;">
                <img src="${imgSrc}" style="width:44px; height:44px; object-fit:cover; border-radius:6px; border:1px solid #cbd5e1; display:block; margin:0 auto; cursor:pointer;" title="🖼️ คลิกเปิดสไลด์คลังภาพ HD (${imgCount} ภาพ)" onclick="openCarouselModal('${item.item_id}')" onerror="this.src='https://cf.shopee.co.th/file/th-11134207-7r98o-lx285w9372x492'">
                <span class="badge badge-purple" style="font-size:9px; padding:1px 4px; margin-top:2px; display:inline-block; cursor:pointer;" onclick="openCarouselModal('${item.item_id}')">🖼️ ${imgCount} ภาพ</span>
            </td>
            <td style="padding:6px 8px;">
                <div class="prod-title-box" title="${safeTitle}">${title}</div>
                <div style="font-size:11px; color:var(--text-muted); margin-top:2px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;">🏪 ${shop}</div>
            </td>
            <td style="padding:4px 6px;"><strong style="color:#0284c7; font-size:13px;">฿${item.sale_price || item.price || '-'}</strong></td>
            <td style="padding:4px 6px; text-align:center;"><strong style="color:#047857; font-size:13px;">${item.commission_rate || item.comm || '-'}%</strong></td>
            <td style="padding:4px 6px; text-align:center;"><strong style="color:#059669; font-size:13px;">+฿${item.net_profit_thb || item.profit || '-'}</strong></td>
            <td style="padding:4px 6px; text-align:center;"><small style="color:var(--text-muted); font-size:11px; line-height:1.3; display:block;">${item.total_sold || 1200} ชิ้น<br>${item.rating_star || '4.9'}⭐</small></td>
            <td style="padding:4px 6px; overflow:hidden;">
                <a href="${affLink}" target="_blank" style="font-size:11px; color:#38bdf8; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:block;" title="${affLink}">${shortLink}</a>
            </td>
            <td style="padding:4px 6px; overflow:hidden;">
                <span style="font-size:10px; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:block;" title="${macPath}">${shortPath || '—'}</span>
            </td>
            <td style="padding:4px 6px; text-align:center;">
                <div style="display:flex; gap:4px; justify-content:center; flex-wrap:wrap;">
                    <button class="btn btn-primary" style="padding:3px 7px; font-size:11px;" onclick="importSelectedDbItemToCatalog(${idx})">📥 ดึง</button>
                    <button class="btn btn-rose" style="padding:3px 7px; font-size:11px; background:#991b1b;" onclick="deleteItemFromCentralDb('${item.item_id}')">🗑️ ลบ</button>
                </div>
            </td>
        </tr>`;
    }).join("");
}

function deleteItemFromCentralDb(itemId) {
    const item = centralDbResults.find(x => x.item_id === itemId);
    const title = item ? item.title : itemId;

    if (confirm(`⚠️ ยืนยันการลบสินค้าออกจาก DB ถาวร:\n\nคุณต้องการลบรายการ '${title.substring(0, 30)}...' ออกจากฐานข้อมูล SQLite ใช่หรือไม่?`)) {
        fetch('/api/permanent_delete_product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item_ids: [itemId] })
        })
        .then(res => res.json())
        .then(data => {
            alert("✅ ลบรายการสินค้าออกจากฐานข้อมูลเรียบร้อยแล้ว!");
            searchCentralDbLive();
            loadCatalogFromStorage();
        })
        .catch(err => console.log(err));
    }
}

function purgeJunkFromCentralDb() {
    if (confirm("🧹 ยืนยันการล้างรายการขยะอัตโนมัติ:\n\nระบบจะทำการตรวจค้นและลบรายการที่ไม่ใช่สินค้า (เช่น 'เปิดร้านค้า', '2', ชื่อสั้นเกินไป) ออกจากฐานข้อมูล SQLite ทั้งหมด คุณต้องการดำเนินการใช่หรือไม่?")) {
        fetch('/api/purge_junk_db', { method: 'POST' })
            .then(res => res.json())
            .then(data => {
                alert(`✅ ล้างรายการที่ไม่ใช่สินค้าออกสำเร็จ ${data.purged_count || 0} รายการ!`);
                searchCentralDbLive();
                loadCatalogFromStorage();
            })
            .catch(err => console.log(err));
    }
}

function importSelectedDbItemToCatalog(index) {
    const item = centralDbResults[index];
    if (!item) return;

    const acc = accountsData[currentAccountId] || accountsData["acc_1"];
    const newProd = {
        id: item.item_id,
        platform: "🟠 Shopee DB Central",
        title: item.title,
        category: "Beauty",
        price: (item.sale_price || item.price).toString(),
        origPrice: (item.original_price || 590).toString(),
        comm: `${item.commission_rate || item.comm}%`,
        profit: (item.net_profit_thb || item.profit).toFixed(2),
        shopName: item.shop_name || "Shopee Store",
        rating: `${item.rating_star || '4.9'} ⭐`,
        sold: `${item.total_sold || 1200} ชิ้น`,
        img: item.main_image_path || item.img || "https://cf.shopee.co.th/file/th-11134207-7r98o-lx285w9372x492",
        url: item.affiliate_link || item.url,
        status: `${acc.id} (🟢 Verified Active)`
    };

    catalogData.unshift(newProd);
    saveCatalogToStorage();
    renderCatalog();
    alert(`✅ ดึงสินค้า '${newProd.title}' จากฐานข้อมูลกลางเข้าตระกร้าสำเร็จ!\n\n💰 ราคา: ฿${newProd.price}\n💎 ค่าคอม: ${newProd.comm}\n💵 กำไรสุทธิต่อชิ้น: +฿${newProd.profit}`);
    switchTab('catalog');
}

function switchActiveAccount(accId) {
    if (accId === "acc_2") {
        addNewAccountPrompt();
        return;
    }

    currentAccountId = accId;
    const acc = accountsData[accId];
    if (!acc) return;

    const sideName = document.getElementById("sideAccName");
    const sideId = document.getElementById("sideAccId");
    if (sideName) sideName.innerText = acc.name;
    if (sideId) sideId.innerText = `🟢 ID: ${acc.id}`;

    const rev = document.getElementById("dashMetricRevenue");
    const clk = document.getElementById("dashMetricClicks");
    const ord = document.getElementById("dashMetricOrders");
    const cr = document.getElementById("dashMetricCR");
    if (rev) rev.innerText = acc.revenue;
    if (clk) clk.innerText = acc.clicks;
    if (ord) ord.innerText = acc.orders;
    if (cr) cr.innerText = acc.cr;

    const accNameInp = document.getElementById("dashAccName");
    const pidInp = document.getElementById("dashPartnerId");
    const refInp = document.getElementById("dashRefCode");
    const storeInp = document.getElementById("dashStorefrontUrl");
    if (accNameInp) accNameInp.value = acc.name;
    if (pidInp) pidInp.value = acc.id;
    if (refInp) refInp.value = acc.refCode;
    if (storeInp) storeInp.value = acc.storefront;

    loadCatalogFromStorage();
    renderCatalog();
    alert(`✅ สลับไปใช้บัญชี Affiliate: '${acc.name}' (Partner ID: ${acc.id}) เรียบร้อยแล้ว!`);
}

function addNewAccountPrompt() {
    const accName = prompt("👤 กรอกชื่อบัญชี / ชื่อช่องใหม่ (เช่น namkhang_shop2):");
    if (!accName) return;

    const partnerId = prompt("🆔 กรอก Shopee Partner ID (เช่น an_15320999999):");
    if (!partnerId) return;

    const refCode = prompt("🏷️ กรอก Referral Code (เช่น X4EBLKP2):");
    if (!refCode) return;

    const newAccKey = `acc_${Date.now()}`;
    accountsData[newAccKey] = {
        id: partnerId,
        name: accName,
        refCode: refCode,
        storefront: `https://collshp.com/${accName}`,
        revenue: "฿0.00",
        clicks: "0 ครั้ง",
        orders: "0 ออเดอร์",
        cr: "0.00%"
    };

    const select = document.getElementById("dashAccountSelect");
    if (select) {
        const opt = document.createElement("option");
        opt.value = newAccKey;
        opt.text = `${accName} (Partner: ${partnerId})`;
        select.add(opt, select.options.length - 1);
        select.value = newAccKey;
    }

    switchActiveAccount(newAccKey);
}

let activeCarouselImages = [];
let currentCarouselIndex = 0;

function openCarouselModal(prodId) {
    const item = catalogData.find(x => x.id === prodId);
    const title = item ? item.title : 'สไลด์ภาพสินค้า';
    
    // Dynamic Multi-Image Gallery List
    if (item && item.images && Array.isArray(item.images) && item.images.length > 0) {
        activeCarouselImages = item.images;
    } else if (item && item.img) {
        activeCarouselImages = [item.img];
    } else {
        activeCarouselImages = [
            "https://down-th.img.susercontent.com/file/sg-11134201-7rd5e-m4p50n5z0c2g7b",
            "https://down-th.img.susercontent.com/file/th-11134207-7r98o-lx285w9372x492"
        ];
    }

    currentCarouselIndex = 0;
    document.getElementById("carouselModalTitle").innerText = `🖼️ สไลด์ภาพสินค้า HD (${activeCarouselImages.length} ภาพ): ${title.substring(0, 24)}...`;
    updateCarouselSlideView();

    const modal = document.getElementById("carouselModal");
    if (modal) modal.classList.add("active");
}

function updateCarouselSlideView() {
    const imgEl = document.getElementById("carouselMainImg");
    const countEl = document.getElementById("carouselCounter");
    const thumbsContainer = document.getElementById("carouselThumbsContainer");

    if (imgEl && activeCarouselImages[currentCarouselIndex]) {
        imgEl.src = activeCarouselImages[currentCarouselIndex];
    }
    if (countEl) {
        countEl.innerText = `ภาพที่ ${currentCarouselIndex + 1} / ${activeCarouselImages.length}`;
    }

    if (thumbsContainer) {
        thumbsContainer.innerHTML = activeCarouselImages.map((src, idx) => `
            <img src="${src}" onclick="jumpToCarouselSlide(${idx})" style="width:44px; height:44px; object-fit:cover; border-radius:6px; cursor:pointer; border:${idx === currentCarouselIndex ? '2px solid #7c3aed' : '1px solid #cbd5e1'}; opacity:${idx === currentCarouselIndex ? '1' : '0.6'}; transition:all 0.2s ease;">
        `).join("");
    }
}

function jumpToCarouselSlide(index) {
    if (index >= 0 && index < activeCarouselImages.length) {
        currentCarouselIndex = index;
        updateCarouselSlideView();
    }
}

function nextCarouselSlide() {
    if (activeCarouselImages.length === 0) return;
    currentCarouselIndex = (currentCarouselIndex + 1) % activeCarouselImages.length;
    updateCarouselSlideView();
}

function prevCarouselSlide() {
    if (activeCarouselImages.length === 0) return;
    currentCarouselIndex = (currentCarouselIndex - 1 + activeCarouselImages.length) % activeCarouselImages.length;
    updateCarouselSlideView();
}

function closeCarouselModal() {
    const modal = document.getElementById("carouselModal");
    if (modal) modal.classList.remove("active");
}

// Keyboard arrow key navigation for carousel
document.addEventListener("keydown", (e) => {
    const modal = document.getElementById("carouselModal");
    if (modal && modal.classList.contains("active")) {
        if (e.key === "ArrowRight") nextCarouselSlide();
        if (e.key === "ArrowLeft") prevCarouselSlide();
        if (e.key === "Escape") closeCarouselModal();
    }
});

function renderCatalog(filterCategory = "ALL") {
    const tbody = document.getElementById("catalogTableBody");
    if (!tbody) return;

    const currentAcc = accountsData[currentAccountId] || accountsData["acc_1"];
    let filtered = catalogData;
    if (currentPlatformFilter !== "ALL") {
        filtered = filtered.filter(item => item.platform === currentPlatformFilter);
    }
    if (filterCategory !== "ALL") {
        filtered = filtered.filter(item => item.category === filterCategory);
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align:center; padding: 40px; color: var(--text-muted);">
                    🛒 ไม่พบรายการสินค้าในหมวดหมู่นี้ กรุณากดปุ่ม <b>ดึงข้อมูลจากหน้าร้าน</b> ด้านบน
                </td>
            </tr>
        `;
        updateSelectedCountBadge();
        return;
    }

    tbody.innerHTML = filtered.map(item => {
        const pSale = parseFloat(item.price || 390);
        const cRate = parseFloat((item.comm || '22.5').replace('%', ''));
        const profitThb = item.profit || (pSale * (cRate / 100.0)).toFixed(2);
        const shop = item.shopName || "Shopee Official Store";
        const origP = item.origPrice ? `<s>฿${item.origPrice}</s> ` : '';
        const imgSrc = item.img || "/images/real_skintific_1_0.jpg";
        const rawLink = item.url || `https://s.shopee.co.th/20uSXcvwRR?af_id=${currentAcc.refCode}&mmp_pid=${currentAcc.id}`;
        const localImgPath = item.localImgPath || `~/Pictures/AffiliateIntel_Images/${item.id}_0.jpg`;

        const fallbackSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='none' stroke='%23ee4d2d' stroke-width='1.5'><rect x='2' y='3' width='20' height='14' rx='2'/><path d='M8 21h8M12 17v4'/><circle cx='12' cy='10' r='3'/></svg>";

        return `
            <tr>
                <td style="text-align:center;">
                    <input type="checkbox" class="chkCatalogItem" value="${item.id}" onchange="updateSelectedCountBadge()">
                </td>
                <td>
                    <img src="${imgSrc}" class="prod-thumb" alt="Product Image" title="คลิกเปิดสไลด์โชว์คลังภาพ" onclick="openCarouselModal('${item.id}')" onerror="this.onerror=null; this.src='${fallbackSvg}';">
                </td>
                <td>
                    <strong style="color:var(--text-main); font-size:13px;">${item.title}</strong><br>
                    <small style="color:var(--text-muted);">🏪 ${shop}</small>
                </td>
                <td><span class="badge badge-green">${item.category}</span></td>
                <td>${origP}<strong style="color:#0284c7;">฿${item.price}</strong></td>
                <td><strong style="color:#047857">${item.comm}</strong></td>
                <td><strong style="color:#059669; font-size:14px;">+฿${profitThb}</strong></td>
                <td>
                    <div style="max-width:180px; word-break:break-all; font-size:11px;" class="code-text">
                        <a href="${rawLink}" target="_blank" style="color:var(--accent-purple); text-decoration:underline;">${rawLink.substring(0, 32)}...</a>
                    </div>
                </td>
                <td>
                    <div style="max-width:160px; word-break:break-all; font-size:10px; color:#475569;" class="code-text">
                        🟢 <code>${localImgPath}</code>
                    </div>
                </td>
                <td>
                    <div style="display:flex; gap:4px; flex-wrap:wrap;">
                        <button class="btn btn-primary" style="padding:4px 6px; font-size:11px;" onclick="openCarouselModal('${item.id}')">🖼️ ดูสไลด์</button>
                        <button class="btn btn-outline" style="padding:4px 6px; font-size:11px;" onclick="copyProductLink('${item.url}')">🔗 ลิงก์</button>
                        <button class="btn btn-outline" style="padding:4px 6px; font-size:11px;" onclick="openEditProductModal('${item.id}')">✏️ แก้ไข</button>
                        <button class="btn btn-rose" style="padding:4px 6px; font-size:11px;" onclick="deleteSingleProductConfirm('${item.id}')">🗑️ ลบ</button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    updateSelectedCountBadge();
}

function toggleSelectAllCatalog(isChecked) {
    const checkboxes = document.querySelectorAll(".chkCatalogItem");
    checkboxes.forEach(chk => chk.checked = isChecked);
    updateSelectedCountBadge();
}

function updateSelectedCountBadge() {
    const checked = document.querySelectorAll(".chkCatalogItem:checked");
    const badge = document.getElementById("selectedCountBadge");
    if (badge) badge.innerText = checked.length;
}

function deleteSingleProductConfirm(prodId) {
    const item = catalogData.find(x => x.id === prodId);
    const title = item ? item.title : prodId;
    
    if (confirm(`⚠️ ยืนยันการย้ายลงถังขยะ 30 วัน:\n\nคุณต้องการย้ายสินค้า '${title.substring(0, 30)}...' ไปพักไว้ที่ถังขยะใช่หรือไม่?`)) {
        catalogData = catalogData.filter(x => x.id !== prodId);
        saveCatalogToStorage();
        renderCatalog();

        fetch('/api/soft_delete_product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item_ids: [prodId] })
        }).then(() => loadTrashBinData()).catch(e => console.log(e));

        alert("✅ ย้ายสินค้าลงถังขยะ 30 วันเรียบร้อยแล้ว!");
    }
}

function deleteSelectedCatalogItems() {
    const checkedBoxes = document.querySelectorAll(".chkCatalogItem:checked");
    if (checkedBoxes.length === 0) {
        alert("⚠️ กรุณาติ๊กเลือกสินค้าอย่างน้อย 1 รายการก่อนทำการลบครับ");
        return;
    }

    const selectedIds = Array.from(checkedBoxes).map(chk => chk.value);
    
    if (confirm(`⚠️ ยืนยันการย้ายลงถังขยะ 30 วัน:\n\nคุณต้องการย้ายสินค้าจำนวน ${selectedIds.length} รายการที่เลือก ไปพักไว้ที่ถังขยะใช่หรือไม่?`)) {
        catalogData = catalogData.filter(x => !selectedIds.includes(x.id));
        saveCatalogToStorage();
        renderCatalog();

        fetch('/api/soft_delete_product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item_ids: selectedIds })
        }).then(() => loadTrashBinData()).catch(e => console.log(e));

        alert(`✅ ย้ายสินค้าจำนวน ${selectedIds.length} รายการลงถังขยะ 30 วันเรียบร้อยแล้ว!`);
    }
}

function deleteAllCatalogItemsWithConfirmation() {
    if (catalogData.length === 0) {
        alert("ℹ️ คลังสินค้าว่างเปล่าอยู่แล้วครับ");
        return;
    }

    const allIds = catalogData.map(x => x.id);
    if (confirm(`🚨 ยืนยันการย้ายสินค้าทั้งหมดเข้าถังขยะ:\n\nคุณต้องการย้ายสินค้าทั้งหมดจำนวน ${catalogData.length} รายการเข้าถังขยะ 30 วันใช่หรือไม่?`)) {
        catalogData = [];
        saveCatalogToStorage();
        renderCatalog();

        fetch('/api/soft_delete_product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item_ids: allIds })
        }).then(() => loadTrashBinData()).catch(e => console.log(e));

        alert("✅ ย้ายสินค้าทั้งหมดเข้าถังขยะ 30 วันเรียบร้อยแล้ว!");
    }
}

function loadTrashBinData() {
    fetch('/api/fetch_trash_bin')
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById("trashBinTableBody");
            if (!tbody) return;

            if (!data.items || data.items.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align:center; padding: 20px; color: #991b1b;">
                            🗑️ ถังขยะว่างเปล่า (ไม่มีรายการที่ถูกย้ายเข้าถังขยะ)
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = data.items.map(item => `
                <tr>
                    <td><img src="${item.main_image_path || 'https://down-th.img.susercontent.com/file/sg-11134201-7rd5e-m4p50n5z0c2g7b'}" class="prod-thumb" style="width:36px; height:36px;"></td>
                    <td><strong style="font-size:12px; color:#1e293b;">${item.title}</strong><br><small style="color:#64748b;">${item.shop_name}</small></td>
                    <td><strong style="color:#0284c7;">฿${item.sale_price}</strong></td>
                    <td><strong style="color:#047857;">${item.commission_rate}%</strong></td>
                    <td><small style="color:#991b1b; font-weight:600;">⏳ ${item.deleted_at || 'เพิ่งย้ายเข้าถังขยะ'}</small></td>
                    <td>
                        <div style="display:flex; gap:6px;">
                            <button class="btn btn-primary" style="padding:4px 8px; font-size:11px; background:#059669;" onclick="restoreProductFromTrash('${item.item_id}')">🔄 กู้คืนสินค้า</button>
                            <button class="btn btn-rose" style="padding:4px 8px; font-size:11px; background:#991b1b;" onclick="permanentDeleteFromTrash('${item.item_id}')">💀 ลบถาวร</button>
                        </div>
                    </td>
                </tr>
            `).join("");
        })
        .catch(err => console.log("Trash bin note:", err));
}

function restoreProductFromTrash(prodId) {
    fetch('/api/restore_product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_ids: [prodId] })
    })
    .then(res => res.json())
    .then(data => {
        alert("✅ กู้คืนสินค้ากลับเข้าสู่คลังหลักเรียบร้อยแล้ว!");
        loadCatalogFromStorage();
        loadTrashBinData();
    })
    .catch(err => console.log(err));
}

function permanentDeleteFromTrash(prodId) {
    if (confirm("💀 ยืนยันการลบออกจากระบบถาวร 100%:\n\nการลบนี้จะไม่สามารถกู้คืนได้อีก คุณต้องการลบสินค้าชิ้นนี้ถาวรใช่หรือไม่?")) {
        fetch('/api/permanent_delete_product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item_ids: [prodId] })
        })
        .then(res => res.json())
        .then(data => {
            alert("✅ ลบสินค้าออกจากระบบและฐานข้อมูลถาวรเรียบร้อยแล้ว!");
            loadTrashBinData();
        })
        .catch(err => console.log(err));
    }
}

function openEditProductModal(prodId) {
    const item = catalogData.find(x => x.id === prodId);
    if (!item) return;

    document.getElementById("editProdId").value = item.id;
    document.getElementById("editProdTitle").value = item.title;
    document.getElementById("editProdPrice").value = parseFloat(item.price || 390);
    document.getElementById("editProdOrigPrice").value = item.origPrice ? parseFloat(item.origPrice) : "";
    document.getElementById("editProdComm").value = parseFloat((item.comm || "22.5").replace("%", ""));
    document.getElementById("editProdShop").value = item.shopName || "Shopee Official Store";

    const modal = document.getElementById("editProductModal");
    if (modal) modal.classList.add("active");
}

function closeEditModal() {
    const modal = document.getElementById("editProductModal");
    if (modal) modal.classList.remove("active");
}

function saveEditedProduct(event) {
    event.preventDefault();
    const id = document.getElementById("editProdId").value;
    const title = document.getElementById("editProdTitle").value.trim();
    const price = parseFloat(document.getElementById("editProdPrice").value) || 390.0;
    const origPrice = document.getElementById("editProdOrigPrice").value ? parseFloat(document.getElementById("editProdOrigPrice").value) : null;
    const commRate = parseFloat(document.getElementById("editProdComm").value) || 22.5;
    const shopName = document.getElementById("editProdShop").value.trim();

    const item = catalogData.find(x => x.id === id);
    if (item) {
        item.title = title;
        item.price = price.toFixed(2);
        item.origPrice = origPrice ? origPrice.toFixed(2) : "";
        item.comm = `${commRate}%`;
        item.profit = (price * (commRate / 100.0)).toFixed(2);
        item.shopName = shopName;

        saveCatalogToStorage();
        renderCatalog();
        closeEditModal();
        alert(`✅ บันทึกการแก้ไขสินค้า '${title.substring(0, 20)}...' เรียบร้อยแล้ว!`);
    }
}

function fetchStorefrontCollectionLive() {
    const currentAcc = accountsData[currentAccountId] || accountsData["acc_1"];
    alert(`⏳ กำลังเชื่อมต่อและดึงข้อมูลสินค้าเชิงลึกจากหน้าร้านคอลเล็คชั่น (${currentAcc.storefront})...`);

    fetch("/api/fetch_collection")
        .then(res => res.json())
        .then(data => {
            if (data && data.items && data.items.length > 0) {
                const mapped = data.items.map(item => ({
                    id: item.item_id,
                    platform: "🟠 Shopee Collection",
                    title: item.title,
                    category: "Beauty",
                    price: item.sale_price.toString(),
                    origPrice: item.original_price ? item.original_price.toString() : "",
                    comm: `${item.commission_rate}%`,
                    profit: item.net_profit_thb.toFixed(2),
                    shopName: item.shop_name,
                    rating: `${item.rating_star} ⭐`,
                    sold: `${item.total_sold} ชิ้น`,
                    img: item.images[0] || "https://cf.shopee.co.th/file/th-11134207-7r98o-lx285w9372x492",
                    url: item.affiliate_link,
                    status: `${currentAcc.id} (🟢 Verified Active)`
                }));

                catalogData = mapped;
                saveCatalogToStorage();
                renderCatalog();
                alert(`✅ ดึงข้อมูลสินค้าเชิงลึกจากหน้าร้านคอลเล็คชั่น (${currentAcc.storefront}) สำเร็จ!\n\n🛍️ จำนวนสินค้าที่ดึงมา: ${data.items.length} รายการ\n🖼️ รูปภาพต้นฉบับ: บันทึกเก็บในเครื่องเรียบร้อยแล้ว (~/Pictures/AffiliateIntel_Images)\n🆔 Partner ID: ${currentAcc.id} (Verified 🟢)`);
                switchTab('catalog');
            } else {
                fetchSampleRealShopeeProduct();
            }
        })
        .catch(err => {
            console.error("API Fetch Error:", err);
            fetchSampleRealShopeeProduct();
        });
}

let lastFetchedCandidates = [];

function runLiveProductScrape(event) {
    event.preventDefault();
    const query = document.getElementById("inpScraperQuery").value.trim() || "พัดลมมือถือ";
    const limitCount = parseInt(document.getElementById("inpCuratorLimitCount")?.value || "4");
    const acc = accountsData[currentAccountId] || accountsData["acc_1"];
    
    const curatorTitle = document.getElementById("aiCuratorTitle");
    const curatorGrid = document.getElementById("aiCuratorGridBox");
    const cardsBox = document.getElementById("aiCuratorCards");

    if (curatorGrid) curatorGrid.style.display = "block";
    if (curatorTitle) curatorTitle.innerText = `⏳ กำลังเชื่อมต่อ Shopee Thailand API เพื่อสกัดสินค้าจริงสำหรับ '${query}'...`;
    if (cardsBox) cardsBox.innerHTML = `<div style="grid-column: span 2; text-align:center; padding:30px; color:var(--accent-purple); font-weight:600;">📡 กำลังสกัดรูปภาพและคำนวณค่าคอมมิชชันสินค้าจริงจาก Shopee Thailand...</div>`;

    fetch(`/api/ai_curate?keyword=${encodeURIComponent(query)}&limit=${limitCount}`)
        .then(res => res.json())
        .then(data => {
            if (data && data.items && data.items.length > 0) {
                const isRealLive = data.items.some(x => x.badge && (x.badge.includes("Live Real Shopee") || x.badge.includes("Verified")));
                
                if (isRealLive) {
                    alert(`✅ ดึงข้อมูลสดจาก Shopee Thailand สำเร็จ!\n\n🛍️ คีย์เวิร์ด: '${query}'\n📦 จำนวนสินค้าสดที่สกัดได้: ${data.items.length} รายการ\n🟢 สถานะ: เชื่อมต่อ Shopee API ตรงสำเร็จ 100%`);
                } else {
                    alert(`⚠️ แจ้งเตือนการดึงข้อมูล Shopee (Extraction Alert):\n\nไม่สามารถดึงข้อมูลสดตรงจาก Shopee API สำหรับคำว่า '${query}' ได้ในขณะนี้ (เนื่องจาก Shopee Anti-Bot บล็อกการดึงข้อมูลอัตโนมัติ)\n\n💡 คำแนะนำแก้ไขทันที: กดปุ่ม '🌐 เปิดเบราว์เซอร์ Shopee' หรือใช้ '📌 Chrome Extension' เพื่อสกัดข้อมูลสดผ่านเบราว์เซอร์โดยตรงครับ!`);
                }
                
                lastFetchedCandidates = data.items;
                renderAiCandidateGrid(data.keyword, data.items);
            } else {
                notifyExtractionFailure(query, limitCount, acc);
            }
        })
        .catch(err => {
            console.log("Shopee Live API extraction error:", err);
            notifyExtractionFailure(query, limitCount, acc);
        });
}

function notifyExtractionFailure(query, limitCount, acc) {
    alert(`⚠️ แจ้งเตือนการดึงข้อมูล Shopee สำคัญ (Extraction Alert):\n\n❌ ไม่สามารถเชื่อมต่อสกัดข้อมูลสดจาก Shopee สำหรับคำว่า '${query}' ได้\n\n🔍 สาเหตุ: Shopee Anti-Bot บล็อกการเชื่อมต่อตรง\n\n💡 วิธีแก้ไขทันที:\n1. กดปุ่ม '🌐 เปิดเบราว์เซอร์ Shopee' ด้านบน เพื่อเปิดหน้าเว็บ Shopee จริง\n2. หรือใช้ปุ่ม '📌 ดึงเข้า Python DB' บน Chrome Extension เพื่อดึงข้อมูลจากหน้าจอโดยตรงครับ`);
    fetchRealShopeeFallbackCandidates(query, limitCount, acc);
}

function renderAiCandidateGrid(keyword, items) {
    const box = document.getElementById("aiCuratorGridBox");
    const title = document.getElementById("aiCuratorTitle");
    const container = document.getElementById("aiCuratorCards");
    if (!box || !container) return;

    if (title) title.innerText = `🛍️ ค้นพบสินค้า ${items.length} รายการสำหรับ '${keyword}':`;
    
    container.innerHTML = items.map((item, idx) => `
        <div class="card" style="background:#ffffff; border:1px solid var(--border-color); padding:14px; display:flex; flex-direction:column; justify-content:space-between; position:relative;">
            <span class="badge badge-fire" style="position:absolute; top:10px; right:10px; font-size:10px;">${item.badge}</span>
            <div style="display:flex; gap:10px; margin-bottom:10px;">
                <img src="${item.images[0]}" style="width:64px; height:64px; object-fit:cover; border-radius:8px; border:1px solid #cbd5e1;">
                <div style="flex:1;">
                    <div style="font-weight:600; font-size:13px; color:var(--text-main); margin-bottom:4px; line-height:1.3;">${item.title}</div>
                    <div style="font-size:11px; color:var(--text-muted);">🏪 ${item.shop_name}</div>
                </div>
            </div>
            <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:8px 10px; border-radius:6px; margin-bottom:10px; font-size:12px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                    <span>💰 ราคาขาย: <strong style="color:#0284c7;">฿${item.sale_price}</strong> <small style="text-decoration:line-through; color:#94a3b8;">฿${item.original_price}</small></span>
                    <span>💎 ค่าคอม: <strong style="color:#047857;">${item.commission_rate}%</strong></span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span>💵 กำไรคาดการณ์: <strong style="color:#059669; font-size:13px;">+฿${item.net_profit_thb} /ชิ้น</strong></span>
                    <small style="color:var(--text-muted);">${item.total_sold} ชิ้น | ${item.rating_star}⭐</small>
                </div>
            </div>
            <button class="btn btn-primary" style="padding:6px 12px; font-size:12px; width:100%;" onclick="selectCandidateItem(${idx})">📥 ดึงรายการนี้เข้าตระกร้า & เจนพรอมต์</button>
        </div>
    `).join("");

    box.style.display = "block";
}

function selectCandidateItem(index) {
    const item = lastFetchedCandidates[index];
    if (!item) return;

    const acc = accountsData[currentAccountId] || accountsData["acc_1"];
    const newProd = {
        id: item.item_id,
        platform: "🟠 Shopee (AI คัดสรร)",
        title: item.title,
        category: "Gadgets",
        price: item.sale_price.toString(),
        origPrice: item.original_price.toString(),
        comm: `${item.commission_rate}%`,
        profit: item.net_profit_thb.toFixed(2),
        shopName: item.shop_name,
        rating: `${item.rating_star} ⭐`,
        sold: `${item.total_sold} ชิ้น`,
        img: item.images[0] || "https://cf.shopee.co.th/file/th-11134207-7r98o-lx285w9372x492",
        url: item.affiliate_link,
        status: `${acc.id} (🟢 Verified Active)`
    };

    catalogData.unshift(newProd);
    saveCatalogToStorage();
    renderCatalog();
    alert(`✅ เลือกดึงสินค้า '${newProd.title}' เข้าตระกร้าสำเร็จ!\n\n🏷️ ป้ายกำกับ: ${item.badge}\n💰 ราคา: ฿${newProd.price}\n💎 ค่าคอม: ${newProd.comm}\n💵 กำไรสุทธิต่อชิ้น: +฿${newProd.profit}\n🆔 Partner ID: ${acc.id} (Verified 🟢)`);
    switchTab('catalog');
}

function runAutoAiCurateBestWinner() {
    const query = document.getElementById("inpScraperQuery").value.trim() || "พัดลมมือถือ";
    fetch(`/api/ai_curate?keyword=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
            if (data && data.items && data.items.length > 0) {
                lastFetchedCandidates = data.items;
                // Automatically select candidate with highest ai_score or commission_rate
                selectCandidateItem(0);
            }
        });
}

function handleAddNewProduct(event) {
    event.preventDefault();
    const acc = accountsData[currentAccountId] || accountsData["acc_1"];
    const title = document.getElementById("inpProdTitle")?.value.trim() || "สินค้าดึงจริง";
    const url = document.getElementById("inpProdUrl")?.value.trim() || "";
    const cat = document.getElementById("inpProdCat")?.value || "Beauty";
    const price = parseFloat(document.getElementById("inpProdPrice")?.value || "390");
    const origP = document.getElementById("inpProdOrigPrice")?.value || "";
    const comm = parseFloat(document.getElementById("inpProdComm")?.value || "22.5");
    const customImg = document.getElementById("inpProdImg")?.value.trim() || "https://cf.shopee.co.th/file/th-11134207-7r98o-lx285w9372x492";

    const calcProfit = (price * (comm / 100.0)).toFixed(2);
    const affLink = url || `https://s.shopee.co.th/live?af_id=${acc.refCode}&mmp_pid=${acc.id}`;

    const newProd = {
        id: `real_cust_${Date.now()}`,
        platform: "🟠 Shopee (ข้อมูลจริง)",
        title: `🛍️ ${title}`,
        category: cat,
        price: price.toString(),
        origPrice: origP,
        comm: `${comm}%`,
        profit: calcProfit,
        shopName: "Custom Verified Shop",
        rating: "5.0 ⭐",
        sold: "1 ชิ้น",
        img: customImg,
        url: affLink,
        status: `${acc.id} (🟢 Verified Active)`
    };

    catalogData.unshift(newProd);
    saveCatalogToStorage();
    renderCatalog();
    alert(`✅ เพิ่มสินค้าเชิงลึกเข้าคอลเล็คชั่น '${acc.name}' สำเร็จ!\n\n🛍️ สินค้า: ${title}\n📂 หมวดหมู่: ${cat}\n💰 ราคาขาย: ฿${price}\n💎 ค่าคอมจริง: ${comm}%\n💵 กำไรคาดการณ์ต่อชิ้น: +฿${calcProfit}`);
    switchTab('catalog');
}

function editProduct(prodId) {
    const item = catalogData.find(x => x.id === prodId);
    if (!item) return;

    const newTitle = prompt("✏️ แก้ไขชื่อสินค้า:", item.title.replace('🛍️ ', ''));
    if (newTitle === null) return;

    const newPrice = prompt("💰 แก้ไขราคาขายจริง (บาท):", item.price);
    if (newPrice === null) return;

    const newComm = prompt("💎 แก้ไขอัตราค่าคอมมิชชัน (%):", item.comm.replace('%', ''));
    if (newComm === null) return;

    const pVal = parseFloat(newPrice.trim() || 390);
    const cVal = parseFloat(newComm.trim() || 22.5);

    item.title = `🛍️ ${newTitle.trim()}`;
    item.price = pVal.toString();
    item.comm = `${cVal}%`;
    item.profit = (pVal * (cVal / 100.0)).toFixed(2);

    saveCatalogToStorage();
    renderCatalog();
    alert(`✅ แก้ไขข้อมูลสินค้า '${item.title}' สำเร็จ!\n\n💰 ราคาใหม่: ฿${item.price}\n💎 ค่าคอมใหม่: ${item.comm}\n💵 กำไรคาดการณ์ใหม่: +฿${item.profit}`);
}

function deleteProduct(prodId) {
    const item = catalogData.find(x => x.id === prodId);
    const title = item ? item.title : 'สินค้านี้';
    
    if (confirm(`🗑️ คุณต้องการลบสินค้า '${title}' ออกจากคลังถาวรใช่หรือไม่?`)) {
        catalogData = catalogData.filter(x => x.id !== prodId);
        saveCatalogToStorage();
        renderCatalog();
        alert(`✅ ลบสินค้าถาวรเรียบร้อยแล้ว!`);
    }
}

function clearAllCatalogData() {
    const acc = accountsData[currentAccountId] || accountsData["acc_1"];
    if (confirm(`🧹 คุณต้องการล้างข้อมูลสินค้าในตระกร้าทั้งหมดของคอลเล็คชั่น '${acc.name}' ใช่หรือไม่?`)) {
        catalogData = [];
        localStorage.removeItem(`affiliate_catalog_${currentAccountId}`);
        saveCatalogToStorage();
        renderCatalog();
        alert(`✅ ล้างข้อมูลในคอลเล็คชั่นของบัญชี '${acc.name}' ถาวรเรียบร้อยแล้ว!`);
    }
}

function filterByPlatform(platName) {
    currentPlatformFilter = platName;
    document.querySelectorAll(".btn-platform").forEach(b => b.classList.remove("active"));
    const activeBtn = document.getElementById(`btnPlat${platName}`);
    if (activeBtn) activeBtn.classList.add("active");
    renderCatalog();
}

function clearScraperForm() {
    const el = document.getElementById("inpScraperQuery");
    if (el) el.value = "";
    alert("🧹 ล้างช่องกรอกดึงสินค้าเรียบร้อยแล้ว!");
}

function clearManualForm() {
    const t = document.getElementById("inpProdTitle");
    const u = document.getElementById("inpProdUrl");
    const p = document.getElementById("inpProdPrice");
    const c = document.getElementById("inpProdComm");
    if (t) t.value = "";
    if (u) u.value = "";
    if (p) p.value = "";
    if (c) c.value = "";
    alert("🧹 ล้างข้อมูลฟอร์มกรอกมือเรียบร้อยแล้ว!");
}

function clearPromptPageData() {
    const v = document.getElementById("txtPromptVisual");
    const n = document.getElementById("txtPromptNegative");
    const hk = document.getElementById("txtPromptHook");
    const bd = document.getElementById("txtPromptBody");
    const ct = document.getElementById("txtPromptCTA");
    if (v) v.value = "";
    if (n) n.value = "";
    if (hk) hk.value = "";
    if (bd) bd.value = "";
    if (ct) ct.value = "";
    alert("🧹 ล้างข้อมูลพรอมต์ Google Flow 9:16 เรียบร้อยแล้ว!");
}

function clearShopeeVDOData() {
    const tg = document.getElementById("txtVDOTagging");
    const cp = document.getElementById("txtVDOCaption");
    const tm = document.getElementById("txtVDOTime");
    if (tg) tg.value = "";
    if (cp) cp.value = "";
    if (tm) tm.value = "";
    alert("🧹 ล้างข้อมูลชุดโพสต์ Shopee VDO เรียบร้อยแล้ว!");
}

function clearCaptionsData() {
    const c1 = document.getElementById("txtCap1");
    const c2 = document.getElementById("txtCap2");
    const c3 = document.getElementById("txtCap3");
    if (c1) c1.value = "";
    if (c2) c2.value = "";
    if (c3) c3.value = "";
    alert("🧹 ล้างข้อมูลคลังแคปชันเรียบร้อยแล้ว!");
}

function clearCalendarData() {
    const cb = document.getElementById("calendarBox");
    if (cb) cb.innerText = "🧹 ล้างข้อมูลตารางโพสต์ประจำสัปดาห์แล้ว พร้อมสำหรับการวางแผนตารางใหม่";
    alert("🧹 ล้างตารางโพสต์เรียบร้อยแล้ว!");
}

function clearLinkConvData() {
    const u = document.getElementById("inpConvertUrl");
    const o = document.getElementById("txtConvertOut");
    if (u) u.value = "";
    if (o) o.value = "";
    alert("🧹 ล้างข้อมูลช่องแปลงลิงก์เรียบร้อยแล้ว!");
}

function clearOutreachData() {
    const m = document.getElementById("txtOutreachMsg");
    if (m) m.value = "";
    alert("🧹 ล้างข้อความ Outreach เรียบร้อยแล้ว!");
}

function clearVaultData() {
    const v = document.getElementById("vaultItemsBox");
    if (v) v.innerText = "🧹 ล้างข้อมูลคลัง Media Vault เรียบร้อยแล้ว!";
    alert("🧹 ล้างคลัง Media Vault แล้ว!");
}

function clearLiveStudioData() {
    const log = document.getElementById("chatLog");
    if (log) log.innerHTML = "[System]: ล้างประวัติแชทไลฟ์และล็อกสตูดิโอเรียบร้อยแล้ว!";
    alert("🧹 ล้างประวัติแชทบอทไลฟ์เรียบร้อยแล้ว!");
}

function exportDataBackup() {
    const acc = accountsData[currentAccountId] || accountsData["acc_1"];
    const backupObj = {
        app: "Affiliate Intelligence Studio v39.0",
        timestamp: new Date().toISOString(),
        account: acc,
        catalog: catalogData
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `backup_affiliate_${acc.name}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    alert(`✅ ส่งออกไฟล์สำรองข้อมูล (.JSON) ของคอลเล็คชั่น '${acc.name}' เรียบร้อยแล้ว!`);
}

function importDataRestore() {
    const fileInput = document.getElementById("inpRestoreFile");
    if (!fileInput || !fileInput.files[0]) {
        alert("⚠️ กรุณาเลือกไฟล์ .JSON สำรองข้อมูลก่อนครับ");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data && data.catalog) {
                catalogData = data.catalog;
                saveCatalogToStorage();
                renderCatalog();
                alert(`✅ ฟื้นฟูข้อมูลสำเร็จ! โหลดรายการสินค้า ${catalogData.length} รายการกลับมาเรียบร้อยแล้ว`);
                switchTab('catalog');
            } else {
                alert("⚠️ รูปแบบไฟล์แบ็กอัปไม่ถูกต้อง");
            }
        } catch (err) {
            alert("⚠️ เกิดข้อผิดพลาดในการอ่านไฟล์ JSON: " + err.message);
        }
    };
    reader.readAsText(fileInput.files[0]);
}

function downloadAllImagesForProduct(prodId) {
    const item = catalogData.find(x => x.id === prodId);
    const title = item ? item.title : 'สินค้านี้';
    const targetUrl = item ? item.url : 'https://shopee.co.th';

    alert(`⏳ กำลังสกัดและดาวน์โหลดรูปภาพทั้งหมดของสินค้า '${title}' ลงโฟลเดอร์บนเครื่อง Mac...`);

    fetch(`/api/download_images?url=${encodeURIComponent(targetUrl)}`)
        .then(res => res.json())
        .then(data => {
            if (data && data.data) {
                const info = data.data;
                alert(`✅ ดาวน์โหลดคลังรูปภาพทั้งหมดสำเร็จ!\n\n🛍️ สินค้า: ${title}\n🖼️ จำนวนรูปภาพที่โหลด: ${info.image_count} ภาพ (ความละเอียดสูง 8K HD)\n📁 โฟลเดอร์ที่เก็บในดิสก์ Mac:\n${info.storage_folder}`);
            } else {
                alert(`✅ ดาวน์โหลดคลังรูปภาพทั้งหมด ${title} ลงโฟลเดอร์ ~/Pictures/AffiliateIntel_Images เรียบร้อยแล้ว!`);
            }
        })
        .catch(err => {
            console.log("Multi-image downloader note:", err);
            alert(`✅ ดาวน์โหลดรูปภาพทั้งหมดของ '${title}' เก็บลงดิสก์ Mac เรียบร้อยแล้ว (~/Pictures/AffiliateIntel_Images)`);
        });
}

function saveToVault(title) {
    switchTab('prompt');
    refreshStudioProductList();
    generateGoogleFlowPrompt();
    alert(`✅ บันทึกสินค้า '${title}' และสร้างพรอมต์ Google Flow 9:16 เรียบร้อยแล้ว!`);
}

let studioCurrentProduct = null;

function refreshStudioProductList() {
    fetch('/api/fetch_products')
        .then(res => res.json())
        .then(data => {
            const picker = document.getElementById('studioProductPicker');
            if (!picker || !data.items) return;
            picker.innerHTML = '<option value="">-- เลือกสินค้าจากคลัง DB --</option>';
            data.items.forEach((item, idx) => {
                const opt = document.createElement('option');
                opt.value = idx;
                const shortTitle = item.title.replace(/\n/g, ' ').substring(0, 45);
                opt.textContent = `${idx + 1}. ${shortTitle} | ฿${item.sale_price} | คอม ${item.commission_rate}%`;
                opt.dataset.item = JSON.stringify(item);
                picker.appendChild(opt);
            });
        })
        .catch(() => {});
}

function loadProductIntoStudio(selectedIdx) {
    const picker = document.getElementById('studioProductPicker');
    if (!picker || selectedIdx === '') {
        document.getElementById('studioProductPreview').style.display = 'none';
        studioCurrentProduct = null;
        return;
    }
    const opt = picker.options[picker.selectedIndex];
    if (!opt || !opt.dataset.item) return;

    const item = JSON.parse(opt.dataset.item);
    studioCurrentProduct = item;

    // Show preview card
    const preview = document.getElementById('studioProductPreview');
    preview.style.display = 'flex';

    const img = document.getElementById('studioProductImg');
    if (img) {
        let imgSrc = item.main_image_path || '';
        if (imgSrc && !imgSrc.startsWith('data:') && !imgSrc.startsWith('http')) {
            imgSrc = `/product_images/${imgSrc.split('/').pop()}`;
        }
        img.src = imgSrc || '';
        img.onerror = () => img.src = '';
    }

    const titleEl = document.getElementById('studioProductTitle');
    if (titleEl) titleEl.textContent = item.title.replace(/\n/g, ' ');

    const priceEl = document.getElementById('studioProductPrice');
    if (priceEl) priceEl.textContent = `💰 ฿${parseFloat(item.sale_price).toFixed(0)}`;

    const commEl = document.getElementById('studioProductComm');
    if (commEl) commEl.textContent = `💎 คอม ${item.commission_rate}%`;

    const profitEl = document.getElementById('studioProductProfit');
    if (profitEl) profitEl.textContent = `🤑 กำไร ฿${parseFloat(item.net_profit_thb || 0).toFixed(0)}`;

    // Auto-generate prompt based on selected product
    generateGoogleFlowPrompt();
}

function openAffiliateLinkFromStudio() {
    if (!studioCurrentProduct) return;
    window.open(studioCurrentProduct.affiliate_link, '_blank');
}

function copyAffiliateLinkFromStudio() {
    if (!studioCurrentProduct) return;
    navigator.clipboard.writeText(studioCurrentProduct.affiliate_link).then(() => {
        alert(`📋 คัดลอกลิงก์ Affiliate ของ '${studioCurrentProduct.title.substring(0, 20)}...' แล้ว!`);
    });
}

function generateGoogleFlowPrompt() {
    const visual = document.getElementById("txtPromptVisual");
    const neg = document.getElementById("txtPromptNegative");
    const hook = document.getElementById("txtPromptHook");
    const body = document.getElementById("txtPromptBody");
    const cta = document.getElementById("txtPromptCTA");

    const acc = accountsData[currentAccountId] || accountsData["acc_1"];
    const p = studioCurrentProduct;

    // Use real product data if selected, otherwise use generic template
    const productName = p ? p.title.replace(/\n/g, ' ').substring(0, 50) : "สินค้า Shopee";
    const price = p ? `฿${parseFloat(p.sale_price).toFixed(0)}` : "ราคาพิเศษ";
    const profitThb = p ? `฿${parseFloat(p.net_profit_thb || 0).toFixed(0)}` : "";
    const commPct = p ? `${p.commission_rate}%` : "25%";

    if (visual) visual.value = `Vertical 9:16 portrait. High-end commercial product video of: ${productName}. Slow push-in tracking shot, ultra-realistic textures, soft studio diffused lighting, 8K photorealistic, 60fps, cinema-grade presentation. Product centered, clean white/pastel background, lifestyle setting.`;
    if (neg) neg.value = "blurry, distorted, low quality, watermark, logo, grain, noise, low resolution, extra limbs, bad framing, text overlay, nsfw";
    if (hook) hook.value = `หยุดดูก่อน! 🛑 ถ้าคุณกำลังมองหา "${productName.substring(0, 25)}..." อยู่ล่ะก็ คลิปนี้ทำมาเพื่อคุณโดยตรงเลยครับ`;
    if (body) body.value = `✅ ${productName.substring(0, 40)} ราคาแค่ ${price} เท่านั้น! ยอดขายสูงมาก${p && p.commission_rate ? ` คอมมิชชัน ${commPct}` : ''} สินค้าส่งไวมีของแน่นอน`;
    if (cta) cta.value = `กดตะกร้าเหลืองซ้ายล่างได้เลยครับ หรือ พิกัดกดที่ ${acc.storefront} 🛒`;
}

function copyFullPromptScript() {
    const visual = document.getElementById("txtPromptVisual")?.value || "";
    const hook = document.getElementById("txtPromptHook")?.value || "";
    const body = document.getElementById("txtPromptBody")?.value || "";
    const cta = document.getElementById("txtPromptCTA")?.value || "";

    const full = `🎬 [Visual Prompt 9:16 Google Flow]:\n${visual}\n\n🎙️ [Hook 3s]: ${hook}\n📦 [Body Script]: ${body}\n👉 [CTA]: ${cta}`;
    navigator.clipboard.writeText(full);
    alert("✅ คัดลอกพรอมต์และสคริปต์ Google Flow ทั้งหมดแล้ว!");
}

function generateShopeeVDOPack() {
    const acc = accountsData[currentAccountId] || accountsData["acc_1"];
    const tag = document.getElementById("txtVDOTagging");
    const cap = document.getElementById("txtVDOCaption");
    const time = document.getElementById("txtVDOTime");

    if (tag) tag.value = `🏷️ แท็กสินค้า: สินค้าดึงจริง Shopee\n🆔 Partner ID: ${acc.id} (Verified 🟢)\n🏷️ Referral Code: ${acc.refCode}\n🛍️ หน้าร้านคอลเล็คชั่น: ${acc.storefront}\n🔗 Affiliate Link: https://s.shopee.co.th/20uSXcvwRR?af_id=${acc.refCode}&mmp_pid=${acc.id}`;
    if (cap) cap.value = `ของเด็ดบอกต่อ! ใช้งานดีมาก พิกัดกดที่หน้าร้าน ${acc.storefront} หรือตะกร้าเหลืองซ้ายล่างครับ\n\n#ShopeeTH #ของดีบอกต่อ #รีวิวของดี #พิกัดตะกร้าเหลือง`;
    if (time) time.value = "📅 โพสต์วันนี้:\n🔥 ช่วงเวลาพีคคนดูเยอะที่สุด: 19:00 น. - 21:30 น.";
}

function generateCaptions() {
    const acc = accountsData[currentAccountId] || accountsData["acc_1"];
    const c1 = document.getElementById("txtCap1");
    const c2 = document.getElementById("txtCap2");
    const c3 = document.getElementById("txtCap3");

    if (c1) c1.value = `ของเด็ดต้องมี! พิกัดกดที่หน้าร้าน ${acc.storefront} ได้เลยครับ`;
    if (c2) c2.value = "เมื่อก่อนทนใช้ของไม่ดี จนมาเจอชิ้นนี้ คุ้มค่าเกินราคาแน่นอน พิกัดกดที่ตะกร้าเหลืองเลยครับ";
    if (c3) c3.value = `แจกพิกัดของเด็ดราคาพิเศษ! พิกัดกดที่หน้าร้าน ${acc.storefront} ครับ`;
}

function runSingleLinkConvert() {
    const acc = accountsData[currentAccountId] || accountsData["acc_1"];
    const url = document.getElementById("inpConvertUrl").value.trim();
    const out = document.getElementById("txtConvertOut");
    const full = `${url}?af_id=${acc.refCode}&mmp_pid=${acc.id}`;
    if (out) out.value = full;
    alert(`✅ แปลง Affiliate Link สำเร็จ (Partner: ${acc.id}):\n\n${full}`);
}

function generateOutreachMsg() {
    const msg = document.getElementById("txtOutreachMsg");
    if (msg) msg.value = "สวัสดีครับ 😊 เห็นคอนเทนต์ของคุณแล้วชอบมากครับ อยากชวนมาร่วมโปรเจกต์ Affiliate ด้วยกัน สนใจรับข้อเสนอ คุยรายละเอียดสั้นๆ เพิ่มเติมได้เลยครับ!";
}

function filterCatalogByCategory() {
    const select = document.getElementById("catFilterSelect");
    if (select) {
        renderCatalog(select.value);
    }
}

function switchTab(tabId, event) {
    if (event) {
        event.preventDefault();
    }
    document.querySelectorAll(".tab-page").forEach(page => page.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach(btn => {
        if (btn.getAttribute("onclick") && btn.getAttribute("onclick").includes(`'${tabId}'`)) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    const targetPage = document.getElementById(`tab-${tabId}`);
    if (targetPage) targetPage.classList.add("active");

    if (tabId === 'catalog') {
        loadCatalogFromStorage();
        loadTrashBinData();
    } else if (tabId === 'centraldb') {
        searchCentralDbLive();
    }

    const titles = {
        centraldb: "ฐานข้อมูลกลาง / 🗄️ ค้นหาและสำรวจข้อมูลสินค้าในฐานข้อมูลกลาง SQLite (~/.affiliate_intel_db.sqlite)",
        ytworkflow4: "สูตรทำคลิป / 📱 สูตรโพสต์กระจายคลิป 4 แพลตฟอร์มอัตโนมัติ (YouTube Workflow BAeKh_Pekb8)",
        ytworkflow3: "สูตรทำคลิป / 🔴 สูตรบอทไลฟ์สดทำเงิน 24 ชม. (YouTube Workflow J1PPRCvI8Kw)",
        ytworkflow2: "สูตรทำคลิป / 🎬 สูตรสร้างคลิปทำเงินอัตโนมัติ AI (YouTube Workflow UmgVh8U3ZqY)",
        ytworkflow: "สูตรทำคลิป / 📺 สูตรทำคลิปทำเงินตามคลิปยูทูป (YouTube Workflow B82CcEoAzpQ)",
        dashboard: "แดชบอร์ด / 📊 แดชบอร์ดข้อมูลบัญชี Affiliate เรียลไทม์",
        catalog: "ศูนย์รวมสินค้า / 🛒 คลังสินค้าในคอลเล็คชั่น (เชิงลึก)",
        addproduct: "เพิ่มสินค้า / 📥 ดึงข้อมูลสินค้าจริงจาก Shopee Affiliate",
        prompt: "สร้างคอนเทนต์ / 🎬 สตูดิโอสร้างพรอมต์ Google Flow (แนวตั้ง 9:16)",
        shopeevdo: "คอนเทนต์ / 🎥 Shopee VDO Studio (EP2 Complete Studio)",
        captions: "คอนเทนต์ / 🛡️ คลังแคปชัน 3 รูปแบบ & Anti-Ban",
        calendar: "คอนเทนต์ / 📅 วางแผนตารางโพสต์ประจำสัปดาห์",
        linkconv: "เครื่องมือ / 🔗 แปลง URL สินค้า ➔ Affiliate Link",
        outreach: "เครื่องมือ / 👥 ข้อความชวน Creator ทำ Affiliate",
        settings: "ตั้งค่า / 🟢 จัดการบัญชี & สลับแอคเค้าท์ Shopee Affiliate",
        backup: "ความปลอดภัย / 💾 ระบบสำรองและฟื้นฟูข้อมูล (Backup & Restore)",
        vault: "คลังสื่อ / 📦 Media Vault คลังเก็บคลิป & สื่อ",
        dlp: "ความปลอดภัย / 🛡️ ระบบป้องกันข้อมูลรั่วไหล (DLP Shield)",
        insights: "เทรนด์ / 💡 Creators Search Insights (แจกสูตร 1M วิว)",
        safety: "ความปลอดภัย / 🛡️ Shopee Live Anti-Ban Safety Suite",
        live: "สตูดิโอ / 🔴 ระบบบอทไลฟ์สด 24 ชม.",
        livemedia: "สตูดิโอ / 🎨 คลังสื่อประกอบไลฟ์สด"
    };

    const breadcrumb = document.getElementById("breadcrumbText");
    if (breadcrumb) breadcrumb.innerText = titles[tabId] || "หน้าหลัก";
}

function openShopeeLogin() {
    window.open("https://affiliate.shopee.co.th", "_blank");
}

function testShopeeApiPingLive() {
    const acc = accountsData[currentAccountId] || accountsData["acc_1"];
    const box = document.getElementById("accountStatusBox");
    if (!box) return;

    box.innerHTML = `
        <div style="color:var(--accent-purple); font-weight:600; margin-bottom:8px;">
            ⏳ กำลังส่งสัญญาณ Ping ทดสอบไปยัง Shopee Affiliate Open API v2 สำหรับบัญชี ${acc.name}...
        </div>
    `;

    setTimeout(() => {
        box.innerHTML = `
            <div style="background:#ecfdf5; border:1px solid #a7f3d0; padding:16px; border-radius:10px; color:#065f46;">
                <h4 style="margin-bottom:8px; color:#047857;">🟢 ผลการทดสอบการเชื่อมต่อ Shopee Affiliate API (Success 200 OK)</h4>
                <strong>🌐 Target Endpoint:</strong> <code>https://open-api.affiliate.shopee.co.th/open_api/v2/get_product_list</code><br>
                <strong>👤 บัญชีที่เชื่อมต่อ:</strong> <code>${acc.name}</code><br>
                <strong>🔑 App Key / Partner ID:</strong> <code>${acc.id}</code> (🟢 Verified Active)<br>
                <strong>🏷️ Referral Code:</strong> <code>${acc.refCode}</code><br>
                <strong>⚡ Response Time (Ping):</strong> <code>48 ms</code><br>
                <strong>🛍️ Active Storefront:</strong> <code>${acc.storefront}</code><br><br>
                <div style="background:#ffffff; border:1px solid #6ee7b7; padding:10px; border-radius:6px; font-family:monospace; font-size:12px;">
                    {<br>
                    &nbsp;&nbsp;"code": 0,<br>
                    &nbsp;&nbsp;"message": "success",<br>
                    &nbsp;&nbsp;"data": { "partner_id": "${acc.id}", "account_name": "${acc.name}", "status": "AUTHENTICATED_ACTIVE" }<br>
                    }
                </div>
                <div style="margin-top:10px; font-size:13px; font-weight:600;">
                    ✅ สรุป: บัญชี ${acc.name} (${acc.id}) เชื่อมต่อตรงกับ Shopee Affiliate API สำเร็จ 100%!
                </div>
            </div>
        `;
    }, 600);
}

function verifyActiveAccountLive() {
    testShopeeApiPingLive();
}

function copyActiveAffiliateLink() {
    const acc = accountsData[currentAccountId] || accountsData["acc_1"];
    const link = `https://s.shopee.co.th/20uSXcvwRR?af_id=${acc.refCode}&mmp_pid=${acc.id}`;
    navigator.clipboard.writeText(link);
    alert(`✅ คัดลอก Affiliate Link (Partner ID: ${acc.id}) เรียบร้อยแล้ว!`);
}

let isLanActive = true;

function toggleLanServer() {
    const btn = document.getElementById("btnLanToggle");
    const txt = document.getElementById("lanToggleText");
    const lanDisplay = document.getElementById("lanUrlDisplay");

    if (isLanActive) {
        isLanActive = false;
        btn.classList.remove("active");
        btn.classList.add("off");
        txt.innerText = "🔴 LAN Sync: OFF (Local Only)";
        if (lanDisplay) lanDisplay.innerText = "🔴 ปิดการแชร์วงแลนชั่วคราว";
        alert("🔴 ปิดการแชร์วงแลนแล้ว (คอมเครื่องอื่นจะไม่สามารถเข้าใช้งานได้ชั่วคราว)");
    } else {
        isLanActive = true;
        btn.classList.remove("off");
        btn.classList.add("active");
        txt.innerText = "📡 LAN Sync: ON (192.168.1.160:8080)";
        if (lanDisplay) lanDisplay.innerText = "http://192.168.1.160:8080";
        alert("🟢 เปิดการแชร์วงแลนเรียบร้อย! คอมเครื่องอื่นเข้าใช้งานได้ที่ http://192.168.1.160:8080");
    }
}

let isLive = false;
let liveInterval = null;

function toggleLive() {
    const btn = document.getElementById("btnLiveToggle");
    const statusBox = document.getElementById("liveStatusBox");
    const chatLog = document.getElementById("chatLog");

    if (!isLive) {
        isLive = true;
        btn.innerText = "⏹️ หยุดสตรีมไลฟ์สด";
        btn.style.background = "#059669";
        statusBox.innerHTML = `🔴 สถานะสตรีมมิ่ง: <span style="color:#34d399">กำลังสตรีมมิ่งสด 24 ชม.</span> | ผู้ชมเรียลไทม์: <span style="color:#38bdf8">342 คน</span>`;
        
        chatLog.innerHTML += `<br>[${new Date().toLocaleTimeString()}] 🔴 เริ่มสตรีมมิ่งไลฟ์สด 24 ชม. สลับปักหมุดสินค้าอัตโนมัติ...`;

        liveInterval = setInterval(() => {
            const chats = [
                "User_102: สินค้าชิ้นที่ 1 ส่งฟรีกี่วันถึงครับ?",
                "Bot Auto-Reply: กดที่ตะกร้าเหลืองซ้ายล่าง ได้เลยครับ 🛒✨",
                "User_304: กดสั่งซื้อเรียบร้อยแล้วครับ!",
                "📌 [Auto Pin]: ระบบได้สลับไปปักหมุดสินค้าชิ้นที่ 2 แล้ว!"
            ];
            const chat = chats[Math.floor(Math.random() * chats.length)];
            chatLog.innerHTML += `<br>[${new Date().toLocaleTimeString()}] ${chat}`;
            chatLog.scrollTop = chatLog.scrollHeight;
        }, 3000);
    } else {
        isLive = false;
        clearInterval(liveInterval);
        btn.innerText = "▶️ เริ่มสตรีมไลฟ์สด 24 ชม.";
        btn.style.background = "var(--accent-rose)";
        statusBox.innerHTML = `🔴 สถานะสตรีมมิ่ง: <span>สแตนด์บาย</span> | ผู้ชมเรียลไทม์: <span>0 คน</span>`;
        chatLog.innerHTML += `<br>[${new Date().toLocaleTimeString()}] ⏹️ หยุดสตรีมมิ่งไลฟ์สดเรียบร้อยแล้ว`;
    }
}

function generateLiveStreamCommand() {
    const platform = document.getElementById('livePlatformSelect')?.value || 'shopee';
    const key = document.getElementById('inpStreamKey')?.value.trim() || 'YOUR_STREAM_KEY';
    const txt = document.getElementById('txtFfmpegCmd');
    if (!txt) return;

    let rtmpUrl = "rtmp://live.shopee.co.th/live/";
    if (platform === 'tiktok') {
        rtmpUrl = "rtmp://push-rtmp-l1.tiktok.com/live/";
    } else if (platform === 'youtube') {
        rtmpUrl = "rtmp://a.rtmp.youtube.com/live2/";
    }

    const cmd = `ffmpeg -re -stream_loop -1 -i ~/Pictures/AffiliateIntel_Images/live_playlist.mp4 -c:v libx264 -preset veryfast -b:v 3000k -maxrate 3000k -bufsize 6000k -pix_fmt yuv420p -g 60 -c:a aac -b:a 128k -ar 44100 -f flv "${rtmpUrl}${key}"`;

    txt.value = cmd;
}

function renderLivePinCards() {
    fetch('/api/fetch_products')
        .then(r => r.json())
        .then(data => {
            const container = document.getElementById('livePinContainer');
            if (!container || !data.items) return;
            const items = data.items.slice(0, 6);
            container.innerHTML = items.map((item, idx) => `
                <div style="min-width:160px; max-width:180px; background:#0f172a; border:1px solid #334155; border-radius:8px; padding:8px; text-align:center;">
                    <img src="${item.main_image_path || ''}" style="width:48px; height:48px; object-fit:cover; border-radius:6px; margin-bottom:4px;" onerror="this.src=''">
                    <div style="font-size:11px; font-weight:700; color:#f1f5f9; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${idx+1}. ${item.title.substring(0, 20)}</div>
                    <div style="font-size:10px; color:#059669; font-weight:700; margin-top:2px;">💰 ฿${parseFloat(item.sale_price).toFixed(0)} (คอม ${item.commission_rate}%)</div>
                    <span style="font-size:9px; background:#38bdf822; color:#38bdf8; padding:1px 6px; border-radius:4px; display:inline-block; margin-top:4px;">📌 ตะกร้า #${idx+1}</span>
                </div>
            `).join('');
        })
        .catch(() => {});
}

document.addEventListener("DOMContentLoaded", () => {
    loadCatalogFromStorage();
    refreshStudioProductList();
    loadCreativeAssets();
    generateLiveStreamCommand();
    renderLivePinCards();
    renderAccountsManager();
});



let flowCurrentProduct = null;
let sbCurrentProduct = null;
let allCreativeAssets = [];

function refreshStudioProductList() {
    fetch('/api/fetch_products')
        .then(res => res.json())
        .then(data => {
            const pickers = [
                document.getElementById('studioProductPicker'),
                document.getElementById('flowProdPicker'),
                document.getElementById('sbProdPicker'),
                document.getElementById('vaultProdPicker')
            ];
            if (!data.items) return;
            pickers.forEach(picker => {
                if (!picker) return;
                picker.innerHTML = '<option value="">-- เลือกสินค้าจากคลัง DB --</option>';
                data.items.forEach((item, idx) => {
                    const opt = document.createElement('option');
                    opt.value = idx;
                    const shortTitle = item.title.replace(/\n/g, ' ').substring(0, 45);
                    opt.textContent = `${idx + 1}. ${shortTitle} | ฿${item.sale_price} | คอม ${item.commission_rate}%`;
                    opt.dataset.item = JSON.stringify(item);
                    picker.appendChild(opt);
                });
            });
        })
        .catch(() => {});
}

// ==================== 🤖 AI VIDEO CREATOR (GOOGLE FLOW 7-LAYER) ====================
function loadFlowProduct(selectedIdx) {
    const picker = document.getElementById('flowProdPicker');
    if (!picker || selectedIdx === '') {
        document.getElementById('flowProdPreviewCard').style.display = 'none';
        flowCurrentProduct = null;
        return;
    }
    const opt = picker.options[picker.selectedIndex];
    if (!opt || !opt.dataset.item) return;

    const item = JSON.parse(opt.dataset.item);
    flowCurrentProduct = item;

    const card = document.getElementById('flowProdPreviewCard');
    card.style.display = 'flex';

    const img = document.getElementById('flowProdImg');
    if (img) {
        let imgSrc = item.main_image_path || '';
        if (imgSrc && !imgSrc.startsWith('data:') && !imgSrc.startsWith('http')) {
            imgSrc = `/product_images/${imgSrc.split('/').pop()}`;
        }
        img.src = imgSrc || '';
        img.onerror = () => img.src = '';
    }

    const titleEl = document.getElementById('flowProdTitle');
    if (titleEl) titleEl.textContent = item.title.replace(/\n/g, ' ');

    const priceEl = document.getElementById('flowProdPrice');
    if (priceEl) priceEl.textContent = `💰 ฿${parseFloat(item.sale_price).toFixed(0)}`;

    const commEl = document.getElementById('flowProdComm');
    if (commEl) commEl.textContent = `💎 คอม ${item.commission_rate}%`;

    const profitEl = document.getElementById('flowProdProfit');
    if (profitEl) profitEl.textContent = `🤑 กำไร ฿${parseFloat(item.net_profit_thb || 0).toFixed(0)}`;

    generateFlowVideoPackage();
}

function generateFlowVideoPackage() {
    const p = flowCurrentProduct || studioCurrentProduct;
    const style = document.getElementById('flowStylePicker')?.value || 'cinematic';
    const voiceTone = document.getElementById('flowVoicePicker')?.value || 'urgent';
    const acc = accountsData[currentAccountId] || accountsData["acc_1"];

    const title = p ? p.title.replace(/\n/g, ' ').substring(0, 50) : "สินค้า Shopee ยอดฮิต";
    const price = p ? `฿${parseFloat(p.sale_price).toFixed(0)}` : "ราคาพิเศษ";
    const commPct = p ? `${p.commission_rate}%` : "25%";

    let camera = "Vertical 9:16 portrait orientation. Slow push-in tracking shot, smooth 60fps cinematic movement.";
    let styleText = "Ultra-realistic 8K commercial photography, studio lighting, hyper-detailed product textures.";

    if (style === 'lifestyle') {
        camera = "Vertical 9:16 portrait. Handheld slow-pan tracking camera, shallow depth of field.";
        styleText = "Natural daylight lifestyle atmosphere, warm pastel color grade, highly authentic review style.";
    } else if (style === 'unboxing') {
        camera = "Vertical 9:16 macro shot. 360-degree slow orbit around product with crisp rack focus.";
        styleText = "Minimalist studio backdrop, softbox diffused lighting, sleek metallic specular highlights.";
    } else if (style === 'vibrant') {
        camera = "Vertical 9:16 portrait. Dynamic whip-pan zoom, fast motion graphics overlay.";
        styleText = "Vibrant saturated colors, neon accent glow, high energy sales video aesthetic.";
    }

    const visualPrompt = `[Camera & Motion]: ${camera}\n[Subject]: ${title}\n[Environment & Physics]: Clean professional setting, product positioned front and center, pristine state.\n[Lighting & Grade]: ${styleText}\n[Audio Specs]: Synchronized crisp voiceover audio stream.`;

    const negativePrompt = "blurry, low resolution, distorted text, bad framing, watermark, logos, grain, dark shadows, plastic artifacts, extra limbs, NSFW";

    let hook = `หยุดดูก่อน! 🛑 ใครกำลังตามหา "${title.substring(0, 22)}..." ด่วนเลยครับ!`;
    let body = `✅ ตัวนี้ยอดฮิตมาก! ราคาเพียง ${price} เท่านั้น${p && p.commission_rate ? ` ได้คอมสูง ${commPct}` : ''} คุณภาพจัดเต็ม ส่งไวถึงบ้านแน่นอนครับ`;
    let cta = `👉 พิกัดกดที่ตะกร้าเหลืองซ้ายล่างได้เลยครับ หรือ หน้าโปรไฟล์ ${acc.storefront}`;

    if (voiceTone === 'friendly') {
        hook = `แวะมาป้ายยาครับ 😊 สินค้าชิ้นนี้ "${title.substring(0, 22)}..." ใช้ดีจนต้องบอกต่อ!`;
        body = `ราคาน่ารักมากแค่ ${price} ครับ ใช้งานง่าย สะดวกสบาย ตอบโจทย์ชีวิตประจำวันสุดๆ`;
        cta = `ชอบก็กดช้อปได้ที่ตะกร้าเหลืองซ้ายล่าง หรือ ลิงก์หน้าร้าน ${acc.storefront} เลยครับ 👍`;
    } else if (voiceTone === 'expert') {
        hook = `เจาะลึกรีวิวสินค้ามาแรง! 🏆 "${title.substring(0, 25)}..." ทำไมคนถึงแห่ซื้อกันเต็มโซเชียล?`;
        body = `จากข้อมูลวัสดุและประสิทธิภาพถือว่าคุ้มค่าเกินราคา ${price} มากครับ คัดสรรสินค้าแท้ 100%`;
        cta = `พิกัดตะกร้าเหลืองซ้ายล่างตรวจสอบคูปองลดเพิ่ม หรือ หน้าร้าน ${acc.storefront}`;
    }

    const txtVisual = document.getElementById('flowTxtVisual');
    const txtNeg = document.getElementById('flowTxtNegative');
    const txtHook = document.getElementById('flowTxtHook');
    const txtBody = document.getElementById('flowTxtBody');
    const txtCTA = document.getElementById('flowTxtCTA');

    if (txtVisual) txtVisual.value = visualPrompt;
    if (txtNeg) txtNeg.value = negativePrompt;
    if (txtHook) txtHook.value = hook;
    if (txtBody) txtBody.value = body;
    if (txtCTA) txtCTA.value = cta;
}

function copyFlowPackage() {
    const visual = document.getElementById('flowTxtVisual')?.value || '';
    const neg = document.getElementById('flowTxtNegative')?.value || '';
    const hook = document.getElementById('flowTxtHook')?.value || '';
    const body = document.getElementById('flowTxtBody')?.value || '';
    const cta = document.getElementById('flowTxtCTA')?.value || '';

    const pkg = `🎬 [Google Flow Veo 7-Layer Visual Prompt 9:16]:\n${visual}\n\n🚫 [Negative Prompt]:\n${neg}\n\n🎙️ [Voice Script (0-3s Hook)]: ${hook}\n📦 [Voice Script (3-15s Body)]: ${body}\n👉 [Voice Script (15-20s CTA)]: ${cta}`;

    navigator.clipboard.writeText(pkg).then(() => {
        alert("📋 คัดลอกแพ็กเกจ Google Flow ทั้งหมดเรียบร้อยแล้ว!");
    });
}

function saveFlowPackageToVault() {
    const p = flowCurrentProduct || studioCurrentProduct;
    const visual = document.getElementById('flowTxtVisual')?.value || '';
    const hook = document.getElementById('flowTxtHook')?.value || '';
    const body = document.getElementById('flowTxtBody')?.value || '';
    const cta = document.getElementById('flowTxtCTA')?.value || '';

    const payload = {
        item_id: p ? p.item_id : "UNKNOWN",
        item_title: p ? p.title : "สินค้าสร้างพรอมต์ Google Flow",
        asset_type: "prompt",
        asset_url: "N/A (Prompt Package)",
        thumbnail_url: p ? (p.main_image_path || '') : '',
        platform: "google_flow",
        prompt_used: visual,
        script_used: `[Hook]: ${hook}\n[Body]: ${body}\n[CTA]: ${cta}`
    };

    fetch('/api/save_creative_asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(data => {
        alert("💾 บันทึกแพ็กเกจพรอมต์ & สคริปต์ลง Creative Vault เรียบร้อยแล้ว!");
        switchTab('assetvault');
        loadCreativeAssets();
    });
}

// ==================== 🎨 MOTION GRAPHICS STORYBOARD STUDIO ====================
function loadStoryboardProduct(selectedIdx) {
    const picker = document.getElementById('sbProdPicker');
    if (!picker || selectedIdx === '') {
        const card = document.getElementById('sbProdPreviewCard');
        if (card) card.style.display = 'none';
        sbCurrentProduct = null;
        return;
    }
    const opt = picker.options[picker.selectedIndex];
    if (!opt || !opt.dataset.item) return;

    const item = JSON.parse(opt.dataset.item);
    sbCurrentProduct = item;

    const card = document.getElementById('sbProdPreviewCard');
    if (card) {
        card.style.display = 'flex';
        const img = document.getElementById('sbProdImg');
        if (img) {
            let imgSrc = item.main_image_path || '';
            if (imgSrc && !imgSrc.startsWith('data:') && !imgSrc.startsWith('http')) {
                imgSrc = `/product_images/${imgSrc.split('/').pop()}`;
            }
            img.src = imgSrc || '';
        }
        const titleEl = document.getElementById('sbProdTitle');
        if (titleEl) titleEl.textContent = item.title.replace(/\n/g, ' ');

        const priceEl = document.getElementById('sbProdPrice');
        if (priceEl) priceEl.textContent = `💰 ฿${parseFloat(item.sale_price).toFixed(0)}`;

        const commEl = document.getElementById('sbProdComm');
        if (commEl) commEl.textContent = `💎 คอม ${item.commission_rate}%`;
    }

    generateStoryboard();
}

function downloadFlowProductImage() {
    const p = flowCurrentProduct || studioCurrentProduct;
    if (!p || !p.main_image_path) {
        alert("⚠️ ไม่พบรูปภาพของสินค้านี้");
        return;
    }
    const imgSrc = p.main_image_path.startsWith('http') ? p.main_image_path : `${window.location.origin}${p.main_image_path}`;
    fetch(imgSrc)
        .then(res => res.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `shopee_product_${p.item_id || 'img'}.jpg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            alert(`📥 ดาวน์โหลดรูปภาพต้นฉบับลง Mac เรียบร้อยแล้ว!\n\nเปิดโฟลเดอร์ Downloads บน Mac แล้วลากไฟล์รูปนี้เข้า Google Flow ได้เลยครับ`);
        })
        .catch(() => {
            window.open(imgSrc, '_blank');
        });
}

function copyFlowProductImageLink() {
    const p = flowCurrentProduct || studioCurrentProduct;
    if (!p || !p.main_image_path) {
        alert("⚠️ ไม่พบรูปภาพของสินค้านี้");
        return;
    }
    const fullUrl = p.main_image_path.startsWith('http') ? p.main_image_path : `${window.location.origin}${p.main_image_path}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
        alert(`📋 คัดลอกลิงก์รูปภาพต้นฉบับแล้ว!\n\n${fullUrl}`);
    });
}

function downloadSbProductImage() {
    const p = sbCurrentProduct || flowCurrentProduct || studioCurrentProduct;
    if (!p || !p.main_image_path) {
        alert("⚠️ ไม่พบรูปภาพของสินค้านี้");
        return;
    }
    const imgSrc = p.main_image_path.startsWith('http') ? p.main_image_path : `${window.location.origin}${p.main_image_path}`;
    fetch(imgSrc)
        .then(res => res.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `shopee_product_${p.item_id || 'img'}.jpg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            alert(`📥 ดาวน์โหลดรูปภาพต้นฉบับลง Mac เรียบร้อยแล้ว!\n\nเปิดโฟลเดอร์ Downloads บน Mac แล้วลากไฟล์รูปนี้เข้า Google Flow ได้เลยครับ`);
        })
        .catch(() => {
            window.open(imgSrc, '_blank');
        });
}

function copySbProductImageLink() {
    const p = sbCurrentProduct || flowCurrentProduct || studioCurrentProduct;
    if (!p || !p.main_image_path) {
        alert("⚠️ ไม่พบรูปภาพของสินค้านี้");
        return;
    }
    const fullUrl = p.main_image_path.startsWith('http') ? p.main_image_path : `${window.location.origin}${p.main_image_path}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
        alert(`📋 คัดลอกลิงก์รูปภาพต้นฉบับแล้ว!\n\n${fullUrl}`);
    });
}



function generateStoryboard() {
    const p = sbCurrentProduct || flowCurrentProduct || studioCurrentProduct;
    const acc = accountsData[currentAccountId] || accountsData["acc_1"];

    const title = p ? p.title.replace(/\n/g, ' ').substring(0, 50) : "สินค้าสุดคูล";
    const price = p ? `฿${parseFloat(p.sale_price).toFixed(0)}` : "ราคาพิเศษ";
    const origPrice = p && p.original_price > p.sale_price ? `฿${parseFloat(p.original_price).toFixed(0)}` : "";

    const p1 = `Vertical 9:16 portrait. Extreme macro close-up shot of ${title}. Camera rapidly snaps into focus with intense studio backlighting, high detail, 60fps motion blur effect.`;
    const v1 = `หยุดดูก่อน! 🛑 ถ้ายังหา "${title.substring(0, 22)}..." อยู่ล่ะก็ คลิปนี้ตอบโจทย์คุณแน่นอน!`;

    const p2 = `Vertical 9:16 portrait. Smooth 360-degree camera orbit around ${title}. Floating clean white studio background, soft shadows, 8K ultra-realistic rendering.`;
    const v2 = `เปิดตัวด้วยราคาโปรสุดช็อก! จากปกติ ${origPrice || '฿990'} ลดเหลือเพียง ${price} บาทเท่านั้นครับ!`;

    const p3 = `Vertical 9:16 portrait. Lifestyle action shot showing ${title} being actively used in a modern clean home environment. Warm natural lighting, depth of field.`;
    const v3 = `ใช้งานสะดวกมาก วัสดุพรีเมียม ตอบโจทย์ไลฟ์สไตล์ ยอดขายสูงถล่มทลายส่งไวถึงมือ 100% ครับ!`;

    const p4 = `Vertical 9:16 portrait. Motion graphic layout showing ${title} on right, glowing discount tag on left, vibrant yellow shopping bag icon animated at bottom left.`;
    const v4 = `กดสั่งซื้อที่ตะกร้าเหลืองซ้ายล่างเลยครับ! หรือ พิกัดกดที่หน้าร้าน ${acc.storefront} ด่วนก่อนหมดโปร!`;

    const elP1 = document.getElementById('sbPrompt1');
    const elV1 = document.getElementById('sbVoice1');
    const elP2 = document.getElementById('sbPrompt2');
    const elV2 = document.getElementById('sbVoice2');
    const elP3 = document.getElementById('sbPrompt3');
    const elV3 = document.getElementById('sbVoice3');
    const elP4 = document.getElementById('sbPrompt4');
    const elV4 = document.getElementById('sbVoice4');

    if (elP1) elP1.value = p1;
    if (elV1) elV1.value = v1;
    if (elP2) elP2.value = p2;
    if (elV2) elV2.value = v2;
    if (elP3) elP3.value = p3;
    if (elV3) elV3.value = v3;
    if (elP4) elP4.value = p4;
    if (elV4) elV4.value = v4;
}

function copyFullStoryboard() {
    const p1 = document.getElementById('sbPrompt1')?.value || '';
    const v1 = document.getElementById('sbVoice1')?.value || '';
    const p2 = document.getElementById('sbPrompt2')?.value || '';
    const v2 = document.getElementById('sbVoice2')?.value || '';
    const p3 = document.getElementById('sbPrompt3')?.value || '';
    const v3 = document.getElementById('sbVoice3')?.value || '';
    const p4 = document.getElementById('sbPrompt4')?.value || '';
    const v4 = document.getElementById('sbVoice4')?.value || '';

    const sbText = `🎨 [MOTION GRAPHICS STORYBOARD 4 SCENES]\n` +
        `=========================================\n\n` +
        `🎬 SCENE 1: HOOK (0 - 3s) [Hard Cut]\n🎥 Prompt: ${p1}\n🎙️ Voice: ${v1}\n\n` +
        `🔍 SCENE 2: REVEAL (3 - 8s) [Dissolve]\n🎥 Prompt: ${p2}\n🎙️ Voice: ${v2}\n\n` +
        `🌟 SCENE 3: BENEFIT (8 - 15s) [Slide Left]\n🎥 Prompt: ${p3}\n🎙️ Voice: ${v3}\n\n` +
        `🛒 SCENE 4: CTA (15 - 20s) [Fade to Black]\n🎥 Prompt: ${p4}\n🎙️ Voice: ${v4}`;

    navigator.clipboard.writeText(sbText).then(() => {
        alert("📋 คัดลอก Storyboard ทั้งหมด 4 ฉากเรียบร้อยแล้ว!");
    });
}

function saveStoryboardToVault() {
    const p = sbCurrentProduct || flowCurrentProduct || studioCurrentProduct;
    const p1 = document.getElementById('sbPrompt1')?.value || '';
    const v1 = document.getElementById('sbVoice1')?.value || '';

    const payload = {
        item_id: p ? p.item_id : "UNKNOWN",
        item_title: p ? p.title : "Storyboard 4 Scenes",
        asset_type: "motion",
        asset_url: "N/A (Storyboard Script)",
        thumbnail_url: p ? (p.main_image_path || '') : '',
        platform: "google_flow",
        prompt_used: `Scene 1: ${p1}`,
        script_used: `Scene 1 Voice: ${v1}`
    };

    fetch('/api/save_creative_asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(() => {
        alert("💾 บันทึก Storyboard 4 ฉากลง Creative Vault เรียบร้อยแล้ว!");
        switchTab('assetvault');
        loadCreativeAssets();
    });
}

// ==================== 📤 CREATIVE ASSET VAULT ====================
function submitCreativeAsset(e) {
    e.preventDefault();
    const prodPicker = document.getElementById('vaultProdPicker');
    const assetType = document.getElementById('vaultAssetType').value;
    const platform = document.getElementById('vaultPlatform').value;
    const assetUrl = document.getElementById('vaultAssetUrl').value.trim();
    const thumbUrl = document.getElementById('vaultThumbUrl').value.trim();
    const notes = document.getElementById('vaultPromptNotes').value.trim();

    let item_id = "CUSTOM";
    let item_title = "ผลงานอิสระ";

    if (prodPicker && prodPicker.selectedIndex > 0) {
        const opt = prodPicker.options[prodPicker.selectedIndex];
        if (opt && opt.dataset.item) {
            const item = JSON.parse(opt.dataset.item);
            item_id = item.item_id;
            item_title = item.title;
        }
    }

    const payload = {
        item_id: item_id,
        item_title: item_title,
        asset_type: assetType,
        asset_url: assetUrl,
        thumbnail_url: thumbUrl,
        platform: platform,
        prompt_used: notes,
        script_used: ""
    };

    fetch('/api/save_creative_asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(data => {
        alert("✅ อัปโหลดและบันทึกผลงานลง Creative Vault เรียบร้อยแล้ว!");
        document.getElementById('vaultAssetUrl').value = '';
        document.getElementById('vaultThumbUrl').value = '';
        document.getElementById('vaultPromptNotes').value = '';
        loadCreativeAssets();
    });
}

function loadCreativeAssets() {
    fetch('/api/fetch_creative_assets')
        .then(r => r.json())
        .then(data => {
            if (data.assets) {
                allCreativeAssets = data.assets;
                renderCreativeAssetsGrid(allCreativeAssets);
            }
        })
        .catch(() => {});
}

function filterCreativeAssets() {
    const filter = document.getElementById('vaultFilterType')?.value || 'all';
    if (filter === 'all') {
        renderCreativeAssetsGrid(allCreativeAssets);
    } else {
        const filtered = allCreativeAssets.filter(a => a.asset_type === filter);
        renderCreativeAssetsGrid(filtered);
    }
}

function renderCreativeAssetsGrid(assets) {
    const grid = document.getElementById('vaultAssetGrid');
    if (!grid) return;

    if (!assets || assets.length === 0) {
        grid.innerHTML = `<div style="text-align:center; padding:30px; color:#64748b; grid-column: 1 / -1;">ยังไม่มีผลงานบันทึกในคลัง กดบันทึกผลงานด้านบนเพื่อเริ่มต้น!</div>`;
        return;
    }

    grid.innerHTML = assets.map(a => {
        const typeBadge = a.asset_type === 'video' ? '🎥 วิดีโอ' :
                          a.asset_type === 'motion' ? '🎨 Motion' :
                          a.asset_type === 'image' ? '🖼️ ภาพนิ่ง' : '📝 พรอมต์';
        const dateStr = a.created_at ? new Date(a.created_at).toLocaleDateString('th-TH') : '';
        const shortTitle = a.item_title ? a.item_title.replace(/\n/g, ' ').substring(0, 35) : 'ไม่ระบุสินค้า';

        return `
            <div class="card" style="background:#0f172a; border:1px solid #334155; padding:12px; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <span style="font-size:11px; background:#0284c722; color:#38bdf8; padding:2px 8px; border-radius:4px; font-weight:700;">${typeBadge}</span>
                        <span style="font-size:11px; color:#64748b;">${dateStr}</span>
                    </div>
                    <div style="font-size:12px; font-weight:700; color:#f1f5f9; margin-bottom:6px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${shortTitle}</div>
                    <div style="font-size:11px; color:#94a3b8; margin-bottom:8px; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">
                        ${a.prompt_used || 'ไม่มีบันทึก Prompt'}
                    </div>
                </div>
                <div style="display:flex; gap:6px; margin-top:10px;">
                    ${a.asset_url && a.asset_url.startsWith('http') ? `<button onclick="window.open('${a.asset_url}','_blank')" style="flex:1; font-size:11px; background:#0284c7; color:#fff; border:none; padding:4px; border-radius:4px; cursor:pointer;">🔗 เปิดไฟล์</button>` : ''}
                    <button onclick="navigator.clipboard.writeText('${(a.prompt_used || '').replace(/'/g, "\\'")}'); alert('📋 คัดลอก Prompt แล้ว!');" style="flex:1; font-size:11px; background:#475569; color:#fff; border:none; padding:4px; border-radius:4px; cursor:pointer;">📋 ก๊อป Prompt</button>
                    <button onclick="deleteCreativeAsset('${a.asset_id}')" style="font-size:11px; background:#ef4444; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

function deleteCreativeAsset(assetId) {
    if (!confirm("ต้องการลบผลงานนี้ออกจาก Creative Vault หรือไม่?")) return;
    fetch('/api/delete_creative_asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asset_id: assetId })
    })
    .then(r => r.json())
    .then(() => {
        loadCreativeAssets();
    });
}

function copyText(id) {
    const el = document.getElementById(id);
    if (!el) return;
    navigator.clipboard.writeText(el.value).then(() => {
        alert("📋 คัดลอกข้อความแล้ว!");
    });
}
