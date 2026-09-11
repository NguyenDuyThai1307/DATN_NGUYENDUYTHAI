"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Expand, X } from "lucide-react";

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
  const dialog = useRef<HTMLDialogElement>(null);
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
        <button type="button" onClick={() => dialog.current?.showModal()} aria-label="Phóng to ảnh sản phẩm" className="absolute bottom-3 right-3 flex min-h-11 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm shadow-sm"><Expand size={18} />Phóng to</button>
      </div>

      <dialog ref={dialog} aria-label={`Ảnh ${productName}`} className="fixed inset-0 m-auto h-[85dvh] max-h-none w-[94vw] max-w-5xl rounded-2xl border-0 bg-white p-4 backdrop:bg-black/70" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
        <div className="relative h-full">
          <Image src={selectedImage.url} alt={selectedImage.alt ?? productName} fill sizes="94vw" className="object-contain p-6" />
          <button type="button" autoFocus onClick={() => dialog.current?.close()} aria-label="Đóng ảnh phóng to" className="absolute right-0 top-0 z-10 grid size-11 place-items-center rounded-full border bg-white"><X size={22} /></button>
        </div>
      </dialog>

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
              aria-pressed={image.url === selectedImage.url}
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
