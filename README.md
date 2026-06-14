# Mini Task Manager

Aplikasi sederhana untuk mengelola task dengan audit log. Dibangun menggunakan React + TypeScript (frontend) dan Express + TypeScript (backend).

## Cara Menjalankan

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend akan berjalan di `http://localhost:3001`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`.

## Arsitektur

```
tht-Qonflo-fullstack/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Entry point, setup Express server
│   │   ├── types.ts          # Type definitions & status transition rules
│   │   ├── store.ts          # JSON file persistence layer
│   │   ├── controllers/      # Request handlers & business logic
│   │   │   └── tasks.ts
│   │   └── routes/           # API route definitions
│   │       └── tasks.ts
│   └── data/
│       └── store.json        # Persistent data storage
├── frontend/
│   └── src/
│       ├── App.tsx           # Main component, state management
│       ├── api.ts            # API client functions
│       ├── types.ts          # Shared type definitions
│       └── components/
│           ├── TaskForm.tsx       # Create task form
│           ├── TaskItem.tsx       # Individual task card
│           └── AuditLogModal.tsx  # Audit log modal view
└── README.md
```

**Backend** menggunakan arsitektur sederhana: routes → controllers → store. Semua validasi bisnis (transisi status, idempotency) dilakukan di controller. Data disimpan di file JSON (`data/store.json`).

**Frontend** menggunakan React dengan state management sederhana (useState/useEffect). Komunikasi dengan backend melalui fetch API. UI menampilkan task list, form create task, dropdown actor, dan modal audit log.

## Asumsi

1. **Tidak ada autentikasi** — actor dipilih melalui dropdown hardcoded di frontend. Siapa pun yang memiliki akses ke aplikasi bisa memilih actor mana saja.
2. **Single-user environment** — aplikasi ini diasumsikan digunakan oleh satu orang atau tim kecil secara internal, bukan untuk publik.
3. **Data persistence** — JSON file cukup untuk skala kecil. Jika aplikasi berkembang, database sebaiknya digunakan.
4. **Status flow linier** — task hanya bisa berpindah satu langkah ke depan: `to_do → pending → in_progress → done`. Tidak bisa mundur atau melompat.
5. **Delete task tidak menghapus audit log** — saat task dihapus, audit log tetap tersimpan di file (orphaned) untuk menjaga integritas riwayat.

## Trade-off

1. **JSON file vs Database** — JSON file dipilih untuk kesederhanaan. Trade-off-nya adalah tidak ada concurrent write safety dan performa menurun seiring data bertambah. Untuk production, database (SQLite/PostgreSQL) lebih tepat.
2. **Synchronous file I/O** — menggunakan `readFileSync`/`writeFileSync` untuk simplicity. Ini blocking dan tidak ideal untuk high-concurrency, tapi cukup untuk use case internal tool.
3. **Hardcoded user list** — menghindari kompleksitas autentikasi. Trade-off-nya adalah tidak ada verifikasi identitas.
4. **No pagination** — semua task dan audit log dimuat sekaligus. Cukup untuk skala kecil, tapi perlu pagination jika data bertambah banyak.
5. **Delete tanpa cascade** — menghapus task tidak menghapus audit log terkait. Ini menjaga immutability audit log tapi meninggalkan orphaned data.

## Perbaikan Jika Ada Waktu Tambahan

1. **Database** — migrasi dari JSON file ke SQLite atau PostgreSQL untuk data integrity dan concurrent access yang lebih baik.
2. **Error handling yang lebih robust** — centralized error handling middleware, retry logic di frontend, dan user-friendly error messages.
3. **Unit & integration tests** — menambahkan test untuk validasi transisi status, idempotency, dan API endpoints.
4. **Audit log cleanup** — mekanisme untuk membersihkan orphaned audit log ketika task dihapus, atau cascade delete dengan soft delete.
5. **Optimistic UI updates** — frontend langsung update UI sebelum response dari backend, dengan rollback jika gagal.
6. **Pagination & filtering** — menambahkan pagination untuk task list dan audit log, serta filter berdasarkan status.
7. **WebSocket/real-time updates** — jika digunakan banyak user, perubahan status bisa di-broadcast secara real-time.

---

## Jawaban Pertanyaan Wajib

### 1. Bagaimana kamu memastikan audit log tidak dapat dimodifikasi?

Audit log dirancang sebagai **append-only**. Di kode backend:

- Hanya ada fungsi `addAuditLog()` yang menambahkan log baru — **tidak ada** fungsi `updateAuditLog()` atau `deleteAuditLog()`.
- Routes hanya menyediakan endpoint `GET /tasks/:id/audit-logs` (read-only) — **tidak ada** endpoint PUT/DELETE untuk audit log.
- Audit log dibuat **bersamaan** dengan perubahan status task dalam satu operasi, memastikan konsistensi data.
- Di level storage, audit log disimpan di array yang hanya di-push, tidak pernah di-splice atau di-overwrite.

### 2. Bagian mana dari solusi ini yang paling berisiko jika digunakan oleh banyak user?

**JSON file storage dengan synchronous I/O** adalah risiko terbesar:

- **Race condition** — `readFileSync` + `writeFileSync` tidak atomic. Jika dua request datang bersamaan, perubahan dari request pertama bisa ter-overwrite oleh request kedua (lost update).
- **Blocking I/O** — synchronous file operations memblokir event loop Node.js, membuat server tidak bisa memproses request lain saat sedang menulis file.
- **No concurrent write safety** — tidak ada locking mechanism, sehingga data corruption mungkin terjadi saat multiple users mengubah status secara bersamaan.

Solusi: migrasi ke database dengan proper transaction support dan connection pooling.

### 3. Jika sistem berkembang menjadi lebih besar, bagian mana yang akan direfactor terlebih dahulu dan mengapa?

**Storage layer (JSON file → Database)** — karena:

1. Ini adalah fondasi data integrity. Tanpa database, audit log dan task status tidak bisa dijamin konsisten saat concurrent access.
2. Perubahan ini berdampak paling luas — hampir semua operasi CRUD terpengaruh.
3. Database memberikan kemampuan yang dibutuhkan untuk scaling: indexing, pagination, transactions, dan query optimization.
4. Refactor di bagian ini sebaiknya dilakukan sebelum menambahkan fitur lain, karena perubahan schema di kemudian hari akan lebih mahal.

### 4. Jika menggunakan AI, bagian mana yang dibantu AI dan bagaimana cara memvalidasi hasilnya?

**Bagian yang dibantu AI:**

- **Scaffolding & boilerplate** — setup project structure, TypeScript config, Express server template, dan Vite React template.
- **Type definitions** — AI membantu mendefinisikan interface dan type yang konsisten antara frontend dan backend.
- **API client code** — AI membantu generate fungsi fetch dengan error handling yang proper.
- **CSS styling** — AI membantu membuat stylesheet yang bersih dan responsive.
- **README writing** — AI membantu menyusun dokumentasi yang terstruktur.

**Cara validasi:**

- **Manual testing dengan curl** — setiap endpoint di-test secara manual sebelum melanjutkan ke frontend (create task, update status, invalid transition, idempotent check, audit log retrieval).
- **Code review** — setiap file yang di-generate AI dibaca dan dipahami logikanya sebelum diterima. Tidak ada kode yang di-accept tanpa dipahami.
- **TypeScript compiler** — `tsc --noEmit` digunakan untuk memverifikasi tidak ada type error.
- **End-to-end testing** — menjalankan backend dan frontend bersamaan, lalu test alur lengkap dari UI (create task → change status → view audit log).
