"use client";

import AutoScroll from "embla-carousel-auto-scroll";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

interface BankLogo {
  id: string;
  name: string;
  image: string;
}

const BANK_LOGOS: BankLogo[] = [
  { id: "sparkasse",   name: "Sparkasse",                image: "/logos/10.png" },
  { id: "volksbank",   name: "Volksbanken Raiffeisenbanken", image: "/logos/9.png" },
  { id: "commerzbank", name: "Commerzbank",              image: "/logos/6.png" },
  { id: "ing",         name: "ING",                      image: "/logos/8.png" },
  { id: "postbank",    name: "Postbank",                 image: "/logos/5.png" },
  { id: "lbs",         name: "LBS",                      image: "/logos/4.png" },
  { id: "bhw",         name: "BHW",                      image: "/logos/3.png" },
  { id: "dsl",         name: "DSL Bank",                 image: "/logos/2.png" },
  { id: "hanseatic",   name: "Hanseatic Bank",           image: "/logos/1.png" },
  { id: "psd",         name: "PSD Bank",                 image: "/logos/7.png" },
  { id: "consors",     name: "Consors Finanz",           image: "/logos/11.png" },
];

interface PartnerLogosProps {
  heading?: string;
}

export function PartnerLogos({ heading = "Unsere Partnerbanken" }: PartnerLogosProps) {
  return (
    <section
      style={{
        background: "#fff",
        borderTop: "1px solid #E8E2D9",
        borderBottom: "1px solid #E8E2D9",
        padding: "20px 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Label */}
      <div
        style={{
          textAlign: "center",
          fontSize: "10px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          color: "#6b6b6b",
          marginBottom: "16px",
        }}
      >
        {heading}
      </div>

      {/* Fade edges */}
      <div
        style={{
          position: "relative",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* Left fade */}
        <div
          style={{
            position: "absolute",
            left: 0, top: 0, bottom: 0,
            width: "120px",
            background: "linear-gradient(to right, #ffffff, transparent)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
        {/* Right fade */}
        <div
          style={{
            position: "absolute",
            right: 0, top: 0, bottom: 0,
            width: "120px",
            background: "linear-gradient(to left, #ffffff, transparent)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

        <Carousel
          opts={{ loop: true }}
          plugins={[AutoScroll({ playOnInit: true, speed: 1.2, stopOnInteraction: false })]}
        >
          <CarouselContent className="ml-0">
            {BANK_LOGOS.map((bank) => (
              <CarouselItem
                key={bank.id}
                className="pl-0"
                style={{ flexBasis: "auto", width: "160px" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "52px",
                    padding: "0 28px",
                    borderRight: "1px solid #E8E2D9",
                  }}
                >
                  <img
                    src={bank.image}
                    alt={bank.name}
                    style={{
                      height: "32px",
                      width: "auto",
                      objectFit: "contain",
                      filter: "grayscale(20%)",
                      opacity: 0.85,
                      transition: "opacity 200ms, filter 200ms",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLImageElement).style.opacity = "1";
                      (e.currentTarget as HTMLImageElement).style.filter = "grayscale(0%)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLImageElement).style.opacity = "0.85";
                      (e.currentTarget as HTMLImageElement).style.filter = "grayscale(20%)";
                    }}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
