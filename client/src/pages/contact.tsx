import React from "react";

export default function Contact() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
      <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
      <p className="text-lg text-muted-foreground leading-relaxed">For editorial inquiries, advertising or technical support, email us at <a href="mailto:contact@testcraft.in" className="text-primary">contact@testcraft.in</a>.</p>
      <form className="mt-8 grid grid-cols-1 gap-4 max-w-xl">
        <input placeholder="Your name" className="input" />
        <input placeholder="Your email" className="input" />
        <textarea placeholder="Message" className="textarea" rows={6} />
        <button className="btn btn-primary mt-2">Send</button>
      </form>
    </div>
  );
}
