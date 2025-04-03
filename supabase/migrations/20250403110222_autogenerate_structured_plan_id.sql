alter table "public"."plans" drop constraint "Plans_id_key";

drop index if exists "public"."Plans_id_key";

alter table "public"."plans" drop column "nanoid";

alter table "public"."plans" alter column "id" drop identity;

alter table "public"."plans" alter column "id" set data type text using "id"::text;

CREATE UNIQUE INDEX plans_id_key ON public.plans USING btree (id);

alter table "public"."plans" add constraint "plans_id_key" UNIQUE using index "plans_id_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.generate_unique_structured_id(table_name text, column_name text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$DECLARE
    num_part TEXT;
    main_chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- 32 visually distinct characters
    result TEXT;
    exists BOOLEAN;
    rand_int INT;
    max_range INT := 900; -- Range for 4-digit numbers (1000-9999)
BEGIN
    LOOP
        -- Generate a random number in the range 1000-9999 using random()
        rand_int := floor(random() * max_range) + 100;

        num_part := LPAD(rand_int::TEXT, 3, '0'); -- Ensure the number is 4 digits long

        -- Generate structured ID in format ####-XXX-YYY
        result := (
            SELECT num_part || '-' ||
                substr(main_chars, floor(random() * length(main_chars))::int + 1, 1) ||
                substr(main_chars, floor(random() * length(main_chars))::int + 1, 1) ||
                substr(main_chars, floor(random() * length(main_chars))::int + 1, 1) || '-' ||
                substr(main_chars, floor(random() * length(main_chars))::int + 1, 1) ||
                substr(main_chars, floor(random() * length(main_chars))::int + 1, 1) ||
                substr(main_chars, floor(random() * length(main_chars))::int + 1, 1)
        );

        -- Check uniqueness
        EXECUTE FORMAT('SELECT EXISTS (SELECT 1 FROM %I WHERE %I = $1)', table_name, column_name)
        INTO exists USING result;

        -- If unique, exit loop
        EXIT WHEN NOT exists;
    END LOOP;

    RETURN result;
END;$function$
;

CREATE OR REPLACE FUNCTION public.set_unique_structured_id()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Generate a unique structured ID and set it in the 'id' column
    NEW.id := generate_unique_structured_id('plans', 'id');
    
    -- Return the new record with the generated ID
    RETURN NEW;
END;
$function$
;

CREATE TRIGGER trigger_set_unique_id_on_plans BEFORE INSERT ON public.plans FOR EACH ROW EXECUTE FUNCTION set_unique_structured_id();



