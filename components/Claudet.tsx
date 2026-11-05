"use client";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Check,
  Copy,
  Heart,
  LoaderCircle,
  Mic,
  Moon,
  Search,
  Settings2,
  ShieldCheck,
  Square,
  Sun,
  Trash2,
  X,
} from "lucide-react";
import {
  filterSkills,
  getSkill,
  skillGroups,
  skills,
  type SkillGroup,
} from "../lib/skills";
import { ChatTurn, MAX_INPUT, MAX_CONTEXT } from "../lib/contracts";
import {
  isBoolean,
  isStringArray,
  readStored,
  removeStored,
  writeStored,
} from "../lib/storage";
import { Markdown } from "./Markdown";

type Message = ChatTurn & { id: string };
type Failure = { text: string; message: string; requestId?: string };
type Recognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult:
    | ((event: {
        results: { [key: number]: { [key: number]: { transcript: string } } };
      }) => void)
    | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type SpeechWindow = Window & {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
};
const id = () => crypto.randomUUID();
export function contextFor(messages: ChatTurn[], text: string): ChatTurn[] {
  let prior = messages.slice(-10);
  if (prior[0]?.role === "model") prior = prior.slice(1);
  while (
    prior.length &&
    prior.reduce((n, m) => n + m.text.length, 0) + text.length > MAX_CONTEXT
  )
    prior = prior.slice(2);
  return [...prior, { role: "user", text }];
}
export default function Claudet() {
  const [dark, setDark] = useState(false),
    [favorites, setFavorites] = useState<string[]>([]),
    [history, setHistory] = useState<string[]>([]),
    [saveHistory, setSaveHistory] = useState(true);
  const [skillGroup, setSkillGroup] = useState<SkillGroup>();
  const [showGuide, setShowGuide] = useState(false);
  const [query, setQuery] = useState(""),
    [skillSearch, setSkillSearch] = useState(""),
    [activeSkill, setActiveSkill] = useState<string | undefined>(),
    [showFavorites, setShowFavorites] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]),
    [chatOpen, setChatOpen] = useState(false),
    [loading, setLoading] = useState(false),
    [failure, setFailure] = useState<Failure | null>(null);
  const [notice, setNotice] = useState(""),
    [health, setHealth] = useState(""),
    [checking, setChecking] = useState(false),
    [settings, setSettings] = useState(false),
    [copied, setCopied] = useState(false),
    [listening, setListening] = useState(false);
  const controller = useRef<AbortController | null>(null),
    sequence = useRef(0),
    busy = useRef(false),
    recognition = useRef<Recognition | null>(null),
    input = useRef<HTMLTextAreaElement>(null),
    bottom = useRef<HTMLDivElement>(null);
  const healthController = useRef<AbortController | null>(null),
    copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const persist = (key: string, value: unknown) => {
    if (!writeStored(key, value))
      setNotice("האחסון בדפדפן אינו זמין. אפשר להמשיך להשתמש בלי שמירה.");
  };
  useEffect(() => {
    setShowGuide(!readStored("claudet_guide_seen", isBoolean, false));
    setDark(readStored("claudet_dark_mode", isBoolean, false));
    setFavorites(
      readStored("claudet_favs", isStringArray, []).filter(
        (k) => !!getSkill(k),
      ),
    );
    const saved = readStored("claudet_save_history", isBoolean, true);
    setSaveHistory(saved);
    if (saved)
      setHistory(readStored("claudet_history", isStringArray, []).slice(0, 5));
    return () => {
      sequence.current++;
      controller.current?.abort();
      healthController.current?.abort();
      recognition.current?.abort();
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);
  useEffect(() => {
    bottom.current?.scrollIntoView?.({
      behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "nearest",
    });
  }, [messages, loading, failure]);
  useEffect(() => {
    if (chatOpen) input.current?.focus();
  }, [chatOpen, activeSkill]);
  const cancel = () => {
    sequence.current++;
    controller.current?.abort();
    controller.current = null;
    busy.current = false;
    setLoading(false);
  };
  const newChat = () => {
    cancel();
    recognition.current?.abort();
    setListening(false);
    setMessages([]);
    setFailure(null);
    setChatOpen(false);
    setActiveSkill(undefined);
    setQuery("");
    input.current?.focus();
  };
  const chooseSkill = (key: string) => {
    cancel();
    recognition.current?.abort();
    setListening(false);
    setMessages([]);
    setFailure(null);
    setQuery("");
    setActiveSkill(key);
    setChatOpen(true);
  };
  const favorite = (key: string) => {
    const next = favorites.includes(key)
      ? favorites.filter((k) => k !== key)
      : [...favorites, key];
    setFavorites(next);
    persist("claudet_favs", next);
  };
  async function send(text = query, prior?: Message[]) {
    const trimmed = text.trim();
    if (!trimmed || busy.current) return;
    if (trimmed.length > MAX_INPUT) {
      setNotice(`אפשר לשלוח עד ${MAX_INPUT} תווים בכל הודעה.`);
      return;
    }
    const previous = prior ?? (failure ? messages.slice(0, -1) : messages);
    const run = ++sequence.current;
    const aborter = new AbortController();
    controller.current = aborter;
    busy.current = true;
    setChatOpen(true);
    setLoading(true);
    setFailure(null);
    setQuery("");
    setMessages([...previous, { role: "user", text: trimmed, id: id() }]);
    if (saveHistory) {
      setHistory((old) => {
        const next = [trimmed, ...old.filter((t) => t !== trimmed)].slice(0, 5);
        if (!writeStored("claudet_history", next))
          setNotice("לא ניתן לשמור היסטוריה בדפדפן. השיחה עדיין זמינה.");
        return next;
      });
    }
    const timeout = setTimeout(() => aborter.abort("timeout"), 30000);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: contextFor(previous, trimmed),
          skill: activeSkill,
        }),
        signal: aborter.signal,
      });
      const data = await response.json().catch(() => null);
      if (run !== sequence.current) return;
      if (
        !response.ok ||
        !data?.ok ||
        typeof data.reply !== "string" ||
        !data.reply.trim()
      ) {
        setFailure({
          text: trimmed,
          message: data?.error?.message || "לא ניתן לקבל תשובה כעת. נסי שוב.",
          requestId: data?.requestId,
        });
        return;
      }
      setMessages((prev) => [
        ...prev,
        { role: "model", text: data.reply, id: id() },
      ]);
      if (data.truncated)
        setNotice("התשובה הגיעה למגבלת האורך. אפשר לבקש להמשיך.");
    } catch {
      if (run !== sequence.current) return;
      setFailure({
        text: trimmed,
        message: aborter.signal.aborted
          ? "הבקשה ארכה זמן רב מדי. אפשר לנסות שוב."
          : "אין כרגע תקשורת עם השרת. בדקי את החיבור ונסי שוב.",
      });
    } finally {
      clearTimeout(timeout);
      if (run === sequence.current) {
        busy.current = false;
        setLoading(false);
        controller.current = null;
        input.current?.focus();
      }
    }
  }
  const stop = () => {
    cancel();
    setMessages((prev) =>
      prev.at(-1)?.role === "user" ? prev.slice(0, -1) : prev,
    );
    setNotice("הבקשה נעצרה.");
  };
  async function checkHealth() {
    if (checking) return;
    setChecking(true);
    setHealth("בודקת את החיבור ל־Google…");
    const c = new AbortController();
    healthController.current = c;
    try {
      const r = await fetch("/api/health", {
        signal: AbortSignal.any([c.signal, AbortSignal.timeout(30000)]),
      });
      const data = await r.json();
      if (!c.signal.aborted)
        setHealth(
          r.ok && data.ok
            ? data.message
            : data.error?.message || "בדיקת החיבור נכשלה.",
        );
    } catch {
      if (!c.signal.aborted) setHealth("לא ניתן להשלים את בדיקת החיבור כעת.");
    } finally {
      if (!c.signal.aborted) setChecking(false);
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        messages
          .map((m) => (m.role === "user" ? "את" : "Claudet") + ": " + m.text)
          .join("\n\n"),
      );
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setNotice("לא ניתן להעתיק אוטומטית. אפשר לבחור ולהעתיק את הטקסט.");
    }
  }
  function voice() {
    if (listening) {
      recognition.current?.stop();
      setListening(false);
      return;
    }
    const w = window as SpeechWindow;
    const API = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!API) {
      setNotice("הדפדפן הזה אינו תומך בזיהוי קולי. אפשר להקליד במקום.");
      return;
    }
    const r = new API();
    recognition.current?.abort();
    recognition.current = r;
    r.lang = "he-IL";
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (e) => {
      setQuery(e.results[0][0].transcript.slice(0, MAX_INPUT));
      setListening(false);
      input.current?.focus();
    };
    r.onerror = (e) => {
      setListening(false);
      setNotice(
        e.error === "not-allowed"
          ? "לא ניתנה הרשאה למיקרופון. אפשר להקליד."
          : "לא הצלחנו לזהות קול. אפשר לנסות שוב.",
      );
    };
    r.onend = () => setListening(false);
    try {
      r.start();
      setListening(true);
    } catch {
      setListening(false);
      setNotice("לא ניתן להפעיל את המיקרופון כרגע.");
    }
  }
  const skill = getSkill(activeSkill),
    shown = filterSkills(skillSearch).filter(
      (s) =>
        (!skillGroup || s.group === skillGroup) &&
        (!showFavorites || favorites.includes(s.key)),
    );
  const closeGuide = () => {
    setShowGuide(false);
    writeStored("claudet_guide_seen", true);
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    void send();
  };
  return (
    <div className={`app ${dark ? "dark" : ""}`}>
      <header className="header">
        <a className="brand" href="#main" aria-label="Claudet — למסך הראשי">
          <img
            className="brand-mark"
            src="/claudet-mark.webp"
            alt=""
            width={52}
            height={52}
          />
          <span>
            Claudet<small>מרחב לרעיונות שלך</small>
          </span>
        </a>
        <div className="header-actions">
          <button
            type="button"
            className="quiet-btn guide-toggle"
            aria-expanded={showGuide}
            aria-controls="skills-guide"
            onClick={() => (showGuide ? closeGuide() : setShowGuide(true))}
          >
            מדריך קצר
          </button>
          <button
            className="icon-btn"
            aria-label={dark ? "מעבר למצב בהיר" : "מעבר למצב כהה"}
            onClick={() => {
              setDark(!dark);
              persist("claudet_dark_mode", !dark);
            }}
          >
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <button
            className="icon-btn"
            aria-label="הגדרות ופרטיות"
            aria-expanded={settings}
            aria-controls="settings"
            onClick={() => setSettings(!settings)}
          >
            <Settings2 size={19} />
          </button>
          <button
            className="quiet-btn health-btn"
            onClick={() => void checkHealth()}
            disabled={checking}
          >
            <ShieldCheck size={17} />
            <span>{checking ? "בודקת…" : "בדיקת חיבור"}</span>
          </button>
        </div>
      </header>
      {settings && (
        <section
          id="settings"
          className="settings panel"
          aria-label="הגדרות ופרטיות"
        >
          <div className="section-head">
            <h2>ההעדפות שלך</h2>
            <button
              className="icon-btn"
              aria-label="סגירת הגדרות"
              onClick={() => setSettings(false)}
            >
              <X size={18} />
            </button>
          </div>
          <label className="check-label">
            <input
              type="checkbox"
              checked={saveHistory}
              onChange={(e) => {
                const checked = e.target.checked;
                setSaveHistory(checked);
                persist("claudet_save_history", checked);
                if (!checked) {
                  setHistory([]);
                  if (!removeStored("claudet_history"))
                    setNotice(
                      "העדפת השמירה עודכנה לשיחה זו, אך לא ניתן לגשת לאחסון.",
                    );
                }
              }}
            />
            שמירת חמש השאלות האחרונות בדפדפן הזה
          </label>
          <p>
            השאלות וההקשר בשיחה נשלחים ל־Google לצורך תשובה. השיחה המלאה אינה
            נשמרת כאן לאחר רענון. הימנעי משליחת פרטים רגישים שאינם נחוצים.
          </p>
          <p>
            הכתבה קולית משתמשת בזיהוי הדיבור של הדפדפן ועשויה לעבד קול אצל ספק
            הדפדפן. הטקסט ניתן לעריכה לפני שליחה.
          </p>
          <button
            className="quiet-btn"
            onClick={() => {
              setHistory([]);
              setNotice(
                removeStored("claudet_history")
                  ? "היסטוריית החיפושים נמחקה."
                  : "ההיסטוריה הוסתרה; לא ניתן למחוק מהאחסון כרגע.",
              );
            }}
          >
            <Trash2 size={16} />
            מחיקת היסטוריית חיפושים
          </button>
        </section>
      )}
      <div className="status-area" aria-live="polite" role="status">
        {(notice || health) && (
          <div className="status panel">
            <span>{health || notice}</span>
            <button
              className="icon-btn"
              aria-label="סגירת הודעה"
              onClick={() => {
                setHealth("");
                setNotice("");
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
      {showGuide && (
        <section
          id="skills-guide"
          className="panel skills-guide"
          aria-labelledby="skills-guide-title"
        >
          <div className="guide-heading">
            <h2 id="skills-guide-title">איך מתחילים עם סקילים?</h2>
            <button
              type="button"
              className="icon-btn"
              aria-label="סגירת המדריך"
              onClick={closeGuide}
            >
              <X size={18} />
            </button>
          </div>
          <p>
            סקיל הוא מצב שיחה שמכוון את Claudet למשימה מסוימת. אפשר גם לשאול
            שאלה חופשית.
          </p>
          <ol>
            <li>
              <strong>בחרי סקיל.</strong> למשל, סטודיו מיתוג כשאת רוצה לנסח מסר
              לעסק.
            </li>
            <li>
              <strong>כתבי מה תרצי לקבל.</strong> הוסיפי קהל, מגבלות או פורמט אם
              הם חשובים. אפשר להתחיל מהדוגמה שבתוך הסקיל ולערוך אותה.
            </li>
            <li>
              <strong>המשיכי באותה שיחה.</strong> בקשי לקצר, לשנות כיוון או
              להוסיף דוגמה. למטרה חדשה אפשר לפתוח שיחה חדשה.
            </li>
          </ol>
          <button type="button" className="quiet-btn" onClick={closeGuide}>
            הבנתי, בואי נתחיל
          </button>
        </section>
      )}
      <main id="main" className={`workspace ${chatOpen ? "with-chat" : ""}`}>
        <section className="explore" aria-label="תחומי יצירה">
          <div className="hero">
            <span className="eyebrow">רעיון קטן. התחלה חדשה.</span>
            <h1>
              מה תרצי
              <br />
              <em>ליצור היום?</em>
            </h1>
            <p>
              לכתוב, לתכנן ולחשוב יחד.
              <br />
              בחרי תחום או התחילי בשאלה משלך.
            </p>
          </div>
          {!chatOpen && (
            <form className="composer hero-composer" onSubmit={submit}>
              <label className="sr-only" htmlFor="question">
                השאלה שלך ל־Claudet
              </label>
              <textarea
                id="question"
                ref={input}
                value={query}
                maxLength={MAX_INPUT}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="יש לי רעיון…"
                rows={2}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    !e.nativeEvent.isComposing
                  ) {
                    e.preventDefault();
                    void send();
                  }
                }}
              />
              <div className="composer-bottom">
                <button
                  type="button"
                  className={`icon-btn ${listening ? "listening" : ""}`}
                  aria-label={listening ? "עצירת זיהוי קולי" : "הכתבת שאלה"}
                  aria-pressed={listening}
                  onClick={voice}
                >
                  <Mic size={19} />
                </button>
                <span className="input-hint">
                  Enter לשליחה · Shift+Enter לשורה חדשה
                </span>
                <button
                  type="submit"
                  className="send-btn"
                  aria-label="שליחת שאלה"
                  disabled={!query.trim() || loading}
                >
                  <ArrowUp size={21} />
                </button>
              </div>
            </form>
          )}
          <div className="skills-heading">
            <h2>הכלים לשיחה הבאה שלך</h2>
            <button
              className="filter-btn"
              aria-pressed={showFavorites}
              onClick={() => setShowFavorites(!showFavorites)}
            >
              <Heart size={15} />
              {showFavorites ? "כל התחומים" : "המועדפים שלי"}
            </button>
          </div>
          <div className="skill-search">
            <Search size={17} aria-hidden="true" />
            <label className="sr-only" htmlFor="skill-search">
              חיפוש תחום
            </label>
            <input
              id="skill-search"
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              placeholder="חפשי תחום, למשל מיתוג או קוד"
              type="search"
            />
          </div>
          <div
            className="skill-groups"
            role="group"
            aria-label="סינון לפי קטגוריה"
          >
            <button
              type="button"
              className="quiet-btn"
              aria-pressed={!skillGroup}
              onClick={() => setSkillGroup(undefined)}
            >
              הכול
            </button>
            {skillGroups.map((group) => (
              <button
                key={group}
                type="button"
                className="quiet-btn"
                aria-pressed={skillGroup === group}
                onClick={() => setSkillGroup(group)}
              >
                {group}
              </button>
            ))}
          </div>
          <div className="skills-grid">
            {shown.map((s) => (
              <div
                key={s.key}
                className={`skill-card ${activeSkill === s.key ? "selected" : ""}`}
              >
                <button
                  className="skill-main"
                  aria-label={s.label}
                  onClick={() => chooseSkill(s.key)}
                >
                  <span className="skill-icon" aria-hidden="true">
                    {s.icon}
                  </span>
                  <span>
                    <strong>{s.label}</strong>
                    <small>{s.hint}</small>
                  </span>
                </button>
                <button
                  className={`favorite ${favorites.includes(s.key) ? "is-favorite" : ""}`}
                  aria-label={`${favorites.includes(s.key) ? "הסרת" : "הוספת"} ${s.label} ${favorites.includes(s.key) ? "מהמועדפים" : "למועדפים"}`}
                  aria-pressed={favorites.includes(s.key)}
                  onClick={() => favorite(s.key)}
                >
                  <Heart size={16} />
                </button>
              </div>
            ))}
          </div>
          {!shown.length && (
            <p className="empty">
              {showFavorites
                ? "לא נמצאו מועדפים מתאימים. אפשר לסמן לב ליד תחום."
                : "לא נמצא תחום מתאים. נסי מילה אחרת או שאלי שאלה חופשית."}
            </p>
          )}
          {history.length > 0 && (
            <section className="history" aria-label="שאלות אחרונות">
              <h2>מחשבות אחרונות</h2>
              <div>
                {history.map((text) => (
                  <button
                    key={text}
                    title={text}
                    disabled={loading}
                    onClick={() => {
                      setQuery(text);
                      setNotice("השאלה הועתקה לשדה. אפשר לערוך ולשלוח.");
                      input.current?.focus();
                    }}
                  >
                    {text}
                  </button>
                ))}
              </div>
            </section>
          )}
        </section>
        {chatOpen && (
          <section className="chat panel" aria-labelledby="chat-title">
            <div className="chat-heading">
              <div>
                <span className="eyebrow">המקום לחשוב בקול</span>
                <h2 id="chat-title">
                  {skill
                    ? skill.icon + " " + skill.label
                    : "השיחה שלך עם Claudet"}
                </h2>
              </div>
              <div className="chat-actions">
                <button
                  className="icon-btn"
                  aria-label="העתקת שיחה"
                  disabled={!messages.length}
                  onClick={() => void copy()}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
                <button
                  className="icon-btn"
                  aria-label="סגירת שיחה ופתיחת שיחה חדשה"
                  onClick={newChat}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div
              className="messages"
              role="log"
              aria-label="הודעות השיחה"
              aria-live="polite"
              aria-busy={loading}
            >
              {!messages.length && (
                <div className="chat-welcome">
                  <img
                    className="welcome-mark"
                    src="/claudet-mark.webp"
                    alt=""
                    width={60}
                    height={60}
                  />
                  <h3>נתחיל מכאן.</h3>
                  <p>{skill ? skill.hint : "מה מעסיק אותך, ומה תרצי ליצור?"}</p>
                  {skill ? (
                    <div className="skill-example">
                      <p>
                        <strong>דוגמה לבקשה</strong>
                      </p>
                      <p>{skill.example}</p>
                      {"starters" in skill && (
                        <div
                          className="skill-groups"
                          role="group"
                          aria-label="בחירת משימה"
                        >
                          {skill.starters.map((starter) => (
                            <button
                              key={starter.label}
                              type="button"
                              className="quiet-btn"
                              onClick={() => {
                                setQuery(starter.text);
                                input.current?.focus();
                              }}
                            >
                              {starter.label}
                            </button>
                          ))}
                        </div>
                      )}
                      <button
                        type="button"
                        className="quiet-btn"
                        onClick={() => {
                          setQuery(skill.example);
                          input.current?.focus();
                        }}
                      >
                        השתמשי בדוגמה
                      </button>
                    </div>
                  ) : (
                    <p>ספרי לי מה המטרה שלך ואעזור בצעד הבא.</p>
                  )}
                </div>
              )}
              {messages.map((m) => (
                <article key={m.id} className={`message ${m.role}`}>
                  <strong className="message-label">
                    {m.role === "user" ? "את" : "Claudet"}
                  </strong>
                  <Markdown text={m.text} />
                </article>
              ))}
              {loading && (
                <div className="thinking">
                  <LoaderCircle size={17} className="spin" />
                  חושבת איתך…
                </div>
              )}
              {failure && (
                <div className="error" role="alert">
                  <p>{failure.message}</p>
                  {failure.requestId && (
                    <small>
                      מזהה פנייה: <bdi>{failure.requestId}</bdi>
                    </small>
                  )}
                  <button
                    className="quiet-btn"
                    onClick={() =>
                      void send(failure.text, messages.slice(0, -1))
                    }
                  >
                    ניסיון נוסף
                  </button>
                  <button
                    type="button"
                    className="quiet-btn edit-request"
                    onClick={() => {
                      setQuery(failure.text);
                      input.current?.focus();
                    }}
                  >
                    עריכת הבקשה
                  </button>
                </div>
              )}
              <div ref={bottom} />
            </div>
            <form className="composer chat-composer" onSubmit={submit}>
              <label className="sr-only" htmlFor="follow-up">
                הודעה ל־Claudet
              </label>
              <textarea
                id="follow-up"
                ref={input}
                value={query}
                maxLength={MAX_INPUT}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  messages.length ? "מה תרצי להוסיף?" : "במה תרצי שנתחיל?"
                }
                rows={2}
                disabled={loading}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    !e.nativeEvent.isComposing
                  ) {
                    e.preventDefault();
                    void send();
                  }
                }}
              />
              <div className="composer-bottom">
                <button
                  type="button"
                  className={`icon-btn ${listening ? "listening" : ""}`}
                  aria-label={listening ? "עצירת זיהוי קולי" : "הכתבת שאלה"}
                  disabled={loading}
                  onClick={voice}
                >
                  <Mic size={18} />
                </button>
                <small className="input-hint">
                  {query.length}/{MAX_INPUT}
                </small>
                {loading ? (
                  <button
                    type="button"
                    className="send-btn"
                    aria-label="עצירת תשובה"
                    onClick={stop}
                  >
                    <Square size={17} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="send-btn"
                    aria-label="שליחת הודעה"
                    disabled={!query.trim()}
                  >
                    <ArrowUp size={20} />
                  </button>
                )}
              </div>
            </form>
            <p className="chat-disclaimer">
              AI עלול לטעות. מידע עדכני יש לאמת; חיפוש חי ברשת אינו מופעל.
            </p>
          </section>
        )}
      </main>
      <footer>
        CLAUDET © 2026 <span>מרחב לרעיונות, עם מקום בשבילך.</span>
      </footer>
    </div>
  );
}
