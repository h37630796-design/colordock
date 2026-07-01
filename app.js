const baseCatalog = [
  { id: "wechat", name: "微信", short: "微", color: "#21bf61", group: "绿色", category: "社交通讯", url: "weixin://" },
  { id: "alipay", name: "支付宝", short: "支", color: "#1677ff", group: "蓝色", category: "金融支付", url: "alipay://" },
  { id: "xiaohongshu", name: "小红书", short: "RED", color: "#ff2442", group: "红色", category: "社交通讯", url: "xhsdiscover://" },
  { id: "weibo", name: "微博", short: "博", color: "#ff6a45", group: "橙色", category: "社交通讯", url: "sinaweibo://" },
  { id: "netease", name: "网易云音乐", short: "♪", color: "#e93636", group: "红色", category: "影音娱乐", url: "orpheus://" },
  { id: "qq", name: "QQ", short: "Q", color: "#53a9ed", group: "蓝色", category: "社交通讯", url: "mqq://" },
  { id: "bilibili", name: "哔哩哔哩", short: "B", color: "#fb7299", group: "粉色", category: "影音娱乐", url: "bilibili://" },
  { id: "douyin", name: "抖音", short: "♪", color: "#242124", group: "黑色", category: "影音娱乐", url: "snssdk1128://" },
  { id: "taobao", name: "淘宝", short: "淘", color: "#ff5b27", group: "橙色", category: "购物消费", url: "taobao://" },
  { id: "jd", name: "京东", short: "JD", color: "#e1251b", group: "红色", category: "购物消费", url: "openapp.jdmobile://" },
  { id: "meituan", name: "美团", short: "美", color: "#ffd100", group: "黄色", category: "生活服务", url: "imeituan://" },
  { id: "didi", name: "滴滴出行", short: "D", color: "#ff7a45", group: "橙色", category: "出行地图", url: "diditaxi://" },
  { id: "zhihu", name: "知乎", short: "知", color: "#1772f6", group: "蓝色", category: "知识阅读", url: "zhihu://" },
  { id: "douban", name: "豆瓣", short: "豆", color: "#4aaf62", group: "绿色", category: "知识阅读", url: "douban://" },
  { id: "baidu", name: "百度地图", short: "度", color: "#605cff", group: "紫色", category: "出行地图", url: "baidumap://" },
  { id: "amap", name: "高德地图", short: "高", color: "#2a75f3", group: "蓝色", category: "出行地图", url: "iosamap://" }
];

const groupOrder = [
  "全部", "红色", "橙色", "黄色", "绿色", "青色", "蓝色",
  "紫色", "粉色", "棕色", "黑色", "白色", "灰色"
];
const groupColors = {
  "红色": "#ef535d", "橙色": "#f38a42", "黄色": "#e2bd32", "绿色": "#45aa6b",
  "青色": "#35aeb4", "蓝色": "#438fda", "紫色": "#826bd4", "粉色": "#e46891",
  "棕色": "#8d674f", "黑色": "#242124", "白色": "#f7f7f5", "灰色": "#8b8b90"
};
const categoryOrder = [
  "全部", "社交通讯", "影音娱乐", "购物消费", "出行地图",
  "金融支付", "生活服务", "知识阅读", "效率工具", "其他"
];
const categoryColors = {
  "社交通讯": "#5e8ff0", "影音娱乐": "#eb668c", "购物消费": "#f0844e",
  "出行地图": "#45a77b", "金融支付": "#5475d9", "生活服务": "#dfb43d",
  "知识阅读": "#8a6cc8", "效率工具": "#4da5ad", "其他": "#85827f"
};
const appAliases = {
  wechat: ["微信", "wechat"],
  alipay: ["支付宝", "alipay"],
  xiaohongshu: ["小红书", "red"],
  weibo: ["微博", "新浪微博"],
  netease: ["网易云音乐", "网易云"],
  qq: ["qq"],
  bilibili: ["哔哩哔哩", "bilibili", "b站"],
  douyin: ["抖音"],
  taobao: ["淘宝"],
  jd: ["京东"],
  meituan: ["美团"],
  didi: ["滴滴出行", "滴滴"],
  zhihu: ["知乎"],
  douban: ["豆瓣"],
  baidu: ["百度地图"],
  amap: ["高德地图", "高德"]
};
const defaultSelected = ["wechat", "alipay", "xiaohongshu", "netease", "qq", "bilibili", "taobao", "meituan"];
const defaultFavorites = ["wechat", "alipay", "taobao", "netease"];
let customApps = JSON.parse(localStorage.getItem("colordock-custom") || "[]");
customApps = customApps.map(app => app.group === "黑白" ? {
  ...app, group: "黑色", color: groupColors["黑色"]
} : app).map(app => ({ ...app, category: app.category || "其他" }));
let catalog = [...baseCatalog, ...customApps];
let selected = new Set(JSON.parse(localStorage.getItem("colordock-selected") || "null") || defaultSelected);
let favorites = new Set(JSON.parse(localStorage.getItem("colordock-favorites") || "null") || defaultFavorites);
let activeGroup = "全部";
let classificationMode = localStorage.getItem("colordock-mode") || "color";
let catalogMode = "all";
let toastTimer;
let detectedAppIds = [];
let manuallySelectedImportIds = new Set();
let ocrLibraryPromise;

const filters = document.querySelector("#filters");
const appGrid = document.querySelector("#appGrid");
const emptyState = document.querySelector("#emptyState");
const sheet = document.querySelector("#manageSheet");
const backdrop = document.querySelector("#sheetBackdrop");
const catalogList = document.querySelector("#catalogList");
const catalogEmpty = document.querySelector("#catalogEmpty");
const searchInput = document.querySelector("#searchInput");
const favoriteList = document.querySelector("#favoriteList");
const homeSearchInput = document.querySelector("#homeSearchInput");

function save() {
  localStorage.setItem("colordock-selected", JSON.stringify([...selected]));
  localStorage.setItem("colordock-favorites", JSON.stringify([...favorites]));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;"
  })[char]);
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.remove("hidden");
  toastTimer = setTimeout(() => toast.classList.add("hidden"), 1800);
}

function renderFilters() {
  const order = classificationMode === "color" ? groupOrder : categoryOrder;
  const property = classificationMode === "color" ? "group" : "category";
  const colors = classificationMode === "color" ? groupColors : categoryColors;
  filters.innerHTML = order.map(group => {
    const count = catalog.filter(app => selected.has(app.id) && (group === "全部" || app[property] === group)).length;
    if (group !== "全部" && count === 0) return "";
    const color = group === "全部"
      ? "linear-gradient(135deg,#ef6570,#efc257 35%,#54b77b 68%,#7868d8)"
      : colors[group];
    return `<button class="filter ${group === activeGroup ? "active" : ""}" style="--filter-color:${color}" data-group="${group}">${group} · ${count}</button>`;
  }
  ).join("");
  filters.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", () => {
      homeSearchInput.value = "";
      activeGroup = button.dataset.group;
      renderFilters();
      renderApps();
    });
  });
}

function renderFavorites() {
  const allFavorites = catalog.filter(app => selected.has(app.id) && favorites.has(app.id));
  const apps = allFavorites.slice(0, 4);
  document.querySelector("#favoriteSection").classList.toggle("hidden", apps.length === 0);
  document.querySelector("#editFavoritesButton").textContent = allFavorites.length > 4
    ? `编辑 · ${allFavorites.length}`
    : "编辑";
  favoriteList.innerHTML = apps.map(app => `
    <button class="favorite-app" data-url="${escapeHTML(app.url)}">
      <span class="app-icon ${["白色", "黄色"].includes(app.group) ? "light-icon" : ""}" style="--app-color:${app.color}">${escapeHTML(app.short)}</span>
      <span class="favorite-copy"><strong>${escapeHTML(app.name)}</strong><small>${app.category}</small></span>
    </button>
  `).join("");
  favoriteList.querySelectorAll(".favorite-app").forEach(button => {
    button.addEventListener("click", () => {
      showToast(`正在打开 ${button.querySelector("strong").textContent}`);
      window.location.href = button.dataset.url;
    });
  });
}

function renderApps() {
  const property = classificationMode === "color" ? "group" : "category";
  const query = homeSearchInput.value.trim().toLowerCase();
  const apps = catalog.filter(app =>
    selected.has(app.id) &&
    (query ? app.name.toLowerCase().includes(query) : (activeGroup === "全部" || app[property] === activeGroup))
  );
  const selectedApps = catalog.filter(app => selected.has(app.id));
  const usedGroups = new Set(selectedApps.map(app => app[property]));
  document.querySelector("#appCount").textContent = selectedApps.length;
  document.querySelector("#colorCount").textContent = usedGroups.size;
  document.querySelector("#groupTitle").textContent = query
    ? "搜索结果"
    : activeGroup === "全部" ? "全部应用" : classificationMode === "color" ? `${activeGroup}应用` : activeGroup;
  document.querySelector("#groupCount").textContent = apps.length;
  appGrid.innerHTML = apps.map(app => `
    <button class="app" data-url="${escapeHTML(app.url)}" title="打开${escapeHTML(app.name)}">
      <span class="app-icon ${["白色", "黄色"].includes(app.group) ? "light-icon" : ""}" style="--app-color:${app.color}">${escapeHTML(app.short)}</span>
      <span class="app-name">${escapeHTML(app.name)}</span>
    </button>
  `).join("");
  appGrid.classList.toggle("hidden", apps.length === 0);
  emptyState.classList.toggle("hidden", apps.length !== 0);
  appGrid.querySelectorAll(".app").forEach(button => {
    button.addEventListener("click", () => {
      const name = button.querySelector(".app-name").textContent;
      showToast(`正在打开 ${name}`);
      window.location.href = button.dataset.url;
    });
  });
}

function renderCatalog(query = "") {
  const normalized = query.trim().toLowerCase();
  const apps = catalog.filter(app =>
    app.name.toLowerCase().includes(normalized) &&
    (catalogMode === "all" || selected.has(app.id))
  );
  document.querySelector("#sheetSummary").textContent = `已添加 ${catalog.filter(app => selected.has(app.id)).length} 个`;
  catalogEmpty.classList.toggle("hidden", apps.length !== 0);
  catalogList.innerHTML = apps.map(app => `
    <div class="catalog-row">
      <span class="catalog-icon ${["白色", "黄色"].includes(app.group) ? "light-icon" : ""}" style="--app-color:${app.color}">${escapeHTML(app.short)}</span>
      <span class="catalog-copy"><strong>${escapeHTML(app.name)}</strong><small>${app.group} · ${app.category}</small></span>
      <button class="favorite-toggle ${favorites.has(app.id) ? "on" : ""}" data-favorite-id="${app.id}" aria-label="设为常用">${favorites.has(app.id) ? "★" : "☆"}</button>
      <button class="toggle ${selected.has(app.id) ? "on" : ""}" data-id="${app.id}" aria-label="选择${escapeHTML(app.name)}"></button>
    </div>
  `).join("");
  catalogList.querySelectorAll(".toggle").forEach(button => {
    button.addEventListener("click", () => {
      selected.has(button.dataset.id) ? selected.delete(button.dataset.id) : selected.add(button.dataset.id);
      save();
      renderCatalog(searchInput.value);
      renderFilters();
      renderApps();
      renderFavorites();
    });
  });
  catalogList.querySelectorAll(".favorite-toggle").forEach(button => {
    button.addEventListener("click", () => {
      const id = button.dataset.favoriteId;
      favorites.has(id) ? favorites.delete(id) : favorites.add(id);
      if (favorites.has(id)) selected.add(id);
      save();
      renderCatalog(searchInput.value);
      renderFilters();
      renderApps();
      renderFavorites();
    });
  });
}

function openSheet() {
  sheet.classList.remove("hidden");
  backdrop.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  renderCatalog();
}

function closeSheet() {
  closeCustomSheet();
  closeImportSheet();
  sheet.classList.add("hidden");
  backdrop.classList.add("hidden");
  document.body.style.overflow = "";
}

function setCatalogMode(mode) {
  catalogMode = mode;
  document.querySelector("#showAllButton").classList.toggle("active", mode === "all");
  document.querySelector("#showSelectedButton").classList.toggle("active", mode === "selected");
  renderCatalog(searchInput.value);
}

function setClassificationMode(mode) {
  if (!["color", "category"].includes(mode)) mode = "color";
  classificationMode = mode;
  homeSearchInput.value = "";
  activeGroup = "全部";
  localStorage.setItem("colordock-mode", mode);
  document.querySelector("#colorModeButton").classList.toggle("active", mode === "color");
  document.querySelector("#categoryModeButton").classList.toggle("active", mode === "category");
  document.querySelector("#filterTitleText").textContent = mode === "color" ? "探索色彩" : "探索用途";
  document.querySelector("#metricLabel").textContent = mode === "color" ? "种颜色" : "类用途";
  renderFilters();
  renderApps();
  renderFavorites();
}

function openCustomSheet() {
  document.querySelector("#customSheet").classList.remove("hidden");
}

function closeCustomSheet() {
  document.querySelector("#customSheet").classList.add("hidden");
}

function openImportSheet() {
  document.querySelector("#importSheet").classList.remove("hidden");
  renderImportSuggestions("");
}

function closeImportSheet() {
  document.querySelector("#importSheet").classList.add("hidden");
}

function loadOCRLibrary() {
  if (window.Tesseract) return Promise.resolve(true);
  if (ocrLibraryPromise) return ocrLibraryPromise;
  const sources = [
    "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js",
    "https://unpkg.com/tesseract.js@5.1.1/dist/tesseract.min.js"
  ];
  ocrLibraryPromise = new Promise(resolve => {
    const trySource = index => {
      if (index >= sources.length) {
        resolve(false);
        return;
      }
      const script = document.createElement("script");
      const timer = setTimeout(() => {
        script.remove();
        trySource(index + 1);
      }, 12000);
      script.src = sources[index];
      script.onload = () => {
        clearTimeout(timer);
        resolve(Boolean(window.Tesseract));
      };
      script.onerror = () => {
        clearTimeout(timer);
        script.remove();
        trySource(index + 1);
      };
      document.head.appendChild(script);
    };
    trySource(0);
  });
  return ocrLibraryPromise;
}

async function recognizeScreenshots(files) {
  if (!files.length) return;
  const progress = document.querySelector("#importProgress");
  const bar = document.querySelector("#importProgressBar");
  const text = document.querySelector("#importProgressText");
  const results = document.querySelector("#importResults");
  progress.classList.remove("hidden");
  results.classList.add("hidden");
  const previousDetections = new Set(detectedAppIds);
  let recognizedText = "";
  let currentFileIndex = 0;
  let worker;

  try {
    text.textContent = "正在加载中文识别模型…";
    const libraryReady = await loadOCRLibrary();
    if (!libraryReady) throw new Error("OCR library unavailable");
    worker = await Tesseract.createWorker("chi_sim+eng", 1, {
      logger: message => {
        if (message.status === "recognizing text") {
          const total = ((currentFileIndex + (message.progress || 0)) / files.length) * 100;
          bar.style.width = `${Math.round(total)}%`;
        }
      }
    });
    for (let index = 0; index < files.length; index++) {
      currentFileIndex = index;
      text.textContent = `正在识别第 ${index + 1} / ${files.length} 张截图…`;
      const result = await worker.recognize(files[index]);
      recognizedText += `\n${result.data.text}`;
    }
    const normalized = recognizedText.replace(/\s+/g, "").toLowerCase();
    const batchDetections = catalog
      .filter(app => {
        const aliases = appAliases[app.id] || [app.name];
        return aliases.some(alias => normalized.includes(alias.replace(/\s+/g, "").toLowerCase()));
      })
      .map(app => app.id);
    detectedAppIds = [...new Set([...previousDetections, ...batchDetections])];
    bar.style.width = "100%";
    text.textContent = batchDetections.length
      ? `本次识别到 ${batchDetections.length} 个，已合并去重`
      : "本次暂未匹配，可在下方搜索补充";
    renderImportResults();
  } catch (error) {
    text.textContent = "识别失败，请换一张更清晰的截图";
    showToast("截图识别失败");
  } finally {
    if (worker) await worker.terminate();
  }
}

function renderImportResults() {
  const results = document.querySelector("#importResults");
  const list = document.querySelector("#importResultList");
  const apps = catalog.filter(app => detectedAppIds.includes(app.id));
  document.querySelector("#importResultCount").textContent = `${apps.length} 个已识别`;
  list.innerHTML = apps.length ? apps.map(app => `
    <div class="import-result-row">
      <span class="catalog-icon ${["白色", "黄色"].includes(app.group) ? "light-icon" : ""}" style="--app-color:${app.color}">${escapeHTML(app.short)}</span>
      <label>${escapeHTML(app.name)}<small>${app.group} · ${app.category}</small></label>
      <input type="checkbox" value="${app.id}" checked aria-label="导入${escapeHTML(app.name)}">
    </div>
  `).join("") : `<div class="catalog-empty"><strong>没有匹配结果</strong><small>建议截取普通桌面页面，并确保图标名称清晰可见。</small></div>`;
  updateImportConfirmButton();
  renderImportSuggestions(document.querySelector("#importSearchInput").value);
  results.classList.remove("hidden");
}

function renderImportSuggestions(query = "") {
  const list = document.querySelector("#importSuggestionList");
  if (!list) return;
  const normalized = query.trim().toLowerCase();
  const detected = new Set(detectedAppIds);
  const matches = catalog
    .filter(app => !detected.has(app.id))
    .filter(app => !normalized || app.name.toLowerCase().includes(normalized) ||
      (appAliases[app.id] || []).some(alias => alias.toLowerCase().includes(normalized)))
    .slice(0, normalized ? 12 : 6);
  list.innerHTML = matches.map(app => `
    <label class="import-suggestion">
      <span class="catalog-icon ${["白色", "黄色"].includes(app.group) ? "light-icon" : ""}" style="--app-color:${app.color}">${escapeHTML(app.short)}</span>
      <span><strong>${escapeHTML(app.name)}</strong><small>${app.category}</small></span>
      <input type="checkbox" value="${app.id}" ${manuallySelectedImportIds.has(app.id) ? "checked" : ""}>
    </label>
  `).join("") || `<div class="catalog-empty"><small>目录中没有找到，可以手动添加。</small></div>`;
  list.querySelectorAll("input").forEach(input => {
    input.addEventListener("change", () => {
      if (input.checked) manuallySelectedImportIds.add(input.value);
      else manuallySelectedImportIds.delete(input.value);
      updateImportConfirmButton();
    });
  });
}

function updateImportConfirmButton() {
  const button = document.querySelector("#confirmImportButton");
  const total = detectedAppIds.length + manuallySelectedImportIds.size;
  button.classList.toggle("hidden", total === 0);
  button.textContent = total ? `添加选中的应用（${total}）` : "添加选中的应用";
}

function confirmScreenshotImport() {
  const detectedIds = [...document.querySelectorAll("#importResultList input:checked")].map(input => input.value);
  const ids = [...new Set([...detectedIds, ...manuallySelectedImportIds])];
  ids.forEach(id => selected.add(id));
  save();
  renderCatalog(searchInput.value);
  renderFilters();
  renderApps();
  renderFavorites();
  closeImportSheet();
  showToast(`已导入 ${ids.length} 个应用`);
  detectedAppIds = [];
  manuallySelectedImportIds.clear();
  document.querySelector("#screenshotInput").value = "";
}

function addCustomApp() {
  const name = document.querySelector("#customName").value.trim();
  let url = document.querySelector("#customUrl").value.trim();
  const group = document.querySelector("#customGroup").value;
  const category = document.querySelector("#customCategory").value;
  if (!name || !url) {
    showToast("请填写应用名称和 URL Scheme");
    return;
  }
  if (!url.includes("://")) url += "://";
  if (!/^[a-z][a-z0-9+.-]*:\/\/$/i.test(url)) {
    showToast("URL Scheme 格式不正确");
    return;
  }
  const app = {
    id: `custom-${Date.now()}`,
    name,
    short: name.slice(0, 2),
    color: groupColors[group],
    group,
    category,
    url,
    custom: true
  };
  customApps.push(app);
  catalog.push(app);
  selected.add(app.id);
  localStorage.setItem("colordock-custom", JSON.stringify(customApps));
  save();
  document.querySelector("#customName").value = "";
  document.querySelector("#customUrl").value = "";
  closeCustomSheet();
  renderCatalog(searchInput.value);
  renderFilters();
  renderApps();
  renderFavorites();
  showToast(`${name} 已添加`);
}

document.querySelector("#manageButton").addEventListener("click", openSheet);
document.querySelector("#editFavoritesButton").addEventListener("click", openSheet);
document.querySelector("#dockAddButton").addEventListener("click", openSheet);
document.querySelector("#dockManageButton").addEventListener("click", openSheet);
document.querySelector("#emptyAddButton").addEventListener("click", openSheet);
document.querySelector("#closeSheet").addEventListener("click", closeSheet);
backdrop.addEventListener("click", () => {
  if (!document.querySelector("#customSheet").classList.contains("hidden")) {
    closeCustomSheet();
  } else {
    closeSheet();
  }
});
searchInput.addEventListener("input", event => renderCatalog(event.target.value));
homeSearchInput.addEventListener("input", renderApps);
document.querySelector("#showAllButton").addEventListener("click", () => setCatalogMode("all"));
document.querySelector("#showSelectedButton").addEventListener("click", () => setCatalogMode("selected"));
document.querySelector("#colorModeButton").addEventListener("click", () => setClassificationMode("color"));
document.querySelector("#categoryModeButton").addEventListener("click", () => setClassificationMode("category"));
document.querySelector("#customAppButton").addEventListener("click", openCustomSheet);
document.querySelector("#screenshotImportButton").addEventListener("click", openImportSheet);
document.querySelector("#closeImportSheet").addEventListener("click", closeImportSheet);
document.querySelector("#screenshotInput").addEventListener("change", event => recognizeScreenshots([...event.target.files]));
document.querySelector("#confirmImportButton").addEventListener("click", confirmScreenshotImport);
document.querySelector("#importSearchInput").addEventListener("input", event => {
  document.querySelector("#clearImportSearch").classList.toggle("hidden", !event.target.value);
  renderImportSuggestions(event.target.value);
});
document.querySelector("#clearImportSearch").addEventListener("click", () => {
  document.querySelector("#importSearchInput").value = "";
  document.querySelector("#clearImportSearch").classList.add("hidden");
  renderImportSuggestions("");
});
document.querySelector("#openCustomFromImport").addEventListener("click", () => {
  closeImportSheet();
  openCustomSheet();
});
document.querySelector("#closeCustomSheet").addEventListener("click", closeCustomSheet);
document.querySelector("#saveCustomApp").addEventListener("click", addCustomApp);

setClassificationMode(classificationMode);
renderFavorites();

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js");
}
