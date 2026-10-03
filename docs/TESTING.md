# Testing

Tested by the project owner on a physical Android phone (Expo Go during development, then the installed APK) and a computer browser, using the live website.

## Requirement checks

| # | Check | Result |
| --- | --- | --- |
| 1 | Sign in on the website with Google | Passed |
| 2 | Sign in on the phone app with the same Google account | Passed. The app shows the same name and email as the website |
| 3 | Add an item to the cart on the **website**: it appears in the **app** cart without refreshing | Passed |
| 4 | Change the quantity in the **app**: the **website** cart updates | Passed |
| 5 | Add items from the app's Shop tab: they appear on the website cart | Passed |
| 6 | Place an order from the app through `/api/checkout` | Passed. The order appears on the website's Orders page |
| 7 | Run the installed APK on its own, with no development server running | Passed |

## Not formally verified

- Order confirmation **emails**: Mailgun's sandbox only delivers to authorised recipients, so delivery depends on the account setup.
- iPhone: no iOS build was made.
- Long-running behaviour such as losing and regaining the network connection while the cart screen is open.

## How to repeat the main test

1. Open the website and sign in with Google.
2. In the app, open Account and sign in with the same Google account.
3. Open the app's Cart tab. A green **Synced live** label means the Realtime connection is active.
4. On the website, add a product. Watch the app: it should appear within about a second.
5. In the app, press **+** on the item. Watch the website's cart page.

## Troubleshooting a failed test

See the table at the end of [SETUP.md](SETUP.md).
