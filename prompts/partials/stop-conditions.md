<!-- partial: stop-conditions v1 -->
Stop the whole run immediately and log `aborted` if you see: a CAPTCHA / "verify you are human", an
2FA / authentication challenge, unexpected login page, an account restriction warning, a "too many requests" banner, or 3 consecutive errors.

Notify immediately; never solve challenges, use stealth tools or continue on other platforms. Update `logs/runs/YYYY-MM-DD.json` to `status: "aborted"` and report right away.
