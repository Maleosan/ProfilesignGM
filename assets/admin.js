(() => {
  "use strict";

  const records = new Map();
  let settings = { companyName: "Swiss-Belhotel Maleosan Manado", logo: "assets/logo.png" };
  let logoSource = { kind: "url", value: "assets/logo.png" };
  let previewUrls = [];

  const elements = {
    employeeForm: document.getElementById("employeeForm"),
    originalSlug: document.getElementById("originalSlug"),
    name: document.getElementById("employeeName"),
    slug: document.getElementById("employeeSlug"),
    position: document.getElementById("employeePosition"),
    profileFile: document.getElementById("profileFile"),
    signatureFile: document.getElementById("signatureFile"),
    profileStatus: document.getElementById("profileStatus"),
    signatureStatus: document.getElementById("signatureStatus"),
    employeeMessage: document.getElementById("employeeMessage"),
    employeeList: document.getElementById("employeeList"),
    newEmployee: document.getElementById("newEmployee"),
    previewEmployee: document.getElementById("previewEmployee"),
    exportEmployees: document.getElementById("exportEmployees"),
    exportAll: document.getElementById("exportAll"),
    settingsForm: document.getElementById("settingsForm"),
    companyName: document.getElementById("companyName"),
    logoFile: document.getElementById("logoFile"),
    logoStatus: document.getElementById("logoStatus"),
    settingsMessage: document.getElementById("settingsMessage"),
    previewSettings: document.getElementById("previewSettings"),
    previewDialog: document.getElementById("previewDialog"),
    previewFrame: document.getElementById("previewFrame"),
    closePreview: document.getElementById("closePreview"),
  };

  const setMessage = (element, message, isError = false) => {
    element.textContent = message;
    element.classList.toggle("is-error", isError);
  };

  const validSlug = (slug) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const sourceFromPath = (path) => (path ? { kind: "url", value: path } : null);
  const sourceFromFile = (file) => (file ? { kind: "file", value: file } : null);

  const getSourceUrl = (source) => {
    if (!source) return "";
    if (source.kind === "url") return new URL(source.value, window.location.href).href;
    const url = URL.createObjectURL(source.value);
    previewUrls.push(url);
    return url;
  };

  const clearPreviewUrls = () => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    previewUrls = [];
  };

  const resetEmployeeForm = () => {
    elements.employeeForm.reset();
    elements.originalSlug.value = "";
    elements.profileStatus.textContent = "Belum ada file.";
    elements.signatureStatus.textContent = "Belum ada file.";
    setMessage(elements.employeeMessage, "");
    elements.name.focus();
  };

  const editEmployee = (slug) => {
    const record = records.get(slug);
    if (!record) return;
    elements.originalSlug.value = slug;
    elements.name.value = record.name;
    elements.slug.value = slug;
    elements.position.value = record.position;
    elements.profileFile.value = "";
    elements.signatureFile.value = "";
    elements.profileStatus.textContent = record.profileSource
      ? "Menggunakan foto yang tersimpan."
      : "Foto belum tersedia.";
    elements.signatureStatus.textContent = record.signatureSource
      ? "Menggunakan tanda tangan yang tersimpan."
      : "Tanda tangan belum tersedia.";
    setMessage(elements.employeeMessage, `Mengedit ${record.name}.`);
    elements.employeeForm.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const renderEmployeeList = () => {
    const items = [...records.entries()].map(([slug, record]) => {
      const item = document.createElement("div");
      item.className = "employee-item";

      const info = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = record.name;
      const meta = document.createElement("small");
      meta.textContent = `${record.position} · /${slug}`;
      info.append(name, meta);

      const button = document.createElement("button");
      button.className = "edit-button";
      button.type = "button";
      button.textContent = "Edit";
      button.addEventListener("click", () => editEmployee(slug));

      item.append(info, button);
      return item;
    });
    elements.employeeList.replaceChildren(...items);
  };

  const readEmployeeDraft = ({ requireImages = false } = {}) => {
    const name = elements.name.value.trim();
    const slug = elements.slug.value.trim().toLowerCase();
    const position = elements.position.value.trim();
    const originalSlug = elements.originalSlug.value;
    const existing = originalSlug ? records.get(originalSlug) : null;

    if (!name || !slug || !position) throw new Error("Nama, slug, dan jabatan wajib diisi.");
    if (!validSlug(slug)) throw new Error("Slug hanya boleh memakai huruf kecil, angka, dan tanda hubung.");
    if (records.has(slug) && slug !== originalSlug) throw new Error("Slug sudah digunakan karyawan lain.");

    const profileSource = sourceFromFile(elements.profileFile.files[0]) || existing?.profileSource || null;
    const signatureSource = sourceFromFile(elements.signatureFile.files[0]) || existing?.signatureSource || null;

    if (requireImages && (!profileSource || !signatureSource)) {
      throw new Error("Foto profil dan tanda tangan harus tersedia sebelum export.");
    }

    return { name, slug, position, originalSlug, profileSource, signatureSource };
  };

  const saveEmployeeDraft = (options = {}) => {
    const draft = readEmployeeDraft(options);
    if (draft.originalSlug && draft.originalSlug !== draft.slug) records.delete(draft.originalSlug);
    records.set(draft.slug, {
      name: draft.name,
      position: draft.position,
      profileSource: draft.profileSource,
      signatureSource: draft.signatureSource,
    });
    elements.originalSlug.value = draft.slug;
    renderEmployeeList();
    return draft.slug;
  };

  const serializedEmployees = () =>
    Object.fromEntries(
      [...records.entries()].map(([slug, record]) => [
        slug,
        {
          name: record.name,
          position: record.position,
          profile: record.profileSource ? `assets/employees/${slug}/profile.jpg` : "",
          signature: record.signatureSource ? `assets/employees/${slug}/signature.png` : "",
        },
      ])
    );

  const updateSettingsDraft = () => {
    const companyName = elements.companyName.value.trim();
    if (!companyName) throw new Error("Company Name wajib diisi.");
    settings = { companyName, logo: "assets/logo.png" };
    const selectedLogo = sourceFromFile(elements.logoFile.files[0]);
    if (selectedLogo) logoSource = selectedLogo;
  };

  const sourceToBlob = async (source) => {
    if (!source) return null;
    if (source.kind === "file") return source.value;
    const response = await fetch(source.value, { cache: "no-store" });
    if (!response.ok) throw new Error(`Aset tidak dapat dimuat: ${source.value}`);
    return response.blob();
  };

  const blobToImage = (blob) =>
    new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("File gambar tidak dapat diproses."));
      };
      image.src = url;
    });

  const normalizeImage = async (source, outputType, maxDimension) => {
    const blob = await sourceToBlob(source);
    if (!blob) return null;
    if (source.kind === "url") return blob;

    const image = await blobToImage(blob);
    const ratio = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * ratio));
    const height = Math.max(1, Math.round(image.naturalHeight * ratio));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (outputType === "image/jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
    }
    context.drawImage(image, 0, 0, width, height);
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error("Gambar gagal dikonversi."))),
        outputType,
        outputType === "image/jpeg" ? 0.88 : undefined
      );
    });
  };

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const downloadJson = (value, filename) => {
    const content = `${JSON.stringify(value, null, 2)}\n`;
    downloadBlob(new Blob([content], { type: "application/json" }), filename);
  };

  const routeTemplate = (slug) => `<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#0b1525">
    <meta name="description" content="Profil dan tanda tangan karyawan.">
    <title>Profile &amp; Signature</title>
    <link rel="stylesheet" href="../assets/profile.css">
    <script src="../assets/profile.js" defer><\/script>
  </head>
  <body data-employee-slug="${slug}">
    <div class="profile-app" id="profileApp" aria-busy="true">
      <div class="loading-screen">Memuat profile…</div>
    </div>
  </body>
</html>
`;

  const crcTable = (() => {
    const table = new Uint32Array(256);
    for (let index = 0; index < 256; index += 1) {
      let value = index;
      for (let bit = 0; bit < 8; bit += 1) {
        value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
      }
      table[index] = value >>> 0;
    }
    return table;
  })();

  const crc32 = (bytes) => {
    let crc = 0xffffffff;
    for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  };

  const zipDateTime = (date = new Date()) => ({
    time: ((date.getHours() & 31) << 11) | ((date.getMinutes() & 63) << 5) | ((date.getSeconds() / 2) & 31),
    date: (((date.getFullYear() - 1980) & 127) << 9) | (((date.getMonth() + 1) & 15) << 5) | (date.getDate() & 31),
  });

  const asBytes = async (value) => {
    if (value instanceof Uint8Array) return value;
    if (value instanceof Blob) return new Uint8Array(await value.arrayBuffer());
    return new TextEncoder().encode(String(value));
  };

  const buildZip = async (entries) => {
    const localParts = [];
    const centralParts = [];
    let offset = 0;
    const stamp = zipDateTime();

    for (const [filename, value] of entries) {
      const name = new TextEncoder().encode(filename.replaceAll("\\", "/"));
      const data = await asBytes(value);
      const checksum = crc32(data);

      const local = new Uint8Array(30 + name.length + data.length);
      const localView = new DataView(local.buffer);
      localView.setUint32(0, 0x04034b50, true);
      localView.setUint16(4, 20, true);
      localView.setUint16(6, 0x0800, true);
      localView.setUint16(8, 0, true);
      localView.setUint16(10, stamp.time, true);
      localView.setUint16(12, stamp.date, true);
      localView.setUint32(14, checksum, true);
      localView.setUint32(18, data.length, true);
      localView.setUint32(22, data.length, true);
      localView.setUint16(26, name.length, true);
      localView.setUint16(28, 0, true);
      local.set(name, 30);
      local.set(data, 30 + name.length);
      localParts.push(local);

      const central = new Uint8Array(46 + name.length);
      const centralView = new DataView(central.buffer);
      centralView.setUint32(0, 0x02014b50, true);
      centralView.setUint16(4, 20, true);
      centralView.setUint16(6, 20, true);
      centralView.setUint16(8, 0x0800, true);
      centralView.setUint16(10, 0, true);
      centralView.setUint16(12, stamp.time, true);
      centralView.setUint16(14, stamp.date, true);
      centralView.setUint32(16, checksum, true);
      centralView.setUint32(20, data.length, true);
      centralView.setUint32(24, data.length, true);
      centralView.setUint16(28, name.length, true);
      centralView.setUint16(30, 0, true);
      centralView.setUint16(32, 0, true);
      centralView.setUint16(34, 0, true);
      centralView.setUint16(36, 0, true);
      centralView.setUint32(38, 0, true);
      centralView.setUint32(42, offset, true);
      central.set(name, 46);
      centralParts.push(central);
      offset += local.length;
    }

    const centralSize = centralParts.reduce((total, part) => total + part.length, 0);
    const end = new Uint8Array(22);
    const endView = new DataView(end.buffer);
    endView.setUint32(0, 0x06054b50, true);
    endView.setUint16(4, 0, true);
    endView.setUint16(6, 0, true);
    endView.setUint16(8, entries.length, true);
    endView.setUint16(10, entries.length, true);
    endView.setUint32(12, centralSize, true);
    endView.setUint32(16, offset, true);
    endView.setUint16(20, 0, true);

    return new Blob([...localParts, ...centralParts, end], { type: "application/zip" });
  };

  const employeeEntries = async (slug, record) => {
    const entries = [
      [`${slug}/index.html`, routeTemplate(slug)],
      ["employee.json", `${JSON.stringify({ [slug]: serializedEmployees()[slug] }, null, 2)}\n`],
      ["settings.json", `${JSON.stringify(settings, null, 2)}\n`],
    ];
    if (record.profileSource) {
      entries.push([
        `assets/employees/${slug}/profile.jpg`,
        await normalizeImage(record.profileSource, "image/jpeg", 1600),
      ]);
    }
    if (record.signatureSource) {
      entries.push([
        `assets/employees/${slug}/signature.png`,
        await normalizeImage(record.signatureSource, "image/png", 1600),
      ]);
    }
    if (logoSource) entries.push(["assets/logo.png", await normalizeImage(logoSource, "image/png", 1000)]);
    return entries;
  };

  const exportEmployee = async (slug) => {
    updateSettingsDraft();
    const record = records.get(slug);
    const zip = await buildZip(await employeeEntries(slug, record));
    downloadBlob(zip, `${slug}-profile.zip`);
  };

  const exportAll = async () => {
    updateSettingsDraft();
    const entries = [
      ["employees.json", `${JSON.stringify(serializedEmployees(), null, 2)}\n`],
      ["settings.json", `${JSON.stringify(settings, null, 2)}\n`],
    ];

    if (logoSource) entries.push(["assets/logo.png", await normalizeImage(logoSource, "image/png", 1000)]);

    for (const [slug, record] of records) {
      entries.push([`${slug}/index.html`, routeTemplate(slug)]);
      if (record.profileSource) {
        entries.push([
          `assets/employees/${slug}/profile.jpg`,
          await normalizeImage(record.profileSource, "image/jpeg", 1600),
        ]);
      }
      if (record.signatureSource) {
        entries.push([
          `assets/employees/${slug}/signature.png`,
          await normalizeImage(record.signatureSource, "image/png", 1600),
        ]);
      }
    }

    downloadBlob(await buildZip(entries), "profilesigngm-export-all.zip");
  };

  const previewDocument = ({ name, position, profileUrl, signatureUrl, logoUrl, companyName }) => {
    const cssUrl = new URL("assets/profile.css", window.location.href).href;
    const profileMarkup = profileUrl
      ? `<img class="profile-image" src="${escapeHtml(profileUrl)}" alt="Foto profil ${escapeHtml(name)}" draggable="false">`
      : '<div class="profile-missing">Foto profil belum tersedia</div>';
    const signatureMarkup = signatureUrl
      ? `<img class="signature-image" src="${escapeHtml(signatureUrl)}" alt="Tanda tangan ${escapeHtml(name)}" draggable="false">`
      : '<div class="signature-missing">Tanda tangan belum tersedia</div>';

    return `<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <link rel="stylesheet" href="${cssUrl}">
  </head>
  <body>
    <main class="profile-app">
      <div class="viewer" id="viewer" role="button" tabindex="0" aria-label="Tampilkan tanda tangan">
        <div class="image-frame">${profileMarkup}</div>
        <div class="image-frame" id="signatureFrame" aria-hidden="true">
          <section class="signature-card">
            <div class="signature-art">${signatureMarkup}</div>
            <div class="identity">
              <img class="brand-logo" src="${escapeHtml(logoUrl)}" alt="Logo perusahaan" draggable="false">
              <h1 class="employee-name">${escapeHtml(name)}</h1>
              <p class="employee-title">${escapeHtml(position)}<br><span class="company-name">${escapeHtml(companyName)}</span></p>
            </div>
          </section>
        </div>
      </div>
    </main>
    <script>
      (() => {
        const viewer = document.getElementById("viewer");
        const frame = document.getElementById("signatureFrame");
        let done = false;
        const show = () => {
          if (done) return;
          done = true;
          frame.setAttribute("aria-hidden", "false");
          viewer.classList.add("is-signature");
        };
        const timer = setTimeout(show, 2500);
        viewer.addEventListener("click", () => { clearTimeout(timer); show(); });
        viewer.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            clearTimeout(timer);
            show();
          }
        });
      })();
    <\/script>
  </body>
</html>`;
  };

  const openPreview = (record) => {
    updateSettingsDraft();
    clearPreviewUrls();
    elements.previewFrame.srcdoc = previewDocument({
      name: record.name,
      position: record.position,
      profileUrl: getSourceUrl(record.profileSource),
      signatureUrl: getSourceUrl(record.signatureSource),
      logoUrl: getSourceUrl(logoSource),
      companyName: settings.companyName,
    });
    elements.previewDialog.showModal();
  };

  const initialize = async () => {
    const [employeeData, settingsData] = await Promise.all([
      fetch("employees.json", { cache: "no-store" }).then((response) => {
        if (!response.ok) throw new Error("employees.json tidak dapat dimuat");
        return response.json();
      }),
      fetch("settings.json", { cache: "no-store" }).then((response) => {
        if (!response.ok) throw new Error("settings.json tidak dapat dimuat");
        return response.json();
      }),
    ]);

    settings = settingsData;
    logoSource = sourceFromPath(settings.logo);
    elements.companyName.value = settings.companyName;

    Object.entries(employeeData).forEach(([slug, employee]) => {
      records.set(slug, {
        name: employee.name,
        position: employee.position,
        profileSource: sourceFromPath(employee.profile),
        signatureSource: sourceFromPath(employee.signature),
      });
    });

    renderEmployeeList();
    if (records.has("michael")) editEmployee("michael");
  };

  elements.profileFile.addEventListener("change", () => {
    elements.profileStatus.textContent = elements.profileFile.files[0]?.name || "Belum ada file.";
  });

  elements.signatureFile.addEventListener("change", () => {
    elements.signatureStatus.textContent = elements.signatureFile.files[0]?.name || "Belum ada file.";
  });

  elements.logoFile.addEventListener("change", () => {
    elements.logoStatus.textContent = elements.logoFile.files[0]?.name || "Menggunakan logo saat ini.";
  });

  elements.newEmployee.addEventListener("click", resetEmployeeForm);

  elements.previewEmployee.addEventListener("click", () => {
    try {
      const draft = readEmployeeDraft();
      openPreview(draft);
      setMessage(elements.employeeMessage, "Preview dibuka.");
    } catch (error) {
      setMessage(elements.employeeMessage, error.message, true);
    }
  });

  elements.employeeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      setMessage(elements.employeeMessage, "Menyiapkan file export…");
      const slug = saveEmployeeDraft({ requireImages: true });
      await exportEmployee(slug);
      setMessage(elements.employeeMessage, "Employee berhasil disimpan dan diekspor.");
    } catch (error) {
      console.error(error);
      setMessage(elements.employeeMessage, error.message, true);
    }
  });

  elements.exportEmployees.addEventListener("click", () => {
    downloadJson(serializedEmployees(), "employees.json");
    setMessage(elements.employeeMessage, "employees.json berhasil diekspor.");
  });

  elements.exportAll.addEventListener("click", async () => {
    try {
      setMessage(elements.employeeMessage, "Menyiapkan Export All…");
      await exportAll();
      setMessage(elements.employeeMessage, "Export All berhasil dibuat.");
    } catch (error) {
      console.error(error);
      setMessage(elements.employeeMessage, error.message, true);
    }
  });

  elements.previewSettings.addEventListener("click", () => {
    try {
      updateSettingsDraft();
      let record;
      try {
        record = readEmployeeDraft();
      } catch {
        record = records.get("michael") || records.values().next().value;
      }
      if (!record) throw new Error("Tambahkan minimal satu karyawan untuk preview.");
      openPreview(record);
      setMessage(elements.settingsMessage, "Preview pengaturan dibuka.");
    } catch (error) {
      setMessage(elements.settingsMessage, error.message, true);
    }
  });

  elements.settingsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      updateSettingsDraft();
      const entries = [["settings.json", `${JSON.stringify(settings, null, 2)}\n`]];
      if (logoSource) entries.push(["assets/logo.png", await normalizeImage(logoSource, "image/png", 1000)]);
      downloadBlob(await buildZip(entries), "company-settings.zip");
      setMessage(elements.settingsMessage, "Company Settings berhasil diekspor.");
    } catch (error) {
      console.error(error);
      setMessage(elements.settingsMessage, error.message, true);
    }
  });

  elements.closePreview.addEventListener("click", () => elements.previewDialog.close());
  elements.previewDialog.addEventListener("close", () => {
    elements.previewFrame.srcdoc = "";
    clearPreviewUrls();
  });

  initialize().catch((error) => {
    console.error(error);
    setMessage(elements.employeeMessage, "Data awal tidak dapat dimuat. Silakan refresh halaman.", true);
  });
})();
