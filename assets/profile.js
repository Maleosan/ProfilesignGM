(() => {
  "use strict";

  const HOLD_DURATION = 2500;
  const app = document.getElementById("profileApp");
  const slug = document.body.dataset.employeeSlug;
  const rootUrl = new URL("../", window.location.href);

  const resolveAsset = (path) => (path ? new URL(path, rootUrl).href : "");

  const waitForImage = (image) => {
    if (!image) return Promise.resolve();
    if (image.complete) {
      return image.naturalWidth > 0
        ? Promise.resolve()
        : Promise.reject(new Error(`Gambar gagal dimuat: ${image.src}`));
    }

    return new Promise((resolve, reject) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener(
        "error",
        () => reject(new Error(`Gambar gagal dimuat: ${image.src}`)),
        { once: true }
      );
    });
  };

  const renderNotFound = () => {
    document.title = "Profile Tidak Ditemukan";
    app.innerHTML = `
      <section class="not-found">
        <h1>Profile Tidak Ditemukan</h1>
        <p>Profile yang Anda cari tidak tersedia.</p>
        <a class="back-link" href="../">Kembali</a>
      </section>
    `;
    app.removeAttribute("aria-busy");
  };

  const createMissing = (className, message) => {
    const element = document.createElement("div");
    element.className = className;
    element.textContent = message;
    return element;
  };

  const renderProfile = async (employee, settings) => {
    const firstName = employee.name.trim().split(/\s+/)[0];
    document.title = `${settings.companyName}-${firstName}`;
    const favicon = document.createElement("link");
favicon.rel = "icon";
favicon.type = "image/png";
favicon.href = `${rootUrl}assets/logo.png`;
document.head.appendChild(favicon);

const appleIcon = document.createElement("link");
appleIcon.rel = "apple-touch-icon";
appleIcon.href = `${rootUrl}assets/logo.png`;
document.head.appendChild(appleIcon);

    const viewer = document.createElement("main");
    viewer.className = "viewer";
    viewer.id = "viewer";
    viewer.tabIndex = 0;
    viewer.setAttribute("role", "button");
    viewer.setAttribute("aria-label", "Tampilkan tanda tangan dan identitas karyawan");

    const profileFrame = document.createElement("div");
    profileFrame.className = "image-frame";

    let profileImage = null;
    if (employee.profile) {
      profileImage = document.createElement("img");
      profileImage.className = "profile-image";
      profileImage.src = resolveAsset(employee.profile);
      profileImage.alt = `Foto profil ${employee.name}`;
      profileImage.draggable = false;
      profileImage.decoding = "async";
      profileFrame.append(profileImage);
    } else {
      profileFrame.append(createMissing("profile-missing", "Foto profil belum tersedia"));
    }

    const signatureFrame = document.createElement("div");
    signatureFrame.className = "image-frame";
    signatureFrame.id = "signatureFrame";
    signatureFrame.setAttribute("aria-hidden", "true");

    const card = document.createElement("section");
    card.className = "signature-card";
    card.setAttribute("aria-label", `Identitas dan tanda tangan ${employee.name}`);

    const signatureArt = document.createElement("div");
    signatureArt.className = "signature-art";

    let signatureImage = null;
    if (employee.signature) {
      signatureImage = document.createElement("img");
      signatureImage.className = "signature-image";
      signatureImage.src = resolveAsset(employee.signature);
      signatureImage.alt = `Tanda tangan ${employee.name}`;
      signatureImage.draggable = false;
      signatureImage.decoding = "async";
      signatureArt.append(signatureImage);
    } else {
      signatureArt.append(createMissing("signature-missing", "Tanda tangan belum tersedia"));
    }

    const identity = document.createElement("div");
    identity.className = "identity";

    const logo = document.createElement("img");
    logo.className = "brand-logo";
    logo.src = resolveAsset(settings.logo);
    logo.alt = "Logo perusahaan";
    logo.draggable = false;
    logo.decoding = "async";

    const name = document.createElement("h1");
    name.className = "employee-name";
    name.textContent = employee.name;

    const title = document.createElement("p");
    title.className = "employee-title";
    title.append(document.createTextNode(employee.position), document.createElement("br"));
    const company = document.createElement("span");
    company.className = "company-name";
    company.textContent = settings.companyName;
    title.append(company);

    identity.append(logo, name, title);
    card.append(signatureArt, identity);
    signatureFrame.append(card);

    const fallback = document.createElement("p");
    fallback.className = "fallback";
    fallback.hidden = true;
    fallback.setAttribute("role", "status");
    fallback.textContent = "Gambar tidak dapat dimuat. Silakan periksa kembali data karyawan.";

    viewer.append(profileFrame, signatureFrame, fallback);
    app.replaceChildren(viewer);
    app.removeAttribute("aria-busy");

    let transitionStarted = false;
    let automaticTransition;

    const showFallback = (error) => {
      console.error(error);
      if (transitionStarted) return;
      transitionStarted = true;
      window.clearTimeout(automaticTransition);
      fallback.hidden = false;
      viewer.classList.add("has-error");
      viewer.removeAttribute("role");
      viewer.removeAttribute("tabindex");
      viewer.removeAttribute("aria-label");
    };

    const showSignature = () => {
      if (transitionStarted) return;
      transitionStarted = true;
      window.clearTimeout(automaticTransition);
      signatureFrame.setAttribute("aria-hidden", "false");
      if (profileImage) profileImage.setAttribute("aria-hidden", "true");
      viewer.classList.add("is-signature");
      viewer.removeAttribute("role");
      viewer.removeAttribute("tabindex");
      viewer.removeAttribute("aria-label");
    };

    const requiredImages = [profileImage, signatureImage, logo].filter(Boolean);
    const mediaReady = Promise.all(requiredImages.map(waitForImage));

    const requestSignature = () => {
      if (transitionStarted) return;
      window.clearTimeout(automaticTransition);
      mediaReady.then(showSignature).catch(showFallback);
    };

    viewer.addEventListener("click", requestSignature);
    viewer.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        requestSignature();
      }
    });

    mediaReady
      .then(() => {
        automaticTransition = window.setTimeout(requestSignature, HOLD_DURATION);
      })
      .catch(showFallback);
  };

  Promise.all([
    fetch(new URL("employees.json", rootUrl), { cache: "no-store" }).then((response) => {
      if (!response.ok) throw new Error("employees.json tidak dapat dimuat");
      return response.json();
    }),
    fetch(new URL("settings.json", rootUrl), { cache: "no-store" }).then((response) => {
      if (!response.ok) throw new Error("settings.json tidak dapat dimuat");
      return response.json();
    }),
  ])
    .then(([employees, settings]) => {
      if (!Object.prototype.hasOwnProperty.call(employees, slug)) {
        renderNotFound();
        return;
      }
      return renderProfile(employees[slug], settings);
    })
    .catch((error) => {
      console.error(error);
      app.innerHTML = `
        <section class="not-found">
          <h1>Profile Tidak Dapat Dimuat</h1>
          <p>Data profile sedang tidak tersedia. Silakan coba lagi.</p>
          <a class="back-link" href="../">Kembali</a>
        </section>
      `;
      app.removeAttribute("aria-busy");
    });
})();
