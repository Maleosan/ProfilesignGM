(() => {
  "use strict";

  const grid = document.getElementById("employeeGrid");
  const headerCompany = document.querySelector(".eyebrow");

  const createCard = (slug, employee) => {
    const card = document.createElement("article");
    card.className = "employee-card";

    const name = document.createElement("h3");
    name.textContent = employee.name;

    const position = document.createElement("p");
    position.textContent = employee.position;

    const link = document.createElement("a");
    link.className = "open-profile";
    link.href = `${encodeURIComponent(slug)}/`;
    link.textContent = "Open Profile";
    link.setAttribute("aria-label", `Buka profil ${employee.name}`);

    card.append(name, position, link);
    return card;
  };

  Promise.all([
    fetch("employees.json", { cache: "no-store" }).then((response) => {
      if (!response.ok) throw new Error("employees.json tidak dapat dimuat");
      return response.json();
    }),
    fetch("settings.json", { cache: "no-store" }).then((response) => {
      if (!response.ok) throw new Error("settings.json tidak dapat dimuat");
      return response.json();
    }),
  ])
    .then(([employees, settings]) => {
      headerCompany.textContent = settings.companyName;
      grid.replaceChildren(
        ...Object.entries(employees).map(([slug, employee]) => createCard(slug, employee))
      );
    })
    .catch((error) => {
      console.error(error);
      const message = document.createElement("p");
      message.className = "error-message";
      message.textContent = "Daftar karyawan tidak dapat dimuat. Silakan coba lagi.";
      grid.replaceChildren(message);
    });
})();
