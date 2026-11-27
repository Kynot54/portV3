import { act, fireEvent, render, screen } from "@testing-library/react";
import Link from "next/link";
import { CardMedia } from "@/components/work/card-media";
import type { WorkMedia } from "@/lib/content/types";
import { setFinePointer, setReducedMotion } from "../support/match-media";

const MEDIA: WorkMedia = {
  images: [
    { src: "/images/work/x/1.png", alt: "One" },
    { src: "/images/work/x/2.png", alt: "Two" },
  ],
  clip: { src: "/images/work/x/clip.mp4", description: "A clip" },
};

let play: ReturnType<typeof vi.fn>;
let pause: ReturnType<typeof vi.fn>;
beforeEach(() => {
  play = vi.fn(() => Promise.resolve());
  pause = vi.fn();
  Object.assign(HTMLMediaElement.prototype, { play, pause });
});

function renderCard(media: WorkMedia = MEDIA) {
  render(
    <Link href="/work/x">
      <CardMedia media={media} sizes="100vw" />
      <h3>Project X</h3>
    </Link>,
  );
  const card = screen.getByRole("link");
  const box = card.querySelector("[data-playing]") as HTMLElement;
  const video = card.querySelector("video");
  return { card, box, video };
}

test("hover plays the clip; leaving stops, rewinds and shows the still", async () => {
  const { card, box, video } = renderCard();
  await act(async () => fireEvent.pointerEnter(card));
  expect(play).toHaveBeenCalledTimes(1);
  expect(box).toHaveAttribute("data-playing", "true");
  video!.currentTime = 3;
  await act(async () => fireEvent.pointerLeave(card));
  expect(pause).toHaveBeenCalled();
  expect(video!.currentTime).toBe(0);
  expect(box).toHaveAttribute("data-playing", "false");
});

test("keyboard focus plays; moving focus away stops", async () => {
  const { card, box } = renderCard();
  await act(async () => card.focus());
  expect(play).toHaveBeenCalledTimes(1);
  expect(box).toHaveAttribute("data-playing", "true");
  await act(async () => card.blur());
  expect(box).toHaveAttribute("data-playing", "false");
});

test("touch-only devices never play (no hover)", async () => {
  setFinePointer(false);
  const { card, box } = renderCard();
  await act(async () => fireEvent.pointerEnter(card));
  await act(async () => card.focus());
  expect(play).not.toHaveBeenCalled();
  expect(box).toHaveAttribute("data-playing", "false");
});

test("a touch pointer on a hybrid device doesn't play", async () => {
  const { card } = renderCard();
  await act(async () => fireEvent.pointerEnter(card, { pointerType: "touch" }));
  expect(play).not.toHaveBeenCalled();
});

test("reduced motion never plays, including when switched on after load", async () => {
  const { card } = renderCard();
  act(() => setReducedMotion(true));
  await act(async () => fireEvent.pointerEnter(card));
  expect(play).not.toHaveBeenCalled();
});

test("switching reduced motion on mid-play stops the clip", async () => {
  const { card, box } = renderCard();
  await act(async () => fireEvent.pointerEnter(card));
  act(() => setReducedMotion(true));
  expect(pause).toHaveBeenCalled();
  expect(box).toHaveAttribute("data-playing", "false");
});

test("a clip the browser can't play keeps the still, with no unhandled error", async () => {
  play.mockImplementation(() =>
    Promise.reject(new DOMException("no codec", "NotSupportedError")),
  );
  const { card, box } = renderCard();
  await act(async () => fireEvent.pointerEnter(card));
  expect(box).toHaveAttribute("data-playing", "false");
});

test("leaving before play resolves ends paused, with the still showing", async () => {
  let resolve!: () => void;
  play.mockImplementation(
    () => new Promise<void>((r) => (resolve = () => r())),
  );
  const { card, box } = renderCard();
  await act(async () => fireEvent.pointerEnter(card));
  await act(async () => fireEvent.pointerLeave(card));
  pause.mockClear();
  await act(async () => resolve());
  expect(pause).toHaveBeenCalled();
  expect(box).toHaveAttribute("data-playing", "false");
});

test("no clip: a still only, nothing on hover", async () => {
  const { card, video } = renderCard({ ...MEDIA, clip: null });
  expect(video).toBeNull();
  await act(async () => fireEvent.pointerEnter(card));
  expect(play).not.toHaveBeenCalled();
});

test("the still is decorative and the clip is hidden, muted and loads on demand", () => {
  const { card, video } = renderCard();
  expect(card.querySelector("img")).toHaveAttribute("alt", "");
  expect(card).toHaveAccessibleName("Project X");
  expect(video).toHaveAttribute("aria-hidden", "true");
  expect(video).toHaveAttribute("preload", "none");
  expect(video).toHaveAttribute("playsinline");
  expect(video).toHaveAttribute("loop");
  expect(video!.muted).toBe(true);
});

test("a late failure from an earlier hover doesn't stop a quick re-hover", async () => {
  let rejectFirst!: (e: unknown) => void;
  play
    .mockImplementationOnce(
      () => new Promise<void>((_, rej) => (rejectFirst = rej)),
    )
    .mockImplementationOnce(() => Promise.resolve());
  const { card, box } = renderCard();
  await act(async () => fireEvent.pointerEnter(card));
  await act(async () => fireEvent.pointerLeave(card));
  await act(async () => fireEvent.pointerEnter(card));
  await act(async () =>
    rejectFirst(new DOMException("interrupted", "AbortError")),
  );
  expect(box).toHaveAttribute("data-playing", "true");
});

test("only one card plays: hovering a second card stops a focused one", async () => {
  render(
    <>
      <Link href="/work/a">
        <CardMedia media={MEDIA} sizes="100vw" />
        <h3>A</h3>
      </Link>
      <Link href="/work/b">
        <CardMedia media={MEDIA} sizes="100vw" />
        <h3>B</h3>
      </Link>
    </>,
  );
  const [a, b] = screen.getAllByRole("link");
  const boxOf = (el: HTMLElement) =>
    el.querySelector("[data-playing]") as HTMLElement;
  await act(async () => a.focus());
  await act(async () => fireEvent.pointerEnter(b));
  expect(boxOf(a)).toHaveAttribute("data-playing", "false");
  expect(boxOf(b)).toHaveAttribute("data-playing", "true");
});
