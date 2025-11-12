import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { CoverSlide } from "@/components/pitch/CoverSlide";
import { ProblemSlide } from "@/components/pitch/ProblemSlide";
import { SolutionSlide } from "@/components/pitch/SolutionSlide";
import { MarketSlide } from "@/components/pitch/MarketSlide";
import { ProductSlide } from "@/components/pitch/ProductSlide";
import { BusinessModelSlide } from "@/components/pitch/BusinessModelSlide";
import { TractionSlide } from "@/components/pitch/TractionSlide";
import { CompetitionSlide } from "@/components/pitch/CompetitionSlide";
import { TechnologySlide } from "@/components/pitch/TechnologySlide";
import { RoadmapSlide } from "@/components/pitch/RoadmapSlide";
import { FinancialsSlide } from "@/components/pitch/FinancialsSlide";
import { TeamSlide } from "@/components/pitch/TeamSlide";
import { InvestmentSlide } from "@/components/pitch/InvestmentSlide";
import { VisionSlide } from "@/components/pitch/VisionSlide";
import { ClosingSlide } from "@/components/pitch/ClosingSlide";

const PitchDeck = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    <CoverSlide key="cover" />,
    <ProblemSlide key="problem" />,
    <SolutionSlide key="solution" />,
    <MarketSlide key="market" />,
    <ProductSlide key="product" />,
    <BusinessModelSlide key="business" />,
    <TractionSlide key="traction" />,
    <CompetitionSlide key="competition" />,
    <TechnologySlide key="technology" />,
    <RoadmapSlide key="roadmap" />,
    <FinancialsSlide key="financials" />,
    <TeamSlide key="team" />,
    <InvestmentSlide key="investment" />,
    <VisionSlide key="vision" />,
    <ClosingSlide key="closing" />,
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") nextSlide();
    if (e.key === "ArrowLeft") prevSlide();
  };

  useState(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex flex-col">
      {/* Header */}
      <div className="absolute top-4 left-4 z-10">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <Home className="h-4 w-4 mr-2" />
            Accueil
          </Button>
        </Link>
      </div>

      {/* Main Slide Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-7xl aspect-video bg-background rounded-2xl shadow-2xl overflow-hidden border border-border/50">
          <div className="h-full animate-fade-in">
            {slides[currentSlide]}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="pb-8 px-8 flex items-center justify-between">
        <Button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          variant="outline"
          size="lg"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Précédent
        </Button>

        <div className="flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground font-medium">
            {currentSlide + 1} / {slides.length}
          </span>
          <Button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            size="lg"
          >
            Suivant
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PitchDeck;
