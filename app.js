(() => {
  "use strict";

  // 상태 기계 개요
  // `state`는 화면에 표시되는 상태이며 docs/PLANNING.md 5절의 값만 가진다.
  // 세 불리언이 전이를 결정한다.
  //   shouldStayAwake: 사용자가 절전 방지를 원하는지. stop/expire/unsupported 시 false.
  //   timerExpired:     설정한 타이머가 끝났는지. 끝나면 가시성 변경으로 재시작하지 않는다.
  //   requestInProgress: wakeLock 요청이 진행 중인지. 중복 요청을 막는다.
  // requestWakeLock(fromUserGesture)는 요청이 사용자 조작에서 나왔는지 구분한다.
  // 일부 브라우저(예: Safari)는 사용자 조작 없는 자동 요청을 거부한다. 이때는
  // 오류가 아니라 `prompt`(시작 버튼을 누르도록 안내)를 표시하고, 조작에서 나온
  // 요청이 거부됐을 때만 `error`로 다룬다.
  // 활성 시간과 남은 시간은 tick이 아니라 Date.now() 차이를 누적하며,
  // wakeLock이 실제로 잡혀 있는 구간에서만 진행한다(startActiveTiming/pauseActiveTiming).

  const COPY = {
    ko: {
      seoTitle: "Wakeup — PC와 Mac 화면 절전 방지",
      seoDescription: "Wakeup은 설치 없이 브라우저에서 PC와 Mac 화면이 꺼지지 않도록 유지하고 타이머를 설정할 수 있는 간단한 웹 도구입니다.",
      homeLabel: "Wakeup 홈",
      tagline: "브라우저에서 화면이 잠들지 않게.",
      languageGroup: "언어 선택",
      theme: "다크 모드",
      timeGroup: "절전 방지 시간 정보",
      timerGroup: "타이머 선택",
      elapsedLabel: "절전 방지 시간",
      remainingLabel: "남은 시간",
      nextTimerLabel: "다음 타이머",
      nextTimerHint: "‘{start}’을 누르면 설정한 시간으로 타이머가 시작됩니다.",
      endTimeLabel: "종료 예정",
      interruptionLabel: "중단 횟수",
      interruptionHint: "이 페이지가 보이는 동안 화면을 켜 둡니다. 중단 횟수는 페이지가 보이는데도 절전 방지가 멈춘 횟수입니다. 저전력 모드, 배터리 절약 모드 또는 시스템 정책이 원인일 수 있습니다.",
      errorDeniedHint: "브라우저 또는 시스템이 요청을 거부했습니다. 저전력 모드, 배터리 절약 모드 또는 전원 정책이 원인일 수 있습니다. 절약 모드가 켜져 있다면 끄고, Wakeup 탭이 보이는 상태에서 다시 시도하세요.",
      popout: "작은 창으로 열기",
      ambientButton: "전체 화면 시계로 보기",
      ambientDesc: "현재 시각을 크게 표시합니다. 타이머를 설정하면 남은 시간이나 다음 타이머도 표시합니다.",
      popoutHint: "다른 창에서 작업할 때 작은 창으로 띄워 두세요.",
      popoutBlocked: "브라우저가 새 창을 막았습니다. 이 사이트의 팝업을 허용한 뒤 다시 눌러 주세요.",
      keyHint: "Space 키로도 시작·중지할 수 있습니다.",
      ambientHint: "Esc 키를 누르거나 화면을 클릭해 돌아가세요.",
      ambientNote: "절전 방지 중에 Wakeup 화면이 가려지면 일시 중단됩니다. 타이머가 끝나기 전에 화면이 다시 보이면 절전 방지를 다시 요청합니다.",
      chimeLabel: "종료 알림음",
      chimePreview: "미리 듣기",
      chimeNeedsClick: "종료 알림음을 켜려면 화면을 클릭하거나 Esc 이외의 키를 누르세요.",
      chimeMutedHint: "알림음이 꺼져 있습니다. 볼륨을 올리면 미리 들을 수 있습니다.",
      chimeUnavailableHint: "이 브라우저에서는 종료 알림음을 재생할 수 없습니다.",
      timerTitle: "타이머 설정",
      unlimited: "제한 없음",
      minutes15: "15분",
      minutes30: "30분",
      hour1: "1시간",
      hours2: "2시간",
      custom: "직접 입력",
      customHoursLabel: "시간",
      customMinutesLabel: "분",
      applyTimer: "적용",
      stop: "절전 방지 중지",
      start: "절전 방지 시작",
      retry: "다시 시도",
      sourceLink: "GitHub에서 프로젝트 보기",
      faqTitle: "자주 묻는 질문",
      faqStopQ: "언제 멈추나요?",
      faqStopA: "다른 탭으로 이동하거나 창을 최소화하면 절전 방지가 일시 중단됩니다. 직접 중지했거나 타이머가 끝난 경우를 제외하면, 창이 다시 보일 때 절전 방지를 다시 요청합니다. macOS에서는 다른 데스크톱(스페이스)에 있거나 다른 창에 완전히 가려져도 중단될 수 있습니다. 다른 창에서 작업할 때는 Wakeup을 작은 창으로 열어 화면에 보이게 두세요.",
      faqSystemQ: "노트북 덮개를 닫거나, 화면만 끄고 컴퓨터를 깨워 둘 수 있나요?",
      faqSystemA: "아니요. Wakeup은 화면이 꺼지는 것만 막을 수 있습니다. 덮개를 닫거나 운영체제가 절전 모드 또는 저전력 모드를 적용하면 이 기능이 제한될 수 있습니다. 화면을 끈 채 다운로드나 작업을 계속하려면 운영체제의 전원 설정을 사용하세요.",
      faqBatteryQ: "배터리가 더 빨리 닳나요?",
      faqBatteryA: "화면을 켜 두면 꺼져 있을 때보다 전력을 더 씁니다. Wakeup은 표준 Screen Wake Lock 기능을 사용합니다.",
      faqInstallQ: "설치해야 하나요? 어떤 브라우저에서 되나요?",
      faqInstallA: "설치 없이 브라우저에서 열면 됩니다. 온라인에서 앱 파일을 불러와 브라우저에 저장한 뒤에는 오프라인에서도 열 수 있습니다. 표준 Screen Wake Lock 기능을 지원하는 데스크톱 브라우저가 필요합니다.",
      faqPrivacyQ: "사용 기록이나 개인정보를 수집하나요?",
      faqPrivacyA: "아니요. 쿠키, 설정·이용 기록 저장, 분석 코드가 없습니다. 오프라인 실행에 필요한 앱 파일만 브라우저에 캐시됩니다.",
      invalidDuration: "시간과 분을 합쳐 1분 이상 입력하세요.",
      invalidHours: "시간을 0에서 999 사이의 정수로 입력하세요.",
      invalidMinutes: "분을 0에서 59 사이의 정수로 입력하세요.",
      interruptionCount: "{count}회",
      rapidReleaseHint: "절전 방지가 시작되자마자 {count}번 연속 중단됐습니다. 아래 버튼을 눌러 다시 시작하세요.",
      statusDocumentTitle: "{status} · Wakeup",
      states: {
        requesting: ["절전 방지를 시작하는 중", "화면이 꺼지지 않도록 브라우저에 요청하고 있습니다."],
        prompt: ["절전 방지 대기 중", "절전 방지를 시작하려면 아래 버튼을 누르세요."],
        active: ["절전 방지 중", "이 페이지가 보이는 동안 화면을 켜 둡니다. 다른 탭으로 옮기거나 창을 최소화하면 절전 방지가 일시 중단됩니다."],
        idle: ["절전 방지 꺼짐", "시스템 설정에 따라 화면이 꺼질 수 있습니다."],
        suspended: ["절전 방지가 일시 중단됨", "Wakeup 창이 다시 보이면 절전 방지를 다시 요청합니다."],
        expired: ["타이머 종료", "이제 시스템 설정에 따라 화면이 꺼질 수 있습니다."],
        unsupported: ["지원되지 않는 브라우저", "절전 방지를 사용하려면 Wakeup을 다른 데스크톱 브라우저에서 열어 보세요."],
        error: ["절전 방지를 시작하지 못함", "브라우저 또는 시스템이 요청을 허용하지 않았습니다. 아래 버튼으로 다시 시도할 수 있습니다."]
      }
    },
    en: {
      seoTitle: "Wakeup — Keep Your PC or Mac Screen Awake",
      seoDescription: "Wakeup is a simple, installation-free browser tool that keeps your PC or Mac screen awake with an optional timer.",
      homeLabel: "Wakeup home",
      tagline: "Keep your screen awake in the browser.",
      languageGroup: "Language selection",
      theme: "Dark mode",
      timeGroup: "Screen-awake time",
      timerGroup: "Timer selection",
      elapsedLabel: "Time the screen was kept awake",
      remainingLabel: "Time remaining",
      nextTimerLabel: "Next timer",
      nextTimerHint: "Select “{start}” to start the timer with the duration you set.",
      endTimeLabel: "Ends around",
      interruptionLabel: "Interruptions",
      interruptionHint: "Wakeup keeps the screen on while this page is visible. Interruptions count the times it paused while the page was visible. Low-power mode, battery saver, or system policies can cause interruptions.",
      errorDeniedHint: "The browser or system denied the request. Low-power mode, battery saver, or power policies may be the cause. If a power-saving mode is on, turn it off, then try again with the Wakeup tab visible.",
      popout: "Open in a small window",
      ambientButton: "Show full-screen clock",
      ambientDesc: "Shows a large clock. If you set a timer, it also shows the time remaining or the next timer duration.",
      popoutHint: "Keep it visible in a compact window while you work elsewhere.",
      popoutBlocked: "The browser blocked the new window. Allow pop-ups for this site and try again.",
      keyHint: "You can also press Space to start or stop.",
      ambientHint: "Press Esc or click the screen to go back.",
      ambientNote: "Keeping the screen awake pauses when Wakeup is hidden. If Wakeup becomes visible again before the timer ends, it asks the browser to keep the screen awake again.",
      chimeLabel: "Timer chime",
      chimePreview: "Preview",
      chimeNeedsClick: "Click the page or press a key other than Esc to enable the timer chime.",
      chimeMutedHint: "The timer chime is muted. Raise the volume to preview it.",
      chimeUnavailableHint: "This browser cannot play the timer chime.",
      timerTitle: "Set a timer",
      unlimited: "No limit",
      minutes15: "15 minutes",
      minutes30: "30 minutes",
      hour1: "1 hour",
      hours2: "2 hours",
      custom: "Custom",
      customHoursLabel: "Hours",
      customMinutesLabel: "Minutes",
      applyTimer: "Apply",
      stop: "Stop keeping the screen awake",
      start: "Keep the screen awake",
      retry: "Try again",
      sourceLink: "View the project on GitHub",
      faqTitle: "Frequently asked questions",
      faqStopQ: "When does it pause?",
      faqStopA: "Switching tabs or minimizing the window pauses Wakeup. When its window is visible again, Wakeup asks the browser to keep the screen awake again unless you stopped it or the timer ended. On macOS, Wakeup can also pause on another desktop (Space) or when other windows cover it completely. While working elsewhere, open Wakeup in a small window and keep it visible.",
      faqSystemQ: "Does it work with the lid closed, or keep the computer awake with the screen off?",
      faqSystemA: "No. Wakeup can only keep the screen awake. Closing the lid, putting the computer to sleep, or using low-power mode can limit this feature. To keep downloads or other tasks running with the screen off, use your operating system’s power settings.",
      faqBatteryQ: "Does it drain the battery faster?",
      faqBatteryA: "Keeping the screen on uses more power than letting it turn off. Wakeup uses the standard Screen Wake Lock feature.",
      faqInstallQ: "Do I need to install it? Which browsers work?",
      faqInstallA: "Open Wakeup in your browser without installing it. Once the browser has saved the app files after an online visit, you can open it offline. You need a desktop browser that supports the standard Screen Wake Lock feature.",
      faqPrivacyQ: "Does it collect any usage data or personal information?",
      faqPrivacyA: "No. There are no cookies, no stored preferences or usage history, and no analytics. Only the app files needed for offline use are cached by the browser.",
      invalidDuration: "Enter a total duration of at least 1 minute.",
      invalidHours: "Enter a whole number from 0 to 999 for hours.",
      invalidMinutes: "Enter a whole number from 0 to 59 for minutes.",
      interruptionCount: "{count}",
      rapidReleaseHint: "Wakeup stopped keeping the screen awake right after starting {count} times in a row. Press the button below to try again.",
      statusDocumentTitle: "{status} · Wakeup",
      states: {
        requesting: ["Starting to keep the screen awake", "Asking the browser to keep the screen awake."],
        prompt: ["Waiting to start", "Press the button below to keep the screen awake."],
        active: ["Keeping the screen awake", "Wakeup keeps the screen on while this page is visible. Switching tabs or minimizing the window pauses it."],
        idle: ["Wakeup is off", "The screen may turn off according to your system settings."],
        suspended: ["Keeping the screen awake is paused", "Wakeup will ask the browser to keep the screen awake again when its window is visible."],
        expired: ["Timer finished", "The screen may now turn off according to your system settings."],
        unsupported: ["Browser not supported", "To keep the screen awake, try opening Wakeup in another desktop browser."],
        error: ["Could not keep the screen awake", "The browser or system rejected the request. You can try again below."]
      }
    }
  };

  const CANONICAL_ORIGIN = "https://wakeup.subproject.kr";

  const elements = {
    statusPanel: document.querySelector("#status-panel"),
    statusTitle: document.querySelector("#status-title"),
    statusDescription: document.querySelector("#status-description"),
    statusTimes: document.querySelector(".status-times"),
    elapsed: document.querySelector("#elapsed-time"),
    remainingGroup: document.querySelector("#remaining-group"),
    remainingLabel: document.querySelector("#remaining-label"),
    remaining: document.querySelector("#remaining-time"),
    endTimeGroup: document.querySelector("#endtime-group"),
    endTime: document.querySelector("#end-time"),
    interruptionGroup: document.querySelector("#interruption-group"),
    interruptionCount: document.querySelector("#interruption-count"),
    action: document.querySelector("#action-button"),
    keyHint: document.querySelector("#key-hint"),
    popout: document.querySelector("#popout-button"),
    appMain: document.querySelector("main.app"),
    ambientButton: document.querySelector("#ambient-button"),
    ambient: document.querySelector("#ambient"),
    ambientClock: document.querySelector("#ambient-clock"),
    ambientRemaining: document.querySelector("#ambient-remaining"),
    ambientRemainingLabel: document.querySelector("#ambient-remaining-label"),
    ambientRemainingTime: document.querySelector("#ambient-remaining-time"),
    ambientNote: document.querySelector(".ambient-note"),
    chimeControl: document.querySelector(".chime-control"),
    chimeVolume: document.querySelector("#chime-volume"),
    chimeVolumeValue: document.querySelector("#chime-volume-value"),
    chimePreview: document.querySelector("#chime-preview"),
    chimeHint: document.querySelector("#chime-hint"),
    popoutBlocked: document.querySelector("#popout-blocked"),
    timerSection: document.querySelector(".timer-section"),
    timerButtons: document.querySelectorAll("[data-duration]"),
    customForm: document.querySelector("#custom-duration"),
    customHours: document.querySelector("#custom-hours"),
    customMinutes: document.querySelector("#custom-minutes"),
    languageButtons: document.querySelectorAll("[data-language]"),
    themeToggle: document.querySelector("#theme-toggle"),
    popoutItem: document.querySelector("#popout-item")
  };

  let language = getInitialLanguage();
  let state = "requesting";
  let wakeLock = null;
  let requestInProgress = false;
  let awaitingPeerSettings = false;
  let shouldStayAwake = true;
  let timerExpired = false;
  let interruptionCount = 0;
  let lastErrorName = "";
  // 잠금을 얻자마자 반복해서 풀리는 환경에서 재요청이 끝없이 이어지지 않도록 센다.
  const RAPID_RELEASE_MS = 2000;
  const RAPID_RELEASE_LIMIT = 3;
  let lockAcquiredAt = 0;
  let rapidReleaseCount = 0;
  let audioContext = null;
  let cursorHideTimer = null;
  // 알림음 크기(0~1). 저장하지 않으므로 새로 열면 기본값으로 돌아간다.
  let chimeLevel = 0.4;

  let selectedDurationKey = "unlimited";
  let selectedDurationMs = null;
  let selectedCustomHours = 0;
  let selectedCustomMinutes = 30;

  let activeElapsedMs = 0;
  let activeStartedAt = null;
  let timerRemainingMs = null;
  let timerStartedAt = null;

  function getInitialLanguage() {
    const requested = new URL(window.location.href).searchParams.get("lang");
    if (requested === "ko" || requested === "en") return requested;
    return navigator.language.toLowerCase().startsWith("en") ? "en" : "ko";
  }

  // 타이머 종료 알림음. 외부 오디오 파일 없이 Web Audio로 만든 짧은 두 음.
  // AudioContext는 자동재생 정책을 피하려고 사용자 조작(버튼 클릭) 때 만든다.
  function ensureAudio() {
    if (audioContext) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    try {
      audioContext = new Ctx();
    } catch {
      audioContext = null;
    }
    renderChimeSetting();
  }

  function playChime() {
    if (!audioContext || chimeLevel <= 0) return;
    try {
      if (audioContext.state === "suspended") void audioContext.resume();
      const start = audioContext.currentTime;
      const peak = 0.02 + chimeLevel * 0.34;
      [[0, 660], [0.18, 880]].forEach(([offset, frequency]) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, start + offset);
        gain.gain.exponentialRampToValueAtTime(peak, start + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + offset + 0.5);
        oscillator.connect(gain).connect(audioContext.destination);
        oscillator.start(start + offset);
        oscillator.stop(start + offset + 0.5);
      });
    } catch {
      // 재생이 차단되면 조용히 무시한다.
    }
  }

  function renderChimeSetting() {
    // 알림음은 타이머가 끝날 때만 울리므로 '제한 없음'이면 설정을 숨긴다.
    elements.chimeControl.hidden = selectedDurationMs === null;
    const percent = Math.round(chimeLevel * 100);
    elements.chimeVolume.value = String(percent);
    elements.chimeVolumeValue.textContent = `${percent}%`;
    const copy = COPY[language];
    const audioSupported = Boolean(window.AudioContext || window.webkitAudioContext);
    const muted = chimeLevel === 0;
    elements.chimeVolume.disabled = !audioSupported;
    elements.chimePreview.disabled = muted || !audioSupported;
    // 작은 창처럼 클릭 없이 타이머를 넘겨받은 창은 AudioContext가 없어 소리가 나지 않으므로
    // 사용자 조작이 한 번 있어야 알림음이 켜진다는 점을 알려 준다.
    elements.chimeHint.textContent = !audioSupported
      ? copy.chimeUnavailableHint
      : muted ? copy.chimeMutedHint : copy.chimeNeedsClick;
    elements.chimeHint.hidden = audioSupported && !muted && audioContext !== null;
  }

  // 앰비언트(큰 화면) 보기. Fullscreen API로 전체 화면에 현재 시각과, 타이머가
  // 설정돼 있으면 남은 시간만 저휘도로 크게 보여준다. 전체 화면은 visible 상태라
  // Wake Lock 흐름·상태 기계·타이밍은 그대로 재사용하며, 저장하는 값은 없다.
  function requestFullscreenOn(element) {
    const request = element.requestFullscreen || element.webkitRequestFullscreen;
    if (!request) return;
    try {
      const result = request.call(element);
      if (result && typeof result.catch === "function") result.catch(() => {});
    } catch {
      // 전체 화면 요청이 거부돼도 오버레이만으로 동작한다.
    }
  }

  function exitFullscreen() {
    if (!(document.fullscreenElement || document.webkitFullscreenElement)) return;
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (!exit) return;
    try {
      const result = exit.call(document);
      if (result && typeof result.catch === "function") result.catch(() => {});
    } catch {
      // 무시: 오버레이 정리는 closeAmbient에서 끝난다.
    }
  }

  function scheduleCursorHide() {
    elements.ambient.classList.remove("cursor-hidden");
    window.clearTimeout(cursorHideTimer);
    cursorHideTimer = window.setTimeout(() => {
      elements.ambient.classList.add("cursor-hidden");
    }, 3000);
  }

  function renderAmbient(remaining, timerLabel) {
    if (elements.ambient.hidden) return;
    elements.ambientClock.textContent = new Date().toLocaleTimeString(
      language === "ko" ? "ko-KR" : "en-US",
      { hour: "2-digit", minute: "2-digit", second: "2-digit" }
    );
    elements.ambientNote.hidden = !shouldStayAwake;
    elements.ambientRemaining.hidden = remaining === null;
    if (remaining !== null) {
      elements.ambientRemainingLabel.textContent = timerLabel;
      elements.ambientRemainingTime.textContent = formatTime(remaining, true);
    }
  }

  function openAmbient() {
    if (!elements.ambient.hidden) return;
    elements.appMain.inert = true;
    elements.ambient.hidden = false;
    renderClock();
    requestFullscreenOn(elements.ambient);
    elements.ambient.focus();
    scheduleCursorHide();
  }

  function closeAmbient() {
    if (elements.ambient.hidden) return;
    window.clearTimeout(cursorHideTimer);
    elements.ambient.classList.remove("cursor-hidden");
    elements.ambient.hidden = true;
    elements.appMain.inert = false;
    exitFullscreen();
    elements.ambientButton.focus();
  }

  function handleFullscreenChange() {
    const fullscreenElement =
      document.fullscreenElement || document.webkitFullscreenElement;
    if (!fullscreenElement && !elements.ambient.hidden) closeAmbient();
  }

  function translatePage() {
    const copy = COPY[language];
    document.documentElement.lang = language;

    // ?lang= 주소는 hreflang 대체 주소이므로 canonical도 자기 자신을 가리킨다.
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      const hasLangParam = new URL(window.location.href).searchParams.has("lang");
      canonical.href = hasLangParam
        ? `${CANONICAL_ORIGIN}/?lang=${language}`
        : `${CANONICAL_ORIGIN}/`;
    }

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = copy[element.dataset.i18n];
    });
    document.querySelectorAll("[data-i18n-content]").forEach((element) => {
      element.setAttribute("content", copy[element.dataset.i18nContent]);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
      element.setAttribute("aria-label", copy[element.dataset.i18nAria]);
    });
    elements.languageButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.language === language));
    });

    elements.customHours.setCustomValidity("");
    elements.customMinutes.setCustomValidity("");
    renderTimerSetting();
    renderState();
    renderClock();
    renderTheme();
  }

  // 테마: 기본은 시스템 설정. 버튼으로 바꾼 값은 저장하지 않으므로 새로 열면 시스템 설정으로 돌아간다.
  const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function isDark() {
    const override = document.documentElement.dataset.theme;
    return override ? override === "dark" : darkQuery.matches;
  }

  function renderTheme() {
    const copy = COPY[language];
    elements.themeToggle.textContent = copy.theme;
    elements.themeToggle.setAttribute("aria-pressed", String(isDark()));
  }

  function toggleTheme() {
    document.documentElement.dataset.theme = isDark() ? "light" : "dark";
    renderTheme();
  }

  function setLanguage(nextLanguage) {
    language = nextLanguage;
    const url = new URL(window.location.href);
    url.searchParams.set("lang", language);
    history.replaceState(null, "", url);
    translatePage();
  }

  function setState(nextState) {
    state = nextState;
    renderState();
  }

  function renderState() {
    const copy = COPY[language];
    const [title, description] = copy.states[state];
    elements.statusPanel.dataset.state = state;
    elements.statusTitle.textContent = title;
    let displayedDescription = description;
    if (state === "error" && lastErrorName === "NotAllowedError") {
      displayedDescription = copy.errorDeniedHint;
    } else if (state === "prompt" && rapidReleaseCount >= RAPID_RELEASE_LIMIT) {
      displayedDescription = copy.rapidReleaseHint.replace("{count}", RAPID_RELEASE_LIMIT);
    } else if (state === "active" && interruptionCount > 0) {
      displayedDescription = copy.interruptionHint;
    } else if (state === "idle" && selectedDurationMs !== null) {
      displayedDescription = copy.nextTimerHint.replace("{start}", copy.start);
    }
    elements.statusDescription.textContent = displayedDescription;
    // 탭이 백그라운드일 때도 사용자가 탭 제목만으로 알 수 있도록,
    // 주의가 필요한 상태(일시 중단·타이머 종료·오류)는 상태 제목을 탭 제목에 노출한다.
    const titleShowsStatus =
      state === "suspended" || state === "expired" || state === "error";
    document.title = titleShowsStatus ? copy.statusDocumentTitle.replace("{status}", title) : copy.seoTitle;

    const canStop = shouldStayAwake && (state === "active" || state === "requesting");
    elements.action.dataset.action = canStop ? "stop" : "start";
    elements.action.textContent = canStop
      ? copy.stop
      : state === "error" || state === "suspended"
        ? copy.retry
        : copy.start;
    const unsupported = state === "unsupported";
    elements.action.disabled = unsupported;
    elements.action.hidden = unsupported;
    elements.keyHint.hidden = unsupported;
    elements.statusTimes.hidden = unsupported;
    elements.timerSection.hidden = unsupported;
  }

  function formatTime(milliseconds, roundUp = false) {
    const seconds = Math.max(0, roundUp
      ? Math.ceil(milliseconds / 1000)
      : Math.floor(milliseconds / 1000));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainder = seconds % 60;
    return [hours, minutes, remainder]
      .map((value) => String(value).padStart(2, "0"))
      .join(":");
  }

  function renderTimerSetting() {
    elements.timerButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.duration === selectedDurationKey));
      if (button.dataset.duration === "custom") {
        button.setAttribute("aria-expanded", String(!elements.customForm.hidden));
      }
    });
    renderChimeSetting();
  }

  function setTimer(durationMs, key, customHours, customMinutes) {
    selectedDurationMs = durationMs;
    selectedDurationKey = key;
    if (key === "custom") {
      selectedCustomHours = customHours;
      selectedCustomMinutes = customMinutes;
    }

    timerRemainingMs = durationMs;
    timerStartedAt = durationMs !== null && state === "active" ? Date.now() : null;
    timerExpired = false;
    if (state === "expired" || state === "idle") setState("idle");
    renderTimerSetting();
    renderClock();
  }

  const TIMER_KEYS = ["unlimited", "15", "30", "60", "120", "custom"];

  // '작은 창으로 열기'는 opener와 새 창이 postMessage로 타이머·언어와 진행 상황을
  // 주고받는다. 창이 열릴 때 opener → 새 창으로, 새 창이 닫힐 때 새 창 → opener로
  // 전달한다. 저장소를 쓰지 않고 같은 출처끼리만 통신한다.
  function collectState() {
    return {
      type: "wakeup:settings",
      language,
      timerKey: selectedDurationKey,
      customHours: selectedCustomHours,
      customMinutes: selectedCustomMinutes,
      durationMs: selectedDurationMs,
      remainingMs: getTimerRemaining(),
      elapsedMs: getActiveElapsed(),
      timerExpired,
      shouldStayAwake,
      theme: document.documentElement.dataset.theme || null
    };
  }

  function applyPeerState(data) {
    if ((data.language === "ko" || data.language === "en") && data.language !== language) {
      setLanguage(data.language);
    }
    if (data.theme === "light" || data.theme === "dark") {
      document.documentElement.dataset.theme = data.theme;
      renderTheme();
    }
    if (state === "unsupported" || !TIMER_KEYS.includes(data.timerKey)) return;

    // 타이머 선택값(버튼 상태)
    if (data.timerKey === "custom") {
      const hours = Number(data.customHours);
      const minutes = Number(data.customMinutes);
      if (!Number.isInteger(hours) || !Number.isInteger(minutes) ||
          hours < 0 || hours > 999 || minutes < 0 || minutes > 59 ||
          hours + minutes === 0) return;
      selectedCustomHours = hours;
      selectedCustomMinutes = minutes;
      selectedDurationKey = "custom";
      elements.customHours.value = String(hours);
      elements.customMinutes.value = String(minutes);
      elements.customForm.hidden = false;
    } else {
      selectedDurationKey = data.timerKey;
      elements.customForm.hidden = true;
    }
    selectedDurationMs = typeof data.durationMs === "number" ? data.durationMs : null;

    // 진행 중인 남은 시간·절전 방지 시간 이어받기
    if ("elapsedMs" in data || "remainingMs" in data) {
      pauseActiveTiming();
      activeElapsedMs = Math.max(0, Number(data.elapsedMs) || 0);
      activeStartedAt = null;
      timerRemainingMs = typeof data.remainingMs === "number" ? Math.max(0, data.remainingMs) : null;
      timerStartedAt = null;
      timerExpired = Boolean(data.timerExpired);
      if (timerExpired || data.shouldStayAwake === false) {
        shouldStayAwake = false;
        void releaseWakeLock();
        setState(timerExpired ? "expired" : "idle");
      } else if (wakeLock && !wakeLock.released && document.visibilityState === "visible") {
        startActiveTiming();
        setState("active");
      } else if (state === "expired" || state === "idle") {
        setState("idle");
      }
    }

    renderTimerSetting();
    renderClock();
  }

  function postToPeer(target) {
    if (target && !target.closed) target.postMessage(collectState(), window.location.origin);
  }

  function startActiveTiming() {
    const now = Date.now();
    if (activeStartedAt === null) activeStartedAt = now;
    if (timerRemainingMs !== null && timerStartedAt === null) timerStartedAt = now;
  }

  function pauseActiveTiming() {
    const now = Date.now();
    if (activeStartedAt !== null) {
      activeElapsedMs += now - activeStartedAt;
      activeStartedAt = null;
    }
    if (timerStartedAt !== null) {
      timerRemainingMs = Math.max(0, timerRemainingMs - (now - timerStartedAt));
      timerStartedAt = null;
    }
  }

  function getActiveElapsed() {
    return activeElapsedMs + (activeStartedAt === null ? 0 : Date.now() - activeStartedAt);
  }

  function getTimerRemaining() {
    if (timerRemainingMs === null) return null;
    return Math.max(0, timerRemainingMs - (timerStartedAt === null ? 0 : Date.now() - timerStartedAt));
  }

  async function releaseWakeLock() {
    pauseActiveTiming();
    const currentLock = wakeLock;
    wakeLock = null;
    if (currentLock && !currentLock.released) await currentLock.release();
  }

  async function requestWakeLock(fromUserGesture = false) {
    if (awaitingPeerSettings && !fromUserGesture) return;
    if (fromUserGesture) {
      awaitingPeerSettings = false;
      rapidReleaseCount = 0;
    }
    if (!("wakeLock" in navigator)) {
      shouldStayAwake = false;
      pauseActiveTiming();
      setState("unsupported");
      return;
    }
    if (!shouldStayAwake || timerExpired || requestInProgress) return;
    if (document.visibilityState !== "visible") {
      pauseActiveTiming();
      setState("suspended");
      return;
    }
    if (wakeLock && !wakeLock.released) {
      startActiveTiming();
      setState("active");
      renderClock();
      return;
    }

    requestInProgress = true;
    setState("requesting");
    try {
      const requestedLock = await navigator.wakeLock.request("screen");
      if (!shouldStayAwake || timerExpired || document.visibilityState !== "visible") {
        await requestedLock.release();
        if (document.visibilityState !== "visible" && shouldStayAwake) setState("suspended");
        return;
      }

      wakeLock = requestedLock;
      lockAcquiredAt = Date.now();
      requestedLock.addEventListener("release", () => {
        if (wakeLock !== requestedLock) return;
        wakeLock = null;
        pauseActiveTiming();
        if (timerExpired) setState("expired");
        else if (!shouldStayAwake) setState("idle");
        else {
          setState("suspended");
          if (document.visibilityState === "visible") {
            // 페이지가 보이는데도 잠금이 풀린 경우만 '중단'으로 센다.
            // 사용자가 탭·창을 전환해 멈춘 것은 여기서 세지 않는다.
            interruptionCount += 1;
            renderClock();
            rapidReleaseCount = Date.now() - lockAcquiredAt < RAPID_RELEASE_MS
              ? rapidReleaseCount + 1
              : 0;
            // 얻자마자 연달아 풀리면 자동 재요청을 멈추고 사용자가 직접 다시 시작하게 한다.
            if (rapidReleaseCount >= RAPID_RELEASE_LIMIT) setState("prompt");
            else window.setTimeout(() => void requestWakeLock(), 0);
          }
        }
      }, { once: true });
      lastErrorName = "";
      startActiveTiming();
      setState("active");
      renderClock();
    } catch (error) {
      lastErrorName = error && error.name ? error.name : "";
      wakeLock = null;
      pauseActiveTiming();
      if (document.visibilityState !== "visible") setState("suspended");
      else setState(fromUserGesture ? "error" : "prompt");
    } finally {
      requestInProgress = false;
      renderState();
      if (
        shouldStayAwake &&
        !timerExpired &&
        wakeLock === null &&
        state === "suspended" &&
        document.visibilityState === "visible"
      ) {
        window.setTimeout(() => void requestWakeLock(), 0);
      }
    }
  }

  async function startNewSession() {
    activeElapsedMs = 0;
    activeStartedAt = null;
    timerRemainingMs = selectedDurationMs;
    timerStartedAt = null;
    timerExpired = false;
    shouldStayAwake = true;
    interruptionCount = 0;
    renderClock();
    await requestWakeLock(true);
  }

  async function stopWakeLock() {
    shouldStayAwake = false;
    timerExpired = false;
    const released = releaseWakeLock();
    setState("idle");
    renderClock();
    await released;
  }

  async function expireTimer() {
    if (timerExpired) return;
    timerExpired = true;
    shouldStayAwake = false;
    const released = releaseWakeLock();
    setState("expired");
    renderClock();
    await released;
    if (timerExpired) playChime();
  }

  function renderClock() {
    const copy = COPY[language];
    const nextTimer = !shouldStayAwake && !timerExpired;
    const remaining = nextTimer ? selectedDurationMs : getTimerRemaining();
    const timerLabel = nextTimer ? copy.nextTimerLabel : copy.remainingLabel;
    renderAmbient(remaining, timerLabel);
    elements.elapsed.textContent = formatTime(getActiveElapsed());

    elements.interruptionGroup.hidden = interruptionCount === 0;
    elements.interruptionCount.textContent = copy.interruptionCount.replace("{count}", interruptionCount);

    elements.remainingGroup.hidden = remaining === null;
    // 남은 시간은 잠금이 실제로 잡힌 동안에만 흐르므로, 예상 종료 시각도
    // 현재 진행 중(active)일 때만 의미가 있다.
    elements.endTimeGroup.hidden = remaining === null || state !== "active";
    if (remaining === null) return;

    elements.remainingLabel.textContent = timerLabel;
    elements.remaining.textContent = formatTime(remaining, true);
    if (state === "active") {
      elements.endTime.textContent = new Date(Date.now() + remaining)
        .toLocaleTimeString(language === "ko" ? "ko-KR" : "en-US", {
          hour: "2-digit",
          minute: "2-digit"
        });
    }
    if (remaining <= 0 && !timerExpired) void expireTimer();
  }

  elements.action.addEventListener("click", () => {
    const shouldStop = shouldStayAwake && (state === "active" || state === "requesting");
    if (shouldStop) void stopWakeLock();
    else if (shouldStayAwake) void requestWakeLock(true);
    else void startNewSession();
  });

  elements.popout.addEventListener("click", () => {
    const popup = window.open(
      window.location.href,
      "wakeup-window",
      "width=380,height=520,menubar=no,toolbar=no,location=no,status=no"
    );
    elements.popoutBlocked.hidden = popup !== null;
  });

  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin) return;
    const data = event.data;
    if (!data || typeof data !== "object") return;
    if (data.type === "wakeup:hello") {
      // 새로 열린 창의 요청. 현재 설정과 진행 상황을 그 창으로 보낸다.
      if (event.source) event.source.postMessage(collectState(), window.location.origin);
    } else if (data.type === "wakeup:settings") {
      const fromOpener = openedFromPeer && event.source === window.opener;
      if (fromOpener) awaitingPeerSettings = false;
      applyPeerState(data);
      if (fromOpener) void requestWakeLock();
    }
  });

  elements.chimeVolume.addEventListener("input", () => {
    chimeLevel = Math.min(1, Math.max(0, Number(elements.chimeVolume.value) / 100));
    renderChimeSetting();
  });

  // 첫 사용자 조작에서 AudioContext를 만들어 종료 알림음을 준비한다.
  // Esc는 사용자 활성화로 치지 않아 컨텍스트가 suspended로 남을 수 있으므로 건너뛴다.
  function prepareAudio(event) {
    if (event.type === "keydown" && event.key === "Escape") return;
    ensureAudio();
    if (!audioContext) return;
    ["pointerdown", "keydown"].forEach((type) => {
      document.removeEventListener(type, prepareAudio, true);
    });
  }
  ["pointerdown", "keydown"].forEach((type) => {
    document.addEventListener(type, prepareAudio, true);
  });

  elements.chimePreview.addEventListener("click", () => {
    playChime();
  });

  elements.ambientButton.addEventListener("click", openAmbient);
  elements.ambient.addEventListener("click", closeAmbient);
  elements.ambient.addEventListener("mousemove", () => {
    if (!elements.ambient.hidden) scheduleCursorHide();
  });
  document.addEventListener("fullscreenchange", handleFullscreenChange);
  document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.ambient.hidden) {
      closeAmbient();
      return;
    }
    if (event.code !== "Space" || event.repeat) return;
    if (!elements.ambient.hidden) return;
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    if (event.target instanceof Element &&
        event.target.closest("input, button, summary, a, [contenteditable]")) return;
    event.preventDefault();
    elements.action.click();
  });

  elements.timerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // 이전 입력 오류가 남아 있으면 유효한 값도 다시 적용되지 않으므로 먼저 지운다.
      elements.customHours.setCustomValidity("");
      elements.customMinutes.setCustomValidity("");
      const value = button.dataset.duration;
      if (value === "custom") {
        elements.customForm.hidden = false;
        renderTimerSetting();
        elements.customHours.focus();
        return;
      }

      elements.customForm.hidden = true;
      const duration = value === "unlimited" ? null : Number(value) * 60 * 1000;
      setTimer(duration, value);
    });
  });

  elements.customForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const copy = COPY[language];
    elements.customHours.setCustomValidity("");
    elements.customMinutes.setCustomValidity("");
    for (const [field, message] of [
      [elements.customHours, copy.invalidHours],
      [elements.customMinutes, copy.invalidMinutes]
    ]) {
      if (!field.validity.valid) {
        field.setCustomValidity(message);
        field.reportValidity();
        return;
      }
    }

    const hours = elements.customHours.valueAsNumber;
    const minutes = elements.customMinutes.valueAsNumber;
    if (hours + minutes === 0) {
      elements.customMinutes.setCustomValidity(copy.invalidDuration);
      elements.customMinutes.reportValidity();
      return;
    }

    setTimer((hours * 60 + minutes) * 60 * 1000, "custom", hours, minutes);
  });

  [elements.customHours, elements.customMinutes].forEach((element) => {
    element.addEventListener("input", () => {
      elements.customHours.setCustomValidity("");
      elements.customMinutes.setCustomValidity("");
    });
  });

  elements.languageButtons.forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.language));
  });

  elements.themeToggle.addEventListener("click", toggleTheme);
  darkQuery.addEventListener("change", renderTheme);

  document.addEventListener("visibilitychange", () => {
    if (awaitingPeerSettings) return;
    if (document.visibilityState === "visible" && shouldStayAwake && !timerExpired) {
      void requestWakeLock();
    } else if (document.visibilityState !== "visible" && shouldStayAwake) {
      pauseActiveTiming();
      setState("suspended");
    }
  });

  // 팝업 창이나 설치된 앱에서는 이미 별도 창이므로 '작은 창으로 열기'를 숨긴다.
  const openedFromPeer = window.opener !== null && !window.opener.closed;
  if (window.opener !== null || window.matchMedia("(display-mode: standalone)").matches) {
    elements.popoutItem.hidden = true;
  }

  if (openedFromPeer) {
    // 연 창에 현재 설정을 요청하고, 이 창이 닫힐 때 마지막 설정을 돌려준다.
    awaitingPeerSettings = "wakeLock" in navigator;
    window.opener.postMessage({ type: "wakeup:hello" }, window.location.origin);
    window.addEventListener("pagehide", () => {
      if (!awaitingPeerSettings) postToPeer(window.opener);
    }, { once: true });
  }

  translatePage();
  renderClock();
  window.setInterval(renderClock, 1000);
  if (awaitingPeerSettings) {
    // 부모 창이 응답하지 않으면 사용자가 작은 창에서 직접 시작할 수 있다.
    window.setTimeout(() => {
      if (awaitingPeerSettings && state === "requesting") setState("prompt");
    }, 1000);
  } else {
    void requestWakeLock();
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }
})();
