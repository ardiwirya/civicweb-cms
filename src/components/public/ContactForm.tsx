import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

const contactSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Subjek minimal 3 karakter"),
  message: z.string().min(10, "Pesan minimal 10 karakter"),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  async function onSubmit(values: ContactForm) {
    setSubmitError(null);
    const { error } = await supabase.from("contact_messages").insert(values);

    if (error) {
      setSubmitError("Pesan gagal dikirim, silakan coba lagi.");
      return;
    }

    setSubmitted(true);
    reset();
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-brand-primary/30 bg-brand-primary/5 p-4 text-sm text-slate-700">
        Terima kasih, pesan Anda sudah terkirim. Kami akan segera merespons.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-slate-700 dark:text-slate-300">Nama</label>
          <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" {...register("name")} />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-700 dark:text-slate-300">Email</label>
          <input type="email" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" {...register("email")} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-700 dark:text-slate-300">No. Telepon (opsional)</label>
        <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" {...register("phone")} />
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-700 dark:text-slate-300">Subjek</label>
        <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" {...register("subject")} />
        {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-700 dark:text-slate-300">Pesan</label>
        <textarea rows={4} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" {...register("message")} />
        {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>}
      </div>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {isSubmitting ? "Mengirim..." : "Kirim Pesan"}
      </button>
    </form>
  );
}
