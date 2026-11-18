/** Small fail-closed validator for the checked-in readiness contract, not arbitrary JSON Schema. */
export function matchesContract(value, schema) {
  if (schema.const !== undefined && value !== schema.const) return false;
  if (schema.enum && !schema.enum.includes(value)) return false;
  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some(type => type === 'null' ? value === null : type === 'array' ? Array.isArray(value) : type === 'object' ? value !== null && typeof value === 'object' && !Array.isArray(value) : type === 'number' ? typeof value === 'number' && Number.isFinite(value) : typeof value === type)) return false;
  }
  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) return false;
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) return false;
    if (schema.format === 'date-time' && (!/^\d{4}-\d{2}-\d{2}T/.test(value) || !Number.isFinite(Date.parse(value)))) return false;
  }
  if (typeof value === 'number' && schema.minimum !== undefined && value < schema.minimum) return false;
  if (Array.isArray(value)) {
    if (schema.maxItems !== undefined && value.length > schema.maxItems) return false;
    if (schema.items && !value.every(item => matchesContract(item, schema.items))) return false;
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    if (schema.required?.some(key => !Object.hasOwn(value, key))) return false;
    for (const [key, item] of Object.entries(value)) {
      const child = schema.properties?.[key];
      if (child && !matchesContract(item, child)) return false;
      if (!child && schema.additionalProperties === false) return false;
      if (!child && schema.additionalProperties && typeof schema.additionalProperties === 'object' && !matchesContract(item, schema.additionalProperties)) return false;
    }
  }
  if (schema.allOf && !schema.allOf.every(part => matchesContract(value, part))) return false;
  if (schema.if && matchesContract(value, schema.if) && schema.then && !matchesContract(value, schema.then)) return false;
  return true;
}
