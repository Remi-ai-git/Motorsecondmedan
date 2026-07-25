import AdminNav from "@/components/admin/AdminNav";
import MotorForm from "@/components/admin/MotorForm";

export const dynamic = "force-dynamic";

export default function NewMotorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <AdminNav />
      <h1 className="mb-6 text-xl font-bold">Tambah Motor</h1>
      <MotorForm />
    </div>
  );
}
