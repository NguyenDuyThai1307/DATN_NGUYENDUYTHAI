"use client";

import Image from "next/image";
import { useState } from "react";

type ProductGalleryProps = {
  productName: string;
  images: {
    id: string;
    url: string;
    alt: string | null;
  }[];
};

export function ProductGallery({
  productName,
  images,
}: ProductGalleryProps) {
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [failedUrls, setFailedUrls] = useState<string[]>([]);

  const availableImages = images.filter(
    (image) => !failedUrls.includes(image.url),
  );

  const selectedImage =
    availableImages.find((image) => image.url === selectedUrl) ??
    availableImages[0];

  function markImageAsFailed(url: string) {
    setFailedUrls((currentUrls) =>
      currentUrls.includes(url) ? currentUrls : [...currentUrls, url],
    );
  }

  if (!selectedImage) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 px-8 text-center text-sm font-medium text-zinc-500">
        Chưa có ảnh cho {productName}
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
        <Image
          src={selectedImage.url}
          alt={selectedImage.alt ?? productName}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-contain p-3"
          onError={() => markImageAsFailed(selectedImage.url)}
        />
      </div>

      {availableImages.length > 1 ? (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {availableImages.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedUrl(image.url)}
              className={`relative aspect-square overflow-hidden rounded-2xl border ${
                image.url === selectedImage.url
                  ? "border-zinc-950 ring-1 ring-zinc-950"
                  : "border-zinc-200"
              }`}
              aria-label={`Xem ảnh ${index + 1} của ${productName}`}
            >
              <Image
                src={image.url}
                alt={image.alt ?? `${productName} ${index + 1}`}
                fill
                sizes="96px"
                className="object-contain p-3"
                onError={() => markImageAsFailed(image.url)}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}