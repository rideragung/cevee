<!-- context7 -->
Use Context7 MCP to fetch current documentation whenever the user asks about a library, framework, SDK, API, CLI tool, or cloud service — even well-known ones like React, Next.js, Prisma, Express, Tailwind, Django, or Spring Boot. This includes API syntax, configuration, version migration, library-specific debugging, setup instructions, and CLI tool usage. Use even when you think you know the answer — your training data may not reflect recent changes. Prefer this over web search for library docs.

Do not use for: refactoring, writing scripts from scratch, debugging business logic, code review, or general programming concepts.

## Steps

1. Always start with `resolve-library-id` using the library name and what to look up in the library's documentation, unless the user provides an exact library ID in `/org/project` format
2. Pick the best match (ID format: `/org/project`) by: exact name match, description relevance, code snippet count, source reputation (High/Medium preferred), and benchmark score (higher is better). If results don't look right, try alternate names or queries (e.g., "next.js" not "nextjs", or rephrase the question). Use version-specific IDs when the user mentions a version
3. `query-docs` with the selected library ID and what to look up in the library's documentation (not single words), scoped to a single concept. If the question spans multiple distinct concepts (e.g. routing and auth and caching), make a separate `query-docs` call per concept with the same library ID, unless the question is about how the concepts interact — combined queries dilute ranking and return shallow results for each topic
4. Answer using the fetched docs
<!-- context7 -->

<!-- ui-rules:start -->
## UI & Design Workflow

Setiap tugas UI/frontend (buat halaman, komponen, redesign, styling), wajib ikuti alur ini:

1. **Referensi Desain (Mobbin MCP)**:
   - Sebelum coding atau styling, selalu cari referensi flow/layar relevan di Mobbin.
   - Gunakan `mobbin_search_screens` (untuk screen/komponen) atau `mobbin_search_flows` (untuk user journey/flow).
   - Jadikan pola visual dan UX dari hasil pencarian sebagai rujukan struktur.

2. **Design System (Better Design MCP)**:
   - Kunci design system ke **Pillow Light** (`id: pillow-light`).
   - Jangan tanyakan pilihan katalog ke user; langsung gunakan `pillow-light`.
   - Jalankan `get-ui-principle` sebelum styling dan `get-ux-principle` sebelum logic interaksi.
   - Gunakan komponen/token dari `pillow-light`.

3. **Review Wajib**:
   - Jalankan `get-review-rules` dan `check-comprehension` setelah implementasi.
   - Perbaiki isu critical dan serious sebelum serahkan hasil.
<!-- ui-rules:end -->

<!-- doc-sync:start -->
## Aturan Sinkronisasi Dokumen

Setiap kali melakukan perubahan kode atau fitur, wajib update dokumen terkait sebelum tugas selesai:
1. **SRS.md**: Update jika ada perubahan alur, fungsionalitas, atau requirement fitur.
2. **DESIGN.md**: Update jika ada perubahan UI/UX, token visual, styling, atau struktur komponen.
3. **PDF_FORMATTING_SPEC.md**: Update jika ada perubahan rendering, layout, atau export PDF.
4. **README.md**: Update jika ada perubahan setup env, dependency baru, atau skrip build/run.
<!-- doc-sync:end -->

