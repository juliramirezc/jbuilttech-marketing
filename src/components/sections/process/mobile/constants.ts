/**
 * Mobile Process section showcase videos
 * Local assets in public/videos/
 */

export type ProcessShowcaseVideo = {
  id: number;
  title: string;
  badge: string;
  src: string;
  poster?: string;
};

export const PROCESS_SHOWCASE_VIDEOS: ProcessShowcaseVideo[] = [
  {
    id: 1,
    title: "Roof Replacement Campaign",
    badge: "Roofing",
    src: "/videos/roofing.mp4",
  },
  {
    id: 2,
    title: "Kitchen Remodeling Showcase",
    badge: "Remodeling",
    src: "/videos/kitchen-remodel.mp4",
  },
  {
    id: 3,
    title: "Siding Campaign",
    badge: "Siding",
    src: "/videos/siding.mp4",
  },
  {
    id: 4,
    title: "Painting Advertisement",
    badge: "Painting",
    src: "/videos/painting.mp4",
  },
];
