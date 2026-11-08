"use client";

import { ArrowRight, Bookmark, Shirt, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { readStored, writeStored } from "../lib/storage";

const storageKey = "claudet_style_projects_v1";
const categories = [
  ["tops", "חולצה או שכבה עליונה"],
  ["shoes", "נעליים"],
] as const;
type Category = (typeof categories)[number][0];
type Project = {
  id: string;
  occasion: string;
  anchor: string;
  tops: string[];
  shoes: string[];
  looks: { top: string; shoe: string }[];
};
const fresh = (occasion = ""): Project => ({
  id: "",
  occasion,
  anchor: "",
  tops: [],
  shoes: [],
  looks: [],
});
const demo: Project = {
  ...fresh("אירוע ערב בלי עקבים"),
  anchor: "מכנסיים שחורים",
  tops: ["חולצת פשתן בהירה", "חולצת סאטן"],
  shoes: ["סניקרס לבנות", "נעלי בובה שחורות"],
  looks: [
    { top: "חולצת פשתן בהירה", shoe: "סניקרס לבנות" },
    { top: "חולצת סאטן", shoe: "נעלי בובה שחורות" },
  ],
};
function projectsAreValid(value: unknown): value is Project[] {
  return (
    Array.isArray(value) &&
    value.length <= 20 &&
    value.every((entry) => {
      if (!entry || typeof entry !== "object") return false;
      const p = entry as Partial<Project>;
      return (
        typeof p.id === "string" &&
        typeof p.occasion === "string" &&
        typeof p.anchor === "string" &&
        [p.tops, p.shoes].every(
          (items) =>
            Array.isArray(items) &&
            items.length <= 12 &&
            items.every((item) => typeof item === "string"),
        ) &&
        Array.isArray(p.looks) &&
        p.looks.length <= 2 &&
        p.looks.every(
          (look) =>
            look && p.tops?.includes(look.top) && p.shoes?.includes(look.shoe),
        )
      );
    })
  );
}

export function StyleWorkspace({
  initial,
  onBack,
}: {
  initial: string;
  onBack: () => void;
}) {
  const [project, setProject] = useState(() => fresh(initial));
  const [saved, setSaved] = useState<Project[]>([]);
  const [category, setCategory] = useState<Category>("tops");
  const [item, setItem] = useState("");
  const [status, setStatus] = useState("");
  const [isDemo, setIsDemo] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    setSaved(readStored(storageKey, projectsAreValid, []));
    title.current?.focus();
  }, []);

  function addItem(event: FormEvent) {
    event.preventDefault();
    const name = item.trim();
    if (!name || project[category].includes(name)) return;
    if (project[category].length >= 12) {
      setStatus("אפשר להוסיף עד 12 פריטים מכל סוג.");
      return;
    }
    setProject((p) => ({ ...p, [category]: [...p[category], name] }));
    setItem("");
    setStatus("הפריט נוסף לבחירה.");
  }
  function buildLooks() {
    if (
      !project.anchor.trim() ||
      !project.tops.length ||
      !project.shoes.length
    ) {
      setStatus(
        "כדי להרכיב הופעה, הוסיפי פריט עוגן, חולצה או שכבה עליונה, ונעליים.",
      );
      return;
    }
    const first = { top: project.tops[0], shoe: project.shoes[0] };
    const second = {
      top: project.tops[1] ?? first.top,
      shoe: project.shoes[1] ?? first.shoe,
    };
    const looks =
      first.top === second.top && first.shoe === second.shoe
        ? [first]
        : [first, second];
    setProject((p) => ({ ...p, looks }));
    setStatus(
      looks.length === 1
        ? "נבנתה הופעה אחת. אפשר להוסיף פריט כדי לקבל חלופה."
        : "שתי ההופעות מוכנות לעריכה.",
    );
  }
  function save(copy = false) {
    if (!project.looks.length || !project.anchor.trim()) return;
    const current = {
      ...project,
      id: !copy && project.id ? project.id : crypto.randomUUID(),
    };
    const existing = readStored(storageKey, projectsAreValid, []);
    if (existing.length >= 20 && !existing.some((p) => p.id === current.id)) {
      setStatus("נשמרו כבר 20 הופעות בדפדפן. אפשר לעדכן הופעה קיימת.");
      return;
    }
    const next = [current, ...existing.filter((p) => p.id !== current.id)];
    if (!writeStored(storageKey, next)) {
      setStatus("הדפדפן לא אפשר לשמור את ההופעה.");
      return;
    }
    setProject(current);
    setSaved(next);
    setStatus(copy ? "נשמר עותק נפרד." : "ההופעה נשמרה בדפדפן הזה.");
  }
  return (
    <section className="style-workspace" aria-labelledby="style-title">
      <button className="quiet-btn" onClick={onBack}>
        <ArrowRight size={16} /> חזרה לכלים
      </button>
      <header className="style-intro">
        <span className="style-emblem">
          <Shirt size={27} />
        </span>
        <div>
          <span className="eyebrow">מתוך הארון שלך</span>
          <h1 id="style-title" ref={title} tabIndex={-1}>
            מה תרצי ללבוש?
          </h1>
          <p>
            התחילי מפריט אחד. הרכיבי הופעה מהפריטים שלך, החליפי מה שצריך ושמרי
            לפעם הבאה.
          </p>
        </div>
      </header>
      <div className="style-layout">
        <section className="panel style-panel">
          <h2>1. הפריטים שלך</h2>
          <label>
            לאן מתלבשות?{" "}
            <input
              value={project.occasion}
              maxLength={180}
              placeholder="למשל, אירוע בחוץ בלי עקבים"
              onChange={(e) =>
                setProject({ ...project, occasion: e.target.value })
              }
            />
          </label>
          <label>
            פריט שממנו מתחילים{" "}
            <input
              value={project.anchor}
              maxLength={100}
              placeholder="למשל, מכנסיים שחורים"
              onChange={(e) =>
                setProject({ ...project, anchor: e.target.value })
              }
            />
          </label>
          <form className="style-add" onSubmit={addItem}>
            <label>
              סוג הפריט{" "}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
              >
                {categories.map(([value, name]) => (
                  <option key={value} value={value}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              שם הפריט{" "}
              <input
                maxLength={100}
                value={item}
                placeholder="למשל, חולצת פשתן"
                onChange={(e) => setItem(e.target.value)}
              />
            </label>
            <button className="quiet-btn" type="submit" disabled={!item.trim()}>
              הוסיפי
            </button>
          </form>
          {categories.map(
            ([key, label]) =>
              project[key].length > 0 && (
                <div key={key} className="style-items">
                  <strong>{label}</strong>
                  <div>
                    {project[key].map((name) => (
                      <span key={name}>{name}</span>
                    ))}
                  </div>
                </div>
              ),
          )}
          <div className="style-actions">
            <button
              className="style-primary"
              type="button"
              onClick={buildLooks}
            >
              הרכיבי הופעות
            </button>
            <button
              className="quiet-btn"
              type="button"
              onClick={() => {
                setProject(demo);
                setIsDemo(true);
                setStatus("נפתחו פריטי הדגמה.");
              }}
            >
              נסי דוגמה
            </button>
          </div>
        </section>
        <section className="panel style-panel">
          <h2>2. ההופעות שלך</h2>
          {isDemo && (
            <p className="style-caption">
              פריטי הדגמה. אפשר לערוך אותם ולהוסיף פריטים משלך.
            </p>
          )}
          {!project.looks.length && (
            <p className="style-empty">
              <Sparkles size={19} /> אחרי בחירת הפריטים, כאן תופיע הופעה שאפשר
              לערוך.
            </p>
          )}
          {project.looks.map((look, i) => (
            <article className="style-look" key={i}>
              <h3>הופעה {i + 1}</h3>
              <p>{project.anchor}</p>
              <label>
                פריט עליון{" "}
                <select
                  aria-label={`פריט עליון להופעה ${i + 1}`}
                  value={look.top}
                  onChange={(e) =>
                    setProject({
                      ...project,
                      looks: project.looks.map((l, j) =>
                        j === i ? { ...l, top: e.target.value } : l,
                      ),
                    })
                  }
                >
                  {project.tops.map((name) => (
                    <option key={name}>{name}</option>
                  ))}
                </select>
              </label>
              <label>
                נעליים{" "}
                <select
                  aria-label={`נעליים להופעה ${i + 1}`}
                  value={look.shoe}
                  onChange={(e) =>
                    setProject({
                      ...project,
                      looks: project.looks.map((l, j) =>
                        j === i ? { ...l, shoe: e.target.value } : l,
                      ),
                    })
                  }
                >
                  {project.shoes.map((name) => (
                    <option key={name}>{name}</option>
                  ))}
                </select>
              </label>
            </article>
          ))}
          <div className="style-actions">
            <button
              className="style-primary"
              disabled={!project.looks.length || !project.anchor.trim()}
              onClick={() => save()}
            >
              <Bookmark size={15} /> שמרי הופעות
            </button>
            {project.id && (
              <button
                className="quiet-btn"
                disabled={!project.anchor.trim()}
                onClick={() => save(true)}
              >
                שמרי עותק
              </button>
            )}
            <button
              className="quiet-btn"
              onClick={() => {
                setProject(fresh());
                setItem("");
                setIsDemo(false);
                setStatus("נפתחה תבנית חדשה.");
              }}
            >
              התחילי מחדש
            </button>
          </div>
        </section>
      </div>
      <section className="panel style-panel style-memory">
        <h2>הופעות שמורות</h2>
        <p className="style-caption">
          שמירה מקומית לפי בחירה. אפשר לחזור לאותה הופעה מהדפדפן הזה.
        </p>
        {saved.length === 0 ? (
          <p className="style-caption">כאן יופיעו ההופעות ששמרת.</p>
        ) : (
          <div className="style-actions">
            {saved.map((p) => (
              <button
                key={p.id}
                className="quiet-btn"
                onClick={() => {
                  setProject(p);
                  setIsDemo(false);
                  setStatus("ההופעה השמורה נפתחה.");
                }}
              >
                {p.occasion || p.anchor}
              </button>
            ))}
          </div>
        )}
      </section>
      <p className="style-status" role="status">
        {status}
      </p>
    </section>
  );
}
