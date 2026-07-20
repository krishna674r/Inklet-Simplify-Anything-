# inklet

Paste anything confusing. Get it back in plain English.

inklet takes dense, jargon-heavy text — contracts, terms of service, school policies, confusing emails — and explains what it actually means in simple, honest language. No signup, no jargon, no reading between the lines.

**[Try it live](#)** · Built by a 14-year-old learning to build AI products from scratch.

---

## Why I built this

Everyone clicks "I agree" without reading the terms. Not because they don't care, but because the text is deliberately hard to parse. I wanted a tool that does the one thing that actually matters: tell you what you just agreed to, in words a normal person uses.

This is also my first real project exploring AI-native product design — figuring out how to prompt a model to behave consistently, not just cleverly, and how to design an interface that gets out of the way of that.

## What it does

- Paste any confusing text, or upload a file (`.txt`, `.pdf`, `.docx`)
- Get back a structured, plain-English breakdown:
  - **Summary** — what the text is saying, in one or two sentences
    - **Key points** — the important parts, broken down clearly
      - **Watch out for** — anything that could catch you off guard
        - **Bottom line** — the one thing to actually know or do
        - No account required. No data stored beyond what's needed to generate the response.

        ## How it works

        inklet is a lightweight frontend that sends user text to the Gemini API with a fixed system prompt, which forces the model into the same predictable structure every time. That structure is what makes the output trustworthy — it never free-forms, never skips a section, and never invents a "watch out for" point when there isn't one.

        Uploaded files are parsed entirely client-side before anything is sent to the model:

        | File type | How it's parsed |
        |---|---|
        | `.txt` | Read directly as plain text |
        | `.pdf` | Extracted with [pdf.js](https://mozilla.github.io/pdf.js/) |
        | `.docx` | Extracted with [mammoth.js](https://github.com/mwilliamson/mammoth.js) |

        ## Tech stack

        - Built with

        - [Gemini API](https://ai.google.dev/) for the language model
        - Vanilla JS, HTML, CSS — no framework
        - Hosted for free on [Netlify](https://www.netlify.com)

        ## Design principles

        A few rules I held myself to while building this:

        1. **One clear action.** No navigation, no distracting sections — the input box is the whole product.
        2. **Predictable output.** The same four-part structure every time, so the result is scannable and the UI can style it consistently.
        3. **Neutral, not judgmental.** inklet explains what text means; it doesn't tell you whether something is good or bad. That's your call.
        4. **Say when there's nothing to say.** If there's no real risk in a document, it says so — instead of inventing a warning to fill space.

        ## Status

        🚧 Early build — actively improving parsing accuracy, adding more file types, and refining the prompt based on real examples.

        ## Roadmap

        - [ ] Shareable result links
        - [ ] Support for `.jpg` / `.png` (scanned documents via OCR)
        - [ ] Dark mode
        - [ ] Custom domain

        ## Feedback

        This is a learning project and I'd genuinely like to know what's confusing, broken, or missing. Open an issue or reach out — see contact info below.

        ---

        *Built with [VIBE CODING]. Not a lawyer, not legal advice — inklet explains what text says, it doesn't tell you what to do about it.*