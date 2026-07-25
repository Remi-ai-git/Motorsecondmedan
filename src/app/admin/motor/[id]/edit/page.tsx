import { notFound } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import MotorForm from "@/components/admin/MotorForm";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Motor } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditMotorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = getSupabaseAdmin();
  if (!admin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <AdminNav />
        <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          SUPABASE_SERVICE_ROLE_KEY belum di-set di server.
        </p>
      </div>
    );
  }

  const { data } = await admin.from("motors").select("*").eq("id", id).single();
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <AdminNav />
      <h1 className="mb-6 text-xl font-bold">
        Edit {data.brand} {data.model}
      </h1>
      <MotorForm initial={data as Motor} motorId={id} />
    </div>
  );
}
