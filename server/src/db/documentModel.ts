import crypto from "node:crypto";
import { getPool, type SortOrder } from "./postgres.js";

export type PlainDoc = Record<string, any>;
type QueryFilter = Record<string, any>;
type UpdateOptions = { new?: boolean; upsert?: boolean };
type ModelHooks = {
  defaults?: () => PlainDoc;
  beforeSave?: (doc: PlainDoc, original?: PlainDoc | null) => Promise<void> | void;
};

export function createCollectionModel(collection: string, hooks: ModelHooks = {}) {
  return new DocumentModel(collection, hooks);
}

class DocumentModel {
  constructor(
    private readonly collection: string,
    private readonly hooks: ModelHooks
  ) {}

  find(filter: QueryFilter = {}) {
    return new DocumentQuery(this, filter, false);
  }

  findOne(filter: QueryFilter = {}) {
    return new DocumentQuery(this, filter, true);
  }

  findById(id: unknown) {
    return this.findOne({ _id: String(id) });
  }

  async create(input: PlainDoc[]): Promise<PlainDoc[]>;
  async create(input: PlainDoc): Promise<PlainDoc>;
  async create(input: PlainDoc | PlainDoc[]) {
    if (Array.isArray(input)) {
      const created = [];
      for (const item of input) created.push(await this.createOne(item));
      return created;
    }

    return this.createOne(input);
  }

  findByIdAndUpdate(id: unknown, update: PlainDoc, _options: UpdateOptions = {}) {
    return new DocumentMutationQuery(async () => {
      const existing = await this.findById(id);
      if (!existing) return null;
      applyUpdate(existing, update);
      return existing.save();
    });
  }

  async findOneAndUpdate(filter: QueryFilter, update: PlainDoc, options: UpdateOptions = {}) {
    const existing = await this.findOne(filter);
    if (existing) {
      applyUpdate(existing, update);
      return existing.save();
    }

    if (!options.upsert) return null;
    const doc = { ...filter, ...withoutOperators(update) };
    return this.createOne(doc);
  }

  async countDocuments(filter: QueryFilter = {}) {
    const docs = await this.all();
    return docs.filter((doc) => matches(doc, filter)).length;
  }

  async deleteMany(filter: QueryFilter = {}) {
    const docs = await this.all();
    const ids = docs.filter((doc) => matches(doc, filter)).map((doc) => doc._id);
    for (const id of ids) await this.deleteById(id);
    return { deletedCount: ids.length };
  }

  async saveDocument(doc: PlainDoc, original?: PlainDoc | null) {
    const now = new Date().toISOString();
    if (!doc._id) doc._id = newId();
    if (!doc.id) doc.id = doc._id;
    if (!doc.createdAt) doc.createdAt = original?.createdAt || now;
    doc.updatedAt = now;

    await this.hooks.beforeSave?.(doc, original);

    const pool = getPool();
    const payload = stripRuntime(doc);
    await pool.query(
      `
        insert into app_documents (collection, id, data, created_at, updated_at)
        values ($1, $2, $3::jsonb, $4, $5)
        on conflict (collection, id)
        do update set data = excluded.data, updated_at = excluded.updated_at
      `,
      [this.collection, String(payload._id), JSON.stringify(payload), payload.createdAt, payload.updatedAt]
    );

    return hydrate(this, payload, payload);
  }

  async deleteById(id: unknown) {
    const pool = getPool();
    await pool.query("delete from app_documents where collection = $1 and id = $2", [this.collection, String(id)]);
  }

  async all() {
    const pool = getPool();
    const result = await pool.query("select data from app_documents where collection = $1", [this.collection]);
    return result.rows.map((row) => hydrate(this, row.data, row.data));
  }

  private async createOne(input: PlainDoc) {
    const doc = {
      ...(this.hooks.defaults?.() || {}),
      ...input
    };
    if (!doc._id) doc._id = newId();
    return this.saveDocument(doc, null);
  }
}

class DocumentQuery implements PromiseLike<any> {
  private sortSpec: Record<string, SortOrder> = {};
  private skipCount = 0;
  private limitCount = 0;
  private selectSpec = "";

  constructor(
    private readonly model: DocumentModel,
    private readonly filter: QueryFilter,
    private readonly single: boolean
  ) {}

  sort(spec: Record<string, SortOrder>) {
    this.sortSpec = spec;
    return this;
  }

  skip(count: number) {
    this.skipCount = count;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  select(spec: string) {
    this.selectSpec = spec;
    return this;
  }

  populate(_path: string, _select?: string) {
    return this;
  }

  async exec() {
    let docs = (await this.model.all()).filter((doc) => matches(doc, this.filter));
    docs = sortDocs(docs, this.sortSpec);
    if (this.skipCount) docs = docs.slice(this.skipCount);
    if (this.limitCount) docs = docs.slice(0, this.limitCount);
    if (this.selectSpec) docs = docs.map((doc) => applySelect(doc, this.selectSpec));
    return this.single ? docs[0] || null : docs;
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.exec().then(onfulfilled, onrejected);
  }
}

class DocumentMutationQuery implements PromiseLike<any> {
  private selectSpec = "";

  constructor(private readonly run: () => Promise<any>) {}

  select(spec: string) {
    this.selectSpec = spec;
    return this;
  }

  populate(_path: string, _select?: string) {
    return this;
  }

  async exec() {
    const doc = await this.run();
    return doc && this.selectSpec ? applySelect(doc, this.selectSpec) : doc;
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.exec().then(onfulfilled, onrejected);
  }
}

function hydrate(model: DocumentModel, data: PlainDoc, original: PlainDoc) {
  const doc = clone(data);
  Object.defineProperty(doc, "save", {
    enumerable: false,
    value: async () => model.saveDocument(doc, original)
  });
  Object.defineProperty(doc, "deleteOne", {
    enumerable: false,
    value: async () => model.deleteById(doc._id)
  });
  Object.defineProperty(doc, "isModified", {
    enumerable: false,
    value: (field: string) => JSON.stringify(doc[field]) !== JSON.stringify(original?.[field])
  });
  return doc;
}

function newId() {
  return crypto.randomBytes(12).toString("hex");
}

function stripRuntime(doc: PlainDoc) {
  const payload = clone(doc);
  delete payload.save;
  delete payload.deleteOne;
  delete payload.isModified;
  return payload;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value ?? null));
}

function applyUpdate(doc: PlainDoc, update: PlainDoc) {
  if (update.$set) {
    for (const [key, value] of Object.entries(update.$set)) setPath(doc, key, value);
  }
  if (update.$inc) {
    for (const [key, value] of Object.entries(update.$inc)) setPath(doc, key, Number(firstValue(doc, key) || 0) + Number(value));
  }
  if (update.$push) {
    for (const [key, value] of Object.entries(update.$push)) {
      const currentValue = firstValue(doc, key);
      const current = Array.isArray(currentValue) ? currentValue : [];
      setPath(doc, key, [...current, value]);
    }
  }
  if (update.$pull) {
    for (const [key, value] of Object.entries(update.$pull)) {
      const currentValue = firstValue(doc, key);
      const current = Array.isArray(currentValue) ? currentValue : [];
      setPath(
        doc,
        key,
        current.filter((item: unknown) => String(item) !== String(value))
      );
    }
  }
  if (update.$addToSet) {
    for (const [key, value] of Object.entries(update.$addToSet)) {
      const currentValue = firstValue(doc, key);
      const current = Array.isArray(currentValue) ? currentValue : [];
      if (!current.some((item: unknown) => String(item) === String(value))) setPath(doc, key, [...current, value]);
    }
  }

  for (const [key, value] of Object.entries(update)) {
    if (!key.startsWith("$")) setPath(doc, key, value);
  }
}

function withoutOperators(update: PlainDoc) {
  const output: PlainDoc = {};
  for (const [key, value] of Object.entries(update)) {
    if (!key.startsWith("$")) output[key] = value;
  }
  if (update.$set) Object.assign(output, update.$set);
  return output;
}

function matches(doc: PlainDoc, filter: QueryFilter) {
  for (const [key, expected] of Object.entries(filter)) {
    if (key === "$or") {
      if (!Array.isArray(expected) || !expected.some((item) => matches(doc, item))) return false;
      continue;
    }

    if (key === "$text") {
      const search = String(expected?.$search || "").toLowerCase();
      const haystack = JSON.stringify(doc).toLowerCase();
      if (!haystack.includes(search)) return false;
      continue;
    }

    const values = valuesAtPath(doc, key);
    if (!values.some((value) => valueMatches(value, expected))) return false;
  }

  return true;
}

function valueMatches(value: unknown, expected: unknown): boolean {
  if (expected instanceof RegExp) return expected.test(String(value || ""));

  if (expected && typeof expected === "object" && !Array.isArray(expected)) {
    for (const [operator, operand] of Object.entries(expected as PlainDoc)) {
      if (operator === "$gt" && !(compare(value, operand) > 0)) return false;
      if (operator === "$gte" && !(compare(value, operand) >= 0)) return false;
      if (operator === "$lt" && !(compare(value, operand) < 0)) return false;
      if (operator === "$lte" && !(compare(value, operand) <= 0)) return false;
      if (operator === "$ne" && looseEqual(value, operand)) return false;
      if (operator === "$in" && !Array.isArray(operand)) return false;
      if (operator === "$in" && Array.isArray(operand) && !operand.some((item) => looseEqual(value, item))) return false;
    }
    return true;
  }

  return looseEqual(value, expected);
}

function looseEqual(left: unknown, right: unknown): boolean {
  if (Array.isArray(left)) return left.some((item) => looseEqual(item, right));
  return String(left ?? "") === String(right ?? "");
}

function compare(left: unknown, right: unknown) {
  const leftTime = Date.parse(String(left));
  const rightTime = Date.parse(String(right));
  if (!Number.isNaN(leftTime) && !Number.isNaN(rightTime)) return leftTime - rightTime;
  return Number(left) - Number(right);
}

function valuesAtPath(input: unknown, path: string): unknown[] {
  const parts = path.split(".");
  let values: unknown[] = [input];
  for (const part of parts) {
    values = values.flatMap((value) => {
      if (Array.isArray(value)) return value.map((item) => item?.[part]).flat();
      if (value && typeof value === "object") return [(value as PlainDoc)[part]];
      return [undefined];
    });
  }
  return values;
}

function firstValue(input: unknown, path: string) {
  return valuesAtPath(input, path)[0];
}

function setPath(input: PlainDoc, path: string, value: unknown) {
  const parts = path.split(".");
  let target = input;
  for (const part of parts.slice(0, -1)) {
    target[part] = target[part] && typeof target[part] === "object" ? target[part] : {};
    target = target[part];
  }
  target[parts.at(-1) || path] = value;
}

function sortDocs(docs: PlainDoc[], sortSpec: Record<string, SortOrder>) {
  const entries = Object.entries(sortSpec);
  if (!entries.length) return docs;
  return [...docs].sort((left, right) => {
    for (const [field, direction] of entries) {
      const sign = direction === -1 || direction === "desc" || direction === "descending" ? -1 : 1;
      const a = firstValue(left, field);
      const b = firstValue(right, field);
      const result = typeof a === "number" && typeof b === "number" ? a - b : String(a ?? "").localeCompare(String(b ?? ""));
      if (result !== 0) return result * sign;
    }
    return 0;
  });
}

function applySelect(doc: PlainDoc, spec: string) {
  const selected = clone(doc);
  const fields = spec.split(/\s+/).filter(Boolean);
  for (const field of fields) {
    if (field.startsWith("-")) delete selected[field.slice(1)];
  }
  return hydrate({ saveDocument: async () => selected, deleteById: async () => undefined } as unknown as DocumentModel, selected, selected);
}
