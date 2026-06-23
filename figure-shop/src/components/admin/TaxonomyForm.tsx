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
          <label className="text-sm font-medium">Ten</label>
          <Input
            name="name"
            required
            defaultValue={item?.name}
            placeholder="Scale Figure"
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
        <label className="text-sm font-medium">Mo ta</label>
        <Textarea
          name="description"
          rows={4}
          defaultValue={item?.description ?? ""}
          placeholder="Mo ta ngan"
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}