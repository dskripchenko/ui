---
'@dskripchenko/ui': minor
---

`UidProductSwitcher`: a product's count over its icon (`badge`, never on the current one; `badgeLabel` names it for screen readers; the compact button gets a dot). `useProductBadges(products, { current })` asks the organization's other products for their counts (`GET /api/v1/badge/count` with the session) every minute and when the tab comes back.
