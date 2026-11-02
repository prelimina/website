// Prelimina user guide PDF. Colours and fonts follow src/styles/global.css.
#let ink = rgb("#292929")
#let muted = rgb("#636363")
#let band = rgb("#eaeaee")
#let line-colour = rgb("#d9d9d9")
#let accent = rgb("#c0645a")
#let accent-gradient = gradient.linear(rgb("#e07a3f"), rgb("#d4607a"))
#let serif = "Fraunces"
#let sans = "Quicksand"

#let cover(version, updated) = page(
  fill: black,
  margin: (x: 26mm, y: 30mm),
  header: none,
  footer: none,
)[
  #set text(fill: white)
  #image("/public/assets/logo_black_white.svg", width: 26mm)
  #v(1fr)
  #text(font: serif, size: 46pt, weight: 500)[Prelimina]
  #v(2mm)
  #text(font: serif, size: 24pt, weight: 400, style: "italic")[User Guide]
  #v(8mm)
  #box(width: 40mm, height: 1.2mm, fill: accent-gradient)
  #v(8mm)
  #text(size: 12pt)[Written for Prelimina #version] \
  #text(size: 12pt, fill: rgb("#b5b5b5"))[Updated #updated]
  #v(1fr)
  #text(size: 10pt, fill: rgb("#b5b5b5"))[
    PLASMICA d.o.o. · prelimina.com \
    Prelimina is in development and not yet ready for production use.
  ]
]

#let guide(version: "", updated: "", body) = {
  set document(title: "Prelimina User Guide", author: "PLASMICA d.o.o.")
  set text(font: sans, size: 10.5pt, weight: 450, fill: ink, lang: "en", region: "GB")
  set par(justify: false, leading: 0.72em, spacing: 1.05em)
  set page(
    paper: "a4",
    margin: (x: 24mm, top: 24mm, bottom: 24mm),
    header: none,
    footer: context [
      #set text(size: 8.5pt, fill: muted)
      Prelimina User Guide · version #version
      #h(1fr)
      #counter(page).display()
    ],
  )

  show heading: set text(font: serif, weight: 500, fill: ink)
  show heading.where(level: 1): it => {
    pagebreak(weak: true)
    v(6mm)
    set text(size: 28pt)
    set par(leading: 0.5em)
    it
    v(1mm)
    box(width: 30mm, height: 1mm, fill: accent-gradient)
    v(6mm)
  }
  show heading.where(level: 2): set text(size: 16pt)
  show heading.where(level: 2): set block(above: 8mm, below: 3mm)
  show heading.where(level: 3): set text(size: 12pt)
  show heading.where(level: 3): set block(above: 6mm, below: 2.5mm)

  show link: set text(fill: accent)
  show strong: set text(weight: 700)

  show raw.where(block: false): it => box(
    fill: band,
    inset: (x: 2.5pt),
    outset: (y: 2.5pt),
    radius: 2pt,
    text(font: "DejaVu Sans Mono", size: 0.88em, it.text),
  )
  show raw.where(block: true): it => block(
    width: 100%,
    fill: band,
    inset: 9pt,
    radius: 4pt,
    text(font: "DejaVu Sans Mono", size: 8.8pt, it),
  )

  show quote.where(block: true): it => block(
    width: 100%,
    fill: band,
    inset: (left: 11pt, rest: 9pt),
    stroke: (left: 2pt + accent),
    radius: (right: 4pt),
    breakable: false,
    it.body,
  )

  set table(stroke: (x: none, y: 0.5pt + line-colour), inset: (left: 0pt, right: 10pt, y: 5pt))
  show table: it => {
    set text(size: 9.5pt)
    set par(leading: 0.62em)
    it
  }
  show table.cell.where(y: 0): set text(weight: 700)
  show figure.where(kind: table): set figure(supplement: none, numbering: none)
  show figure.where(kind: table): set align(left)
  show figure.where(kind: table): it => block(width: 100%, it.body)

  set image(width: 100%)
  show figure.where(kind: image): set align(left)
  show figure.where(kind: image): it => block(breakable: false, width: 100%)[
    #v(1mm)
    #box(width: 80%, stroke: 0.5pt + line-colour, radius: 3pt, clip: true, it.body)
    #v(0.5mm)
    #set text(size: 9pt, fill: muted)
    #set par(leading: 0.6em)
    #align(left)[*Figure #it.counter.display().* #it.caption.body]
    #v(1mm)
  ]

  cover(version, updated)
  set page(numbering: "1")
  counter(page).update(1)
  page(footer: none)[
    #text(font: serif, size: 22pt, weight: 500)[Contents]
    #v(6mm)
    #outline(title: none, depth: 2, indent: 5mm)
  ]
  body
}
