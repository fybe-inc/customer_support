create sequence "public"."precedents_id_seq";

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
drop function if exists "public"."insert_default_data_for_new_user"();

create table "public"."precedents" (
    "id" integer not null default nextval('precedents_id_seq'::regclass),
    "user_id" uuid not null,
    "content" jsonb not null,
    "created_at" timestamp without time zone default CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone default CURRENT_TIMESTAMP
);


alter table "public"."precedents" enable row level security;

alter sequence "public"."precedents_id_seq" owned by "public"."precedents"."id";

CREATE INDEX idx_precedents_user_id ON public.precedents USING btree (user_id);

CREATE UNIQUE INDEX precedents_pkey ON public.precedents USING btree (id);

alter table "public"."precedents" add constraint "precedents_pkey" PRIMARY KEY using index "precedents_pkey";

alter table "public"."precedents" add constraint "precedents_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."precedents" validate constraint "precedents_user_id_fkey";

grant delete on table "public"."precedents" to "anon";

grant insert on table "public"."precedents" to "anon";

grant references on table "public"."precedents" to "anon";

grant select on table "public"."precedents" to "anon";

grant trigger on table "public"."precedents" to "anon";

grant truncate on table "public"."precedents" to "anon";

grant update on table "public"."precedents" to "anon";

grant delete on table "public"."precedents" to "authenticated";

grant insert on table "public"."precedents" to "authenticated";

grant references on table "public"."precedents" to "authenticated";

grant select on table "public"."precedents" to "authenticated";

grant trigger on table "public"."precedents" to "authenticated";

grant truncate on table "public"."precedents" to "authenticated";

grant update on table "public"."precedents" to "authenticated";

grant delete on table "public"."precedents" to "service_role";

grant insert on table "public"."precedents" to "service_role";

grant references on table "public"."precedents" to "service_role";

grant select on table "public"."precedents" to "service_role";

grant trigger on table "public"."precedents" to "service_role";

grant truncate on table "public"."precedents" to "service_role";

grant update on table "public"."precedents" to "service_role";

create policy "サービスロールは全てのデータにアクセス可能"
on "public"."precedents"
as permissive
for all
to public
using ((auth.role() = 'service_role'::text));


create policy "ユーザーは自分のシナリオデータのみ削除可能"
on "public"."precedents"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "ユーザーは自分のシナリオデータのみ挿入可能"
on "public"."precedents"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "ユーザーは自分のシナリオデータのみ更新可能"
on "public"."precedents"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "ユーザーは自分のシナリオデータのみ閲覧可能"
on "public"."precedents"
as permissive
for select
to public
using ((auth.uid() = user_id));



