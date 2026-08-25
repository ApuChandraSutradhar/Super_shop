export default function AboutUs() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 text-gray-800 sm:px-6">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">About FreshMart</p>
      <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Fresh groceries, delivered with care.</h1>
      <p className="mt-5 max-w-3xl text-lg leading-relaxed text-gray-600">FreshMart SUPER SHOP brings fresh, organic groceries and everyday essentials directly to your door. We select quality products carefully, pack them responsibly, and make shopping for your home simple.</p>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <article className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6"><h2 className="text-lg font-bold text-emerald-900">Fresh & organic</h2><p className="mt-2 text-sm leading-relaxed text-gray-600">Discover produce and pantry essentials chosen for quality, freshness, and value.</p></article>
        <article className="rounded-2xl border border-blue-100 bg-blue-50 p-6"><h2 className="text-lg font-bold text-blue-900">Fast shipping</h2><p className="mt-2 text-sm leading-relaxed text-gray-600">Our delivery team works to get your order from our shelves to your doorstep quickly and safely.</p></article>
        <article className="rounded-2xl border border-amber-100 bg-amber-50 p-6"><h2 className="text-lg font-bold text-amber-900">Customer first</h2><p className="mt-2 text-sm leading-relaxed text-gray-600">Your satisfaction guides every order, from clear updates to responsive support when you need us.</p></article>
      </div>
    </section>
  );
}
