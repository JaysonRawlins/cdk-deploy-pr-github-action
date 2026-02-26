/**
 * Convert a string to kebab-case for use in file names and job IDs.
 */
export function toKebabCase(s: string): string {
  return s
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

/**
 * Convert a string to a valid GitHub Actions job ID.
 * Job IDs must start with a letter or underscore and contain only alphanumerics, hyphens, and underscores.
 */
export function toGithubJobId(s: string): string {
  let out = s.replace(/[^A-Za-z0-9_-]+/g, '-');
  out = out.replace(/-+/g, '-');
  out = out.replace(/^-+|-+$/g, '');
  out = out.toLowerCase();
  if (!out || !/^[a-z_]/i.test(out)) {
    out = `s-${out}`;
  }
  return out;
}

/**
 * Validate that there are no circular dependencies in the stage graph.
 * @throws Error if a cycle is detected
 */
export function validateNoCycles(
  stages: { name: string; dependsOn?: string[] }[],
): void {
  const visited = new Set<string>();
  const inStack = new Set<string>();
  const stageMap = new Map(stages.map((s) => [s.name, s]));

  function visit(name: string, path: string[]): void {
    if (inStack.has(name)) {
      throw new Error(
        `Circular dependency detected: ${[...path, name].join(' -> ')}`,
      );
    }
    if (visited.has(name)) {
      return;
    }
    inStack.add(name);
    const stage = stageMap.get(name);
    if (stage?.dependsOn) {
      for (const dep of stage.dependsOn) {
        visit(dep, [...path, name]);
      }
    }
    inStack.delete(name);
    visited.add(name);
  }

  for (const stage of stages) {
    visit(stage.name, []);
  }
}
