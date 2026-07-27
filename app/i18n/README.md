# SAME STUDIO localization audit

The site localization boundary is limited to user-facing text that is currently
written in Korean. Existing English product copy, app and brand names, store and
platform names, email addresses, URLs, file names, dates, numbers, user input,
saved puzzle state, and saved drum state remain unchanged.

## Audited React surfaces

- Header controls and carousel controls
- Main section navigation summaries
- Device Philosophy copy and interactive device accessibility labels
- App detail descriptions, keywords, and accessibility labels
- Contact description
- Footer business labels

The standalone support, terms, and privacy documents already own independent
multilingual dictionaries and are intentionally kept outside the main React
translation provider.

## Locale contract

- Supported locales: `ko`, `en`, `ja`, `zh-CN`, `zh-TW`
- Korean is the source and fallback locale.
- Locale persistence key: `same-studio-locale-v1`
- Translation keys are checked through the `TranslationMessages` type.
