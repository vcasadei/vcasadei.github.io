## 1. Compute the year range in the footer

- [ ] 1.1 In `_includes/footer.html`, replace the `get-locale-string.html key='COPYRIGHT_DATES'` lookup with a computed value: start year `2024`, end year `site.time | date: '%Y'`, rendered as `2024-<end year>` (or just `2024` if end year equals 2024).
- [ ] 1.2 Remove the duplicate/dead `get-locale-string.html key='COPYRIGHT_DATES'` include left over on the unused line above the one actually used (footer.html currently calls it twice in a row).

## 2. Clean up the now-unused locale key

- [ ] 2.1 Remove the `COPYRIGHT_DATES` key from every locale block in `_data/locale.yml` (en, zh-Hans, zh-Hant, ko, fr, tr, pt-BR).

## 3. Verify

- [ ] 3.1 Run the site locally and check the footer on an English page and a Portuguese page; verify both show "2024-<current year>" (matching the local machine's current year at build time).
