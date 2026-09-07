import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

type TaxonomyFormProps = {
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  item?: {
    name: string;
    slug: string;
    description: string | null;
  } | null;
};

export function TaxonomyForm({
  action,
  submitLabel,
  item,
}: TaxonomyFormProps) {
  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Tên</label>
          <Input
            name="name"
            required
            defaultValue={item?.name}
            placeholder="Mô hình tỉ lệ"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Slug</label>
          <Input
            name="slug"
            required
            defaultValue={item?.slug}
            placeholder="scale-figure"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Mô tả</label>
        <Textarea
          name="description"
          rows={4}
          defaultValue={item?.description ?? ""}
          placeholder="Mô tả ngắn"
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
