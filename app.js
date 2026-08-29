(() => {
  "use strict";

  // 상태 기계 개요
  // `state`는 화면에 표시되는 상태이며 PLANNING.md 5절의 값만 가진다.
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
      timeGroup: "절전 방지 시간 정보",
      timerGroup: "타이머 선택",
      elapsedLabel: "절전 방지 시간",
      remainingLabel: "남은 시간",
      timerTitle: "타이머 설정",
      currentTimerLabel: "현재",
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
      limitationsSummary: "작동 방식 및 제한 사항",
      limitationsIntro: "Wakeup은 설치 없이 브라우저의 표준 Screen Wake Lock 기능으로 화면이 꺼지지 않도록 요청합니다.",
      limitationVisible: "Wakeup 탭이 화면에 보일 때만 작동합니다. 다른 탭으로 이동하거나 창을 최소화하면 절전 방지가 멈추고, 이 탭으로 돌아오면 자동으로 다시 시작합니다.",
      limitationWindow: "다른 창에서 작업하면서 계속 켜 두려면 Wakeup을 별도 창으로 열고, 그 창을 최소화하지 말고 화면에 보이도록 두세요. 창에 포커스가 없어도 보이기만 하면 됩니다.",
      limitationSystem: "저전력 모드, 배터리 상태, 운영체제 정책이나 닫힌 노트북 덮개는 웹페이지가 제어할 수 없습니다.",
      limitationScreen: "화면 꺼짐 방지 기능이며, 화면을 끈 채 컴퓨터만 깨워 두는 기능은 아닙니다.",
      privacyNote: "사용자 설정이나 이용 기록은 저장하지 않습니다. 오프라인 실행에 필요한 앱 파일만 브라우저에 캐시됩니다.",
      sourceLink: "GitHub에서 프로젝트 보기",
      invalidDuration: "시간과 분을 합쳐 1분 이상 입력하세요.",
      states: {
        requesting: ["절전 방지를 시작하는 중", "브라우저에 화면 잠금 방지를 요청하고 있습니다."],
        prompt: ["절전 방지를 시작하려면 버튼을 누르세요", "이 브라우저에서는 사용자가 직접 시작해야 화면 잠금 방지가 허용됩니다. 아래 ‘절전 방지 시작’을 누르면 시작됩니다."],
        active: ["절전 방지 중", "이 페이지가 보이는 동안 화면이 켜진 상태를 유지합니다."],
        idle: ["절전 방지 꺼짐", "컴퓨터가 시스템 설정에 따라 절전 모드로 들어갈 수 있습니다."],
        suspended: ["절전 방지가 일시 중단됨", "이 탭이 화면에 보이지 않는 동안에는 절전 방지가 멈추고, 탭으로 돌아오면 자동으로 다시 시작합니다. 다른 창을 보면서 계속 쓰려면 Wakeup을 별도 창으로 열어 최소화하지 말고 화면에 보이게 두세요."],
        expired: ["타이머 종료", "이제 컴퓨터가 시스템 설정에 따라 절전 모드로 들어갈 수 있습니다."],
        unsupported: ["지원되지 않는 브라우저", "이 브라우저에서는 화면 잠금 방지 기능을 사용할 수 없습니다."],
        error: ["절전 방지를 시작하지 못함", "브라우저 또는 시스템이 요청을 허용하지 않았습니다. 아래 버튼으로 다시 시도할 수 있습니다."]
      }
    },
    en: {
      seoTitle: "Wakeup — Keep Your PC or Mac Screen Awake",
      seoDescription: "Wakeup is a simple, installation-free browser tool that keeps your PC or Mac screen awake with an optional timer.",
      homeLabel: "Wakeup home",
      tagline: "Keep your screen awake in the browser.",
      languageGroup: "Language selection",
      timeGroup: "Wake lock time information",
      timerGroup: "Timer selection",
      elapsedLabel: "Wake lock active",
      remainingLabel: "Time remaining",
      timerTitle: "Set a timer",
      currentTimerLabel: "Current",
      unlimited: "No limit",
      minutes15: "15 minutes",
      minutes30: "30 minutes",
      hour1: "1 hour",
      hours2: "2 hours",
      custom: "Custom",
      customHoursLabel: "Hours",
      customMinutesLabel: "Minutes",
      applyTimer: "Apply",
      stop: "Stop keeping awake",
      start: "Start keeping awake",
      retry: "Try again",
      limitationsSummary: "How it works and limitations",
      limitationsIntro: "Wakeup uses the browser's standard Screen Wake Lock feature to keep your screen on, with nothing to install.",
      limitationVisible: "Wakeup works only while its tab is visible on screen. Switching to another tab or minimizing the window pauses it; returning to this tab starts it again automatically.",
      limitationWindow: "To keep it on while you work in another window, open Wakeup in its own window and keep that window visible on screen, not minimized. The window does not need to be focused, only visible.",
      limitationSystem: "A web page cannot override low-power mode, battery restrictions, operating system policies, or a closed laptop lid.",
      limitationScreen: "This keeps the screen on; it cannot keep only the computer awake while the screen is off.",
      privacyNote: "No preferences or usage history are saved. Only the app files required for offline use are cached by the browser.",
      sourceLink: "View the project on GitHub",
      invalidDuration: "Enter a total duration of at least 1 minute.",
      states: {
        requesting: ["Starting wake lock", "Requesting permission from the browser to keep the screen awake."],
        prompt: ["Press the button to start", "This browser only allows screen wake lock after you start it yourself. Press “Start keeping awake” below to begin."],
        active: ["Keeping screen awake", "The screen will stay on while this page remains visible."],
        idle: ["Wake lock is off", "The computer may sleep according to its system settings."],
        suspended: ["Keeping awake is paused", "Staying awake pauses while this tab is not visible and resumes automatically when you return to it. To keep it running while you work in another window, open Wakeup in its own window and keep that window visible on screen, not minimized."],
        expired: ["Timer finished", "The computer may now sleep according to its system settings."],
        unsupported: ["Browser not supported", "This browser does not provide the screen wake lock feature."],
        error: ["Could not start wake lock", "The browser or system rejected the request. You can try again below."]
      }
    }
  };

  const elements = {
    metaDescription: document.querySelector("#meta-description"),
    statusPanel: document.querySelector("#status-panel"),
    statusTitle: document.querySelector("#status-title"),
    statusDescription: document.querySelector("#status-description"),
    elapsed: document.querySelector("#elapsed-time"),
    remainingGroup: document.querySelector("#remaining-group"),
    remaining: document.querySelector("#remaining-time"),
    action: document.querySelector("#action-button"),
    currentTimer: document.querySelector("#current-timer"),
    timerButtons: document.querySelectorAll("[data-duration]"),
    customForm: document.querySelector("#custom-duration"),
    customHours: document.querySelector("#custom-hours"),
    customMinutes: document.querySelector("#custom-minutes"),
    languageButtons: document.querySelectorAll("[data-language]")
  };

  let language = getInitialLanguage();
  let state = "requesting";
  let wakeLock = null;
  let requestInProgress = false;
  let shouldStayAwake = true;
  let timerExpired = false;

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

  function translatePage() {
    const copy = COPY[language];
    document.documentElement.lang = language;
    elements.metaDescription.setAttribute("content", copy.seoDescription);

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = copy[element.dataset.i18n];
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
    elements.statusDescription.textContent = description;
    // 탭이 백그라운드일 때도 사용자가 탭 제목만으로 알 수 있도록,
    // 주의가 필요한 상태(일시 중단·타이머 종료·오류)는 상태 제목을 탭 제목에 노출한다.
    const titleShowsStatus =
      state === "suspended" || state === "expired" || state === "error";
    document.title = titleShowsStatus ? `${title} · Wakeup` : copy.seoTitle;

    const canStop = shouldStayAwake && (state === "active" || state === "requesting");
    elements.action.dataset.action = canStop ? "stop" : "start";
    elements.action.textContent = canStop
      ? copy.stop
      : state === "error" || state === "suspended"
        ? copy.retry
        : copy.start;
    elements.action.disabled = state === "unsupported";
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

  function getSelectedTimerLabel() {
    const copy = COPY[language];
    if (selectedDurationKey !== "custom") {
      return copy[{
        unlimited: "unlimited",
        15: "minutes15",
        30: "minutes30",
        60: "hour1",
        120: "hours2"
      }[selectedDurationKey]];
    }
    if (language === "ko") {
      return [
        selectedCustomHours > 0 ? `${selectedCustomHours}시간` : "",
        selectedCustomMinutes > 0 ? `${selectedCustomMinutes}분` : ""
      ].filter(Boolean).join(" ");
    }

    return [
      selectedCustomHours > 0
        ? `${selectedCustomHours} ${selectedCustomHours === 1 ? "hour" : "hours"}`
        : "",
      selectedCustomMinutes > 0
        ? `${selectedCustomMinutes} ${selectedCustomMinutes === 1 ? "minute" : "minutes"}`
        : ""
    ].filter(Boolean).join(" ");
  }

  function renderTimerSetting() {
    elements.currentTimer.textContent = getSelectedTimerLabel();
    elements.timerButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.duration === selectedDurationKey));
      if (button.dataset.duration === "custom") {
        button.setAttribute("aria-expanded", String(!elements.customForm.hidden));
      }
    });
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
    renderTimerSetting();
    renderClock();
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
      requestedLock.addEventListener("release", () => {
        if (wakeLock !== requestedLock) return;
        wakeLock = null;
        pauseActiveTiming();
        if (timerExpired) setState("expired");
        else if (!shouldStayAwake) setState("idle");
        else {
          setState("suspended");
          if (document.visibilityState === "visible") {
            window.setTimeout(() => void requestWakeLock(), 0);
          }
        }
      }, { once: true });
      startActiveTiming();
      setState("active");
    } catch {
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
    renderClock();
    await requestWakeLock(true);
  }

  async function stopWakeLock() {
    shouldStayAwake = false;
    timerExpired = false;
    await releaseWakeLock();
    setState("idle");
    renderClock();
  }

  async function expireTimer() {
    if (timerExpired) return;
    timerExpired = true;
    shouldStayAwake = false;
    await releaseWakeLock();
    setState("expired");
    renderClock();
  }

  function renderClock() {
    elements.elapsed.textContent = formatTime(getActiveElapsed());
    const remaining = getTimerRemaining();
    elements.remainingGroup.hidden = remaining === null;
    if (remaining === null) return;

    elements.remaining.textContent = formatTime(remaining, true);
    if (remaining <= 0 && !timerExpired) void expireTimer();
  }

  elements.action.addEventListener("click", () => {
    const shouldStop = shouldStayAwake && (state === "active" || state === "requesting");
    if (shouldStop) void stopWakeLock();
    else if (shouldStayAwake) void requestWakeLock(true);
    else void startNewSession();
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
    const hours = Number(elements.customHours.value);
    const minutes = Number(elements.customMinutes.value);
    const invalid =
      !Number.isInteger(hours) ||
      !Number.isInteger(minutes) ||
      hours < 0 ||
      hours > 999 ||
      minutes < 0 ||
      minutes > 59 ||
      hours + minutes === 0;

    if (invalid) {
      elements.customMinutes.setCustomValidity(COPY[language].invalidDuration);
      elements.customMinutes.reportValidity();
      return;
    }

    elements.customHours.setCustomValidity("");
    elements.customMinutes.setCustomValidity("");
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

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && shouldStayAwake && !timerExpired) {
      void requestWakeLock();
    } else if (document.visibilityState !== "visible" && shouldStayAwake) {
      pauseActiveTiming();
      setState("suspended");
    }
  });

  translatePage();
  renderClock();
  window.setInterval(renderClock, 1000);
  void requestWakeLock();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }
})();
