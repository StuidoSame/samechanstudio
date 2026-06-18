(function () {
  var STORAGE_KEY = "sameStudioLanguage";
  var CODES = ["ko", "en", "ja", "zh-CN", "zh-TW"];
  var LABELS = { ko: "한국어", en: "English", ja: "日本語", "zh-CN": "简体中文", "zh-TW": "繁體中文" };
  var traditionalMap = {
    "隐":"隱","私":"私","政":"政","策":"策","简":"簡","体":"體","语":"語","言":"言","应":"應","用":"用","网":"網","站":"站","与":"與","关":"關","于":"於","个":"個","人":"人","信":"信","息":"息","处":"處","理":"理","记":"記","录":"錄","页":"頁","务":"務","务":"務","范":"範","围":"圍","为":"為","发":"發","现":"現","权":"權","限":"限","设":"設","备":"備","图":"圖","片":"片","历":"曆","经":"經","过":"過","将":"將","这":"這","些":"些","并":"並","实":"實","际":"際","据":"據","数":"數","库":"庫","储":"儲","态":"態","标":"標","识":"識","错":"錯","误":"誤","订":"訂","阅":"閱","广":"廣","告":"告","询":"詢","问":"問","买":"買","卖":"賣","账":"帳","户":"戶","访":"訪","问":"問","护":"護","儿":"兒","童":"童","变":"變","更":"更","联":"聯","系":"繫","开":"開","启":"啟","闭":"閉","览":"覽","择":"擇","择":"擇","击":"擊","请":"請","查":"查","看":"看","详":"詳","节":"節","忆":"憶","归":"歸","档":"檔","键":"鍵","词":"詞","这":"這","样":"樣","达":"達","边":"邊","际":"際","戏":"戲","乐":"樂","车":"車","测":"測","构":"構","统":"統","项":"項","仅":"僅","从":"從","转":"轉","复":"復","删":"刪","除":"除","输":"輸","层":"層","护":"護","营":"營","运":"運","规":"規","则":"則","则":"則","续":"續","终":"終","约":"約","费":"費","购":"購","码":"碼","摄":"攝","照":"照","户":"戶","签":"簽","导":"導","览":"覽","场":"場","险":"險","违":"違","绝":"絕","对":"對","听":"聽","见":"見","动":"動","态":"態","声":"聲","话":"話","华":"華","进":"進","给":"給","类":"類","别":"別","门":"門","门":"門","从":"從","东":"東","来":"來","后":"後","时":"時","间":"間","万":"萬","无":"無","请":"請","谢":"謝","爱":"愛","开":"開","发":"發","选":"選","择":"擇","显":"顯","示":"示","击":"擊","压":"壓","缩":"縮","轻":"輕","欢":"歡","迎":"迎","来":"來","审":"審","静":"靜","观":"觀","设":"設","计":"計","创":"創","独":"獨","产":"產","业":"業","专":"專","页":"頁","径":"徑","读":"讀","写":"寫","档":"檔","线":"線","记":"記","忆":"憶","图":"圖","领":"領","域":"域","阶":"階","段":"段","优":"優","质":"質","还":"還","认":"認","证":"證","销":"銷","绝":"絕","仅":"僅","务":"務","况":"況","单":"單","独":"獨","条":"條","款":"款","约":"約","则":"則","尽":"盡","最":"最","少":"少","减":"減","传":"傳","输":"輸","云":"雲","检":"檢","测":"測","虚":"虛","拟":"擬","异":"異","灵":"靈","观":"觀","晓":"曉","强":"強","调":"調","达":"達","围":"圍","获":"獲","须":"須","进":"進","该":"該","种":"種","广":"廣","码":"碼","术":"術","术":"術","监":"監","责":"責","拥":"擁","较":"較","随":"隨","暂":"暫","继":"繼","续":"續","够":"夠","状":"狀","况":"況","产":"產","优":"優","质":"質","兴":"興","审":"審","阅":"閱","并":"並","条":"條","连":"連","接":"接","帮":"幫","助":"助","邮":"郵","电":"電","话":"話","题":"題","题":"題"
  };

  function normalize(code) {
    if (code === "zh") return "zh-CN";
    return CODES.indexOf(code) >= 0 ? code : "ko";
  }

  function get() {
    return normalize(localStorage.getItem(STORAGE_KEY) || localStorage.getItem("same-studio-terms-lang") || localStorage.getItem("same-studio-privacy-lang") || "ko");
  }

  function set(code) {
    var language = normalize(code);
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.querySelectorAll("[data-site-language]").forEach(function (button) {
      var active = button.getAttribute("data-site-language") === language;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    window.dispatchEvent(new CustomEvent("sameStudioLanguageChange", { detail: { language: language } }));
    return language;
  }

  function toTraditional(value) {
    if (typeof value === "string") return Array.from(value).map(function (character) { return traditionalMap[character] || character; }).join("");
    if (Array.isArray(value)) return value.map(toTraditional);
    if (value && typeof value === "object") {
      var result = {};
      Object.keys(value).forEach(function (key) { result[key] = toTraditional(value[key]); });
      return result;
    }
    return value;
  }

  function adjustMainOffset() {
    var main = document.querySelector("main");
    var row = document.querySelector(".site-language-row");
    if (!main || !row) return;
    main.style.paddingTop = "";
    var base = parseFloat(window.getComputedStyle(main).paddingTop) || 0;
    main.style.paddingTop = base + row.offsetHeight + "px";
  }

  function mount(onChange) {
    var header = document.querySelector("[data-header]");
    if (!header) return get();
    var row = document.createElement("div");
    row.className = "site-language-row";
    row.setAttribute("aria-label", "Site language");
    row.innerHTML = CODES.map(function (code) {
      return '<button class="site-language-button" type="button" data-site-language="' + code + '" aria-pressed="false">' + LABELS[code] + '</button>';
    }).join("");
    header.appendChild(row);
    row.addEventListener("click", function (event) {
      var button = event.target.closest("[data-site-language]");
      if (!button) return;
      set(button.getAttribute("data-site-language"));
    });
    window.addEventListener("sameStudioLanguageChange", function (event) { onChange(event.detail.language); });
    window.addEventListener("resize", adjustMainOffset, { passive: true });
    window.requestAnimationFrame(adjustMainOffset);
    var language = set(get());
    return language;
  }

  window.SameStudioLanguage = { codes: CODES, labels: LABELS, get: get, set: set, mount: mount, normalize: normalize, toTraditional: toTraditional };
})();
