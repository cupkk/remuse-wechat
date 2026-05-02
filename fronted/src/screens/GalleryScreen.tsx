import { cityWorks } from "../data/mockData";
import type { Work } from "../app/types";
import { Icons } from "../components/Icons";
import { VanillaSphereGallery } from "../components/VanillaSphereGallery";

interface GalleryScreenProps {
  onSelectWork: (work: Work) => void;
}

export function GalleryScreen({ onSelectWork }: GalleryScreenProps) {
  return (
    <div className="gallery-view-3d view-animate">
      <div className="gallery-overlay-top">
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div className="city-subtitle">Memories Construction Corp</div>
          <h1 className="city-title">
            CITY ATLAS{" "}
            <span style={{ color: "var(--accent-main)", textShadow: "0 0 12px rgba(57, 255, 20, 0.4)" }}>/</span>
            <br />
            <span style={{ color: "var(--accent-main)", textShadow: "0 0 12px rgba(57, 255, 20, 0.4)" }}>ARCHIVE</span>
          </h1>
        </div>
        <div className="city-top-actions">
          <button className="city-icon-btn">
            <Icons.Compass />
          </button>
          <button className="city-icon-btn">
            <Icons.Search />
          </button>
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <VanillaSphereGallery works={cityWorks} onWorkClick={onSelectWork} />
      </div>
    </div>
  );
}
