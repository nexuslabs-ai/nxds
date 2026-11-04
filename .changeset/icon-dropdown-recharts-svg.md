---
'@nxds/claude-design': minor
---

The props panel now shows every icon prop as a dropdown with a search box. The canvas icon set goes from 422 to 381 names, under the panel's 400-option limit, and the build fails if it grows past 400.

These icon names are gone. A canvas that uses one logs an `[nxds] … isn't an icon name` warning and draws nothing:

- Logos: `amazon-logo`, `discord-logo`, `facebook-logo`, `figma-logo`, `gitlab-logo`, `instagram-logo`, `linkedin-logo`, `notion-logo`, `open-ai-logo`, `paypal-logo`, `slack-logo`, `stripe-logo`, `webhooks-logo`, `whatsapp-logo`, `windows-logo`, `x-logo`, `youtube-logo`. `apple-logo`, `github-logo` and `google-logo` stay.
- `-simple` versions, with the icon to use instead: `bell-simple-ringing` (`bell-ringing`), `bookmark-simple` (`bookmark`), `copy-simple` (`copy`), `envelope-simple` (`envelope`), `funnel-simple` (`funnel`), `shopping-cart-simple` (`shopping-cart`), `stack-simple` (`stack`), `tag-simple` (`tag`), `trash-simple` (`trash`).
- Near-duplicates, with the icon to use instead: `calendar-dot` (`calendar-dots`), `chat-centered` (`chat`), `gear-fine` and `gear-six` (`gear`), `pencil-circle` and `pencil-simple-line` (`pencil-simple`), `question-mark` (`question`), `share-fat` (`share`), `sidebar` (`sidebar-simple`), `sun-dim` (`sun`), `image-square` (`image`), `arrows-vertical` (`arrows-down-up`), `paper-plane-right` (`paper-plane-tilt`), `warning-diamond` (`warning`), `frame-corners` (`corners-out`).

The Recharts parts list their SVG props in the panel: `fill`, `fillOpacity`, `stroke`, `strokeWidth`, `strokeDasharray` and `opacity`, wherever the part draws them. Every series, grid and reference part gains the ones it lacked. `strokeDasharray` is a string everywhere, so `stroke-dasharray="4 4"` works on Line and ReferenceLine.
