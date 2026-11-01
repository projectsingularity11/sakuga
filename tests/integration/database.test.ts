import { PGlite } from "@electric-sql/pglite";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";
import { readFileSync } from "node:fs";
import { beforeAll, afterAll, it, expect } from "vitest";
const db = new PGlite({ extensions: { pg_trgm } });
const alice = "00000000-0000-4000-8000-000000000001",
  bob = "00000000-0000-4000-8000-000000000002";
beforeAll(async () => {
  await db.exec(
    `create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;`,
  );
  await db.exec(
    readFileSync("supabase/migrations/202611010001_core.sql", "utf8"),
  );
  await db.exec(
    `grant usage on schema public to anon,authenticated;grant select on all tables in schema public to anon;grant select,insert,update,delete on all tables in schema public to authenticated;grant usage on all sequences in schema public to authenticated;insert into auth.users(id) values('${alice}'),('${bob}');insert into public.anime(id,title,episodes,moderation,moderation_reason) values(1,'Eligible work',12,'published','Test fixture'),(2,'Quarantined work',null,'quarantine','Ambiguous'),(3,'Excluded work',null,'excluded','Explicit');`,
  );
}, 30000);
afterAll(async () => await db.close());
async function asUser<T>(user: string, run: () => Promise<T>) {
  await db.exec(`set role authenticated;set request.jwt.claim.sub='${user}';`);
  try {
    return await run();
  } finally {
    await db.exec("reset role;reset request.jwt.claim.sub;");
  }
}
it("applies the complete migration and enforces public moderation on all catalog surfaces", async () => {
  await db.exec(
    "insert into source_mappings(anime_id,provider,external_id,url,provenance,confidence,verified) values(2,'anilist','2','https://anilist.co/anime/2','fixture',1,true);insert into ratings(anime_id,provider,score,scale) values(2,'anilist',80,100);",
  );
  await asUser(alice, async () => {
    expect((await db.query("select id from anime")).rows).toEqual([{ id: 1 }]);
    expect((await db.query("select * from ratings")).rows).toEqual([]);
    expect((await db.query("select * from source_mappings")).rows).toEqual([]);
  });
});
it("enforces uniqueness, cross-user privacy, progress bounds and append-only history", async () => {
  await asUser(alice, async () => {
    await db.exec(
      `insert into library(user_id,anime_id,progress,notes) values('${alice}',1,3,'private');`,
    );
    await expect(
      db.exec(`insert into library(user_id,anime_id) values('${alice}',1)`),
    ).rejects.toThrow();
    await expect(
      db.exec(`update library set progress=13 where anime_id=1`),
    ).rejects.toThrow();
  });
  await asUser(bob, async () => {
    expect((await db.query("select * from library")).rows).toEqual([]);
    await expect(
      db.exec(`insert into library(user_id,anime_id) values('${alice}',1)`),
    ).rejects.toThrow();
    expect((await db.query("select * from viewing_events")).rows).toEqual([]);
  });
  expect((await db.query("select progress from viewing_events")).rows).toEqual([
    { progress: 3 },
  ]);
});
it("denies collection membership across owners and forged paid entitlements", async () => {
  await asUser(alice, async () => {
    await db.exec(
      `insert into collections(id,user_id,name) values('10000000-0000-4000-8000-000000000001','${alice}','Private')`,
    );
  });
  await asUser(bob, async () => {
    await expect(
      db.exec(
        `insert into collection_members(collection_id,user_id,anime_id) values('10000000-0000-4000-8000-000000000001','${bob}',1)`,
      ),
    ).rejects.toThrow();
    await expect(
      db.exec(
        `insert into entitlements(user_id,ad_free) values('${bob}',true)`,
      ),
    ).rejects.toThrow();
    await expect(
      db.query(`select apply_payment('fake','fake','${bob}',null,null,true)`),
    ).rejects.toThrow();
  });
});
it("processes repeated webhook events once and revokes refunds atomically", async () => {
  await db.query(
    `select apply_payment('evt_1','session_1','${alice}','customer_1','intent_1',true)`,
  );
  await db.query(
    `select apply_payment('evt_1','session_1','${alice}','customer_1','intent_1',true)`,
  );
  expect(
    (await db.query("select count(*)::int n from webhook_events")).rows,
  ).toEqual([{ n: 1 }]);
  expect((await db.query("select ad_free from entitlements")).rows).toEqual([
    { ad_free: true },
  ]);
  await db.query(
    `select apply_payment('evt_2','session_1','${alice}','customer_1','intent_1',false)`,
  );
  expect((await db.query("select ad_free from entitlements")).rows).toEqual([
    { ad_free: false },
  ]);
});
it("imports with atomic merge and computes private statistics across the database", async () => {
  const row = {
    anime_id: 1,
    status: "watching",
    progress: 5,
    score: 8,
    favorite: true,
    priority: 1,
    notes: "imported",
    tags: ["favorite"],
    rewatches: 0,
    started_on: null,
    completed_on: null,
  };
  await asUser(alice, async () => {
    expect(
      (
        await db.query("select import_library($1::jsonb,$2) n", [
          JSON.stringify([row]),
          "skip",
        ])
      ).rows,
    ).toEqual([{ n: 0 }]);
    expect((await db.query("select progress from library")).rows).toEqual([
      { progress: 3 },
    ]);
    expect(
      (
        await db.query("select import_library($1::jsonb,$2) n", [
          JSON.stringify([row]),
          "replace",
        ])
      ).rows,
    ).toEqual([{ n: 1 }]);
    await expect(
      db.query("select import_library($1::jsonb,$2)", [
        JSON.stringify([
          { ...row, progress: 6 },
          { ...row, score: 11 },
        ]),
        "replace",
      ]),
    ).rejects.toThrow();
    expect((await db.query("select progress from library")).rows).toEqual([
      { progress: 5 },
    ]);
    const stats = await db.query<{
      personal_statistics: { total: number; episodes: number };
    }>("select personal_statistics()");
    expect(stats.rows[0].personal_statistics.total).toBe(1);
    expect(stats.rows[0].personal_statistics.episodes).toBe(5);
  });
  await asUser(bob, async () => {
    const stats = await db.query<{ personal_statistics: { total: number } }>(
      "select personal_statistics()",
    );
    expect(stats.rows[0].personal_statistics.total).toBe(0);
  });
});
it("corrects mappings transactionally and removes the old provider score", async () => {
  await db.exec(
    "insert into ratings(anime_id,provider,score,scale) values(1,'mal',8,10)",
  );
  await db.query(
    "select correct_mapping(1,'mal','999','test-operator','Verified explicit identifier correction')",
  );
  expect(
    (
      await db.query(
        "select manual,external_id from source_mappings where anime_id=1 and provider='mal'",
      )
    ).rows,
  ).toEqual([{ manual: true, external_id: "999" }]);
  expect(
    (
      await db.query(
        "select * from ratings where anime_id=1 and provider='mal'",
      )
    ).rows,
  ).toEqual([]);
});
it("manual moderation wins over refresh and catalog count is a database measurement", async () => {
  await db.exec(
    `insert into moderation_overrides(anime_id,decision,reason,actor) values(1,'excluded','Manual review','test');update anime set moderation='published',title='Refreshed' where id=1;`,
  );
  expect(
    (await db.query("select moderation from anime where id=1")).rows,
  ).toEqual([{ moderation: "excluded" }]);
  const result = await db.query<{
    catalog_health: { published_eligible_distinct: number };
  }>("select catalog_health()");
  expect(result.rows[0].catalog_health.published_eligible_distinct).toBe(0);
});
it("handles delayed payment events after account deletion without recreating an account", async () => {
  await db.exec(
    "delete from auth.users where id='00000000-0000-4000-8000-000000000002'",
  );
  await db.query(
    "select apply_payment('evt_deleted','session_deleted','00000000-0000-4000-8000-000000000002','customer_deleted','intent_deleted',true)",
  );
  expect(
    (
      await db.query(
        "select user_id from purchases where session_id='session_deleted'",
      )
    ).rows,
  ).toEqual([{ user_id: null }]);
  expect(
    (
      await db.query(
        "select * from entitlements where user_id='00000000-0000-4000-8000-000000000002'",
      )
    ).rows,
  ).toEqual([]);
});
