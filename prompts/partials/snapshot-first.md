<!-- partial: snapshot-first v1 -->
Always call `browser_snapshot` before interacting. Locate elements by **role + accessible name**
(e.g. button "Easy Apply", textbox "Phone number"). Use the returned `ref`. Never guess CSS selectors.
Re-snapshot after every page change.
