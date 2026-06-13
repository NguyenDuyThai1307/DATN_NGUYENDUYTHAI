export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-red-600">
          Figure Shop
        </p>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
          Cua hang mo hinh suu tam
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
          Website ban san pham co san, ho tro pre-order, gio hang,
          checkout va quan ly don hang.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/products"
            className="rounded-md bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Xem san pham
          </a>

          <a
            href="/preorder"
            className="rounded-md border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-100"
          >
            Pre-order
          </a>
        </div>
      </section>
    </main>
  );
}