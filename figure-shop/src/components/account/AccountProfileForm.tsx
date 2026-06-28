"use client";

import { useMemo, useState } from "react";
import { Check, Pencil, RotateCcw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type AccountProfileFormProps = {
  user: {
    email: string;
    name: string | null;
    phone: string | null;
    role: string;
  };
  canViewRole: boolean;
};

type EditableField = "name" | "phone";
type FieldErrors = Partial<Record<EditableField, string>>;

export function AccountProfileForm({
  user,
  canViewRole,
}: AccountProfileFormProps) {
  const router = useRouter();
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [values, setValues] = useState({
    name: user.name ?? "",
    phone: user.phone ?? "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues = useMemo(
    () => ({
      name: user.name ?? "",
      phone: user.phone ?? "",
    }),
    [user.name, user.phone],
  );

  const hasChanges =
    values.name.trim() !== initialValues.name.trim() ||
    values.phone.trim() !== initialValues.phone.trim();

  function resetChanges() {
    setValues(initialValues);
    setEditingField(null);
    setFieldErrors({});
    setError("");
    setSuccess("");
  }

  async function handleSave() {
    setError("");
    setSuccess("");
    setFieldErrors({});
    setIsSubmitting(true);

    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const data = await response.json().catch(() => null);
    setIsSubmitting(false);

    if (response.status === 401) {
      router.push("/login?redirect=/account");
      return;
    }

    if (!response.ok) {
      const errors = data?.errors as
        | Partial<Record<EditableField, string[]>>
        | undefined;

      setFieldErrors({
        name: errors?.name?.[0],
        phone: errors?.phone?.[0],
      });
      setError(data?.message ?? "Khong the cap nhat thong tin.");
      return;
    }

    setEditingField(null);
    setSuccess("Da luu thong tin tai khoan.");
    router.refresh();
  }

  return (
    <div className="mt-5 space-y-4">
      <div className="grid gap-3 text-sm text-zinc-600 sm:grid-cols-2">
        <ReadOnlyInfoCard label="Email" value={user.email} />

        <EditableInfoCard
          label="Ho ten"
          placeholder="Nguyen Van A"
          value={values.name}
          displayValue={values.name || "Chua cap nhat"}
          isEditing={editingField === "name"}
          error={fieldErrors.name}
          onEdit={() => setEditingField("name")}
          onCancel={() => {
            setValues((current) => ({
              ...current,
              name: initialValues.name,
            }));
            setEditingField(null);
          }}
          onChange={(value) =>
            setValues((current) => ({
              ...current,
              name: value,
            }))
          }
        />

        <EditableInfoCard
          label="So dien thoai"
          placeholder="0909123456"
          value={values.phone}
          displayValue={values.phone || "Chua cap nhat"}
          isEditing={editingField === "phone"}
          error={fieldErrors.phone}
          onEdit={() => setEditingField("phone")}
          onCancel={() => {
            setValues((current) => ({
              ...current,
              phone: initialValues.phone,
            }));
            setEditingField(null);
          }}
          onChange={(value) =>
            setValues((current) => ({
              ...current,
              phone: value,
            }))
          }
        />

        {canViewRole ? (
          <ReadOnlyInfoCard label="Vai tro" value={user.role} />
        ) : null}
      </div>

      {hasChanges ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-zinc-950">
                Ban co muon luu thong tin da sua?
              </p>
              <p className="mt-1 text-sm text-zinc-600">
                Thay doi chi duoc cap nhat sau khi ban bam nut luu.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                className="gap-2"
                onClick={resetChanges}
                disabled={isSubmitting}
              >
                <RotateCcw size={16} aria-hidden="true" />
                Huy
              </Button>
              <Button
                type="button"
                className="gap-2"
                onClick={handleSave}
                disabled={isSubmitting}
              >
                <Check size={16} aria-hidden="true" />
                {isSubmitting ? "Dang luu..." : "Luu thay doi"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </p>
      ) : null}
    </div>
  );
}

function ReadOnlyInfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-zinc-50 p-4">
      <p className="text-xs font-semibold uppercase text-zinc-500">{label}</p>
      <p className="mt-1 font-semibold text-zinc-950">{value}</p>
    </div>
  );
}

function EditableInfoCard({
  label,
  placeholder,
  value,
  displayValue,
  isEditing,
  error,
  onEdit,
  onCancel,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  displayValue: string;
  isEditing: boolean;
  error?: string;
  onEdit: () => void;
  onCancel: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-xl bg-zinc-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase text-zinc-500">{label}</p>
        <button
          type="button"
          onClick={isEditing ? onCancel : onEdit}
          className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-950"
        >
          {isEditing ? (
            <>
              <X size={13} aria-hidden="true" />
              Huy
            </>
          ) : (
            <>
              <Pencil size={13} aria-hidden="true" />
              Sua
            </>
          )}
        </button>
      </div>

      {isEditing ? (
        <div className="mt-2">
          <Input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            aria-label={label}
            aria-invalid={Boolean(error)}
          />
          {error ? (
            <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
          ) : null}
        </div>
      ) : (
        <p className="mt-1 font-semibold text-zinc-950">{displayValue}</p>
      )}
    </div>
  );
}
