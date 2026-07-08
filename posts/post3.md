# Study Planner Pro

> **Engineering a Smarter, Faster Way to Learn**

When I set out to build Study Planner Pro, it started as an ordinary task app with a simple to-do list and a Pomodoro timer. But my vision quickly evolved: I wanted to create the ultimate digital workspace for students. I realized that a true study platform needed to combine that foundational task management with an intelligent AI Tutor—all wrapped around a library that holds your actual textbooks and notes.

But building a tool that does _everything_ without feeling sluggish is a massive challenge. Modern web browsers are powerful, but they have strict speed limits and storage caps. As a Frontend Engineer, I had to tackle some major architectural hurdles to turn this idea into a lightning-fast, production-ready application.

Here is a look under the hood at how I made Study Planner Pro faster, smarter, and ready for massive study sessions.

---

## Engineering Hurdles & Solutions

### 1. Solving the "Heavy Textbook" Problem

One of my core features is the **Study Library**, a place where users can upload their own PDFs and documents (up to 50MB) and have an AI Tutor help explain the material.

However, web browsers have a hidden trap: their standard "quick memory" (`localStorage`, where apps normally save user settings and small tasks) has a strict limit of about 5 Megabytes. If a user uploaded just one textbook, the entire app would instantly crash, losing their tasks, timers, and progress. Furthermore, trying to save massive files the traditional way forces the app to freeze up while it "thinks."

**My Fix: The "Separation of Weight" Architecture**
To fix this, I completely re-engineered how the app stores data. I split my storage into two distinct systems:

- **The Sticky Note (Lightweight Data):** When you upload a file, the app's quick memory only writes down the _details_—the file name, the date, and the size. This keeps the app incredibly light, allowing it to boot up instantly the second you open it.
- **The Vault (Heavy Data):** The actual 50MB document is sent to a heavy-duty, background storage vault built into the browser (`IndexedDB`).

**The Result:** The app never crashes, the screen never freezes while uploading, and users can store massive textbooks safely on their devices. It feels like magic on the surface, but it’s powered by solid data engineering behind the scenes.

### 2. An AI Tutor That Knows Its Place (Literally)

Having an AI assistant is great, but not if it constantly gets in the way of what you are trying to read.

I noticed that standard AI chat windows often feel claustrophobic on a computer monitor, but take up way too much space on a mobile phone. I wanted reading a document and talking to the AI to feel perfectly natural, no matter what device you use.

**My Fix: Adaptive Screen Real Estate**
I wrote custom layout rules that adapt to the user's specific screen:

- **On Desktop:** The AI drawer expands to a "typographic sweet spot"—wide enough to read long explanations comfortably, but safely capped so it never accidentally covers up the main document.
- **On Mobile:** The AI acts more like a sliding panel. It takes up exactly 85% of the screen, leaving a small sliver of the document visible in the background so you never lose your sense of place.

### 3. Making It Feel Like a "Real" Native App

Study Planner Pro isn't just a website; it’s a **Progressive Web App (PWA)**. This means users can install it directly to their phone's home screen or their Mac/Windows dock, just like an app they downloaded from an app store.

To complete this native illusion, I couldn't settle for blurry icons or jarring loading screens.

- **Crisp, Scalable Graphics:** I stripped out old, blurry image files and replaced them with pure mathematical graphics (SVGs). Whether viewed on a tiny phone or a 4K retina monitor, the app's icons and layout are flawlessly sharp.
- **Bulletproof Fallbacks:** Because Apple (iOS) and Android handle home-screen icons differently, I engineered a fallback system. Android gets the infinitely scalable graphics, while iPhones are safely handed the exact pixel-perfect image they natively require.

---

## What's Next?

Right now, Study Planner Pro is incredibly fast and exceptionally stable. But I am not stopping here.

As users start uploading 300-page textbooks, my next big technical upgrade is **Virtualization**. Instead of making the browser render all 300 pages at once (which drains battery and slows down scrolling), I am engineering a way for the app to _only_ render the 3 pages you are currently looking at, swapping them out instantly as you scroll.

This will ensure a buttery-smooth 60fps experience, regardless of the document size.

---

_Sodiq Oladele_
