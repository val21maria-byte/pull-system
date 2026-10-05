PULL — Sample Operations prototype v3

Open index.html in Chrome/Edge.

New in v3:
- PULL Starter checkout / onboarding flow
- ₩49,000 monthly plan confirmation
- Brand / manager information
- QR Starter Kit 100-label shipping form
- Account creation screen
- Honest TEST MODE payment simulation (no real charge)
- Order number + subscription activation
- Dashboard subscription / kit status banner
- LocalStorage persistence

Existing:
- Luxury responsive landing page
- Dashboard
- Sample library/search/filter
- Add sample
- Sample detail + real QR images
- Loan creation / return
- Borrower directory
- Activity log
- Camera QR scan attempt with manual fallback
- CSV export
- Settings/reset demo

Important:
This is still a frontend prototype. Real card charging requires a backend and PG integration
(e.g. Toss Payments billing). Replace the TEST MODE payment block with the PG widget/API after
contracting and setting server-side secret keys.

Camera access usually requires HTTPS or localhost. For local camera testing:
python -m http.server 8000
then open http://localhost:8000


Korean / gray mood update applied in v4.
