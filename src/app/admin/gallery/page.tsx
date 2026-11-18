"use client";

import { ImagePlus, Images, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CardGridSkeleton, EmptyState, ErrorState } from "@/components/ui/feedback";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { ConfirmDialog, Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast";
import { useFetch } from "@/hooks/use-fetch";
import { api, errorMessage } from "@/lib/api";
import { slugify } from "@/lib/format";
import type { AdminGalleryCategory } from "@/lib/types";

export default function GalleryPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch<AdminGalleryCategory[]>("/admin/categories");
  const [newCat, setNewCat] = useState(false);
  const [catName, setCatName] = useState("");
  const [upload, setUpload] = useState(false);
  const [up, setUp] = useState({ categoryId: "", title: "", description: "" });
  const [file, setFile] = useState<File | null>(null);
  const [del, setDel] = useState<{ kind: "image" | "category"; id: string; label: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const categories = data ?? [];

  async function createCategory(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/admin/category", { name: catName.trim(), slug: slugify(catName) });
      toast.success(`${catName.trim()} album created.`);
      setCatName("");
      setNewCat(false);
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function uploadImage(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("Choose an image smaller than 5 MB.");
    setBusy(true);
    try {
      const form = new FormData();
      form.append("image", file);
      form.append("categoryId", up.categoryId);
      if (up.title.trim()) form.append("title", up.title.trim());
      if (up.description.trim()) form.append("description", up.description.trim());
      await api.upload("/admin/image", form);
      toast.success("Photo uploaded.");
      setUp({ categoryId: up.categoryId, title: "", description: "" });
      setFile(null);
      setUpload(false);
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!del) return;
    setBusy(true);
    try {
      await api.del(del.kind === "image" ? `/admin/image/${del.id}` : `/admin/category/${del.id}`);
      toast.success(del.kind === "image" ? "Photo deleted." : `${del.label} album deleted.`);
      setDel(null);
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Gallery"
        description="Albums and photos shown on the public home page."
        actions={
          <>
            <Button variant="secondary" icon={<Plus className="size-4" />} onClick={() => setNewCat(true)}>New album</Button>
            <Button icon={<ImagePlus className="size-4" />} disabled={categories.length === 0} onClick={() => { setUp((u) => ({ ...u, categoryId: u.categoryId || categories[0]?.id || "" })); setUpload(true); }}>Upload photo</Button>
          </>
        }
      />

      {loading ? (
        <CardGridSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : categories.length === 0 ? (
        <div className="card"><EmptyState icon={<Images className="size-5" />} title="No albums yet" description="Create an album first, then upload photos into it." action={<Button onClick={() => setNewCat(true)}>New album</Button>} /></div>
      ) : (
        <div className="space-y-8">
          {categories.map((c) => (
            <section key={c.id}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="font-display text-xl font-semibold">{c.name} <span className="text-base font-normal text-muted">({c.images.length})</span></h2>
                <Button size="sm" variant="ghost" className="!text-danger" icon={<Trash2 className="size-4" />} onClick={() => setDel({ kind: "category", id: c.id, label: c.name })}>Delete album</Button>
              </div>
              {c.images.length === 0 ? (
                <p className="card card-pad text-sm text-muted">No photos in this album yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {c.images.map((img) => (
                    <figure key={img.id} className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-surface-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.imageUrl} alt={img.title ?? "Gallery photo"} loading="lazy" className="size-full object-cover" />
                      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2.5 pt-8 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                        {img.title ?? ""}
                      </figcaption>
                      <button onClick={() => setDel({ kind: "image", id: img.id, label: img.title ?? "photo" })} className="absolute right-2 top-2 grid size-8 place-items-center rounded-lg bg-black/60 text-white opacity-0 backdrop-blur transition-opacity hover:bg-danger group-hover:opacity-100 focus-visible:opacity-100" aria-label="Delete photo">
                        <Trash2 className="size-4" />
                      </button>
                    </figure>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      <Modal open={newCat} onClose={() => setNewCat(false)} title="New album" footer={<><Button variant="secondary" onClick={() => setNewCat(false)}>Cancel</Button><Button type="submit" form="new-album" loading={busy}>Create album</Button></>}>
        <form id="new-album" onSubmit={createCategory}>
          <Field label="Album name" hint="For example Sports day or Science fair."><Input required value={catName} onChange={(e) => setCatName(e.target.value)} autoFocus /></Field>
        </form>
      </Modal>

      <Modal open={upload} onClose={() => setUpload(false)} title="Upload a photo" footer={<><Button variant="secondary" onClick={() => setUpload(false)}>Cancel</Button><Button type="submit" form="upload-photo" loading={busy} disabled={!file}>Upload</Button></>}>
        <form id="upload-photo" onSubmit={uploadImage} className="space-y-4">
          <Field label="Album">
            <Select required value={up.categoryId} onChange={(e) => setUp({ ...up, categoryId: e.target.value })}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <Field label="Image" hint="JPG, PNG or WebP, up to 5 MB."><input type="file" accept="image/*" required onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="field-input !h-auto py-2 file:mr-3 file:rounded-md file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-sm file:font-medium" /></Field>
          <Field label="Title" hint="Optional"><Input value={up.title} onChange={(e) => setUp({ ...up, title: e.target.value })} /></Field>
          <Field label="Description" hint="Optional"><Textarea rows={3} value={up.description} onChange={(e) => setUp({ ...up, description: e.target.value })} /></Field>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        onConfirm={confirmDelete}
        loading={busy}
        title={del?.kind === "category" ? `Delete the ${del.label} album?` : "Delete this photo?"}
        message={del?.kind === "category" ? "Every photo in the album is deleted with it. This cannot be undone." : "The photo is removed from the home page. This cannot be undone."}
        confirmLabel="Delete"
      />
    </>
  );
}
