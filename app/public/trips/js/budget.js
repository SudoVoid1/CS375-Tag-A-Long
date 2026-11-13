// Budget tab: totals, the current user's budget, and everyone's budgets.

const membersTable = document.getElementById("members-table");

function loadBudget() {
  // Needs the members (budgets), activities (costs) and travel plans (prices)
  Promise.all([
    fetch(`/api/trips/${tripId}/members`).then((response) => response.json()),
    fetch(`/api/trips/${tripId}/activities`).then((response) => response.json()),
    fetch(`/api/trips/${tripId}/travel`).then((response) => response.json()),
  ])
    .then(([members, activities, travelPlans]) => {
      membersTable.replaceChildren();
      let totalBudget = 0;
      members.forEach((member) => {
        totalBudget += Number(member.budget || 0);

        // Fill in "Your budget" with the current user's budget
        if (member.isme) {
          document.getElementById("my-budget").value = member.budget ?? "";
        }

        let row = document.createElement("tr");
        ["username", "budget"].forEach((field) => {
          let cell = document.createElement("td");
          if (field === "budget") {
            cell.textContent = formatMoney(member.budget);
          } else {
            cell.textContent = member.isme ? `${member.username} (you)` : member.username;
          }
          row.appendChild(cell);
        });
        membersTable.appendChild(row);
      });

      let totalSpent = 0;
      activities.forEach((activity) => (totalSpent += Number(activity.cost)));
      travelPlans.forEach((plan) => (totalSpent += Number(plan.price || 0)));

      document.getElementById("total-budget").textContent = formatMoney(totalBudget);
      document.getElementById("total-spent").textContent = formatMoney(totalSpent);
      document.getElementById("remaining").textContent = formatMoney(totalBudget - totalSpent);
    })
    .catch((error) => console.log(error));
}

function saveBudget() {
  const budgetField = document.getElementById("my-budget");
  const message = document.getElementById("budget-message");
  message.textContent = "";

  fetch(`/api/trips/${tripId}/budget`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ budget: budgetField.value }),
  })
    .then((response) => {
      if (response.ok) {
        message.textContent = "Saved";
        loadBudget();
      } else {
        response.json().then((body) => (message.textContent = body.error));
      }
    })
    .catch((error) => console.log(error));
}

document.getElementById("save-budget-button").addEventListener("click", saveBudget);
