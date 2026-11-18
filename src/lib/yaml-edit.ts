// Edit one top-level boolean in a YAML file without reformatting anything else.
// The yaml library's document serializer rewrites flow sequences
// (`delay_seconds: [3, 8]` -> `delay_seconds: [ 3, 8 ]`), so the dry-run switch
// must not go through it.

export function setTopLevelFlag(text: string, key: string, value: boolean): string {
  const line = new RegExp(`^(${key}:)([^\\n]*)$`, "m");
  if (line.test(text)) {
    return text.replace(line, (_match, head: string, rest: string) => {
      const hash = rest.indexOf("#");
      const comment = hash === -1 ? "" : " " + rest.slice(hash).trim();
      return `${head} ${value}${comment}`;
    });
  }
  const separator = text.length === 0 || text.endsWith("\n") ? "" : "\n";
  return `${text}${separator}${key}: ${value}\n`;
}

export function setDryRunInText(text: string, dryRun: boolean): string {
  return setTopLevelFlag(text, "dry_run", dryRun);
}
