import { useState } from "react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2">
      <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">Support</p><h1 className="mt-2 text-3xl font-extrabold text-gray-800">Contact FreshMart</h1><p className="mt-4 leading-relaxed text-gray-600">Need help with an order or have a question? Our support team is here for you.</p><div className="mt-8 space-y-4 text-sm text-gray-700"><p><strong>Email:</strong> <a className="text-emerald-700 hover:underline" href="mailto:support@FreshMart.com">support@FreshMart.com</a></p><p><strong>Phone:</strong> <a className="text-emerald-700 hover:underline" href="tel:+8801789174401">+880 1789174401</a></p><p><strong>Address:</strong> FreshMart SUPER SHOP, Dhaka, Bangladesh</p></div></div>
      <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold text-gray-800">Send a message</h2>{submitted && <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">Thanks for contacting us. Our team will get back to you soon.</p>}<label className="mt-5 block text-sm font-semibold">Name<input required className="mt-1.5 w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-emerald-600" /></label><label className="mt-4 block text-sm font-semibold">Email<input required type="email" className="mt-1.5 w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-emerald-600" /></label><label className="mt-4 block text-sm font-semibold">Message<textarea required className="mt-1.5 min-h-28 w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-emerald-600" /></label><button className="mt-5 w-full rounded-xl bg-emerald-700 py-3 font-bold text-white hover:bg-emerald-800">Send message</button></form>
    </section>
  );
}
