"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Images } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { roleHome, useAuth } from "@/components/providers/auth-provider";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { EmptyState, Skeleton } from "@/components/ui/feedback";
import { Modal } from "@/components/ui/modal";
import { Crest } from "@/components/ui/logo";
import { Tabs } from "@/components/ui/tabs";
import { useFetch } from "@/hooks/use-fetch";
import { SCHOOL_NAME } from "@/lib/config";
import { fmtDate } from "@/lib/format";
import type { GalleryAlbum, GalleryImage, Notice, SchoolContent } from "@/lib/types";
import Footer from "@/components/layout/footer";

function Header() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <Crest className="size-8" />
          <span className="font-display text-xl font-semibold">{SCHOOL_NAME}</span>
        </Link>
        <nav className="flex items-center gap-1">
          <a href="#notices" className="btn btn-ghost btn-sm hidden sm:inline-flex">Notices</a>
          <a href="#gallery" className="btn btn-ghost btn-sm hidden sm:inline-flex">Gallery</a>
          <ThemeToggle />
          {user ? (
            <Link href={roleHome(user.role)} className="btn btn-primary btn-sm ml-1">Open dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary btn-sm ml-1">Sign in</Link>
              <Link href="/register" className="btn btn-primary btn-sm hidden sm:inline-flex">Request an account</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function NoticeBoard() {
  const { data, loading } = useFetch<Notice[]>("/notice");
  const notices = data ?? [];
  return (
    <div id="notices" className="card relative p-6 sm:p-7">
      <span className="absolute -top-2 left-8 size-4 rounded-full bg-gold shadow-sm ring-4 ring-bg" aria-hidden />
      <h2 className="font-display text-2xl font-semibold">Notice board</h2>
      <p className="mt-1 text-sm text-muted">Current announcements from the school office.</p>
      <div className="mt-5 space-y-3">
        {loading && [0, 1, 2].map((i) => <Skeleton key={i} className="h-20" />)}
        {!loading && notices.length === 0 && <EmptyState title="Nothing posted right now" description="New admission and school notices will appear here." />}
        {notices.slice(0, 4).map((n, i) => (
          <motion.article
            key={n.id}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 + i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-xl border border-border bg-surface-2 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold leading-snug">{n.title}</h3>
              <time className="shrink-0 text-xs text-muted">{fmtDate(n.publishedAt)}</time>
            </div>
            <p className="clamp-3 mt-1.5 text-sm leading-relaxed text-muted">{n.content}</p>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

function Gallery() {
  const { data, loading } = useFetch<GalleryAlbum[]>("/gallery-albums");
  const albums = data ?? [];
  const [active, setActive] = useState("all");
  const [open, setOpen] = useState<GalleryImage | null>(null);

  const images = useMemo(() => (active === "all" ? albums.flatMap((a) => a.images) : (albums.find((a) => a.id === active)?.images ?? [])), [albums, active]);

  return (
    <section id="gallery" className="mx-auto max-w-6xl px-5 py-20">
      <h2 className="font-display text-3xl font-semibold sm:text-4xl">Around the school</h2>
      <p className="mt-2 max-w-xl text-muted">Moments from classrooms, events and the playground.</p>
      {loading && <Skeleton className="mt-8 h-64" />}
      {!loading && albums.length === 0 && (
        <div className="card mt-8">
          <EmptyState icon={<Images className="size-5" />} title="No photos yet" description="Albums will show up here once the school adds them." />
        </div>
      )}
      {albums.length > 0 && (
        <>
          <Tabs id="gallery" className="mt-6" value={active} onChange={setActive} items={[{ value: "all", label: "All" }, ...albums.map((a) => ({ value: a.id, label: a.name, count: a.images.length }))]} />
          <div className="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3">
            <AnimatePresence mode="popLayout">
              {images.map((img) => (
                <motion.button
                  layout
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setOpen(img)}
                  className="group mb-4 block w-full overflow-hidden rounded-xl border border-border bg-surface-2 text-left"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.imageUrl} alt={img.title ?? "School photo"} loading="lazy" className="w-full transition-transform duration-500 group-hover:scale-[1.03]" />
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.title ?? "Photo"} description={open?.description ?? undefined} width="max-w-3xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {open && <img src={open.imageUrl} alt={open.title ?? "School photo"} className="mx-auto max-h-[65vh] rounded-lg" />}
      </Modal>
    </section>
  );
}

export default function LandingPage() {
  const content = useFetch<SchoolContent | null>("/admin/content");
  const message = content.data?.headTeacherMessage;

  return (
    <>
      <Header />
      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-16 lg:grid-cols-[1.1fr_1fr] lg:pt-24">
          <div>
            <motion.h1 className="font-display text-5xl font-medium leading-[1.05] sm:text-6xl" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              Every student, known by name.
            </motion.h1>
            <motion.p className="mt-6 max-w-lg text-lg leading-relaxed text-muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.6 }}>
              {SCHOOL_NAME} keeps attendance, assignments, results and notices in one calm place, so students and families always know where things stand.
            </motion.p>
            <motion.div className="mt-9 flex flex-wrap gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45, duration: 0.6 }}>
              <Link href="/login" className="btn btn-primary">Sign in</Link>
              <Link href="/register" className="btn btn-secondary">Request an account</Link>
            </motion.div>
          </div>
          <NoticeBoard />
        </section>

        
        {message && (
          <section className="border-y border-border bg-surface-2">
            <div className="mx-auto max-w-4xl px-5 py-20 text-center">
              <h2 className="text-sm font-semibold text-gold">From the head teacher</h2>
              <blockquote className="mt-6 whitespace-pre-line font-display text-2xl font-normal italic leading-relaxed sm:text-3xl">{message}</blockquote>
            </div>
          </section>
        )}

        <Gallery />
      </main>
      <Footer/>
    </>
  );
}
