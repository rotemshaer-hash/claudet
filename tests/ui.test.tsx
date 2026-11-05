// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import Claudet, { contextFor } from "../components/Claudet";
import { Markdown } from "../components/Markdown";
import { isStringArray, readStored, writeStored } from "../lib/storage";
const success = (reply = "תשובה אמיתית") => Response.json({ ok: true, reply });
beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => success()),
  );
  Element.prototype.scrollIntoView = vi.fn();
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn(() => ({ matches: true })),
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
async function ask(text = "שלום") {
  const user = userEvent.setup();
  render(<Claudet />);
  await user.type(screen.getByLabelText("השאלה שלך ל־Claudet"), text);
  await user.click(screen.getByRole("button", { name: "שליחת שאלה" }));
  return user;
}
describe("conversation", () => {
  it("sends a real request, shows reply and passes full follow-up context", async () => {
    const user = await ask();
    await screen.findByText("תשובה אמיתית");
    await user.type(screen.getByLabelText("הודעה ל־Claudet"), "המשיכי");
    await user.click(screen.getByRole("button", { name: "שליחת הודעה" }));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    const body = JSON.parse(
      (vi.mocked(fetch).mock.calls[1][1] as RequestInit).body as string,
    );
    expect(body.messages.map((m: { text: string }) => m.text)).toEqual([
      "שלום",
      "תשובה אמיתית",
      "המשיכי",
    ]);
  });
  it("shows HTTP errors and retry does not duplicate the user turn", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        Response.json(
          {
            ok: false,
            error: { message: "המכסה נגמרה" },
            requestId: "test-id",
          },
          { status: 429 },
        ),
      )
      .mockResolvedValueOnce(success());
    const user = await ask();
    await screen.findByRole("alert");
    expect(screen.getByText("המכסה נגמרה")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "ניסיון נוסף" }));
    await screen.findByText("תשובה אמיתית");
    expect(screen.getAllByText("שלום")).toHaveLength(2);
    const body = JSON.parse(
      (vi.mocked(fetch).mock.calls[1][1] as RequestInit).body as string,
    );
    expect(body.messages).toHaveLength(1);
  });
  it("shows first network error in the open chat", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(Error("offline"));
    await ask();
    expect(await screen.findByRole("alert")).toHaveTextContent("תקשורת");
    expect(
      screen.getByRole("heading", { name: "השיחה שלך עם Claudet" }),
    ).toBeVisible();
  });
  it("stops and ignores a late response after closing the conversation", async () => {
    let resolve!: (value: Response) => void;
    vi.mocked(fetch).mockImplementationOnce(
      () => new Promise((r) => (resolve = r)),
    );
    const user = await ask();
    await user.click(
      screen.getByRole("button", { name: "סגירת שיחה ופתיחת שיחה חדשה" }),
    );
    resolve(success("late-message"));
    await waitFor(() =>
      expect(screen.getByLabelText("השאלה שלך ל־Claudet")).toBeVisible(),
    );
    expect(screen.queryByText("late-message")).not.toBeInTheDocument();
  });
  it("prevents duplicate submits while loading and stop restores interaction", async () => {
    vi.mocked(fetch).mockImplementationOnce(() => new Promise(() => {}));
    const user = await ask();
    expect(screen.getByRole("button", { name: "עצירת תשובה" })).toBeEnabled();
    expect(screen.getByLabelText("הודעה ל־Claudet")).toBeDisabled();
    expect(fetch).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "עצירת תשובה" }));
    expect(screen.getByLabelText("הודעה ל־Claudet")).toBeEnabled();
  });
  it("selects a real skill without spending a request until the user sends", async () => {
    const user = userEvent.setup();
    render(<Claudet />);
    await user.click(screen.getByRole("button", { name: "סטודיו מיתוג" }));
    expect(fetch).not.toHaveBeenCalled();
    await user.type(screen.getByLabelText("הודעה ל־Claudet"), "שם לעסק");
    await user.click(screen.getByRole("button", { name: "שליחת הודעה" }));
    await screen.findByText("תשובה אמיתית");
    expect(
      JSON.parse(
        (vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string,
      ).skill,
    ).toBe("branding");
  });
});
describe("local controls and privacy", () => {
  it("filters skills locally without AI calls", async () => {
    const user = userEvent.setup();
    render(<Claudet />);
    await user.type(screen.getByLabelText("חיפוש תחום"), "מיתוג");
    expect(
      screen.queryByRole("button", { name: "מוזיקה ופלייליסטים" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "סטודיו מיתוג" })).toBeVisible();
    expect(fetch).not.toHaveBeenCalled();
  });
  it("favorite button does not start a chat", async () => {
    const user = userEvent.setup();
    render(<Claudet />);
    await user.click(
      screen.getByRole("button", { name: "הוספת סטודיו מיתוג למועדפים" }),
    );
    expect(
      screen.getByRole("button", { name: "הסרת סטודיו מיתוג מהמועדפים" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.queryByRole("log")).not.toBeInTheDocument();
  });
  it("corrupt or wrong-shape local data cannot crash the page", () => {
    localStorage.setItem("claudet_favs", "{");
    localStorage.setItem("claudet_history", '{"not":"array"}');
    render(<Claudet />);
    expect(screen.getByRole("heading", { level: 1 })).toBeVisible();
    expect(readStored("claudet_favs", isStringArray, [])).toEqual([]);
  });
  it("continues when browser storage is unavailable", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw Error("blocked");
    });
    await ask();
    expect(await screen.findByText("תשובה אמיתית")).toBeVisible();
    expect(writeStored("x", true)).toBe(false);
  });
  it("disabling history deletes stored history and does not save new questions", async () => {
    localStorage.setItem("claudet_history", JSON.stringify(["old"]));
    const user = userEvent.setup();
    render(<Claudet />);
    await user.click(screen.getByRole("button", { name: "הגדרות ופרטיות" }));
    await user.click(screen.getByRole("checkbox"));
    expect(localStorage.getItem("claudet_history")).toBeNull();
    await user.type(screen.getByLabelText("השאלה שלך ל־Claudet"), "private");
    await user.click(screen.getByRole("button", { name: "שליחת שאלה" }));
    await screen.findByText("תשובה אמיתית");
    expect(localStorage.getItem("claudet_history")).toBeNull();
  });
  it("connection check uses health metadata endpoint and displays actual error", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      Response.json(
        { ok: false, error: { message: "מפתח לא תקין" } },
        { status: 503 },
      ),
    );
    const user = userEvent.setup();
    render(<Claudet />);
    await user.click(screen.getByRole("button", { name: "בדיקת חיבור" }));
    expect(await screen.findByText("מפתח לא תקין")).toBeVisible();
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe("/api/health");
  });
  it("does not claim clipboard success on denial", async () => {
    const user = await ask();
    await screen.findByText("תשובה אמיתית");
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(Error("denied")) },
    });
    await user.click(screen.getByRole("button", { name: "העתקת שיחה" }));
    expect(await screen.findByText(/לא ניתן להעתיק אוטומטית/)).toBeVisible();
  });
});
it("limits context using complete pairs and retains newest message", () => {
  const previous = Array.from({ length: 10 }, (_, i) => ({
    role: (i % 2 ? "model" : "user") as "model" | "user",
    text: "x".repeat(3000),
  }));
  const result = contextFor(previous, "new");
  expect(result[0].role).toBe("user");
  expect(result.at(-1)?.text).toBe("new");
  expect(result.reduce((n, m) => n + m.text.length, 0)).toBeLessThanOrEqual(
    16000,
  );
});
it("renders markdown as text without executing HTML", () => {
  render(
    <Markdown
      text={
        "**חשוב**\n\n<script>alert(1)</script>\n\n[bad](javascript:alert(1))"
      }
    />,
  );
  expect(screen.getByText("חשוב").tagName).toBe("STRONG");
  expect(document.querySelector("script")).toBeNull();
  expect(screen.getByText("bad")).not.toHaveAttribute(
    "href",
    "javascript:alert(1)",
  );
});
